import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useGame, SCENES } from '../context/GameContext';

// ── Phase constants ───────────────────────────────────────────────────────────
// 0 = idle/title+ship shown  1 = countdown  2 = launch  3 = warp  4 = destination
const PHASE = { TITLE: 0, COUNTDOWN: 1, LAUNCH: 2, WARP: 3, DESTINATION: 4 };

// ── CSS keyframe injection ────────────────────────────────────────────────────
const CSS_KEYFRAMES = `
@keyframes enginePulse {
  0%   { opacity: 0.7; transform: scaleX(1)   scaleY(1);   }
  50%  { opacity: 1.0; transform: scaleX(1.15) scaleY(1.2); }
  100% { opacity: 0.7; transform: scaleX(1)   scaleY(1);   }
}
@keyframes enginePulse2 {
  0%   { opacity: 0.4; r: 8;  }
  50%  { opacity: 0.9; r: 13; }
  100% { opacity: 0.4; r: 8;  }
}
@keyframes screenShake {
  0%   { transform: translate(0,    0); }
  10%  { transform: translate(-4px, 2px); }
  20%  { transform: translate(4px, -3px); }
  30%  { transform: translate(-3px, 4px); }
  40%  { transform: translate(3px,  3px); }
  50%  { transform: translate(-2px,-2px); }
  60%  { transform: translate(2px,  3px); }
  70%  { transform: translate(-3px,-1px); }
  80%  { transform: translate(1px,  2px); }
  90%  { transform: translate(-1px,-3px); }
  100% { transform: translate(0,    0); }
}
@keyframes starStream {
  0%   { transform: translateY(0)    scaleY(1); }
  100% { transform: translateY(60px) scaleY(4); }
}
@keyframes countdownPulse {
  0%   { transform: scale(0.4); opacity: 0; }
  40%  { transform: scale(1.3); opacity: 1; }
  70%  { transform: scale(1.0); opacity: 1; }
  100% { transform: scale(1.0); opacity: 1; }
}
@keyframes coordScroll {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}
@keyframes exhaustFlicker {
  0%,100% { opacity: 0.85; transform: scaleX(0.95); }
  33%     { opacity: 1.0;  transform: scaleX(1.05); }
  66%     { opacity: 0.7;  transform: scaleX(0.9); }
}
@keyframes glowIntensify {
  0%   { filter: drop-shadow(0 0 8px  #ff6600) drop-shadow(0 0 15px #ff4400); }
  50%  { filter: drop-shadow(0 0 20px #ff8800) drop-shadow(0 0 40px #ffaa00); }
  100% { filter: drop-shadow(0 0 40px #ffffff) drop-shadow(0 0 60px #ffee88); }
}
`;

// ── Odyssey spaceship SVG ─────────────────────────────────────────────────────
function OdysseyShip({ phase }) {
  const launching = phase >= PHASE.LAUNCH;
  const warp = phase >= PHASE.WARP;

  return (
    <svg
      width="120"
      height="220"
      viewBox="0 0 120 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: launching
          ? 'drop-shadow(0 0 30px #ffffff) drop-shadow(0 0 60px #ffee88)'
          : 'drop-shadow(0 0 12px rgba(68,136,255,0.6))',
        animation: launching ? 'glowIntensify 0.5s ease-out forwards' : 'none',
        transition: 'filter 0.4s ease',
      }}
      aria-hidden="true"
    >
      <defs>
        {/* fuselage gradient */}
        <linearGradient id="fuselage-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0a1830" />
          <stop offset="35%"  stopColor="#1a3a6a" />
          <stop offset="65%"  stopColor="#1a3a6a" />
          <stop offset="100%" stopColor="#0a1830" />
        </linearGradient>
        {/* wing gradient */}
        <linearGradient id="wing-grad-l" x1="1" y1="0" x2="0" y2="0.6">
          <stop offset="0%"  stopColor="#0e2248" />
          <stop offset="100%" stopColor="#06101e" />
        </linearGradient>
        <linearGradient id="wing-grad-r" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0%"  stopColor="#0e2248" />
          <stop offset="100%" stopColor="#06101e" />
        </linearGradient>
        {/* engine glow */}
        <radialGradient id="engine-glow" cx="50%" cy="0%" r="100%">
          <stop offset="0%"  stopColor="#ffffff" stopOpacity="1" />
          <stop offset="30%" stopColor="#ffcc44" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#ff6600" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ff2200" stopOpacity="0" />
        </radialGradient>
        {/* secondary engine glow */}
        <radialGradient id="engine-glow2" cx="50%" cy="0%" r="100%">
          <stop offset="0%"  stopColor="#88ccff" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#4488ff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#2244aa" stopOpacity="0" />
        </radialGradient>
        {/* cockpit gradient */}
        <radialGradient id="cockpit-grad" cx="50%" cy="60%" r="60%">
          <stop offset="0%"  stopColor="#aaddff" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#2266aa" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#001133" stopOpacity="1" />
        </radialGradient>
        {/* window reflection */}
        <radialGradient id="window-ref" cx="30%" cy="30%" r="60%">
          <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#2266ff" stopOpacity="0.1" />
        </radialGradient>
        {/* exhaust flame */}
        <linearGradient id="exhaust-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="1" />
          <stop offset="20%"  stopColor="#ffdd88" stopOpacity="0.95" />
          <stop offset="50%"  stopColor="#ff6600" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ff2200" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="exhaust-outer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ffaa44" stopOpacity="0.7" />
          <stop offset="60%"  stopColor="#ff4400" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
        </linearGradient>
        {/* hull panel line gradient */}
        <linearGradient id="panel-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#4488ff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#4488ff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ── ENGINE EXHAUST (at bottom, rendered first / behind) ── */}
      {/* outer exhaust cone */}
      <ellipse
        cx="60" cy="176" rx="22" ry="6"
        fill="#ff4400"
        fillOpacity={launching ? 0.5 : 0.3}
        style={{ animation: launching ? 'exhaustFlicker 0.15s infinite' : 'none' }}
      />
      {/* main exhaust plume */}
      <path
        d={`M44 172 Q52 ${launching ? 210 : 195} 60 ${launching ? 220 : 205} Q68 ${launching ? 210 : 195} 76 172`}
        fill="url(#exhaust-grad)"
        fillOpacity={launching ? 1 : 0.6}
        style={{ animation: launching ? 'exhaustFlicker 0.12s infinite' : 'none' }}
      />
      {/* secondary outer flame */}
      <path
        d={`M40 172 Q50 ${launching ? 215 : 200} 60 ${launching ? 228 : 210} Q70 ${launching ? 215 : 200} 80 172`}
        fill="url(#exhaust-outer)"
        fillOpacity={launching ? 0.7 : 0.4}
        style={{ animation: launching ? 'exhaustFlicker 0.18s infinite' : 'none' }}
      />

      {/* ── LEFT WING ── swept-back delta */}
      {/* main wing surface */}
      <path
        d="M48 120 L5 175 L14 178 L48 148 Z"
        fill="url(#wing-grad-l)"
        stroke="rgba(68,136,255,0.3)"
        strokeWidth="0.8"
      />
      {/* wing leading edge highlight */}
      <path
        d="M48 120 L5 175"
        stroke="rgba(100,160,255,0.5)"
        strokeWidth="1.2"
      />
      {/* wing thruster pod */}
      <ellipse cx="12" cy="177" rx="9" ry="4" fill="#0a1830" stroke="rgba(68,136,255,0.5)" strokeWidth="1" />
      <ellipse cx="12" cy="175" rx="5" ry="2.5"
        fill="url(#engine-glow2)"
        style={{ animation: 'enginePulse 1.1s ease-in-out infinite' }}
      />
      {/* wing panel lines */}
      <line x1="38" y1="132" x2="10" y2="172" stroke="rgba(68,136,255,0.2)" strokeWidth="0.7" />
      <line x1="44" y1="140" x2="18" y2="173" stroke="rgba(68,136,255,0.15)" strokeWidth="0.7" />

      {/* ── RIGHT WING ── */}
      <path
        d="M72 120 L115 175 L106 178 L72 148 Z"
        fill="url(#wing-grad-r)"
        stroke="rgba(68,136,255,0.3)"
        strokeWidth="0.8"
      />
      <path
        d="M72 120 L115 175"
        stroke="rgba(100,160,255,0.5)"
        strokeWidth="1.2"
      />
      <ellipse cx="108" cy="177" rx="9" ry="4" fill="#0a1830" stroke="rgba(68,136,255,0.5)" strokeWidth="1" />
      <ellipse cx="108" cy="175" rx="5" ry="2.5"
        fill="url(#engine-glow2)"
        style={{ animation: 'enginePulse 1.1s ease-in-out 0.15s infinite' }}
      />
      <line x1="82" y1="132" x2="110" y2="172" stroke="rgba(68,136,255,0.2)" strokeWidth="0.7" />
      <line x1="76" y1="140" x2="102" y2="173" stroke="rgba(68,136,255,0.15)" strokeWidth="0.7" />

      {/* ── SECONDARY FORWARD FINS ── */}
      <path d="M44 80 L25 110 L38 110 Z" fill="#0d1e3a" stroke="rgba(68,136,255,0.3)" strokeWidth="0.7" />
      <path d="M76 80 L95 110 L82 110 Z" fill="#0d1e3a" stroke="rgba(68,136,255,0.3)" strokeWidth="0.7" />

      {/* ── MAIN FUSELAGE ── */}
      {/* rear section */}
      <path
        d="M44 165 Q36 155 36 140 L36 100 Q36 90 40 82 L60 30 L80 82 Q84 90 84 100 L84 140 Q84 155 76 165 Z"
        fill="url(#fuselage-grad)"
        stroke="rgba(100,150,255,0.4)"
        strokeWidth="1"
      />

      {/* engine nozzle / rear ring */}
      <ellipse cx="60" cy="165" rx="19" ry="7" fill="#06101e" stroke="rgba(68,136,255,0.6)" strokeWidth="1.2" />
      <ellipse cx="60" cy="165" rx="14" ry="5" fill="#0a1830" stroke="rgba(68,136,255,0.4)" strokeWidth="0.8" />
      {/* main engine glow */}
      <ellipse cx="60" cy="163" rx="10" ry="4"
        fill="url(#engine-glow)"
        style={{ animation: 'enginePulse 0.8s ease-in-out infinite' }}
      />

      {/* ── HULL PANEL DETAILS ── */}
      {/* left panel line */}
      <path d="M44 160 L42 110 L46 82" stroke="rgba(68,136,255,0.25)" strokeWidth="0.8" fill="none" />
      {/* right panel line */}
      <path d="M76 160 L78 110 L74 82" stroke="rgba(68,136,255,0.25)" strokeWidth="0.8" fill="none" />
      {/* horizontal band 1 */}
      <line x1="38" y1="145" x2="82" y2="145" stroke="rgba(68,136,255,0.2)" strokeWidth="0.7" />
      {/* horizontal band 2 */}
      <line x1="39" y1="125" x2="81" y2="125" stroke="rgba(68,136,255,0.2)" strokeWidth="0.7" />
      {/* hull accent stripe */}
      <path
        d="M46 158 L44 100 L49 80"
        stroke="url(#panel-light)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M74 158 L76 100 L71 80"
        stroke="url(#panel-light)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* ── SIDE WINDOWS ── row of porthole windows */}
      <circle cx="52" cy="115" r="4" fill="url(#window-ref)" stroke="rgba(100,180,255,0.5)" strokeWidth="0.8" />
      <circle cx="68" cy="115" r="4" fill="url(#window-ref)" stroke="rgba(100,180,255,0.5)" strokeWidth="0.8" />
      <circle cx="52" cy="132" r="3" fill="url(#window-ref)" stroke="rgba(100,180,255,0.4)" strokeWidth="0.7" />
      <circle cx="68" cy="132" r="3" fill="url(#window-ref)" stroke="rgba(100,180,255,0.4)" strokeWidth="0.7" />
      {/* window glow */}
      <circle cx="52" cy="115" r="4" fill="#aaddff" fillOpacity="0.12" />
      <circle cx="68" cy="115" r="4" fill="#aaddff" fillOpacity="0.12" />

      {/* ── NOSE SECTION / COCKPIT FAIRING ── */}
      {/* nose cone */}
      <path
        d="M46 82 Q48 50 60 22 Q72 50 74 82 Z"
        fill="linear-gradient(180deg, #1a4080 0%, #0e2248 100%)"
        stroke="rgba(100,160,255,0.5)"
        strokeWidth="1"
      />
      <path
        d="M46 82 Q48 50 60 22 Q72 50 74 82 Z"
        fill="#1a3a6a"
      />

      {/* cockpit dome */}
      <ellipse cx="60" cy="56" rx="13" ry="16" fill="url(#cockpit-grad)" stroke="rgba(150,200,255,0.7)" strokeWidth="1.2" />
      {/* cockpit inner detail */}
      <ellipse cx="60" cy="56" rx="9" ry="12" fill="#001133" fillOpacity="0.5" />
      {/* cockpit reflection */}
      <ellipse cx="56" cy="50" rx="4" ry="6" fill="#ffffff" fillOpacity="0.18" />
      {/* cockpit frame */}
      <line x1="60" y1="40" x2="60" y2="72" stroke="rgba(150,200,255,0.3)" strokeWidth="0.8" />
      <line x1="47" y1="56" x2="73" y2="56" stroke="rgba(150,200,255,0.3)" strokeWidth="0.8" />

      {/* ── NOSE TIP / SENSOR ARRAY ── */}
      <path d="M57 22 L60 8 L63 22 Z" fill="#aaccff" fillOpacity="0.9" />
      <circle cx="60" cy="8" r="2.5" fill="#00ffcc" fillOpacity="0.9" />
      {/* sensor glow */}
      <circle cx="60" cy="8" r="4"
        fill="#00ffcc"
        fillOpacity="0.4"
        style={{ animation: 'enginePulse 2s ease-in-out infinite' }}
      />

      {/* ── SHIP NAME STENCIL ── */}
      <text
        x="60" y="105"
        textAnchor="middle"
        fontFamily="'Courier New', monospace"
        fontSize="5"
        fontWeight="bold"
        fill="rgba(150,200,255,0.5)"
        letterSpacing="1"
      >
        ODYSSEY
      </text>

      {/* ── ENGINE CORE GLOW (circle) ── */}
      <circle
        cx="60" cy="163"
        r="8"
        fill="url(#engine-glow)"
        fillOpacity={launching ? 0.9 : 0.6}
        style={{ animation: 'enginePulse2 0.7s ease-in-out infinite' }}
      />
    </svg>
  );
}

// ── Planet Xlama in background ─────────────────────────────────────────────────
function PlanetXlama() {
  return (
    <div style={{
      position: 'absolute',
      bottom: -120,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 500,
      height: 500,
      borderRadius: '50%',
      background: 'radial-gradient(ellipse at 35% 35%, #00ffcc55 0%, #007755 25%, #003a2a 55%, #001a14 80%, #000a08 100%)',
      boxShadow: '0 0 80px 20px rgba(0,255,150,0.15), inset 0 0 60px rgba(0,0,0,0.5)',
      pointerEvents: 'none',
    }}>
      {/* ring */}
      <div style={{
        position: 'absolute',
        top: '45%',
        left: '-15%',
        width: '130%',
        height: '12%',
        border: '2px solid rgba(0,255,180,0.3)',
        borderRadius: '50%',
        transform: 'rotateX(75deg)',
        pointerEvents: 'none',
      }} />
      {/* surface texture dots */}
      {[
        { top: '30%', left: '40%', r: 18, op: 0.08 },
        { top: '55%', left: '20%', r: 28, op: 0.06 },
        { top: '25%', left: '60%', r: 22, op: 0.07 },
        { top: '60%', left: '55%', r: 20, op: 0.05 },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: s.top,
          left: s.left,
          width: s.r * 2,
          height: s.r * 2,
          borderRadius: '50%',
          background: `rgba(0,0,0,${s.op})`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }} />
      ))}
    </div>
  );
}

// ── Exhaust particle trail ────────────────────────────────────────────────────
function ExhaustParticles({ active }) {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: 45 + (Math.random() - 0.5) * 30,
    delay: i * 0.06,
    size: 2 + Math.random() * 5,
    opacity: 0.4 + Math.random() * 0.5,
    color: ['#ffffff', '#ffdd88', '#ff9944', '#ff6600', '#ff3300'][Math.floor(Math.random() * 5)],
  }));

  if (!active) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 120,
      height: 160,
      pointerEvents: 'none',
    }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: 0, x: p.x - 60, opacity: p.opacity, scale: 1 }}
          animate={{ y: 160, x: p.x - 60 + (Math.random() - 0.5) * 20, opacity: 0, scale: 0.2 }}
          transition={{
            duration: 0.9 + Math.random() * 0.6,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}

// ── Scrolling coordinates text ────────────────────────────────────────────────
const COORDS = Array.from({ length: 40 }, (_, i) => {
  const ra  = (Math.random() * 24).toFixed(4);
  const dec = ((Math.random() - 0.5) * 180).toFixed(4);
  const z   = (Math.random() * 999).toFixed(2);
  return `RA ${ra}h  DEC ${dec > 0 ? '+' : ''}${dec}°  Z ${z} pc`;
});

// ── Main component ────────────────────────────────────────────────────────────
export default function LaunchScene() {
  const { dispatch } = useGame();
  const [phase, setPhase] = useState(PHASE.TITLE);
  const [countNum, setCountNum] = useState(3);
  const [countVisible, setCountVisible] = useState(false);
  const [shaking, setShaking] = useState(false);
  const shipControls = useAnimation();
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // inject CSS keyframes once
  useEffect(() => {
    const id = 'launch-scene-styles';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = CSS_KEYFRAMES;
      document.head.appendChild(style);
    }
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, []);

  // master sequence controller
  useEffect(() => {
    let cancelled = false;

    const after = (ms) => new Promise(res => setTimeout(res, ms));

    async function runSequence() {
      // brief title hold
      await after(2200);
      if (cancelled) return;

      // start countdown
      setPhase(PHASE.COUNTDOWN);
      setCountNum(3);
      setCountVisible(true);

      await after(900);
      if (cancelled) return;
      setCountVisible(false);

      await after(400);
      if (cancelled) return;
      setCountNum(2);
      setCountVisible(true);

      await after(900);
      if (cancelled) return;
      setCountVisible(false);

      await after(400);
      if (cancelled) return;
      setCountNum(1);
      setCountVisible(true);

      await after(900);
      if (cancelled) return;
      setCountVisible(false);

      await after(400);
      if (cancelled) return;
      // LAUNCH!
      setCountNum(0); // 0 = "LAUNCH!"
      setCountVisible(true);

      await after(600);
      if (cancelled) return;

      // begin launch phase
      setPhase(PHASE.LAUNCH);
      setShaking(true);

      // ship ascends
      shipControls.start({
        y: -900,
        transition: { duration: 2.2, ease: [0.5, 0, 0.85, 0.85] },
      });

      await after(500);
      if (cancelled) return;
      setCountVisible(false);

      await after(800);
      if (cancelled) return;
      setShaking(false);

      // warp
      setPhase(PHASE.WARP);

      await after(1200);
      if (cancelled) return;

      // destination text
      setPhase(PHASE.DESTINATION);

      // auto-transition
      await after(4000);
      if (cancelled) return;
      dispatch({ type: 'SET_SCENE', payload: SCENES.SPACE });
    }

    runSequence();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isLaunching = phase >= PHASE.LAUNCH;
  const isWarp = phase >= PHASE.WARP;
  const isDestination = phase >= PHASE.DESTINATION;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: shaking ? 'screenShake 0.08s linear infinite' : 'none',
      }}
    >
      {/* ── Star stream overlay (warp effect) ── */}
      <AnimatePresence>
        {isWarp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 2,
              overflow: 'hidden',
            }}
          >
            {Array.from({ length: 60 }, (_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: 1.5,
                  height: 20 + Math.random() * 40,
                  background: `rgba(255,255,255,${0.3 + Math.random() * 0.6})`,
                  borderRadius: 2,
                  animation: `starStream ${0.3 + Math.random() * 0.4}s linear ${Math.random() * 0.3}s infinite`,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Planet Xlama (background) ── */}
      <PlanetXlama />

      {/* ── Title text ── */}
      <AnimatePresence>
        {phase === PHASE.TITLE && (
          <motion.div
            key="title"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
            style={{
              position: 'absolute',
              top: '12%',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          >
            <div style={{
              fontFamily: '"Courier New", monospace',
              fontWeight: 900,
              fontSize: 'clamp(22px, 3.5vw, 36px)',
              letterSpacing: '0.25em',
              color: '#ffffff',
              textShadow: '0 0 30px rgba(68,136,255,0.8), 0 0 60px rgba(68,136,255,0.4)',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              THE ODYSSEY
            </div>
            <div style={{
              fontFamily: '"Courier New", monospace',
              fontSize: 'clamp(11px, 1.5vw, 14px)',
              color: 'rgba(0,255,180,0.8)',
              letterSpacing: '0.2em',
              fontStyle: 'italic',
            }}>
              Xlama&rsquo;s last hope
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Countdown overlay ── */}
      <AnimatePresence>
        {phase === PHASE.COUNTDOWN && countVisible && (
          <motion.div
            key={`count-${countNum}`}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, scale: 1.4, transition: { duration: 0.3 } }}
            style={{
              position: 'absolute',
              top: '18%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            {countNum > 0 ? (
              <div style={{
                fontFamily: '"Courier New", monospace',
                fontWeight: 900,
                fontSize: 'clamp(72px, 14vw, 130px)',
                color: '#ff6600',
                textShadow: '0 0 40px #ff6600, 0 0 80px #ff440088',
                lineHeight: 1,
              }}>
                {countNum}
              </div>
            ) : (
              <div style={{
                fontFamily: '"Courier New", monospace',
                fontWeight: 900,
                fontSize: 'clamp(36px, 7vw, 60px)',
                letterSpacing: '0.2em',
                color: '#ffffff',
                textShadow: '0 0 40px #ffffff, 0 0 80px rgba(255,220,100,0.7)',
              }}>
                LAUNCH!
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── The Odyssey ship + exhaust ── */}
      <motion.div
        animate={shipControls}
        style={{
          position: 'absolute',
          bottom: '22%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 6,
          originX: '50%',
          originY: '100%',
        }}
      >
        <OdysseyShip phase={phase} />
        <ExhaustParticles active={isLaunching} />
      </motion.div>

      {/* ── Launch pad glow ring ── */}
      <AnimatePresence>
        {!isLaunching && (
          <motion.div
            key="pad"
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={{ opacity: 1, scaleX: 1, transition: { duration: 0.6 } }}
            exit={{ opacity: 0, scaleX: 2, transition: { duration: 0.4 } }}
            style={{
              position: 'absolute',
              bottom: 'calc(22% - 6px)',
              left: '50%',
              width: 140,
              height: 18,
              marginLeft: -70,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(68,136,255,0.5) 0%, rgba(68,136,255,0) 70%)',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Destination text (final phase) ── */}
      <AnimatePresence>
        {isDestination && (
          <motion.div
            key="destination"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1.2 } }}
            style={{
              position: 'absolute',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              zIndex: 10,
              pointerEvents: 'none',
              width: '90%',
            }}
          >
            <motion.div
              initial={{ opacity: 0, letterSpacing: '0.6em' }}
              animate={{ opacity: 1, letterSpacing: '0.3em', transition: { duration: 0.8, delay: 0.2 } }}
              style={{
                fontFamily: '"Courier New", monospace',
                fontWeight: 900,
                fontSize: 'clamp(24px, 4.5vw, 42px)',
                color: '#ffffff',
                textShadow: '0 0 30px rgba(255,255,255,0.9), 0 0 60px rgba(100,180,255,0.5)',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              DESTINATION: UNKNOWN
            </motion.div>

            {/* scrolling coordinates */}
            <div style={{
              width: 320,
              maxWidth: '90vw',
              height: 80,
              margin: '0 auto',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid rgba(68,136,255,0.3)',
              borderRadius: 6,
              background: 'rgba(0,0,0,0.4)',
            }}>
              <div style={{
                animation: 'coordScroll 6s linear infinite',
                position: 'absolute',
                width: '100%',
                top: 0,
                left: 0,
              }}>
                {[...COORDS, ...COORDS].map((line, i) => (
                  <div key={i} style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: 9,
                    color: 'rgba(0,255,180,0.7)',
                    padding: '2px 8px',
                    letterSpacing: '0.06em',
                    borderBottom: '1px solid rgba(0,255,180,0.08)',
                  }}>
                    {line}
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.8 } }}
              style={{
                marginTop: 16,
                fontFamily: '"Courier New", monospace',
                fontSize: 'clamp(9px, 1.5vw, 12px)',
                color: 'rgba(150,200,255,0.6)',
                letterSpacing: '0.2em',
                fontStyle: 'italic',
              }}
            >
              Navigation locked &mdash; entering deep space&hellip;
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Corner frames ── */}
      <CornerFrame position="top-left" />
      <CornerFrame position="top-right" />
      <CornerFrame position="bottom-left" />
      <CornerFrame position="bottom-right" />
    </div>
  );
}

// ── Corner frame decoration ───────────────────────────────────────────────────
function CornerFrame({ position }) {
  const isTop  = position.startsWith('top');
  const isLeft = position.endsWith('left');
  return (
    <div style={{
      position: 'fixed',
      top:    isTop  ? 16 : 'auto',
      bottom: isTop  ? 'auto' : 16,
      left:   isLeft ? 16 : 'auto',
      right:  isLeft ? 'auto' : 16,
      width:  40,
      height: 40,
      borderTop:    isTop  ? '2px solid rgba(68,136,255,0.4)' : 'none',
      borderBottom: isTop  ? 'none' : '2px solid rgba(68,136,255,0.4)',
      borderLeft:   isLeft ? '2px solid rgba(68,136,255,0.4)' : 'none',
      borderRight:  isLeft ? 'none' : '2px solid rgba(68,136,255,0.4)',
      borderRadius: isTop
        ? (isLeft ? '6px 0 0 0' : '0 6px 0 0')
        : (isLeft ? '0 0 0 6px' : '0 0 6px 0'),
      pointerEvents: 'none',
    }} />
  );
}
