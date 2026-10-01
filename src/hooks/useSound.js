import { useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';

/**
 * useSound — Web Audio API synthesised sound effects.
 *
 * Reads settings.soundEnabled from GameContext.
 * All sounds no-op if soundEnabled is false or AudioContext is unavailable.
 *
 * Sounds:
 *   playClick()       — button click
 *   playCorrect()     — correct answer arpeggio
 *   playWrong()       — wrong answer buzz
 *   playHint()        — hint reveal chime
 *   playLevelUp()     — level-up fanfare
 *   playMissionComplete() — mission complete fanfare
 *   playNavigation()  — scene navigation whoosh
 *   playXP()          — XP sparkle
 */
export default function useSound() {
  const { state } = useGame();
  const ctxRef = useRef(null);

  const isEnabled = state.settings?.soundEnabled !== false;

  const getCtx = useCallback(() => {
    if (!isEnabled) return null;
    if (ctxRef.current) return ctxRef.current;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    try {
      ctxRef.current = new AudioCtx();
    } catch (_) {
      return null;
    }
    return ctxRef.current;
  }, [isEnabled]);

  /** Schedule a single oscillator note. */
  const note = useCallback((ctx, freq, startTime, duration, type = 'sine', gainPeak = 0.22, detune = 0) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      if (detune) osc.detune.setValueAtTime(detune, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.01);
      gain.gain.setValueAtTime(gainPeak, startTime + duration * 0.65);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch (_) {}
  }, []);

  // ── Button click — short crisp tick ──────────────────────────────────────
  const playClick = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    note(ctx, 880, ctx.currentTime, 0.06, 'sine', 0.18);
    note(ctx, 1100, ctx.currentTime + 0.03, 0.05, 'sine', 0.12);
  }, [getCtx, note]);

  // ── Correct answer — ascending C major arpeggio ───────────────────────────
  const playCorrect = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      note(ctx, freq, now + i * 0.09, 0.18, 'triangle', 0.25);
    });
    note(ctx, 2093, now + 0.36, 0.35, 'sine', 0.1);
  }, [getCtx, note]);

  // ── Wrong answer — descending sawtooth buzz ───────────────────────────────
  const playWrong = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [300, 220, 160].forEach((freq, i) => {
      note(ctx, freq, now + i * 0.08, 0.12, 'sawtooth', 0.2);
    });
    note(ctx, 80, now, 0.3, 'square', 0.12);
  }, [getCtx, note]);

  // ── Hint — soft chime ─────────────────────────────────────────────────────
  const playHint = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    note(ctx, 622.25, now, 0.2, 'sine', 0.18);       // Eb5
    note(ctx, 830.61, now + 0.12, 0.25, 'sine', 0.15); // Ab5
    note(ctx, 987.77, now + 0.25, 0.3, 'sine', 0.12);  // B5
  }, [getCtx, note]);

  // ── XP earned — sparkle ───────────────────────────────────────────────────
  const playXP = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [1046.5, 1318.5, 1567.98].forEach((freq, i) => {
      note(ctx, freq, now + i * 0.055, 0.12, 'sine', 0.17, (Math.random() - 0.5) * 20);
    });
  }, [getCtx, note]);

  // ── Level up — triumphant fanfare ────────────────────────────────────────
  const playLevelUp = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Rapid ascending run then held chord
    [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5].forEach((freq, i) => {
      note(ctx, freq, now + i * 0.06, 0.12, 'triangle', 0.22);
    });
    // Final chord
    [523.25, 659.25, 783.99].forEach((freq) => {
      note(ctx, freq, now + 0.55, 0.7, 'triangle', 0.2);
    });
    note(ctx, 1046.5, now + 0.55, 0.8, 'sine', 0.15);
  }, [getCtx, note]);

  // ── Mission complete — full fanfare ──────────────────────────────────────
  const playMissionComplete = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Ascending run
    [392, 523.25, 659.25, 783.99].forEach((freq, i) => {
      note(ctx, freq, now + i * 0.1, 0.15, 'triangle', 0.25);
    });
    // Chord hits
    [[523.25, 659.25, 783.99], [587.33, 739.99, 880]].forEach((chord, ci) => {
      chord.forEach(freq => note(ctx, freq, now + 0.5 + ci * 0.35, 0.3, 'triangle', 0.22));
    });
    // Final high note
    note(ctx, 1046.5, now + 1.1, 0.9, 'sine', 0.2);
    note(ctx, 1318.5, now + 1.2, 0.7, 'sine', 0.12);
  }, [getCtx, note]);

  // ── Navigation whoosh ─────────────────────────────────────────────────────
  const playNavigation = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value = 0.7;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (_) {}
  }, [getCtx]);

  return {
    playClick,
    playCorrect,
    playWrong,
    playHint,
    playXP,
    playLevelUp,
    playMissionComplete,
    playNavigation,
    // Legacy aliases
    playSuccess: playCorrect,
    playError: playWrong,
    playBeep: playClick,
    playWhoosh: playNavigation,
  };
}
