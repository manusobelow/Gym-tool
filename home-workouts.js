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
// Applies to every circuit-scheme exercise. Major Lifts and Isolation work use the same
// reps→sets→weight staging, just with different numbers.
const CIRCUIT_PARAMS = {
  majorLift:  { repFloor: 5,  repCeiling: 8,  startSets: 3, maxSets: 4, hasAMRAP: true  }, // set 3/4 is AMRAP
  ladder:     { repFloor: 8,  repCeiling: 15, startSets: 2, maxSets: 2, hasAMRAP: false }, // fixed 2 rounds — timed to keep Major Lift and Circuit sides roughly matched (~15 min each)
  isolation:  { repFloor: 8,  repCeiling: 12, startSets: 3, maxSets: 4, hasAMRAP: false }
};

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
      { pattern: "Isolation",       exercises: ["DB_TRICEPS_OH_EXT"] }
    ]
  }
};

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
