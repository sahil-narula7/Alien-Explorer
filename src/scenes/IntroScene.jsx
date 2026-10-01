import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, SCENES } from '../context/GameContext';
import useSound from '../hooks/useSound';

// ── Phase timing (seconds) ────────────────────────────────────────────────────
const PHASE_TIMES = [0, 2000, 4000, 7000, 10000, 13000, 16000];

// ── Framer-motion variants ────────────────────────────────────────────────────
const fadeVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.2, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } },
};

const glowTextVariants = {
  hidden:  { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 1.4, ease: 'easeOut' },
  },
  exit:    { opacity: 0, scale: 0.9, transition: { duration: 0.6 } },
};

const riseVariants = {
  hidden:  { opacity: 0, y: 120 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 1.6, ease: [0.16, 1, 0.3, 1] },
  },
  exit:    { opacity: 0, transition: { duration: 0.4 } },
};

const slamVariants = {
  hidden:  { opacity: 0, scale: 2.5, y: -40 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
  exit:    { opacity: 0, transition: { duration: 0.4 } },
};

const crystalVariants = (i) => ({
  hidden:  { opacity: 0, scale: 0, rotate: -30 },
  visible: {
    opacity: 1, scale: 1, rotate: 0,
    transition: { duration: 0.8, delay: i * 0.25, ease: 'backOut' },
  },
  exit:    { opacity: 0, scale: 0, transition: { duration: 0.3 } },
});

// ── Crystal gem positions around the planet ───────────────────────────────────
const CRYSTAL_POSITIONS = [
  { top: '-14%',  left: '10%'  },
  { top: '20%',   left: '-18%' },
  { top: '-10%',  right: '8%'  },
];

const CRYSTAL_COLORS = ['#00ffcc', '#00ddff', '#88ffcc'];

// ── Crack path data (SVG lines on 200×200 canvas) ────────────────────────────
const CRACKS = [
  { x1: 100, y1: 100, x2: 60,  y2: 40,  len: 72  },
  { x1: 100, y1: 100, x2: 145, y2: 55,  len: 68  },
  { x1: 100, y1: 100, x2: 130, y2: 155, len: 70  },
  { x1: 100, y1: 100, x2: 55,  y2: 148, len: 68  },
  { x1: 80,  y1: 70,  x2: 50,  y2: 90,  len: 36  },
  { x1: 130, y1: 80,  x2: 160, y2: 100, len: 36  },
];

// ── Small crystal SVG component ───────────────────────────────────────────────
function MiniCrystal({ color, size = 40 }) {
  const h = size;
  const w = size * 0.65;
  return (
    <svg width={w} height={h} viewBox="0 0 26 40" fill="none">
      <defs>
        <linearGradient id={`cg-${color}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="40%"  stopColor={color}   stopOpacity="1"   />
          <stop offset="100%" stopColor={color}   stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {/* Main crystal body */}
      <polygon
        points="13,0 24,10 22,32 13,40 4,32 2,10"
        fill={`url(#cg-${color})`}
        stroke={color}
        strokeWidth="0.8"
      />
      {/* Highlight facet */}
      <polygon
        points="13,0 24,10 18,22 13,10"
        fill="rgba(255,255,255,0.3)"
      />
      {/* Inner glow line */}
      <line x1="13" y1="3" x2="13" y2="36" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    </svg>
  );
}

// ── Warning icon ──────────────────────────────────────────────────────────────
function WarningIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <polygon points="16,3 30,28 2,28" fill="none" stroke="#ff4444" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="16" y1="12" x2="16" y2="21" stroke="#ff4444" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16" cy="25" r="1.5" fill="#ff4444" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function IntroScene() {
  const { dispatch } = useGame();
  const sound = useSound();
  const [phase, setPhase] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const timersRef = useRef([]);

  // Advance through phases on a schedule
  useEffect(() => {
    PHASE_TIMES.forEach((delay, i) => {
      if (i === 0) return; // phase 0 is immediate
      const id = setTimeout(() => setPhase(i), delay);
      timersRef.current.push(id);
    });
    // Show button shortly after the final logo phase
    const btnId = setTimeout(() => setShowButton(true), 17200);
    timersRef.current.push(btnId);

    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  function handleBegin() {
    sound.playNavigation();
    dispatch({ type: 'SET_SCENE', payload: SCENES.STORY });
  }

  // Planet pulsing style for phases 4 and 5
  const planetGlow =
    phase >= 5
      ? '0 0 60px #ff330099, 0 0 120px #ff220055, inset -20px -20px 40px rgba(0,0,0,0.6)'
      : '0 0 60px #00ffcc66, 0 0 120px #00ffcc33, inset -20px -20px 40px rgba(0,0,0,0.6)';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Orbitron', 'Courier New', monospace",
        overflow: 'hidden',
        // Transparent so StarField canvas shows through
        background: 'transparent',
      }}
    >
      {/* ── Overlay darkener ───────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,10,0.7) 100%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Phase 1 — Opening crawl text ──────────────────────────────── */}
      <AnimatePresence>
        {phase === 1 && (
          <motion.div
            key="opening-text"
            variants={glowTextVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: 'absolute',
              zIndex: 5,
              textAlign: 'center',
              color: '#aaddff',
              fontSize: 'clamp(14px, 2.2vw, 24px)',
              letterSpacing: '0.12em',
              textShadow: '0 0 20px #66aaff, 0 0 40px #44aaff88',
              fontStyle: 'italic',
              maxWidth: '700px',
              padding: '0 20px',
            }}
          >
            A long time ago, in a galaxy not so far away...
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Phase 2–6 — Planet scene container ───────────────────────── */}
      <AnimatePresence>
        {phase >= 2 && phase < 6 && (
          <motion.div
            key="planet-scene"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: 'absolute',
              zIndex: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            {/* Planet wrapper (relative for crack overlay and crystals) */}
            <motion.div
              style={{ position: 'relative' }}
              animate={
                phase >= 5
                  ? {
                      boxShadow: [
                        '0 0 0px transparent',
                        '0 0 60px #ff2200aa',
                        '0 0 0px transparent',
                      ],
                    }
                  : {}
              }
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* ── Planet body ──────────────────────────────────────── */}
              <motion.div
                variants={riseVariants}
                initial="hidden"
                animate="visible"
                style={{
                  width: 'clamp(180px, 22vw, 280px)',
                  height: 'clamp(180px, 22vw, 280px)',
                  borderRadius: '50%',
                  background: phase >= 5
                    ? 'radial-gradient(circle at 35% 35%, #ff8866 0%, #cc3300 40%, #880000 70%, #330000 100%)'
                    : 'radial-gradient(circle at 35% 35%, #88ffee 0%, #00ccaa 35%, #008877 65%, #004444 100%)',
                  boxShadow: planetGlow,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'background 1.5s ease, box-shadow 1.5s ease',
                }}
              >
                {/* Surface stripes */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 22px, rgba(255,255,255,0.035) 22px, rgba(255,255,255,0.035) 25px)',
                  }}
                />
                {/* Specular highlight */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '18%',
                    left: '22%',
                    width: '28%',
                    height: '18%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 100%)',
                    transform: 'rotate(-30deg)',
                  }}
                />
              </motion.div>

              {/* ── Rings ────────────────────────────────────────────── */}
              <motion.div
                variants={riseVariants}
                initial="hidden"
                animate="visible"
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotateX(75deg)',
                  width: 'clamp(380px, 46vw, 580px)',
                  height: 'clamp(40px, 5vw, 64px)',
                  borderRadius: '50%',
                  border: phase >= 5
                    ? '10px solid rgba(255,80,0,0.45)'
                    : '10px solid rgba(0,220,200,0.4)',
                  boxShadow: phase >= 5
                    ? '0 0 24px rgba(255,80,0,0.3)'
                    : '0 0 24px rgba(0,220,200,0.25)',
                  pointerEvents: 'none',
                  transition: 'border-color 1.5s ease, box-shadow 1.5s ease',
                }}
              />

              {/* ── SVG Crack overlay (phase 4+) ──────────────────── */}
              <AnimatePresence>
                {phase >= 4 && (
                  <motion.div
                    key="cracks"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      pointerEvents: 'none',
                    }}
                  >
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 200 200"
                      style={{ position: 'absolute', inset: 0 }}
                    >
                      {CRACKS.map((crack, i) => (
                        <CrackLine key={i} crack={crack} delay={i * 0.18} />
                      ))}
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Crystal gems (phase 3) ────────────────────────── */}
              <AnimatePresence>
                {phase === 3 && (
                  <>
                    {CRYSTAL_POSITIONS.map((pos, i) => (
                      <motion.div
                        key={`crystal-${i}`}
                        custom={i}
                        variants={crystalVariants(i)}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        style={{
                          position: 'absolute',
                          ...pos,
                          filter: `drop-shadow(0 0 8px ${CRYSTAL_COLORS[i]}) drop-shadow(0 0 16px ${CRYSTAL_COLORS[i]}88)`,
                        }}
                      >
                        <MiniCrystal color={CRYSTAL_COLORS[i]} size={44} />
                      </motion.div>
                    ))}
                  </>
                )}
              </AnimatePresence>

              {/* ── Warning icons (phase 4+) ──────────────────────── */}
              <AnimatePresence>
                {phase >= 4 && (
                  <>
                    {[
                      { top: '-40px', left: '10%' },
                      { top: '10%',   right: '-48px' },
                      { bottom: '-36px', left: '30%' },
                    ].map((pos, i) => (
                      <motion.div
                        key={`warn-${i}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 0.4, 1],
                          scale: [0, 1.2, 1, 1.1],
                        }}
                        transition={{
                          duration: 1.2,
                          delay: i * 0.3,
                          repeat: Infinity,
                          repeatDelay: 0.6,
                        }}
                        style={{
                          position: 'absolute',
                          ...pos,
                          filter: 'drop-shadow(0 0 6px #ff4444)',
                        }}
                      >
                        <WarningIcon />
                      </motion.div>
                    ))}
                  </>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── Planet label text ─────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {phase === 2 && (
                <motion.div
                  key="label-phase2"
                  variants={glowTextVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{ textAlign: 'center' }}
                >
                  <div style={{
                    color: '#00ffcc',
                    fontSize: 'clamp(22px, 3.5vw, 42px)',
                    letterSpacing: '0.22em',
                    fontWeight: 900,
                    textShadow: '0 0 20px #00ffcc, 0 0 40px #00ffcc88, 0 0 80px #00ffcc44',
                    marginBottom: '8px',
                  }}>
                    PLANET XLAMA
                  </div>
                  <div style={{
                    color: '#88eedd',
                    fontSize: 'clamp(11px, 1.4vw, 16px)',
                    letterSpacing: '0.18em',
                    textShadow: '0 0 10px #00ffcc88',
                  }}>
                    A civilization powered by crystal energy
                  </div>
                </motion.div>
              )}

              {phase === 3 && (
                <motion.div
                  key="label-phase3"
                  variants={glowTextVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{
                    color: '#aaffee',
                    fontSize: 'clamp(12px, 1.6vw, 18px)',
                    letterSpacing: '0.1em',
                    textShadow: '0 0 12px #00ffcc88',
                    textAlign: 'center',
                    maxWidth: '520px',
                    lineHeight: 1.6,
                    padding: '0 20px',
                  }}
                >
                  The Elm crystals gave life, light, and power to all of Xlama
                </motion.div>
              )}

              {phase === 4 && (
                <motion.div
                  key="label-phase4"
                  variants={glowTextVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{
                    color: '#ffcc88',
                    fontSize: 'clamp(12px, 1.6vw, 18px)',
                    letterSpacing: '0.1em',
                    textShadow: '0 0 12px #ffaa4488',
                    textAlign: 'center',
                    maxWidth: '520px',
                    lineHeight: 1.6,
                    padding: '0 20px',
                  }}
                >
                  But in their hunger for more energy, they dug too deep...
                </motion.div>
              )}

              {phase === 5 && (
                <motion.div
                  key="label-phase5"
                  variants={glowTextVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{
                    color: '#ff8888',
                    fontSize: 'clamp(12px, 1.6vw, 18px)',
                    letterSpacing: '0.1em',
                    textShadow: '0 0 14px #ff444488',
                    textAlign: 'center',
                    maxWidth: '520px',
                    lineHeight: 1.6,
                    padding: '0 20px',
                  }}
                >
                  The planetary core is dying. Xlama will explode. The countdown has begun.
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Phase 6 — Logo slam ──────────────────────────────────────── */}
      <AnimatePresence>
        {phase >= 6 && (
          <motion.div
            key="logo"
            variants={slamVariants}
            initial="hidden"
            animate="visible"
            style={{
              position: 'absolute',
              zIndex: 6,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {/* Main logo */}
            <div style={{
              color: '#ffffff',
              fontSize: 'clamp(36px, 7vw, 88px)',
              fontWeight: 900,
              letterSpacing: '0.14em',
              lineHeight: 1,
              textShadow: `
                0 0 20px #00ffcc,
                0 0 40px #00ffcc,
                0 0 80px #00ffcc88,
                0 0 120px #00ffcc44
              `,
            }}>
              ALIEN
            </div>
            <div style={{
              color: '#00ffcc',
              fontSize: 'clamp(28px, 5.5vw, 72px)',
              fontWeight: 900,
              letterSpacing: '0.22em',
              lineHeight: 1,
              textShadow: `
                0 0 20px #00ffcc,
                0 0 50px #00ffcc,
                0 0 100px #00ffcc66
              `,
            }}>
              EXPLORER
            </div>
            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              style={{
                color: '#aaddff',
                fontSize: 'clamp(11px, 1.5vw, 17px)',
                letterSpacing: '0.18em',
                textShadow: '0 0 10px #66aaff88',
                marginTop: '8px',
              }}
            >
              Save your people. Find a new home.
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Begin button ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            key="begin-btn"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            onClick={handleBegin}
            style={{
              position: 'absolute',
              bottom: '8vh',
              zIndex: 10,
              background: 'transparent',
              border: '2px solid #00ffcc',
              color: '#00ffcc',
              fontSize: 'clamp(13px, 1.6vw, 17px)',
              letterSpacing: '0.2em',
              fontFamily: "'Orbitron', 'Courier New', monospace",
              fontWeight: 700,
              padding: '14px 40px',
              cursor: 'pointer',
              borderRadius: '4px',
              textShadow: '0 0 10px #00ffcc',
              boxShadow: '0 0 20px #00ffcc44, inset 0 0 20px transparent',
            }}
            whileHover={{
              boxShadow: '0 0 30px #00ffccaa, inset 0 0 20px #00ffcc22',
              scale: 1.05,
            }}
            whileTap={{ scale: 0.97 }}
          >
            ▶ BEGIN THE MISSION
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Animated glowing border frame ──────────────────────────── */}
      <CornerFrames />
    </div>
  );
}

// ── Animated SVG crack line ────────────────────────────────────────────────────
function CrackLine({ crack, delay }) {
  const { x1, y1, x2, y2, len } = crack;
  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="#ff3300"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ filter: 'drop-shadow(0 0 4px #ff5500)' }}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: [0, 1, 0.8] }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    />
  );
}

// ── Decorative corner frames ──────────────────────────────────────────────────
function CornerFrames() {
  const corners = [
    { top: 16, left: 16,   rotate: 0   },
    { top: 16, right: 16,  rotate: 90  },
    { bottom: 16, right: 16, rotate: 180 },
    { bottom: 16, left: 16,  rotate: 270 },
  ];

  return (
    <>
      {corners.map((pos, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
          style={{
            position: 'absolute',
            ...pos,
            zIndex: 2,
            pointerEvents: 'none',
            transform: `rotate(${pos.rotate}deg)`,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M2 20 L2 2 L20 2" stroke="#00ffcc" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>
      ))}
    </>
  );
}
