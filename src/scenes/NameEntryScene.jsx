import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, SCENES } from '../context/GameContext';
import useSound from '../hooks/useSound';

// ── CSS keyframes ─────────────────────────────────────────────────────────────
const CSS_KEYFRAMES = `
@keyframes ne-starTwinkle {
  0%,100% { opacity: 0.4; transform: scale(1); }
  50%     { opacity: 1;   transform: scale(1.3); }
}
@keyframes ne-badgeGlow {
  0%,100% { filter: drop-shadow(0 0 10px rgba(0,255,204,0.6)) drop-shadow(0 0 20px rgba(0,255,204,0.3)); }
  50%     { filter: drop-shadow(0 0 20px rgba(0,255,204,0.9)) drop-shadow(0 0 40px rgba(0,255,204,0.5)); }
}
@keyframes ne-titleGlow {
  0%,100% { text-shadow: 0 0 12px rgba(0,255,204,0.7), 0 0 30px rgba(0,255,204,0.4); }
  50%     { text-shadow: 0 0 20px rgba(0,255,204,1),   0 0 50px rgba(0,255,204,0.6); }
}
@keyframes ne-underlinePulse {
  0%,100% { box-shadow: 0 2px 0 0 rgba(0,255,204,0.6), 0 2px 12px rgba(0,255,204,0.3); }
  50%     { box-shadow: 0 2px 0 0 rgba(0,255,204,1),   0 2px 24px rgba(0,255,204,0.7); }
}
@keyframes ne-scanLine {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@keyframes ne-btnPulse {
  0%,100% { box-shadow: 0 0 16px rgba(0,255,204,0.4), inset 0 0 16px rgba(0,255,204,0.05); }
  50%     { box-shadow: 0 0 32px rgba(0,255,204,0.7), inset 0 0 28px rgba(0,255,204,0.12); }
}
@keyframes ne-crewWave {
  0%,100% { transform: translateY(0) rotate(0deg); }
  25%     { transform: translateY(-6px) rotate(-4deg); }
  75%     { transform: translateY(-3px) rotate(3deg); }
}
@keyframes ne-crewFloat {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-10px); }
}
@keyframes ne-armWave {
  0%,100% { transform: rotate(0deg); transform-origin: bottom center; }
  30%     { transform: rotate(-30deg); transform-origin: bottom center; }
  70%     { transform: rotate(10deg); transform-origin: bottom center; }
}
@keyframes ne-nameFlash {
  0%   { opacity: 0.5; letter-spacing: 1px; }
  50%  { opacity: 1;   letter-spacing: 3px; }
  100% { opacity: 0.85; letter-spacing: 2px; }
}
@keyframes ne-circuitTrace {
  0%   { stroke-dashoffset: 200; opacity: 0; }
  20%  { opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 0.5; }
}
@keyframes ne-confirmFlash {
  0%   { opacity: 0; }
  50%  { opacity: 1; }
  100% { opacity: 0; }
}
`;

// ── Static star data (generated once) ────────────────────────────────────────
const BG_STARS = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  left: `${(i * 137.508) % 100}%`,
  top: `${(i * 93.7) % 100}%`,
  size: 1 + (i % 3),
  delay: `${(i * 0.17) % 5}s`,
  dur: `${2 + (i * 0.13) % 3}s`,
  opacity: 0.3 + (i % 4) * 0.15,
}));

// ── Crew silhouette positions ─────────────────────────────────────────────────
const CREW_POSITIONS = [
  { left: '4%',  bottom: '6%',  scale: 0.75, delay: '0s',    waveDur: '2.8s', floatDur: '3.2s' },
  { left: '11%', bottom: '4%',  scale: 0.9,  delay: '0.4s',  waveDur: '3.1s', floatDur: '3.8s' },
  { left: '84%', bottom: '5%',  scale: 0.8,  delay: '0.8s',  waveDur: '2.6s', floatDur: '3.5s' },
  { left: '91%', bottom: '7%',  scale: 0.7,  delay: '0.2s',  waveDur: '3.4s', floatDur: '4.0s' },
  { left: '18%', bottom: '3%',  scale: 0.65, delay: '1.1s',  waveDur: '2.9s', floatDur: '3.1s' },
  { left: '77%', bottom: '4%',  scale: 0.85, delay: '0.6s',  waveDur: '3.3s', floatDur: '3.7s' },
];

// ── Crew silhouette SVG ───────────────────────────────────────────────────────
function CrewSilhouette({ color = 'rgba(0,255,204,0.18)', armDelay = '0s' }) {
  return (
    <svg width="36" height="64" viewBox="0 0 36 64" fill="none" aria-hidden="true">
      {/* head */}
      <ellipse cx="18" cy="10" rx="8" ry="9" fill={color} />
      {/* visor */}
      <ellipse cx="18" cy="10" rx="5" ry="4" fill="rgba(0,255,204,0.12)" />
      {/* body */}
      <rect x="10" y="20" width="16" height="22" rx="4" fill={color} />
      {/* left arm */}
      <g style={{ animation: `ne-armWave 2.4s ease-in-out infinite`, animationDelay: armDelay, transformOrigin: '10px 22px' }}>
        <rect x="2" y="20" width="8" height="16" rx="3" fill={color} />
      </g>
      {/* right arm */}
      <g style={{ animation: `ne-armWave 2.4s ease-in-out infinite reverse`, animationDelay: armDelay, transformOrigin: '26px 22px' }}>
        <rect x="26" y="20" width="8" height="16" rx="3" fill={color} />
      </g>
      {/* legs */}
      <rect x="10" y="42" width="6" height="18" rx="3" fill={color} />
      <rect x="20" y="42" width="6" height="18" rx="3" fill={color} />
    </svg>
  );
}

// ── Badge / Star SVG ──────────────────────────────────────────────────────────
function CaptainBadge({ previewName }) {
  return (
    <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
      <svg
        width="200" height="200" viewBox="0 0 200 200"
        style={{ animation: 'ne-badgeGlow 2.5s ease-in-out infinite' }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="ne-badgeFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#003333" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#001a1a" stopOpacity="0.95" />
          </radialGradient>
          <radialGradient id="ne-starFill" cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#00ffcc" />
            <stop offset="100%" stopColor="#007755" />
          </radialGradient>
        </defs>

        {/* Outer ring */}
        <circle cx="100" cy="100" r="95" fill="none" stroke="#00ffcc" strokeWidth="1.5" strokeOpacity="0.6" />
        <circle cx="100" cy="100" r="88" fill="url(#ne-badgeFill)" stroke="#00ffcc" strokeWidth="2" strokeOpacity="0.9" />

        {/* Tick marks around ring */}
        {Array.from({ length: 24 }, (_, i) => {
          const angle = (i * 15 - 90) * (Math.PI / 180);
          const r1 = 90, r2 = i % 6 === 0 ? 80 : 85;
          return (
            <line
              key={i}
              x1={100 + r1 * Math.cos(angle)} y1={100 + r1 * Math.sin(angle)}
              x2={100 + r2 * Math.cos(angle)} y2={100 + r2 * Math.sin(angle)}
              stroke="#00ffcc" strokeWidth={i % 6 === 0 ? 2 : 1} strokeOpacity="0.7"
            />
          );
        })}

        {/* 8-point star */}
        <polygon
          points="100,30 110,75 155,75 120,100 135,145 100,120 65,145 80,100 45,75 90,75"
          fill="url(#ne-starFill)"
          stroke="#00ffcc"
          strokeWidth="1.5"
          strokeOpacity="0.8"
          opacity="0.9"
        />

        {/* Center circle */}
        <circle cx="100" cy="100" r="22" fill="#001a1a" stroke="#00ffcc" strokeWidth="1.5" strokeOpacity="0.9" />
        <circle cx="100" cy="100" r="16" fill="none" stroke="#00ffcc" strokeWidth="0.8" strokeOpacity="0.5" />

        {/* Helm icon in center */}
        <circle cx="100" cy="97" r="9" fill="none" stroke="#00ffcc" strokeWidth="1.5" strokeOpacity="0.8" />
        <line x1="100" y1="88" x2="100" y2="82" stroke="#00ffcc" strokeWidth="1.5" strokeOpacity="0.8" />
        <line x1="109" y1="97" x2="115" y2="97" stroke="#00ffcc" strokeWidth="1.5" strokeOpacity="0.8" />
        <line x1="91"  y1="97" x2="85"  y2="97" stroke="#00ffcc" strokeWidth="1.5" strokeOpacity="0.8" />
        <line x1="100" y1="106" x2="100" y2="112" stroke="#00ffcc" strokeWidth="1.5" strokeOpacity="0.8" />

        {/* CAPTAIN label at top */}
        <text
          x="100" y="60"
          textAnchor="middle"
          fill="#00ffcc"
          fontSize="9"
          fontFamily="monospace"
          letterSpacing="3"
          opacity="0.9"
        >
          CAPTAIN
        </text>
      </svg>

      {/* Preview name below badge center */}
      <AnimatePresence>
        {previewName && (
          <motion.div
            key={previewName}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute',
              bottom: 22,
              left: 0, right: 0,
              textAlign: 'center',
              fontFamily: 'monospace',
              fontSize: 11,
              fontWeight: 700,
              color: '#00ffcc',
              letterSpacing: 2,
              animation: 'ne-nameFlash 1.5s ease-in-out',
              textShadow: '0 0 8px rgba(0,255,204,0.8)',
              pointerEvents: 'none',
            }}
          >
            {previewName.toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function NameEntryScene() {
  const { dispatch } = useGame();
  const sound = useSound();
  const [name, setName] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const inputRef = useRef(null);

  const isValid = name.trim().length >= 2;

  // Auto-focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 600);
  }, []);

  function handleConfirm() {
    if (!isValid || confirmed) return;
    sound.playNavigation();
    setConfirmed(true);
    setFlashActive(true);
    // INIT_PLAYER creates the playerId and saves the captain name in one action.
    // Using INIT_PLAYER (not SET_CAPTAIN_NAME) ensures a profile is established
    // so the auto-save effect in GameContext will persist it immediately.
    dispatch({ type: 'INIT_PLAYER', payload: name.trim() });
    setTimeout(() => {
      dispatch({ type: 'SET_SCENE', payload: SCENES.DASHBOARD });
    }, 900);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleConfirm();
  }

  return (
    <>
      {/* Inject keyframes */}
      <style>{CSS_KEYFRAMES}</style>

      {/* Root container */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        {/* Background stars */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {BG_STARS.map(s => (
            <div
              key={s.id}
              style={{
                position: 'absolute',
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                borderRadius: '50%',
                background: '#ffffff',
                opacity: s.opacity,
                animation: `ne-starTwinkle ${s.dur} ${s.delay} ease-in-out infinite`,
              }}
            />
          ))}
        </div>

        {/* Semi-transparent overlay for readability */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(0,8,20,0.85) 0%, rgba(0,4,12,0.92) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Circuit decoration — top-left */}
        <svg
          aria-hidden="true"
          width="220" height="140"
          style={{ position: 'absolute', top: 0, left: 0, opacity: 0.35 }}
          viewBox="0 0 220 140"
        >
          <path d="M0,20 H60 V60 H120 V20 H180" fill="none" stroke="#00ffcc" strokeWidth="1"
            strokeDasharray="200" style={{ animation: 'ne-circuitTrace 6s 1s linear infinite' }} />
          <path d="M0,50 H40 V90 H100" fill="none" stroke="#00ffcc" strokeWidth="0.7"
            strokeDasharray="200" style={{ animation: 'ne-circuitTrace 7s 2s linear infinite' }} />
          <circle cx="60"  cy="60" r="3" fill="#00ffcc" opacity="0.6" />
          <circle cx="120" cy="20" r="2" fill="#00ffcc" opacity="0.5" />
          <circle cx="40"  cy="90" r="2" fill="#00ffcc" opacity="0.4" />
        </svg>

        {/* Circuit decoration — bottom-right */}
        <svg
          aria-hidden="true"
          width="220" height="140"
          style={{ position: 'absolute', bottom: 0, right: 0, opacity: 0.35, transform: 'rotate(180deg)' }}
          viewBox="0 0 220 140"
        >
          <path d="M0,20 H60 V60 H120 V20 H180" fill="none" stroke="#00ffcc" strokeWidth="1"
            strokeDasharray="200" style={{ animation: 'ne-circuitTrace 6s 3s linear infinite' }} />
          <path d="M0,50 H40 V90 H100" fill="none" stroke="#00ffcc" strokeWidth="0.7"
            strokeDasharray="200" style={{ animation: 'ne-circuitTrace 7s 1.5s linear infinite' }} />
          <circle cx="60"  cy="60" r="3" fill="#00ffcc" opacity="0.6" />
          <circle cx="120" cy="20" r="2" fill="#00ffcc" opacity="0.5" />
        </svg>

        {/* Crew silhouettes */}
        {CREW_POSITIONS.map((pos, i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: pos.left,
              bottom: pos.bottom,
              transform: `scale(${pos.scale})`,
              transformOrigin: 'bottom center',
              animation: `ne-crewFloat ${pos.floatDur} ${pos.delay} ease-in-out infinite`,
            }}
          >
            <CrewSilhouette
              color={`rgba(0,255,204,${0.12 + i * 0.02})`}
              armDelay={pos.delay}
            />
          </div>
        ))}

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 28,
            padding: '48px 56px 44px',
            background: 'rgba(0,10,20,0.82)',
            border: '1px solid rgba(0,255,204,0.25)',
            borderRadius: 4,
            boxShadow: '0 0 60px rgba(0,255,204,0.08), 0 0 120px rgba(0,255,204,0.04)',
            backdropFilter: 'blur(12px)',
            maxWidth: 560,
            width: '90vw',
          }}
        >
          {/* Corner accents */}
          {[
            { top: 0, left: 0, borderTop: '2px solid #00ffcc', borderLeft: '2px solid #00ffcc', borderRadius: '4px 0 0 0' },
            { top: 0, right: 0, borderTop: '2px solid #00ffcc', borderRight: '2px solid #00ffcc', borderRadius: '0 4px 0 0' },
            { bottom: 0, left: 0, borderBottom: '2px solid #00ffcc', borderLeft: '2px solid #00ffcc', borderRadius: '0 0 0 4px' },
            { bottom: 0, right: 0, borderBottom: '2px solid #00ffcc', borderRight: '2px solid #00ffcc', borderRadius: '0 0 4px 0' },
          ].map((style, i) => (
            <div key={i} aria-hidden="true" style={{ position: 'absolute', width: 20, height: 20, ...style }} />
          ))}

          {/* Badge */}
          <CaptainBadge previewName={name.trim() || null} />

          {/* Title */}
          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                margin: 0,
                fontFamily: 'monospace',
                fontSize: 'clamp(16px, 3vw, 22px)',
                fontWeight: 900,
                color: '#00ffcc',
                letterSpacing: '0.22em',
                animation: 'ne-titleGlow 2.5s ease-in-out infinite',
                textTransform: 'uppercase',
              }}
            >
              CAPTAIN DESIGNATION REQUIRED
            </h1>
            <p
              style={{
                margin: '10px 0 0',
                fontFamily: 'monospace',
                fontSize: 13,
                color: 'rgba(0,255,204,0.6)',
                letterSpacing: '0.08em',
              }}
            >
              Enter your name to take command of the Odyssey
            </p>
          </div>

          {/* Input area */}
          <div style={{ width: '100%', position: 'relative' }}>
            {/* Single terminal-style prompt — the only source of >_ */}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                fontFamily: 'monospace',
                fontSize: 18,
                color: '#00ffcc',
                opacity: 0.8,
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 1,
              }}
            >
              &gt;_
            </span>

            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={20}
              placeholder="YOUR NAME"
              disabled={confirmed}
              aria-label="Captain name"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                paddingLeft: 48,
                paddingRight: 16,
                paddingTop: 16,
                paddingBottom: 16,
                background: 'rgba(0,20,30,0.9)',
                border: '1px solid rgba(0,255,204,0.35)',
                borderRadius: 3,
                color: '#00ffcc',
                fontFamily: 'monospace',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '0.15em',
                outline: 'none',
                caretColor: '#00ffcc',
                animation: 'ne-underlinePulse 2s ease-in-out infinite',
                transition: 'border-color 0.2s',
                ...(isValid ? { borderColor: 'rgba(0,255,204,0.7)' } : {}),
              }}
            />
            {/* No secondary blinking span — the native input caret is sufficient */}
          </div>

          {/* Validation hint */}
          <AnimatePresence>
            {name.length > 0 && name.trim().length < 2 && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  margin: '-16px 0 0',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  color: 'rgba(255,80,80,0.8)',
                  letterSpacing: '0.08em',
                }}
              >
                DESIGNATION REQUIRES 2+ CHARACTERS
              </motion.p>
            )}
          </AnimatePresence>

          {/* Confirm button */}
          <motion.button
            onClick={handleConfirm}
            disabled={!isValid || confirmed}
            whileHover={isValid && !confirmed ? { scale: 1.03 } : {}}
            whileTap={isValid && !confirmed ? { scale: 0.97 } : {}}
            style={{
              position: 'relative',
              overflow: 'hidden',
              width: '100%',
              padding: '16px 24px',
              background: isValid
                ? 'rgba(0,255,204,0.08)'
                : 'rgba(0,40,40,0.4)',
              border: `1px solid ${isValid ? 'rgba(0,255,204,0.7)' : 'rgba(0,255,204,0.2)'}`,
              borderRadius: 3,
              color: isValid ? '#00ffcc' : 'rgba(0,255,204,0.25)',
              fontFamily: 'monospace',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.25em',
              cursor: isValid && !confirmed ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s',
              animation: isValid && !confirmed ? 'ne-btnPulse 2s ease-in-out infinite' : 'none',
            }}
          >
            {/* Scan line sweep — only when active */}
            {isValid && !confirmed && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0, bottom: 0, left: 0,
                  width: '40%',
                  background: 'linear-gradient(90deg, transparent, rgba(0,255,204,0.18), transparent)',
                  animation: 'ne-scanLine 1.8s linear infinite',
                  pointerEvents: 'none',
                }}
              />
            )}
            {confirmed ? 'DESIGNATION CONFIRMED...' : 'CONFIRM DESIGNATION'}
          </motion.button>

          {/* Status line */}
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 10,
              color: 'rgba(0,255,204,0.35)',
              letterSpacing: '0.2em',
              textAlign: 'center',
            }}
          >
            ODYSSEY COMMAND SYSTEM &nbsp;|&nbsp; AWAITING CAPTAIN AUTHORIZATION
          </div>
        </motion.div>

        {/* White flash on confirm */}
        <AnimatePresence>
          {flashActive && (
            <motion.div
              key="flash"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.9, times: [0, 0.3, 1] }}
              onAnimationComplete={() => setFlashActive(false)}
              aria-hidden="true"
              style={{
                position: 'fixed',
                inset: 0,
                background: 'white',
                zIndex: 999,
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
