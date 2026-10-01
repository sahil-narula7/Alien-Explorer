import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, SCENES } from '../context/GameContext';

// ── CSS keyframes ─────────────────────────────────────────────────────────────
const CSS_KEYFRAMES = `
@keyframes lavaCrackPulse {
  0%,100% { opacity: 0.55; filter: drop-shadow(0 0 3px rgba(255,120,0,0.5)); }
  50%     { opacity: 0.9;  filter: drop-shadow(0 0 8px rgba(255,160,0,0.8)); }
}
@keyframes lavaCrackPulse2 {
  0%,100% { opacity: 0.4; filter: drop-shadow(0 0 2px rgba(255,80,0,0.4)); }
  50%     { opacity: 0.75; filter: drop-shadow(0 0 6px rgba(255,100,0,0.7)); }
}
@keyframes planetAtmos {
  0%,100% { box-shadow: 0 0 60px 20px rgba(80,30,120,0.3), 0 0 100px 40px rgba(255,100,30,0.12); }
  50%     { box-shadow: 0 0 80px 30px rgba(100,40,140,0.4), 0 0 130px 50px rgba(255,120,40,0.18); }
}
@keyframes scannerLine {
  0%   { top: 8%; }
  100% { top: 92%; }
}
@keyframes scannerGlow {
  0%,100% { opacity: 0.7; }
  50%     { opacity: 1; box-shadow: 0 0 12px rgba(0,255,204,0.8); }
}
@keyframes textTypeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes dataRowIn {
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes velaSpeakIn {
  0%   { opacity: 0; transform: translateY(8px) scale(0.97); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes designationFlash {
  0%   { opacity: 0; letter-spacing: 8px; }
  30%  { opacity: 1; letter-spacing: 4px; }
  60%  { opacity: 0.7; }
  100% { opacity: 1; letter-spacing: 4px; }
}
@keyframes atmosBurn {
  0%   { opacity: 0; }
  20%  { opacity: 0.7; }
  100% { opacity: 1; }
}
@keyframes burnFlicker {
  0%,100% { opacity: 1; }
  25%     { opacity: 0.85; }
  50%     { opacity: 0.95; }
  75%     { opacity: 0.8; }
}
@keyframes starTwinkle {
  0%,100% { opacity: 0.6; }
  50%     { opacity: 1; }
}
@keyframes pulseRing {
  0%   { transform: scale(0.8); opacity: 0.6; }
  100% { transform: scale(1.4); opacity: 0; }
}
`;

// ── Background stars ──────────────────────────────────────────────────────────
const BG_STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  size: 1 + Math.random() * 2,
  delay: `${Math.random() * 4}s`,
  dur: `${2 + Math.random() * 3}s`,
}));

function BackgroundStars() {
  return (
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
            animation: `starTwinkle ${s.dur} ${s.delay} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ── Planet of Ruin SVG ────────────────────────────────────────────────────────
function PlanetOfRuin({ size }) {
  const r = size / 2;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* atmospheric glow ring */}
      <div style={{
        position: 'absolute',
        inset: -16,
        borderRadius: '50%',
        background: 'transparent',
        animation: 'planetAtmos 3s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* planet sphere */}
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `
          radial-gradient(ellipse at 38% 32%,
            rgba(100,60,130,0.9) 0%,
            rgba(65,35,90,0.95) 20%,
            rgba(40,22,60,1) 45%,
            rgba(20,10,30,1) 65%,
            rgba(8,4,14,1) 85%,
            rgba(4,2,8,1) 100%
          )
        `,
        boxShadow: `
          inset -${r * 0.25}px -${r * 0.1}px ${r * 0.4}px rgba(0,0,0,0.9),
          inset ${r * 0.1}px ${r * 0.08}px ${r * 0.3}px rgba(120,60,160,0.3),
          0 0 ${r * 0.6}px ${r * 0.15}px rgba(80,30,120,0.3),
          0 0 ${r}px ${r * 0.3}px rgba(255,100,30,0.08)
        `,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* surface texture overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `
            radial-gradient(ellipse at 70% 20%, rgba(130,70,160,0.25) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 70%, rgba(60,30,80,0.3) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.4) 100%)
          `,
          pointerEvents: 'none',
        }} />

        {/* lava crack SVG overlay */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
          }}
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          {/* major crack network — primary orange lava */}
          <g style={{ animation: 'lavaCrackPulse 2.5s ease-in-out infinite' }}>
            <path d="M95 60 Q88 75 80 85 Q70 100 65 118 Q60 135 55 150"
              stroke="rgba(255,140,20,0.85)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M80 85 Q72 92 68 102 Q63 115 58 125"
              stroke="rgba(255,120,10,0.75)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M100 80 Q110 92 118 105 Q128 120 132 140"
              stroke="rgba(255,150,30,0.8)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M118 105 Q125 112 130 122 Q136 133 138 148"
              stroke="rgba(255,110,10,0.65)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M85 100 Q92 108 95 120 Q98 132 95 148"
              stroke="rgba(255,160,40,0.7)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M110 70 Q116 80 120 94"
              stroke="rgba(255,130,20,0.6)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </g>

          {/* secondary crack network — dimmer, deeper */}
          <g style={{ animation: 'lavaCrackPulse2 3.2s 0.5s ease-in-out infinite' }}>
            <path d="M60 90 Q68 100 72 115 Q78 130 75 148"
              stroke="rgba(230,100,10,0.6)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M140 85 Q148 98 145 115 Q142 130 138 145"
              stroke="rgba(230,90,10,0.55)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M75 55 Q82 65 88 72 Q95 80 100 90"
              stroke="rgba(255,120,20,0.5)" strokeWidth="1" fill="none" strokeLinecap="round" />
            <path d="M120 140 Q130 148 135 158"
              stroke="rgba(255,100,10,0.5)" strokeWidth="1" fill="none" strokeLinecap="round" />
            <path d="M55 130 Q62 140 65 150 Q68 160 66 170"
              stroke="rgba(230,80,10,0.45)" strokeWidth="1" fill="none" strokeLinecap="round" />
            <path d="M103 120 Q108 130 112 142"
              stroke="rgba(255,140,30,0.55)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </g>

          {/* lava glow pools at crack intersections */}
          <g>
            <ellipse cx="80" cy="85" rx="5" ry="3"
              fill="rgba(255,140,20,0.35)"
              style={{ animation: 'lavaCrackPulse 2s infinite' }} />
            <ellipse cx="118" cy="105" rx="4" ry="2.5"
              fill="rgba(255,120,10,0.3)"
              style={{ animation: 'lavaCrackPulse 2.2s 0.4s infinite' }} />
            <ellipse cx="95" cy="120" rx="3.5" ry="2"
              fill="rgba(255,160,40,0.3)"
              style={{ animation: 'lavaCrackPulse 1.8s 0.8s infinite' }} />
          </g>
        </svg>
      </div>

      {/* atmospheric haze at limb */}
      <div style={{
        position: 'absolute',
        inset: -4,
        borderRadius: '50%',
        background: 'transparent',
        boxShadow: `0 0 20px 6px rgba(255,100,30,0.15), 0 0 40px 12px rgba(100,40,140,0.15)`,
        pointerEvents: 'none',
      }} />
    </div>
  );
}

// ── Scanner line over planet ───────────────────────────────────────────────────
function ScannerLine({ containerSize, active }) {
  if (!active) return null;
  return (
    <div aria-hidden="true" style={{
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      width: containerSize,
      top: 0,
      height: containerSize,
      pointerEvents: 'none',
      overflow: 'hidden',
      borderRadius: '50%',
    }}>
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        background: 'linear-gradient(90deg, transparent, rgba(0,255,204,0.9), rgba(0,255,204,0.5), transparent)',
        animation: 'scannerLine 2.5s linear infinite',
        boxShadow: '0 0 8px rgba(0,255,204,0.6)',
        animationName: 'scannerGlow, scannerLine',
        animationDuration: '1s, 2.5s',
        animationTimingFunction: 'ease-in-out, linear',
        animationIterationCount: 'infinite, infinite',
      }} />
    </div>
  );
}

// ── Data readout rows ─────────────────────────────────────────────────────────
const DATA_ROWS = [
  { label: 'Atmosphere',     value: 'Breathable (67%)',    color: '#00ff88', delay: 0 },
  { label: 'Temperature',    value: '-12°C to 45°C',       color: '#ffcc44', delay: 0.15 },
  { label: 'Life Forms',     value: 'Detected',            color: '#ff8844', delay: 0.30 },
  { label: 'Threat Level',   value: 'Unknown',             color: '#ff4444', delay: 0.45 },
  { label: 'Crystal Energy', value: 'STRONG READINGS ◉',  color: '#00ffcc', delay: 0.60 },
];

function DataReadout({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: 'rgba(0,10,20,0.85)',
            border: '1px solid rgba(0,255,204,0.3)',
            borderRadius: 6,
            padding: '12px 18px',
            minWidth: 260,
          }}
        >
          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 9,
            color: 'rgba(0,255,204,0.5)',
            letterSpacing: 3,
            marginBottom: 10,
            borderBottom: '1px solid rgba(0,255,204,0.15)',
            paddingBottom: 6,
          }}>
            ▸ PLANETARY ANALYSIS
          </div>
          {DATA_ROWS.map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: row.delay + 0.1 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 7,
                fontFamily: "'Courier New', monospace",
                fontSize: 11,
              }}
            >
              <span style={{ color: 'rgba(150,200,255,0.7)', fontSize: 10 }}>{row.label}:</span>
              <span style={{
                color: row.color,
                fontWeight: 'bold',
                textShadow: `0 0 8px ${row.color}55`,
                fontSize: row.label === 'Crystal Energy' ? 10 : 11,
              }}>
                {row.value}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Sequence phases ───────────────────────────────────────────────────────────
// 0 = dark space, planet tiny
// 1 = planet growing + scanning text
// 2 = scanner line active
// 3 = data readout
// 4 = Vela dialogue
// 5 = designation reveal
// 6 = button ready
// 7 = atmosphere burn + exit

const PHASE_TIMINGS = [
  500,   // 0→1 : planet starts approaching
  2200,  // 1→2 : scanner activates
  3500,  // 2→3 : data appears
  5200,  // 3→4 : Vela speaks
  6400,  // 4→5 : designation revealed
  7500,  // 5→6 : button appears
];

export default function PlanetArrivalScene() {
  const { dispatch } = useGame();
  const [phase, setPhase] = useState(0);
  const [burning, setBurning] = useState(false);

  useEffect(() => {
    const timers = PHASE_TIMINGS.map((ms, i) =>
      setTimeout(() => setPhase(i + 1), ms)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  function handleEnterAtmosphere() {
    if (burning) return;
    setBurning(true);
    setTimeout(() => {
      dispatch({ type: 'SET_SCENE', payload: SCENES.NAME_ENTRY });
    }, 1800);
  }

  // planet visual size based on phase
  const planetSize = phase === 0 ? 20
    : phase === 1 ? 100
    : 260;

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(ellipse at center, #030408 0%, #010103 70%, #000000 100%)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0,
    }}>
      <style>{CSS_KEYFRAMES}</style>

      <BackgroundStars />

      {/* HUD top bar */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0,255,204,0.1)',
        zIndex: 20,
      }}>
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 9,
          color: 'rgba(0,255,204,0.4)',
          letterSpacing: 2,
        }}>
          USS ODYSSEY — APPROACH VECTOR
        </div>
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 9,
          color: 'rgba(0,255,204,0.4)',
          letterSpacing: 2,
        }}>
          SECTOR: UNKNOWN / QUADRANT: 7-DELTA
        </div>
      </div>

      {/* main layout: planet center, data panel right */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 48,
        position: 'relative',
        zIndex: 10,
        marginTop: -20,
      }}>

        {/* planet + scanner container */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* pulse rings when planet fully arrived */}
          {phase >= 2 && (
            <div aria-hidden="true" style={{ position: 'absolute', pointerEvents: 'none' }}>
              {[0, 0.8, 1.6].map((delay, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  width: 260, height: 260,
                  marginLeft: -130, marginTop: -130,
                  borderRadius: '50%',
                  border: '1px solid rgba(255,100,30,0.3)',
                  animation: `pulseRing 3s ${delay}s ease-out infinite`,
                }} />
              ))}
            </div>
          )}

          {/* planet */}
          <motion.div
            animate={{ width: planetSize, height: planetSize }}
            transition={{
              duration: phase === 0 ? 0 : phase === 1 ? 1.2 : 2.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {phase >= 1 && <PlanetOfRuin size={planetSize} />}

            {/* scanner line — only during scan phase */}
            {phase >= 2 && phase < 3 && (
              <ScannerLine containerSize={planetSize} active />
            )}
          </motion.div>
        </div>

        {/* right data panel */}
        <div style={{ minWidth: 280, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* scanning / detected text */}
          <AnimatePresence mode="wait">
            {phase >= 1 && phase < 3 && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 13,
                  color: '#00ffcc',
                  letterSpacing: 3,
                  textShadow: '0 0 14px rgba(0,255,204,0.6)',
                }}
              >
                SCANNING...
                <br />
                <span style={{ fontSize: 11, color: 'rgba(0,255,204,0.7)' }}>
                  UNKNOWN PLANET DETECTED
                </span>
              </motion.div>
            )}
            {phase >= 3 && (
              <motion.div
                key="detected"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 13,
                  color: '#00ffcc',
                  letterSpacing: 3,
                  textShadow: '0 0 14px rgba(0,255,204,0.6)',
                }}
              >
                ✓ SCAN COMPLETE
                <br />
                <span style={{ fontSize: 11, color: 'rgba(0,255,204,0.7)' }}>
                  UNKNOWN PLANET — ANALYSIS READY
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* data readout */}
          <DataReadout visible={phase >= 3} />

          {/* Vela dialogue */}
          <AnimatePresence>
            {phase >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                  background: 'rgba(0,255,204,0.06)',
                  border: '1px solid rgba(0,255,204,0.35)',
                  borderRadius: 6,
                  padding: '10px 14px',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                {/* Vela avatar icon */}
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 40% 35%, #00ffcc44, #003322)',
                  border: '1.5px solid #00ffcc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 12,
                  color: '#00ffcc',
                  boxShadow: '0 0 8px rgba(0,255,204,0.4)',
                }}>
                  V
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 9,
                    color: '#00ffcc',
                    letterSpacing: 2,
                    marginBottom: 4,
                  }}>
                    VELA ZORN — SCIENCE OFFICER
                  </div>
                  <div style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 11,
                    color: 'rgba(200,255,240,0.9)',
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                  }}>
                    "Captain, I'm detecting strong Elm crystal
                    signatures. This could be it!"
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* designation text — below planet area */}
      <AnimatePresence>
        {phase >= 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{
              marginTop: 32,
              textAlign: 'center',
              zIndex: 10,
            }}
          >
            <div style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 9,
              color: 'rgba(200,150,100,0.6)',
              letterSpacing: 4,
              marginBottom: 6,
            }}>
              DESIGNATION ASSIGNED
            </div>
            <div style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 22,
              fontWeight: 'bold',
              color: '#ff8844',
              letterSpacing: 4,
              textShadow: '0 0 20px rgba(255,140,60,0.7), 0 0 40px rgba(255,80,20,0.4)',
              animation: 'designationFlash 1s ease-out both',
            }}>
              PLANET OF RUIN
            </div>
            <div style={{
              marginTop: 6,
              fontFamily: "'Courier New', monospace",
              fontSize: 9,
              color: 'rgba(200,100,50,0.5)',
              letterSpacing: 3,
            }}>
              CLASS-M HOSTILE / CRYSTAL DEPOSITS CONFIRMED
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* enter atmosphere button */}
      <AnimatePresence>
        {phase >= 6 && !burning && (
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            onClick={handleEnterAtmosphere}
            style={{
              marginTop: 28,
              padding: '12px 40px',
              background: 'linear-gradient(135deg, rgba(255,100,20,0.15), rgba(200,60,10,0.1))',
              border: '1.5px solid rgba(255,120,30,0.7)',
              borderRadius: 4,
              color: '#ff8844',
              fontFamily: "'Courier New', monospace",
              fontSize: 13,
              fontWeight: 'bold',
              letterSpacing: 4,
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(255,120,30,0.2)',
              zIndex: 20,
              transition: 'all 0.2s ease',
            }}
            whileHover={{
              scale: 1.04,
              boxShadow: '0 0 36px rgba(255,120,30,0.5)',
              borderColor: 'rgba(255,150,60,1)',
            }}
            whileTap={{ scale: 0.97 }}
          >
            ▸ ENTERING ATMOSPHERE
          </motion.button>
        )}
      </AnimatePresence>

      {/* atmosphere burn overlay */}
      <AnimatePresence>
        {burning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            {/* outer burn layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at center, rgba(255,180,60,0.15) 0%, rgba(255,80,10,0.4) 50%, rgba(180,30,0,0.8) 100%)',
                animation: 'burnFlicker 0.2s infinite',
              }}
            />
            {/* heat shimmer streaks */}
            {Array.from({ length: 16 }, (_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: [0, 0.6, 0], scaleY: [0, 1, 1.5] }}
                transition={{ duration: 1.4, delay: i * 0.08, ease: 'easeIn' }}
                style={{
                  position: 'absolute',
                  left: `${(i / 16) * 100 + Math.random() * 6 - 3}%`,
                  top: 0,
                  bottom: 0,
                  width: `${4 + Math.random() * 8}%`,
                  background: `linear-gradient(180deg,
                    transparent 0%,
                    rgba(${255},${100 + i * 8},${20},0.5) 30%,
                    rgba(255,60,0,0.7) 60%,
                    rgba(200,30,0,0.4) 100%
                  )`,
                  transformOrigin: 'top center',
                }}
              />
            ))}
            {/* bright center core */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 0.8, 1], scale: [0.5, 1.2, 1.5] }}
              transition={{ duration: 1.8, ease: 'easeIn' }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at center, rgba(255,255,220,0.6) 0%, rgba(255,140,40,0.4) 30%, transparent 70%)',
              }}
            />
            {/* final white flash */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0, 1] }}
              transition={{ duration: 1.8, times: [0, 0.5, 0.7, 1] }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255,220,180,1)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* corner HUD decorations */}
      {[
        { top: 48, left: 16 },
        { top: 48, right: 16 },
        { bottom: 16, left: 16 },
        { bottom: 16, right: 16 },
      ].map((pos, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute',
            ...pos,
            width: 20,
            height: 20,
            borderTop: i < 2 ? '1.5px solid rgba(0,255,204,0.25)' : 'none',
            borderBottom: i >= 2 ? '1.5px solid rgba(0,255,204,0.25)' : 'none',
            borderLeft: i % 2 === 0 ? '1.5px solid rgba(0,255,204,0.25)' : 'none',
            borderRight: i % 2 === 1 ? '1.5px solid rgba(0,255,204,0.25)' : 'none',
            zIndex: 5,
          }}
        />
      ))}
    </div>
  );
}
