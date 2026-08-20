// app-core.js — shared state, storage/localStorage helpers, and utility functions.
// Loaded after exercises.js and home-workouts.js, before app-gym.js / app-home.js / app-muscle-map.js.
// Everything here is declared at top level (no wrapping IIFE) so it's visible as ordinary
// global bindings to every other <script> tag loaded after it on the page — that's what lets
// app-gym.js / app-home.js / app-muscle-map.js reference `state`, `root`, `EX_BY_ID`, `effectiveScheme`,
// etc. without any import/export machinery. Load order in index.html matters; this file must load first.

const root = document.getElementById('gym-ref-root');
let EXERCISES_LOADED = true;
if (typeof EXERCISES === 'undefined') {
  EXERCISES_LOADED = false;
  root.innerHTML = '<div style="padding:24px;color:#f2f0ea;font-family:sans-serif;">Could not load exercises.js — make sure it is uploaded in the same folder as this file.</div>';
}

  const HOME_DATA_LOADED = typeof LADDERS !== 'undefined';
  const PATTERNS = ["Squat","Hinge","Lunge","Push Horizontal","Pull Horizontal","Push Vertical","Pull Vertical","Core / Carry","Isolation","Warm-up / Mobility","Conditioning"];
  const EQUIP = ["barbell","dumbbell","kettlebell","cable","machine","bodyweight","band","trapbar","landmine","rings"];
  const EQUIP_LABEL = {barbell:"Barbell",dumbbell:"DB",kettlebell:"KB",cable:"Cable",machine:"Machine",bodyweight:"Bodyweight",band:"Band",trapbar:"Trap Bar",landmine:"Landmine",rings:"Rings"};
  const EX = EXERCISES;
  const EX_BY_ID = Object.fromEntries(EX.map(x => [x.id, x]));
  function roundW(w) { return Math.round(w/5)*5; }
  function friendlyDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    const wd = d.toLocaleDateString(undefined, {weekday:'short'});
    return `${wd} ${iso}`;
  }
  function formatDateLocal(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  function todayLocal() {
    return formatDateLocal(new Date());
  }
  function newLogId() { return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }
  let state = { equip: new Set(EQUIP), pattern: new Set(PATTERNS), view: 'list', activeId: null, saveMsg: '', logFilter: '', muscleMapTarget: null, cameFrom: null, homeMode: false, homeMsg: '' };
  let TM = {};
  let TIER = {};
  let HYP = {};
  let SCHEME_OVERRIDE = {}; // { exId: 'main'|'strength'|'hypertrophy'|'mobility' } — overrides exercises.js default
  let REP_OVERRIDE = {};    // { exId: {mainReps, hypLow, hypHigh} } — overrides hardcoded rep targets

  // ---------- HOME WORKOUT STATE ----------
  let HOME = { majorDay: 'A', circuitDay: 'A', equip: HOME_DATA_LOADED ? new Set(HOME_EQUIPMENT) : new Set() };
  let PLATE_INVENTORY = HOME_DATA_LOADED ? {...DEFAULT_PLATE_INVENTORY} : {};
  let RUNG_STATE = {};   // { ladderKey: { rungIndex: 0, streak: 0 } }
  let CIRCUIT_TICKS = {}; // { exId: 0|1|2 } — 0=blank, 1=partial (didn't hit ceiling), 2=full success (hit ceiling)
  let MAJOR_LIFT_STATE = {}; // { A: {sets:3, weight:null, streak:0, lastAmrap:null}, B: {...}, C: {...} }
  function saveMajorLiftState() { try { localStorage.setItem('gym-major-lift-state', JSON.stringify(MAJOR_LIFT_STATE)); } catch(e){} }
  function totalPlateWeight() {
    return Object.entries(PLATE_INVENTORY).reduce((sum,[size,pairs]) => sum + (parseFloat(size) * 2 * pairs), 0);
  }
  // Smallest weight jump available from the plate inventory — one pair (both sides) of the
  // smallest plate size currently owned. Returns 0 if no plates are on hand at all.
  function smallestPlateJump() {
    const sizes = Object.keys(PLATE_INVENTORY).map(Number).filter(s => (PLATE_INVENTORY[s]||0) > 0).sort((a,b)=>a-b);
    return sizes.length ? sizes[0] * 2 : 0;
  }
  function currentRungId(ladderKey) {
    const ladder = LADDERS[ladderKey];
    const st = RUNG_STATE[ladderKey] || {rungIndex:0, streak:0};
    return ladder.rungs[Math.min(st.rungIndex, ladder.rungs.length-1)];
  }
  function isBodyweightOnly(x) { return x.eq.length === 1 && x.eq[0] === 'bodyweight'; }
  function effectiveScheme(x) { return SCHEME_OVERRIDE[x.id] || x.scheme; }
  function schemeChoicesFor(x) {
    const choices = new Set(['main','strength','hypertrophy']);
    if (isBodyweightOnly(x)) choices.add('mobility');
    choices.add(x.scheme); // always keep the original default reachable, even if it wouldn't otherwise qualify
    return [...choices];
  }
  const SCHEME_LABELS = {main:'Major Lift', strength:'Strength', hypertrophy:'Hypertrophy', mobility:'Mobility', circuit:'Home Circuit', conditioning:'Conditioning'};
  function buildSchemePickerHtml(x, scheme) {
    return `
      <div class="grr-section-label" style="padding-left:0;">Scheme</div>
      <div class="grr-equip-row" id="grr-scheme-picker" style="padding:0 0 10px;">
        ${schemeChoicesFor(x).map(s => `<div class="grr-chip${scheme===s?' active':''}" data-scheme="${s}">${SCHEME_LABELS[s]}</div>`).join('')}
      </div>`;
  }
  function wireSchemePicker(x) {
    root.querySelectorAll('#grr-scheme-picker .grr-chip').forEach(chip => {
      chip.onclick = () => {
        const s = chip.dataset.scheme;
        if (s === x.scheme) delete SCHEME_OVERRIDE[x.id]; else SCHEME_OVERRIDE[x.id] = s;
        saveSchemeOverride(); clearDraft(x.id); state.saveMsg = ''; render();
      };
    });
  }
  let LOGS = {};
  let DRAFTS = {}; // in-progress, unsaved set inputs per exercise id — survives navigating away and back
  let CONDITIONING_DEFAULTS = {}; // { exId: { lapLength, targetDistance } } — remembered defaults for the conditioning/interval tracker
  function saveConditioningDefaults() { try { localStorage.setItem('gym-conditioning-defaults', JSON.stringify(CONDITIONING_DEFAULTS)); } catch(e){} }
  // { exId: {weight, type} } — optional Plates-vs-Band weight tracking for Mobility/Rehab exercises,
  // same mechanism as ISOLATION_STATE/REF_WEIGHT (see app-home.js WEIGHT TYPE section), but purely
  // informational: Mobility/Rehab isn't progression-tracked, so there's no ceiling-streak/auto-bump
  // logic here — just a value that gets remembered and included in the logged entry. Lives here
  // (rather than app-home.js) because it's set from the exercise's own detail card
  // (renderMobilityDetail, app-gym.js), not from the Home Workout page.
  let MOBILITY_WEIGHT = {};
  function saveMobilityWeight() { try { localStorage.setItem('gym-mobility-weight', JSON.stringify(MOBILITY_WEIGHT)); } catch(e){} }
  function loadAll() {
    try { const a = JSON.parse(localStorage.getItem('gym-ref-equip')); if (a && a.length) state.equip = new Set(a); } catch(e){}
    try { const a = JSON.parse(localStorage.getItem('gym-ref-pattern')); if (a) state.pattern = new Set(a); } catch(e){}
    try { const v = JSON.parse(localStorage.getItem('gym-tm')); if (v) TM = v; } catch(e){}
    try { const v = JSON.parse(localStorage.getItem('gym-tier')); if (v) TIER = v; } catch(e){}
    try { const v = JSON.parse(localStorage.getItem('gym-hyp')); if (v) HYP = v; } catch(e){}
    try { const v = JSON.parse(localStorage.getItem('gym-scheme-override')); if (v) SCHEME_OVERRIDE = v; } catch(e){}
    try { const v = JSON.parse(localStorage.getItem('gym-rep-override')); if (v) REP_OVERRIDE = v; } catch(e){}
    try { const v = JSON.parse(localStorage.getItem('gym-home-state')); if (v) HOME = {...HOME, ...v, equip: new Set(v.equip || [])}; } catch(e){}
    // Migration safety: circuits used to be independently selectable (1/2); they're now paired 1:1
    // with the Major Lift day, so force circuitDay to mirror majorDay on every load. This self-heals
    // any old saved state that still has a numeric circuitDay pointing at a now-nonexistent
    // CIRCUIT_DAYS[1]/CIRCUIT_DAYS[2] key.
    HOME.circuitDay = HOME.majorDay;
    try { const v = JSON.parse(localStorage.getItem('gym-plate-inventory')); if (v) PLATE_INVENTORY = v; } catch(e){}
    try { const v = JSON.parse(localStorage.getItem('gym-rung-state')); if (v) RUNG_STATE = v; } catch(e){}
    try { const v = JSON.parse(localStorage.getItem('gym-circuit-ticks')); if (v) CIRCUIT_TICKS = v; } catch(e){}
    try { const v = JSON.parse(localStorage.getItem('gym-major-lift-state')); if (v) MAJOR_LIFT_STATE = v; } catch(e){}
    try { const v = JSON.parse(localStorage.getItem('gym-isolation-state')); if (v) ISOLATION_STATE = v; } catch(e){}
    try { const v = JSON.parse(localStorage.getItem('gym-ref-weight')); if (v) REF_WEIGHT = v; } catch(e){}
    try { const v = JSON.parse(localStorage.getItem('gym-station-pick')); if (v) STATION_PICK = v; } catch(e){}
    try { const v = JSON.parse(localStorage.getItem('gym-rep-range-override')); if (v) REP_RANGE_OVERRIDE = v; } catch(e){}
    try { const v = JSON.parse(localStorage.getItem('gym-mobility-ticks')); if (v) MOBILITY_TICKS = v; } catch(e){}
    try { const v = JSON.parse(localStorage.getItem('gym-daily-superset-override')); if (v) DAILY_SUPERSET_OVERRIDE = v; } catch(e){}
    try { const v = JSON.parse(localStorage.getItem('gym-conditioning-defaults')); if (v) CONDITIONING_DEFAULTS = v; } catch(e){}
    try { const v = JSON.parse(localStorage.getItem('gym-mobility-weight')); if (v) MOBILITY_WEIGHT = v; } catch(e){}
    Object.keys(HYP).forEach(id => {
      if (HYP[id].tier === '6-8' || HYP[id].tier === 8) HYP[id].tier = 'low';
      else if (HYP[id].tier === '8-10' || HYP[id].tier === 10) HYP[id].tier = 'high';
    });
    try { const v = JSON.parse(localStorage.getItem('gym-logs')); if (v) LOGS = v; } catch(e){}
    try { const v = JSON.parse(localStorage.getItem('gym-drafts')); if (v) DRAFTS = v; } catch(e){}
    Object.keys(LOGS).forEach(exId => {
      (LOGS[exId] || []).forEach((e, i) => {
        if (!e.exId) e.exId = exId;
        if (!e.logId) e.logId = exId + '-' + i;
      });
    });
    render();
  }
  function saveEquip() { try { localStorage.setItem('gym-ref-equip', JSON.stringify([...state.equip])); } catch(e){} }
  function savePattern() { try { localStorage.setItem('gym-ref-pattern', JSON.stringify([...state.pattern])); } catch(e){} }
  function saveTM() { try { localStorage.setItem('gym-tm', JSON.stringify(TM)); } catch(e){} }
  function saveTier() { try { localStorage.setItem('gym-tier', JSON.stringify(TIER)); } catch(e){} }
  function saveHyp() { try { localStorage.setItem('gym-hyp', JSON.stringify(HYP)); } catch(e){} }
  function saveSchemeOverride() { try { localStorage.setItem('gym-scheme-override', JSON.stringify(SCHEME_OVERRIDE)); } catch(e){} }
  function saveRepOverride() { try { localStorage.setItem('gym-rep-override', JSON.stringify(REP_OVERRIDE)); } catch(e){} }
  function saveHome() { try { localStorage.setItem('gym-home-state', JSON.stringify({...HOME, equip:[...HOME.equip]})); } catch(e){} }
  function savePlateInventory() { try { localStorage.setItem('gym-plate-inventory', JSON.stringify(PLATE_INVENTORY)); } catch(e){} }
  function saveRungState() { try { localStorage.setItem('gym-rung-state', JSON.stringify(RUNG_STATE)); } catch(e){} }
  function saveCircuitTicks() { try { localStorage.setItem('gym-circuit-ticks', JSON.stringify(CIRCUIT_TICKS)); } catch(e){} }
  function saveLogs() { try { localStorage.setItem('gym-logs', JSON.stringify(LOGS)); } catch(e){} }
  function saveDrafts() { try { localStorage.setItem('gym-drafts', JSON.stringify(DRAFTS)); } catch(e){} }
  function updateDraft(exId, i, field, value) {
    if (!DRAFTS[exId]) DRAFTS[exId] = {};
    if (!DRAFTS[exId][i]) DRAFTS[exId][i] = {};
    DRAFTS[exId][i][field] = value;
    saveDrafts();
  }
  function clearDraft(exId) { delete DRAFTS[exId]; saveDrafts(); }
  function deleteLogEntry(exId, logId) {
    if (!LOGS[exId]) return;
    LOGS[exId] = LOGS[exId].filter(e => e.logId !== logId);
    saveLogs();
  }

  function toggleEquip(e) { state.equip.has(e) ? state.equip.delete(e) : state.equip.add(e); saveEquip(); render(); }
  function setAllEquip(on) { state.equip = on ? new Set(EQUIP) : new Set(); saveEquip(); render(); }
  function togglePattern(p) { state.pattern.has(p) ? state.pattern.delete(p) : state.pattern.add(p); savePattern(); render(); }
  function setAllPatterns(on) { state.pattern = on ? new Set(PATTERNS) : new Set(); savePattern(); render(); }
  function activePatterns() { return state.pattern.size ? state.pattern : new Set(PATTERNS); }
  function gifBlock(x) {
    if (!x.gif) return '';
    const driveMatch = x.gif.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
    if (driveMatch) {
      const fileId = driveMatch[1];
      return `<iframe class="grr-gif grr-gif-frame" src="https://drive.google.com/file/d/${fileId}/preview" allow="autoplay" loading="lazy"></iframe>`;
    }
    if (/\.(mp4|webm|mov)(\?|$)/i.test(x.gif)) {
      return `<video class="grr-gif" src="${x.gif}" autoplay loop muted playsinline onerror="this.style.display='none'"></video>`;
    }
    return `<img class="grr-gif" src="${x.gif}" alt="${x.n} demo" loading="lazy" onerror="this.style.display='none'"/>`;
  }
  function backButtonHtml() {
    if (state.cameFrom && state.cameFrom.view === 'home') {
      return `<span class="grr-back" id="grr-back">← Back to Home Workout</span>`;
    }
    let html = `<span class="grr-back" id="grr-back">← Back to list</span>`;
    if (state.cameFrom) {
      if (state.cameFrom.view === 'muscles') {
        html += ` &nbsp; <span class="grr-back" id="grr-back-ctx">← Back to Muscle Map</span>`;
      } else if (state.cameFrom.view === 'detail' && EX_BY_ID[state.cameFrom.activeId]) {
        html += ` &nbsp; <span class="grr-back" id="grr-back-ctx">← Back to ${EX_BY_ID[state.cameFrom.activeId].n}</span>`;
      }
    }
    return html;
  }
  function wireBackButtons() {
    root.querySelector('#grr-back').onclick = () => {
      const cf = state.cameFrom; state.cameFrom = null; state.homeMode = false;
      if (cf && cf.view === 'home') { state.view = 'home'; } else { state.view = 'list'; }
      render();
    };
    const ctx = root.querySelector('#grr-back-ctx');
    if (ctx) ctx.onclick = () => {
      const cf = state.cameFrom; state.cameFrom = null;
      if (cf.view === 'muscles') { state.muscleMapTarget = cf.muscleMapTarget; state.view = 'muscles'; }
      else if (cf.view === 'detail') { state.activeId = cf.activeId; state.view = 'detail'; }
      render();
    };
  }
  function render() {
    if (state.view === 'detail') renderDetail();
    else if (state.view === 'log') renderLog();
    else if (state.view === 'muscles') renderMuscles();
    else if (state.view === 'home') renderHome();
    else if (state.view === 'circuitFocus') renderCircuitFocus();
    else if (state.view === 'majorFocus') renderMajorFocus();
    else renderList();
  }
