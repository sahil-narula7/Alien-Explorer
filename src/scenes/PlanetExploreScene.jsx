import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, SCENES } from '../context/GameContext';
import ZyroCharacter from '../components/ZyroCharacter';
import useSound from '../hooks/useSound';

// ── CSS keyframes (scoped with pe- prefix) ────────────────────────────────
const PE_KEYFRAMES = `
@keyframes pe-skyShift {
  0%,100% { background-position: 0% 50%; }
  50%     { background-position: 100% 50%; }
}
@keyframes pe-moonFloat {
  0%,100% { transform: translateY(0px); }
  50%     { transform: translateY(-6px); }
}
@keyframes pe-plantSway {
  0%,100% { transform-origin: bottom center; transform: rotate(-5deg); }
  50%     { transform-origin: bottom center; transform: rotate(5deg); }
}
@keyframes pe-plantSway2 {
  0%,100% { transform-origin: bottom center; transform: rotate(4deg); }
  50%     { transform-origin: bottom center; transform: rotate(-6deg); }
}
@keyframes pe-sporeFloat {
  0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.7; }
  50%  { transform: translateY(-40px) translateX(8px) scale(1.1); opacity: 0.5; }
  100% { transform: translateY(-90px) translateX(-5px) scale(0.5); opacity: 0; }
}
@keyframes pe-crystalGlow {
  0%,100% { filter: drop-shadow(0 0 6px #00ffcc) drop-shadow(0 0 12px #00ffcc); }
  50%     { filter: drop-shadow(0 0 14px #00ffcc) drop-shadow(0 0 28px #7effff); }
}
@keyframes pe-crystalHoverSpark {
  0%   { opacity: 0; transform: scale(0) translate(-50%,-50%); }
  50%  { opacity: 1; transform: scale(1.2) translate(-50%,-50%); }
  100% { opacity: 0; transform: scale(2)   translate(-50%,-50%); }
}
@keyframes pe-ruinsPulse {
  0%,100% { box-shadow: 0 0 0px rgba(255,120,0,0); border-color: rgba(255,120,0,0.25); }
  50%     { box-shadow: 0 0 24px rgba(255,120,0,0.5), 0 0 50px rgba(255,80,0,0.2); border-color: rgba(255,120,0,0.8); }
}
@keyframes pe-ruinsDetect {
  0%   { opacity: 0; transform: translateX(-50%) translateY(-4px); }
  100% { opacity: 1; transform: translateX(-50%) translateY(0); }
}
@keyframes pe-fogDrift {
  0%   { transform: translateX(-5%); }
  50%  { transform: translateX(2%); }
  100% { transform: translateX(-5%); }
}
@keyframes pe-shipHover {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-4px); }
}
@keyframes pe-btnGlow {
  0%,100% { box-shadow: 0 0 18px rgba(0,255,180,0.45), 0 0 40px rgba(0,255,180,0.15); }
  50%     { box-shadow: 0 0 32px rgba(0,255,180,0.75), 0 0 70px rgba(0,255,180,0.3); }
}
@keyframes pe-btnScan {
  0%   { transform: translateX(-120%); }
  100% { transform: translateX(120%); }
}
@keyframes pe-particleFly {
  0%   { opacity: 0.8; transform: translateY(0) scale(1); }
  100% { opacity: 0;   transform: translateY(-70px) scale(0.3); }
}
@keyframes pe-zyroSlideIn {
  0%   { transform: translateX(80px); opacity: 0; }
  100% { transform: translateX(0);    opacity: 1; }
}
@keyframes pe-starTwinkle {
  0%,100% { opacity: 0.2; }
  50%     { opacity: 1; }
}
`;

// ── Inject styles once ────────────────────────────────────────────────────
let peStyleInjected = false;
function ensurePeStyles() {
  if (peStyleInjected) return;
  const style = document.createElement('style');
  style.textContent = PE_KEYFRAMES;
  document.head.appendChild(style);
  peStyleInjected = true;
}

// ── Seeded pseudo-random (no Math.random at render time) ──────────────────
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Stars background ──────────────────────────────────────────────────────
const STARS = (() => {
  const r = seededRand(77331);
  return Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: r() * 100,
    y: r() * 60,
    size: r() * 2 + 0.8,
    delay: r() * 4,
    dur: 2 + r() * 3,
  }));
})();

// ── Floating spore/particle positions ────────────────────────────────────
const SPORES = (() => {
  const r = seededRand(44221);
  return Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: 5 + r() * 90,
    baseY: 62 + r() * 20,
    size: 3 + r() * 5,
    delay: r() * 5,
    dur: 4 + r() * 3,
    hue: r() > 0.5 ? '#00ffcc' : '#aa88ff',
  }));
})();

// ── Crystal cluster data ──────────────────────────────────────────────────
const CRYSTAL_CLUSTERS = [
  { id: 0, x: 8,  y: 56, scale: 1.0, color: '#00ffcc', rotation: -8 },
  { id: 1, x: 55, y: 52, scale: 1.3, color: '#88aaff', rotation: 6  },
  { id: 2, x: 82, y: 58, scale: 0.9, color: '#00ffcc', rotation: -4 },
];

// ── Spark positions per cluster (relative offsets) ────────────────────────
const SPARK_OFFSETS = [
  { x: -12, y: -18, delay: 0    },
  { x:  12, y: -22, delay: 0.15 },
  { x:   0, y: -30, delay: 0.3  },
  { x: -18, y: -10, delay: 0.08 },
  { x:  18, y: -8,  delay: 0.22 },
];

// ── Single crystal SVG (simplified inline crystal, not the full CrystalElm) ─
function CrystalSVG({ color, width, height }) {
  const c = color || '#00ffcc';
  return (
    <svg width={width} height={height} viewBox="0 0 40 70" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`pe-cg-${c.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={c}       stopOpacity="0.95" />
          <stop offset="50%"  stopColor={c}       stopOpacity="0.6" />
          <stop offset="100%" stopColor="#002233" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* Crystal body */}
      <polygon
        points="20,0 36,20 32,55 20,70 8,55 4,20"
        fill={`url(#pe-cg-${c.replace('#','')})`}
        stroke={c}
        strokeWidth="1"
        strokeOpacity="0.8"
      />
      {/* Facet lines */}
      <line x1="20" y1="0"  x2="8"  y2="22" stroke={c} strokeWidth="0.6" strokeOpacity="0.5" />
      <line x1="20" y1="0"  x2="32" y2="22" stroke={c} strokeWidth="0.6" strokeOpacity="0.5" />
      <line x1="8"  y1="22" x2="32" y2="22" stroke={c} strokeWidth="0.6" strokeOpacity="0.4" />
      {/* Shine */}
      <ellipse cx="14" cy="16" rx="4" ry="7" fill="white" opacity="0.18" transform="rotate(-20, 14, 16)" />
    </svg>
  );
}

// ── Crystal cluster with hover sparks ─────────────────────────────────────
function CrystalCluster({ data }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${data.x}%`,
        bottom: `${100 - data.y}%`,
        transform: `rotate(${data.rotation}deg) scale(${data.scale})`,
        cursor: 'pointer',
        zIndex: 8,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cluster of 3 crystals at slightly different heights/angles */}
      <div style={{ position: 'relative', width: 80, height: 100 }}>
        <div style={{
          position: 'absolute', left: 0, bottom: 0,
          animation: 'pe-crystalGlow 2.5s ease-in-out infinite',
        }}>
          <CrystalSVG color={data.color} width={28} height={62} />
        </div>
        <div style={{
          position: 'absolute', left: 22, bottom: 0,
          animation: 'pe-crystalGlow 2.5s ease-in-out infinite 0.5s',
          transform: 'rotate(8deg) scaleX(-1)',
        }}>
          <CrystalSVG color={data.color} width={36} height={80} />
        </div>
        <div style={{
          position: 'absolute', left: 44, bottom: 0,
          animation: 'pe-crystalGlow 2.5s ease-in-out infinite 1s',
          transform: 'rotate(-5deg)',
        }}>
          <CrystalSVG color={data.color} width={24} height={55} />
        </div>

        {/* Hover sparks */}
        <AnimatePresence>
          {hovered && SPARK_OFFSETS.map((sp) => (
            <motion.div
              key={sp.delay}
              initial={{ opacity: 0, scale: 0, x: 40, y: 50 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.3, 0],
                x: 40 + sp.x,
                y: 50 + sp.y,
              }}
              transition={{
                duration: 0.6,
                delay: sp.delay,
                repeat: Infinity,
                repeatDelay: 0.3,
              }}
              style={{
                position: 'absolute',
                width: 6, height: 6,
                pointerEvents: 'none',
              }}
            >
              <svg width="6" height="6" viewBox="0 0 6 6">
                <polygon points="3,0 3.8,2.2 6,3 3.8,3.8 3,6 2.2,3.8 0,3 2.2,2.2" fill={data.color} />
              </svg>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Glow ring on hover */}
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0.6, 1.4, 2] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{
              position: 'absolute',
              left: '50%', top: '50%',
              width: 70, height: 70,
              borderRadius: '50%',
              border: `2px solid ${data.color}`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
}

// ── Alien ruins structure ─────────────────────────────────────────────────
function AncientRuins() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        left: '38%',
        bottom: '18%',
        zIndex: 6,
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Ruins SVG */}
      <div style={{
        animation: hovered ? 'pe-ruinsPulse 1.2s ease-in-out infinite' : undefined,
        border: '1.5px solid rgba(255,120,0,0.25)',
        borderRadius: 4,
        padding: '2px 4px',
        transition: 'border-color 0.3s',
      }}>
        <svg width="110" height="90" viewBox="0 0 110 90" aria-label="Ancient alien ruins">
          <defs>
            <linearGradient id="pe-ruinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#5a3010" />
              <stop offset="100%" stopColor="#2a1505" />
            </linearGradient>
          </defs>

          {/* Base platform */}
          <rect x="5"  y="75" width="100" height="14" rx="2" fill="url(#pe-ruinGrad)" stroke="#7a4820" strokeWidth="1" />

          {/* Left broken column */}
          <rect x="12" y="38" width="16" height="37" fill="#4a2808" stroke="#7a4820" strokeWidth="1" />
          <rect x="10" y="32" width="20" height="9"  rx="1" fill="#5a3010" stroke="#8a5520" strokeWidth="1" />
          {/* Column crack */}
          <line x1="18" y1="38" x2="22" y2="55" stroke="#2a1505" strokeWidth="1.2" />

          {/* Right tall column */}
          <rect x="82" y="22" width="18" height="53" fill="#4a2808" stroke="#7a4820" strokeWidth="1" />
          <rect x="80" y="16" width="22" height="9"  rx="1" fill="#5a3010" stroke="#8a5520" strokeWidth="1" />

          {/* Broken arch (partial) */}
          <path
            d="M 28 75 L 28 45 Q 28 30 55 30 Q 68 30 68 45 L 68 62"
            stroke="#8a5520"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />

          {/* Alien glyphs on central block */}
          <rect x="38" y="52" width="28" height="20" rx="2" fill="#3a2006" stroke="#7a4820" strokeWidth="1" />
          {/* Glyph symbols */}
          <text x="41" y="64" fill={hovered ? '#ff8833' : '#aa6622'} fontSize="9" fontFamily="monospace"
            style={{ transition: 'fill 0.3s' }}>
            ⌬ ∴ ☍
          </text>

          {/* Scattered rubble */}
          <ellipse cx="35"  cy="87" rx="6"  ry="3" fill="#3a2006" />
          <ellipse cx="75"  cy="85" rx="8"  ry="3" fill="#3a2006" />
          <ellipse cx="58"  cy="88" rx="4"  ry="2" fill="#3a2006" />

          {/* Glow effect when hovered */}
          {hovered && (
            <motion.rect
              x="5" y="5" width="100" height="80" rx="4"
              fill="none"
              stroke="#ff8833"
              strokeWidth="1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </svg>
      </div>

      {/* RUINS DETECTED badge */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{
              position: 'absolute',
              top: -28,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255, 100, 0, 0.18)',
              border: '1px solid rgba(255,120,0,0.7)',
              borderRadius: 4,
              padding: '3px 10px',
              color: '#ff9944',
              fontFamily: 'monospace',
              fontSize: 11,
              fontWeight: 'bold',
              letterSpacing: 2,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              boxShadow: '0 0 10px rgba(255,120,0,0.3)',
            }}
          >
            ◈ RUINS DETECTED
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Rocky terrain SVG (jagged mountain silhouette) ────────────────────────
function TerrainSVG() {
  return (
    <svg
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        bottom: 0, left: 0,
        width: '100%', height: '200px',
        zIndex: 2,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pe-terrainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#6b3410" />
          <stop offset="40%"  stopColor="#4a2208" />
          <stop offset="100%" stopColor="#1a0c03" />
        </linearGradient>
      </defs>
      {/* Far mountains (lighter) */}
      <path
        d="M0,180 L60,120 L100,145 L160,90 L210,130 L260,80 L320,110 L380,60
           L430,100 L490,50 L540,90 L600,40 L650,85 L710,45 L760,80 L820,30
           L870,70 L930,20 L980,65 L1040,30 L1090,60 L1140,25 L1200,55 L1200,200 L0,200 Z"
        fill="#3a1a06"
        opacity="0.6"
      />
      {/* Near mountains (darker, more detailed) */}
      <path
        d="M0,200 L0,175 L30,155 L55,168 L85,140 L110,160 L145,125 L175,148
           L200,118 L230,138 L265,100 L300,130 L325,108 L355,128 L380,95
           L415,118 L445,85 L475,112 L510,78 L540,105 L568,82 L600,110
           L625,88 L658,115 L685,90 L715,118 L745,95 L775,120 L800,98
           L835,125 L865,102 L895,128 L920,108 L950,135 L975,115 L1005,142
           L1030,118 L1060,148 L1085,130 L1115,155 L1145,138 L1170,158 L1200,145 L1200,200 Z"
        fill="url(#pe-terrainGrad)"
      />
      {/* Rock texture highlights */}
      <path
        d="M145,125 L155,140 L165,128" stroke="#7a4420" strokeWidth="1.5" fill="none" opacity="0.7" />
      <path
        d="M265,100 L280,118 L295,105" stroke="#7a4420" strokeWidth="1.5" fill="none" opacity="0.7" />
      <path
        d="M445,85 L460,102 L475,88" stroke="#7a4420" strokeWidth="1.5" fill="none" opacity="0.7" />
      <path
        d="M685,90 L700,108 L715,92" stroke="#7a4420" strokeWidth="1.5" fill="none" opacity="0.7" />
      <path
        d="M865,102 L880,122 L895,105" stroke="#7a4420" strokeWidth="1.5" fill="none" opacity="0.7" />
    </svg>
  );
}

// ── Alien flora (glowing plants) ──────────────────────────────────────────
const FLORA_ITEMS = [
  { id: 0, x: 3,   bottom: 14, scale: 0.7,  type: 'tall',  color: '#aa44ff', sway: 'pe-plantSway'  },
  { id: 1, x: 15,  bottom: 14, scale: 0.5,  type: 'bulb',  color: '#4488ff', sway: 'pe-plantSway2' },
  { id: 2, x: 22,  bottom: 14, scale: 0.8,  type: 'tall',  color: '#7755ff', sway: 'pe-plantSway'  },
  { id: 3, x: 63,  bottom: 14, scale: 0.6,  type: 'bulb',  color: '#00ffcc', sway: 'pe-plantSway2' },
  { id: 4, x: 70,  bottom: 14, scale: 0.9,  type: 'tall',  color: '#aa44ff', sway: 'pe-plantSway'  },
  { id: 5, x: 88,  bottom: 14, scale: 0.6,  type: 'tall',  color: '#4466ff', sway: 'pe-plantSway2' },
  { id: 6, x: 94,  bottom: 14, scale: 0.7,  type: 'bulb',  color: '#7755ff', sway: 'pe-plantSway'  },
];

function FloraItem({ data }) {
  const { color, sway, scale, type } = data;
  const h = type === 'tall' ? 70 : 50;
  const w = type === 'tall' ? 22 : 28;

  return (
    <div style={{
      position: 'absolute',
      left: `${data.x}%`,
      bottom: `${data.bottom}%`,
      transform: `scale(${scale})`,
      transformOrigin: 'bottom center',
      zIndex: 5,
      animation: `${sway} ${2.5 + scale}s ease-in-out infinite`,
      filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 14px ${color})`,
      pointerEvents: 'none',
    }}>
      {type === 'tall' ? (
        <svg width={w} height={h} viewBox="0 0 22 70" aria-hidden="true">
          {/* Stem */}
          <path d="M11 70 Q 8 50 11 30 Q 14 15 11 0" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Side leaves */}
          <path d="M11 50 Q 0 42 3 35" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M11 40 Q 22 32 19 25" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M11 28 Q 2 18 5 12" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* Top bloom */}
          <circle cx="11" cy="0" r="6" fill={color} opacity="0.6" />
          <circle cx="11" cy="0" r="3" fill={color} opacity="0.9" />
        </svg>
      ) : (
        <svg width={w} height={h} viewBox="0 0 28 50" aria-hidden="true">
          {/* Stem */}
          <path d="M14 50 Q 12 36 14 24" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Bulb top */}
          <ellipse cx="14" cy="16" rx="9" ry="12" fill={color} opacity="0.35" />
          <ellipse cx="14" cy="16" rx="6"  ry="8"  fill={color} opacity="0.6" />
          <ellipse cx="14" cy="14" rx="3"  ry="4"  fill={color} opacity="0.9" />
          {/* Glow dots */}
          <circle cx="8"  cy="14" r="1.5" fill={color} />
          <circle cx="20" cy="14" r="1.5" fill={color} />
          <circle cx="14" cy="9"  r="1.5" fill={color} />
        </svg>
      )}
    </div>
  );
}

// ── The Odyssey ship (landed in background) ────────────────────────────────
function OdysseyShip() {
  return (
    <div style={{
      position: 'absolute',
      right: '12%',
      bottom: '22%',
      zIndex: 4,
      animation: 'pe-shipHover 4s ease-in-out infinite',
      filter: 'drop-shadow(0 0 10px rgba(0,200,255,0.4)) drop-shadow(0 10px 8px rgba(0,0,0,0.5))',
      pointerEvents: 'none',
    }}>
      <svg width="90" height="58" viewBox="0 0 90 58" aria-label="The Odyssey ship landed">
        <defs>
          <linearGradient id="pe-shipBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#8899bb" />
            <stop offset="50%"  stopColor="#445577" />
            <stop offset="100%" stopColor="#223355" />
          </linearGradient>
          <linearGradient id="pe-shipWing" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#556688" />
            <stop offset="100%" stopColor="#1a2a44" />
          </linearGradient>
        </defs>

        {/* Engine glow / landing pad light */}
        <ellipse cx="45" cy="54" rx="32" ry="5" fill="#003366" opacity="0.5" />
        <ellipse cx="45" cy="54" rx="20" ry="3" fill="#0055aa" opacity="0.4" />

        {/* Left wing */}
        <path d="M 10 38 L 30 28 L 32 44 L 8 46 Z" fill="url(#pe-shipWing)" stroke="#667799" strokeWidth="0.8" />
        {/* Right wing */}
        <path d="M 80 38 L 60 28 L 58 44 L 82 46 Z" fill="url(#pe-shipWing)" stroke="#667799" strokeWidth="0.8" />

        {/* Main hull */}
        <ellipse cx="45" cy="36" rx="26" ry="13" fill="url(#pe-shipBody)" stroke="#7788aa" strokeWidth="1" />

        {/* Cockpit dome */}
        <path
          d="M 30 36 Q 30 18 45 16 Q 60 18 60 36"
          fill="#1a3055"
          stroke="#7788aa"
          strokeWidth="0.8"
        />
        {/* Cockpit window glow */}
        <ellipse cx="45" cy="28" rx="9" ry="7" fill="#004488" opacity="0.7" />
        <ellipse cx="45" cy="26" rx="5" ry="4" fill="#0066cc" opacity="0.5" />
        <ellipse cx="43" cy="24" rx="2" ry="2" fill="white" opacity="0.3" />

        {/* Hull details — panel lines */}
        <line x1="30" y1="30" x2="60" y2="30" stroke="#667799" strokeWidth="0.6" opacity="0.7" />
        <line x1="26" y1="36" x2="64" y2="36" stroke="#667799" strokeWidth="0.6" opacity="0.7" />
        <circle cx="22" cy="38" r="2.5" fill="#00aacc" opacity="0.8" />
        <circle cx="68" cy="38" r="2.5" fill="#00aacc" opacity="0.8" />

        {/* Landing struts */}
        <line x1="35" y1="47" x2="32" y2="55" stroke="#445566" strokeWidth="2" strokeLinecap="round" />
        <line x1="45" y1="48" x2="45" y2="55" stroke="#445566" strokeWidth="2" strokeLinecap="round" />
        <line x1="55" y1="47" x2="58" y2="55" stroke="#445566" strokeWidth="2" strokeLinecap="round" />
        {/* Foot pads */}
        <ellipse cx="32" cy="55" rx="4" ry="2" fill="#334455" />
        <ellipse cx="45" cy="55" rx="4" ry="2" fill="#334455" />
        <ellipse cx="58" cy="55" rx="4" ry="2" fill="#334455" />
      </svg>
    </div>
  );
}

// ── Dual moons ────────────────────────────────────────────────────────────
function Moons() {
  return (
    <>
      {/* Moon 1 — large, upper-left */}
      <div style={{
        position: 'absolute',
        top: '6%', left: '8%',
        animation: 'pe-moonFloat 6s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 1,
      }}>
        <svg width="58" height="58" viewBox="0 0 58 58" aria-label="Moon 1">
          <defs>
            <radialGradient id="pe-moon1" cx="35%" cy="32%" r="65%">
              <stop offset="0%"   stopColor="#ddbbaa" />
              <stop offset="60%"  stopColor="#996644" />
              <stop offset="100%" stopColor="#553322" />
            </radialGradient>
          </defs>
          <circle cx="29" cy="29" r="27" fill="url(#pe-moon1)" />
          {/* Craters */}
          <circle cx="20" cy="24" r="5"  fill="#773322" opacity="0.5" />
          <circle cx="36" cy="34" r="7"  fill="#773322" opacity="0.4" />
          <circle cx="28" cy="16" r="3"  fill="#773322" opacity="0.5" />
          {/* Rim highlight */}
          <path d="M 8 20 Q 12 8 24 6" stroke="#ffccaa" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
        </svg>
      </div>

      {/* Moon 2 — small, upper-right */}
      <div style={{
        position: 'absolute',
        top: '12%', right: '5%',
        animation: 'pe-moonFloat 8s ease-in-out infinite 2s',
        pointerEvents: 'none',
        zIndex: 1,
      }}>
        <svg width="34" height="34" viewBox="0 0 34 34" aria-label="Moon 2">
          <defs>
            <radialGradient id="pe-moon2" cx="38%" cy="30%" r="65%">
              <stop offset="0%"   stopColor="#ccddee" />
              <stop offset="60%"  stopColor="#8899bb" />
              <stop offset="100%" stopColor="#334466" />
            </radialGradient>
          </defs>
          <circle cx="17" cy="17" r="16" fill="url(#pe-moon2)" />
          <circle cx="11" cy="14" r="3"  fill="#556688" opacity="0.5" />
          <circle cx="20" cy="20" r="4"  fill="#556688" opacity="0.4" />
          <path d="M 4 12 Q 7 5 14 4" stroke="#cce0ff" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />
        </svg>
      </div>
    </>
  );
}

// ── Atmospheric haze / fog layer ──────────────────────────────────────────
function AtmoFog() {
  return (
    <div style={{
      position: 'absolute',
      bottom: '12%',
      left: '-5%',
      width: '110%',
      height: '120px',
      background: 'linear-gradient(to top, rgba(0,180,140,0.22) 0%, rgba(0,200,160,0.10) 40%, transparent 100%)',
      animation: 'pe-fogDrift 12s ease-in-out infinite',
      pointerEvents: 'none',
      zIndex: 3,
    }} aria-hidden="true" />
  );
}

// ── Floating alien spore particles ─────────────────────────────────────────
function FloatingSpores() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 7 }} aria-hidden="true">
      {SPORES.map(s => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            bottom: `${s.baseY}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: s.hue,
            opacity: 0.7,
            boxShadow: `0 0 ${s.size * 2}px ${s.hue}`,
            animation: `pe-sporeFloat ${s.dur}s ease-in-out infinite ${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Light particle emitter from crystals ──────────────────────────────────
const LIGHT_PARTICLES = (() => {
  const r = seededRand(98765);
  return Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: [10, 56, 83][i % 3] + (r() - 0.5) * 6,
    y: 45 + r() * 10,
    size: 2 + r() * 3,
    delay: r() * 4,
    dur: 2.5 + r() * 2,
    color: r() > 0.5 ? '#00ffcc' : '#88aaff',
  }));
})();

function LightParticles() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9 }} aria-hidden="true">
      {LIGHT_PARTICLES.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            animation: `pe-particleFly ${p.dur}s ease-out infinite ${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── START LEARNING MISSION button ─────────────────────────────────────────
function MissionButton({ onStart }) {
  const [scanning, setScanning] = useState(false);

  const handleClick = () => {
    setScanning(true);
    setTimeout(() => onStart(), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ display: 'inline-block' }}
    >
      <button
        onClick={handleClick}
        style={{
          position: 'relative',
          padding: '14px 36px',
          background: 'linear-gradient(135deg, rgba(0,60,50,0.95), rgba(0,40,35,0.95))',
          border: '2px solid #00ffcc',
          borderRadius: 6,
          color: '#00ffcc',
          fontFamily: 'monospace',
          fontSize: 14,
          fontWeight: 'bold',
          letterSpacing: 3,
          cursor: 'pointer',
          overflow: 'hidden',
          animation: 'pe-btnGlow 2s ease-in-out infinite',
          textTransform: 'uppercase',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,80,65,0.98), rgba(0,60,50,0.98))';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,60,50,0.95), rgba(0,40,35,0.95))';
        }}
      >
        {/* Scan line sweep */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '30%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(0,255,200,0.22), transparent)',
          animation: 'pe-btnScan 1.8s linear infinite',
          pointerEvents: 'none',
        }} />
        ▶ START LEARNING MISSION
      </button>
    </motion.div>
  );
}

// ── Main PlanetExploreScene ───────────────────────────────────────────────
export default function PlanetExploreScene() {
  const { state, dispatch } = useGame();
  const sound = useSound();
  const captainName = state.captain.name || 'Captain';

  const [zyroVisible, setZyroVisible]       = useState(false);
  const [zyroMessageDone, setZyroMessageDone] = useState(false);

  // Inject CSS keyframes once on mount
  useEffect(() => {
    ensurePeStyles();
  }, []);

  // Zyro appears after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setZyroVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const zyroMessage = `Hello, Captain ${captainName}! I am ZYRO. I have been studying the Elm crystals of this planet. I can help you on your mission!`;

  const handleStartMission = () => {
    sound.playNavigation();
    dispatch({ type: 'START_MISSION' });
    dispatch({ type: 'SET_SCENE', payload: SCENES.MISSION });
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #0d0818 0%, #1a0a2e 20%, #2d0e1a 50%, #3d1a05 80%, #2a0c02 100%)',
        backgroundSize: '200% 200%',
        animation: 'pe-skyShift 20s ease-in-out infinite',
      }}
      role="main"
      aria-label="Planet of Ruin — alien landscape"
    >
      {/* ── Starfield ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }} aria-hidden="true">
        {STARS.map(s => (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: 'white',
              animation: `pe-starTwinkle ${s.dur}s ease-in-out infinite ${s.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ── Moons ── */}
      <Moons />

      {/* ── Background glow / nebula haze ── */}
      <div style={{
        position: 'absolute',
        top: '15%', left: '30%',
        width: '500px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(80,0,120,0.18) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} aria-hidden="true" />
      <div style={{
        position: 'absolute',
        top: '25%', right: '10%',
        width: '350px', height: '250px',
        background: 'radial-gradient(ellipse, rgba(0,80,120,0.14) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} aria-hidden="true" />

      {/* ── Odyssey ship (background) ── */}
      <OdysseyShip />

      {/* ── Alien flora ── */}
      {FLORA_ITEMS.map(f => <FloraItem key={f.id} data={f} />)}

      {/* ── Crystal clusters (interactive) ── */}
      {CRYSTAL_CLUSTERS.map(c => <CrystalCluster key={c.id} data={c} />)}

      {/* ── Ancient ruins (interactive) ── */}
      <AncientRuins />

      {/* ── Atmospheric fog ── */}
      <AtmoFog />

      {/* ── Terrain (drawn over fog base) ── */}
      <TerrainSVG />

      {/* ── Light particles from crystals ── */}
      <LightParticles />

      {/* ── Floating spores ── */}
      <FloatingSpores />

      {/* ── HUD: Scene title ── */}
      <div style={{
        position: 'absolute',
        top: 20, left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        textAlign: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{
          color: '#ff8833',
          fontFamily: 'monospace',
          fontSize: 11,
          letterSpacing: 4,
          opacity: 0.75,
          textTransform: 'uppercase',
        }}>
          ◈ PLANET OF RUIN — SURFACE LANDING ZONE ◈
        </div>
      </div>

      {/* ── Zyro introduction ── */}
      <AnimatePresence>
        {zyroVisible && (
          <motion.div
            key="zyro-entrance"
            initial={{ x: 120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 120, opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            style={{
              /* Outer wrapper: only handles animation + positioning.
                 overflow:visible so the speech bubble (position:absolute
                 bottom:100% inside ZyroCharacter) is never clipped. */
              position: 'absolute',
              bottom: '5%',
              right: '3%',
              zIndex: 15,
              /* Give it a max height equal to most of the viewport so the
                 inner scroll div knows its boundary. */
              maxHeight: 'calc(100vh - 80px)',
              /* flex column so the inner scroll div can stretch to fill */
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Inner scroll container.
                Suppress webkit scrollbar without a global rule. */}
            <style>{`.pe-zyro-scroll::-webkit-scrollbar{display:none}`}</style>
            <div
              className="pe-zyro-scroll"
              style={{
                /* flex:1 + min-height:0 — the critical pair for overflow-y
                   to work inside a flex child. Without min-height:0 the flex
                   child grows to fit its content and never actually scrolls. */
                flex: '1 1 auto',
                minHeight: 0,
                overflowY: 'auto',
                /* overflow-x visible so the speech bubble (wider than Zyro)
                   can still show without being clipped horizontally. */
                overflowX: 'visible',
                /* Momentum scrolling on iOS Safari */
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                /* Inner layout */
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                /* Bottom padding so the button is not clipped by browser chrome
                   (address bar, navigation bar) on mobile. */
                paddingBottom: 24,
                /* Top padding so the speech bubble above Zyro has breathing room */
                paddingTop: 8,
              }}
            >
              <ZyroCharacter
                message={zyroMessage}
                emotion="happy"
                size={110}
                onDone={() => setZyroMessageDone(true)}
              />

              {/* START MISSION button — appears after message finishes */}
              <AnimatePresence>
                {zyroMessageDone && (
                  <MissionButton key="mission-btn" onStart={handleStartMission} />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom gradient darkening (depth) ── */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0,
        width: '100%', height: '80px',
        background: 'linear-gradient(to top, rgba(10,4,2,0.6), transparent)',
        pointerEvents: 'none',
        zIndex: 11,
      }} aria-hidden="true" />
    </div>
  );
}
