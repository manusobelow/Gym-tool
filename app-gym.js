// app-gym.js — main gym exercise list + exercise detail rendering (non-Home-Workout).
// Depends on app-core.js having already run (root, state, EX_BY_ID, effectiveScheme,
// buildSchemePickerHtml/wireSchemePicker, gifBlock, backButtonHtml/wireBackButtons, save*(), etc).

  function targetsFor(x, tierState, hypState) {
    const scheme = effectiveScheme(x);
    const rep = REP_OVERRIDE[x.id] || {};
    if (scheme === 'main') {
      const lastPct = (tierState === '85') ? 0.85 : 0.80;
      const wr = rep.workingReps || 6;
      return [
        {label:'Warm-up', pct:0.50, reps:5},
        {label:'Set 1', pct:0.85, reps:wr},
        {label:'Set 2', pct:0.85, reps:wr},
        {label:'Set 3 (test set)', pct:lastPct, reps:wr, isTestSet:true},
      ];
    }
    if (scheme === 'strength') {
      const wr = rep.workingReps || 7;
      return [
        {label:'Warm-up', pct:0.50, reps:5},
        {label:'Set 1', pct:0.85, reps:wr},
        {label:'Set 2 (test set)', pct:0.85, reps:wr, isTestSet:true},
      ];
    }
    // hypertrophy
    const lo = rep.hypLow || 8;
    const hi = rep.hypHigh || 10;
    const tierKey = (hypState && hypState.tier) || 'low';
    const tierReps = tierKey === 'high' ? hi : lo;
    const w = (hypState && hypState.weight) || null;
    return [
      {label:'Set 1 (to failure)', reps:tierReps, fixedWeight:w, isMainHypSet:true},
      {label:'Set 2 (to failure)', reps:tierReps, fixedWeight:w, isMainHypSet:true},
      {label:'Set 3 — drop weight (to failure)', reps:hi, fixedWeight: w ? roundW(w*0.85) : null},
    ];
  }
  function supersetSuggestions(x) {
    if (effectiveScheme(x) === 'main') return {note:"Major lifts are best done alone — don't superset these.", list:[]};
    const myMuscles = new Set(x.muscles.map(m => m.id));
    const list = EX.filter(o =>
      o.id !== x.id &&
      effectiveScheme(o) !== 'main' &&
      effectiveScheme(o) !== 'circuit' &&
      o.eq.some(e => state.equip.has(e)) &&
      !o.muscles.some(m => myMuscles.has(m.id))
    );
    return {note: null, list};
  }
  function buildCard(x, cameFrom) {
    const card = document.createElement('div');
    const scheme = effectiveScheme(x);
    card.className = 'grr-card ' + scheme;
    const schemeLabel = {main:'Major Lift', strength:'Strength', hypertrophy:'Hypertrophy', mobility:'Mobility', circuit:'Home Circuit'}[scheme];
    const badgeClass = scheme === 'main' ? 'main' : scheme === 'mobility' ? 'mobility' : '';
    const tmLine = (scheme !== 'hypertrophy' && scheme !== 'mobility' && TM[x.id]) ? `<div class="grr-card-tm">1RM: ${TM[x.id]} lb</div>` : '';
    card.innerHTML = `
      <div class="grr-card-top">
        <div class="grr-card-name">${x.n}</div>
        <div class="grr-badge ${badgeClass}">${schemeLabel}</div>
      </div>
      <div class="grr-card-meta">${x.m}</div>
      ${tmLine}
    `;
    card.onclick = () => { state.cameFrom = cameFrom || null; state.view = 'detail'; state.activeId = x.id; state.saveMsg=''; render(); };
    return card;
  }
  function renderList() {
    const pats = activePatterns();
    root.innerHTML = `
      <div class="grr-header">
        <div class="grr-title">GYM <span class="grr-title-accent">REFERENCE</span></div>
        <div style="display:flex;gap:6px;">
          <button class="grr-navbtn" id="grr-goto-muscles">Muscle Map</button>
          <button class="grr-navbtn" id="grr-goto-home">Home Workout</button>
          <button class="grr-navbtn" id="grr-goto-history">Log / Export</button>
        </div>
      </div>
      <div class="grr-section-label">Equipment here today</div>
      <div class="grr-equip-row" id="grr-equip-row">
        <div class="grr-chip grr-chip-all" data-all="1">ALL</div>
        <div class="grr-chip grr-chip-all" data-none="1">NONE</div>
      </div>
      <div class="grr-section-label">Movement pattern</div>
      <div class="grr-equip-row" id="grr-pattern-row">
        <div class="grr-chip grr-chip-all" data-pall="1">ALL</div>
        <div class="grr-chip grr-chip-all" data-pnone="1">NONE</div>
      </div>
      <div class="grr-list" id="grr-list"></div>
      <div class="grr-collapse" id="grr-superset">
        <div class="grr-collapse-head">Superset pairing guide ▾</div>
        <div class="grr-collapse-body">
          <b>Only Major Lifts are off-limits for supersetting</b> — everything else is fair game as long as the two exercises don't share a targeted muscle. Antagonist or unrelated pairs both work fine, e.g. Chin-Ups + Cossack Squat is fine (no overlap); Chin-Ups + Bicep Curl is not (both hit biceps).<br/><br/>
          <b>Good pairing examples:</b><br/>
          <div class="grr-row-pair"><span>Horizontal Push</span><span>↔ Horizontal Pull</span></div>
          <div class="grr-row-pair"><span>Vertical Push</span><span>↔ Vertical Pull</span></div>
          <div class="grr-row-pair"><span>DB / EZ Curl</span><span>↔ Triceps Pushdown</span></div>
          <div class="grr-row-pair"><span>Face Pull</span><span>↔ Pallof Press</span></div>
          <br/>Each exercise page shows live "Goes well with" suggestions computed from this exact rule, filtered to your current equipment.
        </div>
      </div>
      <div class="grr-collapse" id="grr-template">
        <div class="grr-collapse-head">Workout A / B template ▾</div>
        <div class="grr-collapse-body">
          <b>Workout A</b> — Squat + Horizontal Push + Vertical Pull + Core<br/>
          <b>Workout B</b> — Hinge/Lunge + Horizontal Pull + Vertical Push + Core<br/><br/>
          Alternate A/B each session. Don't stack both vertical push and vertical pull in one workout.
        </div>
      </div>
      <div class="grr-collapse" id="grr-scheme">
        <div class="grr-collapse-head">Scheme reference ▾</div>
        <div class="grr-collapse-body">
          <b>Strength — 2–3 min rest.</b> Warm-up 5@50%, Set 1 6@85%, Set 2 6@85%. Major lifts add a 3rd (test) set: starts at 80%, moves to 85% next session once hit. Hit the test set at 85% → your 1RM goes up (+5 lb lower body, +2.5 lb upper body), test set resets to 80%.<br/><br/>
          <b>Major lifts:</b> Squat, Deadlift, BB Bench Press / JM Press, BB Overhead Press, Weighted Pull-up, Barbell Row, Hip Thrust, Lunge Carries.<br/><br/>
          <b>Hypertrophy — 1 min rest, drop set.</b> Sets 1–2 to failure, target starts at 8 reps. Set 3 drops the weight, targets 10 reps to failure. Hit sets 1–2 at 8 → next session the target becomes 10 at the same weight. Hit 10 → add weight, target resets to 8.<br/><br/>
          <b>Mobility/Warm-up.</b> No weight tracked — just marked done for the day.
        </div>
      </div>
    `;

    const eqRow = root.querySelector('#grr-equip-row');
    EQUIP.forEach(e => {
      const chip = document.createElement('div');
      chip.className = 'grr-chip' + (state.equip.has(e) ? ' active' : '');
      chip.textContent = EQUIP_LABEL[e];
      chip.onclick = () => toggleEquip(e);
      eqRow.appendChild(chip);
    });
    eqRow.querySelector('[data-all]').onclick = () => setAllEquip(true);
    eqRow.querySelector('[data-none]').onclick = () => setAllEquip(false);

    const patRow = root.querySelector('#grr-pattern-row');
    PATTERNS.forEach(p => {
      const chip = document.createElement('div');
      chip.className = 'grr-chip' + (state.pattern.has(p) ? ' active' : '');
      chip.textContent = p;
      chip.onclick = () => togglePattern(p);
      patRow.appendChild(chip);
    });
    patRow.querySelector('[data-pall]').onclick = () => setAllPatterns(true);
    patRow.querySelector('[data-pnone]').onclick = () => setAllPatterns(false);

    const list = root.querySelector('#grr-list');
    list.innerHTML = '';
    let anyShown = false;
    PATTERNS.filter(p => pats.has(p)).forEach(p => {
      const group = EX.filter(x => x.p === p && x.scheme !== 'circuit' && x.eq.some(e => state.equip.has(e)));
      if (!group.length) return;
      anyShown = true;
      group.sort((a,b) => (effectiveScheme(a) === effectiveScheme(b) ? 0 : effectiveScheme(a) === 'main' ? -1 : 1));
      const header = document.createElement('div');
      header.className = 'grr-section-label';
      header.style.padding = '10px 0 4px';
      header.textContent = p;
      list.appendChild(header);
      group.forEach(x => list.appendChild(buildCard(x)));
    });
    if (!anyShown) list.innerHTML = `<div class="grr-empty">No matches with the equipment selected.</div>`;

    ['grr-superset','grr-template','grr-scheme'].forEach(id => {
      const el = root.querySelector('#' + id);
      el.querySelector('.grr-collapse-head').onclick = () => el.classList.toggle('open');
    });
    root.querySelector('#grr-goto-history').onclick = () => { state.view = 'log'; render(); };
    root.querySelector('#grr-goto-muscles').onclick = () => { state.view = 'muscles'; render(); };
    root.querySelector('#grr-goto-home').onclick = () => { state.view = 'home'; render(); };
  }
  function renderMobilityDetail(x) {
    const hist = (LOGS[x.id] || []).slice(-6).reverse();
    const histHtml = hist.length ? hist.map(l => `<div class="grr-history-row"><span>${friendlyDate(l.date)}</span><span>✅ Done</span></div>`).join('')
      : `<div style="color:var(--muted);font-size:12px;">Not logged yet.</div>`;

    root.innerHTML = `
      <div class="grr-detail">
        ${backButtonHtml()}
        <div class="grr-detail-name">${x.n}</div>
        <div class="grr-detail-meta">${x.p} · ${x.m}</div>
        ${gifBlock(x)}
        ${x.notes ? `<div class="grr-notes">${x.notes}</div>` : ''}
        ${buildSchemePickerHtml(x, 'mobility')}
        <button class="grr-save-btn" id="grr-save">Mark Done Today</button>
        <div class="grr-save-msg">${state.saveMsg}</div>
        <div class="grr-section-label" style="padding-left:0;">Recent history</div>
        <div class="grr-history">${histHtml}</div>
      </div>
    `;
    wireBackButtons();
    wireSchemePicker(x);
    root.querySelector('#grr-save').onclick = () => {
      const entry = {date: todayLocal(), exercise: x.n, pattern: x.p, exId: x.id, logId: newLogId(), sets:[{target:'Done', weight:null, reps:null, success:true}], allSuccess:true, tmAction:'none'};
      if (!LOGS[x.id]) LOGS[x.id] = [];
      LOGS[x.id].push(entry);
      saveLogs();
      state.saveMsg = 'Marked done for today.';
      render();
    };
  }
  function renderDetail() {
    const x = EX_BY_ID[state.activeId];
    const scheme = effectiveScheme(x);
    // Circuit-scheme exercises ALWAYS use the Home Workout rendering, no matter how you reached them —
    // not just when arriving via the Home Workout page's own click handlers. Closes the leak where
    // Muscle Map / superset suggestions could surface one and render it with the wrong scheme entirely.
    if (scheme === 'circuit' || (state.homeMode && (findMajorLiftDay(x.id) || isIsolationStationExercise(x.id)))) { renderHomeDetail(x); return; }
    if (scheme === 'mobility') { renderMobilityDetail(x); return; }

    const tm = TM[x.id] || null;
    const tierState = TIER[x.id] || '80';
    const hypState = HYP[x.id] || {weight: null, tier: 'low'};
    const targets = targetsFor(x, tierState, hypState);
    const ss = supersetSuggestions(x);
    const hist = (LOGS[x.id] || []).slice(-5).reverse();

    const draft = DRAFTS[x.id] || {};
    const rep = REP_OVERRIDE[x.id] || {};
    let setsHtml = targets.map((t,i) => {
      let weightGuess = '';
      if (t.pct) weightGuess = tm ? roundW(tm * t.pct) : '';
      if (t.fixedWeight !== undefined) weightGuess = t.fixedWeight || '';
      const pctLabel = t.pct ? Math.round(t.pct*100)+'% · ' : '';
      const d = draft[i] || {};
      const isBW = d.weight === 'BW';
      const weightVal = isBW ? '' : (d.weight !== undefined ? d.weight : weightGuess);
      const repsVal = d.reps !== undefined ? d.reps : (typeof t.reps === 'number' ? t.reps : '');
      const successVal = d.success; // true, false, or undefined
      return `
        <div class="grr-set-row" data-i="${i}">
          <div class="grr-set-row-top"><span>${t.label}</span><span>${pctLabel}${t.reps} reps</span></div>
          <div class="grr-set-inputs">
            <input type="number" class="grr-weight-input" placeholder="lb" value="${weightVal}" ${isBW ? 'disabled' : ''}/>
            <span class="grr-unit">lb</span>
            <button type="button" class="grr-bw-btn${isBW ? ' active' : ''}" data-i="${i}">BW</button>
            <input type="number" class="grr-reps-input" placeholder="reps" value="${repsVal}"/>
            <span class="grr-unit">reps</span>
            <div class="grr-toggle">
              <button class="grr-yes${successVal===true?' on-yes':''}" data-i="${i}">✓</button>
              <button class="grr-no${successVal===false?' on-no':''}" data-i="${i}">✗</button>
            </div>
          </div>
        </div>`;
    }).join('');

    let ssHtml = '';
    if (ss.note) ssHtml = `<div class="grr-collapse-body" style="display:block;padding:0;color:var(--muted)">${ss.note}</div>`;
    else if (ss.list.length) ssHtml = ss.list.map(o => `<span class="grr-superset-chip" data-id="${o.id}">${o.n}</span>`).join('');
    else ssHtml = `<div style="color:var(--muted);font-size:12px;">No matching partner exercise with current equipment.</div>`;

    let histHtml = hist.length ? hist.map(l => `
      <div class="grr-history-row"><span>${friendlyDate(l.date)}</span><span>${l.sets.map(s=>s.success?'✅':'❌').join('')} ${l.tmAction==='increase'?'⬆️':''}</span></div>
    `).join('') : `<div style="color:var(--muted);font-size:12px;">No sessions logged yet.</div>`;

    const schemeLabels = {main:'Major Lift', strength:'Strength', hypertrophy:'Hypertrophy', mobility:'Mobility', circuit:'Home Circuit'};
    const schemePickerHtml = buildSchemePickerHtml(x, scheme);

    const repOverrideHtml = scheme === 'hypertrophy' ? `
      <div class="grr-tm-box">
        <div><label>Rep Range</label><div style="font-size:11px;color:var(--muted);margin-top:2px;">Low → High before weight increases</div></div>
        <div style="display:flex;gap:6px;align-items:center;">
          <input type="number" id="grr-rep-lo" value="${rep.hypLow || 8}" style="width:50px;background:var(--bg);border:1px solid var(--line);color:var(--chalk);padding:6px;border-radius:4px;text-align:center;font-size:15px;"/>
          <span style="color:var(--muted);">–</span>
          <input type="number" id="grr-rep-hi" value="${rep.hypHigh || 10}" style="width:50px;background:var(--bg);border:1px solid var(--line);color:var(--chalk);padding:6px;border-radius:4px;text-align:center;font-size:15px;"/>
        </div>
      </div>` : `
      <div class="grr-tm-box">
        <div><label>Reps per set</label></div>
        <input type="number" id="grr-rep-working" value="${rep.workingReps || (scheme==='main'?6:7)}" style="width:60px;"/>
      </div>`;

    root.innerHTML = `
      <div class="grr-detail">
        ${backButtonHtml()}
        <div class="grr-detail-name">${x.n}</div>
        <div class="grr-detail-meta">${x.p} · ${x.m}</div>
        ${gifBlock(x)}
        ${x.notes ? `<div class="grr-notes">${x.notes}</div>` : ''}

        ${schemePickerHtml}

        <div class="grr-tm-box" style="flex-wrap:wrap;">
          <div>
            <label>1RM</label>
            <div style="font-size:11px;color:var(--muted);margin-top:2px;">${scheme==='main' ? `Test set currently at ${tierState}%` : scheme==='strength' ? 'Rest 2–3 min between sets' : 'Reference number — not used while in Hypertrophy mode'}</div>
          </div>
          <input type="number" id="grr-tm-input" value="${tm || ''}" placeholder="e.g. 135"/>
        </div>
        <div style="display:flex;gap:6px;align-items:center;font-size:11px;color:var(--muted);margin:-8px 0 14px;padding:0 2px;">
          <span>or calculate from a set:</span>
          <input type="number" id="grr-calc-weight" placeholder="lb" style="width:52px;background:var(--surface);border:1px solid var(--line);color:var(--chalk);padding:5px;border-radius:4px;text-align:center;"/>
          <span>×</span>
          <input type="number" id="grr-calc-reps" placeholder="reps" style="width:48px;background:var(--surface);border:1px solid var(--line);color:var(--chalk);padding:5px;border-radius:4px;text-align:center;"/>
          <button type="button" id="grr-calc-btn" style="background:var(--steel);color:#fff;border:none;font-size:11px;font-weight:700;padding:6px 10px;border-radius:4px;cursor:pointer;">Calculate</button>
        </div>

        <div class="grr-tm-box">
          <div>
            <label>Working Weight</label>
            <div style="font-size:11px;color:var(--muted);margin-top:2px;">${scheme==='hypertrophy' ? `Rep target currently ${hypState.tier === 'high' ? (rep.hypHigh||10) : (rep.hypLow||8)} reps · rest 1 min` : 'Used only while in Hypertrophy mode'}</div>
          </div>
          <input type="number" id="grr-hyp-weight-input" value="${hypState.weight || ''}" placeholder="e.g. 40"/>
        </div>

        ${repOverrideHtml}

        <div id="grr-sets">${setsHtml}</div>
        <button class="grr-save-btn" id="grr-save">Save Today's Log</button>
        <div class="grr-save-msg">${state.saveMsg}</div>

        <div class="grr-collapse" id="grr-superset-collapse" style="margin:10px 0 14px;">
          <div class="grr-collapse-head">Goes well with ▾</div>
          <div class="grr-collapse-body" style="padding:0 0 12px;">
            <div class="grr-superset-box">${ssHtml}</div>
          </div>
        </div>

        <div class="grr-section-label" style="padding-left:0;">Recent history</div>
        <div class="grr-history">${histHtml}</div>
      </div>
    `;

    wireBackButtons();
    root.querySelector('#grr-superset-collapse .grr-collapse-head').onclick = () => {
      root.querySelector('#grr-superset-collapse').classList.toggle('open');
    };
    root.querySelectorAll('.grr-superset-chip').forEach(chip => {
      chip.onclick = () => { state.cameFrom = {view:'detail', activeId: x.id}; state.view = 'detail'; state.activeId = chip.dataset.id; state.saveMsg = ''; render(); };
    });

    wireSchemePicker(x);

    root.querySelector('#grr-tm-input').onchange = (e) => {
      const v = parseFloat(e.target.value);
      if (!isNaN(v) && v > 0) { TM[x.id] = v; saveTM(); render(); }
    };
    root.querySelector('#grr-hyp-weight-input').onchange = (e) => {
      const v = parseFloat(e.target.value);
      if (!isNaN(v) && v > 0) { HYP[x.id] = {weight: v, tier: hypState.tier}; saveHyp(); render(); }
    };
    root.querySelector('#grr-calc-btn').onclick = () => {
      const w = parseFloat(document.getElementById('grr-calc-weight').value);
      const r = parseFloat(document.getElementById('grr-calc-reps').value);
      if (w > 0 && r > 0) {
        const est = roundW(w * (1 + r/30)); // Epley formula estimate
        TM[x.id] = est; saveTM(); render();
      }
    };

    if (scheme === 'hypertrophy') {
      const lo = document.getElementById('grr-rep-lo'), hi = document.getElementById('grr-rep-hi');
      lo.onchange = () => { const v = parseInt(lo.value,10); if (v>0) { if (!REP_OVERRIDE[x.id]) REP_OVERRIDE[x.id]={}; REP_OVERRIDE[x.id].hypLow = v; saveRepOverride(); render(); } };
      hi.onchange = () => { const v = parseInt(hi.value,10); if (v>0) { if (!REP_OVERRIDE[x.id]) REP_OVERRIDE[x.id]={}; REP_OVERRIDE[x.id].hypHigh = v; saveRepOverride(); render(); } };
    } else {
      const wr = document.getElementById('grr-rep-working');
      wr.onchange = () => { const v = parseInt(wr.value,10); if (v>0) { if (!REP_OVERRIDE[x.id]) REP_OVERRIDE[x.id]={}; REP_OVERRIDE[x.id].workingReps = v; saveRepOverride(); render(); } };
    }

    root.querySelectorAll('.grr-weight-input').forEach((inp, i) => {
      inp.oninput = () => updateDraft(x.id, i, 'weight', inp.value);
    });
    root.querySelectorAll('.grr-reps-input').forEach((inp, i) => {
      inp.oninput = () => updateDraft(x.id, i, 'reps', inp.value);
    });
    root.querySelectorAll('.grr-bw-btn').forEach(btn => {
      btn.onclick = () => {
        const i = parseInt(btn.dataset.i, 10);
        const wInput = root.querySelector(`.grr-set-row[data-i="${i}"] .grr-weight-input`);
        const nowBW = !btn.classList.contains('active');
        if (nowBW) { wInput.value = ''; wInput.disabled = true; updateDraft(x.id, i, 'weight', 'BW'); }
        else { wInput.disabled = false; updateDraft(x.id, i, 'weight', ''); }
        btn.classList.toggle('active', nowBW);
      };
    });
    root.querySelectorAll('.grr-yes').forEach(b => b.onclick = () => {
      b.classList.add('on-yes'); b.parentElement.querySelector('.grr-no').classList.remove('on-no');
      updateDraft(x.id, parseInt(b.dataset.i, 10), 'success', true);
    });
    root.querySelectorAll('.grr-no').forEach(b => b.onclick = () => {
      b.classList.add('on-no'); b.parentElement.querySelector('.grr-yes').classList.remove('on-yes');
      updateDraft(x.id, parseInt(b.dataset.i, 10), 'success', false);
    });

    root.querySelector('#grr-save').onclick = () => {
      const rows = root.querySelectorAll('.grr-set-row');
      const sets = [];
      rows.forEach((row, i) => {
        const wInput = row.querySelector('.grr-weight-input');
        const w = wInput.disabled ? 'BW' : (parseFloat(wInput.value) || null);
        const r = parseFloat(row.querySelector('.grr-reps-input').value) || null;
        const success = row.querySelector('.grr-yes').classList.contains('on-yes');
        sets.push({target: targets[i].label, weight: w, reps: r, success});
      });
      let msg = 'Saved.';
      const workingIdxs = targets.map((t,i)=>i).filter(i => targets[i].label !== 'Warm-up');
      const allWorkingOK = workingIdxs.length && workingIdxs.every(i => sets[i] && sets[i].success);

      if (scheme === 'main' && tm) {
        if (allWorkingOK) {
          if (tierState === '80') {
            TIER[x.id] = '85'; saveTier();
            msg = 'Saved. All working sets hit at 80% — next session the test set moves to 85%.';
          } else {
            const inc = x.region === 'lower' ? 5 : 2.5;
            TM[x.id] = tm + inc; TIER[x.id] = '80';
            saveTM(); saveTier();
            msg = `Saved. All working sets hit at 85% — 1RM bumped to ${TM[x.id]} lb, test set resets to 80%.`;
          }
        } else {
          msg = 'Saved. Not all working sets hit — no change. If the earlier sets failed but the last one succeeded, that likely means the weight was too high, not that it should go up.';
        }
      } else if (scheme === 'strength' && tm) {
        if (allWorkingOK) {
          const inc = x.region === 'lower' ? 5 : 2.5;
          TM[x.id] = tm + inc; saveTM();
          msg = `Saved. Both sets hit — 1RM bumped to ${TM[x.id]} lb.`;
        } else {
          msg = 'Saved. Not all sets hit — no change.';
        }
      } else if (scheme === 'hypertrophy') {
        const mainHypIdx = targets.map((t,i)=>t.isMainHypSet?i:-1).filter(i=>i>=0);
        const mainHypOK = mainHypIdx.length && mainHypIdx.every(i => sets[i] && sets[i].success);
        if (mainHypOK && hypState.weight) {
          if (hypState.tier !== 'high') {
            HYP[x.id] = {weight: hypState.weight, tier: 'high'}; saveHyp();
            msg = `Saved. Sets 1-2 complete — rep target moves to ${rep.hypHigh||10} next session.`;
          } else {
            const inc = x.region === 'lower' ? 5 : 2.5;
            HYP[x.id] = {weight: hypState.weight + inc, tier: 'low'}; saveHyp();
            msg = `Saved. Hit ${rep.hypHigh||10} reps — weight bumped to ${HYP[x.id].weight} lb, rep target resets to ${rep.hypLow||8}.`;
          }
        }
      }

      const entry = {date: todayLocal(), exercise: x.n, pattern: x.p, exId: x.id, logId: newLogId(), sets, allSuccess: sets.every(s=>s.success), tmAction: msg.includes('bumped') ? 'increase' : 'none'};
      if (!LOGS[x.id]) LOGS[x.id] = [];
      LOGS[x.id].push(entry);
      saveLogs();
      clearDraft(x.id);
      state.saveMsg = msg;
      render();
    };
  }
  function toCSV(entries) {
    const rows = [];
    entries.sort((a,b)=>a.date.localeCompare(b.date)).forEach(entry => {
      const exObj = EX.find(x => x.n === entry.exercise);
      const isBodyweightOnly = exObj && exObj.eq.length === 1 && exObj.eq[0] === 'bodyweight';
      const isMobility = exObj && effectiveScheme(exObj) === 'mobility';
      entry.sets.forEach(s => {
        let weight, reps;
        if (isMobility) {
          weight = 'BW/time';
          reps = 'Done';
        } else {
          const hasWeight = s.weight !== null && s.weight !== undefined && s.weight !== '';
          weight = hasWeight ? s.weight : (isBodyweightOnly ? 'BW' : '');
          reps = (s.reps !== null && s.reps !== undefined && s.reps !== '') ? s.reps : '';
        }
        rows.push([entry.date, entry.exercise, weight, reps]);
      });
    });
    return rows.map(r => r.join('\t')).join('\n');
  }
  function renderLog() {
    const allEntries = Object.values(LOGS).flat().sort((a,b) => b.date.localeCompare(a.date));

    root.innerHTML = `
      <div class="grr-detail">
        <span class="grr-back" id="grr-back">← Back to list</span>
        <div class="grr-detail-name">Log &amp; Export</div>
        <div class="grr-detail-meta">${allEntries.length} sessions logged</div>
        <input type="text" id="grr-log-filter" placeholder="Filter by exercise name…" value="${state.logFilter}"
          style="width:100%;background:var(--surface);border:1px solid var(--line);color:var(--chalk);font-size:14px;padding:9px 10px;border-radius:6px;margin-bottom:10px;box-sizing:border-box;"/>
        <button class="grr-export-btn" id="grr-download">Download CSV (all)</button>
        <button class="grr-copy-btn" id="grr-copy">Copy CSV to clipboard</button>
        <div class="grr-save-msg" id="grr-log-msg"></div>
        <div id="grr-entries"></div>
      </div>
    `;
    root.querySelector('#grr-back').onclick = () => { state.view = 'list'; render(); };

    function currentFiltered() {
      const filterText = state.logFilter.trim().toLowerCase();
      return filterText ? allEntries.filter(e => e.exercise.toLowerCase().includes(filterText)) : allEntries;
    }

    function refreshEntries() {
      const filterText = state.logFilter.trim().toLowerCase();
      const filtered = currentFiltered();
      root.querySelector('#grr-copy').textContent = filterText
        ? `Copy CSV to clipboard (${filtered.length} matching)`
        : `Copy CSV to clipboard (all ${allEntries.length})`;

      const container = root.querySelector('#grr-entries');
      container.innerHTML = '';
      if (!filtered.length) {
        container.innerHTML = `<div class="grr-empty">${allEntries.length ? 'No sessions match that filter.' : 'No sessions logged yet — log a set from any exercise page.'}</div>`;
        return;
      }
      filtered.forEach(e => {
        const div = document.createElement('div');
        div.className = 'grr-log-entry';
        div.innerHTML = `
          <div class="grr-log-entry-top">
            <span>${e.exercise}</span>
            <span style="display:flex;align-items:center;gap:8px;">${friendlyDate(e.date)} <span class="grr-log-delete" data-exid="${e.exId||''}" data-logid="${e.logId||''}" style="cursor:pointer;color:var(--red);font-weight:800;">✕</span></span>
          </div>
          <div class="grr-log-entry-meta">${e.pattern} · ${e.sets.map(s=>s.success?'✅':'❌').join('')} ${e.tmAction==='increase' ? '· TM increased' : ''}</div>
        `;
        container.appendChild(div);
      });
      container.querySelectorAll('.grr-log-delete').forEach(btn => {
        btn.onclick = () => {
          const exId = btn.dataset.exid, logId = btn.dataset.logid;
          if (!exId || !logId) { root.querySelector('#grr-log-msg').textContent = "Can't delete this entry (older format)."; return; }
          if (confirm('Delete this logged session? This cannot be undone.')) {
            deleteLogEntry(exId, logId);
            state.view = 'log'; render();
          }
        };
      });
    }

    root.querySelector('#grr-log-filter').oninput = (e) => { state.logFilter = e.target.value; refreshEntries(); };
    refreshEntries();

    root.querySelector('#grr-download').onclick = () => {
      try {
        const blob = new Blob([toCSV(allEntries)], {type:'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'gym-log.csv';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
        root.querySelector('#grr-log-msg').textContent = 'Downloaded full history.';
      } catch (err) {
        root.querySelector('#grr-log-msg').textContent = 'Download blocked here — try Copy instead.';
      }
    };
    root.querySelector('#grr-copy').onclick = async () => {
      const filtered = currentFiltered();
      const filterText = state.logFilter.trim();
      try {
        await navigator.clipboard.writeText(toCSV(filtered));
        root.querySelector('#grr-log-msg').textContent = filterText
          ? `Copied ${filtered.length} session(s) for "${filterText}".`
          : 'Copied everything — paste into a Sheet or Notes.';
      } catch (err) {
        root.querySelector('#grr-log-msg').textContent = 'Copy failed in this browser.';
      }
    };
  }
