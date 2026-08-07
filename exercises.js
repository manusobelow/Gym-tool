// Gym Reference — exercise data
// Edit this file to add/remove/change exercises. Re-upload just this file to GitHub — no need to touch index.html.
// Fields: id (unique), n (name), p (movement pattern), scheme (main|strength|hypertrophy|mobility|circuit) — this is the DEFAULT scheme;
// can be overridden per-exercise inside the app itself, saved locally, without editing this file.
// scheme:"circuit" = Home Workout exercises only — excluded from normal gym browsing, only reachable via the Home Workout page.
// eq (equipment array — includes "rings" for Home Workout), m (muscle text, display label), region (lower|upper),
// gif (image/video URL, optional — supports direct .gif/.jpg, Google Drive links, and .mp4 video), notes (optional),
// muscles (weighted body-map targets: [{id, w}], w=3 primary/2 secondary/1 tertiary, id matches the muscle SVG taxonomy)
const EXERCISES = [
  {
    "id": "AB_WHEEL_KNEE",
    "n": "Ab Wheel Roll-Out (From Knees)",
    "p": "Core / Carry",
    "scheme": "hypertrophy",
    "eq": [
      "bodyweight"
    ],
    "m": "Abs / Lats",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/05/kneeling-ab-wheel.gif?resize=600%2C600&ssl=1",
    "notes": "Roll out to strong brace; no low-back sag, smooth return.",
    "muscles": [
      {
        "id": "abs",
        "w": 3
      },
      {
        "id": "obliques",
        "w": 2
      },
      {
        "id": "lats",
        "w": 1
      }
    ]
  },
  {
    "id": "ASSISTED_GLUTE_PRESSDOWN",
    "n": "Machine Glute Pressdown (Single-Leg)",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "machine"
    ],
    "m": "Glute Max / Hamstrings",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2025/04/single-leg-glute-push-down.gif?resize=700%2C700&ssl=1",
    "notes": "Per leg. Use the knee pad/lever to press down; slight forward hinge; squeeze glute hard at bottom.",
    "muscles": [
      {
        "id": "glute-max",
        "w": 3
      },
      {
        "id": "hamstrings",
        "w": 1
      }
    ]
  },
  {
    "id": "ATG_SPLIT_SQUAT_MOB",
    "n": "ATG Split Squat (Mobility)",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Quads / Hip Flexors",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2022/12/ATG-Split-Squat.gif",
    "notes": "~6 reps per side (use elevation if needed).",
    "muscles": [
      {
        "id": "quads",
        "w": 2
      },
      {
        "id": "hip-flexors",
        "w": 1
      }
    ]
  },
  {
    "id": "BACK_EXT_45",
    "n": "45\u00b0 Back / Hip Extension",
    "p": "Hinge",
    "scheme": "hypertrophy",
    "eq": [
      "machine"
    ],
    "m": "Spinal Erectors / Glute Max",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/05/back-extension-frontloaded.gif?resize=600%2C600&ssl=1",
    "notes": "Neutral spine; control down, extend to neutral (no hyperextension).",
    "muscles": [
      {
        "id": "spinal-erectors",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "hamstrings",
        "w": 1
      }
    ]
  },
  {
    "id": "BAND_ER",
    "n": "Standing Band External Rotation",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "band"
    ],
    "m": "Rotator Cuff / Rear Delts",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/12/Band-shoulder-external-rotation.gif?resize=600%2C600&ssl=1",
    "notes": "Standing band ER; elbow fixed, rotate from shoulder only.",
    "muscles": [
      {
        "id": "rotator-cuff",
        "w": 3
      },
      {
        "id": "rear-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "BAND_FP",
    "n": "Face Pull",
    "p": "Pull Horizontal",
    "scheme": "mobility",
    "eq": [
      "band"
    ],
    "m": "Rear Delts / Upper Back",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/05/face-pull.gif?resize=600%2C600&ssl=1",
    "notes": "Elbows high.",
    "muscles": [
      {
        "id": "rear-delts",
        "w": 3
      },
      {
        "id": "rhomboids",
        "w": 2
      },
      {
        "id": "upper-back",
        "w": 1
      }
    ]
  },
  {
    "id": "BAND_PA",
    "n": "Band Pull-Apart",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "band"
    ],
    "m": "Upper Back / Rear Delts",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/04/Band-Pull-Apart.gif?resize=600%2C600&ssl=1",
    "notes": "Smooth reps.",
    "muscles": [
      {
        "id": "upper-back",
        "w": 2
      },
      {
        "id": "rear-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "BB_BACK_SQUAT",
    "n": "Barbell Back Squat",
    "p": "Squat",
    "scheme": "main",
    "eq": [
      "barbell"
    ],
    "m": "Quads / Glute Max",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2021/11/squat.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "quads",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "adductors",
        "w": 1
      }
    ]
  },
  {
    "id": "BB_BENCH_INCLINE",
    "n": "Incline Barbell Bench Press",
    "p": "Push Horizontal",
    "scheme": "strength",
    "eq": [
      "barbell"
    ],
    "m": "Chest / Front Delts",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/Incline-Bench-Press.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "front-delts",
        "w": 2
      },
      {
        "id": "triceps",
        "w": 1
      }
    ]
  },
  {
    "id": "BB_BENCH_PRESS",
    "n": "Barbell Bench Press",
    "p": "Push Horizontal",
    "scheme": "main",
    "eq": [
      "barbell"
    ],
    "m": "Chest / Triceps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2021/09/bench-press.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "front-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "BB_DEADLIFT",
    "n": "Conventional Deadlift",
    "p": "Hinge",
    "scheme": "main",
    "eq": [
      "barbell"
    ],
    "m": "Hamstrings / Glute Max",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/11/Deadlift.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "hamstrings",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "spinal-erectors",
        "w": 1
      }
    ]
  },
  {
    "id": "BB_FRONT_SQUAT",
    "n": "Barbell Front Squat",
    "p": "Squat",
    "scheme": "main",
    "eq": [
      "barbell"
    ],
    "m": "Quads / Glute Max",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2021/09/Front-squat.gif?resize=600%2C595&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "quads",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "adductors",
        "w": 1
      }
    ]
  },
  {
    "id": "BB_GOOD_MORNING",
    "n": "Good Morning (Barbell)",
    "p": "Hinge",
    "scheme": "strength",
    "eq": [
      "barbell"
    ],
    "m": "Hamstrings / Spinal Erectors",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/02/Good-morning.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "hamstrings",
        "w": 3
      },
      {
        "id": "spinal-erectors",
        "w": 2
      },
      {
        "id": "glute-max",
        "w": 1
      }
    ]
  },
  {
    "id": "BB_HIP_THRUST",
    "n": "Barbell Hip Thrust",
    "p": "Hinge",
    "scheme": "main",
    "eq": [
      "barbell"
    ],
    "m": "Glute Max / Hamstrings",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/02/Hip-thrust.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "glute-max",
        "w": 3
      },
      {
        "id": "hamstrings",
        "w": 2
      },
      {
        "id": "adductors",
        "w": 1
      }
    ]
  },
  {
    "id": "BB_LUNGE",
    "n": "Barbell Lunge",
    "p": "Lunge",
    "scheme": "strength",
    "eq": [
      "barbell"
    ],
    "m": "Glute Max / Quads",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/Barbell-Lunge.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "quads",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "adductors",
        "w": 1
      }
    ]
  },
  {
    "id": "BB_OHP",
    "n": "Barbell Overhead Press",
    "p": "Push Vertical",
    "scheme": "main",
    "eq": [
      "barbell"
    ],
    "m": "Front Delts / Triceps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/12/Overhead-press-exercise.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "front-delts",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "upper-traps",
        "w": 1
      }
    ]
  },
  {
    "id": "BB_RDL",
    "n": "Romanian Deadlift (Barbell)",
    "p": "Hinge",
    "scheme": "strength",
    "eq": [
      "barbell"
    ],
    "m": "Hamstrings / Glute Max",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2022/01/Romanian-deadlift.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "hamstrings",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "spinal-erectors",
        "w": 1
      }
    ]
  },
  {
    "id": "BB_ROW",
    "n": "Barbell Row",
    "p": "Pull Horizontal",
    "scheme": "main",
    "eq": [
      "barbell"
    ],
    "m": "Upper Back / Biceps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2022/03/Barbell-Row.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "rhomboids",
        "w": 2
      },
      {
        "id": "biceps",
        "w": 1
      }
    ]
  },
  {
    "id": "BREATH_360",
    "n": "360\u00b0 Breathing (standing or hook-lying)",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Transverse Abdominis / Abs",
    "region": "upper",
    "gif": "",
    "notes": "Count = breaths.",
    "muscles": [
      {
        "id": "transverse-abdominal",
        "w": 2
      },
      {
        "id": "abs",
        "w": 1
      }
    ]
  },
  {
    "id": "CABLE_BICEPS_CURL",
    "n": "Cable Biceps Curl",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "cable"
    ],
    "m": "Biceps / Forearms",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2025/11/cable-curl-with-bar.gif?resize=700%2C700&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "biceps",
        "w": 3
      },
      {
        "id": "forearms",
        "w": 1
      }
    ]
  },
  {
    "id": "CABLE_CHEST_PRESS",
    "n": "Cable Chest Press",
    "p": "Push Horizontal",
    "scheme": "strength",
    "eq": [
      "cable"
    ],
    "m": "Chest / Triceps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/cable-chest-press.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "front-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "CABLE_CRUNCH",
    "n": "STANDING Cable Crunch",
    "p": "Core / Carry",
    "scheme": "hypertrophy",
    "eq": [
      "cable"
    ],
    "m": "Abs / Hip Flexors",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/cable-crunch.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "abs",
        "w": 3
      },
      {
        "id": "hip-flexors",
        "w": 2
      }
    ]
  },
  {
    "id": "CABLE_CRUNCH_KNEEL",
    "n": "Kneeling Cable Crunch",
    "p": "Core / Carry",
    "scheme": "hypertrophy",
    "eq": [
      "cable"
    ],
    "m": "Abs / Hip Flexors",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/cable-crunch.gif?resize=600%2C600&ssl=1",
    "notes": "Ribs to pelvis; don't just pull with arms, controlled spinal flexion.",
    "muscles": [
      {
        "id": "abs",
        "w": 3
      },
      {
        "id": "hip-flexors",
        "w": 1
      }
    ]
  },
  {
    "id": "CABLE_FLY_HIGH2LOW",
    "n": "Cable Fly (High-to-Low)",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "cable"
    ],
    "m": "Chest / Front Delts",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/02/High-Cable-Crossover.gif",
    "notes": "",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "front-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "CABLE_LAT_PRAYER",
    "n": "Cable Straight-Arm Pulldown",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "cable"
    ],
    "m": "Lats / Upper Back",
    "region": "upper",
    "gif": "",
    "notes": "",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "teres-major",
        "w": 1
      }
    ]
  },
  {
    "id": "CABLE_LATERAL_RAISE",
    "n": "Cable Lateral Raise",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "cable"
    ],
    "m": "Side Delts / Upper Traps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2025/11/cable-lateral-raise.gif?resize=700%2C700&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "side-delts",
        "w": 3
      },
      {
        "id": "upper-traps",
        "w": 1
      }
    ]
  },
  {
    "id": "CABLE_ROW_1ARM",
    "n": "Single-Arm Cable Row",
    "p": "Pull Horizontal",
    "scheme": "strength",
    "eq": [
      "cable"
    ],
    "m": "Upper Back / Biceps",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/02/One-arm-Cable-Row.gif",
    "notes": "",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "rhomboids",
        "w": 2
      },
      {
        "id": "biceps",
        "w": 1
      }
    ]
  },
  {
    "id": "CALF_1LEG",
    "n": "Single-Leg Calf Raise",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "bodyweight"
    ],
    "m": "Calves / Tibialis Anterior",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/calf-raise-standing.gif?resize=600%2C600&ssl=1",
    "notes": "Per leg. Full ROM.",
    "muscles": [
      {
        "id": "calves",
        "w": 3
      },
      {
        "id": "tibialis-anterior",
        "w": 1
      }
    ]
  },
  {
    "id": "CALF_RAISE_MACHINE_STAND",
    "n": "Standing Calf Raise Machine",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "machine"
    ],
    "m": "Calves / Tibialis Anterior",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/calf-raise-standing.gif?resize=600%2C600&ssl=1",
    "notes": "Full ROM. Big toe pressure; slow eccentric; brief pause at stretch.",
    "muscles": [
      {
        "id": "calves",
        "w": 3
      },
      {
        "id": "tibialis-anterior",
        "w": 1
      }
    ]
  },
  {
    "id": "CAT_COW",
    "n": "Cat-Cow",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Spinal Erectors / Transverse Abdominis",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2025/09/cat-cow.gif?resize=700%2C700&ssl=1",
    "notes": "Spine & rib prep.",
    "muscles": [
      {
        "id": "spinal-erectors",
        "w": 2
      },
      {
        "id": "transverse-abdominal",
        "w": 1
      }
    ]
  },
  {
    "id": "CHEST_PRESS_MACHINE",
    "n": "Chest Press Machine",
    "p": "Push Horizontal",
    "scheme": "strength",
    "eq": [
      "machine"
    ],
    "m": "Chest / Triceps",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/06/Inner-Chest-Press-Machine.gif",
    "notes": "",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "front-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "CHINUP",
    "n": "Chin-Up (Bodyweight)",
    "p": "Pull Vertical",
    "scheme": "strength",
    "eq": [
      "bodyweight"
    ],
    "m": "Lats / Biceps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/chin-up.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "biceps",
        "w": 2
      },
      {
        "id": "teres-major",
        "w": 1
      }
    ]
  },
  {
    "id": "CLAMSHELL",
    "n": "Side-lying Clamshell",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Glute Med / Glute Max",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2024/01/clamshell.gif?resize=600%2C600&ssl=1",
    "notes": "Per side. Left first.",
    "muscles": [
      {
        "id": "glute-med",
        "w": 2
      },
      {
        "id": "glute-max",
        "w": 1
      }
    ]
  },
  {
    "id": "COBRA_DN_DOG",
    "n": "Cobra to Downward Dog",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Spinal Erectors / Hamstrings",
    "region": "upper",
    "gif": "",
    "notes": "~6-8 reps (scale ROM as needed).",
    "muscles": [
      {
        "id": "spinal-erectors",
        "w": 2
      },
      {
        "id": "hamstrings",
        "w": 1
      }
    ]
  },
  {
    "id": "COSSACK",
    "n": "Cossack Squat",
    "p": "Squat",
    "scheme": "hypertrophy",
    "eq": [
      "bodyweight"
    ],
    "m": "Adductors / Glute Max",
    "region": "lower",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/05/Cossack-Squat.gif",
    "notes": "Mobility + adductors.",
    "muscles": [
      {
        "id": "adductors",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "quads",
        "w": 1
      }
    ]
  },
  {
    "id": "DB_BENCH_FLAT",
    "n": "Dumbbell Bench Press",
    "p": "Push Horizontal",
    "scheme": "strength",
    "eq": [
      "dumbbell"
    ],
    "m": "Chest / Triceps",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Press-1.gif",
    "notes": "",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "front-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "DB_BENCH_INCLINE",
    "n": "Incline Dumbbell Bench Press",
    "p": "Push Horizontal",
    "scheme": "strength",
    "eq": [
      "dumbbell"
    ],
    "m": "Chest / Front Delts",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Press.gif",
    "notes": "",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "front-delts",
        "w": 2
      },
      {
        "id": "triceps",
        "w": 1
      }
    ]
  },
  {
    "id": "DB_CURL",
    "n": "DB/BB Curl",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "dumbbell"
    ],
    "m": "Biceps / Forearms",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/02/Hantelcurl.gif?resize=600%2C600&ssl=1",
    "notes": "Superset-friendly.",
    "muscles": [
      {
        "id": "biceps",
        "w": 3
      },
      {
        "id": "forearms",
        "w": 1
      }
    ]
  },
  {
    "id": "DB_FLOOR_PRESS",
    "n": "DB Floor Press (or Incline DB Press)",
    "p": "Push Horizontal",
    "scheme": "strength",
    "eq": [
      "dumbbell"
    ],
    "m": "Chest / Triceps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2022/09/dumbbell-floor-press.gif?resize=600%2C600&ssl=1",
    "notes": "Costo-friendly range.",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "front-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "DB_FLY",
    "n": "Flat Dumbbell Fly",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "dumbbell"
    ],
    "m": "Chest / Front Delts",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/Dumbbell-Chest-Fly.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "front-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "DB_FLY_INCLINE",
    "n": "Incline Dumbbell Fly",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "dumbbell"
    ],
    "m": "Chest / Front Delts",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-dumbbell-Fly.gif",
    "notes": "",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "front-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "DB_FRONT_RAISE_ALT",
    "n": "DB Alternating Front Raise",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "kettlebell",
      "dumbbell"
    ],
    "m": "Front Delts / Upper Traps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/Dumbbell-Front-Raise.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "front-delts",
        "w": 3
      },
      {
        "id": "upper-traps",
        "w": 1
      }
    ]
  },
  {
    "id": "DB_HIGH_ROW_ER",
    "n": "DB High Row to External Rotation (Cuban Press)",
    "p": "Pull Horizontal",
    "scheme": "hypertrophy",
    "eq": [
      "kettlebell",
      "dumbbell"
    ],
    "m": "Rotator Cuff / Rear Delts",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2024/10/cuban-press.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "rear-delts",
        "w": 3
      },
      {
        "id": "rotator-cuff",
        "w": 2
      },
      {
        "id": "upper-traps",
        "w": 1
      }
    ]
  },
  {
    "id": "DB_INC_CURL",
    "n": "DB Incline Curl",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "kettlebell",
      "dumbbell"
    ],
    "m": "Biceps / Forearms",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/10/Incline-Dumbbell-Curl.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "biceps",
        "w": 3
      },
      {
        "id": "forearms",
        "w": 1
      }
    ]
  },
  {
    "id": "DB_OHP_1ARM",
    "n": "Single-Arm DB Overhead Press (Half-kneeling)",
    "p": "Push Vertical",
    "scheme": "strength",
    "eq": [
      "dumbbell"
    ],
    "m": "Front Delts / Triceps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/02/Dumbbell-shoulder-press.gif?resize=600%2C600&ssl=1",
    "notes": "Per arm. Stacked ribs.",
    "muscles": [
      {
        "id": "front-delts",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "obliques",
        "w": 1
      }
    ]
  },
  {
    "id": "DB_REAR_DELT_FLY",
    "n": "DB Rear Delt Fly",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "dumbbell"
    ],
    "m": "Rear Delts / Upper Back",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Reverse-Fly.gif",
    "notes": "",
    "muscles": [
      {
        "id": "rear-delts",
        "w": 3
      },
      {
        "id": "upper-back",
        "w": 1
      }
    ]
  },
  {
    "id": "DB_ROW_1ARM",
    "n": "Single-Arm DB Row",
    "p": "Pull Horizontal",
    "scheme": "strength",
    "eq": [
      "dumbbell"
    ],
    "m": "Upper Back / Biceps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/Dumbbell-Row.gif?resize=600%2C600&ssl=1",
    "notes": "Start left. Control.",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "rhomboids",
        "w": 2
      },
      {
        "id": "biceps",
        "w": 1
      }
    ]
  },
  {
    "id": "DB_ROW_2ARM",
    "n": "DB Bent-Over Row (2-arm)",
    "p": "Pull Horizontal",
    "scheme": "strength",
    "eq": [
      "dumbbell"
    ],
    "m": "Upper Back / Biceps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/Dumbbell-Row.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "rhomboids",
        "w": 2
      },
      {
        "id": "biceps",
        "w": 1
      }
    ]
  },
  {
    "id": "DB_ROW_CHESTSUP",
    "n": "Chest-Supported Dumbbell Row",
    "p": "Pull Horizontal",
    "scheme": "strength",
    "eq": [
      "dumbbell"
    ],
    "m": "Upper Back / Biceps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2024/11/chest-supported-dumbbell-row.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "rhomboids",
        "w": 2
      },
      {
        "id": "biceps",
        "w": 1
      }
    ]
  },
  {
    "id": "DB_ROW_STAGGER",
    "n": "DB Long Staggered Stance Row",
    "p": "Pull Horizontal",
    "scheme": "strength",
    "eq": [
      "kettlebell",
      "dumbbell"
    ],
    "m": "Upper Back / Biceps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/Dumbbell-Row.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "rhomboids",
        "w": 2
      },
      {
        "id": "biceps",
        "w": 1
      }
    ]
  },
  {
    "id": "DB_SHRUG",
    "n": "Dumbbell Shrug",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "dumbbell"
    ],
    "m": "Upper Traps / Forearms",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/Dumbbell-Shrug.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "upper-traps",
        "w": 3
      },
      {
        "id": "forearms",
        "w": 1
      }
    ]
  },
  {
    "id": "DB_TRICEPS_OH_EXT",
    "n": "DB Overhead Triceps Extension",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "dumbbell"
    ],
    "m": "Triceps / Front Delts",
    "region": "upper",
    "gif": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzAtRzPVnCRBO0hrxy5rsC3GNvT6SgcElH5WzbKKe_Iw&s=10",
    "notes": "",
    "muscles": [
      {
        "id": "triceps",
        "w": 3
      },
      {
        "id": "front-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "DIP",
    "n": "Dip (Parallel Bars)",
    "p": "Push Horizontal",
    "scheme": "hypertrophy",
    "eq": [
      "bodyweight"
    ],
    "m": "Chest / Triceps",
    "region": "upper",
    "gif": "",
    "notes": "",
    "muscles": [
      {
        "id": "triceps",
        "w": 3
      },
      {
        "id": "chest",
        "w": 2
      },
      {
        "id": "front-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "EZ_CURL",
    "n": "EZ Bar Curl",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "barbell"
    ],
    "m": "Biceps / Forearms",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Z-Bar-Preacher-Curl.gif",
    "notes": "",
    "muscles": [
      {
        "id": "biceps",
        "w": 3
      },
      {
        "id": "forearms",
        "w": 1
      }
    ]
  },
  {
    "id": "EZ_TRI_EXT",
    "n": "EZ Bar Triceps Extension",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "barbell"
    ],
    "m": "Triceps / Forearms",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2025/10/lying-triceps-extension-with-ez-bar.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "triceps",
        "w": 3
      },
      {
        "id": "forearms",
        "w": 1
      }
    ]
  },
  {
    "id": "FACE_PULL",
    "n": "Face Pull / Band Pull-Apart",
    "p": "Pull Horizontal",
    "scheme": "hypertrophy",
    "eq": [
      "cable",
      "band",
      "machine"
    ],
    "m": "Rear Delts / Upper Back",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/05/face-pull.gif?resize=600%2C600&ssl=1",
    "notes": "Light, clean reps.",
    "muscles": [
      {
        "id": "rear-delts",
        "w": 3
      },
      {
        "id": "rhomboids",
        "w": 2
      },
      {
        "id": "upper-back",
        "w": 1
      }
    ]
  },
  {
    "id": "FARMERS_CARRY",
    "n": "Farmer's Carry (Two DB/KB)",
    "p": "Core / Carry",
    "scheme": "hypertrophy",
    "eq": [
      "dumbbell",
      "kettlebell"
    ],
    "m": "Forearms / Upper Traps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2021/01/Farmers-walk.gif?resize=600%2C480&ssl=1",
    "notes": "Distance or time in Notes.",
    "muscles": [
      {
        "id": "forearms",
        "w": 3
      },
      {
        "id": "upper-traps",
        "w": 2
      },
      {
        "id": "abs",
        "w": 1
      }
    ]
  },
  {
    "id": "GLUTE_BRIDGE",
    "n": "Glute Bridge (pause 2s)",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Glute Max / Hamstrings",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2025/09/glutebridge.gif?resize=700%2C700&ssl=1",
    "notes": "Pause 2 sec at top.",
    "muscles": [
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "hamstrings",
        "w": 1
      }
    ]
  },
  {
    "id": "GLUTE_KICKBACK_MACHINE",
    "n": "Glute Kickback / Donkey Kick Machine",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "machine"
    ],
    "m": "Glute Max / Hamstrings",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2023/01/Standing-glute-kickback-in-machine-1.gif?resize=600%2C600&ssl=1",
    "notes": "Per leg. Drive through heel; keep ribs down, no low-back arch.",
    "muscles": [
      {
        "id": "glute-max",
        "w": 3
      },
      {
        "id": "hamstrings",
        "w": 1
      }
    ]
  },
  {
    "id": "GOBLET_SITIN",
    "n": "Goblet Squat",
    "p": "Squat",
    "scheme": "strength",
    "eq": [
      "dumbbell",
      "kettlebell"
    ],
    "m": "Quads / Glute Max",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/02/Goblet-squat.gif?resize=600%2C600&ssl=1",
    "notes": "Hold seconds.",
    "muscles": [
      {
        "id": "quads",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "adductors",
        "w": 1
      }
    ]
  },
  {
    "id": "HACK_SQUAT",
    "n": "Hack Squat Machine",
    "p": "Squat",
    "scheme": "strength",
    "eq": [
      "machine"
    ],
    "m": "Quads / Glute Max",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/04/hack-squat-machine.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "quads",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 1
      }
    ]
  },
  {
    "id": "HAMMER_CURL",
    "n": "DB Hammer Curl",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "dumbbell"
    ],
    "m": "Biceps / Forearms",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/02/Hammer-curl.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "biceps",
        "w": 3
      },
      {
        "id": "forearms",
        "w": 2
      }
    ]
  },
  {
    "id": "HANG_KNEE_RAISE",
    "n": "Hanging Knee Raise (PPT Focus)",
    "p": "Core / Carry",
    "scheme": "hypertrophy",
    "eq": [
      "bodyweight"
    ],
    "m": "Abs / Hip Flexors",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/hanging-knee-raise.gif?resize=600%2C600&ssl=1",
    "notes": "Posterior pelvic tilt; raise knees without swinging, control down.",
    "muscles": [
      {
        "id": "abs",
        "w": 3
      },
      {
        "id": "hip-flexors",
        "w": 2
      }
    ]
  },
  {
    "id": "HIIT_BIKE",
    "n": "HIIT Bike Intervals",
    "p": "Conditioning",
    "scheme": "mobility",
    "eq": [
      "machine"
    ],
    "m": "Quads / Glute Max",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2022/06/Assault-AirBike.gif",
    "notes": "",
    "muscles": [
      {
        "id": "quads",
        "w": 2
      },
      {
        "id": "glute-max",
        "w": 1
      }
    ]
  },
  {
    "id": "HIP_ABD_MACHINE",
    "n": "Hip Abduction Machine (Glute Med)",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "bodyweight"
    ],
    "m": "Glute Med / Glute Max",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/hip-abduction-machine.gif?resize=600%2C600&ssl=1",
    "notes": "Slow and controlled; pause at peak abduction. Don't rock torso.",
    "muscles": [
      {
        "id": "glute-med",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 1
      }
    ]
  },
  {
    "id": "HIP_ADDUCTION_MACHINE",
    "n": "Hip Adduction Machine",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "machine"
    ],
    "m": "Adductors / Glute Max",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/hip-adduction-machine.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "adductors",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 1
      }
    ]
  },
  {
    "id": "HIP_THRUST",
    "n": "Hip Thrust / Glute Bridge",
    "p": "Hinge",
    "scheme": "strength",
    "eq": [
      "bodyweight",
      "barbell"
    ],
    "m": "Glute Max / Hamstrings",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/02/Hip-thrust.gif?resize=600%2C600&ssl=1",
    "notes": "Pause/squeeze at top.",
    "muscles": [
      {
        "id": "glute-max",
        "w": 3
      },
      {
        "id": "hamstrings",
        "w": 2
      },
      {
        "id": "adductors",
        "w": 1
      }
    ]
  },
  {
    "id": "HK_CABLE_CHOP",
    "n": "Half-Kneeling Cable Chop",
    "p": "Core / Carry",
    "scheme": "hypertrophy",
    "eq": [
      "cable"
    ],
    "m": "Obliques / Lats",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2022/02/Cable-Half-Kneeling-Pallof-Press.gif",
    "notes": "Half-kneeling; rotate through ribs/hips, resist low-back twist, smooth power.",
    "muscles": [
      {
        "id": "obliques",
        "w": 3
      },
      {
        "id": "lats",
        "w": 2
      },
      {
        "id": "abs",
        "w": 1
      }
    ]
  },
  {
    "id": "HK_HIPFLEX_STRETCH",
    "n": "Half-Kneeling Hip Flexor Stretch",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Hip Flexors / Quads",
    "region": "upper",
    "gif": "",
    "notes": "Posterior pelvic tilt + glute squeeze; gentle hip-flexor/quad stretch.",
    "muscles": [
      {
        "id": "hip-flexors",
        "w": 2
      },
      {
        "id": "quads",
        "w": 1
      }
    ]
  },
  {
    "id": "INCLINE_CHEST_PRESS_MACHINE",
    "n": "Incline Chest Press Machine",
    "p": "Push Horizontal",
    "scheme": "strength",
    "eq": [
      "machine"
    ],
    "m": "Chest / Front Delts",
    "region": "upper",
    "gif": "",
    "notes": "",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "front-delts",
        "w": 2
      },
      {
        "id": "triceps",
        "w": 1
      }
    ]
  },
  {
    "id": "JEFFERSON_CURL",
    "n": "Jefferson Curl",
    "p": "Hinge",
    "scheme": "hypertrophy",
    "eq": [
      "barbell",
      "dumbbell"
    ],
    "m": "Spinal Erectors / Hamstrings",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2023/09/Jefferson-Curl.gif?resize=576%2C1024&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "spinal-erectors",
        "w": 3
      },
      {
        "id": "hamstrings",
        "w": 2
      }
    ]
  },
  {
    "id": "JM_PRESS",
    "n": "JM Press (or Close-Grip Bench Press)",
    "p": "Push Horizontal",
    "scheme": "main",
    "eq": [
      "barbell"
    ],
    "m": "Triceps / Chest",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2021/09/Close-grip-bench-press.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "triceps",
        "w": 3
      },
      {
        "id": "chest",
        "w": 2
      },
      {
        "id": "front-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "KB_CLEAN",
    "n": "Kettlebell Clean",
    "p": "Pull Horizontal",
    "scheme": "strength",
    "eq": [
      "kettlebell"
    ],
    "m": "Glute Max / Upper Back",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2025/03/Kettlebell-Clean.gif?resize=700%2C700&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "glute-max",
        "w": 3
      },
      {
        "id": "hamstrings",
        "w": 2
      },
      {
        "id": "upper-back",
        "w": 1
      }
    ]
  },
  {
    "id": "KB_FRONT_SQUAT",
    "n": "Kettlebell Front Squat",
    "p": "Squat",
    "scheme": "hypertrophy",
    "eq": [
      "kettlebell"
    ],
    "m": "Quads / Glute Max",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2025/09/Kettlebell-frontsquat.gif?resize=700%2C700&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "quads",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "adductors",
        "w": 1
      }
    ]
  },
  {
    "id": "KB_PUSH_PRESS_1ARM",
    "n": "One-Arm Kettlebell Push Press",
    "p": "Push Vertical",
    "scheme": "strength",
    "eq": [
      "kettlebell"
    ],
    "m": "Front Delts / Triceps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2025/09/kettlebell-pushpress-one-arm.gif?resize=700%2C700&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "front-delts",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "quads",
        "w": 1
      }
    ]
  },
  {
    "id": "KB_SWING",
    "n": "Kettlebell Swing",
    "p": "Hinge",
    "scheme": "hypertrophy",
    "eq": [
      "kettlebell"
    ],
    "m": "Glute Max / Hamstrings",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/02/Kettlebellsving.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "glute-max",
        "w": 3
      },
      {
        "id": "hamstrings",
        "w": 2
      },
      {
        "id": "spinal-erectors",
        "w": 1
      }
    ]
  },
  {
    "id": "LANDMINE_CLEAN_ROT_PRESS",
    "n": "Landmine Clean to Rotational Press",
    "p": "Push Vertical",
    "scheme": "strength",
    "eq": [
      "landmine"
    ],
    "m": "Front Delts / Obliques",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2024/10/landmine-press.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "front-delts",
        "w": 3
      },
      {
        "id": "obliques",
        "w": 2
      },
      {
        "id": "triceps",
        "w": 1
      }
    ]
  },
  {
    "id": "LAT_LINE_STRETCH",
    "n": "Lateral Line Stretch",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Lats / Obliques",
    "region": "upper",
    "gif": "",
    "notes": "~5-6 reps with ~5-sec holds per side.",
    "muscles": [
      {
        "id": "lats",
        "w": 2
      },
      {
        "id": "obliques",
        "w": 1
      }
    ]
  },
  {
    "id": "LAT_PULLDOWN",
    "n": "Lat Pulldown (Cable/Machine)",
    "p": "Pull Vertical",
    "scheme": "strength",
    "eq": [
      "cable",
      "machine"
    ],
    "m": "Lats / Biceps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/lat-pulldown-with-pronated-grip.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "biceps",
        "w": 2
      },
      {
        "id": "teres-major",
        "w": 1
      }
    ]
  },
  {
    "id": "LAT_RAISE",
    "n": "DB Lateral Raise",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "dumbbell"
    ],
    "m": "Side Delts / Upper Traps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/12/Dumbbell-Lateral-Raise.gif?resize=600%2C600&ssl=1",
    "notes": "Keep it strict.",
    "muscles": [
      {
        "id": "side-delts",
        "w": 3
      },
      {
        "id": "upper-traps",
        "w": 1
      }
    ]
  },
  {
    "id": "LAT_RAISE_SIDELY",
    "n": "Side-Lying Lateral Raise (DB)",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "dumbbell"
    ],
    "m": "Side Delts / Upper Traps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/12/Dumbbell-Lateral-Raise.gif?resize=600%2C600&ssl=1",
    "notes": "Side-lying; small DB, raise in arc slightly forward, no shoulder pinch.",
    "muscles": [
      {
        "id": "side-delts",
        "w": 3
      },
      {
        "id": "upper-traps",
        "w": 1
      }
    ]
  },
  {
    "id": "LEG_CURL_LYING",
    "n": "Lying Leg Curl Machine",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "machine"
    ],
    "m": "Hamstrings / Calves",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2023/09/lying-leg-curl.gif?resize=700%2C700&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "hamstrings",
        "w": 3
      },
      {
        "id": "calves",
        "w": 1
      }
    ]
  },
  {
    "id": "LEG_CURL_SEATED",
    "n": "Seated Leg Curl Machine",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "machine"
    ],
    "m": "Hamstrings / Calves",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/leg-curl-seated.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "hamstrings",
        "w": 3
      },
      {
        "id": "calves",
        "w": 1
      }
    ]
  },
  {
    "id": "LEG_EXTENSION",
    "n": "Leg Extension Machine",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "machine"
    ],
    "m": "Quads / Hip Flexors",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/leg-extension-seated.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "quads",
        "w": 3
      },
      {
        "id": "hip-flexors",
        "w": 1
      }
    ]
  },
  {
    "id": "LEG_PRESS",
    "n": "45\u00b0 Leg Press",
    "p": "Squat",
    "scheme": "hypertrophy",
    "eq": [
      "machine"
    ],
    "m": "Quads / Glute Max",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2025/11/leg-press.gif?resize=700%2C700&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "quads",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "hamstrings",
        "w": 1
      }
    ]
  },
  {
    "id": "LEG_PRESS_CALF_RAISE",
    "n": "Leg Press Calf Raise",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "machine"
    ],
    "m": "Calves / Tibialis Anterior",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2025/10/calf-raise-in-leg-press.gif?resize=700%2C700&ssl=1",
    "notes": "Balls of feet on platform edge; deep stretch; don't bounce. Control reps.",
    "muscles": [
      {
        "id": "calves",
        "w": 3
      },
      {
        "id": "tibialis-anterior",
        "w": 1
      }
    ]
  },
  {
    "id": "OPEN_BOOK",
    "n": "Open Book (Thoracic Rotation)",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Upper Back / Obliques",
    "region": "upper",
    "gif": "",
    "notes": "Side-lying thoracic rotation; follow hand with eyes.",
    "muscles": [
      {
        "id": "upper-back",
        "w": 2
      },
      {
        "id": "obliques",
        "w": 1
      }
    ]
  },
  {
    "id": "PALLOF",
    "n": "Pallof Press (Anti-rotation)",
    "p": "Core / Carry",
    "scheme": "hypertrophy",
    "eq": [
      "cable",
      "band"
    ],
    "m": "Obliques / Transverse Abdominis",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2025/04/pallof-press.gif?ssl=1&w=700",
    "notes": "Per side. Don't rotate.",
    "muscles": [
      {
        "id": "obliques",
        "w": 3
      },
      {
        "id": "transverse-abdominal",
        "w": 2
      }
    ]
  },
  {
    "id": "PEC_DECK",
    "n": "Pec Deck Fly Machine",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "machine"
    ],
    "m": "Chest / Front Delts",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/04/pec-deck.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "front-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "PEC_ROLL_OPENER",
    "n": "Foam Roller Pec Opener",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Chest / Front Delts",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2022/02/Foam-Roller-Chest-Stretch.gif",
    "notes": "Lie lengthwise on roller; arms in T/goalpost, relax into opening.",
    "muscles": [
      {
        "id": "chest",
        "w": 2
      },
      {
        "id": "front-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "PEC_STRETCH",
    "n": "Doorway Pec Stretch",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Chest / Front Delts",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/01/Doorway-chest-and-sshoulder-stretch.gif",
    "notes": "Doorway pec stretch; gentle, don't crank shoulder joint.",
    "muscles": [
      {
        "id": "chest",
        "w": 2
      },
      {
        "id": "front-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "PLANK",
    "n": "Plank Hold",
    "p": "Core / Carry",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Transverse Abdominis / Serratus",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/Plank.jpg?resize=1024%2C1024&ssl=1",
    "notes": "Count = seconds.",
    "muscles": [
      {
        "id": "transverse-abdominal",
        "w": 3
      },
      {
        "id": "serratus",
        "w": 2
      },
      {
        "id": "abs",
        "w": 1
      }
    ]
  },
  {
    "id": "PRONE_T",
    "n": "Prone T-Raise / Reverse Fly",
    "p": "Pull Horizontal",
    "scheme": "hypertrophy",
    "eq": [
      "dumbbell"
    ],
    "m": "Rhomboids / Rear Delts",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/02/Reverse-dumbbell-flyes.gif?resize=600%2C600&ssl=1",
    "notes": "Reverse fly pattern; squeeze between shoulder blades.",
    "muscles": [
      {
        "id": "rhomboids",
        "w": 3
      },
      {
        "id": "rear-delts",
        "w": 2
      },
      {
        "id": "mid-traps",
        "w": 1
      }
    ]
  },
  {
    "id": "PRONE_Y",
    "n": "Prone Y-Raise",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Lower Traps / Rear Delts",
    "region": "upper",
    "gif": "https://www.inspireusafoundation.org/file/2023/11/prone-y-raise-movement.gif",
    "notes": "Light load; thumbs up, lift from lower traps not neck.",
    "muscles": [
      {
        "id": "lower-traps",
        "w": 2
      },
      {
        "id": "rear-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "PUSHUP",
    "n": "Push-Up",
    "p": "Push Horizontal",
    "scheme": "hypertrophy",
    "eq": [
      "bodyweight"
    ],
    "m": "Chest / Triceps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/02/Push-up.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "front-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "RDL",
    "n": "RDL (Barbell/DB)",
    "p": "Hinge",
    "scheme": "strength",
    "eq": [
      "barbell",
      "dumbbell"
    ],
    "m": "Hamstrings / Glute Max",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2022/01/Romanian-deadlift.gif?resize=600%2C600&ssl=1",
    "notes": "Slow eccentric.",
    "muscles": [
      {
        "id": "hamstrings",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "spinal-erectors",
        "w": 1
      }
    ]
  },
  {
    "id": "REV_LUNGE",
    "n": "Reverse Lunge",
    "p": "Lunge",
    "scheme": "strength",
    "eq": [
      "bodyweight"
    ],
    "m": "Glute Max / Quads",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2025/01/reverse-lunge.gif?resize=700%2C700&ssl=1",
    "notes": "Alternating.",
    "muscles": [
      {
        "id": "glute-max",
        "w": 3
      },
      {
        "id": "quads",
        "w": 2
      },
      {
        "id": "hamstrings",
        "w": 1
      }
    ]
  },
  {
    "id": "ROT_SPLIT_SQUAT",
    "n": "Rotational Split Squat (Hip-Driven)",
    "p": "Lunge",
    "scheme": "strength",
    "eq": [
      "bodyweight"
    ],
    "m": "Glute Max / Quads",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2025/01/reverse-lunge.gif?resize=700%2C700&ssl=1",
    "notes": "Long stance; rotate slightly toward front leg, push through front glute, control hip rotation.",
    "muscles": [
      {
        "id": "glute-max",
        "w": 3
      },
      {
        "id": "quads",
        "w": 2
      },
      {
        "id": "obliques",
        "w": 1
      }
    ]
  },
  {
    "id": "ROW_MACHINE",
    "n": "Seated Row Machine",
    "p": "Pull Horizontal",
    "scheme": "strength",
    "eq": [
      "machine"
    ],
    "m": "Upper Back / Biceps",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Row-Machine.gif",
    "notes": "",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "rhomboids",
        "w": 2
      },
      {
        "id": "biceps",
        "w": 1
      }
    ]
  },
  {
    "id": "SCAP_PULL",
    "n": "Scapular Pull-Ups (Shrug Only)",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Lower Traps / Lats",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2024/10/scap-pull-ups.gif?resize=600%2C600&ssl=1",
    "notes": "Scapular pull-ups only; no elbow bend, smooth shrug-down.",
    "muscles": [
      {
        "id": "lower-traps",
        "w": 2
      },
      {
        "id": "lats",
        "w": 1
      }
    ]
  },
  {
    "id": "SEATED_CABLE_ROW",
    "n": "Seated Cable Row",
    "p": "Pull Horizontal",
    "scheme": "strength",
    "eq": [
      "cable"
    ],
    "m": "Upper Back / Biceps",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/06/Seated-Cable-Rope-Row.gif",
    "notes": "",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "rhomboids",
        "w": 2
      },
      {
        "id": "biceps",
        "w": 1
      }
    ]
  },
  {
    "id": "SERRATUS_PUSHUP",
    "n": "Serratus Push-Up (Quadruped/Wall)",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Serratus / Chest",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/06/Push-Up-Plus.gif",
    "notes": "Quadruped or wall version; elbows locked, push floor away.",
    "muscles": [
      {
        "id": "serratus",
        "w": 2
      },
      {
        "id": "chest",
        "w": 1
      }
    ]
  },
  {
    "id": "SHOULDER_PRESS_MACHINE",
    "n": "Shoulder Press Machine",
    "p": "Push Vertical",
    "scheme": "strength",
    "eq": [
      "machine"
    ],
    "m": "Front Delts / Triceps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/machine-shoulder-press.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "front-delts",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "upper-traps",
        "w": 1
      }
    ]
  },
  {
    "id": "SIDE_ER",
    "n": "Side-Lying External Rotation",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Rotator Cuff / Rear Delts",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/12/Dumbbell-lying-external-shoulder-rotation.gif?resize=600%2C600&ssl=1",
    "notes": "Side-lying cuff work; slow tempo, no cheating from torso.",
    "muscles": [
      {
        "id": "rotator-cuff",
        "w": 3
      },
      {
        "id": "rear-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "SL_RDL_DB",
    "n": "Single-Leg Romanian Deadlift",
    "p": "Hinge",
    "scheme": "strength",
    "eq": [
      "dumbbell"
    ],
    "m": "Hamstrings / Glute Max",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2023/01/Single-leg-romanian-deadlift.gif?resize=600%2C600&ssl=1",
    "notes": "Opposite-hand DB; hips square, hinge to hamstring stretch, balance-focused.",
    "muscles": [
      {
        "id": "hamstrings",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "glute-med",
        "w": 1
      }
    ]
  },
  {
    "id": "SMITH_SQUAT",
    "n": "Smith Machine Squat",
    "p": "Squat",
    "scheme": "strength",
    "eq": [
      "machine"
    ],
    "m": "Quads / Glute Max",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/04/smith-machine-squat.gif?resize=600%2C600&ssl=1",
    "notes": "",
    "muscles": [
      {
        "id": "quads",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "adductors",
        "w": 1
      }
    ]
  },
  {
    "id": "SPIDERMAN_LUNGE_ROT",
    "n": "Spiderman Lunge with Rotation",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Hip Flexors / Obliques",
    "region": "upper",
    "gif": "",
    "notes": "~4 reps per side (can do elevated hands).",
    "muscles": [
      {
        "id": "hip-flexors",
        "w": 2
      },
      {
        "id": "obliques",
        "w": 1
      }
    ]
  },
  {
    "id": "SPLIT_SQUAT",
    "n": "Knee-Over-Toe Split Squat (Left-first)",
    "p": "Lunge",
    "scheme": "strength",
    "eq": [
      "bodyweight"
    ],
    "m": "Quads / Glute Max",
    "region": "lower",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2022/12/ATG-Split-Squat.gif",
    "notes": "Left side priority; controlled knee over toes, upright torso, full front-leg bend.",
    "muscles": [
      {
        "id": "quads",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "adductors",
        "w": 1
      }
    ]
  },
  {
    "id": "SUITCASE_CARRY",
    "n": "Suitcase Carry (Single-Side)",
    "p": "Core / Carry",
    "scheme": "hypertrophy",
    "eq": [
      "bodyweight"
    ],
    "m": "Quadratus Lumborum / Forearms",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2025/10/suitcase-carry.gif?resize=600%2C600&ssl=1",
    "notes": "Heavy DB one side; walk tall, no leaning, strong anti-lateral-flexion.",
    "muscles": [
      {
        "id": "quadratus-lumborum",
        "w": 3
      },
      {
        "id": "obliques",
        "w": 2
      },
      {
        "id": "forearms",
        "w": 1
      }
    ]
  },
  {
    "id": "TB_DEADLIFT",
    "n": "Trap Bar Deadlift",
    "p": "Hinge",
    "scheme": "main",
    "eq": [
      "trapbar"
    ],
    "m": "Hamstrings / Glute Max",
    "region": "lower",
    "gif": "https://drive.google.com/file/d/1Mu2iz695B6BP6Lppw9ghobB7XXYeDd8R/view?usp=sharing",
    "notes": "3-set ramp. Brace evenly.",
    "muscles": [
      {
        "id": "hamstrings",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "quads",
        "w": 1
      }
    ]
  },
  {
    "id": "THREAD_NEEDLE",
    "n": "Thread the Needle",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Upper Back / Obliques",
    "region": "upper",
    "gif": "",
    "notes": "~6-8 reps per side (slow + relaxed breathing).",
    "muscles": [
      {
        "id": "upper-back",
        "w": 2
      },
      {
        "id": "obliques",
        "w": 1
      }
    ]
  },
  {
    "id": "TIB_RAISE",
    "n": "Tibialis Raise (Wall)",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "bodyweight"
    ],
    "m": "Tibialis Anterior / Calves",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2025/06/tibialis-raises-ezgif.com-optimize.gif?resize=700%2C700&ssl=1",
    "notes": "Back to wall; lift toes toward shins, heel planted, controlled reps.",
    "muscles": [
      {
        "id": "tibialis-anterior",
        "w": 3
      },
      {
        "id": "calves",
        "w": 1
      }
    ]
  },
  {
    "id": "TRI_EXT",
    "n": "Triceps Extension (or Close-grip Push-up)",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "dumbbell",
      "bodyweight"
    ],
    "m": "Triceps / Chest",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2023/02/Bodyweight-triceps-extension.gif?resize=600%2C600&ssl=1",
    "notes": "Keep elbows happy.",
    "muscles": [
      {
        "id": "triceps",
        "w": 3
      },
      {
        "id": "chest",
        "w": 1
      }
    ]
  },
  {
    "id": "TRICEPS_PUSHDOWN",
    "n": "Single-Arm Triceps Pushdown (Cable)",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "cable"
    ],
    "m": "Triceps / Forearms",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2022/11/One-arm-triceps-pushdown.gif",
    "notes": "",
    "muscles": [
      {
        "id": "triceps",
        "w": 3
      },
      {
        "id": "forearms",
        "w": 1
      }
    ]
  },
  {
    "id": "TRICEPS_ROPEDOWN",
    "n": "Triceps Rope Pushdown (Cable)",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "cable"
    ],
    "m": "Triceps / Forearms",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/06/Rope-Pushdown.gif",
    "notes": "",
    "muscles": [
      {
        "id": "triceps",
        "w": 3
      },
      {
        "id": "forearms",
        "w": 1
      }
    ]
  },
  {
    "id": "TSPINE_EXT",
    "n": "Thoracic Extension (bench/roller)",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Upper Back / Spinal Erectors",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2022/02/Roll-Upper-Back.gif",
    "notes": "Slow reps.",
    "muscles": [
      {
        "id": "upper-back",
        "w": 2
      },
      {
        "id": "spinal-erectors",
        "w": 1
      }
    ]
  },
  {
    "id": "W_PULLUP",
    "n": "Weighted Pull-Up",
    "p": "Pull Vertical",
    "scheme": "main",
    "eq": [
      "bodyweight"
    ],
    "m": "Lats / Biceps",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/04/Weighted-Pull-up.gif",
    "notes": "TM here is added weight 1RM estimate.",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "biceps",
        "w": 2
      },
      {
        "id": "teres-major",
        "w": 1
      }
    ]
  },
  {
    "id": "WALL_SLIDE_PLUS",
    "n": "Wall Slide with Serratus Plus",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Serratus / Lower Traps",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2022/02/Serratus-Wall-Slide-With-Foam-Roller.gif",
    "notes": "Wall slides; focus on gentle protraction at top, no shrug.",
    "muscles": [
      {
        "id": "serratus",
        "w": 2
      },
      {
        "id": "lower-traps",
        "w": 1
      }
    ]
  },
  {
    "id": "WALL_WY",
    "n": "Wall W-to-Y",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Lower Traps / Rear Delts",
    "region": "upper",
    "gif": "",
    "notes": "W-to-Y on wall; keep back and arms in contact, avoid neck tension.",
    "muscles": [
      {
        "id": "lower-traps",
        "w": 2
      },
      {
        "id": "rear-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "Z_PRESS_1ARM",
    "n": "Single-Arm Z Press (KB/DB)",
    "p": "Push Vertical",
    "scheme": "strength",
    "eq": [
      "kettlebell",
      "dumbbell"
    ],
    "m": "Front Delts / Triceps",
    "region": "upper",
    "gif": "",
    "notes": "",
    "muscles": [
      {
        "id": "front-delts",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "obliques",
        "w": 1
      }
    ]
  },
  {
    "id": "ZERCHER_SQUAT",
    "n": "Zercher Squat",
    "p": "Squat",
    "scheme": "main",
    "eq": [
      "barbell"
    ],
    "m": "Quads / Glute Max",
    "region": "lower",
    "gif": "https://drive.google.com/file/d/1nMV0WimJr8hvfB09HNxPRkWWQtqmIbOK/view?usp=sharing",
    "notes": "Brace core.",
    "muscles": [
      {
        "id": "quads",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "spinal-erectors",
        "w": 1
      }
    ]
  },
  {
    "id": "LUNGE_CARRIES",
    "n": "Lunge Carries",
    "p": "Lunge",
    "scheme": "main",
    "eq": [
      "dumbbell",
      "kettlebell"
    ],
    "m": "Glutes / Forearms",
    "region": "lower",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2023/09/dumbbell-lunges.gif",
    "notes": "Loaded walking lunges, weight carried at sides or racked.",
    "muscles": [
      {
        "id": "glute-max",
        "w": 3
      },
      {
        "id": "quads",
        "w": 2
      },
      {
        "id": "forearms",
        "w": 1
      }
    ]
  },
  {
    "id": "STRAIGHT_ARM_LAT_PULLDOWN_WIDE",
    "n": "Straight-Arm Lat Pulldown (Wide Grip)",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "cable"
    ],
    "m": "Teres Major / Lats",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/05/Cable-Straight-Arm-Pulldown.gif",
    "notes": "Wide grip, straight arms, drive elbows down and back to bias teres major over lats.",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "teres-major",
        "w": 2
      },
      {
        "id": "triceps",
        "w": 1
      }
    ]
  },
  {
    "id": "TERES_MAJOR_ROW",
    "n": "Teres Major Row (Wide-Grip, Elbow-Out Row)",
    "p": "Pull Horizontal",
    "scheme": "hypertrophy",
    "eq": [
      "cable",
      "dumbbell"
    ],
    "m": "Teres Major / Upper Back",
    "region": "upper",
    "gif": "",
    "notes": "Wide grip, elbows flared ~45\u00b0, pull to lower ribs to emphasize teres major over lats/rhomboids.",
    "muscles": [
      {
        "id": "teres-major",
        "w": 3
      },
      {
        "id": "upper-back",
        "w": 2
      },
      {
        "id": "rear-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "NECK_EXTENSION",
    "n": "Neck Extension (Manual/Plate-Resisted)",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "bodyweight"
    ],
    "m": "Neck",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2022/02/Lying-Weighted-Neck-Extension.gif",
    "notes": "Lying face-down, head extends back against resistance from own hand or a light plate at back of head.",
    "muscles": [
      {
        "id": "neck",
        "w": 3
      }
    ]
  },
  {
    "id": "NECK_LATERAL_FLEXION",
    "n": "Neck Lateral Flexion (Manual-Resisted)",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "bodyweight"
    ],
    "m": "Neck",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2022/02/Lying-Weighted-Neck-Flexion.gif",
    "notes": "Seated or standing, side-bend head against resistance from own hand. Work both sides evenly.",
    "muscles": [
      {
        "id": "neck",
        "w": 3
      }
    ]
  },
  {
    "id": "NORDIC_CURL",
    "n": "Nordic Curl",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "bodyweight"
    ],
    "m": "Hamstrings",
    "region": "lower",
    "gif": "",
    "notes": "Anchor ankles, lower torso under control as far as possible, push back up. Regress with hand assist if needed.",
    "muscles": [
      {
        "id": "hamstrings",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 1
      }
    ]
  },
  {
    "id": "SEATED_CALF_RAISE_MACHINE",
    "n": "Seated Calf Raise Machine",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "machine"
    ],
    "m": "Calves",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/03/calf-raise-seated.gif?resize=600%2C600&ssl=1",
    "notes": "Bent-knee position biases soleus over gastrocnemius.",
    "muscles": [
      {
        "id": "calves",
        "w": 3
      }
    ]
  },
  {
    "id": "LOW_TO_HIGH_CABLE_FLY",
    "n": "Low-to-High Cable Fly",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "cable"
    ],
    "m": "Chest / Front Delts",
    "region": "upper",
    "gif": "",
    "notes": "Cables set low, pull up and across to bias upper chest and front delt.",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "front-delts",
        "w": 2
      }
    ]
  },
  {
    "id": "COPENHAGEN_PLANK",
    "n": "Copenhagen Plank",
    "p": "Core / Carry",
    "scheme": "hypertrophy",
    "eq": [
      "bodyweight"
    ],
    "m": "Adductors / Obliques",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2025/06/copenhagen-plank.gif?resize=700%2C700&ssl=1",
    "notes": "Top leg on bench, bottom leg free, hold side-plank position. Regress with bent bottom knee if needed.",
    "muscles": [
      {
        "id": "adductors",
        "w": 3
      },
      {
        "id": "obliques",
        "w": 2
      },
      {
        "id": "quadratus-lumborum",
        "w": 1
      }
    ]
  },
  {
    "id": "CABLE_FRONT_RAISE",
    "n": "Cable Front Raise",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "cable"
    ],
    "m": "Front Delts",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2025/04/cable-front-raise.gif?resize=700%2C700&ssl=1",
    "notes": "Constant tension version of front raise; can also sub plate or dumbbell.",
    "muscles": [
      {
        "id": "front-delts",
        "w": 3
      },
      {
        "id": "upper-traps",
        "w": 1
      }
    ]
  },
  {
    "id": "WRIST_CURL",
    "n": "Wrist Curl (Barbell/DB)",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "barbell",
      "dumbbell"
    ],
    "m": "Forearms",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2021/01/Dumbbell-Wrist-Curl.gif?resize=600%2C600&ssl=1",
    "notes": "Forearms on bench or thighs, curl bar/DB up using wrist flexion only.",
    "muscles": [
      {
        "id": "forearms",
        "w": 3
      }
    ]
  },
  {
    "id": "REVERSE_WRIST_CURL",
    "n": "Reverse Wrist Curl (Barbell/DB)",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "barbell",
      "dumbbell"
    ],
    "m": "Forearms",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Reverse-Wrist-Curl.gif",
    "notes": "Overhand grip, forearms supported, extend wrist upward against resistance.",
    "muscles": [
      {
        "id": "forearms",
        "w": 3
      }
    ]
  },
  {
    "id": "SINGLE_LEG_LEG_CURL_MACHINE",
    "n": "Single-Leg Leg Curl (Machine)",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "machine"
    ],
    "m": "Hamstrings",
    "region": "lower",
    "gif": "",
    "notes": "Unilateral version of lying/seated leg curl \u2014 helps address side-to-side imbalance.",
    "muscles": [
      {
        "id": "hamstrings",
        "w": 3
      },
      {
        "id": "calves",
        "w": 1
      }
    ]
  },
  {
    "id": "SEATED_BARBELL_BACK_SQUAT",
    "n": "Seated Barbell Back Squat (Box/Bench)",
    "p": "Squat",
    "scheme": "strength",
    "eq": [
      "barbell"
    ],
    "m": "Quads / Glute Max",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/10/Box-Squat.gif?resize=600%2C600&ssl=1",
    "notes": "Squat down to a full seated pause on a box or bench, then drive up without bouncing \u2014 removes stretch-reflex, emphasizes concentric strength out of the bottom.",
    "muscles": [
      {
        "id": "quads",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "adductors",
        "w": 1
      }
    ]
  },
  {
    "id": "MACHINE_LATERAL_RAISE",
    "n": "Lateral Raise Machine",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "machine"
    ],
    "m": "Side Delts",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2020/04/lateral-raise-machine.gif?resize=600%2C600&ssl=1",
    "notes": "Fixed path keeps tension on side delt without needing to control momentum \u2014 good option for drop sets.",
    "muscles": [
      {
        "id": "side-delts",
        "w": 3
      },
      {
        "id": "upper-traps",
        "w": 1
      }
    ]
  },
  {
    "id": "STANDARD_CRUNCH",
    "n": "Crunch",
    "p": "Core / Carry",
    "scheme": "hypertrophy",
    "eq": [
      "bodyweight"
    ],
    "m": "Abs",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2023/01/Crunch.gif?resize=600%2C600&ssl=1",
    "notes": "Lying face-up, knees bent, curl shoulder blades off the floor using abs only \u2014 short range of motion, avoid pulling on neck.",
    "muscles": [
      {
        "id": "abs",
        "w": 3
      },
      {
        "id": "obliques",
        "w": 1
      }
    ]
  },
  {
    "id": "WEIGHTED_HIP_FLEXION_FOOT",
    "n": "Weighted Hip Flexion (Foot-Loaded)",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "kettlebell",
      "dumbbell"
    ],
    "m": "Hip Flexors",
    "region": "lower",
    "gif": "",
    "notes": "Hook KB/DB handle over foot or ankle, standing or seated, drive knee up against the resistance. Control the descent.",
    "muscles": [
      {
        "id": "hip-flexors",
        "w": 3
      }
    ]
  },
  {
    "id": "L_SIT",
    "n": "L-Sit Hold",
    "p": "Core / Carry",
    "scheme": "hypertrophy",
    "eq": [
      "bodyweight"
    ],
    "m": "Hip Flexors / Abs",
    "region": "upper",
    "gif": "",
    "notes": "Support on hands/parallettes or floor, legs extended straight out in front, hold. Bend knees to regress if needed.",
    "muscles": [
      {
        "id": "hip-flexors",
        "w": 3
      },
      {
        "id": "abs",
        "w": 2
      }
    ]
  },
  {
    "id": "LU_RAISE",
    "n": "Lu Raise",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "dumbbell"
    ],
    "m": "Front Delts / Side Delts",
    "region": "upper",
    "gif": "https://drive.google.com/file/d/1eozJ55Hhkibz-TJpvHgxxFMhWaVAvcrx/view?usp=sharing",
    "notes": "Sweep DBs from front to side with a slight internal rotation at the top; combines front and lateral raise into one continuous rep.",
    "muscles": [
      {
        "id": "side-delts",
        "w": 3
      },
      {
        "id": "front-delts",
        "w": 2
      },
      {
        "id": "upper-back",
        "w": 1
      }
    ]
  },
  {
    "id": "MACHINE_RESISTED_HIP_FLEXION",
    "n": "Machine-Resisted Hip Flexion (Repositioned Leg Curl/Extension)",
    "p": "Isolation",
    "scheme": "hypertrophy",
    "eq": [
      "machine"
    ],
    "m": "Hip Flexors / Quads",
    "region": "lower",
    "gif": "https://drive.google.com/file/d/1ioo3RmQ_pLidyOW9BVWyADEY2GZrBuDC/view?usp=sharing",
    "notes": "Reposition on a leg curl or leg extension machine so the pad rests against the thigh, then drive the knee upward into it (hip flexion) instead of the machine's normal knee flexion/extension path.",
    "muscles": [
      {
        "id": "hip-flexors",
        "w": 3
      },
      {
        "id": "quads",
        "w": 1
      }
    ]
  },
  {
    "id": "HSPU_R1",
    "n": "Pike Push-Up (Feet on Floor)",
    "p": "Push Vertical",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Front Delts / Chest",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/06/Pike-Push-up.gif",
    "notes": "Rung 1 of Handstand Progression.",
    "muscles": [
      {
        "id": "front-delts",
        "w": 3
      },
      {
        "id": "chest",
        "w": 2
      },
      {
        "id": "triceps",
        "w": 1
      }
    ]
  },
  {
    "id": "HSPU_R2",
    "n": "Pike Push-Up (Feet Elevated)",
    "p": "Push Vertical",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Front Delts / Triceps",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/06/Bench-Pike-Push-up.gif",
    "notes": "Rung 2 of Handstand Progression.",
    "muscles": [
      {
        "id": "front-delts",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "chest",
        "w": 1
      }
    ]
  },
  {
    "id": "HSPU_R3",
    "n": "Wall Handstand Push-Up \u2014 Front to Wall",
    "p": "Push Vertical",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Front Delts / Triceps",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2023/07/wall-supported-handstand-push-up.gif",
    "notes": "Rung 3 of Handstand Progression. Facing the wall.",
    "muscles": [
      {
        "id": "front-delts",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "upper-traps",
        "w": 1
      }
    ]
  },
  {
    "id": "HSPU_R4",
    "n": "Wall Handstand Push-Up \u2014 Back to Wall",
    "p": "Push Vertical",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Front Delts / Triceps",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2023/07/wall-supported-handstand-push-up.gif",
    "notes": "Rung 4 of Handstand Progression. Back to the wall \u2014 deeper, more advanced ROM.",
    "muscles": [
      {
        "id": "front-delts",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "upper-traps",
        "w": 1
      }
    ]
  },
  {
    "id": "HSPU_R5",
    "n": "Wall HSPU \u2014 Deficit",
    "p": "Push Vertical",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Front Delts / Triceps",
    "region": "upper",
    "gif": "https://media1.giphy.com/media/v1.Y2lkPTZjMDliOTUydGM3NHY1YjBreGF4MTZpZmVoMnpiMXV4eTFjejEwcWdnaWc3dnNpbiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xThta8ZR0THqoBOOTC/giphy.gif",
    "notes": "Rung 5 of Handstand Progression.",
    "muscles": [
      {
        "id": "front-delts",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "upper-traps",
        "w": 1
      }
    ]
  },
  {
    "id": "HSPU_R6",
    "n": "Freestanding HSPU",
    "p": "Push Vertical",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Front Delts / Triceps",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/06/handstand-push-up.gif",
    "notes": "Rung 6 of Handstand Progression. No wall support \u2014 real balance/core demand.",
    "muscles": [
      {
        "id": "front-delts",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "abs",
        "w": 1
      }
    ]
  },
  {
    "id": "HSPU_R7",
    "n": "Weighted Wall HSPU",
    "p": "Push Vertical",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Front Delts / Triceps",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/06/handstand-push-up.gif",
    "notes": "Rung 7 of Handstand Progression.",
    "muscles": [
      {
        "id": "front-delts",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "upper-traps",
        "w": 1
      }
    ]
  },
  {
    "id": "PULLUP_R1",
    "n": "Scapular Pulls (Active Hang)",
    "p": "Pull Vertical",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Lower Traps / Lats",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2024/10/scap-pull-ups.gif?fit=600%2C600&ssl=1",
    "notes": "Rung 1 of Pull-up Progression.",
    "muscles": [
      {
        "id": "lower-traps",
        "w": 3
      },
      {
        "id": "lats",
        "w": 2
      },
      {
        "id": "forearms",
        "w": 1
      }
    ]
  },
  {
    "id": "PULLUP_R2",
    "n": "Arch Hang, Supported",
    "p": "Pull Vertical",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Forearms / Lats",
    "region": "upper",
    "gif": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPRNNryimUzCFFJ0q77Vp-qnqIMYRfD9Evuh2Cdw3rBTEQKcqCwNPmRDw&s=10",
    "notes": "Rung 2 of Pull-up Progression. Feet lightly touching floor/box.",
    "muscles": [
      {
        "id": "forearms",
        "w": 3
      },
      {
        "id": "lats",
        "w": 2
      },
      {
        "id": "lower-traps",
        "w": 1
      }
    ]
  },
  {
    "id": "PULLUP_R3",
    "n": "Arch Hang, Free",
    "p": "Pull Vertical",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Forearms / Lats",
    "region": "upper",
    "gif": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPRNNryimUzCFFJ0q77Vp-qnqIMYRfD9Evuh2Cdw3rBTEQKcqCwNPmRDw&s=10",
    "notes": "Rung 3 of Pull-up Progression. Working toward 90\u00b0 shoulder position.",
    "muscles": [
      {
        "id": "forearms",
        "w": 3
      },
      {
        "id": "lats",
        "w": 2
      },
      {
        "id": "lower-traps",
        "w": 1
      }
    ]
  },
  {
    "id": "PULLUP_R4",
    "n": "Jackknife Pull-Up",
    "p": "Pull Vertical",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Lats / Biceps",
    "region": "upper",
    "gif": "https://cdn.sanity.io/images/x29g0y1m/production/93ee798e7a5fa98deb226f47e209c88d5923aead-2160x2160.webp",
    "notes": "Rung 4 of Pull-up Progression. Feet on bench, low bar/rings, reduce leg assist over time.",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "biceps",
        "w": 2
      },
      {
        "id": "rhomboids",
        "w": 1
      }
    ]
  },
  {
    "id": "PULLUP_R5",
    "n": "Pull-Up Negatives",
    "p": "Pull Vertical",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Lats / Biceps",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2025/05/eccentric-pull-up-female.gif",
    "notes": "Rung 5 of Pull-up Progression. Jump to top, lower as slowly as possible.",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "biceps",
        "w": 2
      },
      {
        "id": "teres-major",
        "w": 1
      }
    ]
  },
  {
    "id": "PULLUP_R6",
    "n": "Bodyweight Pull-Up",
    "p": "Pull Vertical",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Lats / Biceps",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-up.gif",
    "notes": "Rung 6 of Pull-up Progression.",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "biceps",
        "w": 2
      },
      {
        "id": "teres-major",
        "w": 1
      }
    ]
  },
  {
    "id": "ROW_R1",
    "n": "Ring Row, Steep/Upright",
    "p": "Pull Horizontal",
    "scheme": "circuit",
    "eq": [
      "rings"
    ],
    "m": "Lats / Rhomboids",
    "region": "upper",
    "gif": "https://i.makeagif.com/media/9-23-2016/oCNSiL.gif",
    "notes": "Rung 1 of Row Progression.",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "rhomboids",
        "w": 2
      },
      {
        "id": "biceps",
        "w": 1
      }
    ]
  },
  {
    "id": "ROW_R2",
    "n": "Ring Row, 45\u00b0 Body Angle",
    "p": "Pull Horizontal",
    "scheme": "circuit",
    "eq": [
      "rings"
    ],
    "m": "Lats / Rhomboids",
    "region": "upper",
    "gif": "https://i.makeagif.com/media/9-23-2016/oCNSiL.gif",
    "notes": "Rung 2 of Row Progression.",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "rhomboids",
        "w": 2
      },
      {
        "id": "biceps",
        "w": 1
      }
    ]
  },
  {
    "id": "ROW_R3",
    "n": "Ring Row, Near-Horizontal",
    "p": "Pull Horizontal",
    "scheme": "circuit",
    "eq": [
      "rings"
    ],
    "m": "Lats / Rhomboids",
    "region": "upper",
    "gif": "https://i.makeagif.com/media/9-23-2016/oCNSiL.gif",
    "notes": "Rung 3 of Row Progression. Feet on ottoman.",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "rhomboids",
        "w": 2
      },
      {
        "id": "biceps",
        "w": 1
      }
    ]
  },
  {
    "id": "ROW_R5",
    "n": "Weighted Ring Row",
    "p": "Pull Horizontal",
    "scheme": "circuit",
    "eq": [
      "rings"
    ],
    "m": "Lats / Rhomboids",
    "region": "upper",
    "gif": "https://i.ytimg.com/vi/Fr5b0mOvhSY/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCeUEaD7z2yfpKovq5Rm66d4Q91wQ",
    "notes": "Rung 5 of Row Progression.",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "rhomboids",
        "w": 2
      },
      {
        "id": "biceps",
        "w": 1
      }
    ]
  },
  {
    "id": "PUSHUP_R1",
    "n": "Incline Push-Up",
    "p": "Push Horizontal",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Chest / Triceps",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/06/Incline-Push-Up.gif",
    "notes": "Rung 1 of Push-up Progression. Hands on ottoman.",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "front-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "PUSHUP_R2",
    "n": "Knee Push-Up",
    "p": "Push Horizontal",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Chest / Triceps",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2022/01/Kneeling-Push-up.gif",
    "notes": "Rung 2 of Push-up Progression.",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "front-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "PUSHUP_R3",
    "n": "Full Push-Up with Push-Up Plus",
    "p": "Push Horizontal",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Chest / Serratus",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/06/Push-Up-Plus.gif",
    "notes": "Rung 3 of Push-up Progression. Protraction at lockout.",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "serratus",
        "w": 2
      },
      {
        "id": "triceps",
        "w": 1
      }
    ]
  },
  {
    "id": "PUSHUP_R4",
    "n": "Feet-Elevated Push-Up",
    "p": "Push Horizontal",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Chest / Triceps",
    "region": "upper",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2023/01/Push-ups-with-feet-in-rings.gif?fit=600%2C600&ssl=1",
    "notes": "Rung 4 of Push-up Progression.",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "front-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "PUSHUP_R5",
    "n": "Ring Push-Up",
    "p": "Push Horizontal",
    "scheme": "circuit",
    "eq": [
      "rings",
      "bodyweight"
    ],
    "m": "Chest / Triceps",
    "region": "upper",
    "gif": "https://i.makeagif.com/media/7-01-2017/4U4EUW.gif",
    "notes": "Rung 5 of Push-up Progression.",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "serratus",
        "w": 1
      }
    ]
  },
  {
    "id": "PUSHUP_R6",
    "n": "Archer Ring Push-Up",
    "p": "Push Horizontal",
    "scheme": "circuit",
    "eq": [
      "rings"
    ],
    "m": "Chest / Triceps",
    "region": "upper",
    "gif": "https://s3assets.skimble.com/assets/516814/skimble-workout-trainer-exercise-ring-archer-push-ups_279a0283-2_full.jpg",
    "notes": "Rung 6 of Push-up Progression.",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "obliques",
        "w": 1
      }
    ]
  },
  {
    "id": "PUSHUP_R7",
    "n": "Weighted Push-Up",
    "p": "Push Horizontal",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Chest / Triceps",
    "region": "upper",
    "gif": "https://www.hevyapp.com/wp-content/uploads/DSC03828-e1762512414205.jpg",
    "notes": "Rung 7 of Push-up Progression. Plate on back.",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "front-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "PUSHUP_R8",
    "n": "Plyo / Jump Push-Up",
    "p": "Push Horizontal",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Chest / Triceps",
    "region": "upper",
    "gif": "https://i.pinimg.com/originals/96/03/73/960373f13e98b814a2ffa028f3fbeaf6.gif",
    "notes": "Rung 8 of Push-up Progression.",
    "muscles": [
      {
        "id": "chest",
        "w": 3
      },
      {
        "id": "triceps",
        "w": 2
      },
      {
        "id": "front-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "SPLITSQ_R1",
    "n": "BW Split Squat, Hand-Assisted",
    "p": "Lunge",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Quads / Glute Max",
    "region": "lower",
    "gif": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-assisted-bulgarian-split-squat-side.mp4",
    "notes": "Rung 1 of Split Squat Progression.",
    "muscles": [
      {
        "id": "quads",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "adductors",
        "w": 1
      }
    ]
  },
  {
    "id": "SPLITSQ_R2",
    "n": "BW Split Squat",
    "p": "Lunge",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Quads / Glute Max",
    "region": "lower",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2022/12/ATG-Split-Squat.gif",
    "notes": "Rung 2 of Split Squat Progression.",
    "muscles": [
      {
        "id": "quads",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "adductors",
        "w": 1
      }
    ]
  },
  {
    "id": "SPLITSQ_R3",
    "n": "BW Bulgarian Split Squat",
    "p": "Lunge",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Glute Max / Quads",
    "region": "lower",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2023/03/Bulgarian-Jump-Squat.gif",
    "notes": "Rung 3 of Split Squat Progression. Rear foot elevated.",
    "muscles": [
      {
        "id": "glute-max",
        "w": 3
      },
      {
        "id": "quads",
        "w": 2
      },
      {
        "id": "hip-flexors",
        "w": 1
      }
    ]
  },
  {
    "id": "SPLITSQ_R4",
    "n": "Goblet-Loaded Split Squat",
    "p": "Lunge",
    "scheme": "circuit",
    "eq": [
      "dumbbell"
    ],
    "m": "Quads / Glute Max",
    "region": "lower",
    "gif": "https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-goblet-split-squat.jpg",
    "notes": "Rung 4 of Split Squat Progression.",
    "muscles": [
      {
        "id": "quads",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "adductors",
        "w": 1
      }
    ]
  },
  {
    "id": "LATLUNGE_R1",
    "n": "Bodyweight Lateral Lunge",
    "p": "Lunge",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Adductors / Glute Max",
    "region": "lower",
    "gif": "https://cdn.shopify.com/s/files/1/0618/9462/3460/files/52.gif",
    "notes": "Rung 1 of Lateral Lunge Progression.",
    "muscles": [
      {
        "id": "adductors",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "quads",
        "w": 1
      }
    ]
  },
  {
    "id": "LATLUNGE_R4",
    "n": "Goblet-Loaded Lateral Lunge",
    "p": "Lunge",
    "scheme": "circuit",
    "eq": [
      "dumbbell"
    ],
    "m": "Adductors / Glute Max",
    "region": "lower",
    "gif": "https://i.makeagif.com/media/5-31-2015/4PY4Ss.gif",
    "notes": "Rung 4 of Lateral Lunge Progression.",
    "muscles": [
      {
        "id": "adductors",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "quads",
        "w": 1
      }
    ]
  },
  {
    "id": "LATLUNGE_R6",
    "n": "Goblet-Loaded Cossack Squat",
    "p": "Squat",
    "scheme": "circuit",
    "eq": [
      "dumbbell"
    ],
    "m": "Adductors / Glute Max",
    "region": "lower",
    "gif": "https://i.pinimg.com/originals/53/56/28/5356288ab37e3b6296b4141a015be7ed.gif",
    "notes": "Rung 6 of Lateral Lunge Progression.",
    "muscles": [
      {
        "id": "adductors",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "quads",
        "w": 1
      }
    ]
  },
  {
    "id": "HIPTHRUST_R1",
    "n": "Bilateral Glute Bridge",
    "p": "Hinge",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Glute Max / Hamstrings",
    "region": "lower",
    "gif": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQC8bKnZctuW85eo7YzE_-Hh4tHD8JSnhobMhgZdTUZA&s=10",
    "notes": "Rung 1 of Hip Thrust Progression.",
    "muscles": [
      {
        "id": "glute-max",
        "w": 3
      },
      {
        "id": "hamstrings",
        "w": 2
      },
      {
        "id": "adductors",
        "w": 1
      }
    ]
  },
  {
    "id": "HIPTHRUST_R2",
    "n": "Single-Leg Glute Bridge",
    "p": "Hinge",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Glute Max / Glute Med",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2022/09/One-legged-glute-bridge.gif?fit=600%2C600&ssl=1",
    "notes": "Rung 2 of Hip Thrust Progression.",
    "muscles": [
      {
        "id": "glute-max",
        "w": 3
      },
      {
        "id": "glute-med",
        "w": 2
      },
      {
        "id": "hamstrings",
        "w": 1
      }
    ]
  },
  {
    "id": "HIPTHRUST_R3",
    "n": "Single-Leg Hip Thrust, Elevated",
    "p": "Hinge",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Glute Max / Glute Med",
    "region": "lower",
    "gif": "https://media0.giphy.com/media/v1.Y2lkPTZjMDliOTUybjhuN3puYm83MnMxNDJjbnJhY3FmM25rc3B6ZmNkZTg5Z2VzYnlhMSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ehs1cZQCzD3uqgqwX8/giphy.gif",
    "notes": "Rung 3 of Hip Thrust Progression. Shoulders on ottoman.",
    "muscles": [
      {
        "id": "glute-max",
        "w": 3
      },
      {
        "id": "glute-med",
        "w": 2
      },
      {
        "id": "hamstrings",
        "w": 1
      }
    ]
  },
  {
    "id": "HIPTHRUST_R4",
    "n": "Single-Leg Hip Thrust, Elevated + DB",
    "p": "Hinge",
    "scheme": "circuit",
    "eq": [
      "dumbbell"
    ],
    "m": "Glute Max / Glute Med",
    "region": "lower",
    "gif": "https://www.puregym.com/media/0d3jgor4/single-leg-hip-thrust.jpg?quality=80",
    "notes": "Rung 4 of Hip Thrust Progression. DB on hips.",
    "muscles": [
      {
        "id": "glute-max",
        "w": 3
      },
      {
        "id": "glute-med",
        "w": 2
      },
      {
        "id": "hamstrings",
        "w": 1
      }
    ]
  },
  {
    "id": "SLRDL_R2",
    "n": "Single-Leg RDL, Bodyweight",
    "p": "Hinge",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Hamstrings / Glute Max",
    "region": "lower",
    "gif": "https://i.pinimg.com/originals/66/13/50/661350e1094df68cb1cc9211919d2f9b.gif",
    "notes": "Rung 2 of Single-Leg RDL Progression.",
    "muscles": [
      {
        "id": "hamstrings",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "glute-med",
        "w": 1
      }
    ]
  },
  {
    "id": "SLRDL_R4",
    "n": "Single-Leg RDL, Same-Side DB",
    "p": "Hinge",
    "scheme": "circuit",
    "eq": [
      "dumbbell"
    ],
    "m": "Hamstrings / Glute Max",
    "region": "lower",
    "gif": "https://hips.hearstapps.com/hmg-prod/images/workouts/2016/03/singlearmsinglelegstraightlegdeadlift-1457031381.gif?crop=1xw:0.75xh;center,top&resize=1200:*",
    "notes": "Rung 4 of Single-Leg RDL Progression.",
    "muscles": [
      {
        "id": "hamstrings",
        "w": 3
      },
      {
        "id": "glute-max",
        "w": 2
      },
      {
        "id": "obliques",
        "w": 1
      }
    ]
  },
  {
    "id": "CORE_R3",
    "n": "Weighted Crunch",
    "p": "Core / Carry",
    "scheme": "circuit",
    "eq": [
      "bodyweight",
      "dumbbell"
    ],
    "m": "Abs / Obliques",
    "region": "upper",
    "gif": "https://fitnessprogramer.com/wp-content/uploads/2021/05/Weighted-Crunch.gif",
    "notes": "Rung 3 of Core Progression. Light plate.",
    "muscles": [
      {
        "id": "abs",
        "w": 3
      },
      {
        "id": "obliques",
        "w": 1
      }
    ]
  },
  {
    "id": "CALF_RAISE_DB",
    "n": "Standing Calf Raise (Dumbbell-Loaded)",
    "p": "Isolation",
    "scheme": "circuit",
    "eq": [
      "dumbbell"
    ],
    "m": "Calves / Tibialis Anterior",
    "region": "lower",
    "gif": "https://media.musclewiki.com/media/uploads/videos/branded/male-Kettlebells-kettlebell-goblet-calf-raise-side.mp4",
    "notes": "Isolation Slot A (part 1). Hold DB at side.",
    "muscles": [
      {
        "id": "calves",
        "w": 3
      },
      {
        "id": "tibialis-anterior",
        "w": 1
      }
    ]
  },
  {
    "id": "STIFF_LEG_DEADLIFT",
    "n": "Stiff-Legged Deadlift",
    "p": "Hinge",
    "scheme": "circuit",
    "eq": [
      "barbell"
    ],
    "m": "Hamstrings / Spinal Erectors",
    "region": "lower",
    "gif": "https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2022/03/Barbell-Row.gif?resize=600%2C600&ssl=1",
    "notes": "Home Major Lift C. Minimal knee bend, more restrictive ROM than an RDL.",
    "muscles": [
      {
        "id": "hamstrings",
        "w": 3
      },
      {
        "id": "spinal-erectors",
        "w": 2
      },
      {
        "id": "glute-max",
        "w": 1
      }
    ]
  },
  {
    "id": "WORLDS_GREATEST_STRETCH",
    "n": "World's Greatest Stretch",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "bodyweight"
    ],
    "m": "Hip Flexors / Spinal Erectors",
    "region": "upper",
    "gif": "https://drive.google.com/file/d/1S4AKdbdWkUhqbfeXr_il1mOiDMmFGxcY/view?usp=sharing",
    "notes": "Daily superset for Home Major Lift days.",
    "muscles": [
      {
        "id": "hip-flexors",
        "w": 2
      },
      {
        "id": "spinal-erectors",
        "w": 1
      }
    ]
  },
  {
    "id": "TERES_MAJOR_BAND_HOLD",
    "n": "Teres Major Band Hold (Depression Row)",
    "p": "Warm-up / Mobility",
    "scheme": "mobility",
    "eq": [
      "band"
    ],
    "m": "Teres Major / Rear Delts",
    "region": "upper",
    "gif": "https://drive.google.com/file/d/1aQtCwSA4Tkw9ucAnsFesMtUw_G-7kkkJ/view?usp=sharing",
    "notes": "Daily superset for Home Major Lift days.",
    "muscles": [
      {
        "id": "teres-major",
        "w": 3
      },
      {
        "id": "rear-delts",
        "w": 1
      }
    ]
  },
  {
    "id": "ROW_R4_RING",
    "n": "Single-Arm Ring Row",
    "p": "Pull Horizontal",
    "scheme": "circuit",
    "eq": [
      "rings"
    ],
    "m": "Lats / Rhomboids",
    "region": "upper",
    "gif": "https://i.ytimg.com/vi/63_VT-8TxV8/maxresdefault.jpg",
    "notes": "Rung 4 of Row Progression. Unilateral loading adds real anti-rotation demand.",
    "muscles": [
      {
        "id": "lats",
        "w": 3
      },
      {
        "id": "rhomboids",
        "w": 2
      },
      {
        "id": "obliques",
        "w": 1
      }
    ]
  },
  {
    "id": "REVERSE_CRUNCH",
    "n": "Reverse Crunch",
    "p": "Core / Carry",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Abs / Hip Flexors",
    "region": "upper",
    "gif": "https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/REV_CRUNCH.gif",
    "notes": "Rung 1 of Core Progression.",
    "muscles": [
      {
        "id": "abs",
        "w": 3
      },
      {
        "id": "hip-flexors",
        "w": 1
      }
    ]
  },
  {
    "id": "AB_WHEEL_TOES",
    "n": "Ab-Wheel Rollout from Toes (Plank Position)",
    "p": "Core / Carry",
    "scheme": "circuit",
    "eq": [
      "bodyweight"
    ],
    "m": "Abs / Lats",
    "region": "upper",
    "gif": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgooLZQjho3d2VoggNX8nuuRoRKU-_SxMbbb0CtDn95Mm8rXRIaLJ-Ol06YJN22y1RsS9gSyC9Mten9x6No_u2J8X0aAFE0YhuNVaWJ27Vk5RysO57sRaHWdtybnPCyovvI4qXZifr7lSIo/s1600/ab+wheel.jpg",
    "notes": "Rung 5 of Core Progression. Full-plank rollout \u2014 significantly harder than the kneeling version.",
    "muscles": [
      {
        "id": "abs",
        "w": 3
      },
      {
        "id": "obliques",
        "w": 2
      },
      {
        "id": "lats",
        "w": 1
      }
    ]
  }
];
