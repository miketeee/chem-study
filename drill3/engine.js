/* Test 3 Drill engine: chemistry helpers and one question generator per topic.
   Every generator returns a fresh question object:
     { topic, key, prompt, given?, kind: 'mc'|'num'|'formula'|'coef'|'int', opts?, correct?, value?, tol?, unit?, display, steps:[[tag, html]] }
   Tags match the Walkthroughs page: 'mem' = memorize, 'chart' = chart/problem, 'both', '' = work. */
(function (root) {
  'use strict';
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const gcdAll = a => a.reduce((x, y) => gcd(x, y));

  /* ---------- molar masses (the values used in class and on the homework) ---------- */
  const MASS = { H: 1.01, Li: 6.94, C: 12.01, N: 14.01, O: 16.00, F: 19.00, Na: 22.99, Mg: 24.31, Al: 26.98, Si: 28.09, P: 30.97, S: 32.06, Cl: 35.45, K: 39.10, Ca: 40.08, Cr: 52.00, Mn: 54.94, Fe: 55.85, Co: 58.93, Ni: 58.69, Cu: 63.55, Zn: 65.38, Br: 79.90, Sr: 87.62, Ag: 107.87, I: 126.90, Ba: 137.33, Pb: 207.2, Rh: 102.91, Hg: 200.59, Sn: 118.71, Cd: 112.41, Pt: 195.08, Au: 196.97, B: 10.81, He: 4.00, Ne: 20.18, Ar: 39.95, Se: 78.97 };
  const NAME = { H: 'hydrogen', C: 'carbon', N: 'nitrogen', O: 'oxygen', F: 'fluorine', Na: 'sodium', Mg: 'magnesium', Al: 'aluminum', P: 'phosphorus', S: 'sulfur', Cl: 'chlorine', K: 'potassium', Ca: 'calcium', Cr: 'chromium', Fe: 'iron', Co: 'cobalt', Cu: 'copper', Br: 'bromine', I: 'iodine', Li: 'lithium', Ba: 'barium', Mn: 'manganese', Zn: 'zinc', Ag: 'silver', Pb: 'lead', Si: 'silicon', Ni: 'nickel', Rh: 'rhodium', Sr: 'strontium' };

  /* ---------- formulas ---------- */
  const SUB = '₀₁₂₃₄₅₆₇₈₉', SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻' };
  const sub = f => String(f).replace(/([A-Za-z)])(\d+)/g, (_, a, d) => a + d.replace(/\d/g, c => SUB[c]));
  const chg = c => c === 0 ? '' : (Math.abs(c) === 1 ? '' : String(Math.abs(c))).replace(/\d/g, d => SUP[d]) + (c > 0 ? '⁺' : '⁻');
  const plainDigits = s => String(s).replace(/[₀-₉]/g, c => String(SUB.indexOf(c)));
  function parse(f) {   // 'Ca(OH)2' -> {Ca:1, O:2, H:2}; throws on junk
    f = plainDigits(f).replace(/\s+/g, '');
    let i = 0;
    function group() {
      const out = {};
      while (i < f.length && f[i] !== ')') {
        let part;
        if (f[i] === '(') { i++; part = group(); if (f[i] !== ')') throw 0; i++; }
        else { const m = /^[A-Z][a-z]?/.exec(f.slice(i)); if (!m || !(m[0] in MASS)) throw 0; i += m[0].length; part = { [m[0]]: 1 }; }
        const n = /^\d+/.exec(f.slice(i)); const k = n ? +n[0] : 1; if (n) i += n[0].length;
        for (const e in part) out[e] = (out[e] || 0) + part[e] * k;
      }
      return out;
    }
    const r = group(); if (i !== f.length) throw 0; return r;
  }
  const order = c => Object.keys(c);
  const molar = f => { const c = typeof f === 'string' ? parse(f) : f; return Object.keys(c).reduce((s, e) => s + MASS[e] * c[e], 0); };
  const fromCounts = (els, n) => els.map((e, k) => e + (n[k] === 1 ? '' : n[k])).join('');
  const sameCounts = (a, b) => { const ka = Object.keys(a), kb = Object.keys(b); return ka.length === kb.length && ka.every(k => a[k] === b[k]); };
  const r2 = x => (Math.round(x * 100) / 100).toFixed(2);

  /* significant figures */
  function sig(x, n) {
    if (x === 0) return '0';
    const p = Math.floor(Math.log10(Math.abs(x)));
    const dec = n - 1 - p;
    if (dec >= 0) return x.toFixed(dec);
    const v = Math.round(x / 10 ** (p - n + 1)) * 10 ** (p - n + 1);
    const s = String(v);
    return s.replace(/0+$/, '').length < n ? (v / 10 ** p).toFixed(n - 1) + '×10' + String(p).replace(/\d/g, d => SUP[d]) : s;
  }
  const sfOf = s => { s = String(s).replace(/^[-+]?0*\.?0*/, ''); return s.replace('.', '').length; };

  /* ---------- tags ---------- */
  const M = 'mem', C = 'chart', B = 'both', W = '';

  /* ---------- factor label (Dr. Bragg's setup): start with the one-unit number, then fractions whose units cancel ----------
     fl(['24.43', 'g Na₂CO₃'], [[['1', 'mol Na₂CO₃'], ['105.99', 'g Na₂CO₃']], …], ['26.94', 'g NaCl'])
     Cancelled units are struck through; the plain-text version reads "24.43 g Na₂CO₃ × (1 mol Na₂CO₃ / 105.99 g Na₂CO₃) × … = 26.94 g NaCl". */
  function fl(start, factors, result, bold) {
    const tops = [[start[1], false]], botS = [];
    factors.forEach(([[, tu], [, bu]]) => {
      let hit = null; for (let i = tops.length - 1; i >= 0; i--) if (!tops[i][1] && tops[i][0] === bu) { hit = tops[i]; break; }
      if (hit) hit[1] = true; botS.push(!!hit); tops.push([tu, false]);
    });
    const u = (unit, st) => st ? `<s>${unit}</s>` : unit;
    const parts = [`${start[0]} ${u(start[1], tops[0][1])}`].concat(factors.map(([[tn, tu], [bn, bu]], i) =>
      `<span class="frac"><span class="po">(</span><span class="ft">${tn} ${u(tu, tops[i + 1][1])}</span><span class="sl"> / </span><span class="fb">${bn} ${u(bu, botS[i])}</span><span class="po">)</span></span>`));
    const res = `${result[0]} ${result[1]}`;
    return '<span class="fl">' + parts.join(' × ') + ' = ' + (bold === false ? res : `<b>${res}</b>`) + '</span>';
  }
  const BR = '<span class="sep">; </span><br>';
  const ML2L = [['1', 'L'], ['1000', 'mL']];
  const gmol = (g, F, mm, mol) => fl([g, 'g ' + F], [[['1', 'mol ' + F], [mm, 'g ' + F]]], [mol, 'mol ' + F]);

  /* ================= HW 13 ================= */
  const EMP_BASES = [['C', 'H'], ['C', 'H', 'O'], ['N', 'O'], ['S', 'O'], ['P', 'O'], ['C', 'H', 'N'], ['C', 'H', 'Cl']];
  function g13id() {
    const els = pick(EMP_BASES);
    let n, k;
    for (;;) {
      n = els.map(() => R(1, 6)); if (gcdAll(n) !== 1) continue;
      k = Math.random() < 0.5 ? 1 : R(2, 4);
      if (Math.random() < 0.35) n[R(0, n.length - 1)] = 1;
      if (gcdAll(n) === 1) break;
    }
    const big = n.map(x => x * k), f = fromCounts(els, big), emp = k === 1;
    const g = gcdAll(big);
    return {
      key: 'id:' + f, prompt: `Is ${sub(f)} an empirical formula or a molecular formula?`, kind: 'mc', opts: ['Empirical', 'Molecular'], correct: emp ? 0 : 1,
      display: emp ? 'Empirical' : 'Molecular',
      steps: [[M, 'Empirical = <b>smallest whole-number ratio</b>; molecular = a <b>multiple</b> of it.'],
        big.includes(1) ? [M, `It has a subscript of <b>1</b>, so it can't be reduced → <b>empirical</b>.`]
          : g > 1 ? [W, `Every subscript (${big.join(', ')}) divides by <b>${g}</b> → ${sub(fromCounts(els, big.map(x => x / g)))}, so it's <b>molecular</b>.`]
            : [W, `No number divides all of ${big.join(', ')} → <b>empirical</b>.`]]
    };
  }
  const PCT_COMPOUNDS = ['H2O', 'CO2', 'NH3', 'CH4', 'C2H6', 'C3H8', 'C6H12O6', 'C2H6O', 'NaCl', 'KCl', 'MgCl2', 'CaCl2', 'H2SO4', 'HNO3', 'CaCO3', 'Na2CO3', 'NaHCO3', 'KNO3', 'Na3PO4', 'Na3PO3', 'Fe2O3', 'Al2O3', 'CuSO4', 'K2SO4', 'C2H8O', 'SO2', 'SO3', 'NO2', 'N2O5', 'P2O5', 'Rh2Cl2H4', 'C12H22O11'];
  function g13pct() {
    const f = pick(PCT_COMPOUNDS), c = parse(f), els = order(c), e = pick(els);
    const tot = molar(c), part = MASS[e] * c[e], pct = 100 * part / tot;
    const sum = els.map(x => `${c[x] > 1 ? c[x] + '(' + MASS[x].toFixed(2) + ')' : MASS[x].toFixed(2)}`).join(' + ');
    return {
      key: 'pct:' + f + e, prompt: `What is the percent by mass of ${NAME[e]} (${e}) in ${sub(f)}?`, given: 'Use molar masses with 2 decimal places; give the answer to two decimal places.',
      kind: 'num', value: pct, tol: 0.06, abs: true, unit: '%', display: r2(pct) + ' %',
      steps: [[M, '<b>% = (mass of all of that element ÷ molar mass) × 100</b>.'],
        [C, 'Molar masses (periodic table): ' + els.map(x => `${x} = <b>${MASS[x].toFixed(2)}</b>`).join(', ') + '.'],
        [B, `Top: ${c[e]} × ${MASS[e].toFixed(2)} = <b>${r2(part)}</b>.`],
        [W, `Bottom: ${sum} = <b>${r2(tot)} g/mol</b>.`],
        [W, `${r2(part)} ÷ ${r2(tot)} × 100 = <b>${r2(pct)} %</b>.`]]
    };
  }
  const MOL_EMP = ['CH2', 'CH', 'CH2O', 'CH3', 'C2H5', 'NO2', 'SO2', 'P2O5', 'C3H4O3', 'C2H3O', 'HO', 'CH2Cl', 'C2H5O', 'NH2'];
  function g13mol() {
    const ef = pick(MOL_EMP), c = parse(ef), k = R(2, 6), em = molar(c), mm = Math.round(em * k * 100) / 100;
    const els = order(c), ans = fromCounts(els, els.map(e => c[e] * k));
    return {
      key: 'mol:' + ef + k, prompt: `A compound has the empirical formula ${sub(ef)} and a molar mass of ${mm.toFixed(2)} g/mol. What is its molecular formula?`, given: 'Type subscripts as plain numbers (S2O3 for S₂O₃).',
      kind: 'formula', counts: parse(ans), display: sub(ans),
      steps: [[C, 'Empirical mass from the periodic table: ' + els.map(e => (c[e] > 1 ? c[e] + '×' : '') + MASS[e].toFixed(2)).join(' + ') + ` = <b>${r2(em)} g/mol</b>.`],
        [M, `<b>Factor = molar mass ÷ empirical mass</b> = ${mm.toFixed(2)} ÷ ${r2(em)} = <b>${k}</b>.`],
        [M, `<b>Multiply every subscript</b> by ${k} → <b>${sub(ans)}</b>.`]]
    };
  }
  const EMP_TARGETS = ['C2H5', 'CH', 'CH2O', 'C2H5O', 'C4H7O', 'Co2O3', 'NO3', 'NO2', 'N2O5', 'Fe2O3', 'Fe3O4', 'P2O5', 'Al2O3', 'C3H4O3', 'C3H8O', 'CH4', 'C5H4', 'Cr2O3', 'CH2', 'C3H5', 'N2O3', 'C2H3O2', 'CH3O', 'SO3', 'K2O', 'C3H8'];
  function empSolve(els, amounts) {   // grams -> formula via her method; returns {mol, ratio, mult, n}
    const mol = els.map((e, i) => amounts[i] / MASS[e]), mn = Math.min(...mol), ratio = mol.map(x => x / mn);
    for (const m of [1, 2, 3, 4, 5]) { const r = ratio.map(x => x * m); if (r.every(x => Math.abs(x - Math.round(x)) <= 0.1)) return { mol, ratio, mult: m, n: r.map(Math.round) }; }
    return null;
  }
  function g13emp() {
    for (let tries = 0; tries < 40; tries++) {
      const f = pick(EMP_TARGETS), c = parse(f), els = order(c), tot = molar(c);
      const grams = Math.random() < 0.3;
      let amounts, prompt, given, steps0;
      if (!grams) {
        const pcts = els.map(e => Math.round(10000 * MASS[e] * c[e] / tot) / 100);
        const last = els.length - 1, shown = pcts.slice(0, last);
        amounts = shown.concat([Math.round((100 - shown.reduce((a, b) => a + b, 0)) * 100) / 100]);
        prompt = `A compound contains ${shown.map((p, i) => `${p.toFixed(2)}% ${NAME[els[i]]}`).join(' and ')} and no other element except ${NAME[els[last]]}. What is its empirical formula?`;
        steps0 = [[M, `<b>Assume 100 g</b>, so percents become grams. ${NAME[els[last]][0].toUpperCase() + NAME[els[last]].slice(1)} by subtraction: 100 − ${shown.map(p => p.toFixed(2)).join(' − ')} = <b>${amounts[last].toFixed(2)} g</b>.`]];
      } else {
        const sample = Math.round((R(200, 900) / 100) * 1000) / 1000;
        const g0 = Math.round(1000 * sample * MASS[els[0]] * c[els[0]] / tot) / 1000;
        if (els.length !== 2) continue;
        amounts = [g0, Math.round((sample - g0) * 1000) / 1000];
        prompt = `A ${sample.toFixed(3)} g sample contains ${g0.toFixed(3)} g of ${NAME[els[0]]} and no other element except ${NAME[els[1]]}. What is the empirical formula?`;
        steps0 = [[W, `${NAME[els[1]][0].toUpperCase() + NAME[els[1]].slice(1)} by subtraction: ${sample.toFixed(3)} − ${g0.toFixed(3)} = <b>${amounts[1].toFixed(3)} g</b>.`]];
      }
      const s = empSolve(els, amounts);
      if (!s || fromCounts(els, s.n) !== f) continue;
      const small = els[s.mol.indexOf(Math.min(...s.mol))];
      return {
        key: 'emp:' + f + (grams ? 'g' : 'p'), prompt, given: 'Type subscripts as plain numbers (C2H5 for C₂H₅). Write the elements in the order they are listed.',
        kind: 'formula', counts: c, display: sub(f),
        steps: steps0.concat([
          [C, 'Molar masses: ' + els.map(e => `${e} = <b>${MASS[e].toFixed(2)}</b>`).join(', ') + '.'],
          [W, 'Grams → moles by factor label:<br>' + els.map((e, i) => gmol(String(amounts[i]), e, MASS[e].toFixed(2), s.mol[i].toFixed(4))).join(BR)],
          [M, `<b>Divide by the smallest</b> (${small}): ` + els.map((e, i) => `${e} = <b>${s.ratio[i].toFixed(2)}</b>`).join(', ') + '.'],
          s.mult === 1 ? [M, `All within <b>0.1</b> of whole numbers → round → <b>${sub(f)}</b>.`]
            : [M, `Not whole: ends in ${s.mult === 2 ? '.5 → <b>×2</b>' : s.mult === 3 ? '.33/.67 → <b>×3</b>' : s.mult === 4 ? '.25/.75 → <b>×4</b>' : '<b>×5</b>'} → ` + els.map((e, i) => `${e} ${(s.ratio[i] * s.mult).toFixed(2)}`).join(', ') + ` → <b>${sub(f)}</b>.`]])
      };
    }
    return g13mol();
  }

  /* ================= HW 14 ================= */
  const SOLUTES = [['NaCl', 58.44], ['KOH', 56.11], ['NaOH', 40.00], ['KCl', 74.55], ['CaCl2', 110.98], ['KBr', 119.00], ['C6H12O6', 180.18], ['NaNO3', 84.99], ['LiNO3', 68.95], ['NaF', 41.99], ['AgNO3', 169.87], ['NaClO4', 122.44], ['Al(NO3)3', 213.01], ['Ca(NO2)2', 132.10], ['C7H6O2', 122.13]];
  const v3 = (a, b) => { for (let t = 0; t < 200; t++) { const v = +(R(a * 1000, b * 1000) / 1000).toPrecision(3); if (sfOf(String(v)) === 3) return v; } return +(a + b).toFixed(2); };   // a value that shows exactly 3 sig figs
  function numQ(key, prompt, value, unit, sf, steps, given) {
    return { key, prompt, given, kind: 'num', value, tol: 0.006, unit, display: sig(value, sf) + ' ' + unit, steps: steps.concat([[M, `<b>Sig figs</b>: ${sf} (match the least precise number) → <b>${sig(value, sf)} ${unit}</b>.`]]) };
  }
  function g14M() {
    const [f, mm] = pick(SOLUTES), F = sub(f), kind = R(1, 6);
    const mL = R(50, 950) + (Math.random() < 0.5 ? 0 : 0.5), L = mL / 1000, mLs = mL.toFixed(1), Ls = (mL / 1000).toFixed(4);
    const Mv = v3(0.1, 2.5), mol = v3(0.05, 1.5), g = v3(1, 30), mms = mm.toFixed(2);
    const toL = [M, 'Volume to liters: ' + fl([mLs, 'mL'], [ML2L], [Ls, 'L'])];
    const mmStep = [C, `Molar mass of ${F} is <b>given</b>: <b>(${mms} g ${F} / 1 mol ${F})</b>; the number goes with grams.`];
    const rw = Ms => [M, `Rewrite molarity as two units: <b>${Ms} M = (${Ms} mol ${F} / 1 L)</b>.`];
    const start = [M, '<b>Start with the one-unit number</b>; two-unit numbers (M, g/mol) are conversion factors.'];
    if (kind === 1) { const v = mol / L; return numQ('M1' + f, `What is the molarity of a solution made by dissolving ${mol} mol of ${F} in enough water to make ${mLs} mL of solution?`, v, 'M', 3, [[M, 'Finding molarity itself: <b>M = mol ÷ L</b>.'], toL, [W, `${mol} mol ÷ ${Ls} L = <b>${v.toFixed(4)} M</b>.`]]); }
    if (kind === 2) { const n = g / mm, v = n / L; return numQ('M2' + f, `What is the molarity of a solution prepared by dissolving ${g} g of ${F} (molar mass ${mms} g/mol) in enough water to make ${mLs} mL of solution?`, v, 'M', 3, [[M, 'Finding molarity itself: get <b>mol</b> and <b>L</b>, then <b>M = mol ÷ L</b>.'], [M, 'Grams → moles: ' + gmol(String(g), F, mms, n.toFixed(5))], toL, [W, `M = ${n.toFixed(5)} mol ÷ ${Ls} L = <b>${v.toFixed(4)} M</b>.`]]); }
    if (kind === 3) { const v = Mv * L; return numQ('M3' + f, `How many moles of ${F} are in ${mLs} mL of a ${Mv} M ${F} solution?`, v, 'mol', 3, [rw(Mv), start, [W, fl([mLs, 'mL'], [ML2L, [[String(Mv), 'mol ' + F], ['1', 'L']]], [v.toFixed(5), 'mol ' + F])]]); }
    if (kind === 4) { const v = Mv * L * mm; return numQ('M4' + f, `How many grams of ${F} (molar mass ${mms} g/mol) are needed to make ${mLs} mL of a ${Mv} M solution?`, v, 'g', 3, [rw(Mv), mmStep, [M, '<b>Start with the volume</b> and chain mL → L → mol → g:'], [W, fl([mLs, 'mL'], [ML2L, [[String(Mv), 'mol ' + F], ['1', 'L']], [[mms, 'g ' + F], ['1', 'mol ' + F]]], [v.toFixed(3), 'g ' + F])]]); }
    if (kind === 5) { const v = mol / Mv; return numQ('M5' + f, `What volume (in L) of a ${Mv} M ${F} solution contains ${mol} mol of ${F}?`, v, 'L', 3, [rw(Mv), [M, '<b>Start with the moles</b> and flip the molarity (1 L on top) so mol cancels:'], [W, fl([String(mol), 'mol ' + F], [[['1', 'L'], [String(Mv), 'mol ' + F]]], [v.toFixed(4), 'L'])]]); }
    const v = g / mm / Mv * 1000;
    return numQ('M6' + f, `What volume (in mL) of a ${Mv} M ${F} solution would you evaporate to collect ${g} g of ${F} (molar mass ${mms} g/mol)?`, v, 'mL', 3, [mmStep, rw(Mv), [M, '<b>Start with the grams</b> and chain g → mol → L → mL:'], [W, fl([String(g), 'g ' + F], [[['1', 'mol ' + F], [mms, 'g ' + F]], [['1', 'L'], [String(Mv), 'mol ' + F]], [['1000', 'mL'], ['1', 'L']]], [v.toFixed(2), 'mL'])]]);
  }
  function g14dil() {
    const [f] = pick(SOLUTES.slice(0, 11)), F = sub(f), kind = R(1, 3);
    const M1 = v3(1, 12), V1 = +(R(100, 500) / 10).toFixed(1), V2 = pick([100.0, 150.0, 175.0, 200.0, 250.0, 500.0, 1000.0]), M2 = v3(0.05, 0.9);
    const eq = [M, 'Dilution equation: <b>M₁V₁ = M₂V₂</b> (volumes in the same unit).'];
    if (kind === 1) { const v = M1 * V1 / V2; return numQ('D1' + f, `${V1.toFixed(1)} mL of ${M1} M ${F} is diluted with water to a final volume of ${V2.toFixed(1)} mL. What is the new concentration?`, v, 'M', 3, [eq, [W, `"${V1.toFixed(1)} mL <i>of</i> ${M1} M" → <b>M₁ = ${M1}</b>, <b>V₁ = ${V1.toFixed(1)} mL</b>; <b>V₂ = ${V2.toFixed(1)} mL</b>.`], [W, `M₂ = ${M1} × ${V1.toFixed(1)} ÷ ${V2.toFixed(1)} = <b>${v.toFixed(4)}</b>.`]]); }
    if (kind === 2) { const v = M2 * V2 / M1; return numQ('D2' + f, `How many mL of ${M1} M ${F} are needed to prepare ${V2.toFixed(1)} mL of ${M2} M ${F}?`, v, 'mL', 3, [eq, [W, `Concentrated: <b>M₁ = ${M1}</b>, <b>V₁ = ?</b>. Dilute: <b>M₂ = ${M2}</b>, <b>V₂ = ${V2.toFixed(1)} mL</b>.`], [W, `V₁ = ${M2} × ${V2.toFixed(1)} ÷ ${M1} = <b>${v.toFixed(3)} mL</b>.`]]); }
    const v = M1 * V1 / M2; return numQ('D3' + f, `To what final volume (in mL) should ${V1.toFixed(1)} mL of ${M1} M ${F} be diluted to make a ${M2} M solution?`, v, 'mL', 3, [eq, [W, `<b>M₁ = ${M1}</b>, <b>V₁ = ${V1.toFixed(1)} mL</b>, <b>M₂ = ${M2}</b>, <b>V₂ = ?</b>.`], [W, `V₂ = ${M1} × ${V1.toFixed(1)} ÷ ${M2} = <b>${v.toFixed(2)} mL</b>.`]]);
  }
  const WORDS14 = [
    ['1 g of sugar is dissolved in 50 g of water. What is the mass of the solution?', ['51 g', '50 g', '49 g', 'between 50 and 51 g'], 0, [[M, 'Mass is conserved: <b>solution = solute + solvent</b> = 1 + 50 = <b>51 g</b>.']]],
    ['Some water is boiled off a salt solution. What happens?', ['Solute stays the same, solvent decreases', 'Both decrease', 'Solute decreases, solvent stays the same', 'Both increase'], 0, [[M, 'Boiling removes the <b>solvent</b> (water); the salt <b>solute stays</b>.']]],
    ['In salt water, which is the solute?', ['the salt', 'the water', 'the salt water', 'neither'], 0, [[M, '<b>Solute</b> = the smaller amount that gets dissolved → <b>the salt</b>.']]],
    ['In salt water, which is the solvent?', ['the water', 'the salt', 'the salt water', 'neither'], 0, [[M, '<b>Solvent</b> = the larger amount that does the dissolving → <b>water</b>.']]],
    ['A solution has solid sitting on the bottom that won\'t dissolve no matter how long you stir. It is:', ['saturated', 'unsaturated', 'supersaturated', 'diluted'], 0, [[M, '<b>Saturated</b> = at the limit; extra solid stays on the bottom.']]],
    ['More solute still dissolves when added. The solution is:', ['unsaturated', 'saturated', 'supersaturated', 'a precipitate'], 0, [[M, '<b>Unsaturated</b> = below the limit; more can dissolve.']]],
    ['A solution was heated, loaded with solute, and cooled; it holds more than it normally could. It is:', ['supersaturated', 'saturated', 'unsaturated', 'concentrated by boiling'], 0, [[M, 'Heated then cooled, holding extra = <b>supersaturated</b>.']]],
    ['When a solution is diluted, the molarity:', ['goes down', 'goes up', 'stays the same', 'doubles'], 0, [[M, 'M = mol ÷ L; more liters → <b>molarity goes down</b> (and the color gets lighter).']]],
    ['Which is NOT a way to write a 2.0 molarity solution?', ['2.0 molal', '2.0 M', '[2.0]', '2.0 mol solute / 1 L solution'], 0, [[M, 'Molarity is written <b>M</b>, <b>molar</b>, <b>[ ]</b> or <b>mol/L</b>; <b>molal</b> is a different unit.']]],
    ['Why must both volumes in M₁V₁ = M₂V₂ have the same unit?', ['So the units cancel', 'So the flask is big enough', 'So it dilutes faster', 'They don\'t need to'], 0, [[M, 'Volumes are on both sides; matching units <b>cancel</b>.']]],
    ['To make a volumetric dilution, you fill the flask with water:', ['to the graduation line', 'to the very top', 'halfway', 'until the color disappears'], 0, [[M, 'Fill to the <b>graduation line</b>, not the top.']]],
    ['Molarity is:', ['moles of solute per liter of solution', 'grams of solute per liter of solution', 'moles of solute per kg of solvent', 'liters of solution per mole'], 0, [[M, '<b>M = mol solute ÷ L solution</b>.']]],
  ];
  function g14words() {
    const [q, opts, c, steps] = pick(WORDS14), o = shuffle(opts.map((t, i) => [t, i]));
    return { key: 'w14:' + q, prompt: q, kind: 'mc', opts: o.map(x => x[0]), correct: o.findIndex(x => x[1] === c), display: opts[c], steps };
  }

  /* ================= HW 15 ================= */
  const DIATOMIC = { hydrogen: 'H', nitrogen: 'N', oxygen: 'O', fluorine: 'F', chlorine: 'Cl', bromine: 'Br', iodine: 'I' };
  const MONO = { sodium: 'Na', potassium: 'K', magnesium: 'Mg', carbon: 'C', neon: 'Ne', helium: 'He', lithium: 'Li', boron: 'B', sulfur: 'S', iron: 'Fe', copper: 'Cu', calcium: 'Ca', argon: 'Ar', zinc: 'Zn', silicon: 'Si', aluminum: 'Al' };
  function g15dia() {
    const di = Math.random() < 0.5, nm = pick(Object.keys(di ? DIATOMIC : MONO)), s = (di ? DIATOMIC : MONO)[nm];
    const opts = shuffle([s, s + '₂']), ans = di ? s + '₂' : s;
    return { key: 'dia:' + nm, prompt: `How is the element ${nm} written on its own (as it exists in nature)?`, kind: 'mc', opts, correct: opts.indexOf(ans), display: ans,
      steps: [[M, 'The seven diatomics: <b>H₂, N₂, O₂, F₂, Cl₂, Br₂, I₂</b> (HOFBrINCl).'], [W, di ? `${nm} is one of them → <b>${ans}</b>.` : `${nm} is not → just <b>${ans}</b>.`]] };
  }
  /* balancing bank: [reactants, products, coefficients, type] — every entry is checked by the tests */
  const BAL = [
    [['H2', 'O2'], ['H2O'], [2, 1, 2], 'synthesis'], [['Al', 'Br2'], ['AlBr3'], [2, 3, 2], 'synthesis'], [['Na', 'Cl2'], ['NaCl'], [2, 1, 2], 'synthesis'],
    [['Mg', 'O2'], ['MgO'], [2, 1, 2], 'synthesis'], [['Fe', 'O2'], ['Fe2O3'], [4, 3, 2], 'synthesis'], [['N2', 'H2'], ['NH3'], [1, 3, 2], 'synthesis'],
    [['P4', 'O2'], ['P2O5'], [1, 5, 2], 'synthesis'], [['Li', 'O2'], ['Li2O'], [4, 1, 2], 'synthesis'], [['Fe', 'Cl2'], ['FeCl3'], [2, 3, 2], 'synthesis'],
    [['Na', 'I2'], ['NaI'], [2, 1, 2], 'synthesis'], [['P4', 'O2'], ['P2O3'], [1, 3, 2], 'synthesis'], [['Al', 'O2'], ['Al2O3'], [4, 3, 2], 'synthesis'],
    [['CH4', 'O2'], ['CO2', 'H2O'], [1, 2, 1, 2], 'combustion'], [['C3H8', 'O2'], ['CO2', 'H2O'], [1, 5, 3, 4], 'combustion'], [['C2H6', 'O2'], ['CO2', 'H2O'], [2, 7, 4, 6], 'combustion'],
    [['C4H10', 'O2'], ['CO2', 'H2O'], [2, 13, 8, 10], 'combustion'], [['C2H6O', 'O2'], ['CO2', 'H2O'], [1, 3, 2, 3], 'combustion'], [['C6H12O6', 'O2'], ['CO2', 'H2O'], [1, 6, 6, 6], 'combustion'],
    [['C3H6O', 'O2'], ['CO2', 'H2O'], [1, 4, 3, 3], 'combustion'], [['C8H8', 'O2'], ['CO2', 'H2O'], [1, 10, 8, 4], 'combustion'], [['C2H4', 'O2'], ['CO2', 'H2O'], [1, 3, 2, 2], 'combustion'],
    [['KClO3'], ['KCl', 'O2'], [2, 2, 3], 'decomposition'], [['H2O2'], ['H2O', 'O2'], [2, 2, 1], 'decomposition'], [['CaCO3'], ['CaO', 'CO2'], [1, 1, 1], 'decomposition'],
    [['HgO'], ['Hg', 'O2'], [2, 2, 1], 'decomposition'], [['H2O'], ['H2', 'O2'], [2, 2, 1], 'decomposition'], [['NaN3'], ['Na', 'N2'], [2, 2, 3], 'decomposition'],
    [['Zn', 'HCl'], ['ZnCl2', 'H2'], [1, 2, 1, 1], 'single replacement'], [['Al', 'HCl'], ['AlCl3', 'H2'], [2, 6, 2, 3], 'single replacement'], [['Cu', 'AgNO3'], ['Cu(NO3)2', 'Ag'], [1, 2, 1, 2], 'single replacement'],
    [['Cl2', 'NaBr'], ['NaCl', 'Br2'], [1, 2, 2, 1], 'single replacement'], [['Br2', 'KI'], ['KBr', 'I2'], [1, 2, 2, 1], 'single replacement'], [['Mg', 'NaNO3'], ['Mg(NO3)2', 'Na'], [1, 2, 1, 2], 'single replacement'],
    [['Fe', 'CuSO4'], ['FeSO4', 'Cu'], [1, 1, 1, 1], 'single replacement'], [['Na', 'H2O'], ['NaOH', 'H2'], [2, 2, 2, 1], 'single replacement'],
    [['AgNO3', 'NaCl'], ['AgCl', 'NaNO3'], [1, 1, 1, 1], 'double replacement'], [['Pb(NO3)2', 'KI'], ['PbI2', 'KNO3'], [1, 2, 1, 2], 'double replacement'], [['BaCl2', 'Na2SO4'], ['BaSO4', 'NaCl'], [1, 1, 1, 2], 'double replacement'],
    [['H3PO4', 'NaOH'], ['Na3PO4', 'H2O'], [1, 3, 1, 3], 'double replacement'], [['Al2O3', 'H2SO4'], ['Al2(SO4)3', 'H2O'], [1, 3, 1, 3], 'double replacement'], [['Ca(OH)2', 'HCl'], ['CaCl2', 'H2O'], [1, 2, 1, 2], 'double replacement'],
    [['CuCl2', 'NaOH'], ['Cu(OH)2', 'NaCl'], [1, 2, 1, 2], 'double replacement'], [['Pb(NO3)2', 'K2CrO4'], ['PbCrO4', 'KNO3'], [1, 1, 1, 2], 'double replacement'], [['Mg(OH)2', 'HNO3'], ['Mg(NO3)2', 'H2O'], [1, 2, 1, 2], 'double replacement'],
    [['NiSO4', 'NaOH'], ['Ni(OH)2', 'Na2SO4'], [1, 2, 1, 1], 'double replacement'], [['Na3PO4', 'CaCl2'], ['Ca3(PO4)2', 'NaCl'], [2, 3, 1, 6], 'double replacement'],
    [['C', 'SO2'], ['CS2', 'CO'], [5, 2, 1, 4], null], [['Fe2O3', 'CO'], ['Fe', 'CO2'], [1, 3, 2, 3], null], [['NH3', 'O2'], ['NO', 'H2O'], [4, 5, 4, 6], null], [['N4', 'F2'], ['NF3'], [1, 6, 4], null],
  ];
  const eqn = (re, pr, co) => re.map((f, i) => (co && co[i] > 1 ? co[i] + ' ' : '') + sub(f)).join(' + ') + ' → ' + pr.map((f, i) => (co && co[re.length + i] > 1 ? co[re.length + i] + ' ' : '') + sub(f)).join(' + ');
  function g15bal() {
    const [re, pr, co] = pick(BAL), all = re.concat(pr);
    const polys = ['NO3', 'SO4', 'PO4', 'CrO4', 'OH'].filter(p => re.some(f => f.includes(p)) && pr.some(f => f.includes(p)) && !(p === 'OH' && pr.includes('H2O')));
    const combust = pr.includes('CO2') && pr.includes('H2O') && re.includes('O2');
    const steps = [[W, `Unbalanced: ${eqn(re, pr)}. Count each atom on both sides.`]];
    if (polys.length) steps.push([M, `Keep <b>${polys.map(sub).join(', ')}</b> together as a group on both sides.`]);
    if (combust) steps.push([M, '<b>Combustion order</b>: C first, then H, then <b>O last</b>. Odd O total? <b>Double the fuel</b>.']);
    else steps.push([M, '<b>Balance everything except H and O first</b>, then H, then O; leave lone elements for last.']);
    steps.push([W, `Balanced: <b>${eqn(re, pr, co)}</b>.`], [W, `Coefficients in order (type 1 for an empty blank): <b>${co.join(', ')}</b>.`]);
    return { key: 'bal:' + all.join('+'), prompt: `Balance: ${eqn(re, pr)}`, given: 'Type the coefficients in order, separated by commas or spaces. Include any 1s (like eLearn).',
      kind: 'coef', coef: co, display: co.join(', '), steps };
  }
  const TYPE_OPTS = ['synthesis', 'decomposition', 'single replacement', 'double replacement', 'combustion'];
  function g15type() {
    const pool = BAL.filter(b => b[3]), [re, pr, co, t] = pick(pool);
    const why = { synthesis: 'only <b>one product</b>', decomposition: 'only <b>one reactant</b>', 'single replacement': 'an element is <b>alone</b> on each side and swaps in', 'double replacement': 'two compounds <b>swap partners</b>', combustion: 'fuel + <b>O₂</b> → <b>CO₂ + H₂O</b>' }[t];
    return { key: 'type:' + re.join('+'), prompt: `What type of reaction is this? ${eqn(re, pr, co)}`, kind: 'mc', opts: TYPE_OPTS, correct: TYPE_OPTS.indexOf(t), display: t,
      steps: [[M, 'Check in this order: <b>combustion</b> (O₂ in, CO₂ + H₂O out), <b>one product</b> = synthesis, <b>one reactant</b> = decomposition, <b>lone element</b> = single, <b>swap</b> = double.'], [W, `Here ${why} → <b>${t}</b>.`]] };
  }

  /* ions for products, solubility and net ionic */
  const CAT = { Li: ['Li', 1, 'lithium'], Na: ['Na', 1, 'sodium'], K: ['K', 1, 'potassium'], NH4: ['NH4', 1, 'ammonium', 1], Ag: ['Ag', 1, 'silver'], Mg: ['Mg', 2, 'magnesium'], Ca: ['Ca', 2, 'calcium'],
    Ba: ['Ba', 2, 'barium'], Sr: ['Sr', 2, 'strontium'], Cu: ['Cu', 2, 'copper(II)'], Zn: ['Zn', 2, 'zinc'], Pb: ['Pb', 2, 'lead(II)'], Fe2: ['Fe', 2, 'iron(II)'], Fe3: ['Fe', 3, 'iron(III)'], Ni: ['Ni', 2, 'nickel(II)'], Al: ['Al', 3, 'aluminum'], Co: ['Co', 2, 'cobalt(II)'] };
  const AN = { Cl: ['Cl', -1, 'chloride'], Br: ['Br', -1, 'bromide'], I: ['I', -1, 'iodide'], NO3: ['NO3', -1, 'nitrate', 1], C2H3O2: ['C2H3O2', -1, 'acetate', 1], OH: ['OH', -1, 'hydroxide', 1],
    SO4: ['SO4', -2, 'sulfate', 1], CO3: ['CO3', -2, 'carbonate', 1], PO4: ['PO4', -3, 'phosphate', 1], S: ['S', -2, 'sulfide'], CrO4: ['CrO4', -2, 'chromate', 1] };
  const G1 = ['Li', 'Na', 'K', 'NH4'];
  function salt(ck, ak) {
    const [cs, cc, , cp] = CAT[ck], [as, ac, , ap] = AN[ak], g = gcd(cc, -ac), nc = -ac / g, na = cc / g;
    const part = (s, n, poly) => n === 1 ? s : (poly ? `(${s})${n}` : s + n);
    return { f: part(cs, nc, cp) + part(as, na, ap), nc, na, ck, ak, name: CAT[ck][2] + ' ' + AN[ak][2] };
  }
  /* course solubility chart; returns [soluble, reason html, tag] */
  function soluble(ck, ak) {
    const c = CAT[ck][0] === 'NH4' ? 'NH₄⁺' : sub(CAT[ck][0]) + chg(CAT[ck][1]), a = sub(AN[ak][0]) + chg(AN[ak][1]);
    if (G1.includes(ck)) return [true, `The positive ion <b>${c}</b> is Group 1/NH₄⁺ → <b>always soluble</b>; stop.`, M];
    if (ak === 'NO3' || ak === 'C2H3O2') return [true, `${c} isn't Group 1/NH₄⁺, so go to the negative ion: <b>${a}</b> compounds are <b>always soluble</b>.`, C];
    if (['Cl', 'Br', 'I'].includes(ak)) { const ex = ['Ag', 'Pb'].includes(ck); return [!ex, `${a} is soluble <b>except Ag⁺, Pb²⁺, Hg₂²⁺</b>; ${c} ${ex ? '<b>is</b> an exception → <b>insoluble</b>' : 'is not → <b>soluble</b>'}.`, C]; }
    if (ak === 'SO4') { const ex = ['Ba', 'Sr', 'Ca', 'Pb', 'Ag'].includes(ck); return [!ex, `${a} is soluble <b>except Ba²⁺, Sr²⁺, Ca²⁺, Pb²⁺, Ag⁺, Hg₂²⁺</b>; ${c} ${ex ? '<b>is</b> an exception → <b>insoluble</b>' : 'is not → <b>soluble</b>'}.`, C]; }
    if (ak === 'OH') { const ex = ck === 'Ba'; return [ex, `${a} is insoluble <b>except Group 1, NH₄⁺ and Ba²⁺</b>; ${c} ${ex ? '<b>is</b> an exception → <b>soluble</b>' : 'is not → <b>insoluble</b>'}.`, C]; }
    return [false, `${a} is on the <b>insoluble</b> side (except Group 1 and NH₄⁺); ${c} is not an exception → <b>insoluble</b>.`, C];
  }
  const AMBIG = (ck, ak) => (ak === 'OH' && ['Ca', 'Sr'].includes(ck)) || (ak === 'S' && ['Ca', 'Sr', 'Ba'].includes(ck)) || (ak === 'SO4' && ck === 'Ca') || (ck === 'Ag' && ['C2H3O2', 'OH'].includes(ak));
  function randSalt(filter) {
    for (;;) { const ck = pick(Object.keys(CAT)), ak = pick(Object.keys(AN)); if (AMBIG(ck, ak)) continue; if (filter && !filter(ck, ak)) continue; return salt(ck, ak); }
  }
  function g16sol() {
    const s = randSalt(), [ok, why, tag] = soluble(s.ck, s.ak);
    return { key: 'sol:' + s.f, prompt: `Is ${sub(s.f)} (${s.name}) soluble or insoluble in water?`, given: 'Use the solubility chart, like on the test.', kind: 'mc', opts: ['Soluble (aq)', 'Insoluble (s)'], correct: ok ? 0 : 1, display: ok ? 'Soluble (aq)' : 'Insoluble (s)',
      steps: [[M, 'Use the chart <b>top-down</b>: check the <b>positive ion first</b>, then the negative ion; stop at the <b>first rule</b> that applies.'], [tag, why]] };
  }
  /* balance a double replacement AB + CD -> AD + CB with small integers */
  function balanceDR(s1, s2, p1, p2) {
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let c = 1; c <= 6; c++) for (let d = 1; d <= 6; d++) {
      if (a * s1.nc !== c * p1.nc || a * s1.na !== d * p2.na || b * s2.nc !== d * p2.nc || b * s2.na !== c * p1.na) continue;
      if (gcdAll([a, b, c, d]) === 1) return [a, b, c, d];
    }
    return null;
  }
  const ionStr = (k, key, isCat) => { const d = isCat ? CAT[key] : AN[key]; return (k > 1 ? k + ' ' : '') + (d[0] === 'NH4' ? 'NH₄⁺' : sub(d[0]) + chg(d[1])) + '(aq)'; };
  let PAIRS = null;
  function allPairs() {   // every valid soluble + soluble double replacement, computed once
    if (PAIRS) return PAIRS;
    const sols = [];
    for (const ck in CAT) for (const ak in AN) if (!AMBIG(ck, ak) && soluble(ck, ak)[0]) sols.push(salt(ck, ak));
    PAIRS = { ppt: [], none: [] };
    for (const s1 of sols) for (const s2 of sols) {
      if (s1.ck === s2.ck || s1.ak === s2.ak || CAT[s1.ck][0] === CAT[s2.ck][0]) continue;
      if (AMBIG(s1.ck, s2.ak) || AMBIG(s2.ck, s1.ak)) continue;
      const p1 = salt(s1.ck, s2.ak), p2 = salt(s2.ck, s1.ak), sol1 = soluble(p1.ck, p1.ak)[0], sol2 = soluble(p2.ck, p2.ak)[0];
      if (!sol1 && !sol2) continue;   // at most one precipitate
      const co = balanceDR(s1, s2, p1, p2); if (!co) continue;
      (sol1 && sol2 ? PAIRS.none : PAIRS.ppt).push({ s1, s2, p1, p2, sol1, sol2, co });
    }
    return PAIRS;
  }
  function drPair(needPpt) { const P = allPairs(); return pick(needPpt ? P.ppt : P.none); }
  const ph = ok => ok ? '(aq)' : '(s)';
  function g16goes() {
    const r = drPair(Math.random() < 0.55 ? true : false), { s1, s2, p1, p2, sol1, sol2, co } = r;
    const goes = !(sol1 && sol2);
    const mol = `${co[0] > 1 ? co[0] + ' ' : ''}${sub(s1.f)}(aq) + ${co[1] > 1 ? co[1] + ' ' : ''}${sub(s2.f)}(aq) → ${co[2] > 1 ? co[2] + ' ' : ''}${sub(p1.f)}${ph(sol1)} + ${co[3] > 1 ? co[3] + ' ' : ''}${sub(p2.f)}${ph(sol2)}`;
    return { key: 'goes:' + s1.f + s2.f, prompt: `Will this reaction occur as written? ${mol}`, kind: 'mc', opts: ['Yes, it goes', 'No reaction'], correct: goes ? 0 : 1, display: goes ? 'Yes, it goes' : 'No reaction',
      steps: [[M, 'Look only at the <b>product phases</b>: a <b>solid, gas or liquid water</b> means it goes; <b>all (aq)</b> means no reaction.'],
        [W, goes ? `${sub((sol1 ? p2 : p1).f)} is <b>(s)</b>, a precipitate → <b>it goes</b>.` : 'Both products are <b>(aq)</b> → <b>no reaction</b>.']] };
  }
  function ionicParts(r) {
    const { s1, s2, p1, p2, sol1, sol2, co } = r;
    const left = [ionStr(co[0] * s1.nc, s1.ck, 1), ionStr(co[0] * s1.na, s1.ak), ionStr(co[1] * s2.nc, s2.ck, 1), ionStr(co[1] * s2.na, s2.ak)];
    const side = (p, ok, k) => ok ? [ionStr(k * p.nc, p.ck, 1), ionStr(k * p.na, p.ak)] : [(k > 1 ? k + ' ' : '') + sub(p.f) + '(s)'];
    const right = side(p1, sol1, co[2]).concat(side(p2, sol2, co[3]));
    const full = left.join(' + ') + ' → ' + right.join(' + ');
    const mol = `${co[0] > 1 ? co[0] + ' ' : ''}${sub(s1.f)}(aq) + ${co[1] > 1 ? co[1] + ' ' : ''}${sub(s2.f)}(aq) → ${co[2] > 1 ? co[2] + ' ' : ''}${sub(p1.f)}${ph(sol1)} + ${co[3] > 1 ? co[3] + ' ' : ''}${sub(p2.f)}${ph(sol2)}`;
    const ppt = sol1 ? p2 : p1, pk = sol1 ? co[3] : co[2];
    const specC = sol1 ? p1.ck : p2.ck, specA = sol1 ? p1.ak : p2.ak;
    // net: the ions that make the precipitate, reduced
    let a = pk * ppt.nc, b = pk * ppt.na, k = pk; const g = gcdAll([a, b, k]); a /= g; b /= g; k /= g;
    const net = `${ionStr(a, ppt.ck, 1)} + ${ionStr(b, ppt.ak)} → ${k > 1 ? k + ' ' : ''}${sub(ppt.f)}(s)`;
    const sp = salt(specC, specA), wrongNet = `${ionStr(sp.nc, specC, 1)} + ${ionStr(sp.na, specA)} → ${sub(sp.f)}(s)`;
    const specs = `${CAT[specC][0] === 'NH4' ? 'NH₄⁺' : sub(CAT[specC][0]) + chg(CAT[specC][1])} and ${sub(AN[specA][0]) + chg(AN[specA][1])}`;
    return { mol, full, net, wrongNet, ppt, specs };
  }
  function g16net() {
    const r = drPair(true), P = ionicParts(r), ask = pick(['net', 'net', 'full', 'spec']);
    const steps = [[C, `Phases from the <b>solubility chart</b>: ${sub(r.p1.f)} ${r.sol1 ? '(aq)' : '<b>(s)</b>'}, ${sub(r.p2.f)} ${r.sol2 ? '(aq)' : '<b>(s)</b>'}.`],
      [M, `<b>Full ionic</b>: split every (aq), keep the solid together: <b>${P.full}</b>.`],
      [M, `<b>Spectators</b> (same on both sides): <b>${P.specs}</b>. Cancel them.`],
      [M, `<b>Net ionic</b>: <b>${P.net}</b>.`]];
    if (ask === 'spec') {
      const all = shuffle([P.specs, sub(AN[P.ppt.ak][0]) + chg(AN[P.ppt.ak][1]) + ' and ' + (CAT[P.ppt.ck][0] === 'NH4' ? 'NH₄⁺' : sub(CAT[P.ppt.ck][0]) + chg(CAT[P.ppt.ck][1])), 'there are no spectators', 'all four ions']);
      return { key: 'spec:' + r.s1.f + r.s2.f, prompt: `${P.mol}. What are the spectator ions?`, kind: 'mc', opts: all, correct: all.indexOf(P.specs), display: P.specs, steps };
    }
    const opts = shuffle([P.net, P.full, P.mol, P.wrongNet].filter((x, i, a) => a.indexOf(x) === i));
    const want = ask === 'net' ? P.net : P.full;
    return { key: ask + ':' + r.s1.f + r.s2.f, prompt: `${P.mol}. Which is the <b>${ask === 'net' ? 'net ionic' : 'full (complete) ionic'}</b> equation?`, html: true, kind: 'mc', opts, correct: opts.indexOf(want), display: want, steps };
  }

  /* oxidation numbers */
  const EN = ['F', 'O', 'Cl', 'N', 'Br', 'I', 'S', 'C', 'H', 'P', 'Se'];
  const USUAL = { F: -1, O: -2, Cl: -1, N: -3, Br: -1, I: -1, S: -2, C: -4, P: -3 };
  const FIXED_METAL = { Li: 1, Na: 1, K: 1, Mg: 2, Ca: 2, Ba: 2, Sr: 2, Al: 3, Zn: 2, Ag: 1 };
  const OXLIST = [['N2O', 0, 'N'], ['NCl3', 0, 'N'], ['BrO3', -1, 'Br'], ['Na2C2O4', 0, 'C'], ['OF2', 0, 'O'], ['N2O4', 0, 'N'], ['HNO3', 0, 'N'], ['NO3', -1, 'N'], ['NO2', -1, 'N'], ['NH3', 0, 'N'],
    ['NH4', 1, 'N'], ['CaH2', 0, 'H'], ['NaH', 0, 'H'], ['H2O', 0, 'O'], ['H2S', 0, 'S'], ['SO2', 0, 'S'], ['SO3', 0, 'S'], ['SO4', -2, 'S'], ['SO3', -2, 'S'], ['H2SO4', 0, 'S'], ['CO2', 0, 'C'], ['CO', 0, 'C'],
    ['CH4', 0, 'C'], ['CO3', -2, 'C'], ['MnO4', -1, 'Mn'], ['Cr2O7', -2, 'Cr'], ['CrO4', -2, 'Cr'], ['ClO4', -1, 'Cl'], ['ClO3', -1, 'Cl'], ['ClO', -1, 'Cl'], ['ClO2', -1, 'Cl'], ['ClBr', 0, 'Br'],
    ['IF5', 0, 'I'], ['PCl5', 0, 'P'], ['PO4', -3, 'P'], ['Fe2O3', 0, 'Fe'], ['FeO', 0, 'Fe'], ['KMnO4', 0, 'Mn'], ['Na2SO4', 0, 'S'], ['NO', 0, 'N'], ['NO2', 0, 'N'], ['N2', 0, 'N'], ['O2', 0, 'O'],
    ['Na', 0, 'Na'], ['Fe', 3, 'Fe'], ['S', -2, 'S'], ['Cl', -1, 'Cl'], ['Al', 3, 'Al'], ['Cl2', 0, 'Cl'], ['C2H6', 0, 'C'], ['MgCl2', 0, 'Cl'], ['K2O', 0, 'K'], ['SF6', 0, 'S'], ['Cu', 2, 'Cu'], ['H2O2', 0, 'H'], ['NaCl', 0, 'Na']];
  function oxSolve(f, charge) {
    const c = parse(f), els = Object.keys(c), ox = {}, steps = [], sp = sub(f) + chg(charge);
    const tot = charge, total = e => els.reduce((s, x) => s + (x in ox ? ox[x] * c[x] : 0), 0);
    if (els.length === 1) {
      ox[els[0]] = charge / c[els[0]];
      steps.push(charge === 0 ? [M, `A <b>neutral element</b> by itself is <b>0</b> (even diatomic ones).`] : [M, `A <b>monatomic ion</b>'s oxidation number is its <b>charge</b> → <b>${charge > 0 ? '+' : ''}${charge}</b>.`]);
      return { ox, steps };
    }
    steps.push([M, `All oxidation numbers add up to the overall charge: <b>${String(tot).replace('-', '−')}</b>${charge ? ' (it\'s an ion)' : ' (neutral)'}.`]);
    const metal = els.find(e => e in FIXED_METAL);
    if (metal) { ox[metal] = FIXED_METAL[metal]; steps.push([B, `<b>${metal} = +${FIXED_METAL[metal]}</b> (its usual column charge).`]); }
    if ('H' in c && !(els.length === 2 && metal)) { ox.H = 1; steps.push([M, `<b>H = +1</b> (not bonded to a Group 1/2 metal).`]); }
    else if ('H' in c && metal) { ox.H = -1; steps.push([M, `H with a Group 1/2 metal is <b>−1</b> (a hydride).`]); }
    let left = els.filter(e => !(e in ox));
    while (left.length > 1) {
      const rank = x => EN.indexOf(x) < 0 ? 99 : EN.indexOf(x), e = left.slice().sort((a, b) => rank(a) - rank(b))[0];
      ox[e] = USUAL[e]; steps.push([B, `${e} is the most electronegative left → it gets its usual charge, <b>${e} = ${String(USUAL[e]).replace('-', '−')}</b>.`]);
      left = els.filter(x => !(x in ox));
    }
    if (left.length === 1) {
      const e = left[0], v = (tot - total()) / c[e]; ox[e] = v;
      const sg = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v), known = els.filter(x => x !== e).map(x => `${c[x] > 1 ? c[x] : ''}(${sg(ox[x])})`).join(' + ');
      steps.push([W, `${c[e] > 1 ? c[e] : ''}${e} + ${known} = ${sg(tot) || 0} → <b>${e} = ${sg(v) || 0}</b>.`]);
    }
    return { ox, steps };
  }
  function g16ox() {
    const [f, ch, e] = pick(OXLIST), s = oxSolve(f, ch), v = s.ox[e];
    return { key: 'ox:' + f + ch + e, prompt: `What is the oxidation number of ${e} in ${sub(f) + chg(ch)}?`, given: 'Type a signed whole number, like +3, -2 or 0.', kind: 'int', value: v, display: (v > 0 ? '+' : '') + v, steps: s.steps };
  }
  /* redox half-reactions and agents */
  const HALVES = [['Fe', 3], ['Fe', 2], ['Cu', 2], ['Zn', 2], ['Ag', 1], ['Al', 3], ['Mg', 2], ['Ni', 2], ['Pb', 2], ['Sn', 2], ['Cr', 3], ['Na', 1], ['Ca', 2], ['Co', 2]];
  const NONM = [['O', 2, -2], ['Cl', 2, -1], ['Br', 2, -1], ['I', 2, -1], ['F', 2, -1], ['S', 1, -2]];
  function g16redox() {
    let txt, ox, sp;
    if (Math.random() < 0.6) {
      const [m, n] = pick(HALVES), e = `${n} e⁻`, up = Math.random() < 0.5;
      txt = up ? `${m} → ${m}${chg(n)} + ${e}` : `${m}${chg(n)} + ${e} → ${m}`; ox = up; sp = up ? m : m + chg(n);
    } else {
      const [x, k, q] = pick(NONM), up = Math.random() < 0.4, ne = -q * k, el = (k > 1 ? sub(x + k) : x), ion = (k > 1 ? k + ' ' : '') + x + chg(q);
      txt = up ? `${ion} → ${el} + ${ne} e⁻` : `${el} + ${ne} e⁻ → ${ion}`; ox = up; sp = up ? x + chg(q) : el;
    }
    const ask = pick(['type', 'agent']);
    const base = [[M, '<b>Electrons on the right = lost = oxidation</b> (charge goes up). <b>Electrons on the left = gained = reduction</b> (charge goes down). OIL RIG.']];
    if (ask === 'type') return { key: 'rx:' + txt, prompt: `Is this half-reaction an oxidation or a reduction? ${txt}`, kind: 'mc', opts: ['Oxidation', 'Reduction'], correct: ox ? 0 : 1, display: ox ? 'Oxidation' : 'Reduction',
      steps: base.concat([[W, `The electrons are on the <b>${ox ? 'right' : 'left'}</b> → <b>${ox ? 'oxidation' : 'reduction'}</b>.`]]) };
    return { key: 'ag:' + txt, prompt: `In this half-reaction, the reactant ${sp} is the: ${txt}`, kind: 'mc', opts: ['Reducing agent', 'Oxidizing agent'], correct: ox ? 0 : 1, display: ox ? 'Reducing agent' : 'Oxidizing agent',
      steps: base.concat([[W, `It is <b>${ox ? 'oxidized' : 'reduced'}</b>.`], [M, `The one oxidized is the <b>reducing agent</b>; the one reduced is the <b>oxidizing agent</b> → <b>${ox ? 'reducing' : 'oxidizing'} agent</b>.`]]) };
  }
  const SERIES = ['Li', 'K', 'Ba', 'Ca', 'Na', 'Mg', 'Al', 'Zn', 'Cr', 'Fe', 'Cd', 'Co', 'Ni', 'Sn', 'Pb', 'H', 'Cu', 'Ag', 'Hg', 'Pt', 'Au'];
  const ION_CH = { Li: 1, K: 1, Ba: 2, Ca: 2, Na: 1, Mg: 2, Al: 3, Zn: 2, Cr: 3, Fe: 2, Cd: 2, Co: 2, Ni: 2, Sn: 2, Pb: 2, H: 1, Cu: 2, Ag: 1, Hg: 2, Pt: 2, Au: 3 };
  function g16act() {
    const pool = ['Mg', 'Al', 'Zn', 'Cr', 'Fe', 'Co', 'Ni', 'Sn', 'Pb', 'H', 'Cu', 'Ag', 'Hg', 'Au', 'Ca', 'Na', 'K'];
    let a, b; do { a = pick(pool.filter(x => x !== 'H')); b = pick(pool); } while (a === b);
    const goes = SERIES.indexOf(a) < SERIES.indexOf(b);
    const ion = (b === 'H' ? '' : '') + b + chg(ION_CH[b]);
    return { key: 'act:' + a + b, prompt: `Will this reaction proceed? ${a}(s) + ${ion}(aq) → ?`, kind: 'mc', opts: ['Yes', 'No'], correct: goes ? 0 : 1, display: goes ? 'Yes' : 'No',
      steps: [[C, `Activity series (high → low): ${SERIES.map(x => x === a || x === b ? `<b>${x}</b>` : x).join(' > ')}.`],
        [M, 'The <b>neutral</b> metal must be <b>higher</b> than the <b>ion\'s</b> metal for the reaction to go.'],
        [W, `${a} is <b>${goes ? 'above' : 'below'}</b> ${b} → <b>${goes ? 'yes, it goes' : 'no reaction'}</b>.`]] };
  }
  /* predict products */
  function g15pred() {
    const kind = pick(['dr', 'dr', 'comb', 'sr']);
    if (kind === 'comb') {
      const f = pick(['CH4', 'C2H6', 'C3H8', 'C4H10', 'C2H4', 'C6H12O6', 'C3H6O', 'C2H6O', 'C8H18', 'C5H12']);
      const opts = shuffle(['CO₂ + H₂O', 'CO + H₂', 'C + H₂O', sub(f) + 'O₂']);
      return { key: 'pc:' + f, prompt: `Predict the products: ${sub(f)} + O₂ →`, kind: 'mc', opts, correct: opts.indexOf('CO₂ + H₂O'), display: 'CO₂ + H₂O',
        steps: [[M, 'Fuel + O₂ is <b>combustion</b>.'], [M, 'Combustion <b>always</b> makes <b>CO₂ + H₂O</b>.']] };
    }
    if (kind === 'sr') {
      const m = pick(['Mg', 'Zn', 'Al', 'Fe2']), s = randSalt((c, a) => ['Cu', 'Ag', 'Pb', 'Ni'].includes(c) && ['NO3', 'Cl', 'SO4'].includes(a) && soluble(c, a)[0]);
      const p = salt(m, s.ak), freed = CAT[s.ck][0], right = `${sub(p.f)} + ${freed}`;
      const wrong1 = `${sub(CAT[m][0] + (s.na > 1 ? '' : ''))}${sub(AN[s.ak][0])} + ${freed}`, wrong2 = `${sub(s.f)} + ${CAT[m][0]}`, wrong3 = `${CAT[m][0]}${freed} + ${sub(AN[s.ak][0])}`;
      const opts = shuffle([right, wrong1, wrong2, wrong3].filter((x, i, a) => a.indexOf(x) === i));
      return { key: 'ps:' + m + s.f, prompt: `Predict the products: ${CAT[m][0]} + ${sub(s.f)} →`, kind: 'mc', opts, correct: opts.indexOf(right), display: right,
        steps: [[M, 'A lone metal + a compound → <b>single replacement</b>: the metal takes the place of the compound\'s metal.'],
          [B, `${CAT[m][0]} becomes <b>${sub(CAT[m][0]) + chg(CAT[m][1])}</b> (${CAT[m][2]}); with ${sub(AN[s.ak][0]) + chg(AN[s.ak][1])} → criss-cross → <b>${sub(p.f)}</b>.`],
          [W, `${freed} is left alone → <b>${right}</b>.`]] };
    }
    for (;;) {
      const s1 = randSalt(), s2 = randSalt();
      if (s1.ck === s2.ck || s1.ak === s2.ak || CAT[s1.ck][0] === CAT[s2.ck][0]) continue;
      const p1 = salt(s1.ck, s2.ak), p2 = salt(s2.ck, s1.ak), right = `${sub(p1.f)} + ${sub(p2.f)}`;
      // distractor: carry old subscripts over
      const carry = (c, a, n) => { const cs = CAT[c][0], as = AN[a][0]; return sub((CAT[c][3] && n.nc > 1 ? `(${cs})${n.nc}` : cs + (n.nc > 1 ? n.nc : '')) + (AN[a][3] && n.na > 1 ? `(${as})${n.na}` : as + (n.na > 1 ? n.na : ''))); };
      const w1 = `${carry(s1.ck, s2.ak, s1)} + ${carry(s2.ck, s1.ak, s2)}`, w2 = `${sub(s1.f)} + ${sub(s2.f)}`, w3 = `${sub(CAT[s1.ck][0])}${sub(CAT[s2.ck][0])} + ${sub(AN[s1.ak][0])}${sub(AN[s2.ak][0])}`;
      const opts = shuffle([right, w1, w2, w3].filter((x, i, a) => a.indexOf(x) === i));
      if (opts.length < 3) continue;
      return { key: 'pd:' + s1.f + s2.f, prompt: `Predict the products (no need to balance): ${sub(s1.f)} + ${sub(s2.f)} →`, kind: 'mc', opts, correct: opts.indexOf(right), display: right,
        steps: [[M, 'Two compounds → <b>double replacement</b>: keep the positives in place and <b>swap the negatives</b>.'],
          [C, `Ions: ${[s1, s2].map(s => (CAT[s.ck][0] === 'NH4' ? 'NH₄⁺' : sub(CAT[s.ck][0]) + chg(CAT[s.ck][1])) + ', ' + sub(AN[s.ak][0]) + chg(AN[s.ak][1])).join('; ')} (polyatomics from the <b>ion chart</b>).`],
          [M, `<b>Rebuild from the charges</b> (criss-cross; never carry old subscripts): <b>${sub(p1.f)}</b> and <b>${sub(p2.f)}</b>.`]] };
    }
  }


  /* ================= HW 17: stoichiometry (all factor label) ================= */
  const MM_LIST = ['Na2CO3', 'NaCl', 'HCl', 'PbCl2', 'Ca(NO3)2', 'Na3PO4', 'Ca3(PO4)2', 'AgNO3', 'KCl', 'Al2(SO4)3', '(NH4)2SO4', 'C6H12O6', 'H2SO4', 'CaCO3', 'Mg(OH)2', 'KMnO4', 'NaHCO3', 'Fe2O3', 'C3H8', 'CuSO4'];
  const mmStr = f => molar(f).toFixed(2);
  function g17mm() {
    const f = pick(MM_LIST), c = parse(f), els = Object.keys(c), v = molar(c);
    return { key: 'mm:' + f, prompt: `Calculate the molar mass of ${sub(f)}. Record your answer with 2 decimal places.`, given: 'Use the class periodic chart values; don\'t round early.', kind: 'num', value: v, tol: 0.015, abs: true, unit: 'g/mol', display: v.toFixed(2) + ' g/mol',
      steps: [[C, 'Periodic chart: ' + els.map(e => `${e} = <b>${MASS[e].toFixed(2)}</b>`).join(', ') + '.'],
        [B, 'Each atomic mass <b>× its subscript</b> (a subscript outside parentheses multiplies everything inside).'],
        [W, els.map(e => c[e] > 1 ? `${c[e]}(${MASS[e].toFixed(2)})` : MASS[e].toFixed(2)).join(' + ') + ` = <b>${v.toFixed(2)} g/mol</b>.`]] };
  }
  const STOICH = BAL.filter(b => !b[0].includes('N4') && b[0].concat(b[1]).every(f => f !== 'Hg'));
  const eqBal = (re, pr, co) => eqn(re, pr, co);
  function pickPair(needCompounds) {
    for (;;) {
      const [re, pr, co] = pick(STOICH), all = re.concat(pr), i = R(0, all.length - 1), j = R(0, all.length - 1);
      if (i === j) continue;
      if (needCompounds && (Object.keys(parse(all[i])).length < 1 || Object.keys(parse(all[j])).length < 1)) continue;
      return { re, pr, co, all, i, j, isProd: j >= re.length, giveProd: i >= re.length };
    }
  }
  const NICE_MOL = ['2.0', '3.00', '4.50', '10.0', '0.250', '1.20', '6.00', '12.0', '0.600', '5.00', '0.0750', '8.0'];
  function g17ratio() {
    const P = pickPair(), A = sub(P.all[P.i]), Bf = sub(P.all[P.j]), n = pick(NICE_MOL), sf = sfOf(n), v = +n * P.co[P.j] / P.co[P.i];
    const verb = P.isProd ? (P.giveProd ? 'are produced along with' : 'will be produced from') : (P.giveProd ? 'were used to make' : 'are needed to react with');
    return numQ('ratio', `${eqBal(P.re, P.pr, P.co)}. How many moles of ${Bf} ${verb} ${n} mol of ${A}?`, v, 'mol', sf,
      [[M, `Coefficients = the mole ratio (no coefficient = 1): <b>${P.co[P.j]} ${Bf} : ${P.co[P.i]} ${A}</b>.`],
       [M, `<b>Start with the given moles</b>; what you have (${A}) goes on the <b>bottom</b> so it cancels.`],
       [W, fl([n, 'mol ' + A], [[[String(P.co[P.j]), 'mol ' + Bf], [String(P.co[P.i]), 'mol ' + A]]], [sig(v, sf), 'mol ' + Bf])],
       [M, 'Mole ratios are <b>exact</b>; sig figs come from the starting number.']]);
  }
  function stoichSteps(g, A, mmA, B_, mmB, coA, coB, v, prod) {
    return [[C, `Molar masses: ${A} = <b>${mmA}</b>, ${B_} = <b>${mmB}</b> g/mol (number goes with grams, over 1 mol).`],
      [M, `<b>Start with the given grams</b>, head to moles, switch with the coefficients (<b>${coB} ${B_} : ${coA} ${A}</b>), then back to grams.`],
      [W, fl([g, 'g ' + A], [[['1', 'mol ' + A], [mmA, 'g ' + A]], [[String(coB), 'mol ' + B_], [String(coA), 'mol ' + A]], [[mmB, 'g ' + B_], ['1', 'mol ' + B_]]], [v.toFixed(3), 'g ' + B_])]]
      .concat(prod ? [[M, `${B_} is a product, so this is the <b>theoretical yield</b>.`]] : []);
  }
  function g17stoich() {
    for (;;) {
      const P = pickPair(); if (P.giveProd) continue; if (['O2', 'H2', 'N2', 'Cl2', 'Br2', 'I2', 'F2'].includes(P.all[P.i]) && Math.random() < 0.5) continue;
      const fa = P.all[P.i], fb = P.all[P.j], A = sub(fa), Bf = sub(fb), mmA = mmStr(fa), mmB = mmStr(fb), g = String(v3(1, 60));
      const v = +g / +mmA * P.co[P.j] / P.co[P.i] * +mmB;
      const ask = P.isProd ? `how many grams of ${Bf} can be produced` : `how many grams of ${Bf} are needed to react with it`;
      return numQ('stoich', `${eqBal(P.re, P.pr, P.co)}. If ${g} g of ${A} react completely, ${ask}?`, v, 'g', 3, stoichSteps(g, A, mmA, Bf, mmB, P.co[P.i], P.co[P.j], v, P.isProd),
        `Molar masses: ${A} = ${mmA} g/mol, ${Bf} = ${mmB} g/mol.`);
    }
  }
  function g17yield() {
    const kind = R(1, 3);
    if (kind === 1) {
      const th = v3(10, 90), act = +(th * R(55, 97) / 100).toPrecision(3), v = act / th * 100;
      return numQ('yield1', `A reaction has a theoretical yield of ${th} g of product. The student actually collected ${act} g. What is the percent yield?`, v, '%', 3,
        [[M, '<b>% yield = actual ÷ theoretical × 100</b>. Actual = what was weighed; theoretical = what the math says.'], [W, `${act} g ÷ ${th} g × 100 = <b>${v.toFixed(2)} %</b>.`]]);
    }
    if (kind === 2) {
      const th = v3(10, 250), pc = +(R(550, 970) / 10).toFixed(1), v = th * pc / 100;
      return numQ('yield2', `The theoretical yield of a product is ${th} g and the percent yield was ${pc}%. How many grams were actually obtained?`, v, 'g', 3,
        [[M, 'Solve the % yield equation for actual: <b>actual = theoretical × (% ÷ 100)</b>; use the decimal.'], [W, `${th} g × ${(pc / 100).toFixed(3)} = <b>${v.toFixed(3)} g</b>.`]]);
    }
    for (;;) {
      const P = pickPair(); if (!(P.isProd && !P.giveProd)) continue;
      const fa = P.all[P.i], fb = P.all[P.j], A = sub(fa), Bf = sub(fb), mmA = mmStr(fa), mmB = mmStr(fb), g = String(v3(5, 60));
      const th = +g / +mmA * P.co[P.j] / P.co[P.i] * +mmB, act = +(th * R(55, 95) / 100).toPrecision(3), v = act / th * 100;
      return numQ('yield3', `${eqBal(P.re, P.pr, P.co)}. Starting with ${g} g of ${A} (and plenty of everything else), a student collected ${act} g of ${Bf}. What is the percent yield?`, v, '%', 3,
        [[M, '<b>Theoretical yield first</b>, by factor label:']].concat(stoichSteps(g, A, mmA, Bf, mmB, P.co[P.i], P.co[P.j], th, false).slice(0, 3))
          .concat([[M, `% yield = actual ÷ theoretical × 100 = ${act} ÷ ${th.toFixed(3)} × 100 = <b>${v.toFixed(2)} %</b>.`]]),
        `Molar masses: ${A} = ${mmA} g/mol, ${Bf} = ${mmB} g/mol.`);
    }
  }
  const TITR = [['HCl', 'NaOH', 1, 1, 'HCl + NaOH → NaCl + H₂O'], ['HNO3', 'KOH', 1, 1, 'HNO₃ + KOH → KNO₃ + H₂O'], ['H2SO4', 'NaOH', 1, 2, 'H₂SO₄ + 2 NaOH → Na₂SO₄ + 2 H₂O'],
    ['H2SO4', 'KOH', 1, 2, 'H₂SO₄ + 2 KOH → K₂SO₄ + 2 H₂O'], ['HCl', 'Ba(OH)2', 2, 1, '2 HCl + Ba(OH)₂ → BaCl₂ + 2 H₂O'], ['HC2H3O2', 'NaOH', 1, 1, 'HC₂H₃O₂ + NaOH → NaC₂H₃O₂ + H₂O']];
  function g17titr() {
    const [fa, fb, ca, cb, eq] = pick(TITR), A = sub(fa), Bf = sub(fb), Vb = (R(1500, 4500) / 100).toFixed(2), Mb = String(v3(0.1, 0.5)), Va = pick(['25.00', '50.00', '20.00', '10.00']);
    const molA = +Vb / 1000 * +Mb * ca / cb, Ma = molA / (+Va / 1000);
    if (Math.random() < 0.6) return numQ('titrM', `${eq}. The endpoint of a titration of ${Va} mL of ${A} was reached with ${Vb} mL of ${Mb} M ${Bf}. What is the molarity of the ${A}?`, Ma, 'M', 3,
      [[M, `Plan: <b>M of ${A} = mol ${A} ÷ L ${A}</b>. Liters of ${A} are given: ${Va} mL = <b>${(+Va / 1000).toFixed(5)} L</b>.`],
       [M, `Moles of ${A} by factor label: <b>start with the one-unit number</b> (the ${Bf} volume), never with the molarity (two units).`],
       [W, fl([Vb, 'mL ' + Bf], [ML2L.map((x, i) => i === 0 ? ['1', 'L ' + Bf] : ['1000', 'mL ' + Bf]), [[Mb, 'mol ' + Bf], ['1', 'L ' + Bf]], [[String(ca), 'mol ' + A], [String(cb), 'mol ' + Bf]]], [molA.toPrecision(5), 'mol ' + A])],
       [W, `M = ${molA.toPrecision(5)} mol ÷ ${(+Va / 1000).toFixed(5)} L = <b>${Ma.toFixed(4)} M</b>.`],
       [M, 'Sig figs here come from the <b>shortest</b> measured number (often the molarity), not just the first one.']]);
    const Ma2 = String(v3(0.1, 0.5)), Vb2 = +Va / 1000 * +Ma2 * cb / ca / +Mb * 1000;
    return numQ('titrV', `${eq}. What volume (in mL) of ${Mb} M ${Bf} is needed to neutralize ${Va} mL of ${Ma2} M ${A}?`, Vb2, 'mL', 3,
      [[M, '<b>Start with the one-unit number</b> (the acid volume) and chain mL → L → mol → mol → L → mL:'],
       [W, fl([Va, 'mL ' + A], [[['1', 'L ' + A], ['1000', 'mL ' + A]], [[Ma2, 'mol ' + A], ['1', 'L ' + A]], [[String(cb), 'mol ' + Bf], [String(ca), 'mol ' + A]], [['1', 'L ' + Bf], [Mb, 'mol ' + Bf]], [['1000', 'mL ' + Bf], ['1', 'L ' + Bf]]], [Vb2.toFixed(3), 'mL ' + Bf])]]);
  }

  /* ================= HW 18: solution stoichiometry, limiting & excess reactant (factor label) ================= */
  const TWO = STOICH.filter(b => b[0].length === 2 && !b[0].includes('NaNO3'));   // skip Mg + NaNO3 (it doesn't really go)
  const chainTo = (amt, unit, A, coA, Pf, coP, mmA, mmP) => unit === 'mol'
    ? fl([amt, 'mol ' + A], [[[String(coP), 'mol ' + Pf], [String(coA), 'mol ' + A]]], [null, 'mol ' + Pf])
    : fl([amt, 'g ' + A], [[['1', 'mol ' + A], [mmA, 'g ' + A]], [[String(coP), 'mol ' + Pf], [String(coA), 'mol ' + A]], [[mmP, 'g ' + Pf], ['1', 'mol ' + Pf]]], [null, 'g ' + Pf]);
  const flRes = (html, v) => html.replace(/<b>null /, `<b>${v} `).replace(/= null /, `= ${v} `);
  function lrSetup(unit) {   // two reactants, amounts chosen so the two chains differ by at least 8 %
    for (;;) {
      const [re, pr, co] = pick(TWO), p = pr.findIndex(f => Object.keys(parse(f)).length > 1), pi = p < 0 ? 0 : p;
      const fa = re[0], fb = re[1], Pf = pr[pi], coP = co[2 + pi], mmA = mmStr(fa), mmB = mmStr(fb), mmP = mmStr(Pf);
      const a = unit === 'mol' ? (R(10, 95) / 100).toFixed(2) : String(v3(2, 60)), b = unit === 'mol' ? (R(10, 95) / 100).toFixed(2) : String(v3(2, 60));
      const pa = unit === 'mol' ? +a * coP / co[0] : +a / +mmA * coP / co[0] * +mmP, pb = unit === 'mol' ? +b * coP / co[1] : +b / +mmB * coP / co[1] * +mmP;
      if (Math.abs(pa - pb) / Math.max(pa, pb) < 0.08) continue;
      return { re, pr, co, fa, fb, A: sub(fa), Bf: sub(fb), Pf: sub(Pf), coA: co[0], coB: co[1], coP, mmA, mmB, mmP, a, b, pa, pb, limA: pa < pb };
    }
  }
  function lrSteps(S, unit) {
    const dp = unit === 'mol' ? 3 : 2;
    return [[M, `<b>Limiting reactant</b> = the one that makes the <b>least product</b>. Run a factor-label chain from <b>each</b> reactant to the same product (${S.Pf}).`],
      [W, flRes(chainTo(S.a, unit, S.A, S.coA, S.Pf, S.coP, S.mmA, S.mmP), S.pa.toFixed(dp))],
      [W, flRes(chainTo(S.b, unit, S.Bf, S.coB, S.Pf, S.coP, S.mmB, S.mmP), S.pb.toFixed(dp))],
      [M, `Smaller amount wins: <b>${S.limA ? S.A : S.Bf}</b> is the <b>limiting reactant</b>; ${S.limA ? S.Bf : S.A} is in <b>excess</b>.`]];
  }
  function g18lr() {
    if (Math.random() < 0.15) {
      const opts = shuffle(['the reactant that makes the least amount of product', 'the reactant with the lowest coefficient in the balanced equation', 'the reactant with the fewest moles', 'the reactant with the least amount in grams']);
      const right = 'the reactant that makes the least amount of product';
      return { key: 'lrdef', prompt: 'The limiting reactant in a reaction is…', kind: 'mc', opts, correct: opts.indexOf(right), display: right,
        steps: [[M, 'The limiting reactant <b>runs out first</b>, so it decides how much product forms: it is the one that makes the <b>least product</b>.'],
          [M, 'Fewest moles, fewest grams or the smallest coefficient can all <b>fool you</b>; you have to account for the <b>mole ratio</b>. (On eLearn this showed up as <b>none of these</b>.)']] };
    }
    const S = lrSetup('mol'), all = S.re.concat(S.pr).map(sub), right = S.limA ? S.A : S.Bf;
    return { key: 'lr:' + S.a + S.b, prompt: `${eqBal(S.re, S.pr, S.co)}. If ${S.a} mol of ${S.A} react with ${S.b} mol of ${S.Bf}, what is the limiting reactant?`, kind: 'mc', opts: all, correct: all.indexOf(right), display: right,
      steps: lrSteps(S, 'mol').concat([[M, 'A <b>product</b> can never be the limiting reactant.']]) };
  }
  function g18lrg() {
    const S = lrSetup('g'), v = Math.min(S.pa, S.pb);
    return numQ('lrg', `${eqBal(S.re, S.pr, S.co)}. If ${S.a} g of ${S.A} react with ${S.b} g of ${S.Bf}, how many grams of ${S.Pf} can be produced?`, v, 'g', 3,
      lrSteps(S, 'g').concat([[M, `The <b>smaller</b> amount is the theoretical yield: <b>${v.toFixed(2)} g ${S.Pf}</b>. The bigger number is impossible; that reactant runs out first.`]]),
      `Molar masses: ${S.A} = ${S.mmA}, ${S.Bf} = ${S.mmB}, ${S.Pf} = ${S.mmP} g/mol.`);
  }
  function g18excess() {
    const S = lrSetup('g'), L = S.limA ? [S.A, S.a, S.mmA, S.coA] : [S.Bf, S.b, S.mmB, S.coB], X = S.limA ? [S.Bf, S.b, S.mmB, S.coB] : [S.A, S.a, S.mmA, S.coA];
    const used = +L[1] / +L[2] * X[3] / L[3] * +X[2], left = +X[1] - used;
    return { key: 'xs:' + S.a + S.b, prompt: `${eqBal(S.re, S.pr, S.co)}. ${S.a} g of ${S.A} react with ${S.b} g of ${S.Bf}, and ${L[0]} is the limiting reactant. How many grams of ${X[0]} are left over? Round to the hundredths place.`,
      given: `Molar masses: ${S.A} = ${S.mmA}, ${S.Bf} = ${S.mmB} g/mol.`, kind: 'num', value: left, tol: 0.011, abs: true, unit: 'g', display: left.toFixed(2) + ' g',
      steps: [[M, `Leftover = <b>what you started with − what got used</b>. The <b>limiting</b> reactant (${L[0]}) is used up completely, so start the chain with it.`],
        [W, fl([L[1], 'g ' + L[0]], [[['1', 'mol ' + L[0]], [L[2], 'g ' + L[0]]], [[String(X[3]), 'mol ' + X[0]], [String(L[3]), 'mol ' + L[0]]], [[X[2], 'g ' + X[0]], ['1', 'mol ' + X[0]]]], [used.toFixed(3), 'g ' + X[0] + ' used'])],
        [W, `${X[1]} g − ${used.toFixed(3)} g = <b>${left.toFixed(2)} g ${X[0]}</b> left over.`],
        [M, 'Check: the leftover must be <b>positive</b>. If it\'s negative you started from the wrong (excess) reactant.']] };
  }
  const PPT = [  // [eqn, reactant, coR, precipitate, coP]
    ['Pb(NO₃)₂(aq) + 2 NaCl(aq) → 2 NaNO₃(aq) + PbCl₂(s)', 'NaCl', 2, 'PbCl2', 1], ['Pb(NO₃)₂(aq) + 2 NaCl(aq) → 2 NaNO₃(aq) + PbCl₂(s)', 'Pb(NO3)2', 1, 'PbCl2', 1],
    ['CuBr₂(aq) + 2 AgCH₃CO₂(aq) → 2 AgBr(s) + Cu(CH₃CO₂)₂(aq)', 'CuBr2', 1, 'AgBr', 2], ['CuBr₂(aq) + 2 AgCH₃CO₂(aq) → 2 AgBr(s) + Cu(CH₃CO₂)₂(aq)', 'AgCH3CO2', 2, 'AgBr', 2],
    ['AgNO₃(aq) + NaCl(aq) → AgCl(s) + NaNO₃(aq)', 'AgNO3', 1, 'AgCl', 1], ['BaCl₂(aq) + Na₂SO₄(aq) → BaSO₄(s) + 2 NaCl(aq)', 'BaCl2', 1, 'BaSO4', 1],
    ['CaCl₂(aq) + Na₂CO₃(aq) → CaCO₃(s) + 2 NaCl(aq)', 'Na2CO3', 1, 'CaCO3', 1], ['3 CaCl₂(aq) + 2 Na₃PO₄(aq) → Ca₃(PO₄)₂(s) + 6 NaCl(aq)', 'CaCl2', 3, 'Ca3(PO4)2', 1]];
  function g18soln() {
    const [eq, fr, cr, fp, cp] = pick(PPT), Rr = sub(fr), Pp = sub(fp), mmP = mmStr(fp), mL = String(v3(20, 95));
    if (Math.random() < 0.5) {
      const Mv = String(v3(0.1, 0.5)), v = +mL / 1000 * +Mv * cp / cr * +mmP;
      return numQ('solg', `${eq}. How many grams of ${Pp} will form from ${mL} mL of ${Mv} M ${Rr} reacting with an excess of the other reactant?`, v, 'g', 3,
        [[M, `<b>Start with the one-unit number</b> (the volume). Rewrite ${Mv} M as <b>(${Mv} mol ${Rr} / 1 L)</b>.`],
         [W, fl([mL, 'mL ' + Rr], [[['1', 'L ' + Rr], ['1000', 'mL ' + Rr]], [[Mv, 'mol ' + Rr], ['1', 'L ' + Rr]], [[String(cp), 'mol ' + Pp], [String(cr), 'mol ' + Rr]], [[mmP, 'g ' + Pp], ['1', 'mol ' + Pp]]], [v.toFixed(3), 'g ' + Pp])]],
        `Molar mass of ${Pp} = ${mmP} g/mol.`);
    }
    const g = String(v3(1, 15)), mol = +g / +mmP * cr / cp, v = mol / (+mL / 1000);
    return numQ('solM', `${eq}. What is the molarity of the ${Rr} solution if ${mL} mL of it produces ${g} g of ${Pp}?`, v, 'M', 3,
      [[M, `Plan: <b>M = mol ÷ L</b> of ${Rr}. Get the moles by factor label from the <b>grams of ${Pp}</b> (the one-unit number).`],
       [W, fl([g, 'g ' + Pp], [[['1', 'mol ' + Pp], [mmP, 'g ' + Pp]], [[String(cr), 'mol ' + Rr], [String(cp), 'mol ' + Pp]]], [mol.toPrecision(4), 'mol ' + Rr])],
       [W, 'Volume to liters: ' + fl([mL, 'mL'], [ML2L], [(+mL / 1000).toPrecision(3), 'L'])],
       [W, `M = ${mol.toPrecision(4)} mol ÷ ${(+mL / 1000).toPrecision(3)} L = <b>${v.toFixed(4)} M</b>.`]],
      `Molar mass of ${Pp} = ${mmP} g/mol.`);
  }

  const TOPICS = [
    { id: 'id', hw: 13, label: 'Empirical or molecular?', gen: g13id },
    { id: 'pct', hw: 13, label: 'Percent composition', gen: g13pct },
    { id: 'mol', hw: 13, label: 'Molecular formula from molar mass', gen: g13mol },
    { id: 'emp', hw: 13, label: 'Empirical formula from % or grams', gen: g13emp },
    { id: 'words', hw: 14, label: 'Solution vocabulary', gen: g14words },
    { id: 'molarity', hw: 14, label: 'Molarity (M, moles, grams, volume)', gen: g14M },
    { id: 'dil', hw: 14, label: 'Dilution (M₁V₁ = M₂V₂)', gen: g14dil },
    { id: 'dia', hw: 15, label: 'Diatomic elements', gen: g15dia },
    { id: 'type', hw: 15, label: 'Reaction types', gen: g15type },
    { id: 'bal', hw: 15, label: 'Balancing equations', gen: g15bal },
    { id: 'pred', hw: 15, label: 'Predicting products', gen: g15pred },
    { id: 'sol', hw: 16, label: 'Soluble or insoluble?', gen: g16sol },
    { id: 'goes', hw: 16, label: 'Will the reaction go?', gen: g16goes },
    { id: 'net', hw: 16, label: 'Net & full ionic equations', gen: g16net },
    { id: 'ox', hw: 16, label: 'Oxidation numbers', gen: g16ox },
    { id: 'redox', hw: 16, label: 'Oxidation vs reduction, agents', gen: g16redox },
    { id: 'act', hw: 16, label: 'Activity series', gen: g16act },
    { id: 'mm', hw: 17, label: 'Molar mass', gen: g17mm },
    { id: 'ratio', hw: 17, label: 'Mole to mole (coefficient ratios)', gen: g17ratio },
    { id: 'stoich', hw: 17, label: 'Grams to grams (stoichiometry)', gen: g17stoich },
    { id: 'yield', hw: 17, label: 'Percent yield', gen: g17yield },
    { id: 'titr', hw: 17, label: 'Solution stoichiometry (titration)', gen: g17titr },
    { id: 'soln', hw: 18, label: 'Solution stoichiometry (M, mL → grams)', gen: g18soln },
    { id: 'lr', hw: 18, label: 'Limiting reactant', gen: g18lr },
    { id: 'lrg', hw: 18, label: 'Theoretical yield with a limiting reactant', gen: g18lrg },
    { id: 'excess', hw: 18, label: 'Excess reactant left over', gen: g18excess },
  ];
  function make(topicId) { const t = TOPICS.find(x => x.id === topicId); const q = t.gen(); q.topic = t.id; q.key = t.id + '|' + q.prompt; return q; }

  /* ---------- checking typed answers ---------- */
  function check(q, input) {
    const raw = String(input == null ? '' : input).trim();
    if (q.kind === 'mc') return { ok: +input === q.correct };
    if (!raw) return { ok: false, msg: 'No answer typed.' };
    if (q.kind === 'num') {
      const m = raw.replace(/[−–]/g, '-').replace(/,/g, '').match(/^[-+]?(\d+\.?\d*|\.\d+)(\s*(e|x\s*10\^?|×\s*10\^?)\s*([-+]?\d+))?/i);
      if (!m) return { ok: false, msg: 'Type a number.' };
      const v = parseFloat(m[1]) * (m[4] ? 10 ** +m[4] : 1);
      const ok = q.abs ? Math.abs(v - q.value) <= q.tol : Math.abs(v - q.value) <= q.tol * Math.abs(q.value);
      return { ok, msg: ok ? null : null };
    }
    if (q.kind === 'int') { const v = Number(raw.replace(/[−–]/g, '-').replace(/^\+/, '')); return { ok: v === q.value }; }
    if (q.kind === 'coef') {
      const n = raw.split(/[^0-9]+/).filter(Boolean).map(Number);
      if (n.length !== q.coef.length && raw.replace(/\D/g, '').length === q.coef.length) { const d = raw.replace(/\D/g, '').split('').map(Number); return { ok: d.every((x, i) => x === q.coef[i]) }; }
      return { ok: n.length === q.coef.length && n.every((x, i) => x === q.coef[i]) };
    }
    if (q.kind === 'formula') {
      let c; try { c = parse(raw.replace(/\s/g, '')); } catch (e) { return { ok: false, msg: 'That isn\'t a formula I can read. Use element symbols and plain numbers (C2H5).' }; }
      return { ok: sameCounts(c, q.counts) };
    }
    return { ok: false };
  }


  /* ---------- tools for the Navigator ---------- */
  /* balance any equation with exact fractions (null space of the atom matrix) */
  function balance(reactants, products) {
    const sp = reactants.concat(products).map(f => parse(f)), els = [...new Set(sp.flatMap(c => Object.keys(c)))];
    const n = sp.length, rows = els.map(e => sp.map((c, j) => (c[e] || 0) * (j < reactants.length ? 1 : -1)));
    // fraction helpers [num, den]
    const F = (a, b = 1) => { const g = gcd(a, b) || 1, s = b < 0 ? -1 : 1; return [s * a / g, s * b / g]; };
    const mul = (x, y) => F(x[0] * y[0], x[1] * y[1]), sub_ = (x, y) => F(x[0] * y[1] - y[0] * x[1], x[1] * y[1]), div = (x, y) => F(x[0] * y[1], x[1] * y[0]);
    let A = rows.map(r => r.map(v => F(v))), piv = [], r = 0;
    for (let c = 0; c < n && r < A.length; c++) {
      let k = A.findIndex((row, i) => i >= r && row[c][0] !== 0); if (k < 0) continue;
      [A[r], A[k]] = [A[k], A[r]];
      const pv = A[r][c]; A[r] = A[r].map(v => div(v, pv));
      for (let i = 0; i < A.length; i++) if (i !== r && A[i][c][0] !== 0) { const f = A[i][c]; A[i] = A[i].map((v, j) => sub_(v, mul(f, A[r][j]))); }
      piv.push(c); r++;
    }
    const free = [...Array(n).keys()].filter(c => !piv.includes(c));
    if (free.length !== 1) return null;   // no unique balance
    const x = Array(n).fill(null); x[free[0]] = F(1);
    piv.forEach((c, i) => { x[c] = F(-A[i][free[0]][0], A[i][free[0]][1]); });
    const L = x.reduce((l, v) => l / gcd(l, v[1]) * v[1], 1), ints = x.map(v => v[0] * L / v[1]);
    if (ints.some(v => v <= 0)) { if (ints.every(v => v < 0)) return ints.map(v => -v / gcdAll(ints.map(Math.abs))); return null; }
    const g = gcdAll(ints); return ints.map(v => v / g);
  }
  /* AB + CD: products, phases, coefficients, full/net ionic and spectators (any number of precipitates) */
  function explainDR(c1, a1, c2, a2) {
    const s1 = salt(c1, a1), s2 = salt(c2, a2), p1 = salt(c1, a2), p2 = salt(c2, a1);
    const sol = { s1: soluble(c1, a1), s2: soluble(c2, a2), p1: soluble(c1, a2), p2: soluble(c2, a1) };
    const co = balanceDR(s1, s2, p1, p2) || [1, 1, 1, 1];
    const ph1 = sol.p1[0] ? '(aq)' : '(s)', ph2 = sol.p2[0] ? '(aq)' : '(s)';
    const k = n => n > 1 ? n + ' ' : '';
    const mol = `${k(co[0])}${sub(s1.f)}(aq) + ${k(co[1])}${sub(s2.f)}(aq) → ${k(co[2])}${sub(p1.f)}${ph1} + ${k(co[3])}${sub(p2.f)}${ph2}`;
    const split = (s, n, ok) => ok ? [ionStr(n * s.nc, s.ck, 1), ionStr(n * s.na, s.ak)] : [k(n) + sub(s.f) + '(s)'];
    const left = split(s1, co[0], true).concat(split(s2, co[1], true)), right = split(p1, co[2], sol.p1[0]).concat(split(p2, co[3], sol.p2[0]));
    const full = left.join(' + ') + ' → ' + right.join(' + ');
    const spect = left.filter(t => right.includes(t)), netL = left.filter(t => !right.includes(t)), netR = right.filter(t => !left.includes(t));
    const goes = !(sol.p1[0] && sol.p2[0]);
    let net = 'no reaction (all ions are spectators)';
    if (goes) {   // reduce coefficients if they share a factor
      const terms = netL.concat(netR).map(t => { const m = /^(\d+) /.exec(t); return [m ? +m[1] : 1, m ? t.slice(m[0].length) : t]; });
      const g = gcdAll(terms.map(t => t[0]));
      const fmt = t => (t[0] / g > 1 ? t[0] / g + ' ' : '') + t[1];
      net = terms.slice(0, netL.length).map(fmt).join(' + ') + ' → ' + terms.slice(netL.length).map(fmt).join(' + ');
    }
    const specNames = [...new Set(spect.map(t => t.replace(/^\d+ /, '').replace('(aq)', '')))];
    return { s1, s2, p1, p2, sol, co, mol, full, net, goes, spectators: specNames, reactantsSoluble: sol.s1[0] && sol.s2[0] };
  }

  const api = { fl, balance, explainDR, gcd, gcdAll, ION_CH, NAME, TOPICS, make, check, parse, molar, sub, chg, sig, oxSolve, soluble, salt, BAL, MASS, empSolve, EMP_TARGETS, CAT, AN, SERIES, sfOf };
  if (typeof module !== 'undefined') module.exports = api; else root.Drill3 = api;
})(this);
