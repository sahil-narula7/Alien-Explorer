import { AnimatePresence, motion } from 'framer-motion';
import { GameProvider, useGame, SCENES } from './context/GameContext';
import StarField from './components/StarField';
import XPAnimation from './components/XPAnimation';
import IntroScene from './scenes/IntroScene';
import StoryScene from './scenes/StoryScene';
import CrewScene from './scenes/CrewScene';
import LaunchScene from './scenes/LaunchScene';
import SpaceScene from './scenes/SpaceScene';
import PlanetArrivalScene from './scenes/PlanetArrivalScene';
import NameEntryScene from './scenes/NameEntryScene';
import DashboardScene from './scenes/DashboardScene';
import PlanetExploreScene from './scenes/PlanetExploreScene';
import MissionScene from './scenes/MissionScene';
import './index.css';

const SCENE_MAP = {
  [SCENES.INTRO]: IntroScene,
  [SCENES.STORY]: StoryScene,
  [SCENES.CREW]: CrewScene,
  [SCENES.LAUNCH]: LaunchScene,
  [SCENES.SPACE]: SpaceScene,
  [SCENES.PLANET_ARRIVAL]: PlanetArrivalScene,
  [SCENES.NAME_ENTRY]: NameEntryScene,
  [SCENES.DASHBOARD]: DashboardScene,
  [SCENES.PLANET_EXPLORE]: PlanetExploreScene,
  [SCENES.MISSION]: MissionScene,
};

const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 1.02, transition: { duration: 0.4, ease: 'easeIn' } },
};

function Game() {
  const { state } = useGame();
  const SceneComponent = SCENE_MAP[state.scene] || IntroScene;
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000010' }}>
      <StarField />
      <XPAnimation />
      <AnimatePresence mode="wait">
        <motion.div
          key={state.scene}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ position: 'absolute', inset: 0, zIndex: 1 }}
        >
          <SceneComponent />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}
