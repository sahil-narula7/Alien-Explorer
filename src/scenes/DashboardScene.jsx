import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame, SCENES, CREW_IDS } from '../context/GameContext';
import useSound from '../hooks/useSound';

// ── CSS keyframes ─────────────────────────────────────────────────────────────
const CSS_KEYFRAMES = `
@keyframes db-gridScroll {
  0%   { background-position: 0 0; }
  100% { background-position: 40px 40px; }
}
@keyframes db-statusBlink {
  0%,49% { opacity: 1; }
  50%,100% { opacity: 0.3; }
}
@keyframes db-circuitTrace {
  0%   { stroke-dashoffset: 300; opacity: 0; }
  15%  { opacity: 0.7; }
  100% { stroke-dashoffset: 0; opacity: 0.35; }
}
@keyframes db-xpShimmer {
  0%   { left: -60%; }
  100% { left: 130%; }
}
@keyframes db-barPulse {
  0%,100% { box-shadow: 0 0 6px rgba(0,255,204,0.4); }
  50%     { box-shadow: 0 0 16px rgba(0,255,204,0.8); }
}
@keyframes db-cardIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes db-titleGlow {
  0%,100% { text-shadow: 0 0 10px rgba(0,255,204,0.5), 0 0 20px rgba(0,255,204,0.25); }
  50%     { text-shadow: 0 0 18px rgba(0,255,204,0.9), 0 0 36px rgba(0,255,204,0.5); }
}
@keyframes db-exploreBtn {
  0%,100% { box-shadow: 0 0 20px rgba(0,255,204,0.4), 0 0 50px rgba(0,255,204,0.15); }
  50%     { box-shadow: 0 0 36px rgba(0,255,204,0.7), 0 0 80px rgba(0,255,204,0.3); }
}
@keyframes db-exploreScan {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@keyframes db-avatarFloat {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-6px); }
}
@keyframes db-cornerBlink {
  0%,49%  { opacity: 1; }
  50%,100% { opacity: 0.2; }
}
@keyframes db-logoFlicker {
  0%,93%,100% { opacity: 1; }
  95%         { opacity: 0.7; }
  97%         { opacity: 0.9; }
}

/* ── Responsive dashboard layout ─────────────────────────────────────────── */

/*
 * Rules:
 *  1. No panel uses position:absolute/fixed for column placement.
 *  2. Center column is minmax(0,1fr) — the 0 minimum prevents overflow.
 *  3. Every grid child has min-width:0 so content cannot burst its track.
 *  4. The scroll wrapper (db-scroll) is the only element that scrolls.
 */

/* Scroll container — fills the flex column, clips nothing horizontally */
.db-scroll {
  flex: 1 1 0;
  overflow-x: hidden;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
}

/* Centering wrapper inside the scroll area */
.db-layout {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* ≥1200px: Captain | Mission/Stats | Performance (3 columns) */
.db-main-grid {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 240px;
  grid-template-areas: "left center right";
  grid-template-rows: auto;
  gap: 16px;
  padding: 20px 24px;
  box-sizing: border-box;
  width: 100%;
  align-items: start;
}

/* Grid area + overflow guard on every child */
.db-left-panel {
  grid-area: left;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}
.db-center-panel {
  grid-area: center;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}
.db-right-panel {
  grid-area: right;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

/* 768px–1199px: Captain + Performance on row 1, Mission spans row 2 */
@media (max-width: 1199px) {
  .db-main-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-areas:
      "left  right"
      "center center";
    gap: 12px;
    padding: 16px;
  }
}

/* <768px: single-column stack — Captain → Performance → Mission */
@media (max-width: 767px) {
  .db-main-grid {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "left"
      "right"
      "center";
    gap: 12px;
    padding: 12px;
  }
}

/* ≤480px: tighter spacing */
@media (max-width: 480px) {
  .db-main-grid {
    gap: 8px;
    padding: 8px;
  }
}
`;

// ── Crew meta for the selector ────────────────────────────────────────────────
const CREW_META = [
  { id: 'sam',   name: 'Sam',        role: 'Mathematics',     color: '#00ffcc' },
  { id: 'vela',  name: 'Vela Zorn',  role: 'Science',         color: '#ff88cc' },
  { id: 'krix7', name: 'Krix-7',     role: 'Logic',           color: '#4488ff' },
  { id: 'luma',  name: 'Luma',       role: 'Reasoning',       color: '#ffcc44' },
  { id: 'orion', name: 'Orion Vale', role: 'Applied Chall.',  color: '#ff6600' },
];

// ── Astronaut avatar SVG ──────────────────────────────────────────────────────
function AstronautAvatar() {
  return (
    <svg width="90" height="110" viewBox="0 0 90 110" aria-label="Captain avatar"
      style={{ animation: 'db-avatarFloat 3.5s ease-in-out infinite', display: 'block', margin: '0 auto' }}>
      <defs>
        <radialGradient id="db-helmetGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#224455" /><stop offset="100%" stopColor="#0a1a22" />
        </radialGradient>
        <radialGradient id="db-visorGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="rgba(0,255,204,0.35)" /><stop offset="100%" stopColor="rgba(0,100,120,0.15)" />
        </radialGradient>
        <radialGradient id="db-suitGrad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#1a3a4a" /><stop offset="100%" stopColor="#0a1a22" />
        </radialGradient>
      </defs>
      <ellipse cx="45" cy="90" rx="30" ry="6" fill="rgba(0,255,204,0.08)" />
      <ellipse cx="45" cy="34" rx="26" ry="28" fill="url(#db-helmetGrad)" stroke="#00ffcc" strokeWidth="1.5" strokeOpacity="0.6" />
      <ellipse cx="44" cy="32" rx="17" ry="14" fill="url(#db-visorGrad)" stroke="rgba(0,255,204,0.4)" strokeWidth="1" />
      <ellipse cx="38" cy="26" rx="5" ry="4" fill="rgba(255,255,255,0.12)" />
      <ellipse cx="45" cy="58" rx="22" ry="4" fill="none" stroke="#00ffcc" strokeWidth="1.5" strokeOpacity="0.5" />
      <rect x="22" y="60" width="46" height="38" rx="10" fill="url(#db-suitGrad)" stroke="rgba(0,255,204,0.3)" strokeWidth="1" />
      <rect x="34" y="66" width="22" height="14" rx="3" fill="rgba(0,255,204,0.06)" stroke="rgba(0,255,204,0.3)" strokeWidth="0.8" />
      <circle cx="40" cy="73" r="2.5" fill="#00ffcc" opacity="0.7" />
      <circle cx="50" cy="73" r="2.5" fill="rgba(255,200,0,0.7)" />
      <rect x="5"  y="62" width="18" height="28" rx="8" fill="url(#db-suitGrad)" stroke="rgba(0,255,204,0.25)" strokeWidth="1" />
      <rect x="67" y="62" width="18" height="28" rx="8" fill="url(#db-suitGrad)" stroke="rgba(0,255,204,0.25)" strokeWidth="1" />
      <ellipse cx="14" cy="92" rx="9" ry="7" fill="#0d2530" stroke="rgba(0,255,204,0.3)" strokeWidth="0.8" />
      <ellipse cx="76" cy="92" rx="9" ry="7" fill="#0d2530" stroke="rgba(0,255,204,0.3)" strokeWidth="0.8" />
      <rect x="28" y="96" width="14" height="10" rx="4" fill="#0d2530" stroke="rgba(0,255,204,0.3)" strokeWidth="0.8" />
      <rect x="48" y="96" width="14" height="10" rx="4" fill="#0d2530" stroke="rgba(0,255,204,0.3)" strokeWidth="0.8" />
      <line x1="62" y1="10" x2="62" y2="22" stroke="#00ffcc" strokeWidth="1.2" strokeOpacity="0.6" />
      <circle cx="62" cy="8" r="2.5" fill="#00ffcc" opacity="0.8" />
    </svg>
  );
}

// ── XP Bar ────────────────────────────────────────────────────────────────────
function XPBar({ xp, xpToNext }) {
  const pct = Math.min(100, Math.round((xp / xpToNext) * 100));
  return (
    <div style={{ width: '100%' }}>
      <div style={{ height: 10, background: 'rgba(0,255,204,0.08)', border: '1px solid rgba(0,255,204,0.25)', borderRadius: 5, overflow: 'hidden', position: 'relative' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
          style={{ height: '100%', background: 'linear-gradient(90deg, #005533, #00ffcc)', borderRadius: 5, position: 'relative', overflow: 'hidden' }}>
          <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, width: '60%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)', animation: 'db-xpShimmer 2s linear infinite', pointerEvents: 'none' }} />
        </motion.div>
      </div>
      <div style={{ marginTop: 4, fontFamily: 'monospace', fontSize: 10, color: 'rgba(0,255,204,0.5)', letterSpacing: '0.1em', textAlign: 'right' }}>
        XP: {xp}/{xpToNext}
      </div>
    </div>
  );
}

// ── Skill bar ─────────────────────────────────────────────────────────────────
function SkillBar({ label, value, color = '#00ffcc', delay = 0 }) {
  const pct = Math.min(100, value);
  const hasValue = pct > 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontFamily: 'monospace', fontSize: 11, color: 'rgba(0,255,204,0.7)', letterSpacing: '0.12em' }}>
        <span>{label}</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div style={{ height: 8, background: 'rgba(0,255,204,0.06)', border: '1px solid rgba(0,255,204,0.2)', borderRadius: 4, overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.0, delay: 0.6 + delay, ease: 'easeOut' }}
          style={{ height: '100%', background: `linear-gradient(90deg, rgba(0,80,60,0.8), ${color})`, borderRadius: 4, animation: hasValue ? 'db-barPulse 2s ease-in-out infinite' : 'none' }} />
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 + delay }}
      style={{ background: 'rgba(0,255,204,0.04)', border: '1px solid rgba(0,255,204,0.18)', borderRadius: 4, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(0,255,204,0.5), transparent)' }} />
      <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(0,255,204,0.45)', letterSpacing: '0.18em', marginBottom: 6, textTransform: 'uppercase' }}>
        {icon && <span style={{ marginRight: 5 }}>{icon}</span>}{label}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#e0ffe8', letterSpacing: '0.05em' }}>{value}</div>
    </motion.div>
  );
}

function CornerLight({ color = '#00ffcc', blinkDur = '1.2s', delay = '0s' }) {
  return (
    <div aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, animation: `db-cornerBlink ${blinkDur} ${delay} step-start infinite` }} />
  );
}

// ── Panel wrapper with corner accents ─────────────────────────────────────────
function Panel({ children, style, className, motionProps }) {
  const base = {
    background: 'rgba(0,10,20,0.85)',
    border: '1px solid rgba(0,255,204,0.2)',
    borderRadius: 4,
    padding: '24px 20px',
    position: 'relative',
    overflow: 'hidden',
    // Critical for grid items: prevents content from forcing the item
    // wider than the grid track it occupies.
    minWidth: 0,
    boxSizing: 'border-box',
    // width:100% ensures the panel fills its grid area when grid-area is used
    width: '100%',
  };
  return (
    <motion.aside className={className} style={{ ...base, ...style }} {...motionProps}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 16, height: 16, borderTop: '2px solid rgba(0,255,204,0.7)', borderLeft: '2px solid rgba(0,255,204,0.7)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderTop: '2px solid rgba(0,255,204,0.7)', borderRight: '2px solid rgba(0,255,204,0.7)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 16, height: 16, borderBottom: '2px solid rgba(0,255,204,0.7)', borderLeft: '2px solid rgba(0,255,204,0.7)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderBottom: '2px solid rgba(0,255,204,0.7)', borderRight: '2px solid rgba(0,255,204,0.7)' }} aria-hidden="true" />
      {children}
    </motion.aside>
  );
}

// ── Crew selector row ─────────────────────────────────────────────────────────
function CrewSelector({ activeCrew, onSelect }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(0,255,204,0.45)', letterSpacing: '0.22em', marginBottom: 8 }}>
        SELECT CREW MISSION
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {CREW_META.map(c => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            style={{
              padding: '5px 10px',
              background: activeCrew === c.id ? `${c.color}22` : 'rgba(0,255,204,0.04)',
              border: `1px solid ${activeCrew === c.id ? c.color : 'rgba(0,255,204,0.2)'}`,
              borderRadius: 4,
              color: activeCrew === c.id ? c.color : 'rgba(0,255,204,0.5)',
              fontFamily: 'monospace',
              fontSize: 10,
              fontWeight: activeCrew === c.id ? 700 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.08em',
              boxShadow: activeCrew === c.id ? `0 0 10px ${c.color}44` : 'none',
            }}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DashboardScene() {
  const { state, dispatch } = useGame();
  const { captain, crewProgress, activeCrew, settings } = state;
  const sound = useSound();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  function handleExplore() {
    sound.playClick();
    dispatch({ type: 'SET_SCENE', payload: SCENES.PLANET_EXPLORE });
  }

  function handleCrewSelect(crewId) {
    sound.playClick();
    dispatch({ type: 'SET_ACTIVE_CREW', payload: crewId });
  }

  function handleSoundToggle() {
    dispatch({ type: 'TOGGLE_SOUND' });
  }

  function handleLogoutRequest() {
    sound.playClick();
    setShowLogoutConfirm(true);
  }

  function handleLogoutConfirm() {
    sound.playNavigation();
    setShowLogoutConfirm(false);
    dispatch({ type: 'LOGOUT' });
  }

  function handleLogoutCancel() {
    setShowLogoutConfirm(false);
  }

  const activeCrewMeta = CREW_META.find(c => c.id === activeCrew) || CREW_META[0];
  const activeCrewProgress = crewProgress?.[activeCrew] || { missionsCompleted: 0, totalXP: 0, firstAttemptCorrect: 0, totalAttempted: 0 };
  const crewAccuracy = activeCrewProgress.totalAttempted > 0
    ? Math.round((activeCrewProgress.firstAttemptCorrect / activeCrewProgress.totalAttempted) * 100)
    : 0;

  const soundEnabled = settings?.soundEnabled !== false;

  return (
    <>
      <style>{CSS_KEYFRAMES}</style>

      <div style={{
        /* Fills the position:absolute inset:0 scene wrapper from App.jsx.
           Scrolls vertically within that box — no fixed/absolute positioning
           that would escape the grid flow. */
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#00060f',
        overflowX: 'hidden',
        overflowY: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}>
        {/* Grid bg — absolute within the relative wrapper */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(0,255,204,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,204,0.04) 1px, transparent 1px)`, backgroundSize: '40px 40px', animation: 'db-gridScroll 8s linear infinite', pointerEvents: 'none', zIndex: 0 }} />
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,4,10,0.75) 100%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* Circuit traces — sticky to viewport corners via fixed positioning */}
        <svg aria-hidden="true" width="260" height="160" style={{ position: 'fixed', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }} viewBox="0 0 260 160">
          <path d="M0,10 H80 V50 H160 V10 H220" fill="none" stroke="#00ffcc" strokeWidth="1" strokeDasharray="300" style={{ animation: 'db-circuitTrace 8s 0s linear infinite' }} />
          <circle cx="80" cy="50" r="3" fill="#00ffcc" opacity="0.55" />
        </svg>
        <svg aria-hidden="true" width="260" height="160" style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 1, pointerEvents: 'none', transform: 'rotate(180deg)' }} viewBox="0 0 260 160">
          <path d="M0,10 H80 V50 H160 V10 H220" fill="none" stroke="#00ffcc" strokeWidth="1" strokeDasharray="300" style={{ animation: 'db-circuitTrace 8s 4s linear infinite' }} />
        </svg>

        {/* Top bar */}
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', borderBottom: '1px solid rgba(0,255,204,0.18)', background: 'rgba(0,6,14,0.9)', backdropFilter: 'blur(8px)', flexShrink: 0, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src="/favicon.png"
              alt="Alien Explorer logo"
              width="40"
              height="40"
              style={{ borderRadius: '50%', display: 'block', flexShrink: 0 }}
            />
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 900, color: '#00ffcc', letterSpacing: '0.25em', animation: 'db-titleGlow 3s ease-in-out infinite, db-logoFlicker 7s linear infinite' }}>
                ALIEN EXPLORER
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(0,255,204,0.45)', letterSpacing: '0.2em', marginTop: 1 }}>
                MISSION CONTROL SYSTEM v4.7
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 10px #00ff88', animation: 'db-statusBlink 1.8s step-start infinite' }} />
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#00ff88', letterSpacing: '0.18em', fontWeight: 700 }}>
                ODYSSEY STATUS: ACTIVE
              </span>
            </div>
            {/* Sound toggle */}
            <button
              onClick={handleSoundToggle}
              title={soundEnabled ? 'Sound ON — click to mute' : 'Sound OFF — click to enable'}
              style={{ background: soundEnabled ? 'rgba(0,255,204,0.1)' : 'rgba(100,100,120,0.15)', border: `1px solid ${soundEnabled ? 'rgba(0,255,204,0.5)' : 'rgba(150,150,180,0.3)'}`, borderRadius: 6, padding: '4px 10px', color: soundEnabled ? '#00ffcc' : '#888', fontFamily: 'monospace', fontSize: 13, cursor: 'pointer', letterSpacing: '0.08em', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
              {soundEnabled ? '🔊' : '🔇'}
              <span style={{ fontSize: 10 }}>{soundEnabled ? 'ON' : 'OFF'}</span>
            </button>
            {/* Log out */}
            <button
              onClick={handleLogoutRequest}
              title="Log out — return to name entry"
              style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.35)', borderRadius: 6, padding: '4px 10px', color: 'rgba(255,100,100,0.9)', fontFamily: 'monospace', fontSize: 10, cursor: 'pointer', letterSpacing: '0.12em', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5 }}>
              ⏏ LOG OUT
            </button>
            <div style={{ display: 'flex', gap: 6 }}>
              <CornerLight color="#00ffcc" blinkDur="1.1s" delay="0s" />
              <CornerLight color="#ffd700" blinkDur="1.6s" delay="0.4s" />
              <CornerLight color="#ff4488" blinkDur="2.2s" delay="0.9s" />
            </div>
          </div>
        </motion.header>

        {/* ── Main 3-column responsive grid ─────────────────────────────── */}
        <div className="db-scroll">
        <div className="db-layout">
        <div className="db-main-grid">

          {/* ── LEFT: Captain profile ─────────────────────────────────────── */}
          <Panel
            className="db-left-panel"
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            motionProps={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5, delay: 0.1 } }}
          >
            <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(0,255,204,0.45)', letterSpacing: '0.22em', borderBottom: '1px solid rgba(0,255,204,0.12)', paddingBottom: 8 }}>
              CREW MANIFEST // COMMANDER
            </div>
            <AstronautAvatar />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(0,255,204,0.5)', letterSpacing: '0.2em', marginBottom: 4 }}>CAPTAIN</div>
              <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 900, color: '#ffd700', letterSpacing: '0.12em', textShadow: '0 0 12px rgba(255,215,0,0.6)' }}>
                {captain.name ? captain.name.toUpperCase() : '???'}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.35)', borderRadius: 20, fontFamily: 'monospace', fontSize: 12, color: '#ffd700', fontWeight: 700, letterSpacing: '0.12em' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><polygon points="6,0 7.5,4.5 12,4.5 8.5,7 10,12 6,9 2,12 3.5,7 0,4.5 4.5,4.5" fill="#ffd700" /></svg>
                LEVEL {captain.level}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(0,255,204,0.5)', letterSpacing: '0.15em', marginBottom: 6 }}>EXPERIENCE</div>
              <XPBar xp={captain.xp} xpToNext={captain.xpToNext} />
            </div>
            <div style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: 9, color: 'rgba(0,255,204,0.3)', letterSpacing: '0.18em', borderTop: '1px solid rgba(0,255,204,0.1)', paddingTop: 10 }}>
              ODYSSEY COMMAND RANK A-1
            </div>
          </Panel>

          {/* ── CENTER: Stats + crew selector + explore button ─────────────── */}
          <div className="db-center-panel" style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0, boxSizing: 'border-box', width: '100%' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
              style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(0,255,204,0.4)', letterSpacing: '0.25em', borderBottom: '1px solid rgba(0,255,204,0.12)', paddingBottom: 8 }}>
              MISSION STATUS // PLANET OF RUIN // SECTOR 7-GAMMA
            </motion.div>

            {/* Stat grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <StatCard label="CURRENT PLANET"    value={captain.currentPlanet}                   icon="🪐" delay={0}   />
              <StatCard label="MISSIONS COMPLETE" value={`${captain.missionProgress} COMPLETED`}  icon="📡" delay={0.1} />
              <StatCard label="CREW STATUS"       value="ALL SYSTEMS GO"                          icon="👥" delay={0.2} />
              <StatCard label="ACCURACY (OVERALL)"
                value={captain.totalQuestionsAttempted > 0
                  ? `${Math.round((captain.firstAttemptCorrect / captain.totalQuestionsAttempted) * 100)}%`
                  : 'N/A'}
                icon="🎯" delay={0.3}
              />
            </div>

            {/* Crew selector */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.45 }}
              style={{ background: 'rgba(0,10,20,0.85)', border: '1px solid rgba(0,255,204,0.15)', borderRadius: 4, padding: '14px 18px' }}>
              <CrewSelector activeCrew={activeCrew} onSelect={handleCrewSelect} />
              {/* Active crew stats */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                {[
                  { label: 'MISSIONS', value: activeCrewProgress.missionsCompleted },
                  { label: 'TOTAL XP', value: activeCrewProgress.totalXP },
                  { label: 'ACCURACY', value: `${crewAccuracy}%` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ flex: 1, minWidth: 60, background: `${activeCrewMeta.color}0a`, border: `1px solid ${activeCrewMeta.color}33`, borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 900, color: activeCrewMeta.color }}>{value}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 8, color: `${activeCrewMeta.color}88`, marginTop: 2, letterSpacing: '0.1em' }}>{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Objective bar */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.55 }}
              style={{ background: 'rgba(0,10,20,0.85)', border: '1px solid rgba(0,255,204,0.15)', borderRadius: 4, padding: '14px 18px', fontFamily: 'monospace', fontSize: 11, color: 'rgba(0,255,204,0.4)', letterSpacing: '0.1em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span>NEXT OBJECTIVE:</span>
              <span style={{ color: 'rgba(0,255,204,0.7)', fontWeight: 700 }}>
                EXPLORE PLANET OF RUIN — {activeCrewMeta.name.toUpperCase()} MISSION AVAILABLE
              </span>
              <div style={{ display: 'flex', gap: 5 }}>
                <CornerLight color="#00ffcc" blinkDur="0.9s" delay="0s" />
                <CornerLight color="#ffd700" blinkDur="1.4s" delay="0.3s" />
              </div>
            </motion.div>

            {/* Explore button */}
            <motion.button onClick={handleExplore} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ position: 'relative', overflow: 'hidden', padding: '22px 32px', background: 'rgba(0,255,204,0.07)', border: '1px solid rgba(0,255,204,0.6)', borderRadius: 4, color: '#00ffcc', fontFamily: 'monospace', fontSize: 'clamp(14px, 2vw, 18px)', fontWeight: 900, letterSpacing: '0.28em', cursor: 'pointer', animation: 'db-exploreBtn 2s ease-in-out infinite', textTransform: 'uppercase' }}>
              <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 2, background: 'linear-gradient(90deg, transparent, #00ffcc, transparent)' }} />
              <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 2, background: 'linear-gradient(90deg, transparent, #00ffcc, transparent)' }} />
              <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '45%', background: 'linear-gradient(90deg, transparent, rgba(0,255,204,0.12), transparent)', animation: 'db-exploreScan 2.2s linear infinite', pointerEvents: 'none' }} />
              EXPLORE PLANET OF RUIN
            </motion.button>
          </div>

          {/* ── RIGHT: Skills ─────────────────────────────────────────────── */}
          <Panel
            className="db-right-panel"
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            motionProps={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5, delay: 0.15 } }}
          >
            <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(0,255,204,0.45)', letterSpacing: '0.22em', borderBottom: '1px solid rgba(0,255,204,0.12)', paddingBottom: 8, marginBottom: 8 }}>
              CAPTAIN SKILLS
            </div>
            <SkillBar label="MATHEMATICS" value={captain.skills.math}      color="#00ffcc" delay={0}    />
            <SkillBar label="LOGIC"       value={captain.skills.logic}     color="#4488ff" delay={0.15} />
            <SkillBar label="REASONING"   value={captain.skills.reasoning} color="#ff88aa" delay={0.3}  />
            <div style={{ borderTop: '1px solid rgba(0,255,204,0.1)', paddingTop: 12, marginTop: 4 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(0,255,204,0.35)', letterSpacing: '0.18em', marginBottom: 8 }}>
                OVERALL PERFORMANCE
              </div>
              {(() => {
                const avg = Math.round((captain.skills.math + captain.skills.logic + captain.skills.reasoning) / 3);
                return (
                  <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 900, color: avg > 0 ? '#ffd700' : 'rgba(255,215,0,0.2)', textShadow: avg > 0 ? '0 0 16px rgba(255,215,0,0.6)' : 'none', letterSpacing: '0.1em', textAlign: 'center' }}>
                    {avg}%
                  </div>
                );
              })()}
            </div>
            <div style={{ borderTop: '1px solid rgba(0,255,204,0.1)', paddingTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
              {['0.3s', '0.7s', '1.1s', '1.5s', '1.9s'].map((d, i) => (
                <div key={i} aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: i < 3 ? '#00ffcc' : 'rgba(0,255,204,0.2)', boxShadow: i < 3 ? '0 0 6px #00ffcc' : 'none', animation: `db-cornerBlink 1.5s ${d} step-start infinite` }} />
              ))}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 8, color: 'rgba(0,255,204,0.25)', letterSpacing: '0.15em', textAlign: 'center', marginTop: 4 }}>
              NEURAL LINK ACTIVE
            </div>
          </Panel>
        </div>
        </div>
        </div>{/* end db-scroll/db-layout */}

        {/* Footer */}
        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.7 }}
          style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 28px', borderTop: '1px solid rgba(0,255,204,0.12)', background: 'rgba(0,4,10,0.9)', flexShrink: 0, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(0,255,204,0.3)', letterSpacing: '0.18em' }}>
            ODYSSEY-7 &nbsp;//&nbsp; HULL INTEGRITY: 100% &nbsp;//&nbsp; SHIELDS: NOMINAL
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {['0s', '0.5s', '1s'].map((d, i) => <CornerLight key={i} color="#00ffcc" blinkDur="1.3s" delay={d} />)}
          </div>
          <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(0,255,204,0.3)', letterSpacing: '0.18em' }}>
            SECTOR 7-GAMMA &nbsp;//&nbsp; STARDATE 2847.184
          </span>
        </motion.footer>
      </div>

      {/* ── Logout confirmation dialog ──────────────────────────────────── */}
      {showLogoutConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            padding: 16,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              background: 'rgba(5,10,22,0.97)',
              border: '1px solid rgba(255,60,60,0.45)',
              borderRadius: 8,
              padding: '32px 36px',
              maxWidth: 380,
              width: '100%',
              boxShadow: '0 0 40px rgba(255,60,60,0.15)',
              position: 'relative',
            }}
          >
            {/* Corner accents */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 14, height: 14, borderTop: '2px solid rgba(255,60,60,0.7)', borderLeft: '2px solid rgba(255,60,60,0.7)' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: 14, height: 14, borderTop: '2px solid rgba(255,60,60,0.7)', borderRight: '2px solid rgba(255,60,60,0.7)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: 14, height: 14, borderBottom: '2px solid rgba(255,60,60,0.7)', borderLeft: '2px solid rgba(255,60,60,0.7)' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderBottom: '2px solid rgba(255,60,60,0.7)', borderRight: '2px solid rgba(255,60,60,0.7)' }} />

            <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,100,100,0.6)', letterSpacing: '0.22em', marginBottom: 16 }}>
              ⚠ SESSION TERMINATION
            </div>
            <h2
              id="logout-title"
              style={{ margin: '0 0 10px', fontFamily: 'monospace', fontSize: 16, fontWeight: 900, color: '#ff6464', letterSpacing: '0.08em' }}
            >
              LOG OUT?
            </h2>
            <p style={{ margin: '0 0 24px', fontFamily: 'monospace', fontSize: 12, color: 'rgba(200,210,230,0.75)', lineHeight: 1.6, letterSpacing: '0.04em' }}>
              Your progress is saved locally. Logging out will return you to the name-entry screen. A different captain can then start their own profile.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleLogoutCancel}
                style={{ flex: 1, padding: '12px 0', background: 'rgba(0,255,204,0.06)', border: '1px solid rgba(0,255,204,0.3)', borderRadius: 5, color: '#00ffcc', fontFamily: 'monospace', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.1em', transition: 'all 0.2s' }}
              >
                CANCEL
              </button>
              <button
                onClick={handleLogoutConfirm}
                style={{ flex: 1, padding: '12px 0', background: 'rgba(255,60,60,0.12)', border: '1px solid rgba(255,60,60,0.55)', borderRadius: 5, color: '#ff6464', fontFamily: 'monospace', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.1em', transition: 'all 0.2s' }}
              >
                LOG OUT
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
