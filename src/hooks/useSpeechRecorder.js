import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Combined live-transcribe + audio-record hook.
 *
 * Provides:
 *   start()          — request mic, start MediaRecorder + SpeechRecognition
 *   stop()           — stop both; resolves once the audio Blob URL is ready
 *   isRecording      — boolean
 *   transcript       — live updating transcript string
 *   wordTimestamps   — [{ word, time }] for syncing playback
 *   audioUrl         — Blob URL of the recorded audio (after stop)
 *   error            — string if mic access failed or speech recognition unsupported
 *   supported        — boolean: speech recognition supported
 *   reset()          — clears all state
 */
export default function useSpeechRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [wordTimestamps, setWordTimestamps] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);

  const recognitionRef     = useRef(null);
  const mediaRecorderRef   = useRef(null);
  const audioChunksRef     = useRef([]);
  const transcriptRef      = useRef('');
  const wordTimestampsRef  = useRef([]);
  const recordingStartRef  = useRef(0);
  const lastPhraseEndRef   = useRef(0);
  const streamRef          = useRef(null);

  const supported = typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const reset = useCallback(() => {
    setTranscript('');
    setWordTimestamps([]);
    setAudioUrl(null);
    setError(null);
    transcriptRef.current = '';
    wordTimestampsRef.current = [];
    lastPhraseEndRef.current = 0;
    audioChunksRef.current = [];
  }, []);

  const start = useCallback(async () => {
    reset();
    setError(null);

    // ── Speech recognition (best-effort; degrades gracefully) ───
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.onresult = (e) => {
        let t = '';
        for (let i = 0; i < e.results.length; i++) {
          t += e.results[i][0].transcript + ' ';
        }
        transcriptRef.current = t.trim();
        setTranscript(t.trim());

        const now = (performance.now() - recordingStartRef.current) / 1000;
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            const phraseWords = e.results[i][0].transcript.trim().split(/\s+/).filter(Boolean);
            const phraseStart = lastPhraseEndRef.current;
            const phraseDur = Math.max(now - phraseStart, 0.05);
            phraseWords.forEach((word, idx) => {
              wordTimestampsRef.current.push({
                word,
                time: phraseStart + (idx / phraseWords.length) * phraseDur,
              });
            });
            lastPhraseEndRef.current = now;
          }
        }
      };
      rec.onerror = () => { /* swallow; user may not have allowed mic */ };
      try { rec.start(); recognitionRef.current = rec; } catch { /* idempotent guard */ }
      recordingStartRef.current = performance.now();
    }

    // ── MediaRecorder ───────────────────────────────────────────
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4']
        .find((t) => MediaRecorder.isTypeSupported(t)) || '';
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };
      mr.start();
      setIsRecording(true);
    } catch (err) {
      setError(err?.message || 'Microphone access denied');
      // tear down speech recognition if mic also failed
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
        recognitionRef.current = null;
      }
      setIsRecording(false);
    }
  }, [reset]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    // Commit final transcript + timestamps after a tick (waiting on final results).
    setTimeout(() => {
      setTranscript(transcriptRef.current);
      setWordTimestamps([...wordTimestampsRef.current]);
    }, 200);
  }, []);

  // Cleanup on unmount.
  useEffect(() => () => {
    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch { /* ignore */ }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch { /* ignore */ }
    }
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
  }, []);

  return { start, stop, reset, isRecording, transcript, wordTimestamps, audioUrl, error, supported };
}

/* ─── Filler-word + pace helpers (pure) ──────────────────────────── */

// Longer phrases first so they're matched before their sub-tokens.
const FILLER_WORDS = [
  'you know', 'i mean', 'kind of', 'sort of',
  'um', 'uh', 'uhh', 'umm', 'hmm', 'hm', 'mhm',
  'like', 'basically', 'literally', 'right',
];

export function analyzeFillers(transcript) {
  if (!transcript) return { counts: {}, total: 0, fillerIndices: new Set() };

  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const clean = words.map((w) => w.toLowerCase().replace(/[.,!?;:'"()-]+/g, ''));
  const fillerIndices = new Set();
  const counts = {};

  const sorted = [...FILLER_WORDS].sort((a, b) => b.split(' ').length - a.split(' ').length);

  sorted.forEach((filler) => {
    const fw = filler.split(' ');
    if (fw.length === 1) {
      clean.forEach((w, i) => {
        if (w === filler && !fillerIndices.has(i)) {
          fillerIndices.add(i);
          counts[filler] = (counts[filler] || 0) + 1;
        }
      });
    } else {
      for (let i = 0; i <= clean.length - fw.length; i++) {
        if (fw.every((fw_w, j) => clean[i + j] === fw_w)
            && !fw.some((_, j) => fillerIndices.has(i + j))) {
          for (let j = 0; j < fw.length; j++) fillerIndices.add(i + j);
          counts[filler] = (counts[filler] || 0) + 1;
        }
      }
    }
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return { counts, total, fillerIndices };
}

export function wpmInfo(wpm) {
  if (wpm === 0)    return { label: '—',             tone: 'neutral' };
  if (wpm < 110)    return { label: 'Too Slow',      tone: 'warning' };
  if (wpm <= 130)   return { label: 'Good Pace',     tone: 'success' };
  if (wpm <= 160)   return { label: 'Ideal Pace',    tone: 'success' };
  if (wpm <= 180)   return { label: 'Slightly Fast', tone: 'warning' };
  return            { label: 'Too Fast',     tone: 'danger'  };
}
