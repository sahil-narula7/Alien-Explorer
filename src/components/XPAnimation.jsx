import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

export default function XPAnimation() {
  const { state, dispatch } = useGame();
  const { xpAnimation } = state.ui;

  return (
    <AnimatePresence>
      {xpAnimation !== null && (
        <motion.div
          key={`xp-${xpAnimation.amount}-${xpAnimation.skill}-${Date.now()}`}
          initial={{ opacity: 0, y: 0, scale: 0.7 }}
          animate={{ opacity: 1, y: -60, scale: 1.1 }}
          exit={{ opacity: 0, y: -120, scale: 0.9 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          onAnimationComplete={() => dispatch({ type: 'CLEAR_XP_ANIMATION' })}
          style={{
            position: 'fixed',
            top: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {/* Main XP amount */}
          <motion.span
            animate={{ textShadow: [
              '0 0 10px #ffd700, 0 0 20px #ffd700',
              '0 0 20px #ffd700, 0 0 40px #ffaa00',
              '0 0 10px #ffd700, 0 0 20px #ffd700',
            ]}}
            transition={{ duration: 0.8, repeat: 1 }}
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '2rem',
              fontWeight: 900,
              color: '#ffd700',
              letterSpacing: '2px',
              whiteSpace: 'nowrap',
            }}
          >
            +{xpAnimation.amount} XP
          </motion.span>

          {/* Skill name badge */}
          {xpAnimation.skill && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#ffdd44',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                background: 'rgba(255, 215, 0, 0.15)',
                border: '1px solid rgba(255, 215, 0, 0.4)',
                borderRadius: '4px',
                padding: '2px 10px',
                textShadow: '0 0 8px #ffd700',
              }}
            >
              {xpAnimation.skill}
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
