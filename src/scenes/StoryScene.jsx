import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, SCENES } from '../context/GameContext';

// ── Slide definitions ─────────────────────────────────────────────────────────
const SLIDES = [
  {
    title: 'THE CRISIS OF XLAMA',
    text: 'For centuries, the people of Xlama thrived on the power of Elm crystals — magical energy gems that powered their entire civilization.',
    illustration: SlidePlanetCrystals,
    accentColor: '#00ffcc',
  },
  {
    title: 'THE GREAT MINING',
    text: 'As the population grew, so did their need for energy. They dug deeper and deeper into the planet, harvesting every crystal they could find.',
    illustration: SlideMining,
    accentColor: '#ffaa44',
  },
  {
    title: 'THE CORE AWAKENS',
    text: 'Deep beneath the surface, the planetary core began to crack. Warning tremors shook the cities. Scientists raised the alarm.',
    illustration: SlideCoreCrack,
    accentColor: '#ff6644',
  },
  {
    title: 'THE WARNING',
    text: '"The core is failing," warned Chief Scientist Vela. "Xlama has months, maybe weeks. We must find a new home — or face extinction."',
    illustration: SlideScientist,
    accentColor: '#ff4466',
  },
  {
    title: 'OPERATION ODYSSEY',
    text: 'The Council approved Operation Odyssey. A crew of five specialists would be assembled. They would journey into the unknown universe.',
    illustration: SlideSpaceship,
    accentColor: '#44aaff',
  },
  {
    title: 'YOUR MISSION',
    text: 'Find a habitable planet. Discover a new energy source. Save the 2 billion people of Xlama. The fate of a civilization rests on your shoulders.',
    illustration: SlideMission,
    accentColor: '#aa88ff',
  },
  {
    title: 'CAPTAIN NEEDED',
    text: 'Every great mission needs a great leader. The crew awaits their Captain. Are you ready to command the Odyssey?',
    illustration: SlideCaptain,
    accentColor: '#ffdd44',
  },
];

// ── Framer-motion variants ────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (dir) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeIn' },
  }),
};

const titleVariants = {
  hidden:  { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } },
};

const illustrationVariants = {
  hidden:  { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, delay: 0.1, ease: 'backOut' } },
};

// ── Main component ────────────────────────────────────────────────────────────
export default function StoryScene() {
  const { dispatch } = useGame();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);   // +1 = forward, -1 = backward
  const [typedText, setTypedText] = useState('');
  const [typing, setTyping] = useState(true);
  const typeTimerRef = useRef(null);
  const charIndexRef = useRef(0);

  const slide = SLIDES[current];

  // Start typewriter effect whenever slide changes
  useEffect(() => {
    setTypedText('');
    setTyping(true);
    charIndexRef.current = 0;

    if (typeTimerRef.current) clearInterval(typeTimerRef.current);

    const fullText = slide.text;
    typeTimerRef.current = setInterval(() => {
      charIndexRef.current += 1;
      setTypedText(fullText.slice(0, charIndexRef.current));
      if (charIndexRef.current >= fullText.length) {
        clearInterval(typeTimerRef.current);
        setTyping(false);
      }
    }, 28); // ~28ms per char → ~150 WPM feel

    return () => clearInterval(typeTimerRef.current);
  }, [current]);

  const goNext = useCallback(() => {
    if (current === SLIDES.length - 1) {
      dispatch({ type: 'SET_SCENE', payload: SCENES.CREW });
      return;
    }
    // If still typing, complete the text instantly
    if (typing) {
      clearInterval(typeTimerRef.current);
      setTypedText(slide.text);
      setTyping(false);
      return;
    }
    setDirection(1);
    setCurrent((c) => c + 1);
  }, [current, typing, slide.text, dispatch]);

  const goPrev = useCallback(() => {
    if (current === 0) return;
    setDirection(-1);
    setCurrent((c) => c - 1);
  }, [current]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  const isLast = current === SLIDES.length - 1;
  const { accentColor } = slide;

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
        background: 'rgba(0,0,8,0.88)',
        overflow: 'hidden',
      }}
    >
      {/* ── Ambient glow backdrop ─────────────────────────────────────── */}
      <motion.div
        key={`glow-${current}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 40%, ${accentColor}0d 0%, transparent 65%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Slide card container ──────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '900px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 'clamp(16px, 4vw, 48px)',
          overflow: 'hidden',
        }}
      >
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              gap: 'clamp(12px, 2vw, 24px)',
            }}
          >
            {/* ── Title ──────────────────────────────────────────────── */}
            <motion.div
              variants={titleVariants}
              initial="hidden"
              animate="visible"
              style={{
                color: accentColor,
                fontSize: 'clamp(16px, 2.8vw, 30px)',
                fontWeight: 900,
                letterSpacing: '0.2em',
                textShadow: `0 0 16px ${accentColor}, 0 0 32px ${accentColor}88`,
                textAlign: 'center',
                borderBottom: `1px solid ${accentColor}44`,
                paddingBottom: '12px',
                flexShrink: 0,
              }}
            >
              {slide.title}
            </motion.div>

            {/* ── Illustration ────────────────────────────────────────── */}
            <motion.div
              variants={illustrationVariants}
              initial="hidden"
              animate="visible"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
                height: 'clamp(160px, 28vh, 260px)',
              }}
            >
              <slide.illustration accentColor={accentColor} />
            </motion.div>

            {/* ── Body text (typewriter) ──────────────────────────────── */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  color: '#ccddff',
                  fontSize: 'clamp(13px, 1.7vw, 19px)',
                  lineHeight: 1.75,
                  letterSpacing: '0.04em',
                  textAlign: 'center',
                  maxWidth: '680px',
                  textShadow: '0 0 8px rgba(180,200,255,0.3)',
                  minHeight: '4em',
                  fontFamily: "'Courier New', Courier, monospace",
                  fontWeight: 400,
                }}
              >
                {typedText}
                {typing && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    style={{ color: accentColor }}
                  >
                    |
                  </motion.span>
                )}
              </div>
            </div>

            {/* ── Bottom controls ─────────────────────────────────────── */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                flexShrink: 0,
                paddingBottom: '8px',
              }}
            >
              {/* Progress dots */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {SLIDES.map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => {
                      setDirection(i > current ? 1 : -1);
                      setCurrent(i);
                    }}
                    animate={{
                      scale: i === current ? 1.3 : 1,
                      opacity: i === current ? 1 : 0.4,
                    }}
                    whileHover={{ opacity: 0.8, scale: 1.15 }}
                    style={{
                      width: i === current ? '28px' : '10px',
                      height: '10px',
                      borderRadius: '5px',
                      background: i === current ? accentColor : '#446688',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      boxShadow: i === current ? `0 0 10px ${accentColor}` : 'none',
                      transition: 'width 0.3s ease, background 0.3s ease',
                    }}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              {/* Navigation row */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {current > 0 && (
                  <motion.button
                    onClick={goPrev}
                    whileHover={{ scale: 1.05, x: -2 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${accentColor}66`,
                      color: `${accentColor}99`,
                      fontFamily: "'Orbitron', 'Courier New', monospace",
                      fontSize: 'clamp(11px, 1.2vw, 13px)',
                      letterSpacing: '0.14em',
                      padding: '10px 24px',
                      cursor: 'pointer',
                      borderRadius: '3px',
                    }}
                  >
                    ← BACK
                  </motion.button>
                )}

                <motion.button
                  onClick={goNext}
                  whileHover={{
                    scale: 1.06,
                    boxShadow: `0 0 24px ${accentColor}88, inset 0 0 16px ${accentColor}22`,
                  }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    background: 'transparent',
                    border: `2px solid ${accentColor}`,
                    color: accentColor,
                    fontFamily: "'Orbitron', 'Courier New', monospace",
                    fontWeight: 700,
                    fontSize: 'clamp(12px, 1.4vw, 15px)',
                    letterSpacing: '0.18em',
                    padding: '12px 36px',
                    cursor: 'pointer',
                    borderRadius: '3px',
                    textShadow: `0 0 8px ${accentColor}`,
                    boxShadow: `0 0 14px ${accentColor}44`,
                  }}
                >
                  {typing
                    ? '▶ SKIP'
                    : isLast
                    ? '▶ MEET THE CREW'
                    : '▶ NEXT'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Corner decorations ──────────────────────────────────────── */}
      <CornerAccents color={accentColor} />
    </div>
  );
}

// ── Decorative corner accents ─────────────────────────────────────────────────
function CornerAccents({ color }) {
  return (
    <>
      {[
        { top: 12, left: 12, r: 0 },
        { top: 12, right: 12, r: 90 },
        { bottom: 12, right: 12, r: 180 },
        { bottom: 12, left: 12, r: 270 },
      ].map((pos, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity }}
          style={{
            position: 'absolute',
            ...pos,
            transform: `rotate(${pos.r}deg)`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M2 18 L2 2 L18 2" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </motion.div>
      ))}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Slide 1: Planet with Crystals ────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
function SlidePlanetCrystals({ accentColor }) {
  return (
    <svg width="320" height="220" viewBox="0 0 320 220" fill="none">
      <defs>
        <radialGradient id="s1-planet" cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#88ffee" />
          <stop offset="45%"  stopColor="#00ccaa" />
          <stop offset="75%"  stopColor="#008877" />
          <stop offset="100%" stopColor="#003344" />
        </radialGradient>
        <radialGradient id="s1-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#00ffcc" stopOpacity="0.3" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s1-ring" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#00ffcc" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#00ffcc" stopOpacity="0.1" />
        </radialGradient>
        <filter id="s1-blur">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* Glow halo */}
      <circle cx="160" cy="110" r="90" fill="url(#s1-glow)" filter="url(#s1-blur)" />

      {/* Planet rings */}
      <ellipse cx="160" cy="110" rx="105" ry="14" stroke="#00ffcc" strokeWidth="3.5" strokeOpacity="0.4" fill="none" />
      <ellipse cx="160" cy="110" rx="115" ry="16" stroke="#00ffcc" strokeWidth="1.5" strokeOpacity="0.2" fill="none" />

      {/* Planet body */}
      <circle cx="160" cy="110" r="72" fill="url(#s1-planet)" />
      {/* Surface stripes */}
      <clipPath id="s1-clip"><circle cx="160" cy="110" r="72" /></clipPath>
      <g clipPath="url(#s1-clip)" opacity="0.12">
        {[85, 100, 115, 130, 145, 160].map((y) => (
          <line key={y} x1="88" y1={y} x2="232" y2={y} stroke="white" strokeWidth="2" />
        ))}
      </g>
      {/* Specular */}
      <ellipse cx="140" cy="88" rx="18" ry="10" fill="rgba(255,255,255,0.25)" transform="rotate(-25 140 88)" />

      {/* Crystal 1 — upper left */}
      <g transform="translate(52,42)" filter="drop-shadow(0 0 6px #00ffcc)">
        <polygon points="12,0 22,8 20,28 12,35 4,28 2,8" fill="#00ffcc" opacity="0.9" />
        <polygon points="12,0 22,8 16,18 12,8" fill="rgba(255,255,255,0.4)" />
        <motion.animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
      </g>

      {/* Crystal 2 — upper right */}
      <g transform="translate(248,30)" filter="drop-shadow(0 0 6px #88ffcc)">
        <polygon points="11,0 20,7 18,26 11,32 4,26 2,7" fill="#44eebb" opacity="0.9" />
        <polygon points="11,0 20,7 14,16 11,7" fill="rgba(255,255,255,0.4)" />
      </g>

      {/* Crystal 3 — lower right */}
      <g transform="translate(262,138)" filter="drop-shadow(0 0 6px #00ccff)">
        <polygon points="10,0 18,6 16,22 10,28 4,22 2,6" fill="#00ddff" opacity="0.85" />
        <polygon points="10,0 18,6 13,14 10,6" fill="rgba(255,255,255,0.35)" />
      </g>

      {/* Sparkle lines from crystals to planet */}
      <line x1="74" y1="74" x2="105" y2="97" stroke="#00ffcc" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3,4" />
      <line x1="258" y1="56" x2="215" y2="88" stroke="#44eebb" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3,4" />
      <line x1="268" y1="152" x2="228" y2="140" stroke="#00ddff" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3,4" />
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Slide 2: Mining Drill ────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
function SlideMining({ accentColor }) {
  return (
    <svg width="300" height="220" viewBox="0 0 300 220" fill="none">
      <defs>
        <radialGradient id="s2-planet" cx="50%" cy="25%" r="55%">
          <stop offset="0%"  stopColor="#aaaaff" />
          <stop offset="50%" stopColor="#6644cc" />
          <stop offset="100%" stopColor="#220033" />
        </radialGradient>
        <linearGradient id="s2-drill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#888888" />
          <stop offset="100%" stopColor="#444444" />
        </linearGradient>
        <filter id="s2-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Planet surface (half circle at top) */}
      <path d="M0,80 Q150,-30 300,80 L300,0 L0,0 Z" fill="url(#s2-planet)" opacity="0.9" />
      {/* Ground surface line */}
      <path d="M0,80 Q150,-30 300,80" stroke="#8866ff" strokeWidth="2" strokeOpacity="0.8" fill="none" />

      {/* Underground layers */}
      <rect x="0" y="80" width="300" height="140" fill="#1a0a2a" />
      <rect x="0" y="80" width="300" height="1.5" fill="#8866ff" opacity="0.4" />
      {/* Rock layers */}
      <path d="M0,110 Q80,100 150,112 Q220,124 300,108" stroke="#443355" strokeWidth="1.5" fill="none" strokeOpacity="0.6" />
      <path d="M0,145 Q60,135 150,148 Q240,162 300,140" stroke="#332244" strokeWidth="1.5" fill="none" strokeOpacity="0.5" />
      <path d="M0,175 Q100,168 150,178 Q200,188 300,172" stroke="#221133" strokeWidth="1.5" fill="none" strokeOpacity="0.4" />

      {/* Crystal veins underground */}
      <g opacity="0.7" filter="url(#s2-glow)">
        <polygon points="60,125 66,115 72,125 66,135" fill="#00ffcc" opacity="0.6" />
        <polygon points="230,155 235,145 240,155 235,165" fill="#00ddff" opacity="0.5" />
        <polygon points="110,170 115,160 120,170 115,180" fill="#88ffcc" opacity="0.55" />
      </g>

      {/* Drill shaft */}
      <rect x="141" y="0" width="18" height="155" fill="url(#s2-drill)" rx="2" />
      {/* Drill striping */}
      {[20, 45, 70, 95, 120].map((y) => (
        <rect key={y} x="141" y={y} width="18" height="6" fill="#999999" opacity="0.3" />
      ))}

      {/* Drill head (triangle tip) */}
      <polygon points="150,165 141,145 159,145" fill="#cc8800" filter="url(#s2-glow)" />
      {/* Drill bit segments */}
      <rect x="144" y="148" width="12" height="8" fill="#bb7700" rx="1" />
      <rect x="144" y="158" width="12" height="6" fill="#aa6600" rx="1" />

      {/* Rotation indicator arcs */}
      <path d="M132,150 A20,20 0 0,1 168,150" stroke="#ffaa44" strokeWidth="2" fill="none" strokeOpacity="0.6" strokeDasharray="4,3" />

      {/* Dust/debris particles */}
      {[[128,158],[172,162],[118,170],[182,166]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3" fill="#886644" opacity="0.5" />
      ))}

      {/* Surface building / derrick */}
      <rect x="136" y="30" width="28" height="50" fill="none" stroke="#aaaacc" strokeWidth="1.5" opacity="0.6" />
      <line x1="136" y1="30" x2="150" y2="20" stroke="#aaaacc" strokeWidth="1.5" opacity="0.6" />
      <line x1="164" y1="30" x2="150" y2="20" stroke="#aaaacc" strokeWidth="1.5" opacity="0.6" />
      <rect x="144" y="20" width="12" height="12" fill="#cc8800" opacity="0.8" rx="2" />

      {/* Warning sign on surface */}
      <polygon points="42,55 50,40 58,55" fill="none" stroke="#ff4444" strokeWidth="1.8" />
      <line x1="50" y1="46" x2="50" y2="51" stroke="#ff4444" strokeWidth="1.8" />
      <circle cx="50" cy="53" r="1.2" fill="#ff4444" />
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Slide 3: Planet Cross-section with Cracking Core ────────────────────────
// ════════════════════════════════════════════════════════════════════════════
function SlideCoreCrack({ accentColor }) {
  return (
    <svg width="260" height="220" viewBox="0 0 260 220" fill="none">
      <defs>
        <radialGradient id="s3-outer" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#88ffee" />
          <stop offset="45%" stopColor="#00ccaa" />
          <stop offset="100%" stopColor="#003344" />
        </radialGradient>
        <radialGradient id="s3-mantle" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#ff9944" />
          <stop offset="60%" stopColor="#cc4400" />
          <stop offset="100%" stopColor="#661100" />
        </radialGradient>
        <radialGradient id="s3-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#ffffff" />
          <stop offset="30%" stopColor="#ffdd44" />
          <stop offset="100%" stopColor="#ff4400" />
        </radialGradient>
        <filter id="s3-heat">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <clipPath id="s3-half">
          <rect x="130" y="0" width="130" height="220" />
        </clipPath>
      </defs>

      {/* Full planet (left half shown solid) */}
      <circle cx="130" cy="110" r="95" fill="url(#s3-outer)" />
      {/* Mantle layer (right half cross-section) */}
      <circle cx="130" cy="110" r="95" fill="url(#s3-outer)" clipPath="url(#s3-half)" />
      {/* Show interior on right half */}
      <circle cx="130" cy="110" r="72" fill="url(#s3-mantle)" clipPath="url(#s3-half)" />
      <circle cx="130" cy="110" r="38" fill="url(#s3-core)" clipPath="url(#s3-half)" filter="url(#s3-heat)" />

      {/* Cut line */}
      <line x1="130" y1="15" x2="130" y2="205" stroke="#ffaa44" strokeWidth="1.5" strokeOpacity="0.8" strokeDasharray="6,3" />

      {/* Crack lines radiating from core */}
      {[
        [130,110, 175,55],
        [130,110, 200,105],
        [130,110, 170,162],
        [130,110, 155,185],
      ].map(([x1,y1,x2,y2], i) => (
        <motion.line
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#ff4400"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity, repeatDelay: 2 }}
          style={{ filter: 'drop-shadow(0 0 3px #ff6600)' }}
        />
      ))}

      {/* City silhouettes on surface (left side) */}
      {[
        [48,30],[55,18],[62,28],[70,24],[78,30],
      ].map(([cx, cy], i) => (
        <rect key={i} x={45 + i*8} y={cy} width="5" height={30 - cy + 15} fill="#224433" opacity="0.8" />
      ))}

      {/* Tremor wave rings */}
      <circle cx="130" cy="110" r="45"  stroke="#ff6600" strokeWidth="1"   fill="none" strokeOpacity="0.3" strokeDasharray="4,4" />
      <circle cx="130" cy="110" r="60"  stroke="#ff4400" strokeWidth="0.8" fill="none" strokeOpacity="0.2" strokeDasharray="5,5" />
      <circle cx="130" cy="110" r="78"  stroke="#ff2200" strokeWidth="0.6" fill="none" strokeOpacity="0.15" strokeDasharray="6,6" />

      {/* Core glow aura */}
      <circle cx="130" cy="110" r="44" fill="#ff8800" opacity="0.15" filter="url(#s3-heat)" />

      {/* Layer labels */}
      <text x="145" y="78" fill="#ff9944" fontSize="9" fontFamily="monospace" opacity="0.8">MANTLE</text>
      <text x="148" y="112" fill="#ffdd44" fontSize="8" fontFamily="monospace" opacity="0.9">CORE</text>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Slide 4: Scientist character ─────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
function SlideScientist({ accentColor }) {
  return (
    <svg width="280" height="220" viewBox="0 0 280 220" fill="none">
      <defs>
        <radialGradient id="s4-device" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#ffffff" />
          <stop offset="40%" stopColor="#ff4466" />
          <stop offset="100%" stopColor="#aa0033" />
        </radialGradient>
        <filter id="s4-glow">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background — dark lab silhouette */}
      <rect x="0" y="140" width="280" height="80" fill="#0a0a1a" opacity="0.8" />
      <rect x="0" y="139" width="280" height="2" fill="#334455" opacity="0.6" />
      {/* Lab equipment silhouettes */}
      <rect x="10" y="115" width="30" height="26" fill="#111122" rx="2" opacity="0.9" />
      <rect x="16" y="108" width="18" height="8" fill="#112233" rx="1" opacity="0.9" />
      <rect x="230" y="118" width="40" height="23" fill="#111122" rx="2" opacity="0.9" />
      {/* Screen lines on equipment */}
      {[120,126,132].map(y => (
        <line key={y} x1="14" y1={y} x2="36" y2={y} stroke="#00ffcc" strokeWidth="1" opacity="0.3" />
      ))}

      {/* Character body — Scientist Vela */}
      {/* Lab coat */}
      <path d="M120,100 L100,200 L180,200 L160,100 Z" fill="#ddeeff" opacity="0.9" />
      {/* Coat lapels */}
      <path d="M140,100 L125,130 L140,140 Z" fill="#bbccdd" opacity="0.9" />
      <path d="M140,100 L155,130 L140,140 Z" fill="#bbccdd" opacity="0.9" />
      {/* Belt line */}
      <rect x="104" y="158" width="72" height="6" fill="#aabbcc" rx="2" opacity="0.7" />

      {/* Head */}
      <circle cx="140" cy="78" r="26" fill="#e8c4a0" />
      {/* Hair */}
      <path d="M114,70 Q115,50 140,52 Q165,50 166,70" fill="#332211" />
      {/* Eyes */}
      <ellipse cx="131" cy="74" rx="4" ry="4.5" fill="#1a1a2a" />
      <ellipse cx="149" cy="74" rx="4" ry="4.5" fill="#1a1a2a" />
      <circle cx="132" cy="73" r="1.5" fill="white" />
      <circle cx="150" cy="73" r="1.5" fill="white" />
      {/* Concerned eyebrows */}
      <path d="M126,67 Q131,64 136,67" stroke="#332211" strokeWidth="2" fill="none" />
      <path d="M144,67 Q149,64 154,67" stroke="#332211" strokeWidth="2" fill="none" />
      {/* Mouth — open, speaking */}
      <path d="M133,84 Q140,89 147,84" stroke="#aa6644" strokeWidth="2" fill="none" />

      {/* Arm reaching out holding device */}
      <path d="M104,120 L72,148" stroke="#e8c4a0" strokeWidth="14" strokeLinecap="round" />
      {/* Glowing device in hand */}
      <g transform="translate(56,140)" filter="url(#s4-glow)">
        <rect x="0" y="0" width="28" height="18" rx="4" fill="#220022" stroke="#ff4466" strokeWidth="1.5" />
        <circle cx="14" cy="9" r="6" fill="url(#s4-device)" />
        {/* Pulsing alert rings */}
        <circle cx="14" cy="9" r="9"  stroke="#ff4466" strokeWidth="1" fill="none" strokeOpacity="0.6" />
        <circle cx="14" cy="9" r="12" stroke="#ff4466" strokeWidth="0.8" fill="none" strokeOpacity="0.3" />
      </g>

      {/* Other arm */}
      <path d="M174,120 L190,155" stroke="#e8c4a0" strokeWidth="14" strokeLinecap="round" />

      {/* Name badge */}
      <rect x="127" y="144" width="36" height="14" rx="2" fill="#0055aa" opacity="0.8" />
      <text x="145" y="154" textAnchor="middle" fill="white" fontSize="7" fontFamily="monospace">VELA</text>

      {/* Speech bubble indicator dots */}
      {[0,1,2].map(i => (
        <motion.circle
          key={i}
          cx={190 + i * 10}
          cy={55}
          r="3.5"
          fill="#ff4466"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, delay: i * 0.3, repeat: Infinity }}
        />
      ))}
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Slide 5: Spaceship Blueprint ─────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
function SlideSpaceship({ accentColor }) {
  return (
    <svg width="340" height="210" viewBox="0 0 340 210" fill="none">
      <defs>
        <filter id="s5-bp">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Blueprint grid background */}
      <rect x="0" y="0" width="340" height="210" fill="#001830" rx="6" />
      {/* Grid lines */}
      {Array.from({length: 22}).map((_,i) => (
        <line key={`v${i}`} x1={i*16} y1="0" x2={i*16} y2="210" stroke="#0044aa" strokeWidth="0.4" strokeOpacity="0.5" />
      ))}
      {Array.from({length: 14}).map((_,i) => (
        <line key={`h${i}`} x1="0" y1={i*16} x2="340" y2={i*16} stroke="#0044aa" strokeWidth="0.4" strokeOpacity="0.5" />
      ))}

      {/* Blueprint border */}
      <rect x="4" y="4" width="332" height="202" stroke="#1166cc" strokeWidth="1.5" fill="none" rx="4" strokeOpacity="0.7" />

      {/* Ship body - main fuselage */}
      <path
        d="M170,30 L210,70 L215,140 L170,155 L125,140 L125,70 Z"
        stroke="#44aaff"
        strokeWidth="1.8"
        fill="#002244"
        filter="url(#s5-bp)"
      />

      {/* Ship nose cone */}
      <path d="M145,70 L170,30 L195,70" stroke="#44aaff" strokeWidth="1.8" fill="#001833" filter="url(#s5-bp)" />

      {/* Bridge / cockpit dome */}
      <ellipse cx="170" cy="72" rx="20" ry="12" stroke="#88ddff" strokeWidth="1.5" fill="#001a33" filter="url(#s5-bp)" />
      <ellipse cx="170" cy="70" rx="12" ry="7" fill="#003366" opacity="0.8" />

      {/* Main wings */}
      <path d="M125,95 L80,130 L80,145 L125,130 Z" stroke="#44aaff" strokeWidth="1.5" fill="#001833" filter="url(#s5-bp)" />
      <path d="M215,95 L260,130 L260,145 L215,130 Z" stroke="#44aaff" strokeWidth="1.5" fill="#001833" filter="url(s5-bp)" />

      {/* Engine nacelles */}
      <ellipse cx="88"  cy="148" rx="14" ry="7" stroke="#44aaff" strokeWidth="1.5" fill="#001122" />
      <ellipse cx="252" cy="148" rx="14" ry="7" stroke="#44aaff" strokeWidth="1.5" fill="#001122" />

      {/* Engine glow */}
      <ellipse cx="88"  cy="152" rx="8" ry="4" fill="#4488ff" opacity="0.5" filter="url(#s5-bp)" />
      <ellipse cx="252" cy="152" rx="8" ry="4" fill="#4488ff" opacity="0.5" filter="url(#s5-bp)" />

      {/* Thruster main */}
      <ellipse cx="170" cy="158" rx="22" ry="10" stroke="#44aaff" strokeWidth="1.5" fill="#001122" />
      <ellipse cx="170" cy="162" rx="14" ry="6" fill="#2266ff" opacity="0.6" filter="url(#s5-bp)" />

      {/* Detail lines on fuselage */}
      <line x1="145" y1="90" x2="195" y2="90" stroke="#44aaff" strokeWidth="0.8" strokeOpacity="0.6" strokeDasharray="4,3" />
      <line x1="140" y1="110" x2="200" y2="110" stroke="#44aaff" strokeWidth="0.8" strokeOpacity="0.6" strokeDasharray="4,3" />
      <line x1="138" y1="128" x2="202" y2="128" stroke="#44aaff" strokeWidth="0.8" strokeOpacity="0.6" strokeDasharray="4,3" />

      {/* Annotation lines */}
      <line x1="80" y1="100" x2="60" y2="80" stroke="#88ccff" strokeWidth="0.8" strokeOpacity="0.5" />
      <text x="10" y="77" fill="#88ccff" fontSize="8" fontFamily="monospace" opacity="0.8">WINGS</text>

      <line x1="260" y1="148" x2="290" y2="138" stroke="#88ccff" strokeWidth="0.8" strokeOpacity="0.5" />
      <text x="292" y="142" fill="#88ccff" fontSize="8" fontFamily="monospace" opacity="0.8">ION</text>
      <text x="292" y="152" fill="#88ccff" fontSize="8" fontFamily="monospace" opacity="0.8">DRIVE</text>

      <line x1="170" y1="30" x2="220" y2="14" stroke="#88ccff" strokeWidth="0.8" strokeOpacity="0.5" />
      <text x="222" y="18" fill="#88ccff" fontSize="8" fontFamily="monospace" opacity="0.8">ODYSSEY-1</text>

      {/* Title on blueprint */}
      <text x="170" y="200" textAnchor="middle" fill="#2277cc" fontSize="9" fontFamily="monospace" opacity="0.8" letterSpacing="2">OPERATION ODYSSEY - CLASSIFIED</text>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Slide 6: Space with mystery planet ───────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
function SlideMission({ accentColor }) {
  return (
    <svg width="320" height="220" viewBox="0 0 320 220" fill="none">
      <defs>
        <radialGradient id="s6-planet" cx="50%" cy="40%" r="55%">
          <stop offset="0%"  stopColor="#ccaaff" />
          <stop offset="50%" stopColor="#663399" />
          <stop offset="100%" stopColor="#220044" />
        </radialGradient>
        <radialGradient id="s6-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#aa88ff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <filter id="s6-haze">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="s6-soft">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Stars */}
      {[
        [20,30],[50,15],[80,40],[110,10],[145,35],[200,20],[240,45],[280,15],[310,35],
        [35,80],[90,70],[160,75],[220,90],[270,65],[300,80],
        [15,150],[70,140],[130,160],[190,145],[250,155],[305,140],
      ].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r={i%3===0?1.5:1} fill="white" opacity={0.3+((i*7)%5)*0.1} />
      ))}

      {/* Distant planet glow */}
      <circle cx="160" cy="110" r="80" fill="url(#s6-glow)" filter="url(#s6-haze)" />

      {/* Main mystery planet */}
      <circle cx="160" cy="110" r="60" fill="url(#s6-planet)" />
      {/* Planet atmosphere haze */}
      <circle cx="160" cy="110" r="63" stroke="#aa88ff" strokeWidth="5" fill="none" strokeOpacity="0.25" />
      <circle cx="160" cy="110" r="68" stroke="#aa88ff" strokeWidth="3" fill="none" strokeOpacity="0.1" />

      {/* Surface features (continents) */}
      <clipPath id="s6-clip"><circle cx="160" cy="110" r="60" /></clipPath>
      <g clipPath="url(#s6-clip)" opacity="0.5">
        <path d="M140,85 Q155,78 170,88 Q180,95 175,108 Q165,115 150,110 Q138,103 140,85 Z" fill="#8844cc" />
        <path d="M125,120 Q135,112 148,118 Q155,126 145,135 Q132,138 125,128 Z" fill="#7733bb" />
        <path d="M170,130 Q180,122 190,128 Q198,138 190,148 Q178,152 170,142 Z" fill="#6622aa" />
      </g>

      {/* Question mark overlay on planet */}
      <text
        x="160" y="125"
        textAnchor="middle"
        fontSize="48"
        fill="rgba(255,255,255,0.08)"
        fontFamily="monospace"
        fontWeight="900"
      >?</text>
      <text
        x="160" y="125"
        textAnchor="middle"
        fontSize="40"
        fill="rgba(200,170,255,0.25)"
        fontFamily="monospace"
        fontWeight="900"
        filter="url(#s6-soft)"
      >?</text>

      {/* Specular highlight */}
      <ellipse cx="140" cy="88" rx="16" ry="10" fill="rgba(255,255,255,0.2)" transform="rotate(-25 140 88)" />

      {/* Small spaceship silhouette approaching */}
      <g transform="translate(38, 65) rotate(-20)" filter="url(#s6-soft)">
        <path d="M0,5 L18,0 L18,10 L0,5 Z" fill="#88ccff" opacity="0.8" />
        <path d="M14,2 L22,5 L14,8 Z" fill="#aaddff" opacity="0.7" />
        <ellipse cx="3" cy="5" rx="5" ry="2.5" fill="#4488ff" opacity="0.6" />
      </g>
      {/* Ship trail */}
      <path d="M60,88 Q100,100 140,108" stroke="#4488ff" strokeWidth="1.5" fill="none" strokeOpacity="0.3" strokeDasharray="4,5" />

      {/* 2 billion people counter */}
      <text x="160" y="198" textAnchor="middle" fill="#aa88ff" fontSize="10" fontFamily="monospace" letterSpacing="2" opacity="0.8">2,000,000,000 LIVES</text>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Slide 7: Captain Badge / Star ────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
function SlideCaptain({ accentColor }) {
  return (
    <svg width="260" height="220" viewBox="0 0 260 220" fill="none">
      <defs>
        <radialGradient id="s7-badge" cx="50%" cy="40%" r="60%">
          <stop offset="0%"  stopColor="#ffffaa" />
          <stop offset="35%" stopColor="#ffcc00" />
          <stop offset="100%" stopColor="#886600" />
        </radialGradient>
        <radialGradient id="s7-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#ffdd44" stopOpacity="0.5" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="s7-shine">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="s7-soft">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background glow circle */}
      <circle cx="130" cy="108" r="90" fill="url(#s7-glow)" filter="url(#s7-shine)" />

      {/* Outer ring decoration */}
      <circle cx="130" cy="108" r="82" stroke="#ffcc00" strokeWidth="1.5" fill="none" strokeOpacity="0.3" strokeDasharray="6,4" />
      <circle cx="130" cy="108" r="76" stroke="#ffcc00" strokeWidth="0.8" fill="none" strokeOpacity="0.2" />

      {/* Badge shield shape */}
      <path
        d="M130,22 L190,50 L190,108 Q190,158 130,182 Q70,158 70,108 L70,50 Z"
        fill="url(#s7-badge)"
        filter="url(#s7-soft)"
      />
      {/* Shield inner border */}
      <path
        d="M130,32 L180,57 L180,108 Q180,150 130,170 Q80,150 80,108 L80,57 Z"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1.5"
        fill="none"
      />

      {/* 5-point star center */}
      <polygon
        points="130,58 137,80 160,80 142,93 149,115 130,102 111,115 118,93 100,80 123,80"
        fill="rgba(255,255,255,0.9)"
        filter="url(#s7-soft)"
      />

      {/* Inner star detail */}
      <polygon
        points="130,65 134,78 148,78 137,86 141,100 130,92 119,100 123,86 112,78 126,78"
        fill="#ffcc00"
      />

      {/* CAPTAIN text */}
      <text x="130" y="135" textAnchor="middle" fill="rgba(100,60,0,0.9)" fontSize="13" fontFamily="monospace" fontWeight="900" letterSpacing="3">CAPTAIN</text>

      {/* Rank pips row */}
      {[0,1,2,3].map(i => (
        <circle key={i} cx={109 + i*14} cy={150} r="5" fill="#cc8800" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      ))}

      {/* Sparkle accents */}
      {[
        [45,40],[215,35],[35,170],[225,165],[130,12],
      ].map(([cx,cy],i) => (
        <g key={i} transform={`translate(${cx},${cy})`} opacity="0.7">
          <motion.g
            animate={{ rotate: 360, scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: 'linear' }}
          >
            <line x1="0" y1="-7" x2="0" y2="7" stroke="#ffdd44" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-7" y1="0" x2="7" y2="0" stroke="#ffdd44" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-5" y1="-5" x2="5" y2="5" stroke="#ffdd44" strokeWidth="1" strokeLinecap="round" />
            <line x1="5" y1="-5" x2="-5" y2="5" stroke="#ffdd44" strokeWidth="1" strokeLinecap="round" />
          </motion.g>
        </g>
      ))}

      {/* "?" overlay — your name will go here */}
      <text x="130" y="172" textAnchor="middle" fill="rgba(100,60,0,0.5)" fontSize="9" fontFamily="monospace" letterSpacing="2">AWAITING CAPTAIN</text>
    </svg>
  );
}
