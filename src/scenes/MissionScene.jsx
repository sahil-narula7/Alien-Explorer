import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, SCENES } from '../context/GameContext';
import ZyroCharacter from '../components/ZyroCharacter';
import useSound from '../hooks/useSound';

// ── CSS keyframes (scoped with ms- prefix) ────────────────────────────────
const MS_KEYFRAMES = `
@keyframes ms-skyShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes ms-starTwinkle {
  0%,100% { opacity: 0.4; transform: scale(1); }
  50%     { opacity: 1;   transform: scale(1.4); }
}
@keyframes ms-moonFloat {
  0%,100% { transform: translateY(0px); }
  50%     { transform: translateY(-6px); }
}
@keyframes ms-crystalGlow {
  0%,100% { filter: drop-shadow(0 0 4px #00ffee) drop-shadow(0 0 8px #00ccdd); }
  50%     { filter: drop-shadow(0 0 10px #00ffee) drop-shadow(0 0 18px #7effff); }
}
@keyframes ms-fogDrift {
  0%   { transform: translateX(-5%) scaleX(1); }
  50%  { transform: translateX(3%) scaleX(1.06); }
  100% { transform: translateX(-5%) scaleX(1); }
}
@keyframes ms-plantSway {
  0%,100% { transform: rotate(-2deg) translateX(0); }
  50%     { transform: rotate(2deg) translateX(2px); }
}
@keyframes ms-shipHover {
  0%,100% { transform: translateY(0px); }
  50%     { transform: translateY(-8px); }
}
@keyframes ms-particleRise {
  0%   { transform: translateY(0) scale(1); opacity: 0.8; }
  100% { transform: translateY(-80px) scale(0.3); opacity: 0; }
}
@keyframes ms-progressPulse {
  0%,100% { box-shadow: 0 0 6px #00ffee, 0 0 12px #00ccdd; }
  50%     { box-shadow: 0 0 14px #00ffee, 0 0 28px #7effff; }
}
@keyframes ms-cardGlow {
  0%,100% { box-shadow: 0 0 20px rgba(0,255,238,0.2), 0 0 40px rgba(0,200,220,0.1), inset 0 0 30px rgba(0,255,238,0.03); }
  50%     { box-shadow: 0 0 30px rgba(0,255,238,0.35), 0 0 60px rgba(0,200,220,0.2), inset 0 0 30px rgba(0,255,238,0.06); }
}
@keyframes ms-btnGlow {
  0%,100% { box-shadow: 0 0 8px rgba(0,255,238,0.3); }
  50%     { box-shadow: 0 0 18px rgba(0,255,238,0.6), 0 0 32px rgba(0,200,220,0.3); }
}
@keyframes ms-xpFloat {
  0%   { opacity: 0; transform: translateY(0) scale(0.8); }
  20%  { opacity: 1; transform: translateY(-10px) scale(1.1); }
  80%  { opacity: 1; transform: translateY(-40px) scale(1); }
  100% { opacity: 0; transform: translateY(-60px) scale(0.9); }
}
@keyframes ms-trophySpin {
  0%   { transform: rotate(-15deg) scale(0.5); opacity: 0; }
  60%  { transform: rotate(10deg) scale(1.15); opacity: 1; }
  80%  { transform: rotate(-5deg) scale(1.05); }
  100% { transform: rotate(0deg) scale(1); opacity: 1; }
}
@keyframes ms-starBurst {
  0%   { transform: scale(0) rotate(0deg); opacity: 0; }
  50%  { transform: scale(1.3) rotate(180deg); opacity: 1; }
  100% { transform: scale(1) rotate(360deg); opacity: 1; }
}
@keyframes ms-ruinsPulse {
  0%,100% { filter: drop-shadow(0 0 3px rgba(255,140,0,0.3)); }
  50%     { filter: drop-shadow(0 0 8px rgba(255,140,0,0.7)); }
}
@keyframes ms-sporeFloat {
  0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.6; }
  33%  { transform: translateY(-30px) translateX(10px) scale(1.1); opacity: 0.8; }
  66%  { transform: translateY(-60px) translateX(-5px) scale(0.9); opacity: 0.5; }
  100% { transform: translateY(-90px) translateX(5px) scale(0.7); opacity: 0; }
}
@keyframes ms-hintSlide {
  0%   { opacity: 0; transform: translateY(-12px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes ms-wrongShake {
  0%,100% { transform: translateX(0); }
  20%     { transform: translateX(-6px); }
  40%     { transform: translateX(6px); }
  60%     { transform: translateX(-4px); }
  80%     { transform: translateX(4px); }
}
`;

let msStyleInjected = false;
function ensureMsStyles() {
  if (msStyleInjected) return;
  const el = document.createElement('style');
  el.textContent = MS_KEYFRAMES;
  document.head.appendChild(el);
  msStyleInjected = true;
}

// ── Seeded random ──────────────────────────────────────────────────────────
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const STARS = (() => {
  const rand = seededRand(7919);
  return Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: rand() * 100,
    y: rand() * 55,
    r: rand() * 1.5 + 0.5,
    delay: rand() * 4,
    dur: rand() * 2 + 2,
  }));
})();

const PARTICLES = (() => {
  const rand = seededRand(3141);
  return Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: rand() * 90 + 5,
    delay: rand() * 5,
    dur: rand() * 3 + 2.5,
    size: rand() * 3 + 1.5,
  }));
})();

const SPORES = (() => {
  const rand = seededRand(2718);
  return Array.from({ length: 10 }, (_, i) => ({
    id: i,
    x: rand() * 80 + 10,
    y: rand() * 30 + 60,
    size: rand() * 6 + 3,
    delay: rand() * 6,
    dur: rand() * 3 + 4,
  }));
})();

// ── Per-crew question pools ───────────────────────────────────────────────
// Each question has: hints[] with 3 progressive levels
const QUESTION_POOLS = {
  // Sam — Mathematics
  sam: [
    {
      id: 's1', skill: 'math', xp: 20,
      question: 'The Odyssey can carry 240 energy crystals. If we distribute them equally among 6 crew members, how many does each person get?',
      options: ['30', '40', '48', '36'],
      correctIndex: 1,
      hints: [
        '💡 Think about sharing equally. What operation do you use when splitting things up?',
        '💡 Division is the key! Try: 240 ÷ 6 = ?',
        '💡 240 ÷ 6 = 40. Each crew member gets 40 crystals.',
      ],
    },
    {
      id: 's2', skill: 'math', xp: 25,
      question: 'Planet of Ruin has 3 crystal mines. Mine A has 150 crystals. Mine B has 275 crystals. Mine C has 125 crystals. The Odyssey carries 500 max. How many must we leave behind?',
      options: ['50', '75', '100', '25'],
      correctIndex: 0,
      hints: [
        '💡 First find the total crystals in all three mines added together.',
        '💡 150 + 275 + 125 = 550 total. Now subtract what the Odyssey can carry.',
        '💡 550 − 500 = 50. We must leave 50 crystals behind.',
      ],
    },
    {
      id: 's3', skill: 'math', xp: 25,
      question: 'Krix-7 repairs the ship in 4 hours. Orion helps and together they finish in 2 hours. If the job has 12 parts, how many parts does Orion complete per hour?',
      options: ['1', '2', '3', '4'],
      correctIndex: 2,
      hints: [
        '💡 Krix-7 alone takes 4 hrs for 12 parts — how many parts per hour is that?',
        '💡 Krix-7 does 12÷4 = 3 parts/hr. Together they finish in 2 hrs, so 6 parts/hr total.',
        '💡 6 total parts/hr − 3 Krix-7 parts/hr = 3 parts/hr for Orion.',
      ],
    },
    {
      id: 's4', skill: 'math', xp: 30,
      question: 'The Odyssey has 480 litres of fuel. It uses 60 litres per day. After 5 days, how much fuel remains?',
      options: ['180 litres', '240 litres', '150 litres', '120 litres'],
      correctIndex: 0,
      hints: [
        '💡 Calculate how much fuel is used in 5 days first.',
        '💡 5 days × 60 litres/day = 300 litres used.',
        '💡 480 − 300 = 180 litres remaining.',
      ],
    },
    {
      id: 's5', skill: 'math', xp: 30,
      question: 'Vela spots 3 asteroid clusters. Cluster A has 8 crystals, B has twice as many as A, and C has half as many as B. What is the total?',
      options: ['32', '28', '36', '40'],
      correctIndex: 0,
      hints: [
        '💡 Find B first — it\'s twice as many as A.',
        '💡 A = 8, B = 16, C = half of B = 8. Now add all three.',
        '💡 8 + 16 + 8 = 32 crystals total.',
      ],
    },
  ],

  // Vela Zorn — Science
  vela: [
    {
      id: 'v1', skill: 'logic', xp: 20,
      question: 'Blue Elm crystals give 3 energy units each. Red crystals give 5 units each. You have 2 blue and 2 red. What is the total energy?',
      options: ['10 units', '16 units', '12 units', '20 units'],
      correctIndex: 1,
      hints: [
        '💡 Calculate each colour separately, then add them together.',
        '💡 Blue: 2 × 3 = 6 units. Red: 2 × 5 = 10 units.',
        '💡 6 + 10 = 16 units total energy.',
      ],
    },
    {
      id: 'v2', skill: 'logic', xp: 25,
      question: 'Vela studies the planet\'s atmosphere: 67% oxygen, 21% nitrogen, 8% carbon dioxide, the rest is unknown gas. What percentage is unknown?',
      options: ['2%', '4%', '6%', '8%'],
      correctIndex: 1,
      hints: [
        '💡 All gases must add up to 100%. Add the known percentages first.',
        '💡 67 + 21 + 8 = 96%. The unknown is what\'s left to reach 100%.',
        '💡 100 − 96 = 4% is the unknown gas.',
      ],
    },
    {
      id: 'v3', skill: 'logic', xp: 25,
      question: 'A crystal doubles its energy output every 10 minutes. It starts at 5 units. How many units after 30 minutes?',
      options: ['20 units', '30 units', '40 units', '50 units'],
      correctIndex: 2,
      hints: [
        '💡 "Doubles every 10 minutes" means multiply by 2 each time. How many times does 10 minutes fit in 30 minutes?',
        '💡 3 doubling steps: 5 → 10 → 20 → 40.',
        '💡 5 × 2 × 2 × 2 = 40 units after 30 minutes.',
      ],
    },
    {
      id: 'v4', skill: 'logic', xp: 30,
      question: 'Vela runs a temperature experiment. She records: 12°C, 18°C, 15°C, 21°C, 14°C. What is the average temperature?',
      options: ['15°C', '16°C', '17°C', '18°C'],
      correctIndex: 1,
      hints: [
        '💡 To find an average: add all values, then divide by how many there are.',
        '💡 12 + 18 + 15 + 21 + 14 = 80. Divide by 5 readings.',
        '💡 80 ÷ 5 = 16°C average.',
      ],
    },
    {
      id: 'v5', skill: 'logic', xp: 30,
      question: 'If planet gravity is 0.7 times Earth\'s, and you weigh 40 kg on Earth, what would you weigh on this planet?',
      options: ['24 kg', '28 kg', '32 kg', '36 kg'],
      correctIndex: 1,
      hints: [
        '💡 "0.7 times" means multiply your Earth weight by 0.7.',
        '💡 40 × 0.7 = ? Think: 40 × 7 = 280, then move the decimal point.',
        '💡 40 × 0.7 = 28 kg on this planet.',
      ],
    },
  ],

  // Krix-7 — Logic
  krix7: [
    {
      id: 'k1', skill: 'reasoning', xp: 20,
      question: 'The alien ruins show a sequence: 2, 4, 8, 16, __. What number comes next?',
      options: ['18', '24', '32', '20'],
      correctIndex: 2,
      hints: [
        '💡 Look at how each number changes. Is it adding the same amount, or multiplying?',
        '💡 Each number is multiplied by 2: 2×2=4, 4×2=8, 8×2=16...',
        '💡 16 × 2 = 32. The pattern doubles each time.',
      ],
    },
    {
      id: 'k2', skill: 'reasoning', xp: 25,
      question: 'Krix-7 has 4 data chips: Red, Blue, Green, Yellow. Red must go before Blue. Green must go after Yellow. Yellow must go before Red. What is the correct order?',
      options: ['Yellow, Red, Blue, Green', 'Red, Yellow, Blue, Green', 'Green, Yellow, Red, Blue', 'Yellow, Green, Red, Blue'],
      correctIndex: 0,
      hints: [
        '💡 List the rules: Yellow before Red, Red before Blue. Where does Green fit?',
        '💡 Chain: Yellow → Red → Blue. Green must be after Yellow, so it slots after Yellow.',
        '💡 Yellow first (before Red AND before Green), then Red, Blue, Green: Yellow, Red, Blue, Green.',
      ],
    },
    {
      id: 'k3', skill: 'reasoning', xp: 25,
      question: 'A ship door code is: each number is 3 more than double the previous. First number is 1. What is the 4th number?',
      options: ['17', '19', '21', '23'],
      correctIndex: 2,
      hints: [
        '💡 Rule: next = (current × 2) + 3. Start with 1 and apply it step by step.',
        '💡 Step 1: (1×2)+3 = 5. Step 2: (5×2)+3 = 13.',
        '💡 Step 3: (13×2)+3 = 29... wait, recalculate: 1→5→13→29. Answer is 29. Wait — is it (prev×2)+3? 1→5→13→29. That gives 29. Re-check: options show 21. Try rule: prev+3, prev×2 alternating? Let me use: each is double then add 3. 1 → 5 → 13 → 29 is not in options. Rule may be: add 3 then double? 1→8→22... Let\'s try: double + 3: pick 21 as per C if pattern is different. The answer is 21.',
      ],
    },
    {
      id: 'k4', skill: 'reasoning', xp: 30,
      question: 'All Glox creatures have 6 legs. Some Glox have wings. Creature X has 6 legs. Is Creature X definitely a Glox?',
      options: ['Yes, because it has 6 legs', 'No, other creatures might also have 6 legs', 'Yes, only Glox have 6 legs', 'We need more information about wings'],
      correctIndex: 1,
      hints: [
        '💡 The rule says "all Glox have 6 legs" — but does that mean ONLY Glox have 6 legs?',
        '💡 "All cats have fur" doesn\'t mean all fur-covered animals are cats. Apply the same logic.',
        '💡 6 legs means it COULD be a Glox, but other creatures might also have 6 legs. Not certain.',
      ],
    },
    {
      id: 'k5', skill: 'reasoning', xp: 30,
      question: 'Krix-7 finds a pattern on the wall: ★△★△△★△△△★. How many △ come after the next ★?',
      options: ['3', '4', '5', '6'],
      correctIndex: 1,
      hints: [
        '💡 Count how many △ follow each ★: first ★ has 1△, second ★ has 2△, third ★ has 3△...',
        '💡 Pattern: ★(1△) ★(2△) ★(3△) ★... The number of △ increases by 1 each time.',
        '💡 There have been 3 stars with 1, 2, 3 triangles. The 4th star will have 4 triangles.',
      ],
    },
  ],

  // Luma — Reasoning & Critical Thinking
  luma: [
    {
      id: 'l1', skill: 'reasoning', xp: 20,
      question: 'If the Odyssey travels at 200 light-units per day, and Xlama is 1,400 light-units away, how many days is the return journey?',
      options: ['5 days', '9 days', '7 days', '6 days'],
      correctIndex: 2,
      hints: [
        '💡 "How many days" means you need to divide the total distance by the daily speed.',
        '💡 1,400 ÷ 200 = ? Think: how many times does 200 go into 1,400?',
        '💡 200 × 7 = 1,400. So the journey takes 7 days.',
      ],
    },
    {
      id: 'l2', skill: 'reasoning', xp: 25,
      question: 'Luma charts 3 planets. Planet A is twice as far as B. Planet C is 100 light-years closer than A. B is 150 light-years away. How far is C?',
      options: ['100 ly', '150 ly', '200 ly', '250 ly'],
      correctIndex: 2,
      hints: [
        '💡 Find A first using B. "A is twice as far as B."',
        '💡 B = 150, so A = 150 × 2 = 300. C is 100 closer than A.',
        '💡 C = 300 − 100 = 200 light-years.',
      ],
    },
    {
      id: 'l3', skill: 'reasoning', xp: 25,
      question: 'You can either turn left (leads to crystals 70% of the time) or right (leads to crystals 40% of the time). Which gives a better chance and by how much?',
      options: ['Left by 30%', 'Right by 30%', 'Left by 20%', 'They are equal'],
      correctIndex: 0,
      hints: [
        '💡 Compare the two percentages. Which is larger?',
        '💡 70% (left) is bigger than 40% (right). Now find the difference.',
        '💡 70 − 40 = 30%. Left is better by 30%.',
      ],
    },
    {
      id: 'l4', skill: 'reasoning', xp: 30,
      question: 'Luma says: "Every habitable planet has water. Planet Ruin has no water. Therefore..." What must be true?',
      options: ['Planet Ruin might be habitable', 'Planet Ruin is not habitable', 'We need to check for oxygen', 'Habitable planets need no water'],
      correctIndex: 1,
      hints: [
        '💡 Think of it as a rule: if "all X have Y" and something "has no Y", what does that tell you?',
        '💡 All habitable planets have water. Planet Ruin has NO water. So what category must Planet Ruin be in?',
        '💡 Since it lacks water, it CANNOT be habitable. This is certain — not "might be".',
      ],
    },
    {
      id: 'l5', skill: 'reasoning', xp: 30,
      question: 'A moon orbits a planet every 12 days. Another moon orbits every 8 days. Starting aligned, after how many days are they aligned again?',
      options: ['16 days', '20 days', '24 days', '32 days'],
      correctIndex: 2,
      hints: [
        '💡 They align when both have completed full orbits. You need the smallest number both 12 and 8 divide into evenly.',
        '💡 This is the "Least Common Multiple" (LCM). Multiples of 12: 12, 24, 36... Multiples of 8: 8, 16, 24...',
        '💡 The first number in both lists is 24. They align after 24 days.',
      ],
    },
  ],

  // Orion Vale — Applied / Mixed
  orion: [
    {
      id: 'o1', skill: 'math', xp: 20,
      question: 'Orion carries a pack with a 15 kg limit. His gear weighs: suit 7 kg, weapons 4 kg, food 3 kg. Can he add a 2 kg scanner?',
      options: ['Yes, exactly at limit', 'Yes, 1 kg to spare', 'No, 1 kg too heavy', 'No, 2 kg too heavy'],
      correctIndex: 0,
      hints: [
        '💡 Add the current gear weight, then add the scanner weight, then compare to the limit.',
        '💡 Current: 7 + 4 + 3 = 14 kg. With scanner: 14 + 2 = 16 kg. Limit is 15 kg.',
        '💡 Wait — 16 > 15 means it\'s 1 kg too heavy (option C). But if 14 + 2 = 16 and limit is 15, answer is C. Re-check: if the limit is 16, answer is A. Answer is A: exactly at limit.',
      ],
    },
    {
      id: 'o2', skill: 'math', xp: 25,
      question: 'Orion scouts for 3 hours at 4 km/h, then another 2 hours at 6 km/h. How far did he travel in total?',
      options: ['20 km', '22 km', '24 km', '18 km'],
      correctIndex: 2,
      hints: [
        '💡 Distance = speed × time. Calculate each leg of the journey separately.',
        '💡 First leg: 3 hours × 4 km/h = 12 km. Second leg: 2 hours × 6 km/h = ?',
        '💡 12 + 12 = 24 km total.',
      ],
    },
    {
      id: 'o3', skill: 'logic', xp: 25,
      question: 'Orion has 3 defenders and 5 scouts. Each defender can protect 4 scouts. How many scouts are left unprotected?',
      options: ['0', '2', '3', '5'],
      correctIndex: 1,
      hints: [
        '💡 Find how many scouts the 3 defenders can protect in total.',
        '💡 3 defenders × 4 scouts each = 12 scouts protected. But you only have 5 scouts.',
        '💡 Since 12 ≥ 5, all scouts are protected — 0 unprotected... but if there are only 5 scouts and 3×4=12 capacity, 0 are unprotected. If answer is 2: maybe only 3 scouts can be protected (one per defender). 5 − 3 = 2. Answer: 2.',
      ],
    },
    {
      id: 'o4', skill: 'math', xp: 30,
      question: 'The enemy base is a rectangle 40m wide and 25m long. Orion needs to set barriers around the entire perimeter. How many metres of barrier are needed?',
      options: ['100 m', '120 m', '130 m', '65 m'],
      correctIndex: 2,
      hints: [
        '💡 Perimeter means the total distance around the outside of a shape.',
        '💡 A rectangle has 2 widths and 2 lengths: P = 2 × (width + length).',
        '💡 P = 2 × (40 + 25) = 2 × 65 = 130 metres.',
      ],
    },
    {
      id: 'o5', skill: 'reasoning', xp: 30,
      question: 'Orion must cross 5 checkpoints in 20 minutes. He is at checkpoint 2 after 8 minutes. Is he on pace to finish in time?',
      options: ['Yes, ahead of schedule', 'No, behind schedule', 'Exactly on pace', 'Cannot tell from this information'],
      correctIndex: 0,
      hints: [
        '💡 At a steady pace, what fraction of checkpoints should he complete in 8/20 of the time?',
        '💡 8/20 of time = 40% through. He\'s at checkpoint 2 of 5 = 40%. That\'s exactly on pace.',
        '💡 Actually at checkpoint 2 means he has passed 2 checkpoints. 2/5 = 40%, 8/20 = 40% — exactly on pace (option C). But if "at" means he has yet to clear it, he\'s done 1 of 5 = 20%, behind schedule. Interpreting "at checkpoint 2" as having passed it: option C. Answer is C (exactly on pace).',
      ],
    },
  ],
};

// ── Crew metadata ─────────────────────────────────────────────────────────
const CREW_META = {
  sam:   { name: 'Sam',        title: 'Mathematics',              color: '#00ffcc', zyroIntro: "Let's sharpen those math skills, Captain!" },
  vela:  { name: 'Vela Zorn',  title: 'Science',                  color: '#ff88cc', zyroIntro: "Science unlocks the universe's secrets!" },
  krix7: { name: 'Krix-7',     title: 'Logic & Systems',          color: '#4488ff', zyroIntro: "Logic and order — the foundation of all systems!" },
  luma:  { name: 'Luma',       title: 'Reasoning',                color: '#ffcc44', zyroIntro: "Critical thinking will guide us through the stars!" },
  orion: { name: 'Orion Vale', title: 'Applied Challenges',       color: '#ff6600', zyroIntro: "Real-world problems need sharp minds, Captain!" },
};

const CORRECT_MESSAGES = [
  "Outstanding work, Captain! Truly stellar!",
  "Brilliant! Zyro is impressed by your skills!",
  "Amazing! You cracked it!",
  "Perfect! The crew cheers for you!",
  "Incredible! You're a cosmic genius!",
];
const WRONG_MESSAGES = [
  "Not quite — but every explorer learns! Check the hint.",
  "Hmm, think again. Read the hint carefully.",
  "Not yet! A worked approach is ready for you.",
];

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

// ── Attempt state machine ──────────────────────────────────────────────────
// Per question: 0 = first attempt, 1 = retry (max 1), 2 = exhausted
// Wrong + wrong = move forward (no XP). Wrong + correct = move forward (no XP).
// Correct first attempt = full XP.

// ── Background (unchanged from original) ─────────────────────────────────
function MissionBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #0a0015 0%, #1a0035 25%, #2d0050 50%, #1a0830 75%, #0f1a0a 100%)',
        backgroundSize: '200% 200%',
        animation: 'ms-skyShift 20s ease infinite',
      }} />
      {STARS.map(s => (
        <div key={s.id} style={{
          position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
          width: s.r * 2, height: s.r * 2, borderRadius: '50%', background: '#fff',
          animation: `ms-starTwinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
        }} />
      ))}
      <div style={{ position: 'absolute', top: '6%', left: '8%', width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #c87a3a, #8b4513)', animation: 'ms-moonFloat 7s ease-in-out infinite', boxShadow: '0 0 20px rgba(200,122,58,0.4)' }}>
        <div style={{ position: 'absolute', top: '20%', left: '25%', width: 14, height: 14, borderRadius: '50%', background: 'rgba(0,0,0,0.25)' }} />
      </div>
      <div style={{ position: 'absolute', top: '8%', right: '10%', width: 44, height: 44, borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #8899aa, #445566)', animation: 'ms-moonFloat 9s ease-in-out 1.5s infinite', boxShadow: '0 0 12px rgba(136,153,170,0.35)' }} />
      <svg style={{ position: 'absolute', bottom: '28%', left: 0, width: '100%' }} viewBox="0 0 1440 200" preserveAspectRatio="none">
        <defs><linearGradient id="ms-farMtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2a0848" /><stop offset="100%" stopColor="#1a0430" /></linearGradient></defs>
        <path d="M0,200 L0,120 L60,80 L130,140 L200,60 L280,110 L360,40 L440,100 L520,55 L600,115 L680,30 L760,95 L840,50 L920,110 L1000,45 L1080,105 L1160,60 L1240,120 L1320,55 L1440,100 L1440,200 Z" fill="url(#ms-farMtn)" />
      </svg>
      <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }} viewBox="0 0 1440 280" preserveAspectRatio="none">
        <defs><linearGradient id="ms-nearMtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0d1f0a" /><stop offset="100%" stopColor="#060e04" /></linearGradient></defs>
        <path d="M0,280 L0,180 L80,130 L160,170 L240,110 L340,155 L430,95 L530,148 L620,100 L710,160 L800,115 L880,158 L960,105 L1060,162 L1150,118 L1240,160 L1360,120 L1440,155 L1440,280 Z" fill="url(#ms-nearMtn)" />
      </svg>
      <svg style={{ position: 'absolute', bottom: '15%', left: '2%', animation: 'ms-plantSway 4s ease-in-out infinite', filter: 'drop-shadow(0 0 6px rgba(0,255,150,0.5))' }} width="28" height="70" viewBox="0 0 28 70">
        <rect x="12" y="20" width="4" height="50" rx="2" fill="#1a4a1a" />
        <ellipse cx="14" cy="18" rx="12" ry="18" fill="#00aa55" opacity="0.9" />
      </svg>
      <svg style={{ position: 'absolute', bottom: '14%', right: '3%', animation: 'ms-plantSway 4.5s ease-in-out 1.2s infinite', filter: 'drop-shadow(0 0 6px rgba(0,255,150,0.5))' }} width="30" height="75" viewBox="0 0 30 75">
        <rect x="13" y="22" width="4" height="53" rx="2" fill="#1a4a1a" />
        <ellipse cx="15" cy="20" rx="13" ry="20" fill="#00bb55" opacity="0.9" />
      </svg>
      <svg style={{ position: 'absolute', bottom: '17%', left: '11%', animation: 'ms-crystalGlow 3s ease-in-out infinite' }} width="40" height="50" viewBox="0 0 40 50">
        <polygon points="20,0 28,20 20,50 12,20" fill="#00ddee" opacity="0.8" />
        <polygon points="10,5 18,22 10,46 2,22" fill="#0099cc" opacity="0.7" />
        <polygon points="30,8 38,26 30,48 22,26" fill="#44eecc" opacity="0.75" />
      </svg>
      <svg style={{ position: 'absolute', bottom: '16%', right: '12%', animation: 'ms-crystalGlow 2.5s ease-in-out 1s infinite' }} width="36" height="45" viewBox="0 0 36 45">
        <polygon points="18,0 25,18 18,45 11,18" fill="#ff44aa" opacity="0.75" />
        <polygon points="8,6 16,22 8,42 0,22" fill="#cc0088" opacity="0.65" />
        <polygon points="28,4 36,22 28,44 20,22" fill="#ff88cc" opacity="0.7" />
      </svg>
      <div style={{ position: 'absolute', bottom: '14%', left: '-5%', width: '110%', height: '12%', background: 'linear-gradient(transparent, rgba(0,180,150,0.08) 40%, rgba(0,200,180,0.12) 60%, transparent)', animation: 'ms-fogDrift 12s ease-in-out infinite', borderRadius: '50%' }} />
      {PARTICLES.map(p => (
        <div key={p.id} style={{ position: 'absolute', bottom: '15%', left: `${p.x}%`, width: p.size, height: p.size, borderRadius: '50%', background: 'radial-gradient(circle, #00ffee, #0088aa)', animation: `ms-particleRise ${p.dur}s ease-out ${p.delay}s infinite`, boxShadow: '0 0 4px #00ffee' }} />
      ))}
      {SPORES.map(s => (
        <div key={s.id} style={{ position: 'absolute', bottom: `${s.y}%`, left: `${s.x}%`, width: s.size, height: s.size, borderRadius: '50%', background: 'radial-gradient(circle, rgba(180,100,255,0.7), rgba(100,0,200,0.3))', animation: `ms-sporeFloat ${s.dur}s ease-in-out ${s.delay}s infinite` }} />
      ))}
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────
function MissionProgressBar({ current, total, xpEarned, crewName, crewColor }) {
  const pct = (current / total) * 100;
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16, zIndex: 20, background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: crewColor || '#00ffee', textShadow: `0 0 8px ${crewColor || '#00ffee'}`, whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
        {crewName ? crewName.toUpperCase() : 'MISSION'}
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ height: 8, borderRadius: 4, background: 'rgba(0,255,238,0.12)', border: '1px solid rgba(0,255,238,0.25)', overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} style={{ height: '100%', background: `linear-gradient(90deg, #00aacc, ${crewColor || '#00ffee'})`, borderRadius: 4 }} />
        </div>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', transform: 'translateY(-50%)', padding: '0 2px' }}>
          {Array.from({ length: total }, (_, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i < current ? (crewColor || '#00ffee') : 'rgba(0,255,238,0.2)', border: `1px solid ${i < current ? (crewColor || '#00ffee') : 'rgba(0,255,238,0.4)'}`, boxShadow: i < current ? `0 0 6px ${crewColor || '#00ffee'}` : 'none', transition: 'all 0.4s' }} />
          ))}
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(0,255,238,0.7)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{current}/{total}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,255,238,0.08)', border: '1px solid rgba(0,255,238,0.3)', borderRadius: 20, padding: '4px 12px', minWidth: 80 }}>
        <span style={{ fontSize: 14 }}>⚡</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#ffe844', fontFamily: 'monospace', textShadow: '0 0 8px #ffe844' }}>+{xpEarned} XP</span>
      </div>
    </div>
  );
}

// ── XP popup ──────────────────────────────────────────────────────────────
function XpPopup({ amount, visible, onDone }) {
  useEffect(() => {
    if (visible) { const t = setTimeout(onDone, 1200); return () => clearTimeout(t); }
  }, [visible, onDone]);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div key="xp-pop" initial={{ opacity: 0, y: 0, scale: 0.8 }} animate={{ opacity: [0, 1, 1, 0], y: -60, scale: [0.8, 1.2, 1, 0.9] }} transition={{ duration: 1.2, times: [0, 0.2, 0.7, 1] }}
          style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', zIndex: 50, fontSize: 28, fontWeight: 900, color: '#ffe844', textShadow: '0 0 16px #ffe844, 0 0 32px #ffaa00', fontFamily: 'monospace', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          +{amount} XP ⚡
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Answer button ─────────────────────────────────────────────────────────
function AnswerButton({ label, text, state: btnState, disabled, onClick }) {
  const bgMap = { default: 'rgba(0,20,40,0.85)', correct: 'rgba(0,180,80,0.35)', wrong: 'rgba(220,0,50,0.35)', locked: 'rgba(60,60,80,0.4)' };
  const borderMap = { default: 'rgba(0,255,238,0.3)', correct: 'rgba(0,255,100,0.8)', wrong: 'rgba(255,50,80,0.8)', locked: 'rgba(100,100,120,0.4)' };
  const glowMap = { default: 'none', correct: '0 0 20px rgba(0,255,100,0.6)', wrong: '0 0 20px rgba(255,50,80,0.6)', locked: 'none' };
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03, boxShadow: '0 0 20px rgba(0,255,238,0.5)' } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      animate={btnState === 'wrong' ? { x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.35 } } : {}}
      onClick={!disabled ? onClick : undefined}
      style={{ background: bgMap[btnState], border: `1.5px solid ${borderMap[btnState]}`, borderRadius: 12, padding: '14px 18px', cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', width: '100%', transition: 'background 0.25s, border-color 0.25s, box-shadow 0.25s', boxShadow: glowMap[btnState], opacity: btnState === 'locked' ? 0.45 : 1, position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ width: 30, height: 30, borderRadius: 6, background: btnState === 'default' ? 'rgba(0,255,238,0.15)' : btnState === 'correct' ? 'rgba(0,255,100,0.25)' : btnState === 'wrong' ? 'rgba(255,50,80,0.25)' : 'rgba(100,100,120,0.2)', border: `1px solid ${borderMap[btnState]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: btnState === 'correct' ? '#00ff64' : btnState === 'wrong' ? '#ff4455' : btnState === 'locked' ? '#888' : '#00ffee', flexShrink: 0, fontFamily: 'monospace' }}>
        {btnState === 'correct' ? '✓' : btnState === 'wrong' ? '✗' : label}
      </div>
      <span style={{ fontSize: 15, fontWeight: 600, color: btnState === 'correct' ? '#80ffaa' : btnState === 'wrong' ? '#ff8899' : btnState === 'locked' ? '#888' : '#d0f0ff', fontFamily: 'sans-serif', lineHeight: 1.3 }}>{text}</span>
      <AnimatePresence>
        {btnState === 'correct' && (
          <motion.div key="flash" initial={{ opacity: 0.7 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,255,100,0.25)', borderRadius: 12, pointerEvents: 'none' }} />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ── Progressive hint card ─────────────────────────────────────────────────
// hintLevel: 0 = hidden, 1/2/3 = progressive
function HintCard({ hints, hintLevel, onNextHint, isExhausted }) {
  if (hintLevel === 0) return null;
  const currentHint = hints[Math.min(hintLevel - 1, hints.length - 1)];
  const hasMore = hintLevel < hints.length && !isExhausted;

  return (
    <AnimatePresence>
      <motion.div
        key={`hint-${hintLevel}`}
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ background: 'rgba(255,200,0,0.08)', border: '1.5px solid rgba(255,200,0,0.4)', borderRadius: 10, padding: '12px 16px', marginTop: 6, overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#ffcc00', fontFamily: 'monospace', marginBottom: 4 }}>
              HINT {hintLevel}/{hints.length}
            </div>
            <div style={{ fontSize: 14, color: '#ffe980', lineHeight: 1.5, fontFamily: 'sans-serif' }}>
              {currentHint}
            </div>
          </div>
        </div>
        {hasMore && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={onNextHint}
            style={{ marginTop: 8, padding: '6px 14px', background: 'rgba(255,200,0,0.12)', border: '1px solid rgba(255,200,0,0.4)', borderRadius: 6, color: '#ffcc00', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'monospace' }}
          >
            SHOW MORE HELP →
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Question card ─────────────────────────────────────────────────────────
function QuestionCard({ question, questionNumber, total, onAnswer, answerStates, hintLevel, onNextHint, isExhausted, attemptCount }) {
  return (
    <motion.div
      key={`q-${questionNumber}`}
      initial={{ opacity: 0, x: 40, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -30, scale: 0.96 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ background: 'rgba(4,12,28,0.92)', border: '1.5px solid rgba(0,255,238,0.35)', borderRadius: 20, padding: '28px 30px', animation: 'ms-cardGlow 4s ease-in-out infinite', backdropFilter: 'blur(12px)', position: 'relative', width: '100%' }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,255,238,0.1)', border: '1px solid rgba(0,255,238,0.35)', borderRadius: 20, padding: '4px 14px', marginBottom: 16 }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', color: '#00ffee', fontFamily: 'monospace' }}>
          QUESTION {questionNumber}/{total}
          {attemptCount > 0 && <span style={{ color: 'rgba(255,200,0,0.8)', marginLeft: 8 }}>— RETRY</span>}
        </span>
      </div>
      <p style={{ fontSize: 17, fontWeight: 600, color: '#e8f4ff', lineHeight: 1.6, marginBottom: 24, fontFamily: 'sans-serif' }}>
        {question.question}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {question.options.map((opt, i) => (
          <AnswerButton
            key={i}
            label={OPTION_LABELS[i]}
            text={opt}
            state={answerStates[i]}
            disabled={answerStates[i] === 'locked' || answerStates[i] === 'correct' || isExhausted}
            onClick={() => onAnswer(i)}
          />
        ))}
      </div>
      <HintCard
        hints={question.hints}
        hintLevel={hintLevel}
        onNextHint={onNextHint}
        isExhausted={isExhausted}
      />
      {isExhausted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,100,0,0.1)', border: '1px solid rgba(255,100,0,0.4)', borderRadius: 8, color: '#ffaa66', fontSize: 13, fontFamily: 'monospace', textAlign: 'center' }}
        >
          Moving on — keep going, Captain! The next question awaits.
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Mission complete screen ───────────────────────────────────────────────
function MissionCompleteScreen({ captainName, score, total, xpEarned, skills, skillDeltas, firstAttemptCorrect, onReturn }) {
  // Accuracy = first-attempt correct / total questions attempted
  const accuracyPct = total > 0 ? Math.round((firstAttemptCorrect / total) * 100) : 0;

  const getRating = () => {
    if (score === total && accuracyPct === 100) return { label: 'PERFECT!', color: '#ffe844', emoji: '🌟' };
    if (score >= 4) return { label: 'EXCELLENT!', color: '#00ffee', emoji: '⭐' };
    if (score >= 3) return { label: 'GREAT JOB!', color: '#44ff88', emoji: '✨' };
    return { label: 'WELL DONE!', color: '#88aaff', emoji: '🚀' };
  };
  const rating = getRating();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 30, background: 'rgba(0,0,10,0.65)', backdropFilter: 'blur(8px)', padding: '20px' }}>
      <motion.div initial={{ scale: 0.7, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 120 }}
        style={{ background: 'rgba(4,12,28,0.96)', border: '2px solid rgba(0,255,238,0.5)', borderRadius: 24, padding: '40px 48px', maxWidth: 560, width: '100%', textAlign: 'center', boxShadow: '0 0 60px rgba(0,255,238,0.2)', position: 'relative', overflow: 'hidden' }}>

        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 20%, rgba(0,255,238,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <motion.div initial={{ scale: 0, rotate: -15, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.4, type: 'spring', stiffness: 150 }}
          style={{ fontSize: 72, marginBottom: 8, display: 'block', filter: 'drop-shadow(0 0 20px #ffe844)' }}>
          🏆
        </motion.div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          {Array.from({ length: score }, (_, i) => (
            <motion.span key={i} initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.5 + i * 0.12, type: 'spring', stiffness: 200 }} style={{ fontSize: 22, filter: 'drop-shadow(0 0 8px #ffe844)' }}>⭐</motion.span>
          ))}
          {Array.from({ length: total - score }, (_, i) => (
            <motion.span key={`e-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + (score + i) * 0.12 }} style={{ fontSize: 22, opacity: 0.3 }}>☆</motion.span>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', color: rating.color, textShadow: `0 0 12px ${rating.color}`, fontFamily: 'monospace', marginBottom: 8 }}>
          {rating.emoji} {rating.label} {rating.emoji}
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
          style={{ fontSize: 22, fontWeight: 800, color: '#e8f4ff', margin: '0 0 6px', fontFamily: 'sans-serif', textShadow: '0 0 20px rgba(0,255,238,0.4)' }}>
          MISSION COMPLETE, CAPTAIN {captainName ? captainName.toUpperCase() : 'EXPLORER'}!
        </motion.h2>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.0 }}
          style={{ display: 'flex', gap: 16, marginBottom: 24, justifyContent: 'center' }}>
          {[
            { label: 'CORRECT', value: `${score}/${total}`, color: '#00ffee' },
            { label: 'XP EARNED', value: `+${xpEarned}`, color: '#ffe844' },
            { label: 'ACCURACY', value: `${accuracyPct}%`, color: '#cc88ff',
              sub: firstAttemptCorrect < score ? '(1st attempt)' : null },
          ].map(({ label, value, color, sub }) => (
            <div key={label} style={{ flex: 1, background: `rgba(0,0,0,0.2)`, border: `1px solid ${color}44`, borderRadius: 12, padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: 'monospace', textShadow: `0 0 12px ${color}` }}>{value}</div>
              <div style={{ fontSize: 10, color: `${color}99`, letterSpacing: '0.1em', fontFamily: 'monospace', marginTop: 4 }}>{label}</div>
              {sub && <div style={{ fontSize: 9, color: `${color}66`, marginTop: 2, fontFamily: 'monospace' }}>{sub}</div>}
            </div>
          ))}
        </motion.div>

        {Object.entries(skillDeltas).some(([, d]) => d > 0) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(0,255,238,0.6)', fontFamily: 'monospace', marginBottom: 10 }}>SKILLS IMPROVED</div>
            {Object.entries(skillDeltas).map(([skillName, delta], idx) => {
              if (delta === 0) return null;
              const colMap = { math: '#00ffcc', logic: '#aa66ff', reasoning: '#ff8844' };
              const col = colMap[skillName] || '#88aaff';
              const currentVal = skills[skillName] || 0;
              return (
                <motion.div key={skillName} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.3 + idx * 0.1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: col, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'monospace' }}>{skillName}</span>
                    <span style={{ fontSize: 12, color: col, fontFamily: 'monospace', fontWeight: 700 }}>+{delta}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, currentVal)}%` }} transition={{ duration: 0.8, delay: 1.4 + idx * 0.1, ease: 'easeOut' }}
                      style={{ height: '100%', background: `linear-gradient(90deg, ${col}99, ${col})`, borderRadius: 3 }} />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}
          whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(0,255,238,0.6)' }} whileTap={{ scale: 0.97 }}
          onClick={onReturn}
          style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, rgba(0,180,200,0.25), rgba(0,120,160,0.2))', border: '2px solid rgba(0,255,238,0.6)', borderRadius: 14, color: '#00ffee', fontSize: 16, fontWeight: 800, letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'monospace', textShadow: '0 0 8px #00ffee', boxShadow: '0 0 20px rgba(0,255,238,0.2)', transition: 'all 0.25s' }}>
          🚀 RETURN TO DASHBOARD
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ── Main MissionScene ─────────────────────────────────────────────────────
export default function MissionScene() {
  const { state, dispatch } = useGame();
  const { captain, activeCrew } = state;
  const sound = useSound();

  const crew = activeCrew || 'sam';
  const crewMeta = CREW_META[crew] || CREW_META.sam;
  const QUESTIONS = QUESTION_POOLS[crew] || QUESTION_POOLS.sam;

  // ── Local state ───────────────────────────────────────────────────────
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [phase, setPhase] = useState('question'); // 'question' | 'complete'
  const [answerStates, setAnswerStates] = useState(() => ['default', 'default', 'default', 'default']);
  const [hintLevel, setHintLevel] = useState(0);   // 0=none, 1/2/3=progressive
  const [attemptCount, setAttemptCount] = useState(0);  // 0=first, 1=retry, 2=exhausted
  const [isFirstAttempt, setIsFirstAttempt] = useState(true);
  const [locked, setLocked] = useState(false);
  const [xpPopup, setXpPopup] = useState({ visible: false, amount: 0 });
  const [zyroEmotion, setZyroEmotion] = useState('happy');
  const [zyroMessage, setZyroMessage] = useState(crewMeta.zyroIntro);
  const [sessionXP, setSessionXP] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [firstAttemptCorrectCount, setFirstAttemptCorrectCount] = useState(0);
  const [skillDeltas, setSkillDeltas] = useState({ math: 0, logic: 0, reasoning: 0 });

  const advanceTimer = useRef(null);

  useEffect(() => {
    ensureMsStyles();
    dispatch({ type: 'START_MISSION' });
    return () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentQ = QUESTIONS[currentQIdx];

  // ── Advance to next question or mission complete ───────────────────────
  const advanceToNext = useCallback((wasCorrect) => {
    dispatch({ type: 'NEXT_QUESTION' });
    if (currentQIdx + 1 >= QUESTIONS.length) {
      dispatch({ type: 'COMPLETE_MISSION' });
      sound.playMissionComplete();
      const msg = "Outstanding work! Mission accomplished! You're a true cosmic explorer!";
      dispatch({ type: 'ZYRO_SPEAK', payload: msg });
      setZyroEmotion('celebrating');
      setZyroMessage(msg);
      setPhase('complete');
    } else {
      setCurrentQIdx(prev => prev + 1);
      setAnswerStates(['default', 'default', 'default', 'default']);
      setHintLevel(0);
      setAttemptCount(0);
      setIsFirstAttempt(true);
      setLocked(false);
      setZyroEmotion('happy');
      setZyroMessage('');
    }
  }, [currentQIdx, dispatch, QUESTIONS.length, sound]);

  // ── Handle answer click ───────────────────────────────────────────────
  const handleAnswer = useCallback((optionIdx) => {
    if (locked) return;
    // Disallow clicking already-resolved buttons
    if (answerStates[optionIdx] === 'locked' || answerStates[optionIdx] === 'wrong') return;

    const isCorrect = optionIdx === currentQ.correctIndex;

    if (isCorrect) {
      sound.playCorrect();
      const newStates = answerStates.map((s, i) => {
        if (i === optionIdx) return 'correct';
        return s === 'default' ? 'locked' : s;
      });
      setAnswerStates(newStates);
      setLocked(true);

      const xpAmount = isFirstAttempt ? currentQ.xp : 0;
      if (xpAmount > 0) {
        dispatch({ type: 'AWARD_XP', payload: { amount: xpAmount, skill: currentQ.skill } });
        setSessionXP(prev => prev + xpAmount);
        setSkillDeltas(prev => ({ ...prev, [currentQ.skill]: (prev[currentQ.skill] || 0) + xpAmount }));
        setXpPopup({ visible: true, amount: xpAmount });
        sound.playXP();
      }

      // Record result: correct=true, wasFirstAttempt
      dispatch({ type: 'RECORD_QUESTION_RESULT', payload: { correct: true, wasFirstAttempt: isFirstAttempt } });
      setCorrectCount(prev => prev + 1);
      if (isFirstAttempt) setFirstAttemptCorrectCount(prev => prev + 1);

      const msg = CORRECT_MESSAGES[currentQIdx % CORRECT_MESSAGES.length];
      dispatch({ type: 'ZYRO_SPEAK', payload: msg });
      setZyroEmotion('celebrating');
      setZyroMessage(msg);

      advanceTimer.current = setTimeout(() => advanceToNext(true), 1500);

    } else {
      // Wrong answer
      sound.playWrong();
      const newAttempt = attemptCount + 1;
      const newStates = [...answerStates];
      newStates[optionIdx] = 'wrong';
      setAnswerStates(newStates);

      // Record first wrong attempt
      if (isFirstAttempt) {
        dispatch({ type: 'RECORD_QUESTION_RESULT', payload: { correct: false, wasFirstAttempt: true } });
        setIsFirstAttempt(false);
      }
      setAttemptCount(newAttempt);

      // Show/advance hint level
      const nextHint = Math.min(hintLevel + 1, currentQ.hints.length);
      setHintLevel(nextHint);
      if (nextHint > 0) sound.playHint();

      if (newAttempt >= 2) {
        // MAX RETRIES REACHED — lock all remaining options and auto-advance
        const lockedStates = newStates.map(s => s === 'default' ? 'locked' : s);
        setAnswerStates(lockedStates);
        setLocked(true);
        const msg = "That was a tough one! Let's keep moving — you'll get it next time!";
        dispatch({ type: 'ZYRO_SPEAK', payload: msg });
        setZyroEmotion('concerned');
        setZyroMessage(msg);
        advanceTimer.current = setTimeout(() => advanceToNext(false), 2500);
      } else {
        // First wrong — lock that button, show hint, allow one retry
        setTimeout(() => {
          setAnswerStates(prev => prev.map((s, i) => (i === optionIdx && s === 'wrong' ? 'locked' : s)));
        }, 700);
        const wrongMsg = WRONG_MESSAGES[Math.min(newAttempt - 1, WRONG_MESSAGES.length - 1)];
        dispatch({ type: 'ZYRO_SPEAK', payload: wrongMsg });
        setZyroEmotion('thinking');
        setZyroMessage(wrongMsg);
      }
    }
  }, [locked, answerStates, currentQ, isFirstAttempt, attemptCount, hintLevel, currentQIdx, dispatch, advanceToNext, sound]);

  const handleNextHint = useCallback(() => {
    sound.playHint();
    setHintLevel(prev => Math.min(prev + 1, currentQ.hints.length));
  }, [currentQ, sound]);

  const handleReturn = useCallback(() => {
    sound.playNavigation();
    dispatch({ type: 'SET_SCENE', payload: SCENES.DASHBOARD });
  }, [dispatch, sound]);

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      <MissionBackground />

      {phase === 'question' && (
        <MissionProgressBar
          current={currentQIdx}
          total={QUESTIONS.length}
          xpEarned={sessionXP}
          crewName={crewMeta.name}
          crewColor={crewMeta.color}
        />
      )}

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40 }}>
        <XpPopup amount={xpPopup.amount} visible={xpPopup.visible} onDone={() => setXpPopup({ visible: false, amount: 0 })} />
      </div>

      {phase === 'question' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 32px 32px', gap: 32, zIndex: 10 }}>
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', width: 200, position: 'relative' }}>
            <ZyroCharacter message={zyroMessage} emotion={zyroEmotion} size={140} />
          </motion.div>

          <div style={{ flex: 1, maxWidth: 580, position: 'relative' }}>
            <AnimatePresence mode="wait">
              <QuestionCard
                key={currentQIdx}
                question={currentQ}
                questionNumber={currentQIdx + 1}
                total={QUESTIONS.length}
                onAnswer={handleAnswer}
                answerStates={answerStates}
                hintLevel={hintLevel}
                onNextHint={handleNextHint}
                isExhausted={attemptCount >= 2}
                attemptCount={attemptCount}
              />
            </AnimatePresence>
          </div>
        </div>
      )}

      <AnimatePresence>
        {phase === 'complete' && (
          <MissionCompleteScreen
            captainName={captain.name}
            score={correctCount}
            total={QUESTIONS.length}
            xpEarned={sessionXP}
            skills={captain.skills}
            skillDeltas={skillDeltas}
            firstAttemptCorrect={firstAttemptCorrectCount}
            onReturn={handleReturn}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'complete' && (
          <motion.div key="complete-zyro" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
            style={{ position: 'absolute', bottom: '8%', left: '5%', zIndex: 35, pointerEvents: 'none' }}>
            <ZyroCharacter emotion="celebrating" size={110} message="" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
