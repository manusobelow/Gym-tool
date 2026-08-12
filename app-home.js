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
  // on a raw DOM classList.toggle() — the latter would silently re-collapse Major Lift/Mobility/
  // Circuit on every single tap inside them, since render() rebuilds root.innerHTML from scratch on
  // nearly every interaction in this app (see PROJECT-SCHEMA.md §3 Gotcha #2).
  let HOME_COLLAPSE = { plate: false, major: true, mobility: true, circuit: true };
  // Confirmation message shown under the Mobility / Rehab "Save" button — same non-persisted
  // convention as state.homeMsg, just scoped to this section so the two messages don't clobber
  // each other when both live on the page at once.
  let HOME_MOBILITY_MSG = '';
  // Result message for renderHomeDetail's ladder/isolation Save button. Pre-existing bug, fixed
  // alongside the collapse work: the ladder and isolation save handlers used to write the message
  // straight onto the #grr-hd-msg DOM node and then call render() in the same breath — but render()
  // rebuilds the whole detail page from scratch (PROJECT-SCHEMA.md §3 Gotcha #2), so the message was
  // wiped the instant it was set and never actually visible. Routing it through this field (read by
  // the template, same pattern as state.homeMsg/HOME_MOBILITY_MSG) fixes that. HOME_DETAIL_LAST_ID
  // tracks which exercise it belongs to, so navigating to a different exercise's detail page clears
  // any stale leftover message instead of it bleeding into the new exercise's card.
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
      const sets = [];
      for (let i = 1; i <= rounds; i++) sets.push({target: 'Round '+i, weight: null, reps: null, success: true});
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
  // Swap pool for Mobility/Rehab slots: every exercise currently in the mobility scheme (respecting
  // any per-exercise scheme override, same as every other routing decision in this app).
  function mobilityPoolExercises() {
    return EX.filter(x => effectiveScheme(x) === 'mobility').sort((a,b) => a.n.localeCompare(b.n));
  }

  function renderMajorLiftLogger(container, dayKey, msgElId) {
    const majorDay = MAJOR_LIFT_DAYS[dayKey];
    const ex = EX_BY_ID[majorDay.lift];
    const P = CIRCUIT_PARAMS.majorLift;
    const mlState = MAJOR_LIFT_STATE[dayKey] || {sets: P.startSets, weight: null, streak: 0, lastAmrap: null, repTarget: P.repCeiling};
    if (!mlState.repTarget) mlState.repTarget = P.repCeiling; // back-compat for state saved before this field existed
    if (!mlState.repFloor) mlState.repFloor = P.repFloor; // back-compat for state saved before this field existed
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
      const amrapReps = reps[reps.length-1];
      const allHit = reps.every(r => r >= ceiling);
      let msg;
      if (allHit) {
        mlState.streak = (mlState.streak||0)+1;
        if (mlState.streak >= 2) {
          if (mlState.sets < P.maxSets) {
            // Stage 1 → Stage 2
            mlState.sets += 1; mlState.streak = 0;
            msg = `All sets hit ${ceiling} twice in a row — moving to ${mlState.sets} sets next session.`;
          } else {
            // Stage 2 → Stage 3: add the smallest available plate jump, or fall back to a higher rep target
            const jump = smallestPlateJump();
            mlState.sets = P.startSets; mlState.streak = 0;
            if (jump > 0) {
              mlState.weight = (mlState.weight||0) + jump;
              mlState.repTarget = P.repCeiling; // reset to Stage 1 at the new weight
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
      msgEl.textContent = msg;
    };
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
        <div class="grr-detail-meta">Today's session — pick your Major Lift day and Circuit day below.</div>

        <div class="grr-section-label" style="padding-left:0;">Major Lift day</div>
        <div class="grr-equip-row" id="grr-major-day-row"></div>
        <div class="grr-section-label" style="padding-left:0;">Circuit day</div>
        <div class="grr-equip-row" id="grr-circuit-day-row"></div>

        <div class="grr-collapse${HOME_COLLAPSE.plate?' open':''}" id="grr-plate-collapse" style="margin:10px 0 14px;">
          <div class="grr-collapse-head" id="grr-plate-header">Plate Inventory & Pool ▾</div>
          <div class="grr-collapse-body" id="grr-plate-body" style="padding:0 0 12px;"></div>
        </div>

        <div class="grr-collapse${HOME_COLLAPSE.major?' open':''}" id="grr-major-collapse" style="margin:10px 0 14px;">
          <div class="grr-collapse-head" id="grr-major-lift-header">
            <span id="grr-major-toggle-label">${majorDay.label}: ${EX_BY_ID[majorDay.lift] ? EX_BY_ID[majorDay.lift].n : majorDay.lift} ▾</span>
            <span id="grr-major-view-link" style="color:var(--steel);font-size:11px;cursor:pointer;">(view exercise →)</span>
          </div>
          <div class="grr-collapse-body" id="grr-major-lift-block" style="padding:0 0 12px;"></div>
        </div>

        <div class="grr-collapse${HOME_COLLAPSE.mobility?' open':''}" id="grr-mobility-collapse" style="margin:10px 0 14px;">
          <div class="grr-collapse-head" id="grr-mobility-header">Mobility / Rehab ▾</div>
          <div class="grr-collapse-body" id="grr-mobility-wrap" style="padding:0 0 12px;">
            <div style="font-size:11px;color:var(--muted);margin:0 0 8px;line-height:1.5;">Done during rest between Major Lift sets. Tap to cycle rounds — 1 → 2 → 3 → back to none. Swap any slot for a different mobility exercise with the dropdown.</div>
            <div id="grr-daily-superset-block" style="margin-bottom:10px;"></div>
            <button class="grr-save-btn" id="grr-save-mobility">Save Mobility / Rehab</button>
            <div class="grr-save-msg" id="grr-mobility-msg">${HOME_MOBILITY_MSG||''}</div>
          </div>
        </div>

        <div class="grr-collapse${HOME_COLLAPSE.circuit?' open':''}" id="grr-circuit-collapse" style="margin:10px 0 14px;">
          <div class="grr-collapse-head" id="grr-circuit-header">${circuitDay.label} — ${P.startSets} rounds each, tap to log each round as you go ▾</div>
          <div class="grr-collapse-body" id="grr-circuit-wrap" style="padding:0 0 12px;">
            <div style="font-size:11px;color:var(--muted);margin:0 0 10px;line-height:1.5;">Tap a round once you finish it: <b style="color:var(--steel);">Done</b> = completed the round but didn't hit the rep ceiling — still logs, doesn't count toward advancement. <b style="color:var(--brand);">Max!</b> = hit the rep ceiling — logs AND counts toward the "twice in a row" advancement streak. Core and Isolation stations can be swapped to a different progression/family at any time with the chips above each one.</div>
            <div id="grr-circuit-block"></div>
            <button class="grr-save-btn" id="grr-save-circuit">Save Circuit Session</button>
            <div class="grr-save-msg" id="grr-home-msg">${state.homeMsg||''}</div>
          </div>
        </div>
      </div>
    `;
    root.querySelector('#grr-back').onclick = () => { state.homeMsg = ''; HOME_MOBILITY_MSG = ''; state.view = 'list'; render(); };

    // ---- Section collapse toggles — click the header to expand/collapse; state persists across
    // render() calls via HOME_COLLAPSE so ticking a round or editing a rep range doesn't snap the
    // section shut again. ----
    root.querySelector('#grr-plate-header').onclick = () => { HOME_COLLAPSE.plate = !HOME_COLLAPSE.plate; render(); };
    root.querySelector('#grr-major-lift-header').onclick = () => { HOME_COLLAPSE.major = !HOME_COLLAPSE.major; render(); };
    root.querySelector('#grr-mobility-header').onclick = () => { HOME_COLLAPSE.mobility = !HOME_COLLAPSE.mobility; render(); };
    root.querySelector('#grr-circuit-header').onclick = () => { HOME_COLLAPSE.circuit = !HOME_COLLAPSE.circuit; render(); };
    // "(view exercise →)" sits inside the Major Lift header — stop the click from also toggling
    // the collapse it's nested in.
    root.querySelector('#grr-major-view-link').onclick = (e) => {
      e.stopPropagation();
      state.cameFrom = {view:'home'}; state.homeMode = true; state.view = 'detail'; state.activeId = majorDay.lift; state.saveMsg=''; render();
    };

    const majorRow = root.querySelector('#grr-major-day-row');
    ['A','B','C'].forEach(d => {
      const chip = document.createElement('div');
      chip.className = 'grr-chip' + (HOME.majorDay === d ? ' active' : '');
      chip.textContent = 'Day ' + d;
      chip.onclick = () => { HOME.majorDay = d; state.homeMsg = ''; HOME_MOBILITY_MSG = ''; saveHome(); render(); };
      majorRow.appendChild(chip);
    });
    const circuitRow = root.querySelector('#grr-circuit-day-row');
    [1,2].forEach(d => {
      const chip = document.createElement('div');
      chip.className = 'grr-chip' + (HOME.circuitDay === d ? ' active' : '');
      chip.textContent = 'Circuit ' + d;
      chip.onclick = () => { HOME.circuitDay = d; state.homeMsg = ''; saveHome(); render(); };
      circuitRow.appendChild(chip);
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

    // Major Lift — shared logger, filling the collapse body set up above
    renderMajorLiftLogger(root.querySelector('#grr-major-lift-block'), HOME.majorDay, 'grr-major-msg-inline');

    // Mobility / Rehab — name area opens the exercise's own page (gif/notes/history); a round-cycle
    // button logs how many rounds you got through today (1/2/3, 4th tap resets to none); a dropdown
    // per slot swaps in a different scheme:"mobility" exercise for that slot. The Save button below
    // doesn't do any additional persistence work (every tap/swap already saves itself immediately)
    // — it exists to give the same explicit confirmation the Major Lift and Circuit sections give.
    const dsBlock = root.querySelector('#grr-daily-superset-block');
    const supersetIds = getDailySuperset(HOME.majorDay);
    const mobilityPool = mobilityPoolExercises();
    supersetIds.forEach((exId, slotIdx) => {
      const ex = EX_BY_ID[exId];
      if (!ex) return;
      const rounds = mobilityRoundsToday(exId);
      const row = document.createElement('div');
      row.style.cssText = 'margin-bottom:8px;padding:8px 10px;border-radius:6px;background:var(--surface);border:1px solid var(--line);';
      const topRow = document.createElement('div');
      topRow.style.cssText = 'display:flex;align-items:center;gap:8px;';
      const nameSpan = document.createElement('div');
      nameSpan.style.cssText = 'flex:1;cursor:pointer;font-size:13px;font-weight:700;';
      nameSpan.textContent = ex.n;
      nameSpan.onclick = () => { state.cameFrom = {view:'home'}; state.view = 'detail'; state.activeId = exId; state.saveMsg = ''; render(); };
      const roundBtn = document.createElement('button');
      roundBtn.type = 'button';
      roundBtn.textContent = rounds > 0 ? `✓ ${rounds} round${rounds>1?'s':''}` : 'Mark Done';
      roundBtn.style.cssText = `flex-shrink:0;border:none;border-radius:6px;padding:7px 12px;font-size:11.5px;font-weight:800;cursor:pointer;background:${rounds>0 ? 'var(--green)' : 'var(--surface-2)'};color:${rounds>0 ? '#111' : 'var(--chalk)'};`;
      roundBtn.onclick = () => { setMobilityRounds(exId, ex, (rounds+1) % 4); render(); };
      topRow.appendChild(nameSpan); topRow.appendChild(roundBtn);
      row.appendChild(topRow);
      const swapSelect = document.createElement('select');
      swapSelect.style.cssText = 'margin-top:6px;width:100%;background:var(--bg);border:1px solid var(--line);color:var(--chalk);padding:5px;border-radius:4px;font-size:11px;';
      mobilityPool.forEach(px => {
        const opt = document.createElement('option');
        opt.value = px.id; opt.textContent = px.n;
        if (px.id === exId) opt.selected = true;
        swapSelect.appendChild(opt);
      });
      swapSelect.onchange = () => { setDailySupersetSlot(HOME.majorDay, slotIdx, swapSelect.value); render(); };
      row.appendChild(swapSelect);
      dsBlock.appendChild(row);
    });
    root.querySelector('#grr-save-mobility').onclick = () => {
      const marked = supersetIds.filter(exId => mobilityRoundsToday(exId) > 0).length;
      HOME_MOBILITY_MSG = marked > 0
        ? `Mobility / Rehab saved — ${marked} of ${supersetIds.length} slot${supersetIds.length===1?'':'s'} marked for today.`
        : 'Nothing marked yet — tap a slot at least once before saving.';
      render();
    };

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
        const pickerWrap = document.createElement('div');
        pickerWrap.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px;';
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
        circBlock.appendChild(pickerWrap);
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

    function logCircuitSet(exId, ticks, expectedRounds) {
      const ex = EX_BY_ID[exId];
      const sets = ticks.map((t,i) => ({target: 'Round '+(i+1), weight:null, reps:null, success: t===2}));
      const allSuccess = ticks.length === expectedRounds && ticks.every(t => t===2);
      const entry = {date: todayLocal(), exercise: ex.n, pattern: ex.p, exId, logId: newLogId(), sets, allSuccess, tmAction:'none'};
      if (!LOGS[exId]) LOGS[exId] = [];
      LOGS[exId].push(entry);
      return allSuccess;
    }

    root.querySelector('#grr-save-circuit').onclick = () => {
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
      state.homeMsg = msg;
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
