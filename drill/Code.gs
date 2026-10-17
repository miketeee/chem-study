/**
 * Chem Study Hub — Google Sheet sync (Apps Script web app)
 * Same setup as the CCMA and Micro practice banks. Use a NEW blank Sheet for chemistry.
 *
 * 1. Change SECRET below to your own phrase. Type the same phrase into the Practice Bank's sync panel.
 * 2. Deploy → New deployment → type "Web app" → Execute as: Me → Who has access: Anyone.
 * 3. Copy the Web app URL (ends in /exec) into the Practice Bank's sync panel.
 *
 * Tabs it manages:
 *   Attempts — one row per answer, from the Practice Bank and the quiz pages. Never deleted.
 *   Summary  — rebuilt after every sync: one row per question (times seen, right, wrong, last result).
 *   Notes    — one row per question you've written a note on. Editing a note updates its row.
 */
const SECRET = 'change-this-phrase';

const ATTEMPTS = 'Attempts';
const SUMMARY = 'Summary';
const NOTES = 'Notes';
const HEAD = ['uid', 'When', 'ts', 'Device', 'Where', 'Homework', 'Question ID', 'Q#', 'Question', 'Answered', 'Correct?', 'Source', 'Seen', 'Right'];
const NOTE_HEAD = ['Question ID', 'Homework', 'Question', 'Note', 'Updated'];
const LETTERS = 'ABCDEFGHIJ';

/** GET ?key=SECRET → per-question totals.  GET ?key=SECRET&what=notes → every saved note. */
function doGet(e) {
  const p = e && e.parameter ? e.parameter : {};
  if (p.key !== SECRET) return out_({ ok: false, error: 'Wrong secret phrase' });
  if (p.what === 'notes') return out_({ ok: true, notes: notes_() });
  return out_({ ok: true, stats: stats_() });
}

/** POST {key, attempts:[...]} appends answers (skips any uid already saved).  POST {key, note:{id, quiz, q, text}} saves a note. */
function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: 'Bad request' }); }
  if (!body || body.key !== SECRET) return out_({ ok: false, error: 'Wrong secret phrase' });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (body.note) { saveNote_(body.note); return out_({ ok: true }); }
    const sh = attempts_();
    const have = new Set();
    const last = sh.getLastRow();
    if (last > 1) sh.getRange(2, 1, last - 1, 1).getValues().forEach(function (r) { have.add(String(r[0])); });
    const rows = [];
    (body.attempts || []).forEach(function (a) {
      if (!a || !a.uid || !a.id || have.has(String(a.uid))) return;   // already saved — safe to resend
      have.add(String(a.uid));
      rows.push(toRow_(a));
    });
    if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEAD.length).setValues(rows);
    const stats = stats_();
    summary_(stats);
    return out_({ ok: true, stats: stats, added: rows.length });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- pure logic (no Google services; tested outside Apps Script) ---------- */

function toRow_(a) {
  const base = a.source === 'baseline';
  const picked = Array.isArray(a.picked) ? a.picked.map(function (i) { return typeof i === 'number' ? LETTERS[i] : i; }).join('') : (a.picked || '');
  return [String(a.uid), new Date(a.ts || Date.now()), a.ts || Date.now(), a.device || '', a.exam || '', a.topic || '', String(a.id), a.n || '',
          String(a.q || '').slice(0, 300), "'" + String(picked).slice(0, 300), a.ok ? 'right' : 'wrong', base ? 'baseline' : 'answer',
          base ? (Number(a.seen) || 0) : 1, base ? (Number(a.right) || 0) : (a.ok ? 1 : 0)];
}

/** rows in HEAD order → one entry per question: seen, right, last result, when, and a dated list of misses */
function aggregate_(rows) {
  const st = {};
  rows.forEach(function (r) {
    const id = String(r[6]); if (!id) return;
    const ts = Number(r[2]) || 0, ok = r[10] === 'right', src = r[11];
    const s = st[id] || (st[id] = { seen: 0, right: 0, last: null, lastAt: 0, misses: [], where: r[4], topic: r[5], q: r[8] });
    if (src === 'baseline') { s.seen += Number(r[12]) || 0; s.right += Number(r[13]) || 0; }
    else { s.seen++; if (ok) s.right++; else s.misses.push([ts, String(r[9]).replace(/^'/, '')]); }
    if (ts >= s.lastAt) { s.lastAt = ts; s.last = ok; }
  });
  return st;
}

/* ---------- Google Sheets plumbing ---------- */

function stats_() {
  const sh = attempts_();
  const n = sh.getLastRow() - 1;
  return n < 1 ? {} : aggregate_(sh.getRange(2, 1, n, HEAD.length).getValues());
}

function summary_(stats) {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(SUMMARY) || ss.insertSheet(SUMMARY);
  sh.clearContents();
  const rows = [['Question ID', 'Homework', 'Question', 'Seen', 'Right', 'Wrong', 'Last result', 'Last answered']];
  Object.keys(stats).sort().forEach(function (id) {
    const s = stats[id];
    rows.push([id, s.topic || '', s.q || '', s.seen, s.right, s.seen - s.right, s.last ? 'right' : 'wrong', s.lastAt ? new Date(s.lastAt) : '']);
  });
  sh.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  sh.setFrozenRows(1);
}

function attempts_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(ATTEMPTS);
  if (!sh) {
    sh = ss.insertSheet(ATTEMPTS); sh.getRange(1, 1, 1, HEAD.length).setValues([HEAD]); sh.setFrozenRows(1);
    sh.getRange('G:G').setNumberFormat('@'); sh.hideColumns(1); sh.hideColumns(3);
    const first = ss.getSheetByName('Sheet1'); if (first && first.getLastRow() === 0) ss.deleteSheet(first);
  }
  return sh;
}

function notesSheet_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(NOTES);
  if (!sh) { sh = ss.insertSheet(NOTES); sh.getRange(1, 1, 1, NOTE_HEAD.length).setValues([NOTE_HEAD]); sh.setFrozenRows(1); sh.getRange('A:A').setNumberFormat('@'); }
  return sh;
}

function notes_() {
  const sh = notesSheet_(), n = sh.getLastRow() - 1, out = {};
  if (n < 1) return out;
  sh.getRange(2, 1, n, 4).getValues().forEach(function (r) { if (r[0] && String(r[3]).trim()) out[String(r[0])] = String(r[3]); });
  return out;
}

/** Updates the note's row, or adds one. An empty note clears the row's text (the row stays, so re-saving reuses it). */
function saveNote_(nt) {
  if (!nt.id) return;
  const sh = notesSheet_(), n = sh.getLastRow() - 1;
  const ids = n > 0 ? sh.getRange(2, 1, n, 1).getValues().map(function (r) { return String(r[0]); }) : [];
  const at = ids.indexOf(String(nt.id));
  const row = [String(nt.id), nt.quiz || '', String(nt.q || '').slice(0, 300), String(nt.text || ''), new Date(nt.ts || Date.now())];
  if (at >= 0) sh.getRange(at + 2, 1, 1, row.length).setValues([row]);
  else sh.getRange(sh.getLastRow() + 1, 1, 1, row.length).setValues([row]);
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

if (typeof module !== 'undefined') module.exports = { toRow: toRow_, aggregate: aggregate_, HEAD: HEAD };
