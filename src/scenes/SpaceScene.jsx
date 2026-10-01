import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, SCENES } from '../context/GameContext';

// ── CSS keyframes ─────────────────────────────────────────────────────────────
const CSS_KEYFRAMES = `
@keyframes warpLine {
  0%   { transform: translateX(-50%) scaleX(0); opacity: 0; }
  10%  { opacity: 1; }
  80%  { opacity: 0.8; }
  100% { transform: translateX(-50%) scaleX(1); opacity: 0; }
}
@keyframes warpLineDiag {
  0%   { transform-origin: center center; transform: scaleX(0); opacity: 0; }
  10%  { opacity: 0.9; }
  90%  { opacity: 0.7; }
  100% { transform: scaleX(1); opacity: 0; }
}
@keyframes shipShake {
  0%   { transform: translate(0, 0)     rotate(0deg); }
  15%  { transform: translate(-2px, 1px) rotate(-0.3deg); }
  30%  { transform: translate(2px, -1px) rotate(0.3deg); }
  45%  { transform: translate(-1px, 2px) rotate(-0.2deg); }
  60%  { transform: translate(1px, -2px) rotate(0.2deg); }
  75%  { transform: translate(-2px, 1px) rotate(-0.1deg); }
  90%  { transform: translate(1px, 1px)  rotate(0.1deg); }
  100% { transform: translate(0, 0)     rotate(0deg); }
}
@keyframes enginePulse {
  0%   { opacity: 0.7; transform: scaleX(1)    scaleY(1);   }
  50%  { opacity: 1.0; transform: scaleX(1.15)  scaleY(1.2); }
  100% { opacity: 0.7; transform: scaleX(1)    scaleY(1);   }
}
@keyframes enginePulse2 {
  0%   { opacity: 0.4; r: 8;  }
  50%  { opacity: 0.9; r: 13; }
  100% { opacity: 0.4; r: 8;  }
}
@keyframes exhaustFlicker {
  0%,100% { opacity: 0.85; transform: scaleX(0.95); }
  33%     { opacity: 1.0;  transform: scaleX(1.05); }
  66%     { opacity: 0.7;  transform: scaleX(0.9);  }
}
@keyframes energyRing {
  0%   { transform: translate(-50%, -50%) scale(0.2); opacity: 0.9; }
  100% { transform: translate(-50%, -50%) scale(3.5); opacity: 0;   }
}
@keyframes radarSweep {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes radarBlip {
  0%,80%,100% { opacity: 0; transform: scale(0.5); }
  85%         { opacity: 1; transform: scale(1.4); }
  90%         { opacity: 0.6; transform: scale(1); }
}
@keyframes textFlicker {
  0%,98%,100% { opacity: 1; }
  99%          { opacity: 0.4; }
}
@keyframes scanLine {
  0%   { transform: translateY(-100%); opacity: 0.8; }
  100% { transform: translateY(600%);  opacity: 0; }
}
@keyframes logFade {
  0%   { opacity: 0; transform: translateX(-12px); }
  20%  { opacity: 1; transform: translateX(0); }
  80%  { opacity: 1; }
  100% { opacity: 1; }
}
@keyframes progressPulse {
  0%,100% { box-shadow: 0 0 6px #00ffcc; }
  50%     { box-shadow: 0 0 16px #00ffcc, 0 0 30px rgba(0,255,204,0.4); }
}
`;

// ── Warp star lines (60 lines) ────────────────────────────────────────────────
// Each line gets a random angle, length, speed, and position around center
const WARP_LINES = Array.from({ length: 60 }, (_, i) => {
  const angle = (i / 60) * 360 + (Math.random() - 0.5) * 6; // roughly even spread
  const length = 80 + Math.random() * 220;
  const duration = 0.4 + Math.random() * 0.8;
  const delay = Math.random() * duration;
  const thickness = 0.7 + Math.random() * 1.6;
  // distance from center where the line starts
  const distFromCenter = 20 + Math.random() * 180;
  const brightness = 0.5 + Math.random() * 0.5;
  const color = Math.random() > 0.85
    ? `rgba(0,255,204,${brightness})`
    : Math.random() > 0.7
      ? `rgba(150,200,255,${brightness})`
      : `rgba(255,255,255,${brightness})`;
  return { id: i, angle, length, duration, delay, thickness, distFromCenter, color };
});

function WarpLines() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {WARP_LINES.map(line => {
        const rad = (line.angle * Math.PI) / 180;
        // start position relative to center (50%, 50%)
        const startX = 50 + (line.distFromCenter * Math.cos(rad) / window.innerWidth) * 100;
        const startY = 50 + (line.distFromCenter * Math.sin(rad) / window.innerHeight) * 100;
        return (
          <div
            key={line.id}
            style={{
              position: 'absolute',
              left: `${startX}%`,
              top: `${startY}%`,
              width: line.length,
              height: line.thickness,
              background: `linear-gradient(90deg, transparent, ${line.color}, transparent)`,
              transform: `rotate(${line.angle}deg)`,
              transformOrigin: '0 50%',
              animation: `warpLine ${line.duration}s ${line.delay}s linear infinite`,
              borderRadius: 2,
            }}
          />
        );
      })}
    </div>
  );
}

// ── Odyssey ship (horizontal orientation for warp travel) ────────────────────
function OdysseyShipWarp() {
  return (
    <svg
      width="220"
      height="120"
      viewBox="0 0 120 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: 'rotate(90deg)',
        filter: 'drop-shadow(0 0 18px rgba(68,136,255,0.8)) drop-shadow(0 0 40px rgba(255,150,50,0.5))',
        animation: 'shipShake 0.3s ease-in-out infinite',
      }}
      aria-label="Odyssey ship in warp"
    >
      <defs>
        <linearGradient id="sp-fuselage-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0a1830" />
          <stop offset="35%"  stopColor="#1a3a6a" />
          <stop offset="65%"  stopColor="#1a3a6a" />
          <stop offset="100%" stopColor="#0a1830" />
        </linearGradient>
        <linearGradient id="sp-wing-grad-l" x1="1" y1="0" x2="0" y2="0.6">
          <stop offset="0%"   stopColor="#0e2248" />
          <stop offset="100%" stopColor="#06101e" />
        </linearGradient>
        <linearGradient id="sp-wing-grad-r" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0%"   stopColor="#0e2248" />
          <stop offset="100%" stopColor="#06101e" />
        </linearGradient>
        <radialGradient id="sp-engine-glow" cx="50%" cy="0%" r="100%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="1" />
          <stop offset="30%"  stopColor="#ffcc44" stopOpacity="0.9" />
          <stop offset="60%"  stopColor="#ff6600" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ff2200" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sp-engine-glow2" cx="50%" cy="0%" r="100%">
          <stop offset="0%"   stopColor="#88ccff" stopOpacity="0.9" />
          <stop offset="60%"  stopColor="#4488ff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#2244aa" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sp-cockpit-grad" cx="50%" cy="60%" r="60%">
          <stop offset="0%"   stopColor="#aaddff" stopOpacity="0.9" />
          <stop offset="60%"  stopColor="#2266aa" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#001133" stopOpacity="1" />
        </radialGradient>
        <radialGradient id="sp-window-ref" cx="30%" cy="30%" r="60%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#2266ff" stopOpacity="0.1" />
        </radialGradient>
        <linearGradient id="sp-exhaust-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="1" />
          <stop offset="20%"  stopColor="#ffdd88" stopOpacity="0.95" />
          <stop offset="50%"  stopColor="#ff6600" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ff2200" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sp-exhaust-outer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ffaa44" stopOpacity="0.7" />
          <stop offset="60%"  stopColor="#ff4400" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sp-panel-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#4488ff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#4488ff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* engine exhaust */}
      <ellipse cx="60" cy="176" rx="22" ry="6" fill="#ff4400" fillOpacity="0.5"
        style={{ animation: 'exhaustFlicker 0.15s infinite' }} />
      <path d="M44 172 Q52 210 60 220 Q68 210 76 172"
        fill="url(#sp-exhaust-grad)" fillOpacity="1"
        style={{ animation: 'exhaustFlicker 0.12s infinite' }} />
      <path d="M40 172 Q50 215 60 228 Q70 215 80 172"
        fill="url(#sp-exhaust-outer)" fillOpacity="0.7"
        style={{ animation: 'exhaustFlicker 0.18s infinite' }} />

      {/* left wing */}
      <path d="M48 120 L5 175 L14 178 L48 148 Z"
        fill="url(#sp-wing-grad-l)" stroke="rgba(68,136,255,0.3)" strokeWidth="0.8" />
      <path d="M48 120 L5 175" stroke="rgba(100,160,255,0.5)" strokeWidth="1.2" />
      <ellipse cx="12" cy="177" rx="9" ry="4" fill="#0a1830" stroke="rgba(68,136,255,0.5)" strokeWidth="1" />
      <ellipse cx="12" cy="175" rx="5" ry="2.5"
        fill="url(#sp-engine-glow2)"
        style={{ animation: 'enginePulse 1.1s ease-in-out infinite' }} />

      {/* right wing */}
      <path d="M72 120 L115 175 L106 178 L72 148 Z"
        fill="url(#sp-wing-grad-r)" stroke="rgba(68,136,255,0.3)" strokeWidth="0.8" />
      <path d="M72 120 L115 175" stroke="rgba(100,160,255,0.5)" strokeWidth="1.2" />
      <ellipse cx="108" cy="177" rx="9" ry="4" fill="#0a1830" stroke="rgba(68,136,255,0.5)" strokeWidth="1" />
      <ellipse cx="108" cy="175" rx="5" ry="2.5"
        fill="url(#sp-engine-glow2)"
        style={{ animation: 'enginePulse 1.1s ease-in-out 0.15s infinite' }} />

      {/* forward fins */}
      <path d="M44 80 L25 110 L38 110 Z" fill="#0d1e3a" stroke="rgba(68,136,255,0.3)" strokeWidth="0.7" />
      <path d="M76 80 L95 110 L82 110 Z" fill="#0d1e3a" stroke="rgba(68,136,255,0.3)" strokeWidth="0.7" />

      {/* main fuselage */}
      <path d="M44 165 Q36 155 36 140 L36 100 Q36 90 40 82 L60 30 L80 82 Q84 90 84 100 L84 140 Q84 155 76 165 Z"
        fill="url(#sp-fuselage-grad)" stroke="rgba(100,150,255,0.4)" strokeWidth="1" />

      {/* engine nozzle ring */}
      <ellipse cx="60" cy="165" rx="19" ry="7" fill="#06101e" stroke="rgba(68,136,255,0.6)" strokeWidth="1.2" />
      <ellipse cx="60" cy="165" rx="14" ry="5" fill="#0a1830" stroke="rgba(68,136,255,0.4)" strokeWidth="0.8" />
      <ellipse cx="60" cy="163" rx="10" ry="4"
        fill="url(#sp-engine-glow)"
        style={{ animation: 'enginePulse 0.8s ease-in-out infinite' }} />

      {/* hull panel details */}
      <path d="M44 160 L42 110 L46 82" stroke="rgba(68,136,255,0.25)" strokeWidth="0.8" fill="none" />
      <path d="M76 160 L78 110 L74 82" stroke="rgba(68,136,255,0.25)" strokeWidth="0.8" fill="none" />
      <line x1="38" y1="145" x2="82" y2="145" stroke="rgba(68,136,255,0.2)" strokeWidth="0.7" />
      <line x1="39" y1="125" x2="81" y2="125" stroke="rgba(68,136,255,0.2)" strokeWidth="0.7" />
      <path d="M46 158 L44 100 L49 80"
        stroke="url(#sp-panel-light)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M74 158 L76 100 L71 80"
        stroke="url(#sp-panel-light)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* porthole windows */}
      <circle cx="52" cy="115" r="4" fill="url(#sp-window-ref)" stroke="rgba(100,180,255,0.5)" strokeWidth="0.8" />
      <circle cx="68" cy="115" r="4" fill="url(#sp-window-ref)" stroke="rgba(100,180,255,0.5)" strokeWidth="0.8" />
      <circle cx="52" cy="132" r="3" fill="url(#sp-window-ref)" stroke="rgba(100,180,255,0.4)" strokeWidth="0.7" />
      <circle cx="68" cy="132" r="3" fill="url(#sp-window-ref)" stroke="rgba(100,180,255,0.4)" strokeWidth="0.7" />
      <circle cx="52" cy="115" r="4" fill="#aaddff" fillOpacity="0.12" />
      <circle cx="68" cy="115" r="4" fill="#aaddff" fillOpacity="0.12" />

      {/* nose section */}
      <path d="M46 82 Q48 50 60 22 Q72 50 74 82 Z" fill="#1a3a6a" stroke="rgba(100,160,255,0.5)" strokeWidth="1" />

      {/* cockpit dome */}
      <ellipse cx="60" cy="56" rx="13" ry="16" fill="url(#sp-cockpit-grad)" stroke="rgba(150,200,255,0.7)" strokeWidth="1.2" />
      <ellipse cx="60" cy="56" rx="9" ry="12" fill="#001133" fillOpacity="0.5" />
      <ellipse cx="56" cy="50" rx="4" ry="6" fill="#ffffff" fillOpacity="0.18" />
      <line x1="60" y1="40" x2="60" y2="72" stroke="rgba(150,200,255,0.3)" strokeWidth="0.8" />
      <line x1="47" y1="56" x2="73" y2="56" stroke="rgba(150,200,255,0.3)" strokeWidth="0.8" />

      {/* nose tip / sensor */}
      <path d="M57 22 L60 8 L63 22 Z" fill="#aaccff" fillOpacity="0.9" />
      <circle cx="60" cy="8" r="2.5" fill="#00ffcc" fillOpacity="0.9" />
      <circle cx="60" cy="8" r="4" fill="#00ffcc" fillOpacity="0.4"
        style={{ animation: 'enginePulse 2s ease-in-out infinite' }} />

      {/* ship name */}
      <text x="60" y="105" textAnchor="middle"
        fontFamily="'Courier New', monospace" fontSize="5" fontWeight="bold"
        fill="rgba(150,200,255,0.5)" letterSpacing="1">
        ODYSSEY
      </text>

      {/* engine core glow */}
      <circle cx="60" cy="163" r="8"
        fill="url(#sp-engine-glow)" fillOpacity="0.9"
        style={{ animation: 'enginePulse2 0.7s ease-in-out infinite' }} />
    </svg>
  );
}

// ── Energy rings ─────────────────────────────────────────────────────────────
const RING_DELAYS = [0, 0.6, 1.2, 1.8, 2.4];
function EnergyRings() {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {RING_DELAYS.map((delay, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 160,
            height: 160,
            borderRadius: '50%',
            border: `${1.5 - i * 0.2}px solid rgba(0,255,204,${0.7 - i * 0.1})`,
            boxShadow: '0 0 12px rgba(0,255,204,0.3)',
            animation: `energyRing 3s ${delay}s ease-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ── Radar display ─────────────────────────────────────────────────────────────
function RadarDisplay({ showBlip }) {
  return (
    <div style={{
      position: 'relative',
      width: 120,
      height: 120,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(0,40,20,0.95) 0%, rgba(0,20,10,0.98) 100%)',
      border: '1.5px solid rgba(0,255,100,0.5)',
      boxShadow: '0 0 20px rgba(0,255,100,0.2), inset 0 0 20px rgba(0,0,0,0.5)',
      overflow: 'hidden',
    }}>
      {/* grid rings */}
      {[30, 50, 35].map((r, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: r * 2, height: r * 2,
          marginLeft: -r, marginTop: -r,
          borderRadius: '50%',
          border: '1px solid rgba(0,200,80,0.2)',
        }} />
      ))}
      {/* crosshair */}
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0,
        height: 1, background: 'rgba(0,200,80,0.15)',
      }} />
      <div style={{
        position: 'absolute', left: '50%', top: 0, bottom: 0,
        width: 1, background: 'rgba(0,200,80,0.15)',
      }} />
      {/* sweep arm */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: '50%', height: 1,
        transformOrigin: '0 0',
        background: 'linear-gradient(90deg, rgba(0,255,80,0.9), transparent)',
        animation: 'radarSweep 2.5s linear infinite',
        boxShadow: '0 0 6px rgba(0,255,80,0.5)',
      }} />
      {/* sweep trail */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: '50%', height: 1,
        transformOrigin: '0 0',
        background: 'linear-gradient(90deg, rgba(0,200,60,0.4), transparent)',
        animation: 'radarSweep 2.5s linear 0.15s infinite',
      }} />
      {/* blip */}
      {showBlip && (
        <div style={{
          position: 'absolute',
          top: '38%', left: '68%',
          width: 7, height: 7,
          borderRadius: '50%',
          background: '#00ff88',
          boxShadow: '0 0 10px #00ff88, 0 0 20px rgba(0,255,136,0.6)',
          animation: 'radarBlip 2.5s 0.8s ease-in-out infinite',
        }} />
      )}
      {/* center dot */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: 5, height: 5,
        borderRadius: '50%',
        background: '#00ff88',
        transform: 'translate(-50%,-50%)',
        boxShadow: '0 0 6px #00ff88',
      }} />
    </div>
  );
}

// ── Log entries ───────────────────────────────────────────────────────────────
const LOG_ENTRIES = [
  { day: 1,   text: 'Exiting Xlama orbit',      delay: 1.0 },
  { day: 47,  text: 'Crossing the Outer Rim',   delay: 2.0 },
  { day: 183, text: 'Unknown sector detected',  delay: 3.0 },
  { day: 184, text: 'Anomaly ahead... a planet', delay: 4.2 },
];

// ── Main SpaceScene ───────────────────────────────────────────────────────────
export default function SpaceScene() {
  const { dispatch } = useGame();
  const [showBlip, setShowBlip] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);
  const autoRef = useRef(null);

  useEffect(() => {
    // show radar blip after 2s
    timerRef.current = setTimeout(() => setShowBlip(true), 2000);
    // enable manual button after 3s
    const enableTimer = setTimeout(() => setCanProceed(true), 3000);
    // auto-transition after 5s
    autoRef.current = setTimeout(() => handleProceed(), 5000);

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(enableTimer);
      clearTimeout(autoRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleProceed() {
    if (exiting) return;
    setExiting(true);
    clearTimeout(autoRef.current);
    setTimeout(() => {
      dispatch({ type: 'SET_SCENE', payload: SCENES.PLANET_ARRIVAL });
    }, 700);
  }

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(ellipse at center, #04080f 0%, #010206 60%, #000000 100%)',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <style>{CSS_KEYFRAMES}</style>

      {/* warp lines */}
      <WarpLines />

      {/* energy rings */}
      <EnergyRings />

      {/* centered ship */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: exiting ? 0 : 1, scale: exiting ? 2 : 1 }}
        transition={{ duration: exiting ? 0.6 : 0.5, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 10 }}
      >
        <OdysseyShipWarp />
      </motion.div>

      {/* scan line sweeping over ship */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 260,
        height: 3,
        background: 'linear-gradient(90deg, transparent, rgba(0,255,204,0.7), transparent)',
        animation: 'scanLine 3s 0.5s linear infinite',
        zIndex: 12,
        pointerEvents: 'none',
        borderRadius: 2,
      }} />

      {/* top title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: exiting ? 0 : 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          position: 'absolute',
          top: 32,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 20,
        }}
      >
        <div style={{
          display: 'inline-block',
          fontFamily: "'Courier New', monospace",
          fontSize: 13,
          fontWeight: 'bold',
          letterSpacing: 4,
          color: '#00ffcc',
          textShadow: '0 0 12px rgba(0,255,204,0.8)',
          animation: 'textFlicker 8s 2s infinite',
        }}>
          ◈ TRAVELING THROUGH THE COSMOS... ◈
        </div>
        <div style={{
          marginTop: 6,
          fontFamily: "'Courier New', monospace",
          fontSize: 10,
          color: 'rgba(0,255,204,0.5)',
          letterSpacing: 2,
        }}>
          WARP DRIVE ENGAGED — XLAMA SECTOR → UNKNOWN
        </div>
      </motion.div>

      {/* flight log panel */}
      <div style={{
        position: 'absolute',
        left: 32,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 20,
        minWidth: 220,
      }}>
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 10,
          color: 'rgba(0,255,204,0.6)',
          letterSpacing: 2,
          marginBottom: 10,
          borderBottom: '1px solid rgba(0,255,204,0.2)',
          paddingBottom: 6,
        }}>
          ▸ FLIGHT LOG
        </div>
        {LOG_ENTRIES.map((entry) => (
          <div
            key={entry.day}
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 11,
              color: entry.day === 184 ? '#ffcc44' : 'rgba(180,220,255,0.85)',
              marginBottom: 8,
              animation: `logFade 1s ${entry.delay}s both`,
              textShadow: entry.day === 184 ? '0 0 10px rgba(255,200,0,0.5)' : 'none',
            }}
          >
            <span style={{ color: 'rgba(0,255,204,0.5)', fontSize: 9 }}>DAY {entry.day}</span>
            <br />
            &nbsp;&nbsp;{entry.text}
          </div>
        ))}
      </div>

      {/* radar panel — bottom right */}
      <div style={{
        position: 'absolute',
        right: 32,
        bottom: 80,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}>
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 9,
          color: 'rgba(0,255,100,0.6)',
          letterSpacing: 2,
          marginBottom: 4,
        }}>
          LONG-RANGE SCANNER
        </div>
        <RadarDisplay showBlip={showBlip} />
        <AnimatePresence>
          {showBlip && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 9,
                color: '#00ff88',
                letterSpacing: 1,
                textShadow: '0 0 8px rgba(0,255,136,0.6)',
              }}
            >
              ◉ CONTACT DETECTED
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ship status — top right */}
      <div style={{
        position: 'absolute',
        right: 32,
        top: 32,
        zIndex: 20,
        fontFamily: "'Courier New', monospace",
        fontSize: 9,
        color: 'rgba(100,180,255,0.7)',
        letterSpacing: 1,
        lineHeight: 1.8,
        textAlign: 'right',
      }}>
        <div style={{ color: '#4488ff', fontSize: 10, letterSpacing: 2, marginBottom: 4 }}>USS ODYSSEY</div>
        <div>SPEED: WARP 9.8</div>
        <div>HULL INTEGRITY: 100%</div>
        <div>SHIELDS: ACTIVE</div>
        <div>CREW: 5 ABOARD</div>
        <div style={{ color: '#ffcc44', marginTop: 4 }}>► DESTINATION: UNKNOWN</div>
      </div>

      {/* proceed button */}
      <AnimatePresence>
        {canProceed && !exiting && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            onClick={handleProceed}
            style={{
              position: 'absolute',
              bottom: 36,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 30,
              padding: '10px 32px',
              background: 'transparent',
              border: '1.5px solid rgba(0,255,204,0.6)',
              borderRadius: 4,
              color: '#00ffcc',
              fontFamily: "'Courier New', monospace",
              fontSize: 12,
              letterSpacing: 3,
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(0,255,204,0.2)',
              transition: 'all 0.2s ease',
            }}
            whileHover={{
              scale: 1.04,
              boxShadow: '0 0 28px rgba(0,255,204,0.5)',
              borderColor: 'rgba(0,255,204,1)',
            }}
            whileTap={{ scale: 0.97 }}
          >
            ▸ APPROACH CONTACT
          </motion.button>
        )}
      </AnimatePresence>

      {/* exit flash */}
      <AnimatePresence>
        {exiting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, #ffffff 0%, #aaddff 30%, #001133 100%)',
              zIndex: 50,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
