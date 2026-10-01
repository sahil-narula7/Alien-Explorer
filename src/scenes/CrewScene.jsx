import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, SCENES } from '../context/GameContext';

// ── Crew data ─────────────────────────────────────────────────────────────────
const CREW = [
  {
    id: 'captain',
    name: 'CAPTAIN',
    subName: '(You)',
    role: 'Commander',
    specialty: 'Leadership & Strategy',
    bio: 'The heart of every expedition. You will guide the Odyssey crew through the unknown.',
    color: '#ffd700',
    glowColor: 'rgba(255, 215, 0, 0.55)',
  },
  {
    id: 'vela',
    name: 'VELA ZORN',
    subName: null,
    role: 'Chief Scientist',
    specialty: 'Physics & Energy',
    bio: 'The brilliant mind who discovered the core collapse. Carries the weight of Xlama on her shoulders.',
    color: '#00ffcc',
    glowColor: 'rgba(0, 255, 204, 0.55)',
  },
  {
    id: 'krix',
    name: 'KRIX-7',
    subName: null,
    role: 'Engineering AI',
    specialty: 'Ship Systems & Repairs',
    bio: 'A sophisticated android built to maintain the Odyssey. Half machine, half mystery.',
    color: '#4488ff',
    glowColor: 'rgba(68, 136, 255, 0.55)',
  },
  {
    id: 'luma',
    name: 'LUMA',
    subName: null,
    role: 'Navigator',
    specialty: 'Astrocartography',
    bio: 'Can map entire star systems from memory. Has never been wrong... yet.',
    color: '#ff88aa',
    glowColor: 'rgba(255, 136, 170, 0.55)',
  },
  {
    id: 'orion',
    name: 'ORION VALE',
    subName: null,
    role: 'Combat Specialist',
    specialty: 'Defense & Exploration',
    bio: 'Decorated veteran of the Xlama Defense Corps. Fierce, loyal, and ready for anything.',
    color: '#ff6600',
    glowColor: 'rgba(255, 102, 0, 0.55)',
  },
];

// ── Fan rotation angles for each card ─────────────────────────────────────────
const FAN_ANGLES = [-6, -3, 0, 3, 6];

// ── Card flip-in variants ─────────────────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 120, rotateX: -40, scale: 0.85 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    rotate: FAN_ANGLES[i],
    transition: {
      duration: 0.75,
      delay: 0.3 + i * 0.15,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

// ── Avatar SVGs ───────────────────────────────────────────────────────────────

function AvatarCaptain({ color }) {
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="cap-bg" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.7" />
        </radialGradient>
      </defs>
      <circle cx="45" cy="45" r="44" fill="url(#cap-bg)" stroke={color} strokeWidth="1.5" />
      {/* body / uniform */}
      <rect x="26" y="60" width="38" height="22" rx="8" fill={color} fillOpacity="0.8" />
      {/* rank stripe */}
      <rect x="26" y="60" width="38" height="5" rx="3" fill={color} />
      {/* medal pip left */}
      <circle cx="33" cy="70" r="3" fill="#fff" fillOpacity="0.9" />
      {/* medal pip right */}
      <circle cx="57" cy="70" r="3" fill="#fff" fillOpacity="0.9" />
      {/* neck */}
      <rect x="39" y="50" width="12" height="12" rx="4" fill="#e8c090" />
      {/* head */}
      <ellipse cx="45" cy="38" rx="15" ry="17" fill="#e8c090" />
      {/* eyes */}
      <circle cx="39" cy="36" r="3" fill="#1a0a00" />
      <circle cx="51" cy="36" r="3" fill="#1a0a00" />
      <circle cx="40" cy="35" r="1" fill="#fff" fillOpacity="0.8" />
      <circle cx="52" cy="35" r="1" fill="#fff" fillOpacity="0.8" />
      {/* mouth - confident smile */}
      <path d="M40 43 Q45 47 50 43" stroke="#8a5a3a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* captain's cap */}
      <ellipse cx="45" cy="23" rx="18" ry="5" fill={color} />
      <rect x="30" y="18" width="30" height="8" rx="4" fill={color} fillOpacity="0.9" />
      {/* star badge */}
      <polygon points="45,14 46.5,18.5 51,18.5 47.5,21 48.8,25.5 45,23 41.2,25.5 42.5,21 39,18.5 43.5,18.5" fill="#fff" fillOpacity="0.95" />
    </svg>
  );
}

function AvatarVela({ color }) {
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="vela-bg" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.7" />
        </radialGradient>
      </defs>
      <circle cx="45" cy="45" r="44" fill="url(#vela-bg)" stroke={color} strokeWidth="1.5" />
      {/* lab coat / body */}
      <rect x="24" y="58" width="42" height="24" rx="10" fill="#ffffff" fillOpacity="0.15" />
      {/* lab coat lapels */}
      <path d="M36 58 L45 68 L54 58" stroke={color} strokeWidth="1.5" fill="none" />
      {/* device in hand */}
      <rect x="56" y="60" width="10" height="14" rx="2" fill={color} fillOpacity="0.7" />
      <circle cx="61" cy="67" r="3" fill="#fff" fillOpacity="0.8" />
      {/* neck */}
      <rect x="39" y="48" width="12" height="12" rx="4" fill="#d4b8a0" />
      {/* head */}
      <ellipse cx="45" cy="36" rx="14" ry="16" fill="#d4b8a0" />
      {/* hair - pulled back, scientist look */}
      <ellipse cx="45" cy="24" rx="14" ry="7" fill="#2a1a50" />
      <rect x="31" y="24" width="5" height="18" rx="2" fill="#2a1a50" />
      <rect x="54" y="24" width="5" height="18" rx="2" fill="#2a1a50" />
      {/* eyes - intelligent, wide */}
      <ellipse cx="39" cy="35" rx="3.5" ry="4" fill="#1a3a2a" />
      <ellipse cx="51" cy="35" rx="3.5" ry="4" fill="#1a3a2a" />
      <circle cx="40" cy="34" r="1.2" fill={color} fillOpacity="0.9" />
      <circle cx="52" cy="34" r="1.2" fill={color} fillOpacity="0.9" />
      {/* glasses */}
      <circle cx="39" cy="35" r="5" stroke={color} strokeWidth="1" fill="none" />
      <circle cx="51" cy="35" r="5" stroke={color} strokeWidth="1" fill="none" />
      <line x1="44" y1="35" x2="46" y2="35" stroke={color} strokeWidth="1" />
      {/* mouth */}
      <path d="M41 43 Q45 46 49 43" stroke="#8a6a5a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* energy aura */}
      <circle cx="45" cy="36" r="22" stroke={color} strokeWidth="0.5" strokeOpacity="0.3" />
    </svg>
  );
}

function AvatarKrix({ color }) {
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="krix-bg" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.7" />
        </radialGradient>
      </defs>
      <circle cx="45" cy="45" r="44" fill="url(#krix-bg)" stroke={color} strokeWidth="1.5" />
      {/* torso - mechanical chassis */}
      <rect x="27" y="55" width="36" height="26" rx="6" fill="#1a2a3a" stroke={color} strokeWidth="1" />
      {/* chest panel */}
      <rect x="33" y="60" width="24" height="14" rx="3" fill="#0a1520" stroke={color} strokeWidth="0.8" />
      {/* circuit lines on chest */}
      <line x1="37" y1="64" x2="53" y2="64" stroke={color} strokeWidth="0.8" strokeOpacity="0.7" />
      <line x1="37" y1="68" x2="47" y2="68" stroke={color} strokeWidth="0.8" strokeOpacity="0.7" />
      <circle cx="51" cy="68" r="2" fill={color} fillOpacity="0.8" />
      {/* neck - mechanical cylinder */}
      <rect x="40" y="47" width="10" height="10" rx="2" fill="#1a2a3a" stroke={color} strokeWidth="0.8" />
      {/* head - boxy robot */}
      <rect x="29" y="25" width="32" height="26" rx="5" fill="#1a2a3a" stroke={color} strokeWidth="1.5" />
      {/* visor strip */}
      <rect x="32" y="31" width="26" height="10" rx="3" fill="#0a1520" />
      {/* eyes - LED dots */}
      <circle cx="39" cy="36" r="3.5" fill={color} fillOpacity="0.9" />
      <circle cx="51" cy="36" r="3.5" fill={color} fillOpacity="0.9" />
      <circle cx="39" cy="36" r="1.5" fill="#fff" />
      <circle cx="51" cy="36" r="1.5" fill="#fff" />
      {/* mouth - data port */}
      <rect x="37" y="43" width="16" height="5" rx="2" fill="#0a1520" stroke={color} strokeWidth="0.8" />
      <line x1="40" y1="45.5" x2="50" y2="45.5" stroke={color} strokeWidth="1" strokeOpacity="0.6" />
      {/* antenna */}
      <line x1="45" y1="25" x2="45" y2="16" stroke={color} strokeWidth="1.5" />
      <circle cx="45" cy="14" r="3" fill={color} />
      {/* ear panels */}
      <rect x="22" y="30" width="8" height="16" rx="2" fill="#1a2a3a" stroke={color} strokeWidth="0.8" />
      <rect x="60" y="30" width="8" height="16" rx="2" fill="#1a2a3a" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}

function AvatarLuma({ color }) {
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="luma-bg" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.7" />
        </radialGradient>
      </defs>
      <circle cx="45" cy="45" r="44" fill="url(#luma-bg)" stroke={color} strokeWidth="1.5" />
      {/* flight suit / body */}
      <rect x="26" y="58" width="38" height="24" rx="9" fill="#1a1240" />
      {/* navigator badge */}
      <circle cx="45" cy="66" r="7" fill="#0a0820" stroke={color} strokeWidth="1" />
      {/* star chart on badge */}
      <circle cx="45" cy="66" r="2" fill={color} fillOpacity="0.9" />
      <circle cx="40" cy="63" r="1" fill="#fff" fillOpacity="0.6" />
      <circle cx="50" cy="64" r="1" fill="#fff" fillOpacity="0.6" />
      <circle cx="43" cy="70" r="1" fill="#fff" fillOpacity="0.6" />
      <line x1="45" y1="66" x2="40" y2="63" stroke={color} strokeWidth="0.5" strokeOpacity="0.6" />
      <line x1="45" y1="66" x2="50" y2="64" stroke={color} strokeWidth="0.5" strokeOpacity="0.6" />
      {/* neck */}
      <rect x="39" y="48" width="12" height="12" rx="4" fill="#f0c0b0" />
      {/* head */}
      <ellipse cx="45" cy="36" rx="14" ry="16" fill="#f0c0b0" />
      {/* hair - flowing, wavy */}
      <path d="M31 30 Q28 20 33 15 Q38 10 45 12 Q52 10 57 15 Q62 20 59 30" fill="#5a2070" />
      <path d="M31 30 Q29 38 31 45" stroke="#5a2070" strokeWidth="4" fill="none" />
      <path d="M59 30 Q61 38 59 45" stroke="#5a2070" strokeWidth="4" fill="none" />
      {/* eyes - dreamy */}
      <ellipse cx="39" cy="35" rx="3.5" ry="4" fill="#2a1050" />
      <ellipse cx="51" cy="35" rx="3.5" ry="4" fill="#2a1050" />
      <circle cx="40" cy="34" r="1.5" fill={color} fillOpacity="0.85" />
      <circle cx="52" cy="34" r="1.5" fill={color} fillOpacity="0.85" />
      {/* eyelashes - upper */}
      <line x1="36" y1="31" x2="34" y2="29" stroke="#5a2070" strokeWidth="1" />
      <line x1="39" y1="31" x2="39" y2="28.5" stroke="#5a2070" strokeWidth="1" />
      <line x1="42" y1="31" x2="44" y2="29" stroke="#5a2070" strokeWidth="1" />
      <line x1="48" y1="31" x2="46" y2="29" stroke="#5a2070" strokeWidth="1" />
      <line x1="51" y1="31" x2="51" y2="28.5" stroke="#5a2070" strokeWidth="1" />
      <line x1="54" y1="31" x2="56" y2="29" stroke="#5a2070" strokeWidth="1" />
      {/* smile */}
      <path d="M41 43 Q45 47 49 43" stroke="#b07060" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* floating star particles */}
      <circle cx="22" cy="28" r="1.5" fill={color} fillOpacity="0.7" />
      <circle cx="68" cy="32" r="1" fill={color} fillOpacity="0.5" />
      <circle cx="26" cy="55" r="1" fill={color} fillOpacity="0.4" />
    </svg>
  );
}

function AvatarOrion({ color }) {
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="orion-bg" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.7" />
        </radialGradient>
      </defs>
      <circle cx="45" cy="45" r="44" fill="url(#orion-bg)" stroke={color} strokeWidth="1.5" />
      {/* combat armor torso */}
      <rect x="24" y="56" width="42" height="26" rx="7" fill="#1a1008" stroke={color} strokeWidth="1" />
      {/* shoulder armor left */}
      <rect x="18" y="55" width="14" height="10" rx="4" fill="#2a1808" stroke={color} strokeWidth="0.8" />
      {/* shoulder armor right */}
      <rect x="58" y="55" width="14" height="10" rx="4" fill="#2a1808" stroke={color} strokeWidth="0.8" />
      {/* chest emblem */}
      <polygon points="45,61 47,66 52,66 48.5,69 50,74 45,71 40,74 41.5,69 38,66 43,66"
        fill={color} fillOpacity="0.85" />
      {/* neck - thick, muscular */}
      <rect x="38" y="47" width="14" height="11" rx="3" fill="#c8a070" />
      {/* head */}
      <ellipse cx="45" cy="34" rx="16" ry="17" fill="#c8a070" />
      {/* short military hair */}
      <ellipse cx="45" cy="20" rx="16" ry="7" fill="#2a1800" />
      {/* scar - battle worn */}
      <path d="M50 30 L53 38" stroke="#8a5020" strokeWidth="1.5" strokeLinecap="round" />
      {/* eyes - intense */}
      <ellipse cx="38" cy="34" rx="4" ry="3.5" fill="#1a0800" />
      <ellipse cx="52" cy="34" rx="4" ry="3.5" fill="#1a0800" />
      <circle cx="39" cy="33.5" r="1.5" fill="#c07030" />
      <circle cx="53" cy="33.5" r="1.5" fill="#c07030" />
      {/* furrowed brow */}
      <path d="M34 30 L42 32" stroke="#8a5020" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M48 32 L56 30" stroke="#8a5020" strokeWidth="1.5" strokeLinecap="round" />
      {/* mouth - determined */}
      <path d="M39 42 L51 42" stroke="#8a5020" strokeWidth="2" strokeLinecap="round" />
      {/* jaw line definition */}
      <path d="M30 38 Q32 50 45 52 Q58 50 60 38" stroke="#a07040" strokeWidth="0.8" fill="none" strokeOpacity="0.5" />
    </svg>
  );
}

const AVATAR_MAP = {
  captain: AvatarCaptain,
  vela: AvatarVela,
  krix: AvatarKrix,
  luma: AvatarLuma,
  orion: AvatarOrion,
};

// ── Title variants ────────────────────────────────────────────────────────────
const titleVariants = {
  hidden: { opacity: 0, y: -40, letterSpacing: '0.6em' },
  visible: {
    opacity: 1,
    y: 0,
    letterSpacing: '0.3em',
    transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
  },
};

const subtitleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.4 } },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 1.2 } },
};

// ── CrewCard ──────────────────────────────────────────────────────────────────
function CrewCard({ member, index }) {
  const [hovered, setHovered] = useState(false);
  const AvatarComponent = AVATAR_MAP[member.id];

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="crew-card-inner"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{
        scale: 1.08,
        rotate: 0,
        y: -12,
        zIndex: 10,
        transition: { duration: 0.25, ease: 'easeOut' },
      }}
      style={{
        position: 'relative',
        width: 160,
        background: 'linear-gradient(160deg, rgba(5,8,20,0.97) 0%, rgba(10,16,35,0.97) 100%)',
        borderRadius: 16,
        border: `1.5px solid ${hovered ? member.color : member.color + '88'}`,
        boxShadow: hovered
          ? `0 0 28px 6px ${member.glowColor}, 0 0 8px 2px ${member.glowColor}, inset 0 0 20px ${member.color}15`
          : `0 0 14px 2px ${member.color}44, inset 0 0 10px ${member.color}0a`,
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        cursor: 'default',
        padding: '20px 14px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        transformOrigin: 'bottom center',
        perspective: 800,
      }}
    >
      {/* top accent line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '15%',
        width: '70%',
        height: 2,
        background: `linear-gradient(90deg, transparent, ${member.color}, transparent)`,
        borderRadius: 2,
      }} />

      {/* avatar */}
      <motion.div
        animate={hovered ? { filter: `drop-shadow(0 0 10px ${member.color})` } : { filter: 'none' }}
        transition={{ duration: 0.3 }}
      >
        <AvatarComponent color={member.color} />
      </motion.div>

      {/* name */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: '"Courier New", monospace',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '0.12em',
          color: member.color,
          textShadow: `0 0 8px ${member.color}`,
          lineHeight: 1.2,
        }}>
          {member.name}
        </div>
        {member.subName && (
          <div style={{
            fontSize: 10,
            color: member.color + 'aa',
            fontFamily: '"Courier New", monospace',
            letterSpacing: '0.08em',
          }}>
            {member.subName}
          </div>
        )}
      </div>

      {/* role */}
      <div style={{
        fontFamily: '"Courier New", monospace',
        fontSize: 10,
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        {member.role}
      </div>

      {/* specialty badge */}
      <div style={{
        background: member.color + '22',
        border: `1px solid ${member.color}66`,
        borderRadius: 20,
        padding: '3px 10px',
        fontFamily: '"Courier New", monospace',
        fontSize: 9,
        color: member.color,
        letterSpacing: '0.08em',
        textAlign: 'center',
        lineHeight: 1.4,
      }}>
        {member.specialty}
      </div>

      {/* divider */}
      <div style={{
        width: '80%',
        height: 1,
        background: `linear-gradient(90deg, transparent, ${member.color}55, transparent)`,
      }} />

      {/* bio */}
      <div style={{
        fontFamily: '"Courier New", monospace',
        fontSize: 9.5,
        color: 'rgba(200,210,230,0.75)',
        textAlign: 'center',
        lineHeight: 1.55,
        letterSpacing: '0.03em',
        padding: '0 4px',
      }}>
        {member.bio}
      </div>

      {/* bottom corner accent */}
      <div style={{
        position: 'absolute',
        bottom: 8,
        right: 10,
        width: 12,
        height: 12,
        borderRight: `2px solid ${member.color}66`,
        borderBottom: `2px solid ${member.color}66`,
        borderRadius: '0 0 4px 0',
      }} />
      <div style={{
        position: 'absolute',
        bottom: 8,
        left: 10,
        width: 12,
        height: 12,
        borderLeft: `2px solid ${member.color}66`,
        borderBottom: `2px solid ${member.color}66`,
        borderRadius: '0 0 0 4px',
      }} />
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CrewScene() {
  const { dispatch } = useGame();

  const handleLaunch = () => {
    dispatch({ type: 'SET_SCENE', payload: SCENES.LAUNCH });
  };

  return (
    /*
     * The scene is mounted inside a position:absolute inset:0 wrapper in
     * App.jsx, which clips it to 100vh with overflow:hidden.
     * Setting height:100% + overflow-y:auto here makes this scene the scroll
     * container, so all five cards and the "ABOARD THE ODYSSEY" button are
     * reachable on small screens without affecting any other scene.
     */
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',         /* fill the absolute parent exactly */
      overflowY: 'auto',      /* scroll THIS element, not the page */
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch', /* momentum scroll on iOS */
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '48px 24px 60px',
      background: 'transparent',
      boxSizing: 'border-box',
    }}>

      {/* ambient radial glow behind title */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 600,
        height: 300,
        background: 'radial-gradient(ellipse at center top, rgba(100,120,255,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* title */}
      <motion.div
        variants={titleVariants}
        initial="hidden"
        animate="visible"
        style={{ textAlign: 'center', marginBottom: 6 }}
      >
        <div style={{
          fontFamily: '"Courier New", monospace',
          fontWeight: 900,
          fontSize: 'clamp(28px, 5vw, 44px)',
          letterSpacing: '0.3em',
          color: '#ffffff',
          textShadow: '0 0 30px rgba(100,180,255,0.7), 0 0 60px rgba(100,180,255,0.3)',
          textTransform: 'uppercase',
        }}>
          YOUR CREW
        </div>
      </motion.div>

      {/* subtitle */}
      <motion.div
        variants={subtitleVariants}
        initial="hidden"
        animate="visible"
        style={{
          fontFamily: '"Courier New", monospace',
          fontSize: 'clamp(11px, 1.6vw, 14px)',
          color: 'rgba(150,180,220,0.7)',
          letterSpacing: '0.18em',
          textAlign: 'center',
          marginBottom: 48,
          fontStyle: 'italic',
        }}
      >
        The finest minds of Xlama, united for one mission
      </motion.div>

      {/* cards container */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: '16px',
        perspective: 1000,
        paddingBottom: 20,
        maxWidth: 920,
        width: '100%',
      }}>
        <style>{`
          @media (max-width: 480px) {
            .crew-card-inner { width: calc(50% - 8px) !important; min-width: 130px !important; }
          }
          @media (max-width: 340px) {
            .crew-card-inner { width: 100% !important; }
          }
        `}</style>
        {CREW.map((member, i) => (
          <CrewCard key={member.id} member={member} index={i} />
        ))}
      </div>

      {/* launch button */}
      <motion.div
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
        style={{ marginTop: 48 }}
      >
        <motion.button
          onClick={handleLaunch}
          whileHover={{
            scale: 1.06,
            boxShadow: '0 0 40px rgba(68,136,255,0.7), 0 0 80px rgba(68,136,255,0.3)',
          }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: 'linear-gradient(135deg, rgba(68,136,255,0.15) 0%, rgba(68,136,255,0.05) 100%)',
            border: '2px solid rgba(68,136,255,0.8)',
            borderRadius: 8,
            color: '#ffffff',
            fontFamily: '"Courier New", monospace',
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: '0.3em',
            padding: '14px 40px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            boxShadow: '0 0 20px rgba(68,136,255,0.35)',
            transition: 'box-shadow 0.2s ease',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* inner shimmer */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '40%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
              pointerEvents: 'none',
            }}
          />
          ABOARD THE ODYSSEY
        </motion.button>
      </motion.div>

      {/* corner frame decorations */}
      <CornerFrame position="top-left" />
      <CornerFrame position="top-right" />
      <CornerFrame position="bottom-left" />
      <CornerFrame position="bottom-right" />
    </div>
  );
}

// ── Corner frame decoration ───────────────────────────────────────────────────
function CornerFrame({ position }) {
  const isTop = position.startsWith('top');
  const isLeft = position.endsWith('left');
  const style = {
    position: 'absolute',   /* was 'fixed' — fixed would escape the scroll container */
    top: isTop ? 16 : 'auto',
    bottom: isTop ? 'auto' : 16,
    left: isLeft ? 16 : 'auto',
    right: isLeft ? 'auto' : 16,
    width: 40,
    height: 40,
    borderTop: isTop ? '2px solid rgba(68,136,255,0.4)' : 'none',
    borderBottom: isTop ? 'none' : '2px solid rgba(68,136,255,0.4)',
    borderLeft: isLeft ? '2px solid rgba(68,136,255,0.4)' : 'none',
    borderRight: isLeft ? 'none' : '2px solid rgba(68,136,255,0.4)',
    borderRadius: isTop
      ? isLeft ? '6px 0 0 0' : '0 6px 0 0'
      : isLeft ? '0 0 0 6px' : '0 0 6px 0',
    pointerEvents: 'none',
  };
  return <div style={style} />;
}
