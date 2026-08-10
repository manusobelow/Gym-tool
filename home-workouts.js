// Home Workout data — ladders, day templates, and plate inventory defaults.
// Edit this file to change your home program without touching index.html or exercises.js.
// Every exercise id referenced here must exist in exercises.js.

// ---------- LADDERS ----------
// Ordered rung lists. The Home Workout page tracks your current rung + session streak per ladder.
// Hitting the ceiling reps on every set for 2 sessions in a row auto-advances to the next rung.
const LADDERS = {
  handstand: {
    label: "Handstand Push-Up Progression",
    rungs: ["HSPU_R1","HSPU_R2","HSPU_R3","HSPU_R4","HSPU_R5","HSPU_R6","HSPU_R7"]
  },
  pullup: {
    label: "Pull-Up Progression",
    rungs: ["PULLUP_R1","PULLUP_R2","PULLUP_R3","PULLUP_R4","PULLUP_R5","PULLUP_R6","W_PULLUP"]
  },
  row: {
    label: "Row Progression",
    rungs: ["ROW_R1","ROW_R2","ROW_R3","ROW_R4_RING","ROW_R5"]
  },
  pushup: {
    label: "Push-Up Progression",
    rungs: ["PUSHUP_R1","PUSHUP_R2","PUSHUP_R3","PUSHUP_R4","PUSHUP_R5","PUSHUP_R6","PUSHUP_R7","PUSHUP_R8"]
  },
  splitSquat: {
    label: "Split Squat Progression",
    rungs: ["SPLITSQ_R1","SPLITSQ_R2","SPLITSQ_R3","SPLITSQ_R4"]
  },
  lateralLunge: {
    label: "Lateral Lunge / Cossack Progression",
    rungs: ["LATLUNGE_R1","LATLUNGE_R4","COSSACK","LATLUNGE_R6"]
  },
  hipThrust: {
    label: "Hip Thrust Progression",
    rungs: ["HIPTHRUST_R1","HIPTHRUST_R2","HIPTHRUST_R3","HIPTHRUST_R4"]
  },
  singleLegRDL: {
    label: "Single-Leg RDL Progression",
    rungs: ["SLRDL_R2","SL_RDL_DB","SLRDL_R4"]
  },
  core: {
    label: "Core Progression",
    rungs: ["REVERSE_CRUNCH","STANDARD_CRUNCH","CORE_R3","AB_WHEEL_KNEE","AB_WHEEL_TOES"]
  }
};

// ---------- PROGRESSION PARAMETERS ----------
// Major Lifts: 3-stage system — Stage 1 chases last AMRAP toward 3x8, Stage 2 adds a 4th set once
// 3x8 lands twice in a row, Stage 3 (once 4x8 lands twice in a row) adds the smallest available
// plate jump and resets to Stage 1 at 3 sets — or, if no plate jump is available, bumps the rep
// target to 12 instead and still drops back to 3 sets (repTarget defaults to 8; app code switches
// it to 12 as the fallback path).
//
// Circuit — Ladders + Isolation: identical 2-round system. Ladders advance a rung when both rounds
// hit the ceiling twice in a row; Isolation has no rung to climb, so hitting the ceiling twice in a
// row instead adds the smallest available plate jump (weight is the only progression axis).
// Core uses its own wider rep range (14-20) — everything else in this bucket uses 8-12.
const CIRCUIT_PARAMS = {
  majorLift:  { repFloor: 5,  repCeiling: 8,  startSets: 3, maxSets: 4, hasAMRAP: true  }, // set 3/4 is AMRAP
  ladder:     { repFloor: 8,  repCeiling: 12, startSets: 2, maxSets: 2, hasAMRAP: false },
  ladderCore: { repFloor: 14, repCeiling: 20, startSets: 2, maxSets: 2, hasAMRAP: false }, // Core needs its own rep-range parameters
  isolation:  { repFloor: 8,  repCeiling: 12, startSets: 2, maxSets: 2, hasAMRAP: false }  // no set-count staging — weight is the only progression axis (item 9)
};
// Ladder keys that use the wider Core rep range instead of the standard 8-12.
const CORE_LADDER_KEYS = ["core"];
function ladderParamsFor(ladderKey) {
  return CORE_LADDER_KEYS.includes(ladderKey) ? CIRCUIT_PARAMS.ladderCore : CIRCUIT_PARAMS.ladder;
}

// ---------- DAY TEMPLATES ----------
const MAJOR_LIFT_DAYS = {
  A: {
    label: "Major Lift A",
    lift: "ZERCHER_SQUAT",
    dailySuperset: ["WORLDS_GREATEST_STRETCH","BAND_FP","LU_RAISE","TERES_MAJOR_BAND_HOLD"]
  },
  B: {
    label: "Major Lift B",
    lift: "STIFF_LEG_DEADLIFT",
    dailySuperset: ["WORLDS_GREATEST_STRETCH","BAND_FP","LU_RAISE","TERES_MAJOR_BAND_HOLD"]
  },
  C: {
    label: "Major Lift C",
    lift: "BB_ROW",
    dailySuperset: ["WORLDS_GREATEST_STRETCH","BAND_FP","LU_RAISE","TERES_MAJOR_BAND_HOLD"]
  }
};

const CIRCUIT_DAYS = {
  1: {
    label: "Circuit 1",
    stations: [
      { pattern: "Vertical Push",   ladder: "handstand" },
      { pattern: "Horizontal Pull", ladder: "row" },
      { pattern: "Lunge",           ladder: "splitSquat" },
      { pattern: "Hinge",           ladder: "hipThrust" },
      { pattern: "Core",            ladder: "core" },
      { pattern: "Isolation",       exercises: ["CALF_RAISE_DB","TIB_RAISE"] }
    ]
  },
  2: {
    label: "Circuit 2",
    stations: [
      { pattern: "Horizontal Push", ladder: "pushup" },
      { pattern: "Vertical Pull",   ladder: "pullup" },
      { pattern: "Lunge",           ladder: "lateralLunge" },
      { pattern: "Hinge",           ladder: "singleLegRDL" },
      { pattern: "Core",            ladder: "core" },
      { pattern: "Isolation",       exercises: ["DB_TRICEPS_OH_EXT", "BAND_LATERAL_RAISE"] }
    ]
  }
};

// ---------- BAND LEVELS ----------
// Used wherever a Home Workout exercise's "working weight" field can be toggled to a band instead
// (bands don't have a numeric weight, just a resistance tier). Order matters — index 0 is lightest,
// last index is heaviest; plateau-advancement logic (isolation progression) steps forward one index
// at a time through this array.
const BAND_LEVELS = ["light", "medium", "heavy", "xheavy"];
const BAND_LEVEL_LABELS = { light: "Light", medium: "Medium", heavy: "Heavy", xheavy: "Extra-Heavy" };

// ---------- EQUIPMENT ----------
// Home Workout's equipment picker is separate from the main gym equipment row, since the
// available set is genuinely different (no machines/cable/kettlebell yet, but rings and
// a fixed shared dumbbell handle).
const HOME_EQUIPMENT = ["barbell","dumbbell","bodyweight","band","rings"];

// ---------- PLATE INVENTORY (defaults — editable in-app, saved locally) ----------
// Fixed weights that never change:
const BAR_WEIGHT = 20;        // lb, 47" Olympic straight bar
const DB_HANDLE_WEIGHT = 13;  // lb, loadable dumbbell handle base weight
// Starting plate counts (pairs) — the app sums this into your total loadable pool.
// Update quantities here (or in-app) as you buy more.
const DEFAULT_PLATE_INVENTORY = {
  5:  1,  // pairs of 5 lb  (1 pair = 10 lb)
  10: 1,  // pairs of 10 lb (1 pair = 20 lb)
  25: 1   // pairs of 25 lb (1 pair = 50 lb)
};        // total: 10 + 20 + 50 = 80 lb
