import { createContext, useContext, useReducer, useEffect } from 'react';

// ── Game Scenes ──────────────────────────────────────────────────────────────
export const SCENES = {
  INTRO: 'INTRO',
  STORY: 'STORY',
  CREW: 'CREW',
  LAUNCH: 'LAUNCH',
  SPACE: 'SPACE',
  PLANET_ARRIVAL: 'PLANET_ARRIVAL',
  NAME_ENTRY: 'NAME_ENTRY',
  DASHBOARD: 'DASHBOARD',
  PLANET_EXPLORE: 'PLANET_EXPLORE',
  MISSION: 'MISSION',
};

// ── Crew IDs ──────────────────────────────────────────────────────────────────
export const CREW_IDS = ['sam', 'vela', 'krix7', 'luma', 'orion'];

// ── Per-crew initial progress ─────────────────────────────────────────────────
function makeCrewProgress() {
  return Object.fromEntries(
    CREW_IDS.map(id => [id, {
      missionsCompleted: 0,
      totalXP: 0,
      firstAttemptCorrect: 0,
      totalAttempted: 0,
      skill: 0,
    }])
  );
}

// ── Generate a simple unique player ID ───────────────────────────────────────
function generatePlayerId() {
  return 'pid_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

// ── Storage key ───────────────────────────────────────────────────────────────
// Using a new key so the new schema doesn't conflict with the old v2 save.
// The old key ('alien-explorer-v2') is left untouched — it will simply be
// ignored once the new key exists.
export const SAVE_KEY = 'alienExplorerPlayer';

// ── Read and validate a saved profile from localStorage ──────────────────────
// Returns the parsed object if it represents a valid returning player,
// or null if no profile / no captain name was saved.
function readSavedProfile() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    // A valid returning-player profile must have a non-empty captain name
    // and a playerId. Without these it is treated as a first-time user.
    if (!p || !p.playerId || !p.captain?.name) return null;
    return p;
  } catch (_) {
    return null;
  }
}

// ── Blank captain object (never mutate this directly) ────────────────────────
function blankCaptain() {
  return {
    name: '',
    level: 1,
    xp: 0,
    xpToNext: 100,
    currentPlanet: 'Planet of Ruin',
    skills: { math: 0, logic: 0, reasoning: 0 },
    missionProgress: 0,
    firstAttemptCorrect: 0,
    totalQuestionsAttempted: 0,
  };
}

// ── Build initial state from scratch (first-time user or after logout) ───────
// Starts at INTRO so new users see the full story/onboarding flow:
//   INTRO → STORY → CREW → LAUNCH → SPACE → PLANET_ARRIVAL → NAME_ENTRY → DASHBOARD
// After logout the same flow replays — this matches the requirement that
// logout returns the user to the normal story/introduction.
function buildFreshState() {
  return {
    scene: SCENES.INTRO,
    playerId: null,
    profileCreatedAt: null,
    captain: blankCaptain(),
    crewProgress: makeCrewProgress(),
    activeCrew: 'sam',
    mission: {
      active: false,
      currentQuestion: 0,
      answers: [],
      completed: false,
      score: 0,
    },
    ui: {
      zyroMessage: '',
      zyroVisible: false,
      xpAnimation: null,
    },
    settings: {
      soundEnabled: true,
    },
  };
}

// ── Build initial state from a saved profile (returning user) ────────────────
function buildRestoredState(saved) {
  const fresh = buildFreshState();
  return {
    ...fresh,
    // Return straight to dashboard — skip all onboarding
    scene: SCENES.DASHBOARD,
    playerId: saved.playerId,
    profileCreatedAt: saved.profileCreatedAt ?? null,
    // Merge saved captain over fresh defaults so any new fields are populated
    captain: { ...fresh.captain, ...saved.captain },
    crewProgress: saved.crewProgress
      ? { ...fresh.crewProgress, ...saved.crewProgress }
      : fresh.crewProgress,
    activeCrew: saved.activeCrew ?? 'sam',
    settings: saved.settings
      ? { ...fresh.settings, ...saved.settings }
      : fresh.settings,
    // Never restore mid-mission state — stale question index causes bugs
    mission: fresh.mission,
  };
}

// ── Initializer — called once at startup ──────────────────────────────────────
// This is passed as the third argument to useReducer so it runs exactly once
// before the first render. It never receives the INITIAL_STATE default — we
// build state entirely from localStorage or from scratch.
function initState() {
  const saved = readSavedProfile();
  if (saved) {
    return buildRestoredState(saved);
  }
  return buildFreshState();
}

// ── Reducer ───────────────────────────────────────────────────────────────────
function gameReducer(state, action) {
  switch (action.type) {

    case 'SET_SCENE':
      return { ...state, scene: action.payload };

    // Called from NameEntryScene when the player confirms their name.
    // Creates the player profile for the first time (generates a playerId).
    // If a playerId already exists (shouldn't happen normally) it is preserved
    // so a name-change never creates a new profile.
    case 'INIT_PLAYER': {
      const captainName = action.payload;
      const playerId = state.playerId ?? generatePlayerId();
      return {
        ...state,
        playerId,
        profileCreatedAt: state.profileCreatedAt ?? new Date().toISOString(),
        captain: { ...state.captain, name: captainName },
      };
    }

    // Update name only — do NOT reset progress or playerId
    case 'SET_CAPTAIN_NAME':
      return {
        ...state,
        captain: { ...state.captain, name: action.payload },
      };

    // Clear the active player and go back to name entry.
    // The auto-save effect will write a blank profile (no playerId / no name)
    // to localStorage which readSavedProfile() will treat as "no profile".
    case 'LOGOUT': {
      // Remove persisted data synchronously before state resets
      try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
      return buildFreshState();
    }

    case 'SET_ACTIVE_CREW':
      return { ...state, activeCrew: action.payload };

    case 'TOGGLE_SOUND':
      return {
        ...state,
        settings: { ...state.settings, soundEnabled: !state.settings.soundEnabled },
      };

    case 'AWARD_XP': {
      const { amount, skill } = action.payload;
      const newXP = state.captain.xp + amount;
      const newSkills = skill
        ? { ...state.captain.skills, [skill]: Math.min(100, state.captain.skills[skill] + amount) }
        : state.captain.skills;
      let level = state.captain.level;
      let xpToNext = state.captain.xpToNext;
      let overflow = newXP;
      while (overflow >= xpToNext) {
        overflow -= xpToNext;
        level += 1;
        xpToNext = Math.floor(xpToNext * 1.5);
      }
      const crewId = state.activeCrew;
      const prevCrew = state.crewProgress[crewId];
      return {
        ...state,
        captain: {
          ...state.captain,
          xp: overflow,
          level,
          xpToNext,
          skills: newSkills,
        },
        crewProgress: {
          ...state.crewProgress,
          [crewId]: {
            ...prevCrew,
            totalXP: prevCrew.totalXP + amount,
            skill: Math.min(100, Math.round((prevCrew.totalXP + amount) / 3)),
          },
        },
        ui: { ...state.ui, xpAnimation: { amount, skill } },
      };
    }

    case 'CLEAR_XP_ANIMATION':
      return { ...state, ui: { ...state.ui, xpAnimation: null } };

    case 'ZYRO_SPEAK':
      return {
        ...state,
        ui: { ...state.ui, zyroMessage: action.payload, zyroVisible: true },
      };

    case 'ZYRO_HIDE':
      return { ...state, ui: { ...state.ui, zyroVisible: false } };

    case 'START_MISSION':
      return {
        ...state,
        mission: { active: true, currentQuestion: 0, answers: [], completed: false, score: 0 },
      };

    case 'RECORD_QUESTION_RESULT': {
      const { correct, wasFirstAttempt } = action.payload;
      const crewId = state.activeCrew;
      const prevCrew = state.crewProgress[crewId];
      const newFirstCorrect = state.captain.firstAttemptCorrect + (wasFirstAttempt && correct ? 1 : 0);
      const newAttempted = state.captain.totalQuestionsAttempted + 1;
      return {
        ...state,
        captain: {
          ...state.captain,
          firstAttemptCorrect: newFirstCorrect,
          totalQuestionsAttempted: newAttempted,
        },
        crewProgress: {
          ...state.crewProgress,
          [crewId]: {
            ...prevCrew,
            firstAttemptCorrect: prevCrew.firstAttemptCorrect + (wasFirstAttempt && correct ? 1 : 0),
            totalAttempted: prevCrew.totalAttempted + 1,
          },
        },
        mission: {
          ...state.mission,
          answers: [...state.mission.answers, { correct, wasFirstAttempt }],
          score: state.mission.score + (correct ? 1 : 0),
        },
      };
    }

    case 'NEXT_QUESTION':
      return {
        ...state,
        mission: { ...state.mission, currentQuestion: state.mission.currentQuestion + 1 },
      };

    case 'COMPLETE_MISSION': {
      const crewId = state.activeCrew;
      const prevCrew = state.crewProgress[crewId];
      return {
        ...state,
        mission: { ...state.mission, completed: true, active: false },
        captain: { ...state.captain, missionProgress: state.captain.missionProgress + 1 },
        crewProgress: {
          ...state.crewProgress,
          [crewId]: { ...prevCrew, missionsCompleted: prevCrew.missionsCompleted + 1 },
        },
      };
    }

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const GameContext = createContext(null);

export function GameProvider({ children }) {
  // initState() runs exactly once (third arg to useReducer).
  // It reads localStorage first, so state is never initialized from defaults
  // when a saved profile exists.
  const [state, dispatch] = useReducer(gameReducer, undefined, initState);

  // Persist on every meaningful state change.
  // We only write when a valid profile exists (playerId + captain.name set)
  // so a fresh/logged-out state never writes a stale record.
  useEffect(() => {
    if (!state.playerId || !state.captain.name) return;
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({
          playerId: state.playerId,
          profileCreatedAt: state.profileCreatedAt,
          captain: state.captain,
          crewProgress: state.crewProgress,
          activeCrew: state.activeCrew,
          settings: state.settings,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch (_) {}
  }, [
    state.playerId,
    state.captain,
    state.crewProgress,
    state.activeCrew,
    state.settings,
    state.profileCreatedAt,
  ]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
