/* Chem Study Hub — shared question engine.
   Used by quiz/index.html (one quiz, every question on the page) and drill/index.html (Practice Bank, one at a time).

   Question types (same as the original quiz site):
     single  opts[], correct (index)                     click an option to grade
     multi   opts[], correct (index list)                select all that apply, then Check
     match   items[], opts[], correct (index per item)   dropdown per item, all must be right
     calc    answerValue, answerDisplay, unit, tolerance  typed number, scientific notation ok
     fill    blanks[{label, answer | [answers]}]          typed text, every blank must be right
   Optional on any type: given (HTML box under the prompt), tag, note (shown after grading).

   Also here: the shared Google Sheet connection (one URL + secret phrase for the whole hub),
   per-question notes, and the Resources button. */
(function (root) {
  const L = 'ABCDEFGHIJKLMNO';
  const SYNC_KEY = 'chem-hub-sync-v1';

  /* ---------- grading (pure; also run by the test script) ---------- */
  function parseSci(str) {
    if (str === undefined || str === null) return NaN;
    const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };
    const s = String(str).trim().replace(/,/g, '').replace(/[×*X]/g, 'x').replace(/\s+/g, '')
      .replace(/x10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/, (m, e) => 'x10^' + [...e].map(c => SUP[c]).join(''));
    if (s === '') return NaN;
    const m = s.replace(/(\d)(%|[A-Za-zµ][A-Za-zµ/·⁻¹()]*)$/, (x, d, u) => /^[eE]$/.test(u) ? x : d).match(/^(-?\d*\.?\d+)(?:x10\^?(-?\d+)|[eE](-?\d+))?$/);
    if (!m) return NaN;
    const exp = m[2] !== undefined ? parseInt(m[2], 10) : (m[3] !== undefined ? parseInt(m[3], 10) : 0);
    return parseFloat(m[1]) * Math.pow(10, exp);
  }
  const normalizeText = s => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/^["'.]+|["'.]+$/g, '');
  const accepted = b => (Array.isArray(b.answer) ? b.answer : [b.answer]);
  const blankOk = (b, v) => accepted(b).some(a => normalizeText(a) === normalizeText(v));
  const calcOk = (q, v) => { const x = parseSci(v), tol = q.tolerance || 0.03; return !isNaN(x) && Math.abs(x - q.answerValue) <= Math.abs(q.answerValue) * tol; };

  /** resp shapes: single {i} · multi {sel:[i]} · match {sel:[i per item]} · calc {v} · fill {v:[text per blank]} */
  function grade(q, r) {
    if (!r) return false;
    switch (q.type) {
      case 'single': return r.i === q.correct;
      case 'multi': { const c = new Set(q.correct), s = new Set(r.sel || []); return s.size === c.size && [...s].every(i => c.has(i)); }
      case 'match': return q.items.every((_, i) => (r.sel || [])[i] === q.correct[i]);
      case 'calc': return calcOk(q, r.v);
      case 'fill': return q.blanks.every((b, i) => blankOk(b, (r.v || [])[i]));
    }
    return false;
  }
  const strip = s => String(s || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&middot;/g, '·').replace(/&amp;/g, '&').replace(/&rarr;/g, '→').replace(/\s+/g, ' ').trim();
  /** Short plain-text version of an answer, for the Sheet and the missed list. */
  function pickedText(q, r) {
    if (!r) return '';
    switch (q.type) {
      case 'single': return L[r.i] || '';
      case 'multi': return (r.sel || []).slice().sort((a, b) => a - b).map(i => L[i]).join('');
      case 'match': return (r.sel || []).map((x, i) => `${i + 1}${x == null ? '?' : L[x]}`).join(' ');
      case 'calc': return String(r.v || '');
      case 'fill': return (r.v || []).join(' | ');
    }
    return '';
  }
  function answerText(q) {
    switch (q.type) {
      case 'single': return `${L[q.correct]}) ${strip(q.opts[q.correct])}`;
      case 'multi': return q.correct.map(i => `${L[i]}) ${strip(q.opts[i])}`).join('; ');
      case 'match': return q.items.map((t, i) => `${strip(t)} → ${L[q.correct[i]]}) ${strip(q.opts[q.correct[i]])}`).join('; ');
      case 'calc': return `${q.answerDisplay}${q.unit ? ' ' + q.unit : ''}`;
      case 'fill': return q.blanks.map(b => `${b.label ? strip(b.label) + ': ' : ''}${accepted(b)[0]}`).join('; ');
    }
    return '';
  }
  function answerHtml(q) {
    switch (q.type) {
      case 'single': return `${L[q.correct]}) ${q.opts[q.correct]}`;
      case 'multi': return q.correct.map(i => `${L[i]}) ${q.opts[i]}`).join('<br>');
      case 'match': return q.items.map((t, i) => `${t} → <b>${L[q.correct[i]]}) ${q.opts[q.correct[i]]}</b>`).join('<br>');
      case 'calc': return `${q.answerDisplay}${q.unit ? ' ' + q.unit : ''}`;
      case 'fill': return q.blanks.map(b => `${b.label ? b.label + ': ' : ''}<b>${accepted(b)[0]}</b>`).join('<br>');
    }
    return '';
  }
  const TYPE_LABEL = { single: 'Multiple choice', multi: 'Select all that apply', match: 'Matching', calc: 'Calculation', fill: 'Fill in' };

  /* ---------- rendering ---------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /**
   * Draws the answer area for one question into `host`.
   * opts.saved   — an earlier response to show already graded (resume)
   * opts.onGrade — called once, with (resp, ok), when the question is graded
   * Returns a controller: { choose(i), check(), graded }
   */
  function mount(q, host, opts) {
    opts = opts || {};
    const ctl = { graded: false };
    let sel = q.type === 'match' ? q.items.map(() => null) : [];
    let h = q.given ? `<div class="cq-given">${q.given}</div>` : '';
    if (q.type === 'single') {
      h += `<div class="cq-opts">${q.opts.map((o, i) => `<button type="button" class="cq-opt" data-i="${i}"><span class="cq-k">${L[i]}</span><span>${o}</span></button>`).join('')}</div>`;
    } else if (q.type === 'multi') {
      h += `<div class="cq-opts">${q.opts.map((o, i) => `<button type="button" class="cq-opt" data-i="${i}" aria-pressed="false"><span class="cq-k cq-box"></span><span>${o}</span></button>`).join('')}</div>`;
    } else if (q.type === 'match') {
      h += `<div class="cq-rows">${q.items.map((t, i) => `<label class="cq-row" data-r="${i}"><span class="cq-term">${t}</span><select data-r="${i}"><option value="" selected disabled>choose…</option>${q.opts.map((o, j) => `<option value="${j}">${L[j]}) ${esc(strip(o))}</option>`).join('')}</select><span class="cq-mark"></span></label>`).join('')}</div>`;
    } else if (q.type === 'calc') {
      h += `<div class="cq-rows"><label class="cq-row cq-calc"><input type="text" inputmode="text" autocomplete="off" spellcheck="false" placeholder="e.g. 5.24x10^-8" aria-label="Your answer"><span class="cq-unit">${q.unit || ''}</span><span class="cq-mark"></span></label></div><p class="cq-hint">Scientific notation: 5.24x10^-8 or 5.24e-8</p>`;
    } else if (q.type === 'fill') {
      h += `<div class="cq-rows">${q.blanks.map((b, i) => `<label class="cq-row cq-fill" data-r="${i}">${b.label ? `<span class="cq-term">${b.label}</span>` : ''}<input type="text" data-r="${i}" autocomplete="off" spellcheck="false" placeholder="type the answer…"><span class="cq-mark"></span></label>`).join('')}</div>`;
    }
    const needsCheck = q.type !== 'single';
    if (needsCheck) h += `<button type="button" class="cq-check" disabled>Check answer</button>`;
    h += `<div class="cq-fb" hidden></div>`;
    host.innerHTML = h;
    const $$ = s => [...host.querySelectorAll(s)];
    const checkBtn = host.querySelector('.cq-check');
    const ready = () => {
      if (!checkBtn) return;
      let ok = false;
      if (q.type === 'multi') ok = sel.length > 0;
      if (q.type === 'match') ok = sel.every(x => x !== null);
      if (q.type === 'calc') ok = host.querySelector('input').value.trim() !== '';
      if (q.type === 'fill') ok = $$('input').some(x => x.value.trim() !== '');
      checkBtn.disabled = !ok || ctl.graded;
    };
    const collect = () => {
      if (q.type === 'single') return { i: sel[0] };
      if (q.type === 'multi') return { sel: sel.slice().sort((a, b) => a - b) };
      if (q.type === 'match') return { sel: sel.slice() };
      if (q.type === 'calc') return { v: host.querySelector('input').value.trim() };
      if (q.type === 'fill') return { v: $$('input').map(x => x.value.trim()) };
    };
    function reveal(r) {
      ctl.graded = true;
      const ok = grade(q, r);
      if (q.type === 'single' || q.type === 'multi') {
        const pick = q.type === 'single' ? [r.i] : (r.sel || []), right = q.type === 'single' ? [q.correct] : q.correct;
        $$('.cq-opt').forEach((b, k) => {
          b.disabled = true; b.classList.remove('sel');
          if (right.includes(k)) b.classList.add('right'); else if (pick.includes(k)) b.classList.add('wrong');
          if (q.type === 'multi' && pick.includes(k)) b.querySelector('.cq-box').textContent = '✓';
        });
      } else if (q.type === 'match') {
        $$('select').forEach((s, i) => {
          if (r.sel[i] != null) s.value = String(r.sel[i]); s.disabled = true;
          const good = r.sel[i] === q.correct[i], row = s.closest('.cq-row');
          row.classList.add(good ? 'right' : 'wrong'); row.querySelector('.cq-mark').textContent = good ? '✓' : `✗ ${L[q.correct[i]]}`;
        });
      } else if (q.type === 'calc') {
        const inp = host.querySelector('input'); inp.value = r.v || ''; inp.disabled = true;
        const row = host.querySelector('.cq-row'); row.classList.add(ok ? 'right' : 'wrong'); row.querySelector('.cq-mark').textContent = ok ? '✓' : '✗';
      } else if (q.type === 'fill') {
        $$('input').forEach((inp, i) => {
          inp.value = (r.v || [])[i] || ''; inp.disabled = true;
          const good = blankOk(q.blanks[i], inp.value), row = inp.closest('.cq-row');
          row.classList.add(good ? 'right' : 'wrong'); row.querySelector('.cq-mark').textContent = good ? '✓' : '✗';
        });
      }
      if (checkBtn) checkBtn.hidden = true;
      const fb = host.querySelector('.cq-fb');
      fb.className = 'cq-fb ' + (ok ? 'ok' : 'bad');
      fb.innerHTML = `<div class="cq-verdict">${ok ? 'Correct' : 'Not quite'}</div>` +
        (ok && q.type === 'single' ? '' : `<div><b>${ok ? 'Answer' : 'Correct answer'}:</b><br>${answerHtml(q)}</div>`) +
        (q.note ? `<p class="cq-note">${q.note}</p>` : '');
      fb.hidden = false;
      return ok;
    }
    function finish(r) {
      if (ctl.graded) return;
      const ok = reveal(r);
      if (opts.onGrade) opts.onGrade(r, ok);
    }
    ctl.choose = i => {
      if (ctl.graded || i < 0) return;
      if (q.type === 'single' && i < q.opts.length) { sel = [i]; finish(collect()); }
      else if (q.type === 'multi' && i < q.opts.length) {
        sel = sel.includes(i) ? sel.filter(x => x !== i) : sel.concat(i);
        $$('.cq-opt').forEach((b, k) => { const on = sel.includes(k); b.classList.toggle('sel', on); b.setAttribute('aria-pressed', String(on)); b.querySelector('.cq-box').textContent = on ? '✓' : ''; });
        ready();
      }
    };
    ctl.check = () => { if (checkBtn && !checkBtn.disabled && !ctl.graded) finish(collect()); };
    host.addEventListener('click', e => { const b = e.target.closest('.cq-opt'); if (b && !b.disabled) ctl.choose(+b.dataset.i); });
    host.addEventListener('change', e => { const s = e.target.closest('select'); if (s) { sel[+s.dataset.r] = +s.value; ready(); } });
    host.addEventListener('input', ready);
    host.addEventListener('keydown', e => {
      if (e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
      e.preventDefault(); e.stopPropagation();
      const ins = $$('input'), k = ins.indexOf(e.target);
      if (k < ins.length - 1) ins[k + 1].focus(); else ctl.check();
    });
    if (checkBtn) checkBtn.addEventListener('click', ctl.check);
    if (opts.saved) reveal(opts.saved);
    return ctl;
  }

  /* ---------- one Google Sheet connection for the whole hub ---------- */
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const sync = {
    get() {
      let s = {};
      try { s = JSON.parse(localStorage.getItem(SYNC_KEY) || '{}') || {}; } catch (e) {}
      if (!s.device) { s.device = 'dev-' + uid(); sync.set(s); }
      return { url: s.url || '', key: s.key || '', device: s.device };
    },
    set(s) { try { localStorage.setItem(SYNC_KEY, JSON.stringify(s)); } catch (e) {} },
    connected() { const s = sync.get(); return !!(s.url && s.key); },
    async call(method, body, extra) {
      const s = sync.get();
      const url = s.url + (method === 'GET' ? (s.url.includes('?') ? '&' : '?') + 'key=' + encodeURIComponent(s.key) + (extra || '') : '');
      const res = await fetch(url, method === 'GET' ? { method } : { method, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ key: s.key }, body)) });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'The Sheet refused the request');
      return data;
    },
    uid
  };

  /* ---------- per-question notes (Notes tab of the same Sheet) ----------
     Typed notes are kept in this browser first (chem-hub-notes-v1) and sent after you pause,
     so a dropped connection or a closed tab never loses one; unsent notes go on the next visit. */
  const NOTES_KEY = 'chem-hub-notes-v1';
  const notes = {
    cache: {}, pending: {}, loaded: false, timers: {}, listeners: [],
    boot() {
      try { const s = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}'); notes.cache = s.cache || {}; notes.pending = s.pending || {}; } catch (e) {}
    },
    persist() { try { localStorage.setItem(NOTES_KEY, JSON.stringify({ cache: notes.cache, pending: notes.pending })); } catch (e) {} },
    async load() {
      notes.boot();
      if (!sync.connected()) return;
      try {
        const d = await sync.call('GET', null, '&what=notes');
        const remote = d.notes || {};
        for (const id of Object.keys(remote)) if (!(id in notes.pending)) notes.cache[id] = remote[id];
        for (const id of Object.keys(notes.cache)) if (!(id in remote) && !(id in notes.pending)) delete notes.cache[id];
        notes.loaded = true; notes.persist();
        notes.listeners.forEach(f => f());
        notes.flush();
      } catch (e) {}
    },
    async flush() {
      if (!sync.connected()) return;
      for (const id of Object.keys(notes.pending)) {
        const p = notes.pending[id];
        try { await sync.call('POST', { note: p }); if (notes.pending[id] === p) delete notes.pending[id]; notes.persist(); }
        catch (e) { return false; }
      }
      return true;
    },
    /** A small "Add a note" control for question q (quiz = the HW slug). */
    widget(q, quiz) {
      const el = document.createElement('div');
      el.className = 'cq-notes';
      const draw = () => {
        const text = notes.cache[q.id] || '';
        el.innerHTML = `<button type="button" class="cq-notes-toggle" aria-expanded="false">✎ <span>${text ? 'View note' : 'Add a note'}</span>${text ? '<i class="cq-dot"></i>' : ''}</button>
          <div class="cq-notes-box" hidden><textarea placeholder="Notes for this question… saved automatically">${esc(text)}</textarea>
          <div class="cq-notes-status" role="status">${sync.connected() ? '' : 'Saved on this device only. Connect your Google Sheet in the Practice Bank to keep notes everywhere.'}</div></div>`;
        const tg = el.querySelector('.cq-notes-toggle'), box = el.querySelector('.cq-notes-box'), ta = el.querySelector('textarea'), st = el.querySelector('.cq-notes-status');
        tg.onclick = () => { box.hidden = !box.hidden; tg.setAttribute('aria-expanded', String(!box.hidden)); if (!box.hidden) ta.focus(); };
        ta.addEventListener('keydown', e => e.stopPropagation());
        ta.oninput = () => {
          const v = ta.value;
          if (v.trim()) notes.cache[q.id] = v; else delete notes.cache[q.id];
          notes.pending[q.id] = { id: q.id, quiz, q: strip(q.q).slice(0, 300), text: v, ts: Date.now() };
          notes.persist();
          tg.querySelector('span').textContent = v.trim() ? 'View note' : 'Add a note';
          if (!sync.connected()) return;
          st.textContent = 'Saving…';
          clearTimeout(notes.timers[q.id]);
          notes.timers[q.id] = setTimeout(async () => { st.textContent = (await notes.flush()) ? 'Saved to your Sheet' : 'Saved on this device; will send when the Sheet is reachable'; }, 700);
        };
      };
      draw();
      notes.listeners.push(() => { if (!el.querySelector('.cq-notes-box') || el.querySelector('.cq-notes-box').hidden) draw(); });
      return el;
    }
  };

  /* ---------- Resources button (add entries here; every page picks them up) ---------- */
  const RESOURCES = [
    { name: 'Periodic Table of the Elements', file: 'periodic-table.png' }
  ];
  function resources(assetBase) {
    if (document.getElementById('cqResBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'cqResBtn'; btn.type = 'button'; btn.className = 'cq-res-btn'; btn.textContent = '✵ Resources';
    const modal = document.createElement('div');
    modal.className = 'cq-modal'; modal.hidden = true;
    modal.innerHTML = `<div class="cq-modal-box" role="dialog" aria-label="Resources"><button type="button" class="cq-x" aria-label="Close">✕</button><h3>Resources</h3><p class="cq-sub">Reference material you can pull up any time. It doesn't affect your score.</p>
      ${RESOURCES.map((r, i) => `<button type="button" class="cq-res" data-i="${i}"><img src="${assetBase + r.file}" alt=""><span>${esc(r.name)}</span></button>`).join('')}</div>`;
    const lb = document.createElement('div');
    lb.className = 'cq-lightbox'; lb.hidden = true;
    lb.innerHTML = `<button type="button" class="cq-x" aria-label="Close">✕</button><img alt="">`;
    document.body.append(btn, modal, lb);
    btn.onclick = () => { modal.hidden = false; };
    modal.onclick = e => {
      if (e.target === modal || e.target.closest('.cq-x')) modal.hidden = true;
      const r = e.target.closest('.cq-res'); if (r) { const it = RESOURCES[+r.dataset.i]; lb.querySelector('img').src = assetBase + it.file; lb.querySelector('img').alt = it.name; lb.hidden = false; }
    };
    lb.onclick = e => { if (e.target === lb || e.target.closest('.cq-x')) lb.hidden = true; };
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { lb.hidden ? (modal.hidden = true) : (lb.hidden = true); } });
  }

  /** Loads the manifest and every quiz it lists. */
  async function loadAll(base) {
    const man = await (await fetch(base + 'data/manifest.json')).json();
    const slugs = [];
    man.tests.forEach(t => t.items.forEach(it => it.quizzes.forEach(z => slugs.push({ slug: z.slug, test: t, item: it }))));
    const quizzes = await Promise.all(slugs.map(async s => Object.assign(await (await fetch(base + 'data/' + s.slug + '.json')).json(), { _test: s.test, _item: s.item })));
    return { man, quizzes };
  }

  const api = { L, parseSci, normalizeText, grade, pickedText, answerText, answerHtml, strip, esc, TYPE_LABEL, mount, sync, notes, resources, loadAll };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Chem = api;
})(typeof window !== 'undefined' ? window : globalThis);
