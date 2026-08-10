// app-muscle-map.js — Muscle Map page: per-muscle volume tallying, SVG coloring, and the
// tap-a-muscle → matching-exercises view. Depends on app-core.js (root, state, EX, EX_BY_ID,
// effectiveScheme) and fetches muscles.svg itself.

  const MUSCLE_LABELS = {
    'rear-delts':'Rear Delts','transverse-abdominal':'Transverse Abdominal','serratus':'Serratus',
    'quadratus-lumborum':'Quadratus Lumborum','side-delts':'Side Delts','upper-back':'Upper Back',
    'hip-flexors':'Hip Flexors','tibialis-anterior':'Tibialis Anterior','adductors':'Adductors',
    'lower-traps':'Lower Traps','hamstrings':'Hamstrings','mid-traps':'Mid Traps','abs':'Abs',
    'calves':'Calves','quads':'Quads','glute-max':'Glute Max','glute-med':'Glute Med','chest':'Chest',
    'neck':'Neck','forearms':'Forearms','biceps':'Biceps','obliques':'Obliques','front-delts':'Front Delts',
    'triceps':'Triceps','spinal-erectors':'Spinal Erectors','upper-traps':'Upper Traps','lats':'Lats',
    'teres-major':'Teres Major','rhomboids':'Rhomboids','rotator-cuff':'Rotator Cuff',
  };
  const LANDMARK_CATEGORIES = {
    chest:            {mev:8,  mav:[12,20], mrv:22},
    back:             {mev:10, mav:[14,22], mrv:25},
    quads:            {mev:8,  mav:[12,18], mrv:20},
    hamstrings:       {mev:6,  mav:[10,16], mrv:20},
    glutes:           {mev:4,  mav:[8,12],  mrv:16},
    sideDelts:        {mev:8,  mav:[16,22], mrv:26},
    frontDelts:       {mev:3,  mav:[6,8],   mrv:12}, // borrowed floor — front delts get heavy incidental overlap from all pressing, low MEV is defensible per common coaching consensus
    rearDelts:        {mev:5,  mav:[12,16], mrv:20}, // borrowed floor — widely flagged by coaches as chronically undertrained despite incidental row/pull volume, floor raised accordingly
    biceps:           {mev:8,  mav:[14,20], mrv:26},
    triceps:          {mev:6,  mav:[10,14], mrv:18},
    calves:           {mev:8,  mav:[12,16], mrv:20},
    abs:              {mev:6,  mav:[16,20], mrv:25}, // borrowed floor — recovers fast, tolerates volume well; closer to RP's actual published ~6-8 MEV than a true zero-data estimate
    traps:            {mev:5,  mav:[12,16], mrv:20}, // borrowed floor — commonly under-trained relative to incidental shrug/pull volume, floor raised accordingly
    smallStabilizers: {mev:3,  mav:[8,12],  mrv:16}, // borrowed floor — most muscles in this bucket (QL, hip flexors, rotator cuff, tibialis, neck) are genuinely low-need; forearms is the one outlier sharing this bucket
  };
  const MUSCLE_TO_LANDMARK_CATEGORY = {
    'chest': 'chest',
    'lats': 'back', 'upper-back': 'back', 'rhomboids': 'back', 'teres-major': 'back', 'spinal-erectors': 'back',
    'quads': 'quads',
    'hamstrings': 'hamstrings',
    'glute-max': 'glutes', 'glute-med': 'glutes',
    'side-delts': 'sideDelts',
    'front-delts': 'frontDelts',
    'rear-delts': 'rearDelts',
    'biceps': 'biceps',
    'triceps': 'triceps',
    'calves': 'calves',
    'abs': 'abs', 'obliques': 'abs', 'transverse-abdominal': 'abs',
    'upper-traps': 'traps', 'mid-traps': 'traps', 'lower-traps': 'traps',
    'forearms': 'smallStabilizers', 'rotator-cuff': 'smallStabilizers', 'tibialis-anterior': 'smallStabilizers',
    'quadratus-lumborum': 'smallStabilizers', 'neck': 'smallStabilizers', 'adductors': 'smallStabilizers',
    'hip-flexors': 'smallStabilizers', 'serratus': 'smallStabilizers',
  };
  function landmarksFor(muscleId) {
    return LANDMARK_CATEGORIES[MUSCLE_TO_LANDMARK_CATEGORY[muscleId]];
  }
  const MUSCLE_TO_SVG = {
    'rear-delts': {id: 'Rear_delts'},
    'transverse-abdominal': {label: 'Transverse abdominal'},
    'serratus': {label: 'Serratus'},
    'quadratus-lumborum': {label: 'Quadratus Lumborum'},
    'side-delts': {label: 'Side Delts'},
    'upper-back': {label: 'Upper Back'},
    'hip-flexors': {label: 'Hip Flexors'},
    'tibialis-anterior': {label: 'Tibialis anterior'},
    'adductors': {label: 'Adductors'},
    'lower-traps': {label: 'Lower Traps'},
    'hamstrings': {label: 'Hamstrings'},
    'mid-traps': {label: 'Mid Traps'},
    'abs': {label: 'Abs'},
    'calves': {label: 'Calves'},
    'quads': {label: 'Quads'},
    'glute-max': {label: 'Glute Max'},
    'glute-med': {label: 'Glute Med'},
    'chest': {label: 'Chest'},
    'neck': {label: 'Neck'},
    'forearms': {label: 'Forearms'},
    'biceps': {label: 'Biceps'},
    'obliques': {label: 'Obliques'},
    'front-delts': {label: 'Front Delts'},
    'triceps': {id: 'Triceps'},
    'spinal-erectors': {id: 'Spinal_erectors'},
    'upper-traps': {label: 'Upper Traps'},
    'lats': {id: 'Lats'},
    'teres-major': {id: 'Teres_Major'},
    'rhomboids': {id: 'Rhomboids'},
    'rotator-cuff': {label: 'Rotator Cuff'},
  };
  function findMuscleEl(root, spec) {
    if (spec.id) return root.querySelector('#' + CSS.escape(spec.id));
    if (spec.label) {
      const candidates = root.querySelectorAll('[inkscape\\:label]');
      for (const el of candidates) { if (el.getAttribute('inkscape:label') === spec.label) return el; }
    }
    return null;
  }
  const COUNT_MOBILITY_IN_TALLY = true; // warm-ups/stretches now count — some muscles (e.g. Serratus) are only ever hit by mobility work
  let musclesSvgLoaded = false;
  let musclesSvgMarkup = null;

  function last7DayWindow() {
    const today = new Date();
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - 6);
    cutoff.setHours(0,0,0,0);
    return cutoff;
  }

  function computeMuscleTally() {
    const cutoff = last7DayWindow();
    const tally = {};
    Object.values(LOGS).flat().forEach(entry => {
      const entryDate = new Date(entry.date + 'T00:00:00');
      if (entryDate < cutoff) return;
      const ex = EX_BY_ID[entry.exId];
      if (!ex || !ex.muscles) return;
      if (effectiveScheme(ex) === 'mobility' && !COUNT_MOBILITY_IN_TALLY) return;
      const countedSets = entry.sets.filter(s => s.target !== 'Warm-up').length || entry.sets.length;
      ex.muscles.forEach(m => {
        tally[m.id] = (tally[m.id] || 0) + (m.w * countedSets);
      });
    });
    return tally;
  }

  // Color zones are calibrated to real hypertrophy-volume research (Schoenfeld et al. 2017 dose-response
  // meta-analysis; RP volume landmarks). A "set" here means a set where that muscle is the PRIMARY mover
  // (weight 3) — secondary/tertiary involvement (weight 2/1) counts as partial credit. Points ÷ 3 ≈ sets-equivalent.
  // Red = optimal (the well-supported 15-20+ zone), not "too much" — this is a deliberate choice: red reads as
  // "goal hit" here rather than "caution."
  function setsEquivalent(points) { return points / 3; }
  function colorForScore(muscleId, n) {
    if (!n) return '#e0b3a0'; // untrained — flesh tone
    const se = setsEquivalent(n);
    const {mev, mav} = landmarksFor(muscleId);
    if (se < mev) return '#f2d43d';       // below minimum effective volume
    if (se < mav[0]) return '#a8d9a0';    // meeting minimum, not yet in the optimal band
    if (se <= mav[1]) return '#3ea86e';   // optimal — the genuine sweet spot, not just "above minimum"
    return '#c8362a';                     // past optimal — diminishing returns through excessive, one zone
  }

  async function renderMuscles() {
    root.innerHTML = `
      <div class="grr-detail">
        <span class="grr-back" id="grr-back">← Back to list</span>
        <div class="grr-detail-name">Muscle Map</div>
        <div class="grr-detail-meta" id="grr-muscle-meta">Loading…</div>
        <div id="grr-muscle-svg-wrap" style="background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:10px;margin-bottom:14px;"></div>
        <div class="grr-legend-row" style="justify-content:flex-start;margin-bottom:6px;">
          <span class="grr-legend-chip" style="background:#e0b3a0;color:#1a1a1a;cursor:default;">Untrained</span>
          <span class="grr-legend-chip" style="background:#f2d43d;color:#1a1a1a;cursor:default;">Below minimum</span>
          <span class="grr-legend-chip" style="background:#a8d9a0;color:#1a1a1a;cursor:default;">Meeting minimum</span>
          <span class="grr-legend-chip" style="background:#3ea86e;color:#fff;cursor:default;">Optimal</span>
          <span class="grr-legend-chip" style="background:#c8362a;color:#fff;cursor:default;">Past optimal</span>
        </div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:14px;">Sets-equivalent per muscle over a rolling 7-day window, compared against that specific muscle's own minimum and optimal volume band (Renaissance Periodization framework, synthesized from Schoenfeld et al.'s dose-response research). Meeting the minimum isn't the same as being in the optimal range — thresholds differ by muscle, so the same number can be a different color on different muscles.</div>
        <div class="grr-section-label" style="padding-left:0;">Tap a muscle to see it, its status, and matching exercises</div>
        <div class="grr-equip-row" id="grr-muscle-row" style="padding:0 0 4px;"></div>
        <div id="grr-muscle-target-results"></div>
      </div>
    `;
    root.querySelector('#grr-back').onclick = () => { state.view = 'list'; render(); };

    const cutoffDate = last7DayWindow();
    const hasAnyLogs = Object.values(LOGS).flat().length > 0;
    root.querySelector('#grr-muscle-meta').textContent = hasAnyLogs
      ? `Rolling window: ${friendlyDate(formatDateLocal(cutoffDate))} → today`
      : 'No sessions logged yet — log a few sets to see this fill in.';

    const tally = computeMuscleTally();

    // one row per muscle: color swatch + name + current sets-equivalent + optimal target range.
    // Sorted lowest-trained first so the muscles worth attention surface at the top. Tappable,
    // same as before, to filter matching exercises below.
    // zone 0=untrained, 1=below minimum, 2=meeting minimum, 3=optimal, 4=past optimal — matches legend order
    function zoneRank(muscleId, n) {
      if (!n) return 0;
      const se = setsEquivalent(n);
      const {mev, mav} = landmarksFor(muscleId);
      if (se < mev) return 1;
      if (se < mav[0]) return 2;
      if (se <= mav[1]) return 3;
      return 4;
    }

    const muscleRow = root.querySelector('#grr-muscle-row');
    Object.keys(MUSCLE_LABELS)
      .sort((a,b) => {
        const za = zoneRank(a, tally[a]||0), zb = zoneRank(b, tally[b]||0);
        if (za !== zb) return za - zb;
        return MUSCLE_LABELS[a].localeCompare(MUSCLE_LABELS[b]);
      })
      .forEach(m => {
        const lm = landmarksFor(m);
        const se = setsEquivalent(tally[m] || 0);
        const color = colorForScore(m, tally[m] || 0);
        const chip = document.createElement('div');
        chip.className = 'grr-chip';
        chip.style.background = color;
        chip.style.color = (tally[m]||0) === 0 ? '#1a1a1a' : '#fff';
        chip.style.border = state.muscleMapTarget === m ? '2px solid var(--chalk)' : 'none';
        chip.textContent = `${MUSCLE_LABELS[m]} \u00b7 ${se.toFixed(1)} (${lm.mav[0]}\u2013${lm.mav[1]})`;
        chip.onclick = () => { state.muscleMapTarget = (state.muscleMapTarget === m) ? null : m; render(); };
        muscleRow.appendChild(chip);
      });

    const resultsWrap = root.querySelector('#grr-muscle-target-results');
    if (state.muscleMapTarget) {
      const tm = state.muscleMapTarget;
      const matches = EX.filter(x => effectiveScheme(x) !== 'circuit' && x.eq.some(e => state.equip.has(e)) && x.muscles.some(m => m.id === tm));
      matches.sort((a,b) => {
        const wa = a.muscles.find(m => m.id === tm).w;
        const wb = b.muscles.find(m => m.id === tm).w;
        return wb - wa;
      });
      resultsWrap.innerHTML = '';
      if (!matches.length) {
        resultsWrap.innerHTML = `<div class="grr-empty">No exercises match with your current equipment selection.</div>`;
      } else {
        const tierLabel = {3:'Primary mover', 2:'Secondary', 1:'Tertiary / stabilizer'};
        let lastW = null;
        matches.forEach(x => {
          const w = x.muscles.find(m => m.id === tm).w;
          if (w !== lastW) {
            const header = document.createElement('div');
            header.className = 'grr-section-label';
            header.style.padding = '10px 0 4px';
            header.textContent = `${MUSCLE_LABELS[tm]} — ${tierLabel[w]}`;
            resultsWrap.appendChild(header);
            lastW = w;
          }
          resultsWrap.appendChild(buildCard(x, {view:'muscles', muscleMapTarget: state.muscleMapTarget}));
        });
      }
    } else {
      resultsWrap.innerHTML = '';
    }

    const wrap = root.querySelector('#grr-muscle-svg-wrap');
    try {
      if (!musclesSvgLoaded) {
        const resp = await fetch('muscles.svg');
        if (!resp.ok) throw new Error('not found');
        musclesSvgMarkup = await resp.text();
        musclesSvgLoaded = true;
      }
      wrap.innerHTML = musclesSvgMarkup;
      const svgEl = wrap.querySelector('svg');
      if (svgEl) {
        svgEl.removeAttribute('width');
        svgEl.removeAttribute('height');
        svgEl.style.width = '100%';
        svgEl.style.height = 'auto';
        svgEl.style.display = 'block';
      }
      let matchedCount = 0;
      Object.entries(MUSCLE_TO_SVG).forEach(([muscleId, spec]) => {
        const el = findMuscleEl(wrap, spec);
        if (el) {
          matchedCount++;
          el.style.fill = colorForScore(muscleId, tally[muscleId] || 0);
          el.style.fillOpacity = '0.8';
        }
      });
      root.querySelector('#grr-muscle-meta').textContent += ` · ${matchedCount}/${Object.keys(MUSCLE_TO_SVG).length} regions matched`;
    } catch (err) {
      wrap.innerHTML = `<div class="grr-empty">Couldn't load muscles.svg — make sure it's uploaded in the same folder as index.html.</div>`;
    }
  }
