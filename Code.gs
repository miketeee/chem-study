/**
 * Medical Assistant Practice Bank — Google Sheet sync
 *
 * Paste this whole file into Extensions → Apps Script of your Google Sheet.
 * 1. Change SECRET below to a long random phrase (you'll paste the same phrase into the quiz site).
 * 2. In the toolbar, pick `setup` in the function dropdown (next to Run), click Run, and approve the permissions prompt.
 *    The dropdown only lists setup, checkSetup, doGet and doPost; the helpers ending in _ are hidden on purpose.
 * 3. Deploy ▸ New deployment ▸ type "Web app" ▸ Execute as: Me ▸ Who has access: Anyone ▸ Deploy.
 * 4. Copy the Web app URL into the quiz site's Sync settings with the same secret.
 * Updating from an older version: paste, Save, run `setup` once (it repairs IDs Sheets turned into dates), then Deploy ▸ Manage deployments ▸ edit ▸ New version.
 * Optional: run `checkSetup` any time; View ▸ Logs (or Execution log) shows the row counts it found.
 *
 * Tabs it manages:
 *   Attempts — one row per answer (and one "baseline" row per question for progress saved before sync existed)
 *   Missed   — rebuilt after every sync: each problem you've gotten wrong, how many times, newest result
 *   Goal     — your finish-by date and which topics/exams it covers (shared by all your devices)
 */
const SECRET = 'CHANGE-ME-to-a-long-random-phrase';

const ATTEMPT_HEADERS = ['Time', 'Device', 'Question ID', 'Exam', 'Q#', 'Topic', 'Problem', 'Question', 'Picked',
  'Correct', 'Count', 'Right count', 'Source', 'UID'];
const MISSED_HEADERS = ['Times wrong', 'Times right', 'Last result', 'Last tried', 'Topic', 'Appears as', 'Question', 'Problem'];
const GOAL_HEADERS = ['Finish by', 'Topics', 'Exams', 'Last changed', 'Device', 'Updated (ms)'];

/* ---------- pure logic (no Google services; tested outside Apps Script) ---------- */

/** Question ID from a row. Built from Exam + Q# because Sheets can turn an ID like "2-22" into the date Feb 22. */
function rowId_(r) {
  return r[3] !== '' && r[3] != null && r[4] !== '' && r[4] != null ? Number(r[3]) + '-' + Number(r[4]) : String(r[2]);
}

/** rows: arrays in ATTEMPT_HEADERS order. Returns {questionId: {seen, right, last, lastAt, firstAt, misses}}. */
function aggregateRows_(rows) {
  const out = {};
  for (const r of (rows || [])) {
    const id = rowId_(r); if (!id) continue;
    const t = r[0] instanceof Date ? r[0].getTime() : new Date(r[0]).getTime();
    const count = Number(r[10]) || 0, right = Number(r[11]) || 0, ok = r[9] === true || r[9] === 'TRUE';
    const s = out[id] || (out[id] = { seen: 0, right: 0, last: null, lastAt: 0, firstAt: 0, misses: [] });
    s.seen += count; s.right += right;
    if (count > 0 && t && (!s.firstAt || t < s.firstAt)) s.firstAt = t;  // when this question was first answered (for the daily goal)
    if (r[12] === 'quiz' && !ok) s.misses.push([t, String(r[8] || '')]);  // every dated wrong answer: [time, letters picked]
    if (t >= s.lastAt) { s.lastAt = t; s.last = ok; }
  }
  return out;
}

/** Same rows, grouped by problem (a question repeated across exams counts as one problem). Only problems with ≥1 miss. */
function missedTable_(rows) {
  const g = {};
  for (const r of (rows || [])) {
    const pid = String(r[6] || rowId_(r)); if (!pid) continue;
    const t = r[0] instanceof Date ? r[0].getTime() : new Date(r[0]).getTime();
    const count = Number(r[10]) || 0, right = Number(r[11]) || 0, ok = r[9] === true || r[9] === 'TRUE';
    const s = g[pid] || (g[pid] = { wrong: 0, right: 0, last: null, lastAt: 0, topic: r[5], q: r[7], ids: {} });
    s.wrong += count - right; s.right += right; s.ids['Exam ' + r[3] + ' Q' + r[4]] = 1;
    if (t >= s.lastAt) { s.lastAt = t; s.last = ok; s.q = r[7] || s.q; s.topic = r[5] || s.topic; }
  }
  return Object.entries(g).filter(([, s]) => s.wrong > 0)
    .sort((a, b) => b[1].wrong - a[1].wrong || a[1].lastAt - b[1].lastAt)
    .map(([pid, s]) => [s.wrong, s.right, s.last ? 'Right' : 'Wrong', new Date(s.lastAt), s.topic,
      Object.keys(s.ids).join(', '), s.q, pid]);
}

/** Newest goal wins. A cleared goal (date '') still carries a time, so clearing spreads to every device. */
function mergeGoal_(cur, inc) {
  if (!inc || typeof inc !== 'object' || !Number(inc.updatedAt)) return cur || null;
  if (cur && Number(cur.updatedAt) >= Number(inc.updatedAt)) return cur;
  return { date: String(inc.date || ''), topics: (inc.topics || []).map(String), exams: (inc.exams || []).map(Number),
    updatedAt: Number(inc.updatedAt), device: String(inc.device || '') };
}

/** Turns a posted attempt into a sheet row. */
function toRow_(a) {
  const isBase = a.source === 'baseline';
  return [new Date(a.ts || Date.now()), String(a.device || ''), String(a.id), Number(a.exam), Number(a.n), String(a.topic || ''),
    String(a.group || ''), String(a.q || '').slice(0, 300), isBase ? '' : (a.picked || []).map(i => 'ABCD'[i]).join(''),
    !!a.ok, isBase ? Number(a.seen) || 0 : 1, isBase ? Number(a.right) || 0 : (a.ok ? 1 : 0), isBase ? 'baseline' : 'quiz',
    String(a.uid || '')];
}

/* ---------- Google Sheets plumbing ---------- */

function sheet_(name, headers) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(headers); sh.setFrozenRows(1); sh.getRange(1, 1, 1, headers.length).setFontWeight('bold'); }
  return sh;
}
/** Keeps Question ID, Problem and UID as plain text, and repairs IDs that were already turned into dates. */
function textIds_(sh) {
  ['C:C', 'G:G', 'N:N'].forEach(a => sh.getRange(a).setNumberFormat('@'));
  const n = sh.getLastRow() - 1; if (n < 1) return 0;
  const rng = sh.getRange(2, 1, n, ATTEMPT_HEADERS.length), vals = rng.getValues();
  const ids = sh.getRange(2, 3, n, 1);
  let fixed = 0;
  const out = vals.map(r => { const want = rowId_(r); if (String(r[2]) !== want) fixed++; return [want]; });
  if (fixed) ids.setValues(out);
  return fixed;
}
function readAttempts_() {
  const sh = sheet_('Attempts', ATTEMPT_HEADERS);
  const n = sh.getLastRow() - 1;
  return n > 0 ? sh.getRange(2, 1, n, ATTEMPT_HEADERS.length).getValues() : [];
}
function rebuildMissed_(rows) {
  const sh = sheet_('Missed', MISSED_HEADERS);
  const data = missedTable_(rows);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, MISSED_HEADERS.length).clearContent();
  if (data.length) sh.getRange(2, 1, data.length, MISSED_HEADERS.length).setValues(data);
}
function readGoal_() {
  const sh = sheet_('Goal', GOAL_HEADERS);
  if (sh.getLastRow() < 2) return null;
  const r = sh.getRange(2, 1, 1, GOAL_HEADERS.length).getValues()[0];
  if (!Number(r[5])) return null;
  const d = r[0] instanceof Date ? Utilities.formatDate(r[0], Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(r[0] || '');
  return { date: d, topics: String(r[1] || '').split(' | ').filter(String), exams: String(r[2] || '').split(',').map(x => Number(x)).filter(x => x),
    updatedAt: Number(r[5]), device: String(r[4] || '') };
}
function writeGoal_(g) {
  const sh = sheet_('Goal', GOAL_HEADERS);
  sh.getRange('A:A').setNumberFormat('@'); sh.getRange('C:C').setNumberFormat('@');
  sh.getRange(2, 1, 1, GOAL_HEADERS.length).setValues([[g.date, g.topics.join(' | '), g.exams.join(', '), new Date(g.updatedAt), g.device, g.updatedAt]]);
}
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

function setup() {
  const sh = sheet_('Attempts', ATTEMPT_HEADERS);
  const fixed = textIds_(sh);
  sheet_('Missed', MISSED_HEADERS);
  sheet_('Goal', GOAL_HEADERS);
  rebuildMissed_(readAttempts_());
  Logger.log('Question IDs repaired: %s', fixed);
  const first = SpreadsheetApp.getActive().getSheetByName('Sheet1');
  if (first && first.getLastRow() === 0) SpreadsheetApp.getActive().deleteSheet(first);
}

/** Run from the editor to confirm the tabs exist and see how many rows are saved. */
function checkSetup() {
  setup();
  const rows = readAttempts_();
  const missed = missedTable_(rows);
  Logger.log('Attempts rows: %s | Problems on the Missed tab: %s | Secret changed from default: %s',
    rows.length, missed.length, SECRET !== 'CHANGE-ME-to-a-long-random-phrase');
}

/** GET ?key=SECRET → your totals per question, so every device shows the same progress. */
function doGet(e) {
  if (!e || !e.parameter || e.parameter.key !== SECRET) return json_({ ok: false, error: 'Wrong secret' });
  return json_({ ok: true, stats: aggregateRows_(readAttempts_()), goal: readGoal_() });
}

/** POST {key, attempts:[...]} → appends new attempts (skips any UID already saved), rebuilds Missed, returns totals. */
function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'Bad request' }); }
  if (body.key !== SECRET) return json_({ ok: false, error: 'Wrong secret' });
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = sheet_('Attempts', ATTEMPT_HEADERS);
    textIds_(sh);
    const rows = readAttempts_();
    const seen = new Set(rows.map(r => String(r[13])));
    const fresh = (body.attempts || []).filter(a => a && a.id && !seen.has(String(a.uid))).map(toRow_);
    if (fresh.length) sh.getRange(sh.getLastRow() + 1, 1, fresh.length, ATTEMPT_HEADERS.length).setValues(fresh);
    const all = rows.concat(fresh);
    if (fresh.length) rebuildMissed_(all);
    let goal = readGoal_();
    if (body.goal) { const m = mergeGoal_(goal, body.goal); if (m !== goal) { writeGoal_(m); goal = m; } }
    return json_({ ok: true, accepted: fresh.length, stats: aggregateRows_(all), goal: goal });
  } finally { lock.releaseLock(); }
}

if (typeof module !== 'undefined') module.exports = { mergeGoal: mergeGoal_, rowId: rowId_, aggregateRows: aggregateRows_, missedTable: missedTable_, toRow: toRow_, ATTEMPT_HEADERS };
