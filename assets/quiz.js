/* Quiz runner: quiz/index.html?q=<slug> loads data/<slug>.json and lists every question, like the Micro quiz pages.
   Checkpoint/resume: every graded answer is saved in this browser right away (chem-hub-quiz-v1), so a reload,
   crash or closed tab picks up where you left off. "Restart quiz" clears it.
   Answers also count toward the Practice Bank's scores and missed list (same browser store), and go to your
   Google Sheet when it's connected. */
(function () {
  const QKEY = 'chem-hub-quiz-v1';
  const BKEY = 'chem-practice-bank-v1';
  const root = document.getElementById('quiz-root');
  const slug = new URLSearchParams(location.search).get('q');
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (e) { return d; } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  if (!slug) { root.innerHTML = '<p>No quiz specified. <a href="../index.html">Back to all quizzes.</a></p>'; return; }
  Chem.resources('../assets/');

  Promise.all([fetch('../data/' + encodeURIComponent(slug) + '.json').then(r => { if (!r.ok) throw 0; return r.json(); }),
               fetch('../data/manifest.json').then(r => r.json()).catch(() => null),
               fetch('../data/walkthroughs.json').then(r => r.json()).catch(() => null)])
    .then(([data, man, wt]) => render(data, man, new Set(wt ? wt.problems.map(p => p.id) : [])))
    .catch(() => { root.innerHTML = '<p>Could not load that quiz. <a href="../index.html">Back to all quizzes.</a></p>'; });

  function render(data, man, walk) {
    const test = man && man.tests.find(t => t.id === data.test);
    const topic = (test ? test.title + ' · ' : '') + data.title;
    document.title = data.title + ' Quiz — Chem Study Hub';
    const all = load(QKEY, {});
    const mine = all[slug] || (all[slug] = { answers: {} });
    const total = data.questions.length;

    root.innerHTML =
      '<div class="quiz-head"><a class="back-link" href="../index.html">&larr; All quizzes</a>' +
      '<p class="site-mark">CHEM STUDY HUB' + (test ? ' &middot; ' + Chem.esc(test.title).toUpperCase() : '') + '</p>' +
      '<h1 class="quiz-title">' + Chem.esc(data.title) + '</h1>' +
      '<p class="quiz-sub">' + Chem.esc(data.subtitle) + ' &middot; ' + total + ' questions</p></div>' +
      '<div class="score-bar"><div class="score-row"><span>answered <span id="ans">0</span>/' + total + '</span>' +
      '<span class="num-correct"><span id="cor">0</span>/' + total + ' correct</span></div>' +
      '<div class="progress-track" role="progressbar" aria-label="Quiz progress"><div class="progress-fill" id="pf"></div></div>' +
      '<button class="restart-btn" id="restart">restart quiz</button></div>' +
      '<div id="resume"></div><div id="list"></div><div class="finish-banner" id="finish"></div>';

    const n0 = Object.keys(mine.answers).length;
    if (n0 && n0 < total) document.getElementById('resume').innerHTML =
      `<p class="resume-note">Picked up where you left off: ${n0} of ${total} answered. Your first unanswered question is <a href="#q-${firstOpen()}">Q${firstOpen() + 1}</a>.</p>`;

    const list = document.getElementById('list');
    data.questions.forEach((q, i) => {
      const card = document.createElement('div');
      card.className = 'question'; card.id = 'q-' + i;
      card.innerHTML = `<div class="q-meta">Q${q.n} &middot; ${Chem.TYPE_LABEL[q.type].toUpperCase()}${q.tag ? `<span class="q-tag">${q.tag}</span>` : ''}${walk.has(q.id) ? `<a class="q-tag q-walk" href="../walkthrough/index.html#${q.id}">Walkthrough</a>` : ''}</div><p class="q-prompt">${q.q}</p>`;
      card.appendChild(Chem.notes.widget(q, slug));
      const host = document.createElement('div');
      card.appendChild(host);
      list.appendChild(card);
      const prev = mine.answers[q.id];
      Chem.mount(q, host, {
        saved: prev && prev.r,
        onGrade: (r, ok) => {
          mine.answers[q.id] = { r, ok, ts: Date.now() };
          put(QKEY, Object.assign(load(QKEY, {}), { [slug]: mine }));   // checkpoint after every answer
          record(q, r, ok);
          update(true);
        }
      });
    });
    Chem.notes.load();

    document.getElementById('restart').onclick = () => {
      const a = load(QKEY, {}); delete a[slug]; put(QKEY, a); location.hash = ''; location.reload();
    };
    update(false);
    if (/^#q-\d+$/.test(location.hash)) setTimeout(() => { const el = document.querySelector(location.hash); if (el) el.scrollIntoView({ block: 'start' }); }, 50);
    if (n0 && n0 < total && !location.hash) setTimeout(() => document.getElementById('q-' + firstOpen()).scrollIntoView({ block: 'start' }), 50);
    flush();

    function firstOpen() { return Math.max(0, data.questions.findIndex(q => !mine.answers[q.id])); }
    function update(justAnswered) {
      const done = Object.keys(mine.answers).length, right = Object.values(mine.answers).filter(a => a.ok).length;
      document.getElementById('ans').textContent = done;
      document.getElementById('cor').textContent = right;
      document.getElementById('pf').style.width = Math.round(100 * done / total) + '%';
      const fin = document.getElementById('finish');
      if (done === total) {
        fin.classList.add('show');
        fin.innerHTML = `<p class="f-title">Quiz complete</p><p>${right} of ${total} correct (${Math.round(100 * right / total)}%).</p>` +
          `<p style="font-size:.88rem;margin:.3rem 0 0">Misses from this quiz are in the Practice Bank's missed list.</p><button id="again">Take it again</button>`;
        document.getElementById('again').onclick = () => document.getElementById('restart').click();
        if (justAnswered) fin.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    /* Count this answer in the Practice Bank (same browser store) and queue it for the Sheet. */
    function record(q, r, ok) {
      const b = load(BKEY, {});
      b.stats = b.stats || {}; b.history = b.history || []; b.pending = b.pending || [];
      const st = b.stats[q.id] || { seen: 0, right: 0 };
      st.seen++; if (ok) st.right++; st.last = ok; st.lastAt = Date.now(); b.stats[q.id] = st;
      b.history.push({ id: q.id, picked: Chem.pickedText(q, r), ok, ts: Date.now() });
      if (Chem.sync.connected()) b.pending.push({ uid: Chem.sync.uid(), id: q.id, exam: 'Quiz page', n: q.n, topic, q: Chem.strip(q.q).slice(0, 300), picked: Chem.pickedText(q, r), ok, ts: Date.now(), device: Chem.sync.get().device });
      put(BKEY, b);
      clearTimeout(record.t); record.t = setTimeout(flush, 1200);
    }
  }

  /* Send queued answers; each is removed only after the Sheet confirms it (the Sheet skips any it already has). */
  let busy = false;
  async function flush() {
    if (busy || !Chem.sync.connected()) return;
    busy = true;
    try {
      for (;;) {
        const batch = (load(BKEY, {}).pending || []).slice(0, 200);
        if (!batch.length) break;
        const d = await Chem.sync.call('POST', { attempts: batch });
        const sent = new Set(batch.map(a => a.uid)), b = load(BKEY, {});
        b.pending = (b.pending || []).filter(a => !sent.has(a.uid)); b.remote = d.stats; put(BKEY, b);
      }
    } catch (e) { /* stays queued; goes on the next answer, visit, or from the Practice Bank */ }
    finally { busy = false; }
  }
  window.addEventListener('online', flush);
})();
