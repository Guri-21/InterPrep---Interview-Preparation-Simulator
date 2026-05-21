import { useEffect } from 'react';

/**
 * Register a global keydown handler that fires on matching key combos.
 *
 * @param {string|string[]} keys      The single-character or named keys to match (case-insensitive).
 * @param {Function}        handler   Called with the KeyboardEvent.
 * @param {object}          [opts]
 * @param {boolean}         [opts.cmd]   require cmd/ctrl
 * @param {boolean}         [opts.shift] require shift
 * @param {boolean}         [opts.alt]   require alt
 * @param {boolean}         [opts.ignoreInputs] (default true) skip when focused in <input>/<textarea>
 * @param {boolean}         [opts.preventDefault] (default true)
 */
export default function useKeyShortcut(keys, handler, opts = {}) {
  const {
    cmd = false,
    shift = false,
    alt = false,
    ignoreInputs = true,
    preventDefault = true,
    enabled = true,
  } = opts;

  useEffect(() => {
    if (!enabled) return undefined;
    const arr = (Array.isArray(keys) ? keys : [keys]).map((k) => k.toLowerCase());

    const onKey = (e) => {
      if (ignoreInputs) {
        const target = e.target;
        if (target && (target.isContentEditable
            || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
      }
      const key = e.key.toLowerCase() === ' ' ? 'space' : e.key.toLowerCase();
      if (!arr.includes(key)) return;

      const metaOk = cmd ? (e.metaKey || e.ctrlKey) : !(e.metaKey || e.ctrlKey);
      const shiftOk = shift ? e.shiftKey : !e.shiftKey;
      const altOk = alt ? e.altKey : !e.altKey;
      if (!metaOk || !shiftOk || !altOk) return;

      if (preventDefault) e.preventDefault();
      handler(e);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [keys, handler, cmd, shift, alt, ignoreInputs, preventDefault, enabled]);
}
