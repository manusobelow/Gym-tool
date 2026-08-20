// app-home.js — Home Workout page + Home Workout exercise detail rendering.
// This is the file under constant revision for the home program — kept isolated from the main
// gym list/detail code on purpose. Depends on app-core.js (root, state, EX_BY_ID, effectiveScheme,
// gifBlock, backButtonHtml/wireBackButtons, save*(), totalPlateWeight, smallestPlateJump, etc)
// and on home-workouts.js data (LADDERS, CIRCUIT_PARAMS, MAJOR_LIFT_DAYS, CIRCUIT_DAYS, ISOLATION_FAMILIES,
// CORE_LADDER_KEYS, ladderParamsFor, etc).

  function findMajorLiftDay(exId) {
    for (const k of Object.keys(MAJOR_LIFT_DAYS)) if (MAJOR_LIFT_DAYS[k].lift === exId) return k;
    return null;
  }
  function findLadderForExercise(exId) {
    for (const k of Object.keys(LADDERS)) {
      const idx = LADDERS[k].rungs.indexOf(exId);
      if (idx !== -1) return {key:k, idx};
    }
    return null;
  }
  // True for any exercise that belongs to ANY isolation family, regardless of whether that family
  // is the one currently picked for either circuit day — matches the original semantics (this drives
  // the dual-purpose routing gate in app-gym.js's renderDetail(), gated behind state.homeMode).
  function isIsolationStationExercise(exId) {
    return Object.values(ISOLATION_FAMILIES).some(f => f.exercises.includes(exId));
  }
  // Isolation exercises use weight as their only progression axis (item 9) — ceilingStreak here
  // DOES drive advancement (adds a plate jump once it hits 2).
  let ISOLATION_STATE = {}; // { exId: {weight, lastCeilingWeight, ceilingStreak, type} }
  function saveIsolationState() { try { localStorage.setItem('gym-isolation-state', JSON.stringify(ISOLATION_STATE)); } catch(e){} }
  // Ladder rungs with a loaded/weighted variation get a pure REFERENCE weight note (item 8) — this
  // never affects round success/failure or rung-advancement logic. It only exists to make a plateau
  // (ceiling hit twice at the same weight) impossible to miss, so you know to bump the weight.
  let REF_WEIGHT = {}; // { exId: {weight, lastCeilingWeight, ceilingStreak, type} }
  function saveRefWeight() { try { localStorage.setItem('gym-ref-weight', JSON.stringify(REF_WEIGHT)); } catch(e){} }
  // Shared by both the reference-weight prompt (item 8) and isolation's weight-only progression
  // (item 9): tracks whether the ceiling has now been hit twice in a row at the SAME weight.
  // Resets the streak whenever the weight changes or the ceiling isn't hit — a plateau only counts
  // if it's genuinely the same weight (or same band level) both times. Works for both numeric plate
  // weights and string band-level keys — it only ever compares with ===, never does arithmetic.
  function trackWeightCeilingStreak(store, exId, weight, hitCeiling) {
    const s = store[exId] || {weight: null, lastCeilingWeight: null, ceilingStreak: 0};
    s.weight = weight;
    if (hitCeiling && weight != null) {
      s.ceilingStreak = (s.lastCeilingWeight === weight) ? (s.ceilingStreak||0) + 1 : 1;
      s.lastCeilingWeight = weight;
    } else {
      s.ceilingStreak = 0;
    }
    store[exId] = s;
    return s;
  }
  function currentRungId(ladderKey) {
    const ladder = LADDERS[ladderKey];
    const st = RUNG_STATE[ladderKey] || {rungIndex:0, streak:0};
    return ladder.rungs[Math.min(st.rungIndex, ladder.rungs.length-1)];
  }

  // ---------- WEIGHT TYPE: PLATES (lb) or BAND (Light/Medium/Heavy/X-Heavy) ----------
  // Any card that tracks a weight (Isolation exercises, ladder Reference Weight) can be switched
  // from a numeric lb value to a discrete band-strength level instead — useful since band exercises
  // (BAND_FP, BAND_LATERAL_RAISE, TERES_MAJOR_BAND_HOLD, etc.) don't have a meaningful lb number.
  // Defaults to "band" for exercises whose equipment is a band, "plate" (numeric) otherwise, but is
  // manually switchable either way per exercise via a small chip toggle. The chosen type is stored
  // alongside weight/lastCeilingWeight/ceilingStreak on the same ISOLATION_STATE / REF_WEIGHT entry
  // as a `type` field — when type is "band", `weight` and `lastCeilingWeight` hold a band level key
  // (e.g. "medium") instead of a number. trackWeightCeilingStreak() above needs no changes for this —
  // it only ever compares weight with ===, so it works identically for numbers and band-level strings.
  const BAND_LEVELS = [
    {key:'light',  label:'Light'},
    {key:'medium', label:'Medium'},
    {key:'heavy',  label:'Heavy'},
    {key:'xheavy', label:'X-Heavy'}
  ];
  function bandLabel(key) { const b = BAND_LEVELS.find(b => b.key === key); return b ? b.label : key; }
  function nextBandLevel(key) {
    const idx = BAND_LEVELS.findIndex(b => b.key === key);
    return (idx >= 0 && idx < BAND_LEVELS.length - 1) ? BAND_LEVELS[idx + 1].key : null;
  }
  function defaultWeightType(x) { return x.eq.includes('band') ? 'band' : 'plate'; }
  function formatWeightValue(type, value) {
    if (value == null) return '—';
    return type === 'band' ? (bandLabel(value) + ' band') : (value + ' lb');
  }
  function weightTypeToggleHtml(idPrefix, type) {
    return `
      <div class="grr-equip-row" id="${idPrefix}-type-row" style="padding:0 0 8px;">
        <div class="grr-chip${type==='plate'?' active':''}" data-type="plate">Plates (lb)</div>
        <div class="grr-chip${type==='band'?' active':''}" data-type="band">Band</div>
      </div>`;
  }
  function bandPickerHtml(idPrefix, level) {
    return `
      <div class="grr-equip-row" id="${idPrefix}-band-row" style="padding:0 0 10px;">
        ${BAND_LEVELS.map(b => `<div class="grr-chip${level===b.key?' active':''}" data-band="${b.key}">${b.label}</div>`).join('')}
      </div>`;
  }

  // ---------- HOME PAGE SECTION COLLAPSE ----------
  // Plain in-memory UI state (not persisted — same convention as state.homeMsg) tracking which of
  // the Home page's collapsible sections are expanded. Kept as its own top-level var, driven from
  // the render itself (the .open class is computed from this on every render()) rather than relying
  // on a raw DOM classList.toggle() — the latter would silently re-collapse Major Lift/Circuit on
  // every single tap inside them, since render() rebuilds root.innerHTML from scratch on nearly
  // every interaction in this app (see PROJECT-SCHEMA.md §3 Gotcha #2).
  // NOTE: `major` now covers the MERGED Major Lift + Mobility/Rehab section (§6.4/§6.9) — the two
  // used to be separate collapses (`major`, `mobility`); `mobility` was retired when they merged
  // into one box, since there's no longer a separate section to collapse independently.
  let HOME_COLLAPSE = { plate: false, major: true, circuit: true };
  // Result message for renderHomeDetail's ladder/isolation Save button. Pre-existing bug, fixed
  // alongside the collapse work: the ladder and isolation save handlers used to write the message
  // straight onto the #grr-hd-msg DOM node and then call render() in the same breath — but render()
  // rebuilds the whole detail page from scratch (PROJECT-SCHEMA.md §3 Gotcha #2), so the message was
  // wiped the instant it was set and never actually visible. Routing it through this field (read by
  // the template, same pattern as state.homeMsg) fixes that. HOME_DETAIL_LAST_ID tracks which
  // exercise it belongs to, so navigating to a different exercise's detail page clears any stale
  // leftover message instead of it bleeding into the new exercise's card.
  let HOME_DETAIL_MSG = '';
  let HOME_DETAIL_LAST_ID = null;

  // ---------- STATION SWAP (Core ladder / Isolation family, per circuit day) ----------
  // { "<circuitDay>:<pattern>": ladderKeyOrFamilyKey } — manual, freely changeable at any time.
  // Keyed by day+pattern rather than a station index so it survives CIRCUIT_DAYS reordering.
  let STATION_PICK = {};
  function saveStationPick() { try { localStorage.setItem('gym-station-pick', JSON.stringify(STATION_PICK)); } catch(e){} }
  function stationPickKey(dayKey, pattern) { return dayKey + ':' + pattern; }
  // Only the "Core" pattern's ladder is swappable (among CORE_LADDER_KEYS) — other ladder patterns
  // (Vertical Push, Hinge, etc.) already get variety from having a different ladder per circuit day
  // and aren't part of this ask. Falls back to the station's own default ladder key.
  function resolvedLadderKey(dayKey, station) {
    if (!station.ladder) return null;
    if (station.pattern !== 'Core') return station.ladder;
    const pick = STATION_PICK[stationPickKey(dayKey, station.pattern)];
    return (pick && LADDERS[pick]) ? pick : station.ladder;
  }
  // Every Isolation station is swappable among ISOLATION_FAMILIES. Falls back to the station's own
  // default family key.
  function resolvedIsolationFamily(dayKey, station) {
    if (station.ladder) return null;
    const pick = STATION_PICK[stationPickKey(dayKey, station.pattern)];
    return (pick && ISOLATION_FAMILIES[pick]) ? pick : station.family;
  }

  // ---------- REP RANGE OVERRIDE (Major Lift / ladder / isolation — any card) ----------
  // { "<scope>:<key>": {floor, ceiling} } — scope is "ladder" (key = ladder key, shared by every
  // rung on that ladder), "iso" (key = exercise id, one isolation exercise at a time), or "major"
  // (key = major lift day — though Major Lift stores its own floor/ceiling directly on
  // MAJOR_LIFT_STATE since it already had a mutable repTarget field; see renderMajorLiftLogger).
  // Floor is informational everywhere; ceiling is what advancement logic checks reps against, so
  // editing it genuinely changes when a ladder/isolation exercise advances.
  let REP_RANGE_OVERRIDE = {};
  function saveRepRangeOverride() { try { localStorage.setItem('gym-rep-range-override', JSON.stringify(REP_RANGE_OVERRIDE)); } catch(e){} }
  function getRepRange(scope, key, defFloor, defCeiling) {
    const ov = REP_RANGE_OVERRIDE[scope + ':' + key];
    return {
      floor: (ov && ov.floor != null && !isNaN(ov.floor)) ? ov.floor : defFloor,
      ceiling: (ov && ov.ceiling != null && !isNaN(ov.ceiling)) ? ov.ceiling : defCeiling
    };
  }
  function setRepRange(scope, key, floor, ceiling) {
    REP_RANGE_OVERRIDE[scope + ':' + key] = { floor, ceiling };
    saveRepRangeOverride();
  }

  // ---------- MOBILITY / REHAB TICKS (formerly "Daily Superset" Mark Done) ----------
  // { exId: {date, rounds} } — rounds is 0-3, click cycles 1→2→3→back to 0. Scoped to "today" so
  // reopening the app on a new day shows a fresh 0 instead of yesterday's stale round count (the
  // old binary "done" flag had no such reset and could sit showing done indefinitely). Kept in its
  // own store rather than reusing CIRCUIT_TICKS — CIRCUIT_TICKS is wiped to {} on every "Save
  // Circuit Session" click, which used to also silently wipe today's mobility/rehab marks since
  // they shared the same object.
  let MOBILITY_TICKS = {};
  function saveMobilityTicks() { try { localStorage.setItem('gym-mobility-ticks', JSON.stringify(MOBILITY_TICKS)); } catch(e){} }
  function mobilityRoundsToday(exId) {
    const t = MOBILITY_TICKS[exId];
    return (t && t.date === todayLocal()) ? (t.rounds || 0) : 0;
  }
  // Writes/replaces today's log entry to match the new round count (idempotent per day, same
  // pattern the old binary version used) and removes it entirely when cycling back to 0.
  function setMobilityRounds(exId, ex, rounds) {
    const today = todayLocal();
    MOBILITY_TICKS[exId] = { date: today, rounds };
    saveMobilityTicks();
    if (LOGS[exId]) LOGS[exId] = LOGS[exId].filter(e => !(e.date === today && e.tmAction === 'dailySuperset'));
    if (rounds > 0) {
      const mState = MOBILITY_WEIGHT[exId];
      const weightVal = (mState && mState.weight != null) ? mState.weight : null;
      const sets = [];
      for (let i = 1; i <= rounds; i++) sets.push({target: 'Round '+i, weight: weightVal, reps: null, success: true});
      const entry = {date: today, exercise: ex.n, pattern: ex.p, exId, logId: newLogId(), sets, allSuccess: true, tmAction: 'dailySuperset'};
      if (!LOGS[exId]) LOGS[exId] = [];
      LOGS[exId].push(entry);
    }
    saveLogs();
  }

  // ---------- MOBILITY / REHAB SLOT SWAP (formerly fixed "Daily Superset" exercises) ----------
  // { dayKey: [exId, exId, exId, exId] } — sparse-by-day, full 4-slot array once customized. Falls
  // back to MAJOR_LIFT_DAYS[dayKey].dailySuperset when a day hasn't been touched.
  let DAILY_SUPERSET_OVERRIDE = {};
  function saveDailySupersetOverride() { try { localStorage.setItem('gym-daily-superset-override', JSON.stringify(DAILY_SUPERSET_OVERRIDE)); } catch(e){} }
  function getDailySuperset(dayKey) {
    const ov = DAILY_SUPERSET_OVERRIDE[dayKey];
    return (ov && ov.length === 4) ? ov : MAJOR_LIFT_DAYS[dayKey].dailySuperset;
  }
  function setDailySupersetSlot(dayKey, slotIdx, exId) {
    const current = [...getDailySuperset(dayKey)];
    current[slotIdx] = exId;
    DAILY_SUPERSET_OVERRIDE[dayKey] = current;
    saveDailySupersetOverride();
  }
  // Swap pool for Mobility/Rehab slots: every exercise whose ORIGINAL default scheme (`x.scheme`,
  // straight from exercises.js — NOT `effectiveScheme(x)`, which reflects any in-app override) is
  // `'mobility'`. Deliberately does NOT use `schemeChoicesFor(x).includes('mobility')` — that helper
  // also grants 'mobility' eligibility to any `eq: ["bodyweight"]` exercise (it's meant for deciding
  // which scheme chips to *offer* on an exercise's own card), and equipment tag isn't purpose: things
  // like Weighted Pull-Up, Nordic Curl, L-Sit Hold, and most circuit-ladder rungs are bodyweight too,
  // but they're strength/skill work, not mobility/rehab filler. An earlier version of this filter used
  // `schemeChoicesFor` and pulled ~58 unrelated exercises into the pool as a result.
  // Using the original `x.scheme` (rather than `effectiveScheme`) still means an exercise like World's
  // Greatest Stretch stays in this pool even after its *current* scheme is switched to Hypertrophy on
  // its own card — its default classification, which is what actually determines "is this a mobility
  // exercise," never changes, only its current browsing/routing scheme does.
  function mobilityPoolExercises() {
    return EX.filter(x => x.scheme === 'mobility').sort((a,b) => a.n.localeCompare(b.n));
  }
  // Builds one Mobility/Rehab slot row (name → own exercise page, round-tick button, swap dropdown)
  // as a DOM node. Shared by the merged Major Lift + Mobility/Rehab box (§6.4/§6.10) — used both for
  // the rows interleaved between sets ("during rest") and any leftover slots with no rest window this
  // session. Pulled out of the old standalone Mobility/Rehab block so both places use one
  // implementation instead of two copies of the same swap/round-tick wiring drifting apart.
  function buildMobilitySlotRow(dayKey, slotIdx, opts) {
    const supersetIds = getDailySuperset(dayKey);
    const exId = supersetIds[slotIdx];
    const ex = EX_BY_ID[exId];
    const row = document.createElement('div');
    if (!ex) return row;
    const rounds = mobilityRoundsToday(exId);
    const mobilityPool = mobilityPoolExercises();
    row.style.cssText = 'margin:6px 0 10px;padding:8px 10px;border-radius:6px;background:var(--surface-2);border:1px dashed var(--steel);';
    if (opts && opts.label) {
      const label = document.createElement('div');
      label.style.cssText = 'font-size:10px;color:var(--steel);text-transform:uppercase;letter-spacing:.05em;font-weight:800;margin-bottom:4px;';
      label.textContent = opts.label;
      row.appendChild(label);
    }
    const topRow = document.createElement('div');
    topRow.style.cssText = 'display:flex;align-items:center;gap:8px;';
    const nameSpan = document.createElement('div');
    nameSpan.style.cssText = 'flex:1;cursor:pointer;font-size:13px;font-weight:700;';
    nameSpan.textContent = ex.n;
    nameSpan.onclick = () => { state.cameFrom = {view:'home'}; state.view = 'detail'; state.activeId = exId; state.saveMsg = ''; render(); };
    const roundBtn = document.createElement('button');
    roundBtn.type = 'button';
    roundBtn.textContent = rounds > 0 ? `✓ ${rounds} round${rounds>1?'s':''}` : 'Mark Done';
    roundBtn.style.cssText = `flex-shrink:0;border:none;border-radius:6px;padding:7px 12px;font-size:11.5px;font-weight:800;cursor:pointer;background:${rounds>0 ? 'var(--green)' : 'var(--surface)'};color:${rounds>0 ? '#111' : 'var(--chalk)'};`;
    roundBtn.onclick = () => { setMobilityRounds(exId, ex, (rounds+1) % 4); render(); };
    topRow.appendChild(nameSpan); topRow.appendChild(roundBtn);
    row.appendChild(topRow);
    const swapSelect = document.createElement('select');
    swapSelect.style.cssText = 'margin-top:6px;width:100%;background:var(--bg);border:1px solid var(--line);color:var(--chalk);padding:5px;border-radius:4px;font-size:11px;';
    // Safety: if this slot's currently-assigned exercise had its scheme changed away from
    // "mobility" on its own exercise card, it would otherwise fall out of mobilityPool and
    // vanish from this dropdown entirely (while still being the active assignment for this
    // slot) — always keep it selectable so the dropdown never shows a blank/mismatched slot.
    const poolForThisSlot = mobilityPool.some(px => px.id === exId)
      ? mobilityPool
      : [...mobilityPool, ex].sort((a,b) => a.n.localeCompare(b.n));
    poolForThisSlot.forEach(px => {
      const opt = document.createElement('option');
      opt.value = px.id; opt.textContent = px.n;
      if (px.id === exId) opt.selected = true;
      swapSelect.appendChild(opt);
    });
    swapSelect.onchange = () => { setDailySupersetSlot(dayKey, slotIdx, swapSelect.value); render(); };
    row.appendChild(swapSelect);
    return row;
  }

  // ---------- CIRCUIT FOCUS MODE ----------
  // A distraction-free "one exercise at a time" view of the circuit — requested to cut clutter for
  // people who just want to know what to do right now, instead of scanning all 6 stations at once.
  // Deliberately has NO separate persisted state of its own — the current step is derived live from
  // CIRCUIT_TICKS (the same store the full Home page circuit checklist already writes to), so Focus
  // Mode and the regular checklist stay in sync no matter which one is used, and reloading mid-session
  // resumes at the right step instead of losing your place. Toggling between Focus Mode and the
  // regular checklist is safe at any time for the same reason.
  //
  // Sequencing: round-robin, not "both rounds of station A, then move on" — round 1 of every station
  // (in CIRCUIT_DAYS order), then round 2 of every station. This maximizes rest between the two
  // rounds of the same exercise (5 other stations happen in between before you're back), and
  // CIRCUIT_DAYS's station order already alternates muscle groups/patterns (Vertical Push →
  // Horizontal Pull → Lunge → Hinge → Core → Isolation — antagonist upper patterns adjacent, lower
  // patterns grouped but on different chains, small stuff last) so recovery is spread as evenly as a
  // 6-station, 2-round circuit can manage without a person having to think about exercise order
  // themselves.
  //
  // The Isolation station's two family exercises are treated as ONE step in the sequence — both are
  // shown and ticked together — since in practice they're done as a single station, not two.
  function focusSteps(dayKey) {
    const circuitDay = CIRCUIT_DAYS[dayKey];
    const steps = [];
    for (let round = 0; round < CIRCUIT_PARAMS.ladder.startSets; round++) {
      circuitDay.stations.forEach(station => {
        const isLadder = !!station.ladder;
        const ladderKey = isLadder ? resolvedLadderKey(dayKey, station) : null;
        const famKey = isLadder ? null : resolvedIsolationFamily(dayKey, station);
        const fam = isLadder ? null : ISOLATION_FAMILIES[famKey];
        const exIds = isLadder ? [currentRungId(ladderKey)] : (fam ? fam.exercises : []);
        if (!exIds.length) return;
        const baseP = isLadder ? ladderParamsFor(ladderKey) : CIRCUIT_PARAMS.isolation;
        const rr = isLadder ? getRepRange('ladder', ladderKey, baseP.repFloor, baseP.repCeiling) : getRepRange('iso', exIds[0], baseP.repFloor, baseP.repCeiling);
        steps.push({ round, pattern: station.pattern, exIds, isLadder, ladderKey, repFloor: rr.floor, repCeiling: rr.ceiling });
      });
    }
    return steps;
  }
  function stepIsDone(step) {
    return step.exIds.every(exId => ((CIRCUIT_TICKS[exId] || [])[step.round] || 0) > 0);
  }
  // First not-yet-ticked step, or steps.length if every step across both rounds is already ticked
  // (i.e. the circuit is complete and ready to save).
  function currentFocusStepIndex(dayKey) {
    const steps = focusSteps(dayKey);
    const idx = steps.findIndex(s => !stepIsDone(s));
    return idx === -1 ? steps.length : idx;
  }
  function logCircuitSet(exId, ticks, expectedRounds) {
    const ex = EX_BY_ID[exId];
    const sets = ticks.map((t,i) => ({target: 'Round '+(i+1), weight:null, reps:null, success: t===2}));
    const allSuccess = ticks.length === expectedRounds && ticks.every(t => t===2);
    const entry = {date: todayLocal(), exercise: ex.n, pattern: ex.p, exId, logId: newLogId(), sets, allSuccess, tmAction:'none'};
    if (!LOGS[exId]) LOGS[exId] = [];
    LOGS[exId].push(entry);
    return allSuccess;
  }
  // Shared by the Home page's "Save Circuit Session" button and Focus Mode's completion screen —
  // logs every ticked exercise, advances any rung/isolation weight that hit its ceiling twice in a
  // row, and clears CIRCUIT_TICKS for the next session. Returns the summary message to show.
  function saveCircuitSession() {
    const circuitDay = CIRCUIT_DAYS[HOME.circuitDay];
    let anySaved = false;
    let topOfLadderNotes = [];
    circuitDay.stations.forEach(station => {
      if (!station.ladder) {
        const famKey = resolvedIsolationFamily(HOME.circuitDay, station);
        const fam = ISOLATION_FAMILIES[famKey];
        if (!fam) return;
        fam.exercises.forEach(exId => {
          const ticks = CIRCUIT_TICKS[exId] || [];
          if (ticks.some(t => t > 0) && EX_BY_ID[exId]) { logCircuitSet(exId, ticks, CIRCUIT_PARAMS.isolation.startSets); anySaved = true; }
        });
        return;
      }
      const ladderKey = resolvedLadderKey(HOME.circuitDay, station);
      const exId = currentRungId(ladderKey);
      const ticks = CIRCUIT_TICKS[exId] || [];
      if (!ticks.some(t => t > 0)) return;
      const stationP = ladderParamsFor(ladderKey);
      const allSuccess = logCircuitSet(exId, ticks, stationP.startSets);
      anySaved = true;
      const st = RUNG_STATE[ladderKey] || {rungIndex:0, streak:0};
      const ladder = LADDERS[ladderKey];
      if (allSuccess) {
        st.streak = (st.streak||0) + 1;
        if (st.streak >= 2) {
          if (st.rungIndex < ladder.rungs.length - 1) { st.rungIndex++; st.streak = 0; }
          else { st.streak = 0; topOfLadderNotes.push(`${ladder.label} has hit its ceiling twice at the top rung — no harder variation defined yet. Might be time to add one.`); }
        }
      } else {
        st.streak = 0;
      }
      RUNG_STATE[ladderKey] = st;
    });
    saveRungState();
    saveLogs();
    CIRCUIT_TICKS = {};
    saveCircuitTicks();
    let msg = anySaved
      ? 'Circuit session saved. Any rung that hit its ceiling on every round, twice in a row, has advanced.'
      : 'Nothing ticked yet — tap at least one round before saving.';
    if (topOfLadderNotes.length) msg += ' ' + topOfLadderNotes.join(' ');
    return msg;
  }
  function renderCircuitFocus() {
    const dayKey = HOME.circuitDay;
    const circuitDay = CIRCUIT_DAYS[dayKey];
    const steps = focusSteps(dayKey);
    const idx = currentFocusStepIndex(dayKey);

    if (idx >= steps.length) {
      root.innerHTML = `
        <div class="grr-detail">
          <span class="grr-back" id="grr-back">← Back to Home Workout</span>
          <div class="grr-detail-name">${circuitDay.label} — Circuit Complete</div>
          <div class="grr-detail-meta">All ${steps.length} rounds logged. Save to lock in any advancement.</div>
          <button class="grr-save-btn" id="grr-focus-save">Save Circuit Session</button>
          <div class="grr-save-msg" id="grr-focus-msg">${state.homeMsg||''}</div>
        </div>
      `;
      root.querySelector('#grr-back').onclick = () => { state.view = 'home'; render(); };
      root.querySelector('#grr-focus-save').onclick = () => { state.homeMsg = saveCircuitSession(); state.view = 'home'; render(); };
      return;
    }

    const step = steps[idx];
    const exObjs = step.exIds.map(id => EX_BY_ID[id]).filter(Boolean);
    const namesHtml = exObjs.map(x => x.n).join(' + ');
    const gifHtml = exObjs.length === 1 ? gifBlock(exObjs[0]) : '';

    root.innerHTML = `
      <div class="grr-detail">
        <span class="grr-back" id="grr-back">← Exit Focus Mode</span>
        <div class="grr-detail-meta">Step ${idx+1} of ${steps.length} · ${circuitDay.label}</div>
        <div class="grr-detail-meta">Round ${step.round+1} of ${CIRCUIT_PARAMS.ladder.startSets}</div>
        <div class="grr-detail-name">${step.pattern}</div>
        <div class="grr-detail-meta">${namesHtml}</div>
        ${gifHtml}
        <div style="font-size:12.5px;color:var(--muted);margin:8px 0 16px;">Target ${step.repCeiling} reps, floor ${step.repFloor}.</div>
        <div style="display:flex;gap:10px;">
          <button id="grr-focus-done" style="flex:1;height:56px;border-radius:8px;border:none;background:var(--steel);color:#fff;font-weight:800;font-size:15px;cursor:pointer;">Done</button>
          <button id="grr-focus-max" style="flex:1;height:56px;border-radius:8px;border:none;background:var(--brand);color:#fff;font-weight:800;font-size:15px;cursor:pointer;">Max!</button>
        </div>
      </div>
    `;
    root.querySelector('#grr-back').onclick = () => { state.view = 'home'; render(); };
    function markAndAdvance(val) {
      step.exIds.forEach(exId => {
        const arr = CIRCUIT_TICKS[exId] || [];
        arr[step.round] = val;
        CIRCUIT_TICKS[exId] = arr;
      });
      saveCircuitTicks();
      render();
    }
    root.querySelector('#grr-focus-done').onclick = () => markAndAdvance(1);
    root.querySelector('#grr-focus-max').onclick = () => markAndAdvance(2);
  }

  // ---------- MAJOR LIFT SAVE (shared by the inline merged box and Major Lift Focus Mode) ----------
  // Factored out of what used to be the inline `#grr-save-major` onclick body so both entry points —
  // the regular Home page box and Major Lift Focus Mode's finish screen (§6.10) — run one copy of the
  // stage-advancement/AMRAP/logging logic instead of two copies that could drift apart, mirroring why
  // saveCircuitSession() was factored out for the circuit (§6.9). `reps` is a plain array, one entry
  // per set in order (set 1 first, AMRAP/last set last).
  function saveMajorLiftSets(dayKey, reps) {
    const majorDay = MAJOR_LIFT_DAYS[dayKey];
    const ex = EX_BY_ID[majorDay.lift];
    const P = CIRCUIT_PARAMS.majorLift;
    const mlState = MAJOR_LIFT_STATE[dayKey] || {sets: P.startSets, weight: null, streak: 0, lastAmrap: null, repTarget: P.repCeiling, repFloor: P.repFloor};
    if (!mlState.repTarget) mlState.repTarget = P.repCeiling;
    if (!mlState.repFloor) mlState.repFloor = P.repFloor;
    const ceiling = mlState.repTarget;
    const amrapReps = reps[reps.length-1];
    const allHit = reps.every(r => r >= ceiling);
    let msg;
    if (allHit) {
      mlState.streak = (mlState.streak||0)+1;
      if (mlState.streak >= 2) {
        if (mlState.sets < P.maxSets) {
          mlState.sets += 1; mlState.streak = 0;
          msg = `All sets hit ${ceiling} twice in a row — moving to ${mlState.sets} sets next session.`;
        } else {
          const jump = smallestPlateJump();
          mlState.sets = P.startSets; mlState.streak = 0;
          if (jump > 0) {
            mlState.weight = (mlState.weight||0) + jump;
            mlState.repTarget = P.repCeiling;
            msg = `All ${P.maxSets} sets hit ${ceiling} twice in a row — weight bumped to ${mlState.weight} lb, back to ${mlState.sets} sets.`;
          } else {
            mlState.repTarget = 12;
            msg = `All ${P.maxSets} sets hit ${ceiling} twice in a row, but no plates available to add — rep target raised to 12 instead, back to ${mlState.sets} sets.`;
          }
        }
      } else { msg = `All sets hit ${ceiling} — one more session like this and you'll advance.`; }
    } else {
      mlState.streak = 0;
      msg = amrapReps > (mlState.lastAmrap||0) ? `Didn't hit ${ceiling} on every set, but the AMRAP improved (${amrapReps} vs ${mlState.lastAmrap}).` : 'Saved — not every set hit the ceiling, no stage change.';
    }
    mlState.lastAmrap = amrapReps;
    MAJOR_LIFT_STATE[dayKey] = mlState; saveMajorLiftState();
    const entry = {date: todayLocal(), exercise: ex.n, pattern: ex.p, exId: majorDay.lift, logId: newLogId(),
      sets: reps.map((r,i)=>({target: i===reps.length-1?'AMRAP':'Set '+(i+1), weight: mlState.weight, reps:r, success: r>=ceiling})),
      allSuccess: allHit, tmAction: msg.includes('bumped') ? 'increase' : 'none'};
    if (!LOGS[majorDay.lift]) LOGS[majorDay.lift]=[];
    LOGS[majorDay.lift].push(entry); saveLogs();
    return msg;
  }
  // Standalone Major Lift logger with NO interleaved mobility — used only by renderHomeDetail when
  // viewing the major lift exercise's own page (e.g. tapping "(view exercise →)" from the Home page,
  // or browsing to Zercher Squat directly). The Home page itself uses the merged
  // renderMajorLiftAndMobility() below instead (§6.4/§6.10).
  function renderMajorLiftLogger(container, dayKey, msgElId) {
    const majorDay = MAJOR_LIFT_DAYS[dayKey];
    const P = CIRCUIT_PARAMS.majorLift;
    const mlState = MAJOR_LIFT_STATE[dayKey] || {sets: P.startSets, weight: null, streak: 0, lastAmrap: null, repTarget: P.repCeiling};
    if (!mlState.repTarget) mlState.repTarget = P.repCeiling;
    if (!mlState.repFloor) mlState.repFloor = P.repFloor;
    const ceiling = mlState.repTarget;
    let html = `<div class="grr-tm-box" style="margin-bottom:10px;"><div><label>Weight (lb, total incl. 20lb bar)</label><div style="font-size:11px;color:var(--muted);margin-top:2px;">Stage: ${mlState.sets} sets</div></div><input type="number" id="grr-ml-weight" value="${mlState.weight||''}" placeholder="e.g. 70"/></div>`;
    html += `<div class="grr-tm-box" style="margin-bottom:10px;"><div><label>Rep range</label><div style="font-size:11px;color:var(--muted);margin-top:2px;">Floor is informational; ceiling drives stage advancement.</div></div><div style="display:flex;gap:6px;align-items:center;"><input type="number" id="grr-ml-floor" value="${mlState.repFloor}" style="width:52px;"/><span style="color:var(--muted);font-size:11px;">–</span><input type="number" id="grr-ml-ceiling" value="${ceiling}" style="width:52px;"/></div></div>`;
    for (let i=1;i<=mlState.sets;i++) {
      const isAmrap = i===mlState.sets;
      html += `<div class="grr-set-row"><div class="grr-set-row-top"><span>Set ${i}${isAmrap?' (AMRAP)':''}</span><span>${isAmrap?`beat last: ${mlState.lastAmrap??'—'}`:`target ${ceiling}`}</span></div><div class="grr-set-inputs"><input type="number" class="grr-ml-reps" data-i="${i}" placeholder="reps" style="width:70px;"/><span class="grr-unit">reps</span></div></div>`;
    }
    html += `<button class="grr-save-btn" id="grr-save-major">Save Major Lift</button><div class="grr-save-msg" id="${msgElId}"></div>`;
    container.innerHTML = html;
    container.querySelector('#grr-ml-weight').onchange = (e) => { mlState.weight = parseFloat(e.target.value)||null; MAJOR_LIFT_STATE[dayKey]=mlState; saveMajorLiftState(); };
    container.querySelector('#grr-ml-floor').onchange = (e) => { mlState.repFloor = parseInt(e.target.value,10) || P.repFloor; MAJOR_LIFT_STATE[dayKey]=mlState; saveMajorLiftState(); render(); };
    container.querySelector('#grr-ml-ceiling').onchange = (e) => { mlState.repTarget = parseInt(e.target.value,10) || P.repCeiling; MAJOR_LIFT_STATE[dayKey]=mlState; saveMajorLiftState(); render(); };
    container.querySelector('#grr-save-major').onclick = () => {
      const reps = [...container.querySelectorAll('.grr-ml-reps')].map(inp => parseInt(inp.value,10)||0);
      const msgEl = container.querySelector('#'+msgElId);
      if (reps.some(r=>r<=0)) { msgEl.textContent = 'Enter a rep count for every set first.'; return; }
      msgEl.textContent = saveMajorLiftSets(dayKey, reps);
    };
  }
  // ---------- MERGED MAJOR LIFT + MOBILITY/REHAB BOX (Home page) ----------
  // Combines what used to be two separate collapsible sections into one, with Mobility/Rehab slots
  // physically positioned between the Major Lift set rows they're meant to fill — set 1, then the
  // mobility exercise for the rest window right after it, then set 2, and so on. This mirrors how the
  // workout is actually done (mobility work fills the rest between sets) instead of making the person
  // manage two disconnected boxes themselves.
  //
  // Slot-to-rest-window mapping: Major Lift set count is variable (3 sets in Stage 1, 4 in Stage 2/3 —
  // §6.1), so the number of rest windows (sets - 1) is too — but Mobility/Rehab always has exactly 4
  // fixed slots (§6.4). Only `sets - 1` slots get a rest window this session (slot 1 after set 1, slot
  // 2 after set 2, ...); this was an explicit choice over always cycling all 4 regardless of set count,
  // so the flow stays strictly tied to windows that actually exist today. Any slot(s) beyond that
  // (there's always at least one, since max rest windows is maxSets-1=3 but there are 4 slots) are NOT
  // silently hidden — they're still shown below the sets, under "Additional Mobility/Rehab", fully
  // tappable/swappable, just not framed as "during rest N" since there's no such window today. This
  // keeps every slot reachable every session even though not every slot maps to a rest window yet.
  function renderMajorLiftAndMobility(container, dayKey, msgElId) {
    const majorDay = MAJOR_LIFT_DAYS[dayKey];
    const P = CIRCUIT_PARAMS.majorLift;
    const mlState = MAJOR_LIFT_STATE[dayKey] || {sets: P.startSets, weight: null, streak: 0, lastAmrap: null, repTarget: P.repCeiling};
    if (!mlState.repTarget) mlState.repTarget = P.repCeiling;
    if (!mlState.repFloor) mlState.repFloor = P.repFloor;
    const ceiling = mlState.repTarget;
    const supersetIds = getDailySuperset(dayKey);
    const usedSlotCount = mlState.sets - 1;

    let html = `<div class="grr-tm-box" style="margin-bottom:10px;"><div><label>Weight (lb, total incl. 20lb bar)</label><div style="font-size:11px;color:var(--muted);margin-top:2px;">Stage: ${mlState.sets} sets</div></div><input type="number" id="grr-ml-weight" value="${mlState.weight||''}" placeholder="e.g. 70"/></div>`;
    html += `<div class="grr-tm-box" style="margin-bottom:10px;"><div><label>Rep range</label><div style="font-size:11px;color:var(--muted);margin-top:2px;">Floor is informational; ceiling drives stage advancement.</div></div><div style="display:flex;gap:6px;align-items:center;"><input type="number" id="grr-ml-floor" value="${mlState.repFloor}" style="width:52px;"/><span style="color:var(--muted);font-size:11px;">–</span><input type="number" id="grr-ml-ceiling" value="${ceiling}" style="width:52px;"/></div></div>`;
    for (let i=1;i<=mlState.sets;i++) {
      const isAmrap = i===mlState.sets;
      html += `<div class="grr-set-row"><div class="grr-set-row-top"><span>Set ${i}${isAmrap?' (AMRAP)':''}</span><span>${isAmrap?`beat last: ${mlState.lastAmrap??'—'}`:`target ${ceiling}`}</span></div><div class="grr-set-inputs"><input type="number" class="grr-ml-reps" data-i="${i}" placeholder="reps" style="width:70px;"/><span class="grr-unit">reps</span></div></div>`;
      if (i < mlState.sets && (i-1) < supersetIds.length) html += `<div id="grr-ml-mobility-${i-1}"></div>`;
    }
    html += `<button class="grr-save-btn" id="grr-save-major">Save Major Lift</button><div class="grr-save-msg" id="${msgElId}"></div>`;
    if (supersetIds.length > usedSlotCount) {
      html += `<div class="grr-section-label" style="padding-left:0;">Additional Mobility / Rehab (no rest window today)</div><div id="grr-ml-mobility-extra"></div>`;
    }
    container.innerHTML = html;

    container.querySelector('#grr-ml-weight').onchange = (e) => { mlState.weight = parseFloat(e.target.value)||null; MAJOR_LIFT_STATE[dayKey]=mlState; saveMajorLiftState(); };
    container.querySelector('#grr-ml-floor').onchange = (e) => { mlState.repFloor = parseInt(e.target.value,10) || P.repFloor; MAJOR_LIFT_STATE[dayKey]=mlState; saveMajorLiftState(); render(); };
    container.querySelector('#grr-ml-ceiling').onchange = (e) => { mlState.repTarget = parseInt(e.target.value,10) || P.repCeiling; MAJOR_LIFT_STATE[dayKey]=mlState; saveMajorLiftState(); render(); };

    for (let i=0;i<usedSlotCount;i++) {
      if (i >= supersetIds.length) continue;
      const holder = container.querySelector(`#grr-ml-mobility-${i}`);
      if (holder) holder.appendChild(buildMobilitySlotRow(dayKey, i, {label:'During rest — Mobility / Rehab'}));
    }
    if (supersetIds.length > usedSlotCount) {
      const extraHolder = container.querySelector('#grr-ml-mobility-extra');
      for (let slotIdx = usedSlotCount; slotIdx < supersetIds.length; slotIdx++) {
        extraHolder.appendChild(buildMobilitySlotRow(dayKey, slotIdx));
      }
    }

    container.querySelector('#grr-save-major').onclick = () => {
      const reps = [...container.querySelectorAll('.grr-ml-reps')].map(inp => parseInt(inp.value,10)||0);
      const msgEl = container.querySelector('#'+msgElId);
      if (reps.some(r=>r<=0)) { msgEl.textContent = 'Enter a rep count for every set first.'; return; }
      msgEl.textContent = saveMajorLiftSets(dayKey, reps);
    };
  }

  // ---------- MAJOR LIFT FOCUS MODE ----------
  // A simple guided screen for Major Lift + Mobility/Rehab, same spirit as Circuit Focus Mode (§6.9)
  // but for the set/rest cycle: Set 1 → log reps → mobility exercise for that rest window → Done →
  // Set 2 → log reps → mobility → ... → last set (AMRAP) → log reps → Finish & Save.
  //
  // Unlike Circuit Focus Mode, this DOES need a small transient state store (MAJOR_FOCUS) — the
  // Major Lift save logic (saveMajorLiftSets) needs every set's reps together to decide stage
  // advancement, and reps aren't captured anywhere persisted until that save happens, so there's no
  // existing store to derive "current step" from the way Circuit Focus Mode derives it from
  // CIRCUIT_TICKS. MAJOR_FOCUS is deliberately NOT persisted to localStorage (same convention as
  // HOME_COLLAPSE/HOME_MOBILITY_MSG) — a reload mid-session loses in-progress-but-unsaved set reps,
  // which is an accepted tradeoff for keeping this simple; nothing is lost that a normal Save would
  // have committed anyway.
  let MAJOR_FOCUS = { dayKey: null, stepIndex: 0, repsBySet: {} };
  function resetMajorFocusIfNeeded(dayKey) {
    if (MAJOR_FOCUS.dayKey !== dayKey) MAJOR_FOCUS = { dayKey, stepIndex: 0, repsBySet: {} };
  }
  function enterMajorFocus() {
    resetMajorFocusIfNeeded(HOME.majorDay);
    state.view = 'majorFocus';
    render();
  }
  // Ordered step list for one Major Lift Focus Mode session: a 'set' step for every set, with a
  // 'mobility' step inserted after every set except the last (there's no rest window after the final/
  // AMRAP set). Only uses up to `sets - 1` Mobility/Rehab slots, same slot-to-rest-window mapping as
  // the merged inline box above.
  function majorFocusSteps(dayKey) {
    const majorDay = MAJOR_LIFT_DAYS[dayKey];
    const P = CIRCUIT_PARAMS.majorLift;
    const mlState = MAJOR_LIFT_STATE[dayKey] || {sets: P.startSets};
    const supersetIds = getDailySuperset(dayKey);
    const steps = [];
    for (let i = 1; i <= mlState.sets; i++) {
      steps.push({ type: 'set', setIndex: i, isAmrap: i === mlState.sets });
      if (i < mlState.sets && (i-1) < supersetIds.length) {
        steps.push({ type: 'mobility', exId: supersetIds[i-1], slotIdx: i-1 });
      }
    }
    return steps;
  }
  function renderMajorFocus() {
    const dayKey = HOME.majorDay;
    resetMajorFocusIfNeeded(dayKey);
    const majorDay = MAJOR_LIFT_DAYS[dayKey];
    const ex = EX_BY_ID[majorDay.lift];
    const P = CIRCUIT_PARAMS.majorLift;
    const mlState = MAJOR_LIFT_STATE[dayKey] || {sets: P.startSets, weight: null, streak: 0, lastAmrap: null, repTarget: P.repCeiling};
    if (!mlState.repTarget) mlState.repTarget = P.repCeiling;
    const ceiling = mlState.repTarget;
    const steps = majorFocusSteps(dayKey);

    if (MAJOR_FOCUS.stepIndex >= steps.length) {
      const orderedReps = steps.filter(s => s.type === 'set').map(s => MAJOR_FOCUS.repsBySet[s.setIndex] || 0);
      root.innerHTML = `
        <div class="grr-detail">
          <span class="grr-back" id="grr-back">← Back to Home Workout</span>
          <div class="grr-detail-name">${majorDay.label} — Finish</div>
          <div class="grr-detail-meta">${ex.n} · all ${orderedReps.length} sets logged: ${orderedReps.join(', ')} reps.</div>
          <button class="grr-save-btn" id="grr-major-focus-save">Save Major Lift</button>
          <div class="grr-save-msg" id="grr-major-focus-msg">${state.homeMsg||''}</div>
        </div>
      `;
      root.querySelector('#grr-back').onclick = () => { state.view = 'home'; render(); };
      root.querySelector('#grr-major-focus-save').onclick = () => {
        state.homeMsg = saveMajorLiftSets(dayKey, orderedReps);
        MAJOR_FOCUS = { dayKey: null, stepIndex: 0, repsBySet: {} };
        state.view = 'home';
        render();
      };
      return;
    }

    const step = steps[MAJOR_FOCUS.stepIndex];
    if (step.type === 'set') {
      root.innerHTML = `
        <div class="grr-detail">
          <span class="grr-back" id="grr-back">← Exit Focus Mode</span>
          <div class="grr-detail-meta">Step ${MAJOR_FOCUS.stepIndex+1} of ${steps.length} · ${majorDay.label}</div>
          <div class="grr-detail-name">${ex.n} — Set ${step.setIndex}${step.isAmrap?' (AMRAP)':''}</div>
          <div class="grr-detail-meta">${step.isAmrap ? `Beat last AMRAP: ${mlState.lastAmrap??'—'}` : `Target ${ceiling} reps`}${mlState.weight?` · ${mlState.weight} lb`:''}</div>
          ${gifBlock(ex)}
          <div class="grr-set-inputs" style="margin-bottom:16px;">
            <input type="number" id="grr-mf-reps" placeholder="reps" style="width:90px;height:48px;font-size:20px;"/>
            <span class="grr-unit">reps</span>
          </div>
          <button class="grr-save-btn" id="grr-mf-log-set">Log Set${step.setIndex < mlState.sets ? ' & Continue' : ''}</button>
          <div class="grr-save-msg" id="grr-mf-msg"></div>
        </div>
      `;
      root.querySelector('#grr-back').onclick = () => { state.view = 'home'; render(); };
      root.querySelector('#grr-mf-log-set').onclick = () => {
        const v = parseInt(document.getElementById('grr-mf-reps').value, 10);
        if (!(v > 0)) { root.querySelector('#grr-mf-msg').textContent = 'Enter a rep count first.'; return; }
        MAJOR_FOCUS.repsBySet[step.setIndex] = v;
        MAJOR_FOCUS.stepIndex++;
        render();
      };
    } else {
      const mex = EX_BY_ID[step.exId];
      const gifHtml = mex ? gifBlock(mex) : '';
      root.innerHTML = `
        <div class="grr-detail">
          <span class="grr-back" id="grr-back">← Exit Focus Mode</span>
          <div class="grr-detail-meta">Step ${MAJOR_FOCUS.stepIndex+1} of ${steps.length} · ${majorDay.label}</div>
          <div class="grr-detail-meta">During rest — Mobility / Rehab</div>
          <div class="grr-detail-name">${mex ? mex.n : step.exId}</div>
          ${gifHtml}
          <button class="grr-save-btn" id="grr-mf-mobility-done">Done</button>
        </div>
      `;
      root.querySelector('#grr-back').onclick = () => { state.view = 'home'; render(); };
      root.querySelector('#grr-mf-mobility-done').onclick = () => {
        if (mex) setMobilityRounds(step.exId, mex, Math.min(mobilityRoundsToday(step.exId) + 1, 3));
        MAJOR_FOCUS.stepIndex++;
        render();
      };
    }
  }

  function renderHome() {
    if (!HOME_DATA_LOADED) {
      root.innerHTML = `<div class="grr-detail"><span class="grr-back" id="grr-back">← Back to list</span><div class="grr-empty">Couldn't load home-workouts.js — make sure it's uploaded in the same folder as index.html.</div></div>`;
      root.querySelector('#grr-back').onclick = () => { state.view = 'list'; render(); };
      return;
    }

    const majorDay = MAJOR_LIFT_DAYS[HOME.majorDay];
    const circuitDay = CIRCUIT_DAYS[HOME.circuitDay];
    const P = CIRCUIT_PARAMS.ladder;

    root.innerHTML = `
      <div class="grr-detail">
        <span class="grr-back" id="grr-back">← Back to list</span>
        <div class="grr-detail-name">Home Workout</div>
        <div class="grr-detail-meta">Today's session — pick your Major Lift day below (each day's circuit is paired to it automatically).</div>

        <div class="grr-section-label" style="padding-left:0;">Major Lift day</div>
        <div class="grr-equip-row" id="grr-major-day-row"></div>

        <div class="grr-collapse${HOME_COLLAPSE.plate?' open':''}" id="grr-plate-collapse" style="margin:10px 0 14px;">
          <div class="grr-collapse-head" id="grr-plate-header">Plate Inventory & Pool ▾</div>
          <div class="grr-collapse-body" id="grr-plate-body" style="padding:0 0 12px;"></div>
        </div>

        <div class="grr-collapse${HOME_COLLAPSE.major?' open':''}" id="grr-major-collapse" style="margin:10px 0 14px;">
          <div class="grr-collapse-head" id="grr-major-lift-header">
            <span id="grr-major-toggle-label">${majorDay.label}: ${EX_BY_ID[majorDay.lift] ? EX_BY_ID[majorDay.lift].n : majorDay.lift} ▾</span>
            <span style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
              <span id="grr-major-view-link" style="color:var(--steel);font-size:11px;cursor:pointer;">(view exercise →)</span>
              <span id="grr-major-focus-link" style="color:var(--green);font-size:11px;cursor:pointer;font-weight:800;margin-left:12px;">▶ Focus Mode</span>
            </span>
          </div>
          <div class="grr-collapse-body" id="grr-major-lift-block" style="padding:0 0 12px;">
            <div style="font-size:11px;color:var(--muted);margin:0 0 8px;line-height:1.5;">Mobility/Rehab exercises are shown right after the set they follow — that's your rest window. Prefer one thing at a time? Use Focus Mode above.</div>
            <div id="grr-major-mobility-block"></div>
          </div>
        </div>

        <div class="grr-collapse${HOME_COLLAPSE.circuit?' open':''}" id="grr-circuit-collapse" style="margin:10px 0 14px;">
          <div class="grr-collapse-head" id="grr-circuit-header">
            <span>${circuitDay.label} ▾</span>
            <span id="grr-circuit-start-link" style="color:var(--green);font-size:11px;cursor:pointer;font-weight:800;margin-left:12px;">▶ Focus Mode</span>
          </div>
          <div class="grr-collapse-body" id="grr-circuit-wrap" style="padding:0 0 12px;">
            <div style="font-size:11px;color:var(--muted);margin:0 0 10px;line-height:1.5;"><b style="color:var(--steel);">Done</b> = completed the round, did not hit ceiling. <b style="color:var(--brand);">Max!</b> = Completes and hit max ceiling. Core and Isolation stations can be swapped with the chips above each one. Prefer one exercise at a time? Use Focus Mode above — it walks the whole circuit for you and auto-advances after each round.</div>
            <div id="grr-circuit-block"></div>
            <button class="grr-save-btn" id="grr-save-circuit">Save Circuit Session</button>
            <div class="grr-save-msg" id="grr-home-msg">${state.homeMsg||''}</div>
          </div>
        </div>
      </div>
    `;
    root.querySelector('#grr-back').onclick = () => { state.homeMsg = ''; state.view = 'list'; render(); };

    // ---- Section collapse toggles — click the header to expand/collapse; state persists across
    // render() calls via HOME_COLLAPSE so ticking a round or editing a rep range doesn't snap the
    // section shut again. ----
    root.querySelector('#grr-plate-header').onclick = () => { HOME_COLLAPSE.plate = !HOME_COLLAPSE.plate; render(); };
    root.querySelector('#grr-major-lift-header').onclick = () => { HOME_COLLAPSE.major = !HOME_COLLAPSE.major; render(); };
    root.querySelector('#grr-circuit-header').onclick = () => { HOME_COLLAPSE.circuit = !HOME_COLLAPSE.circuit; render(); };
    // "(view exercise →)" and "▶ Focus Mode" sit inside the Major Lift header — stop the click from
    // also toggling the collapse it's nested in. Same pattern for the Circuit header's start link.
    root.querySelector('#grr-major-view-link').onclick = (e) => {
      e.stopPropagation();
      state.cameFrom = {view:'home'}; state.homeMode = true; state.view = 'detail'; state.activeId = majorDay.lift; state.saveMsg=''; render();
    };
    root.querySelector('#grr-major-focus-link').onclick = (e) => {
      e.stopPropagation();
      enterMajorFocus();
    };
    root.querySelector('#grr-circuit-start-link').onclick = (e) => {
      e.stopPropagation();
      state.view = 'circuitFocus'; render();
    };

    const majorRow = root.querySelector('#grr-major-day-row');
    ['A','B','C'].forEach(d => {
      const chip = document.createElement('div');
      chip.className = 'grr-chip' + (HOME.majorDay === d ? ' active' : '');
      chip.textContent = 'Day ' + d;
      // Circuits are now paired 1:1 with the Major Lift day — picking a Major Lift day also picks
      // its circuit, so there's no separate Circuit day picker anymore.
      chip.onclick = () => { HOME.majorDay = d; HOME.circuitDay = d; state.homeMsg = ''; saveHome(); render(); };
      majorRow.appendChild(chip);
    });

    // Plate inventory + pool — just the raw pool total. No auto-derivation from the Major Lift
    // weight (that mechanic never worked reliably and wasn't worth the complexity — do the math
    // yourself for how much is left over for the circuit dumbbell).
    const plateBody = root.querySelector('#grr-plate-body');
    const sizes = Object.keys(PLATE_INVENTORY).map(Number).sort((a,b)=>a-b);
    plateBody.innerHTML = `
      <div style="font-size:11px;color:var(--muted);margin-bottom:8px;">Pairs owned per plate size. Update as you buy more — no code change needed.</div>
      ${sizes.map(s => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--line);">
          <span>${s} lb (pair)</span>
          <input type="number" class="grr-plate-input" data-size="${s}" value="${PLATE_INVENTORY[s]}" style="width:50px;background:var(--bg);border:1px solid var(--line);color:var(--chalk);padding:5px;border-radius:4px;text-align:center;"/>
        </div>`).join('')}
      <div style="margin-top:10px;font-size:12.5px;">Total loadable plate pool: <b style="color:var(--brand);">${totalPlateWeight()} lb</b> · Bar: ${BAR_WEIGHT} lb · DB handle: ${DB_HANDLE_WEIGHT} lb</div>
    `;
    plateBody.querySelectorAll('.grr-plate-input').forEach(inp => {
      inp.onchange = () => { PLATE_INVENTORY[inp.dataset.size] = parseInt(inp.value,10) || 0; savePlateInventory(); render(); };
    });

    // Major Lift + Mobility/Rehab — merged logger, filling the collapse body set up above. Mobility
    // slots are interleaved between set rows (§6.4/§6.10) instead of living in their own section.
    renderMajorLiftAndMobility(root.querySelector('#grr-major-mobility-block'), HOME.majorDay, 'grr-major-msg-inline');

    // Circuit block — one row per station (Core/Isolation get a swap-picker chip row above them),
    // with a prev-rung button and one tick per round (P.startSets rounds).
    const circBlock = root.querySelector('#grr-circuit-block');
    circuitDay.stations.forEach(station => {
      const isLadder = !!station.ladder;
      const ladderKey = isLadder ? resolvedLadderKey(HOME.circuitDay, station) : null;
      const famKey = isLadder ? null : resolvedIsolationFamily(HOME.circuitDay, station);
      const fam = isLadder ? null : ISOLATION_FAMILIES[famKey];
      const exIds = isLadder ? [currentRungId(ladderKey)] : (fam ? fam.exercises : []);

      const showLadderSwap = isLadder && station.pattern === 'Core';
      const showFamilySwap = !isLadder;
      if (showLadderSwap || showFamilySwap) {
        // Swap-picker panel — visually set apart from the plain station rows below it (distinct
        // background + a colored top label) so it reads as "this is a control, not just another
        // row," using colors already established elsewhere in the app rather than introducing new
        // ones: --steel is the app's existing color for secondary/interactive affordances (links,
        // "view exercise", badges), reused here as the panel's accent.
        const pickerBox = document.createElement('div');
        pickerBox.style.cssText = 'margin-bottom:8px;padding:8px 10px 10px;border-radius:8px;background:var(--surface-2);border:1px solid var(--steel);';
        const pickerLabel = document.createElement('div');
        pickerLabel.style.cssText = 'font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--steel);margin-bottom:6px;';
        pickerLabel.textContent = showLadderSwap ? 'Switch Core Variant' : 'Switch Isolation Pair';
        pickerBox.appendChild(pickerLabel);
        const pickerWrap = document.createElement('div');
        pickerWrap.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;';
        const options = showLadderSwap
          ? CORE_LADDER_KEYS.map(k => ({key:k, label: LADDERS[k].label}))
          : Object.keys(ISOLATION_FAMILIES).map(k => ({key:k, label: ISOLATION_FAMILIES[k].label}));
        const activeKey = showLadderSwap ? ladderKey : famKey;
        options.forEach(opt => {
          const chip = document.createElement('div');
          chip.className = 'grr-chip' + (opt.key === activeKey ? ' active' : '');
          chip.style.cssText = 'font-size:10.5px;padding:5px 9px;';
          chip.textContent = opt.label;
          chip.onclick = () => {
            STATION_PICK[stationPickKey(HOME.circuitDay, station.pattern)] = opt.key;
            saveStationPick(); render();
          };
          pickerWrap.appendChild(chip);
        });
        pickerBox.appendChild(pickerWrap);
        circBlock.appendChild(pickerBox);
      }

      exIds.forEach(exId => {
        const ex = EX_BY_ID[exId];
        if (!ex) return;
        const baseP = isLadder ? ladderParamsFor(ladderKey) : CIRCUIT_PARAMS.isolation;
        const rr = isLadder ? getRepRange('ladder', ladderKey, baseP.repFloor, baseP.repCeiling) : getRepRange('iso', exId, baseP.repFloor, baseP.repCeiling);
        const stationP = {...baseP, repFloor: rr.floor, repCeiling: rr.ceiling};
        const ticks = CIRCUIT_TICKS[exId] || [];
        const row = document.createElement('div');
        row.style.cssText = 'padding:10px;margin-bottom:6px;border-radius:6px;background:var(--surface);border:1px solid var(--line);';
        const topRow = document.createElement('div');
        topRow.style.cssText = 'display:flex;align-items:center;gap:8px;';
        const nameSpan = document.createElement('div');
        nameSpan.style.cssText = 'flex:1;cursor:pointer;';
        const rungLabel = isLadder ? ` · rung ${LADDERS[ladderKey].rungs.indexOf(exId)+1}/${LADDERS[ladderKey].rungs.length}` : '';
        nameSpan.innerHTML = `<div style="font-weight:700;font-size:13px;">${station.pattern}</div><div style="font-size:11.5px;color:var(--muted);">${ex.n}${rungLabel} · target ${stationP.repCeiling}, floor ${stationP.repFloor}</div>`;
        nameSpan.onclick = () => { state.cameFrom = {view:'home'}; state.homeMode = true; state.view = 'detail'; state.activeId = exId; state.saveMsg=''; render(); };
        topRow.appendChild(nameSpan);
        if (isLadder) {
          const st = RUNG_STATE[ladderKey] || {rungIndex:0, streak:0};
          if (st.rungIndex > 0) {
            const prevBtn = document.createElement('button');
            prevBtn.type = 'button'; prevBtn.textContent = '◀ prev rung';
            prevBtn.style.cssText = 'background:var(--bg);border:1px solid var(--line);color:var(--muted);font-size:10px;font-weight:700;padding:5px 8px;border-radius:4px;cursor:pointer;flex-shrink:0;';
            prevBtn.onclick = () => { st.rungIndex -= 1; st.streak = 0; RUNG_STATE[ladderKey] = st; saveRungState(); render(); };
            topRow.appendChild(prevBtn);
          }
        }
        row.appendChild(topRow);
        const tickRow = document.createElement('div');
        tickRow.style.cssText = 'display:flex;gap:6px;margin-top:8px;';
        for (let round = 0; round < P.startSets; round++) {
          const tick = ticks[round] || 0;
          const tickBtn = document.createElement('button');
          tickBtn.type = 'button';
          const tickLabel = tick === 2 ? 'Max!' : tick === 1 ? 'Done' : `Log R${round+1}`;
          const tickColor = tick === 2 ? 'var(--brand)' : tick === 1 ? 'var(--steel)' : 'var(--line)';
          tickBtn.textContent = tickLabel;
          tickBtn.style.cssText = `flex:1;height:38px;border-radius:6px;border:none;background:${tickColor};color:#fff;font-weight:800;font-size:12.5px;cursor:pointer;`;
          tickBtn.onclick = () => {
            const arr = CIRCUIT_TICKS[exId] || [];
            arr[round] = ((arr[round]||0) + 1) % 3;
            CIRCUIT_TICKS[exId] = arr;
            saveCircuitTicks(); render();
          };
          tickRow.appendChild(tickBtn);
        }
        row.appendChild(tickRow);
        circBlock.appendChild(row);
      });
    });

    root.querySelector('#grr-save-circuit').onclick = () => {
      state.homeMsg = saveCircuitSession();
      render();
    };
  }
  function renderHomeDetail(x) {
    if (HOME_DETAIL_LAST_ID !== x.id) { HOME_DETAIL_MSG = ''; HOME_DETAIL_LAST_ID = x.id; }
    const majorKey = findMajorLiftDay(x.id);
    const ladderInfo = findLadderForExercise(x.id);
    const isIsolation = isIsolationStationExercise(x.id);

    if (majorKey) {
      root.innerHTML = `
        <div class="grr-detail">
          ${backButtonHtml()}
          <div class="grr-detail-name">${x.n}</div>
          <div class="grr-detail-meta">${x.p} · ${x.m} · Home Major Lift ${majorKey}</div>
          ${gifBlock(x)}
          ${x.notes ? `<div class="grr-notes">${x.notes}</div>` : ''}
          <div id="grr-hd-major-block"></div>
        </div>
      `;
      wireBackButtons();
      renderMajorLiftLogger(root.querySelector('#grr-hd-major-block'), majorKey, 'grr-hd-major-msg');
      return;
    }

    if (ladderInfo) {
      const ladder = LADDERS[ladderInfo.key];
      const st = RUNG_STATE[ladderInfo.key] || {rungIndex:0, streak:0};
      const base = ladderParamsFor(ladderInfo.key);
      const rr = getRepRange('ladder', ladderInfo.key, base.repFloor, base.repCeiling);
      const P = {...base, repFloor: rr.floor, repCeiling: rr.ceiling};
      const rungListHtml = ladder.rungs.map((rId, i) => {
        const rEx = EX_BY_ID[rId];
        const isCurrent = i === st.rungIndex;
        return `<div class="grr-rung-row${isCurrent?' active':''}" data-idx="${i}" style="padding:8px 10px;border-radius:6px;margin-bottom:4px;cursor:pointer;background:${isCurrent?'var(--brand)':'var(--surface)'};color:${isCurrent?'#fff':'var(--chalk)'};border:1px solid ${isCurrent?'var(--brand)':'var(--line)'};font-size:12.5px;">Rung ${i+1}: ${rEx ? rEx.n : rId}${isCurrent?' (current)':''}</div>`;
      }).join('');
      const hist = (LOGS[x.id] || []).slice(-5).reverse();
      const histHtml = hist.length ? hist.map(l => `<div class="grr-history-row"><span>${friendlyDate(l.date)}</span><span>${l.sets.map(s=>s.success?'✅':'❌').join('')}</span></div>`).join('') : `<div style="color:var(--muted);font-size:12px;">No sessions logged yet.</div>`;
      let setsHtml = '';
      for (let i=1; i<=P.startSets; i++) {
        setsHtml += `<div class="grr-set-row"><div class="grr-set-row-top"><span>Round ${i}</span><span>target ${P.repCeiling}, floor ${P.repFloor}</span></div><div class="grr-set-inputs"><input type="number" class="grr-hd-reps" data-i="${i}" placeholder="reps" style="width:70px;"/><span class="grr-unit">reps</span></div></div>`;
      }
      const repRangeEditorHtml = `<div class="grr-tm-box"><div><label>Rep range</label><div style="font-size:11px;color:var(--muted);margin-top:2px;">Shared by every rung on ${ladder.label}. Floor is informational; ceiling drives rung advancement.</div></div><div style="display:flex;gap:6px;align-items:center;"><input type="number" id="grr-hd-rep-floor" value="${P.repFloor}" style="width:52px;"/><span style="color:var(--muted);font-size:11px;">–</span><input type="number" id="grr-hd-rep-ceiling" value="${P.repCeiling}" style="width:52px;"/></div></div>`;
      // Reference weight (item 8) — only shown for rungs with a loaded/weighted variation. Purely
      // informational: never affects round success/failure or rung-advancement, just flags a plateau.
      // Can be tracked as either a numeric plate weight or a band strength level — see the WEIGHT
      // TYPE section above.
      const showRefWeight = !isBodyweightOnly(x);
      const refState = REF_WEIGHT[x.id] || {weight: null, lastCeilingWeight: null, ceilingStreak: 0, type: defaultWeightType(x)};
      if (!refState.type) refState.type = defaultWeightType(x); // back-compat for state saved before this field existed
      const refWeightHtml = showRefWeight ? `
        ${weightTypeToggleHtml('grr-hd-ref', refState.type)}
        ${refState.type === 'band'
          ? `<div style="font-size:11px;color:var(--muted);margin:-2px 0 6px;">Reference band level only — doesn't affect success or rung advancement.</div>${bandPickerHtml('grr-hd-ref', refState.weight || 'light')}`
          : `<div class="grr-tm-box"><div><label>Weight (lb, reference only)</label><div style="font-size:11px;color:var(--muted);margin-top:2px;">Doesn't affect success or rung advancement — just here so a plateau is easy to spot.</div></div><input type="number" id="grr-hd-ref-weight" value="${refState.weight||''}" placeholder="e.g. 20"/></div>`}
        ${refState.ceilingStreak >= 2 ? `<div style="background:var(--surface);border:1px solid var(--brand);border-radius:6px;padding:8px 10px;margin-bottom:10px;font-size:12.5px;color:var(--brand);font-weight:700;">Hit the ceiling twice at ${formatWeightValue(refState.type, refState.lastCeilingWeight)} — consider increasing it.</div>` : ''}
      ` : '';
      root.innerHTML = `
        <div class="grr-detail">
          ${backButtonHtml()}
          <div class="grr-detail-name">${x.n}</div>
          <div class="grr-detail-meta">${x.p} · ${x.m} · ${ladder.label}, rung ${ladderInfo.idx+1}/${ladder.rungs.length}</div>
          ${gifBlock(x)}
          ${x.notes ? `<div class="grr-notes">${x.notes}</div>` : ''}
          <div class="grr-section-label" style="padding-left:0;">${ladder.label} — tap any rung to jump there (forward or back)</div>
          <div id="grr-rung-list" style="margin-bottom:14px;">${rungListHtml}</div>
          ${repRangeEditorHtml}
          ${refWeightHtml}
          <div id="grr-hd-sets">${setsHtml}</div>
          <button class="grr-save-btn" id="grr-hd-save">Save Round(s)</button>
          <div class="grr-save-msg" id="grr-hd-msg">${HOME_DETAIL_MSG||''}</div>
          <div class="grr-section-label" style="padding-left:0;">Recent history</div>
          <div class="grr-history">${histHtml}</div>
        </div>
      `;
      wireBackButtons();
      root.querySelectorAll('.grr-rung-row').forEach(row => {
        row.onclick = () => {
          const idx = parseInt(row.dataset.idx, 10);
          RUNG_STATE[ladderInfo.key] = {rungIndex: idx, streak: 0};
          saveRungState();
          state.activeId = ladder.rungs[idx];
          render();
        };
      });
      root.querySelector('#grr-hd-rep-floor').onchange = (e) => { setRepRange('ladder', ladderInfo.key, parseInt(e.target.value,10) || base.repFloor, P.repCeiling); render(); };
      root.querySelector('#grr-hd-rep-ceiling').onchange = (e) => { setRepRange('ladder', ladderInfo.key, P.repFloor, parseInt(e.target.value,10) || base.repCeiling); render(); };
      if (showRefWeight) {
        root.querySelectorAll('#grr-hd-ref-type-row .grr-chip').forEach(chip => {
          chip.onclick = () => {
            const t = chip.dataset.type;
            if (t !== refState.type) {
              refState.type = t;
              refState.weight = t === 'band' ? 'light' : null;
              refState.lastCeilingWeight = null; refState.ceilingStreak = 0;
              REF_WEIGHT[x.id] = refState; saveRefWeight();
              render();
            }
          };
        });
        if (refState.type === 'band') {
          root.querySelectorAll('#grr-hd-ref-band-row .grr-chip').forEach(chip => {
            chip.onclick = () => { refState.weight = chip.dataset.band; REF_WEIGHT[x.id] = refState; saveRefWeight(); render(); };
          });
        } else {
          root.querySelector('#grr-hd-ref-weight').onchange = (e) => {
            refState.weight = parseFloat(e.target.value)||null;
            REF_WEIGHT[x.id] = refState;
            saveRefWeight();
          };
        }
      }
      root.querySelector('#grr-hd-save').onclick = () => {
        const reps = [...root.querySelectorAll('.grr-hd-reps')].map(inp => parseInt(inp.value,10)||0);
        if (reps.some(r=>r<=0)) { root.querySelector('#grr-hd-msg').textContent = 'Enter reps for every round first.'; return; }
        const allHit = reps.every(r => r >= P.repCeiling);
        const entry = {date: todayLocal(), exercise: x.n, pattern: x.p, exId: x.id, logId: newLogId(),
          sets: reps.map((r,i)=>({target:'Round '+(i+1), weight:null, reps:r, success: r>=P.repCeiling})), allSuccess: allHit, tmAction:'none'};
        if (!LOGS[x.id]) LOGS[x.id] = [];
        LOGS[x.id].push(entry); saveLogs();
        let msg;
        if (allHit) {
          st.streak = (st.streak||0)+1;
          if (st.streak >= 2) {
            if (st.rungIndex < ladder.rungs.length-1) {
              st.rungIndex++; st.streak = 0;
              msg = `All rounds hit ${P.repCeiling} twice in a row — advanced to rung ${st.rungIndex+1}.`;
            } else {
              st.streak = 0;
              msg = `All rounds hit ${P.repCeiling} twice in a row, but this is already the top rung — no harder variation defined yet. Might be time to add one to home-workouts.js.`;
            }
          } else {
            msg = `All rounds hit ${P.repCeiling} — one more session like this and you'll advance.`;
          }
        } else {
          st.streak = 0;
          msg = 'Saved — not every round hit the ceiling, no rung change.';
        }
        RUNG_STATE[ladderInfo.key] = st; saveRungState();
        if (showRefWeight) {
          const updatedRef = trackWeightCeilingStreak(REF_WEIGHT, x.id, refState.weight, allHit);
          updatedRef.type = refState.type;
          saveRefWeight();
          if (updatedRef.ceilingStreak >= 2) msg += ` Also: hit the ceiling twice at ${formatWeightValue(updatedRef.type, updatedRef.lastCeilingWeight)} — consider increasing it.`;
        }
        HOME_DETAIL_MSG = msg;
        render();
      };
      return;
    }

    if (isIsolation) {
      const base = CIRCUIT_PARAMS.isolation;
      const rr = getRepRange('iso', x.id, base.repFloor, base.repCeiling);
      const P = {...base, repFloor: rr.floor, repCeiling: rr.ceiling};
      // Weight tracked as either a numeric plate weight or a band strength level — see the WEIGHT
      // TYPE section above. Defaults to band for band-equipped exercises (BAND_FP, BAND_LATERAL_RAISE)
      // but is manually switchable either way.
      const iState = ISOLATION_STATE[x.id] || {weight: null, lastCeilingWeight: null, ceilingStreak: 0, type: defaultWeightType(x)};
      if (!iState.type) iState.type = defaultWeightType(x); // back-compat for state saved before this field existed
      const hist = (LOGS[x.id] || []).slice(-5).reverse();
      const histHtml = hist.length ? hist.map(l => `<div class="grr-history-row"><span>${friendlyDate(l.date)}</span><span>${l.sets.map(s=>s.success?'✅':'❌').join('')}</span></div>`).join('') : `<div style="color:var(--muted);font-size:12px;">No sessions logged yet.</div>`;
      let setsHtml = '';
      for (let i=1; i<=P.startSets; i++) {
        setsHtml += `<div class="grr-set-row"><div class="grr-set-row-top"><span>Round ${i}</span><span>target ${P.repCeiling}, floor ${P.repFloor}</span></div><div class="grr-set-inputs"><input type="number" class="grr-hd-reps" data-i="${i}" placeholder="reps" style="width:70px;"/><span class="grr-unit">reps</span></div></div>`;
      }
      const repRangeEditorHtml = `<div class="grr-tm-box"><div><label>Rep range</label><div style="font-size:11px;color:var(--muted);margin-top:2px;">Floor is informational; ceiling drives the weight-bump progression.</div></div><div style="display:flex;gap:6px;align-items:center;"><input type="number" id="grr-hd-rep-floor" value="${P.repFloor}" style="width:52px;"/><span style="color:var(--muted);font-size:11px;">–</span><input type="number" id="grr-hd-rep-ceiling" value="${P.repCeiling}" style="width:52px;"/></div></div>`;
      const weightBlockHtml = iState.type === 'band'
        ? `${weightTypeToggleHtml('grr-hd-iso', iState.type)}${bandPickerHtml('grr-hd-iso', iState.weight || 'light')}`
        : `${weightTypeToggleHtml('grr-hd-iso', iState.type)}<div class="grr-tm-box"><div><label>Weight (lb)</label></div><input type="number" id="grr-hd-iso-weight" value="${iState.weight||''}" placeholder="e.g. 20"/></div>`;
      root.innerHTML = `
        <div class="grr-detail">
          ${backButtonHtml()}
          <div class="grr-detail-name">${x.n}</div>
          <div class="grr-detail-meta">${x.p} · ${x.m} · Isolation — ${P.startSets} rounds, weight is the only progression axis</div>
          ${gifBlock(x)}
          ${x.notes ? `<div class="grr-notes">${x.notes}</div>` : ''}
          ${weightBlockHtml}
          ${repRangeEditorHtml}
          ${iState.ceilingStreak >= 2 ? `<div style="background:var(--surface);border:1px solid var(--brand);border-radius:6px;padding:8px 10px;margin-bottom:10px;font-size:12.5px;color:var(--brand);font-weight:700;">Hit the ceiling twice at ${formatWeightValue(iState.type, iState.lastCeilingWeight)} — ${iState.type==='band' ? 'the band will bump on next save (unless already at X-Heavy).' : 'weight will bump on next save (or the rep target rises if no plates are available).'}</div>` : ''}
          <div id="grr-hd-sets">${setsHtml}</div>
          <button class="grr-save-btn" id="grr-hd-save">Save</button>
          <div class="grr-save-msg" id="grr-hd-msg">${HOME_DETAIL_MSG||''}</div>
          <div class="grr-section-label" style="padding-left:0;">Recent history</div>
          <div class="grr-history">${histHtml}</div>
        </div>
      `;
      wireBackButtons();
      root.querySelectorAll('#grr-hd-iso-type-row .grr-chip').forEach(chip => {
        chip.onclick = () => {
          const t = chip.dataset.type;
          if (t !== iState.type) {
            iState.type = t;
            iState.weight = t === 'band' ? 'light' : null;
            iState.lastCeilingWeight = null; iState.ceilingStreak = 0;
            ISOLATION_STATE[x.id] = iState; saveIsolationState();
            render();
          }
        };
      });
      if (iState.type === 'band') {
        root.querySelectorAll('#grr-hd-iso-band-row .grr-chip').forEach(chip => {
          chip.onclick = () => { iState.weight = chip.dataset.band; ISOLATION_STATE[x.id] = iState; saveIsolationState(); render(); };
        });
      } else {
        root.querySelector('#grr-hd-iso-weight').onchange = (e) => { iState.weight = parseFloat(e.target.value)||null; ISOLATION_STATE[x.id]=iState; saveIsolationState(); };
      }
      root.querySelector('#grr-hd-rep-floor').onchange = (e) => { setRepRange('iso', x.id, parseInt(e.target.value,10) || base.repFloor, P.repCeiling); render(); };
      root.querySelector('#grr-hd-rep-ceiling').onchange = (e) => { setRepRange('iso', x.id, P.repFloor, parseInt(e.target.value,10) || base.repCeiling); render(); };
      root.querySelector('#grr-hd-save').onclick = () => {
        const reps = [...root.querySelectorAll('.grr-hd-reps')].map(inp => parseInt(inp.value,10)||0);
        if (reps.some(r=>r<=0)) { root.querySelector('#grr-hd-msg').textContent = 'Enter reps for every round first.'; return; }
        const allHit = reps.every(r => r >= P.repCeiling);
        const updated = trackWeightCeilingStreak(ISOLATION_STATE, x.id, iState.weight, allHit);
        updated.type = iState.type;
        let msg;
        if (allHit) {
          if (updated.ceilingStreak >= 2) {
            if (updated.type === 'band') {
              const next = nextBandLevel(updated.weight);
              if (next) {
                updated.weight = next; updated.ceilingStreak = 0; updated.lastCeilingWeight = null;
                msg = `Hit ${P.repCeiling} on every round, twice in a row at the same band — bumped to ${bandLabel(next)}.`;
              } else {
                msg = `Hit ${P.repCeiling} on every round, twice in a row at X-Heavy band — already the heaviest level, so bump it manually (e.g. double up bands or switch to plates).`;
              }
            } else {
              const jump = smallestPlateJump();
              if (jump > 0) {
                updated.weight = (updated.weight||0) + jump;
                updated.ceilingStreak = 0; updated.lastCeilingWeight = null;
                msg = `Hit ${P.repCeiling} on every round, twice in a row at the same weight — bumped to ${updated.weight} lb.`;
              } else {
                msg = `Hit ${P.repCeiling} on every round, twice in a row at ${updated.lastCeilingWeight} lb — no plates available to add, so bump it manually next chance you get.`;
              }
            }
          } else {
            msg = `All rounds hit ${P.repCeiling} — one more session at this same ${updated.type==='band'?'band':'weight'} and it'll bump.`;
          }
        } else {
          msg = 'Saved — not every round hit the ceiling, no weight change.';
        }
        ISOLATION_STATE[x.id] = updated; saveIsolationState();
        const entry = {date: todayLocal(), exercise: x.n, pattern: x.p, exId: x.id, logId: newLogId(),
          sets: reps.map((r,i)=>({target:'Round '+(i+1), weight: iState.weight, reps:r, success: r>=P.repCeiling})), allSuccess: allHit, tmAction: msg.includes('bumped')?'increase':'none'};
        if (!LOGS[x.id]) LOGS[x.id] = [];
        LOGS[x.id].push(entry); saveLogs();
        HOME_DETAIL_MSG = msg;
        render();
      };
      return;
    }

    // Fallback — shouldn't normally hit this, but keeps the app from breaking on an unrecognized circuit exercise
    root.innerHTML = `<div class="grr-detail">${backButtonHtml()}<div class="grr-detail-name">${x.n}</div><div class="grr-empty">This exercise isn't linked into a Home Workout page yet.</div></div>`;
    wireBackButtons();
  }
