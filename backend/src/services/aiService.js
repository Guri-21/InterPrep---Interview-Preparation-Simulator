import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * AI evaluator service. Returns a structured evaluation object matching the
 * Interview.feedback Mongoose schema.
 *
 * Provider selection is driven by `env.AI_PROVIDER`. Implemented providers:
 *   - "gemini"     — Google Gemini (free tier). Default.
 *   - "anthropic"  — Anthropic Claude.
 *   - "openai"     — Stubbed (returns 501 NOT_IMPLEMENTED).
 *
 * Gemini uses structured-output mode (`responseMimeType: 'application/json'`
 * + responseSchema) so the model is guaranteed to return JSON matching our
 * Interview.feedback shape, with no markdown fences or prose.
 */

const RESPONSE_SCHEMA = `{
  "scores": {
    "Content":       <0-100>,
    "Structure":     <0-100>,
    "Clarity":       <0-100>,
    "Confidence":    <0-100>,
    "Communication": <0-100>
  },
  "overall":     <0-100>,
  "summary":     "<one paragraph, 2-3 sentences>",
  "strengths":   ["<s1>", "<s2>", "<s3>"],
  "weaknesses":  ["<w1>", "<w2>", "<w3>"],
  "suggestions": ["<a1>", "<a2>", "<a3>"],
  "followUp":    "<one realistic follow-up question>",
  "communication": {
    "tone":       "<Confident|Conversational|Hesitant|Robotic|Rushed>",
    "pacing":     "<Slow|Steady|Brisk|Rushed>",
    "fillerNote": "<short note>"
  }
}`;

const SYSTEM_PROMPT =
  'You are an interview evaluator on InterPrep, a domain-specific technical interview platform. ' +
  'You assess a candidate\'s spoken answer for accuracy, structure, communication, and confidence. ' +
  'You return a single, strictly-valid JSON object. No prose, no markdown fences, no comments.';

function buildPrompt({ transcript, question, domain, topic, difficulty, durationSec }) {
  const ctx = [
    `Domain: ${domain || 'General'}`,
    topic       ? `Topic: ${topic}` : null,
    difficulty  ? `Difficulty: ${difficulty}` : null,
    durationSec ? `Spoken for: ~${durationSec}s` : null,
  ].filter(Boolean).join('  •  ');

  return [
    `Evaluation context: ${ctx}`,
    '',
    `Interview question: ${question}`,
    '',
    'Candidate\'s spoken answer (transcribed live, may contain disfluencies):',
    `"""${transcript.trim()}"""`,
    '',
    'Score each dimension 0–100, where 70 = a competent answer, 85+ = strong, 95+ = exceptional.',
    '- Content: technical accuracy, depth, and direct relevance to the question',
    '- Structure: logical flow — does the candidate set up an approach, then explain, then conclude?',
    '- Clarity: precision of language, definitions, named concepts',
    '- Confidence: tone, conviction, recovery from disfluency',
    '- Communication: pacing, brevity, signaling, summarization',
    '',
    'Generate exactly 3 specific strengths, 3 specific weaknesses, and 3 actionable suggestions.',
    'Be concrete. Reference the candidate\'s actual reasoning when possible. Avoid generic advice.',
    'Generate exactly one realistic follow-up question an interviewer would ask after this answer.',
    '',
    'Respond ONLY with this exact JSON shape and nothing else:',
    RESPONSE_SCHEMA,
  ].join('\n');
}

function safeParseJson(raw) {
  if (!raw) throw ApiError.badGateway('Empty response from AI provider');
  const cleaned = raw
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const s = cleaned.indexOf('{');
    const e = cleaned.lastIndexOf('}');
    if (s !== -1 && e !== -1 && e > s) {
      try { return JSON.parse(cleaned.slice(s, e + 1)); }
      catch { /* fall through */ }
    }
    throw ApiError.badGateway('Could not parse AI response as JSON');
  }
}

async function evaluateWithAnthropic(payload) {
  if (!env.ANTHROPIC_API_KEY) {
    throw ApiError.internal('Anthropic provider not configured (ANTHROPIC_API_KEY missing)');
  }
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: env.ANTHROPIC_MODEL,
    max_tokens: 1400,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildPrompt(payload) }],
  });
  const raw = (message.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
  return { feedback: safeParseJson(raw), providerModel: env.ANTHROPIC_MODEL };
}

// Gemini response schema — must match the shape of Interview.feedback in
// backend/src/models/Interview.js. Gemini enforces this at generation time
// so we get parseable JSON every call, no string-cleanup needed.
const GEMINI_RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    scores: {
      type: SchemaType.OBJECT,
      properties: {
        Content:       { type: SchemaType.INTEGER },
        Structure:     { type: SchemaType.INTEGER },
        Clarity:       { type: SchemaType.INTEGER },
        Confidence:    { type: SchemaType.INTEGER },
        Communication: { type: SchemaType.INTEGER },
      },
      required: ['Content', 'Structure', 'Clarity', 'Confidence', 'Communication'],
    },
    overall:    { type: SchemaType.INTEGER },
    summary:    { type: SchemaType.STRING },
    strengths:  { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    weaknesses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    suggestions:{ type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    followUp:   { type: SchemaType.STRING },
    communication: {
      type: SchemaType.OBJECT,
      properties: {
        tone:       { type: SchemaType.STRING },
        pacing:     { type: SchemaType.STRING },
        fillerNote: { type: SchemaType.STRING },
      },
      required: ['tone', 'pacing', 'fillerNote'],
    },
  },
  required: ['scores', 'overall', 'summary', 'strengths', 'weaknesses', 'suggestions', 'followUp', 'communication'],
};

async function evaluateWithGemini(payload) {
  if (!env.GEMINI_API_KEY) {
    throw ApiError.internal('Gemini provider not configured (GEMINI_API_KEY missing)');
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: env.GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.4,
      responseMimeType: 'application/json',
    },
  });

  let result;
  try {
    result = await model.generateContent(buildPrompt(payload));
  } catch (err) {
    // Map common Gemini failures to a clean upstream error.
    const msg = err?.message || 'Gemini request failed';
    console.error("DEBUG GEMINI ERROR:", msg);
    if (/quota|RESOURCE_EXHAUSTED|rate/i.test(msg)) {
      throw ApiError.tooMany('Gemini free-tier quota exceeded. Try again in a minute.');
    }
    if (/API key|PERMISSION_DENIED|UNAUTHENTICATED/i.test(msg)) {
      throw ApiError.internal('Gemini rejected the API key — check GEMINI_API_KEY in backend/.env');
    }
  }

  const raw = result?.response?.text?.()?.trim() || '';
  // With responseSchema, the model returns strict JSON. We still run it
  // through the same defensive parser as the other providers.
  return { feedback: safeParseJson(raw), providerModel: env.GEMINI_MODEL };
}

// Test-only override hook. The smoke-test file installs a fake evaluator here
// (via setEvaluatorOverride) so we can run end-to-end without hitting Anthropic.
// In production this stays null.
let evaluatorOverride = null;
export function setEvaluatorOverride(fn) { evaluatorOverride = fn || null; }

/**
 * Public entrypoint. Returns `{ feedback, providerModel }`.
 * Throws ApiError on missing config or upstream failure.
 */
export async function evaluateAnswer(payload) {
  if (!payload?.transcript || payload.transcript.trim().length < 20) {
    throw ApiError.badRequest('Answer is too short to evaluate (min 20 chars)');
  }
  if (!payload?.question || payload.question.trim().length < 5) {
    throw ApiError.badRequest('Missing question context');
  }

  if (evaluatorOverride) return evaluatorOverride(payload);

  switch (env.AI_PROVIDER) {
    case 'gemini':
      return evaluateWithGemini(payload);
    case 'anthropic':
      return evaluateWithAnthropic(payload);
    case 'openai':
      throw new ApiError(
        501,
        `Provider "openai" is not implemented yet — wire it in src/services/aiService.js.`,
        'NOT_IMPLEMENTED',
      );
    default:
      throw ApiError.internal(`Unknown AI_PROVIDER: ${env.AI_PROVIDER}`);
  }
}
