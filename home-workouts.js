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
    // PULLUP_R2 ("Arch Hang, Supported") deliberately dropped from the progression per updated
    // programming — straight from Scapular Pulls to Arch Hang, Free.
    rungs: ["PULLUP_R1","PULLUP_R3","PULLUP_R4","PULLUP_R5","PULLUP_R6","W_PULLUP"]
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
    // SPLITSQ_R1 ("BW Split Squat, Hand-Assisted") deliberately dropped from the progression per
    // updated programming — starts straight at the unassisted bodyweight split squat.
    rungs: ["SPLITSQ_R2","SPLITSQ_R3","SPLITSQ_R4"]
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
  stepUp: {
    label: "Step-Up Progression",
    rungs: ["STEPUP_R1","STEPUP_R2","STEPUP_R3"]
  },
  nordicCurl: {
    label: "Nordic Curl Progression",
    // Rung 3 ("Full-Range Nordic Curl") reuses the existing NORDIC_CURL gym exercise instead of a
    // duplicate — it stays classified p:"Isolation"/scheme:"hypertrophy" in exercises.js for normal
    // gym browsing, and becomes dual-purpose automatically via findLadderForExercise (app-home.js)
    // once referenced here. No extra code needed for the routing to work.
    rungs: ["NORDIC_R1","NORDIC_R2","NORDIC_CURL","NORDIC_R4"]
  },
  core: {
    label: "Core Progression (Flexion / Anti-Extension)",
    rungs: ["REVERSE_CRUNCH","STANDARD_CRUNCH","CORE_R3","AB_WHEEL_KNEE","AB_WHEEL_TOES"]
  },
  core2: {
    label: "Straight-Leg Raise Progression",
    // Full replacement per updated programming: SLRAISE_R1 ("Bent-Knee Tabletop Leg Raise"),
    // SLRAISE_R3 ("Straight-Leg Raise, Bent-Knee Assist"), SLRAISE_R5 ("Hanging Straight-Leg
    // Raise"), and SLRAISE_R6 ("Weighted Straight-Leg Raise") were deliberately dropped from the
    // progression (still exist in exercises.js, just no longer ladder members). SLRAISE_R7-R10 are
    // new — a hanging bent-knee -> hanging bent-knee-side -> hanging straight-leg -> hanging
    // straight-leg-full-range sequence.
    rungs: ["SLRAISE_R2","SLRAISE_R4","SLRAISE_R7","SLRAISE_R8","SLRAISE_R9","SLRAISE_R10"]
  },
  core3: {
    label: "Lateral Flexion Progression",
    rungs: ["SIDEBEND_R1","SIDEBEND_R2","SIDEBEND_R3","SIDEBEND_R4"]
  }
};

// ---------- ISOLATION FAMILIES ----------
// Interchangeable pairs of isolation exercises a circuit day's "Isolation" station can run.
// Each station in CIRCUIT_DAYS points at a family key by default; the Home page lets you swap
// which family is active per day at will (app-home.js STATION_PICK), same mechanism as swapping
// which ladder a "Core" station runs. Each exercise inside a family keeps its own independent
// ISOLATION_STATE (weight/streak) regardless of which family is currently selected, so switching
// back and forth never loses progress.
const ISOLATION_FAMILIES = {
  calfTib: {
    label: "Calves / Tibialis",
    exercises: ["CALF_RAISE_DB","TIB_RAISE"]
  },
  armCurls: {
    label: "Forearm / Biceps",
    exercises: ["HAMMER_CURL","DB_CURL"]
  },
  tricepsLat: {
    label: "Triceps / Lateral Delts",
    exercises: ["DB_TRICEPS_OH_EXT","BAND_LATERAL_RAISE"]
  },
  rearDelt: {
    label: "Rear Delts / External Rotators",
    exercises: ["BAND_FP","DB_REAR_DELT_FLY"]
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
//
// These are DEFAULTS only. Every card (Major Lift, ladder rung, isolation exercise) lets you edit
// its own floor/ceiling directly — app-home.js's REP_RANGE_OVERRIDE stores the per-exercise/per-day
// overrides and falls back to these constants when nothing's been customized.
const CIRCUIT_PARAMS = {
  majorLift:  { repFloor: 5,  repCeiling: 8,  startSets: 3, maxSets: 4, hasAMRAP: true  }, // set 3/4 is AMRAP
  ladder:     { repFloor: 8,  repCeiling: 12, startSets: 2, maxSets: 2, hasAMRAP: false },
  ladderCore: { repFloor: 14, repCeiling: 20, startSets: 2, maxSets: 2, hasAMRAP: false }, // Core needs its own rep-range parameters
  isolation:  { repFloor: 8,  repCeiling: 12, startSets: 2, maxSets: 2, hasAMRAP: false }  // no set-count staging — weight is the only progression axis (item 9)
};
// Ladder keys that use the wider Core rep range by default instead of the standard 8-12. Also
// doubles as the registry of ladders that are Core-family alternatives to each other — this is the
// list the Home page's Core station swap-picker offers. Add a key here for any future core-style
// ladder that should both default to the wide rep range AND be selectable as a Core station.
const CORE_LADDER_KEYS = ["core","core2","core3"];
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
// The dailySuperset arrays above are just the DEFAULT 4 slots per day — the Home page's
// "Mobility / Rehab" block lets you swap any slot for a different scheme:"mobility" exercise at
// will; app-home.js's DAILY_SUPERSET_OVERRIDE stores the per-day customization and falls back to
// these defaults when nothing's been swapped.

// Circuits are now paired 1:1 with Major Lift days (A/B/C) rather than independently selectable —
// HOME.circuitDay always mirrors HOME.majorDay (see app-core.js loadAll() migration line and
// app-home.js's major-day chip handler). Station order: Vertical Push/Pull → Horizontal Push/Pull →
// Lunge → Hinge → Core → Isolation.
const CIRCUIT_DAYS = {
  A: {
    label: "Circuit A — Zercher",
    stations: [
      { pattern: "Vertical Push",   ladder: "handstand" },
      { pattern: "Horizontal Pull", ladder: "row" },
      { pattern: "Hinge",           ladder: "hipThrust" },
      { pattern: "Lunge",           ladder: "lateralLunge" },
      { pattern: "Core",            ladder: "core" },
      { pattern: "Isolation",       family: "calfTib" }
    ]
  },
  B: {
    label: "Circuit B — RDL",
    stations: [
      { pattern: "Horizontal Push", ladder: "pushup" },
      { pattern: "Vertical Pull",   ladder: "pullup" },
      { pattern: "Lunge",           ladder: "stepUp" },
      { pattern: "Hinge",           ladder: "singleLegRDL" },
      { pattern: "Core",            ladder: "core" },
      { pattern: "Isolation",       family: "tricepsLat" }
    ]
  },
  C: {
    label: "Circuit C — Barbell Row",
    stations: [
      { pattern: "Vertical Push",   ladder: "handstand" },
      { pattern: "Horizontal Push", ladder: "pushup" },
      { pattern: "Lunge",           ladder: "splitSquat" },
      { pattern: "Hinge",           ladder: "nordicCurl" },
      { pattern: "Core",            ladder: "core" },
      { pattern: "Isolation",       family: "armCurls" }
    ]
  }
};
// Core and Isolation stations above are just the DEFAULT pick per day — the Home page lets you
// swap either one to any other ladder in CORE_LADDER_KEYS / family in ISOLATION_FAMILIES at will,
// independently per circuit day. app-home.js's STATION_PICK stores that override, keyed by
// "<circuitDay>:<pattern>", and falls back to the station's own `ladder`/`family` field here when
// nothing's been picked.

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
