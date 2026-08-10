// app-home.js — Home Workout page + Home Workout exercise detail rendering.
// This is the file under constant revision for the home program — kept isolated from the main
// gym list/detail code on purpose. Depends on app-core.js (root, state, EX_BY_ID, effectiveScheme,
// gifBlock, backButtonHtml/wireBackButtons, save*(), totalPlateWeight, smallestPlateJump, etc)
// and on home-workouts.js data (LADDERS, CIRCUIT_PARAMS, MAJOR_LIFT_DAYS, CIRCUIT_DAYS, ladderParamsFor, etc).

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
  function isIsolationStationExercise(exId) {
    return Object.values(CIRCUIT_DAYS).some(d => d.stations.some(s => !s.ladder && s.exercises.includes(exId)));
  }
  // Isolation exercises use weight (or a band level) as their only progression axis (item 9) —
  // ceilingStreak here DOES drive advancement (adds a plate jump, or steps up a band level, once it
  // hits 2).
  let ISOLATION_STATE = {}; // { exId: {mode:'weight'|'band', weight, bandLevel, lastCeilingValue, ceilingStreak} }
  function saveIsolationState() { try { localStorage.setItem('gym-isolation-state', JSON.stringify(ISOLATION_STATE)); } catch(e){} }
  // Ladder rungs with a loaded/weighted (or band-resisted) variation get a pure REFERENCE value note
  // (item 8) — this never affects round success/failure or rung-advancement logic. It only exists to
  // make a plateau (ceiling hit twice at the same weight/band) impossible to miss.
  let REF_WEIGHT = {}; // { exId: {mode:'weight'|'band', weight, bandLevel, lastCeilingValue, ceilingStreak} }
  function saveRefWeight() { try { localStorage.setItem('gym-ref-weight', JSON.stringify(REF_WEIGHT)); } catch(e){} }
  // Shared by: the ladder reference-weight prompt (item 8, informational only) and isolation's
  // weight-only progression (item 9, actually drives advancement). Tracks whether the ceiling has now
  // been hit twice in a row at the SAME value — generic over "value" so it works identically whether
  // that value is a numeric weight (lb) or a band-level string ('light'/'medium'/'heavy'/'xheavy').
  // Resets the streak whenever the value changes or the ceiling isn't hit — a plateau only counts if
  // it's genuinely the same value both times.
  function trackCeilingStreak(store, exId, value, hitCeiling) {
    const s = store[exId] || {lastCeilingValue: null, ceilingStreak: 0};
    if (hitCeiling && value != null) {
      s.ceilingStreak = (s.lastCeilingValue === value) ? (s.ceilingStreak||0) + 1 : 1;
      s.lastCeilingValue = value;
    } else {
      s.ceilingStreak = 0;
    }
    store[exId] = s;
    return s;
  }
  // Weight/Band toggle — shared UI for any Home Workout "working weight" field that might instead be
  // a resistance band on a given day (equipment substitution is common at home). `st` is expected to
  // carry {mode:'weight'|'band', weight, bandLevel}; weight and bandLevel are kept independently so
  // switching modes back and forth doesn't lose whichever value isn't currently active.
  function defaultWeightOrBandMode(x) {
    const eq = x.eq || [];
    const hasLoadable = eq.some(e => ['dumbbell','barbell','kettlebell','trapbar','landmine','cable','machine'].includes(e));
    const hasBand = eq.includes('band');
    return (hasBand && !hasLoadable) ? 'band' : 'weight';
  }
  function formatWeightOrBand(mode, value) {
    if (value == null) return '';
    return mode === 'band' ? `${BAND_LEVEL_LABELS[value]} band` : `${value} lb`;
  }
  function buildWeightOrBandHtml(idPrefix, st, label) {
    const mode = st.mode;
    const modeToggle = `
      <div style="display:flex;gap:6px;margin-bottom:8px;">
        <div class="grr-chip${mode==='weight'?' active':''}" id="${idPrefix}-mode-weight" style="cursor:pointer;">Weight</div>
        <div class="grr-chip${mode==='band'?' active':''}" id="${idPrefix}-mode-band" style="cursor:pointer;">Band</div>
      </div>`;
    const valueHtml = mode === 'band' ? `
      <div class="grr-section-label" style="padding-left:0;">${label} — band level</div>
      <div class="grr-equip-row" id="${idPrefix}-band-row" style="padding:0 0 10px;">
        ${BAND_LEVELS.map(l => `<div class="grr-chip${st.bandLevel===l?' active':''}" data-level="${l}">${BAND_LEVEL_LABELS[l]}</div>`).join('')}
      </div>` : `
      <div class="grr-tm-box"><div><label>${label} (lb)</label></div><input type="number" id="${idPrefix}-weight" value="${st.weight||''}" placeholder="e.g. 20"/></div>`;
    return modeToggle + valueHtml;
  }
  function wireWeightOrBandInputs(idPrefix, st, onChange) {
    const wBtn = root.querySelector(`#${idPrefix}-mode-weight`);
    const bBtn = root.querySelector(`#${idPrefix}-mode-band`);
    if (wBtn) wBtn.onclick = () => { if (st.mode !== 'weight') { st.mode = 'weight'; onChange(st, true); } };
    if (bBtn) bBtn.onclick = () => { if (st.mode !== 'band') { st.mode = 'band'; onChange(st, true); } };
    const wInput = root.querySelector(`#${idPrefix}-weight`);
    if (wInput) wInput.onchange = (e) => { st.weight = parseFloat(e.target.value)||null; onChange(st, false); };
    root.querySelectorAll(`#${idPrefix}-band-row .grr-chip`).forEach(chip => {
      chip.onclick = () => { st.bandLevel = chip.dataset.level; onChange(st, false); };
    });
  }
  function currentRungId(ladderKey) {
    const ladder = LADDERS[ladderKey];
    const st = RUNG_STATE[ladderKey] || {rungIndex:0, streak:0};
    return ladder.rungs[Math.min(st.rungIndex, ladder.rungs.length-1)];
  }
  function renderMajorLiftLogger(container, dayKey, msgElId) {
    const majorDay = MAJOR_LIFT_DAYS[dayKey];
    const ex = EX_BY_ID[majorDay.lift];
    const P = CIRCUIT_PARAMS.majorLift;
    const mlState = MAJOR_LIFT_STATE[dayKey] || {sets: P.startSets, weight: null, streak: 0, lastAmrap: null, repTarget: P.repCeiling};
    if (!mlState.repTarget) mlState.repTarget = P.repCeiling; // back-compat for state saved before this field existed
    const ceiling = mlState.repTarget;
    let html = `<div class="grr-tm-box" style="margin-bottom:10px;"><div><label>Weight (lb, total incl. 20lb bar)</label><div style="font-size:11px;color:var(--muted);margin-top:2px;">Stage: ${mlState.sets} sets · target ${ceiling}, floor ${P.repFloor}</div></div><input type="number" id="grr-ml-weight" value="${mlState.weight||''}" placeholder="e.g. 70"/></div>`;
    for (let i=1;i<=mlState.sets;i++) {
      const isAmrap = i===mlState.sets;
      html += `<div class="grr-set-row"><div class="grr-set-row-top"><span>Set ${i}${isAmrap?' (AMRAP)':''}</span><span>${isAmrap?`beat last: ${mlState.lastAmrap??'—'}`:`target ${ceiling}`}</span></div><div class="grr-set-inputs"><input type="number" class="grr-ml-reps" data-i="${i}" placeholder="reps" style="width:70px;"/><span class="grr-unit">reps</span></div></div>`;
    }
    html += `<button class="grr-save-btn" id="grr-save-major">Save Major Lift</button><div class="grr-save-msg" id="${msgElId}"></div>`;
    container.innerHTML = html;
    container.querySelector('#grr-ml-weight').onchange = (e) => { mlState.weight = parseFloat(e.target.value)||null; MAJOR_LIFT_STATE[dayKey]=mlState; saveMajorLiftState(); };
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

        <div class="grr-collapse" id="grr-plate-collapse" style="margin:10px 0 14px;">
          <div class="grr-collapse-head">Plate Inventory & Pool ▾</div>
          <div class="grr-collapse-body" id="grr-plate-body" style="padding:0 0 12px;"></div>
        </div>

        <div class="grr-collapse${HOME.collapsed.major ? '' : ' open'}" id="grr-major-collapse" style="margin:10px 0 14px;">
          <div class="grr-collapse-head">
            <span>${majorDay.label}: ${EX_BY_ID[majorDay.lift] ? EX_BY_ID[majorDay.lift].n : majorDay.lift} ▾</span>
            <span id="grr-major-view-link" data-no-collapse="1" style="color:var(--steel);font-size:11px;font-weight:700;text-transform:none;letter-spacing:normal;cursor:pointer;">view exercise →</span>
          </div>
          <div class="grr-collapse-body" style="padding:0 0 12px;"><div id="grr-major-lift-block"></div></div>
        </div>

        <div class="grr-collapse${HOME.collapsed.superset ? '' : ' open'}" id="grr-superset-collapse-home" style="margin:10px 0 14px;">
          <div class="grr-collapse-head">Daily Superset ▾</div>
          <div class="grr-collapse-body" style="padding:0 0 12px;"><div id="grr-daily-superset-block"></div></div>
        </div>

        <div class="grr-collapse${HOME.collapsed.circuit ? '' : ' open'}" id="grr-circuit-collapse" style="margin:10px 0 14px;">
          <div class="grr-collapse-head">${circuitDay.label} ▾</div>
          <div class="grr-collapse-body" style="padding:0 0 12px;">
            <div style="font-size:11px;color:var(--muted);margin-bottom:10px;line-height:1.5;">${P.startSets} rounds each, tap to log each round as you go. Tap a round once you finish it: <b style="color:var(--steel);">Done</b> = completed the round but didn't hit the rep ceiling — still logs, doesn't count toward advancement. <b style="color:var(--brand);">Max!</b> = hit the rep ceiling — logs AND counts toward the "twice in a row" advancement streak.</div>
            <div id="grr-circuit-block"></div>
            <button class="grr-save-btn" id="grr-save-circuit">Save Circuit Session</button>
            <div class="grr-save-msg" id="grr-home-msg">${state.homeMsg||''}</div>
          </div>
        </div>
      </div>
    `;
    root.querySelector('#grr-back').onclick = () => { state.homeMsg = ''; state.view = 'list'; render(); };

    // Collapsible section wiring — click anywhere on a head toggles it, EXCEPT the Major Lift
    // section's nested "view exercise" link (marked data-no-collapse), which navigates instead.
    [['grr-major-collapse','major'], ['grr-superset-collapse-home','superset'], ['grr-circuit-collapse','circuit']].forEach(([id, key]) => {
      root.querySelector('#' + id + ' .grr-collapse-head').onclick = (e) => {
        if (e.target.closest('[data-no-collapse]')) return;
        HOME.collapsed[key] = !HOME.collapsed[key];
        saveHome();
        render();
      };
    });

    const majorRow = root.querySelector('#grr-major-day-row');
    ['A','B','C'].forEach(d => {
      const chip = document.createElement('div');
      chip.className = 'grr-chip' + (HOME.majorDay === d ? ' active' : '');
      chip.textContent = 'Day ' + d;
      chip.onclick = () => { HOME.majorDay = d; state.homeMsg = ''; saveHome(); render(); };
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
    root.querySelector('#grr-plate-collapse .grr-collapse-head').onclick = () => root.querySelector('#grr-plate-collapse').classList.toggle('open');

    // Major Lift — shared logger + clickable link to view the full exercise page
    renderMajorLiftLogger(root.querySelector('#grr-major-lift-block'), HOME.majorDay, 'grr-major-msg-inline');
    root.querySelector('#grr-major-view-link').onclick = (e) => {
      e.stopPropagation();
      state.cameFrom = {view:'home'}; state.homeMode = true; state.view = 'detail'; state.activeId = majorDay.lift; state.saveMsg=''; render();
    };

    // Daily superset — name area opens the exercise's own page (gif/notes/history); a separate
    // "Done" button ticks completion AND writes a real log entry for today (idempotent — toggling
    // back off removes today's entry rather than piling up duplicates).
    const dsBlock = root.querySelector('#grr-daily-superset-block');
    majorDay.dailySuperset.forEach(exId => {
      const ex = EX_BY_ID[exId];
      if (!ex) return;
      const done = CIRCUIT_TICKS[exId] === 2;
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:6px;';
      const nameSpan = document.createElement('div');
      nameSpan.style.cssText = 'flex:1;cursor:pointer;font-size:13px;font-weight:700;';
      nameSpan.textContent = ex.n;
      nameSpan.onclick = () => { state.cameFrom = {view:'home'}; state.view = 'detail'; state.activeId = exId; state.saveMsg = ''; render(); };
      const doneBtn = document.createElement('button');
      doneBtn.type = 'button';
      doneBtn.textContent = done ? '✓ Done' : 'Mark Done';
      doneBtn.style.cssText = `flex-shrink:0;border:none;border-radius:6px;padding:7px 12px;font-size:11.5px;font-weight:800;cursor:pointer;background:${done ? 'var(--green)' : 'var(--surface-2)'};color:${done ? '#111' : 'var(--chalk)'};`;
      doneBtn.onclick = () => {
        const today = todayLocal();
        if (done) {
          CIRCUIT_TICKS[exId] = 0;
          if (LOGS[exId]) LOGS[exId] = LOGS[exId].filter(e => !(e.date === today && e.tmAction === 'dailySuperset'));
        } else {
          CIRCUIT_TICKS[exId] = 2;
          const alreadyLoggedToday = (LOGS[exId] || []).some(e => e.date === today && e.tmAction === 'dailySuperset');
          if (!alreadyLoggedToday) {
            const entry = {date: today, exercise: ex.n, pattern: ex.p, exId, logId: newLogId(), sets:[{target:'Done', weight:null, reps:null, success:true}], allSuccess:true, tmAction:'dailySuperset'};
            if (!LOGS[exId]) LOGS[exId] = [];
            LOGS[exId].push(entry);
          }
        }
        saveCircuitTicks(); saveLogs(); render();
      };
      row.appendChild(nameSpan); row.appendChild(doneBtn);
      dsBlock.appendChild(row);
    });

    // Circuit block — one row per station, with a prev-rung button and one tick per round (P.startSets rounds)
    const circBlock = root.querySelector('#grr-circuit-block');
    circuitDay.stations.forEach(station => {
      const isLadder = !!station.ladder;
      const exIds = isLadder ? [currentRungId(station.ladder)] : station.exercises;
      exIds.forEach(exId => {
        const ex = EX_BY_ID[exId];
        if (!ex) return;
        const stationP = isLadder ? ladderParamsFor(station.ladder) : CIRCUIT_PARAMS.isolation;
        const ticks = CIRCUIT_TICKS[exId] || [];
        const row = document.createElement('div');
        row.style.cssText = 'padding:10px;margin-bottom:6px;border-radius:6px;background:var(--surface);border:1px solid var(--line);';
        const topRow = document.createElement('div');
        topRow.style.cssText = 'display:flex;align-items:center;gap:8px;';
        const nameSpan = document.createElement('div');
        nameSpan.style.cssText = 'flex:1;cursor:pointer;';
        const rungLabel = isLadder ? ` · rung ${LADDERS[station.ladder].rungs.indexOf(exId)+1}/${LADDERS[station.ladder].rungs.length}` : '';
        nameSpan.innerHTML = `<div style="font-weight:700;font-size:13px;">${station.pattern}</div><div style="font-size:11.5px;color:var(--muted);">${ex.n}${rungLabel} · target ${stationP.repCeiling}, floor ${stationP.repFloor}</div>`;
        nameSpan.onclick = () => { state.cameFrom = {view:'home'}; state.homeMode = true; state.view = 'detail'; state.activeId = exId; state.saveMsg=''; render(); };
        topRow.appendChild(nameSpan);
        if (isLadder) {
          const st = RUNG_STATE[station.ladder] || {rungIndex:0, streak:0};
          if (st.rungIndex > 0) {
            const prevBtn = document.createElement('button');
            prevBtn.type = 'button'; prevBtn.textContent = '◀ prev rung';
            prevBtn.style.cssText = 'background:var(--bg);border:1px solid var(--line);color:var(--muted);font-size:10px;font-weight:700;padding:5px 8px;border-radius:4px;cursor:pointer;flex-shrink:0;';
            prevBtn.onclick = () => { st.rungIndex -= 1; st.streak = 0; RUNG_STATE[station.ladder] = st; saveRungState(); render(); };
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
          const exId = station.exercises[0];
          const ticks = CIRCUIT_TICKS[exId] || [];
          if (ticks.some(t => t > 0) && EX_BY_ID[exId]) { logCircuitSet(exId, ticks, CIRCUIT_PARAMS.isolation.startSets); anySaved = true; }
          return;
        }
        const exId = currentRungId(station.ladder);
        const ticks = CIRCUIT_TICKS[exId] || [];
        if (!ticks.some(t => t > 0)) return;
        const stationP = ladderParamsFor(station.ladder);
        const allSuccess = logCircuitSet(exId, ticks, stationP.startSets);
        anySaved = true;
        const st = RUNG_STATE[station.ladder] || {rungIndex:0, streak:0};
        const ladder = LADDERS[station.ladder];
        if (allSuccess) {
          st.streak = (st.streak||0) + 1;
          if (st.streak >= 2) {
            if (st.rungIndex < ladder.rungs.length - 1) { st.rungIndex++; st.streak = 0; }
            else { st.streak = 0; topOfLadderNotes.push(`${ladder.label} has hit its ceiling twice at the top rung — no harder variation defined yet. Might be time to add one.`); }
          }
        } else {
          st.streak = 0;
        }
        RUNG_STATE[station.ladder] = st;
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
      const P = ladderParamsFor(ladderInfo.key);
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
      // Reference weight/band (item 8) — only shown for rungs with a loaded or band-resisted
      // variation. Purely informational: never affects round success/failure or rung-advancement,
      // just flags a plateau.
      const showRef = !isBodyweightOnly(x);
      const refState = REF_WEIGHT[x.id] || {mode: defaultWeightOrBandMode(x), weight: null, bandLevel: null, lastCeilingValue: null, ceilingStreak: 0};
      const refCurrentValue = refState.mode === 'band' ? refState.bandLevel : refState.weight;
      const refWeightHtml = showRef ? `
        ${buildWeightOrBandHtml('grr-hd-ref', refState, 'Working weight (reference only)')}
        <div style="font-size:11px;color:var(--muted);margin:-6px 0 10px;">Doesn't affect success or rung advancement — just here so a plateau is easy to spot.</div>
        ${refState.ceilingStreak >= 2 ? `<div style="background:var(--surface);border:1px solid var(--brand);border-radius:6px;padding:8px 10px;margin-bottom:10px;font-size:12.5px;color:var(--brand);font-weight:700;">Hit the ceiling twice at ${formatWeightOrBand(refState.mode, refState.lastCeilingValue)} — consider ${refState.mode==='band'?'moving up a band level':'increasing the weight'}.</div>` : ''}
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
          ${refWeightHtml}
          <div id="grr-hd-sets">${setsHtml}</div>
          <button class="grr-save-btn" id="grr-hd-save">Save Round(s)</button>
          <div class="grr-save-msg" id="grr-hd-msg"></div>
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
      if (showRef) {
        wireWeightOrBandInputs('grr-hd-ref', refState, (updatedState, modeSwitched) => {
          if (modeSwitched) { updatedState.ceilingStreak = 0; updatedState.lastCeilingValue = null; }
          REF_WEIGHT[x.id] = updatedState;
          saveRefWeight();
          if (modeSwitched) render(); // mode switch changes which input renders — full re-render needed
        });
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
        if (showRef) {
          const updatedRef = trackCeilingStreak(REF_WEIGHT, x.id, refCurrentValue, allHit);
          updatedRef.mode = refState.mode; updatedRef.weight = refState.weight; updatedRef.bandLevel = refState.bandLevel;
          REF_WEIGHT[x.id] = updatedRef;
          saveRefWeight();
          if (updatedRef.ceilingStreak >= 2) msg += ` Also: hit the ceiling twice at ${formatWeightOrBand(refState.mode, updatedRef.lastCeilingValue)} — consider ${refState.mode==='band'?'moving up a band level':'increasing the weight'}.`;
        }
        root.querySelector('#grr-hd-msg').textContent = msg;
        render();
      };
      return;
    }

    if (isIsolation) {
      const P = CIRCUIT_PARAMS.isolation;
      const iState = ISOLATION_STATE[x.id] || {mode: defaultWeightOrBandMode(x), weight: null, bandLevel: null, lastCeilingValue: null, ceilingStreak: 0};
      const iCurrentValue = iState.mode === 'band' ? iState.bandLevel : iState.weight;
      const hist = (LOGS[x.id] || []).slice(-5).reverse();
      const histHtml = hist.length ? hist.map(l => `<div class="grr-history-row"><span>${friendlyDate(l.date)}</span><span>${l.sets.map(s=>s.success?'✅':'❌').join('')}</span></div>`).join('') : `<div style="color:var(--muted);font-size:12px;">No sessions logged yet.</div>`;
      let setsHtml = '';
      for (let i=1; i<=P.startSets; i++) {
        setsHtml += `<div class="grr-set-row"><div class="grr-set-row-top"><span>Round ${i}</span><span>target ${P.repCeiling}, floor ${P.repFloor}</span></div><div class="grr-set-inputs"><input type="number" class="grr-hd-reps" data-i="${i}" placeholder="reps" style="width:70px;"/><span class="grr-unit">reps</span></div></div>`;
      }
      const plateauMsg = iState.mode === 'band'
        ? `Hit the ceiling twice at ${BAND_LEVEL_LABELS[iState.lastCeilingValue]} band — band level will step up on next save (or you'll be prompted to switch to real weight once you're already at Extra-Heavy).`
        : `Hit the ceiling twice at ${iState.lastCeilingValue} lb — weight will bump on next save (or the rep target rises if no plates are available).`;
      root.innerHTML = `
        <div class="grr-detail">
          ${backButtonHtml()}
          <div class="grr-detail-name">${x.n}</div>
          <div class="grr-detail-meta">${x.p} · ${x.m} · Isolation — ${P.startSets} rounds, weight/band is the only progression axis</div>
          ${gifBlock(x)}
          ${x.notes ? `<div class="grr-notes">${x.notes}</div>` : ''}
          ${buildWeightOrBandHtml('grr-hd-iso', iState, 'Working weight')}
          ${iState.ceilingStreak >= 2 ? `<div style="background:var(--surface);border:1px solid var(--brand);border-radius:6px;padding:8px 10px;margin-bottom:10px;font-size:12.5px;color:var(--brand);font-weight:700;">${plateauMsg}</div>` : ''}
          <div id="grr-hd-sets">${setsHtml}</div>
          <button class="grr-save-btn" id="grr-hd-save">Save</button>
          <div class="grr-save-msg" id="grr-hd-msg"></div>
          <div class="grr-section-label" style="padding-left:0;">Recent history</div>
          <div class="grr-history">${histHtml}</div>
        </div>
      `;
      wireBackButtons();
      wireWeightOrBandInputs('grr-hd-iso', iState, (updatedState, modeSwitched) => {
        if (modeSwitched) { updatedState.ceilingStreak = 0; updatedState.lastCeilingValue = null; }
        ISOLATION_STATE[x.id] = updatedState;
        saveIsolationState();
        if (modeSwitched) render();
      });
      root.querySelector('#grr-hd-save').onclick = () => {
        const reps = [...root.querySelectorAll('.grr-hd-reps')].map(inp => parseInt(inp.value,10)||0);
        if (reps.some(r=>r<=0)) { root.querySelector('#grr-hd-msg').textContent = 'Enter reps for every round first.'; return; }
        const allHit = reps.every(r => r >= P.repCeiling);
        const updated = trackCeilingStreak(ISOLATION_STATE, x.id, iCurrentValue, allHit);
        updated.mode = iState.mode; updated.weight = iState.weight; updated.bandLevel = iState.bandLevel;
        let msg;
        let bumped = false;
        if (allHit) {
          if (updated.ceilingStreak >= 2) {
            if (updated.mode === 'band') {
              const idx = BAND_LEVELS.indexOf(updated.bandLevel);
              if (idx >= 0 && idx < BAND_LEVELS.length - 1) {
                updated.bandLevel = BAND_LEVELS[idx + 1];
                updated.ceilingStreak = 0; updated.lastCeilingValue = null;
                bumped = true;
                msg = `Hit ${P.repCeiling} on every round, twice in a row at the same band — stepped up to ${BAND_LEVEL_LABELS[updated.bandLevel]}.`;
              } else {
                msg = `Hit ${P.repCeiling} on every round, twice in a row at Extra-Heavy band — that's the top of the band scale, consider switching to actual weight.`;
              }
            } else {
              const jump = smallestPlateJump();
              if (jump > 0) {
                updated.weight = (updated.weight||0) + jump;
                updated.ceilingStreak = 0; updated.lastCeilingValue = null;
                bumped = true;
                msg = `Hit ${P.repCeiling} on every round, twice in a row at the same weight — bumped to ${updated.weight} lb.`;
              } else {
                msg = `Hit ${P.repCeiling} on every round, twice in a row at ${updated.lastCeilingValue} lb — no plates available to add, so bump it manually next chance you get.`;
              }
            }
          } else {
            msg = `All rounds hit ${P.repCeiling} — one more session at this same ${updated.mode === 'band' ? 'band' : 'weight'} and it'll bump.`;
          }
        } else {
          msg = 'Saved — not every round hit the ceiling, no change.';
        }
        ISOLATION_STATE[x.id] = updated; saveIsolationState();
        const entry = {date: todayLocal(), exercise: x.n, pattern: x.p, exId: x.id, logId: newLogId(),
          sets: reps.map((r,i)=>({target:'Round '+(i+1), weight: iState.mode==='band'?null:iState.weight, reps:r, success: r>=P.repCeiling})), allSuccess: allHit, tmAction: bumped?'increase':'none'};
        if (!LOGS[x.id]) LOGS[x.id] = [];
        LOGS[x.id].push(entry); saveLogs();
        root.querySelector('#grr-hd-msg').textContent = msg;
        render();
      };
      return;
    }

    // Fallback — shouldn't normally hit this, but keeps the app from breaking on an unrecognized circuit exercise
    root.innerHTML = `<div class="grr-detail">${backButtonHtml()}<div class="grr-detail-name">${x.n}</div><div class="grr-empty">This exercise isn't linked into a Home Workout day yet.</div></div>`;
    wireBackButtons();
  }
