import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// ── CSS keyframes (scoped with zc- prefix) ─────────────────────────────────
const ZC_KEYFRAMES = `
@keyframes zc-antennaPulse {
  0%,100% { filter: drop-shadow(0 0 4px #00ffee) drop-shadow(0 0 8px #00ffee); opacity: 1; }
  50%     { filter: drop-shadow(0 0 10px #00ffee) drop-shadow(0 0 20px #7effff); opacity: 0.85; }
}
@keyframes zc-bodyPulse {
  0%,100% { filter: drop-shadow(0 0 6px rgba(0,200,180,0.5)); }
  50%     { filter: drop-shadow(0 0 14px rgba(0,255,220,0.8)); }
}
@keyframes zc-sparkle {
  0%    { opacity: 0; transform: scale(0) rotate(0deg); }
  40%   { opacity: 1; transform: scale(1) rotate(90deg); }
  100%  { opacity: 0; transform: scale(1.5) rotate(180deg); }
}
@keyframes zc-thoughtDot {
  0%,100% { opacity: 0.3; }
  50%     { opacity: 1; }
}
@keyframes zc-eyeBlink {
  0%,90%,100% { scaleY: 1; }
  95%         { scaleY: 0.05; }
}
@keyframes zc-mouthHappy {
  0%,100% { d: path('M 38 68 Q 50 76 62 68'); }
}
`;

// ── Inject keyframes once ──────────────────────────────────────────────────
let zcStyleInjected = false;
function ensureZcStyles() {
  if (zcStyleInjected) return;
  const style = document.createElement('style');
  style.textContent = ZC_KEYFRAMES;
  document.head.appendChild(style);
  zcStyleInjected = true;
}

// ── Sparkle ring rendered around Zyro when celebrating ───────────────────
const SPARKLE_POSITIONS = [
  { x: -0.8, y: -0.9, delay: 0 },
  { x:  0.8, y: -0.9, delay: 0.15 },
  { x: -1.1, y:  0,   delay: 0.3 },
  { x:  1.1, y:  0,   delay: 0.08 },
  { x: -0.8, y:  0.9, delay: 0.22 },
  { x:  0.8, y:  0.9, delay: 0.38 },
  { x:  0,   y: -1.2, delay: 0.1 },
  { x:  0,   y:  1.1, delay: 0.45 },
];

function SparkleRing({ size }) {
  const r = size * 0.7;
  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', pointerEvents: 'none' }}>
      {SPARKLE_POSITIONS.map((sp, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 8,
            height: 8,
            top: sp.y * r,
            left: sp.x * r,
            translateX: '-50%',
            translateY: '-50%',
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatDelay: 0.4,
            delay: sp.delay,
            ease: 'easeInOut',
          }}
        >
          {/* 4-pointed star sparkle */}
          <svg width="8" height="8" viewBox="0 0 8 8">
            <polygon
              points="4,0 5,3 8,4 5,5 4,8 3,5 0,4 3,3"
              fill="#ffe844"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

// ── Thought bubble for 'thinking' emotion ─────────────────────────────────
function ThoughtBubble({ size }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.6, y: 6 }}
      style={{
        position: 'absolute',
        top: -size * 0.55,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 3,
        flexDirection: 'column',
        pointerEvents: 'none',
      }}
    >
      {/* Bubble dots trailing up */}
      <div style={{ display: 'flex', gap: 3, marginLeft: size * 0.2 }}>
        {[6, 8, 10].map((sz, i) => (
          <motion.div
            key={i}
            style={{
              width: sz, height: sz,
              borderRadius: '50%',
              background: 'rgba(0,255,220,0.25)',
              border: '1px solid rgba(0,255,220,0.6)',
            }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, delay: i * 0.18, repeat: Infinity }}
          />
        ))}
      </div>
      {/* Main thought cloud */}
      <div
        style={{
          background: 'rgba(5,20,30,0.92)',
          border: '1.5px solid rgba(0,255,220,0.55)',
          borderRadius: 14,
          padding: '6px 12px',
          color: '#7effee',
          fontFamily: 'monospace',
          fontSize: 16,
          letterSpacing: 3,
          boxShadow: '0 0 12px rgba(0,255,220,0.25)',
        }}
      >
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
        >
          • • •
        </motion.span>
      </div>
    </motion.div>
  );
}

// ── Speech bubble with typewriter effect ──────────────────────────────────
function SpeechBubble({ message, size, onDone }) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    // Reset on message change
    indexRef.current = 0;
    setDisplayed('');

    if (!message) return;

    const tick = () => {
      if (indexRef.current < message.length) {
        indexRef.current += 1;
        setDisplayed(message.slice(0, indexRef.current));
        timerRef.current = setTimeout(tick, 28);
      } else {
        onDone?.();
      }
    };

    timerRef.current = setTimeout(tick, 40);
    return () => clearTimeout(timerRef.current);
  }, [message]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!message) return null;

  const bubbleWidth = Math.max(200, size * 2.2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.9 }}
      style={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: 12,
        width: bubbleWidth,
        background: 'rgba(4, 18, 28, 0.97)',
        border: '1.5px solid rgba(0, 255, 200, 0.6)',
        borderRadius: 12,
        padding: '10px 14px',
        pointerEvents: 'none',
        zIndex: 10,
        boxShadow: '0 0 20px rgba(0,255,200,0.2), 0 4px 12px rgba(0,0,0,0.5)',
      }}
    >
      <p
        style={{
          margin: 0,
          color: '#d0fff6',
          fontFamily: "'Courier New', monospace",
          fontSize: Math.max(11, size * 0.105),
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
        }}
      >
        {displayed}
        {/* Blinking cursor while typing */}
        {displayed.length < message.length && (
          <motion.span
            style={{ color: '#00ffcc', fontWeight: 'bold' }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            |
          </motion.span>
        )}
      </p>
      {/* Tail pointing down toward Zyro */}
      <div
        style={{
          position: 'absolute',
          bottom: -9,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '9px solid transparent',
          borderRight: '9px solid transparent',
          borderTop: '9px solid rgba(0, 255, 200, 0.6)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -7,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid rgba(4, 18, 28, 0.97)',
        }}
      />
    </motion.div>
  );
}

// ── Zyro SVG body ─────────────────────────────────────────────────────────
function ZyroSVG({ size, emotion, blinking }) {
  // Derive geometry from size
  const cx = size / 2;
  const cy = size * 0.55;
  const bodyR = size * 0.32;

  // Eye positions
  const eyeOffsetX = size * 0.1;
  const eyeOffsetY = size * 0.08;
  const eyeRx = size * 0.075;
  const eyeRy = blinking ? size * 0.005 : size * 0.085;

  // Pupil
  const pupilR = size * 0.038;

  // Mouth path based on emotion
  const mouthY = cy + bodyR * 0.35;
  const mouthX1 = cx - size * 0.1;
  const mouthX2 = cx + size * 0.1;
  const mouthQy = {
    happy:     mouthY + size * 0.055,
    celebrating: mouthY + size * 0.07,
    thinking:  mouthY + size * 0.005,
    concerned: mouthY - size * 0.04,
  }[emotion] ?? mouthY + size * 0.055;

  // Antenna stem endpoints
  const antLx = cx - size * 0.12;
  const antRx = cx + size * 0.12;
  const antTopY = cy - bodyR - size * 0.28;
  const antBaseY = cy - bodyR + size * 0.06;

  // Tentacle arms (4 arms, 2 left, 2 right)
  const arms = [
    // left top
    { sx: cx - bodyR * 0.85, sy: cy - bodyR * 0.2, ex: cx - bodyR * 1.55, ey: cy - bodyR * 0.6, cpx: cx - bodyR * 1.4, cpy: cy - bodyR * 0.5 },
    // left bottom
    { sx: cx - bodyR * 0.9,  sy: cy + bodyR * 0.2, ex: cx - bodyR * 1.6,  ey: cy + bodyR * 0.5, cpx: cx - bodyR * 1.5, cpy: cy - bodyR * 0.05 },
    // right top
    { sx: cx + bodyR * 0.85, sy: cy - bodyR * 0.2, ex: cx + bodyR * 1.55, ey: cy - bodyR * 0.6, cpx: cx + bodyR * 1.4, cpy: cy - bodyR * 0.5 },
    // right bottom
    { sx: cx + bodyR * 0.9,  sy: cy + bodyR * 0.2, ex: cx + bodyR * 1.6,  ey: cy + bodyR * 0.5, cpx: cx + bodyR * 1.5, cpy: cy - bodyR * 0.05 },
  ];

  // Finger blobs at arm tips (3-fingered)
  const fingers = arms.map(arm => {
    const spread = size * 0.055;
    const tipX = arm.ex;
    const tipY = arm.ey;
    return [
      { cx: tipX - spread * 0.6, cy: tipY - spread * 0.3 },
      { cx: tipX,                cy: tipY - spread * 0.5 },
      { cx: tipX + spread * 0.6, cy: tipY - spread * 0.3 },
    ];
  });

  // Celebrating spin handled by framer wrapper; just draw normally

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Zyro the alien tutor"
      style={{ overflow: 'visible', animation: 'zc-bodyPulse 3s ease-in-out infinite' }}
    >
      <defs>
        <radialGradient id="zc-bodyGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%"   stopColor="#2affd0" />
          <stop offset="60%"  stopColor="#00b89c" />
          <stop offset="100%" stopColor="#006b5c" />
        </radialGradient>
        <radialGradient id="zc-eyeGrad" cx="40%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#e0fff8" />
          <stop offset="100%" stopColor="#7effee" />
        </radialGradient>
        <radialGradient id="zc-pupilGrad" cx="35%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#1a2060" />
          <stop offset="100%" stopColor="#060820" />
        </radialGradient>
        <filter id="zc-glowFilter" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ── Tentacle arms (drawn behind body) ── */}
      {arms.map((arm, i) => (
        <g key={i}>
          <path
            d={`M ${arm.sx} ${arm.sy} Q ${arm.cpx} ${arm.cpy} ${arm.ex} ${arm.ey}`}
            stroke="#00c8aa"
            strokeWidth={size * 0.045}
            strokeLinecap="round"
            fill="none"
          />
          {/* Finger tips */}
          {fingers[i].map((f, fi) => (
            <circle
              key={fi}
              cx={f.cx}
              cy={f.cy}
              r={size * 0.038}
              fill="#1affc0"
              stroke="#00ffcc"
              strokeWidth={size * 0.012}
            />
          ))}
        </g>
      ))}

      {/* ── Body (main circle) ── */}
      <circle
        cx={cx}
        cy={cy}
        r={bodyR}
        fill="url(#zc-bodyGrad)"
        stroke="#00ffcc"
        strokeWidth={size * 0.018}
      />

      {/* ── Body highlight ── */}
      <ellipse
        cx={cx - bodyR * 0.22}
        cy={cy - bodyR * 0.3}
        rx={bodyR * 0.38}
        ry={bodyR * 0.22}
        fill="rgba(255,255,255,0.18)"
      />

      {/* ── Antenna stems ── */}
      <line
        x1={antLx} y1={antBaseY}
        x2={antLx - size * 0.04} y2={antTopY}
        stroke="#00c8aa"
        strokeWidth={size * 0.025}
        strokeLinecap="round"
      />
      <line
        x1={antRx} y1={antBaseY}
        x2={antRx + size * 0.04} y2={antTopY}
        stroke="#00c8aa"
        strokeWidth={size * 0.025}
        strokeLinecap="round"
      />

      {/* ── Antenna orbs (glowing) ── */}
      <circle
        cx={antLx - size * 0.04}
        cy={antTopY}
        r={size * 0.055}
        fill="#00ffee"
        style={{ animation: 'zc-antennaPulse 2.2s ease-in-out infinite' }}
      />
      <circle
        cx={antRx + size * 0.04}
        cy={antTopY}
        r={size * 0.055}
        fill="#00ffee"
        style={{ animation: 'zc-antennaPulse 2.2s ease-in-out infinite 0.6s' }}
      />
      {/* Orb inner gleam */}
      <circle cx={antLx - size * 0.04 - size * 0.02} cy={antTopY - size * 0.02} r={size * 0.02} fill="white" opacity={0.7} />
      <circle cx={antRx + size * 0.04 - size * 0.02} cy={antTopY - size * 0.02} r={size * 0.02} fill="white" opacity={0.7} />

      {/* ── Eyes ── */}
      {/* Left eye white */}
      <ellipse
        cx={cx - eyeOffsetX}
        cy={cy - eyeOffsetY}
        rx={eyeRx}
        ry={eyeRy}
        fill="url(#zc-eyeGrad)"
        stroke="#00e0c0"
        strokeWidth={size * 0.012}
      />
      {/* Right eye white */}
      <ellipse
        cx={cx + eyeOffsetX}
        cy={cy - eyeOffsetY}
        rx={eyeRx}
        ry={eyeRy}
        fill="url(#zc-eyeGrad)"
        stroke="#00e0c0"
        strokeWidth={size * 0.012}
      />
      {/* Pupils (hide when blinking) */}
      {!blinking && (
        <>
          <circle
            cx={cx - eyeOffsetX + size * 0.01}
            cy={cy - eyeOffsetY + size * 0.01}
            r={pupilR}
            fill="url(#zc-pupilGrad)"
          />
          <circle
            cx={cx + eyeOffsetX + size * 0.01}
            cy={cy - eyeOffsetY + size * 0.01}
            r={pupilR}
            fill="url(#zc-pupilGrad)"
          />
          {/* Eye shine */}
          <circle cx={cx - eyeOffsetX - size * 0.018} cy={cy - eyeOffsetY - size * 0.025} r={size * 0.016} fill="white" opacity={0.8} />
          <circle cx={cx + eyeOffsetX - size * 0.018} cy={cy - eyeOffsetY - size * 0.025} r={size * 0.016} fill="white" opacity={0.8} />
        </>
      )}

      {/* ── Mouth ── */}
      <path
        d={`M ${mouthX1} ${mouthY} Q ${cx} ${mouthQy} ${mouthX2} ${mouthY}`}
        stroke="#006b5c"
        strokeWidth={size * 0.028}
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Belly pattern (decorative dots) ── */}
      <circle cx={cx - size * 0.07} cy={cy + bodyR * 0.28} r={size * 0.025} fill="rgba(0,0,0,0.2)" />
      <circle cx={cx}              cy={cy + bodyR * 0.35} r={size * 0.025} fill="rgba(0,0,0,0.2)" />
      <circle cx={cx + size * 0.07} cy={cy + bodyR * 0.28} r={size * 0.025} fill="rgba(0,0,0,0.2)" />
    </svg>
  );
}

// ── Main ZyroCharacter component ──────────────────────────────────────────
/**
 * ZyroCharacter — Friendly alien tutor component.
 *
 * Props:
 *   message   {string}   — Text shown in speech bubble (typewriter effect)
 *   emotion   {string}   — 'happy' | 'thinking' | 'celebrating' | 'concerned'
 *   size      {number}   — Zyro body size in px (default 120)
 *   onDone    {function} — Called when typewriter finishes
 */
export default function ZyroCharacter({
  message = '',
  emotion = 'happy',
  size = 120,
  onDone,
}) {
  const [blinking, setBlinking] = useState(false);

  // Inject CSS once on mount
  useEffect(() => {
    ensureZcStyles();
  }, []);

  // Blink every 3 seconds
  useEffect(() => {
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
    };
    const id = setInterval(blink, 3000);
    return () => clearInterval(id);
  }, []);

  // Bob animation (framer-motion)
  const bobVariants = {
    bob: {
      y: [0, -10, 0],
      transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  // Celebrating: add spin
  const celebrateVariants = {
    celebrate: {
      rotate: [0, 15, -15, 12, -12, 0],
      y: [0, -14, 0, -10, 0],
      transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const motionVariant = emotion === 'celebrating' ? 'celebrate' : 'bob';
  const activeVariants = emotion === 'celebrating' ? celebrateVariants : bobVariants;

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        width: size * 3.4,  // wide enough for speech bubble
        textAlign: 'center',
      }}
    >
      {/* Speech bubble / thought bubble */}
      <AnimatePresence>
        {message && emotion !== 'thinking' && (
          <SpeechBubble
            key={message}
            message={message}
            size={size}
            onDone={onDone}
          />
        )}
        {emotion === 'thinking' && (
          <ThoughtBubble key="thought" size={size} />
        )}
      </AnimatePresence>

      {/* Zyro body wrapper — centered within the wide container */}
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          width: size * 3.4,
          height: size * 1.15,
        }}
      >
        {/* Celebrating sparkles */}
        <AnimatePresence>
          {emotion === 'celebrating' && (
            <SparkleRing key="sparkles" size={size} />
          )}
        </AnimatePresence>

        {/* Zyro with bob / celebrate motion */}
        <motion.div
          variants={activeVariants}
          animate={motionVariant}
          style={{
            display: 'inline-block',
            position: 'absolute',
            left: '50%',
            top: 0,
            translateX: '-50%',
          }}
        >
          {emotion === 'celebrating' ? (
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
            >
              <ZyroSVG size={size} emotion={emotion} blinking={blinking} />
            </motion.div>
          ) : (
            <ZyroSVG size={size} emotion={emotion} blinking={blinking} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
