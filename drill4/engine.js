/* Test 4 Drill engine: gases, calorimetry and enthalpy (HW 19–22). One question generator per topic.
   Every generator returns a fresh question object, the same shape as the Test 3 engine:
     { prompt, given?, kind: 'mc'|'num', opts?, correct?, value?, tol?, abs?, unit?, display, steps:[[tag, html]] }
   Tags match the Walkthroughs page: 'mem' = memorize, 'chart' = chart/problem, 'both', '' = work. */
(function (root) {
  'use strict';
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const U = (a, b, d) => {   // uniform with d decimals; rerolls a trailing 0 so the shown number keeps its sig figs
    for (;;) { const x = +(a + Math.random() * (b - a)).toFixed(d); if (d === 0 || Math.round(x * 10 ** d) % 10 !== 0) return x; }
  };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const M = 'mem', C = 'chart', B = 'both', W = '';
  const RG = 0.0821, CW = 4.184;
  const SUB = '₀₁₂₃₄₅₆₇₈₉';
  const sub = f => String(f).replace(/([A-Za-z)])(\d+)/g, (_, a, d) => a + d.replace(/\d/g, c => SUB[c]));
  const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };

  /* significant figures (same rules as the Test 3 engine) */
  function sig(x, n) {
    if (x === 0) return '0';
    const p = Math.floor(Math.log10(Math.abs(x)));
    const dec = n - 1 - p;
    if (dec >= 0) return x.toFixed(dec);
    const v = Math.round(x / 10 ** (p - n + 1)) * 10 ** (p - n + 1);
    const s = String(v);
    return s.replace(/0+$/, '').length < n ? (v / 10 ** p).toFixed(n - 1) + '×10' + String(p).replace(/[\d-]/g, d => SUP[d]) : s;
  }
  const f1 = x => x.toFixed(1), f2 = x => x.toFixed(2);
  const K = c => c + 273.15;

  /* factor label: start with the one-unit number, then fractions whose units cancel (struck through) */
  function fl(start, factors, result) {
    const tops = [[start[1], false]], botS = [];
    factors.forEach(([[, tu], [, bu]]) => {
      let hit = null; for (let i = tops.length - 1; i >= 0; i--) if (!tops[i][1] && tops[i][0] === bu) { hit = tops[i]; break; }
      if (hit) hit[1] = true; botS.push(!!hit); tops.push([tu, false]);
    });
    const u = (unit, st) => st ? `<s>${unit}</s>` : unit;
    const parts = [`${start[0]} ${u(start[1], tops[0][1])}`].concat(factors.map(([[tn, tu], [bn, bu]], i) =>
      `<span class="frac"><span class="po">(</span><span class="ft">${tn} ${u(tu, tops[i + 1][1])}</span><span class="sl"> / </span><span class="fb">${bn} ${u(bu, botS[i])}</span><span class="po">)</span></span>`));
    return '<span class="fl">' + parts.join(' × ') + ` = <b>${result[0]} ${result[1]}</b></span>`;
  }

  /* typed-number question with a sig-fig closing step */
  function num(prompt, value, sf, unit, steps, given, extra) {
    const disp = sig(value, sf);
    return Object.assign({ prompt, given, kind: 'num', value: Number(value.toPrecision(sf)), tol: 0.006, unit, display: `${disp} ${unit}`.trim(),
      steps: steps.concat([[M, `<b>Sig figs</b>: ${sf} (match the least precise measurement) → <b>${`${disp} ${unit}`.trim()}</b>.`]]) }, extra || {});
  }
  /* multiple choice from a correct string and distractors */
  function mc(prompt, right, wrong, steps, given) {
    const opts = shuffle([right].concat(wrong.filter((w, i, a) => w !== right && a.indexOf(w) === i).slice(0, 4)));
    return { prompt, given, kind: 'mc', opts, correct: opts.indexOf(right), display: right, steps };
  }
  const tf = (stmt, truth, why) => ({ prompt: `True or false: ${stmt}`, kind: 'mc', opts: ['True', 'False'], correct: truth ? 0 : 1, display: truth ? 'True' : 'False', steps: why });

  /* gases with molar masses (g/mol) */
  const GAS = [['H₂', 'hydrogen', 2.02], ['He', 'helium', 4.00], ['CH₄', 'methane', 16.05], ['NH₃', 'ammonia', 17.04], ['H₂O', 'water vapor', 18.02],
    ['Ne', 'neon', 20.18], ['N₂', 'nitrogen', 28.02], ['CO', 'carbon monoxide', 28.01], ['O₂', 'oxygen', 32.00], ['Ar', 'argon', 39.95],
    ['CO₂', 'carbon dioxide', 44.01], ['SO₂', 'sulfur dioxide', 64.07], ['Cl₂', 'chlorine', 70.90], ['Kr', 'krypton', 83.80], ['Xe', 'xenon', 131.29]];

  /* ================= HW 19: kinetic molecular theory, units, combined gas law ================= */
  const KMT = [
    ['Gas particles are in constant, random motion.', true, 'One of the postulates of the kinetic molecular theory.'],
    ['Pressure is caused by gas particles colliding with the walls of their container.', true, 'More (or harder) wall collisions = more pressure.'],
    ['Collisions between gas particles are elastic, so the particles never slow down and stop over time.', true, 'Energy is transferred between particles, but not lost.'],
    ['As gas atoms collide, they slow down over time and eventually stop moving.', false, 'Collisions are <b>elastic</b>; the total kinetic energy stays the same at constant temperature.'],
    ['Individual gas molecules may change speeds over time.', true, 'Collisions trade energy between particles; only the <b>average</b> is fixed by temperature.'],
    ['The average kinetic energy of a gas is proportional to its temperature in Kelvin.', true, 'Hotter gas = faster particles on average.'],
    ['Gases obey the kinetic molecular theory best at low temperatures.', false, 'Gases are most ideal at <b>high temperature</b> and <b>low pressure</b>.'],
    ['Gas particles are assumed to take up no space compared with the size of the container.', true, 'That is an assumption of the ideal model (real gases do take a little space).'],
    ['The ideal gas law works best at low pressure and high temperature.', true, 'Particles are far apart and moving fast, so their volume and attractions matter least.'],
    ['Real gases deviate from ideal behavior because their particles attract each other and occupy some volume.', true, 'Those are the two ideal-gas assumptions that real gases break.'],
    ['At the same temperature, heavier gas molecules have a higher average speed than lighter ones.', false, 'Same T = same average KE. KE = ½mv², so <b>lighter</b> molecules move faster.'],
    ['As volume increases at constant temperature, pressure decreases.', true, 'Boyle: P and V are <b>inversely</b> proportional.'],
    ['Volume of a gas is directly proportional to pressure at constant temperature and moles.', false, 'Boyle: V and P are <b>inversely</b> proportional.'],
    ['Volume is directly proportional to temperature in Kelvin at constant pressure and moles.', true, 'Charles: V and T (K) are directly proportional.'],
    ['As you decrease the temperature of a gas at constant pressure, its volume decreases.', true, 'Charles: V and T go the same way.'],
    ['Increasing the moles of gas in a rigid container increases the pressure.', true, 'More particles = more wall collisions.'],
    ['As moles in a container increase, pressure decreases.', false, 'More moles in the same container means <b>more</b> pressure.'],
    ['Pressure is directly proportional to temperature in Kelvin at constant volume and moles.', true, 'Gay-Lussac: hotter gas hits the walls harder and more often.'],
    ['Doubling the volume of a gas halves its pressure at constant temperature and moles.', true, 'Boyle: P₁V₁ = P₂V₂.'],
    ['Every gas calculation with a temperature in it needs the temperature in Kelvin.', true, 'Always convert °C → K (add 273.15).'],
    ['In the combined gas law, both pressures must be in atm.', false, 'They only have to <b>match each other</b> (both mmHg is fine). PV = nRT is the one that needs atm and L.'],
    ['In PV = nRT, pressure must be in atm and volume in liters.', true, 'Because R = 0.0821 L·atm/(mol·K).'],
  ];
  function g19kmt() {
    const [s, t, why] = pick(KMT);
    return tf(s, t, [[M, why]]);
  }
  function g19speed() {
    const gs = shuffle(GAS).slice(0, 4), T = pick([273, 298, 310, 350]);
    const fast = Math.random() < 0.65, best = gs.reduce((a, b) => (fast ? b[2] < a[2] : b[2] > a[2]) ? b : a);
    const prompt = fast ? `Which gas has the highest average velocity at ${T} K?` : `Which gas has the lowest average velocity at ${T} K?`;
    const right = `${best[1]} (${best[0]})`;
    return mc(prompt, right, gs.filter(g => g !== best).map(g => `${g[1]} (${g[0]})`).concat(['All have the same velocity']),
      [[M, 'Same temperature = same average kinetic energy. KE = ½mv², so the <b>lightest</b> gas moves fastest and the heaviest moves slowest.'],
        [C, 'Molar masses: ' + gs.map(g => `${g[0]} = ${g[2]}`).join(', ') + ' g/mol.'],
        [W, `${fast ? 'Lightest' : 'Heaviest'} → <b>${right}</b>.`]]);
  }
  function g19effuse() {
    const [a, b] = shuffle(GAS).slice(0, 2), lighter = a[2] < b[2] ? a : b, heavier = lighter === a ? b : a;
    if (Math.random() < 0.5) {
      const claimLight = Math.random() < 0.5, who = claimLight ? lighter : heavier;
      return tf(`If a mixture with equal moles of ${a[1]} and ${b[1]} escapes through a pinhole, the escaping gas contains more ${who[1]}.`, claimLight,
        [[M, 'Effusion (Graham): <b>lighter gases escape faster</b>.'], [C, `${a[0]} = ${a[2]}, ${b[0]} = ${b[2]} g/mol.`], [W, `${lighter[1]} is lighter, so the escaping gas has more <b>${lighter[1]}</b>.`]]);
    }
    const gs = shuffle(GAS).slice(0, 4), best = gs.reduce((x, y) => y[2] < x[2] ? y : x);
    return mc('Equal amounts of these gases are in one container at the same temperature and pressure. A tiny opening is made. Which gas escapes in the largest amount?',
      best[1], gs.filter(g => g !== best).map(g => g[1]).concat(['All will escape equally.']),
      [[M, 'Lighter particles move faster, so they find the pinhole more often and escape first.'], [C, gs.map(g => `${g[0]} = ${g[2]}`).join(', ') + ' g/mol.'], [W, `Lightest → <b>${best[1]}</b>.`]]);
  }
  function g19avo() {
    const [a, b] = shuffle([['He', 'helium', 4.00], ['Ne', 'neon', 20.18], ['Ar', 'argon', 39.95], ['Kr', 'krypton', 83.80], ['N₂', 'nitrogen', 28.02], ['O₂', 'oxygen', 32.00]]).slice(0, 2);
    const S = [
      [`${f2(a[2])} grams of ${a[1]} will occupy the same volume as ${f2(b[2])} grams of ${b[1]}.`, true, `Each is exactly 1 mole, and equal moles = equal volume.`],
      [`The same number of moles of each will occupy the same volume.`, true, `Avogadro's law: volume depends on moles, not identity.`],
      [`If you have twice as many moles of ${b[1]} as ${a[1]}, the volume of ${b[1]} will be twice as large.`, true, `V is directly proportional to n.`],
      [`One mole each of ${a[1]} and ${b[1]} in a container will take up twice the volume of 1 mole of ${a[1]} by itself.`, true, `2 mol total vs 1 mol → twice the volume.`],
      [`The same number of grams of each will occupy the same volume.`, false, `Equal grams are <b>different numbers of moles</b> because the molar masses differ.`],
    ];
    const [s, t, why] = pick(S);
    return tf(`For samples of ${a[1]} and ${b[1]} at the same temperature and pressure: ${s}`, t, [[M, 'Avogadro: at the same T and P, <b>equal moles occupy equal volumes</b>.'], [W, why]]);
  }
  function g19temp() {
    const k = R(0, 2);
    if (k === 0) {
      const F = U(-20, 220, 1), c = (F - 32) * 5 / 9;
      return { prompt: `Convert ${f1(F)} °F to °C. Round to 1 decimal place.`, kind: 'num', value: +f1(c), tol: 0.051, abs: true, unit: '°C', display: f1(c) + ' °C',
        steps: [[M, '<b>°C = (°F − 32) × 5/9</b>'], [W, `(${f1(F)} − 32) × 5/9 = <b>${f1(c)} °C</b>`]] };
    }
    if (k === 1) {
      const c = U(-60, 200, 2), kv = c + 273.15;
      return { prompt: `Convert ${f2(c)} °C to Kelvin. Round to 2 decimal places.`, kind: 'num', value: +f2(kv), tol: 0.0051, abs: true, unit: 'K', display: f2(kv) + ' K',
        steps: [[M, '<b>K = °C + 273.15</b>'], [W, `${f2(c)} + 273.15 = <b>${f2(kv)} K</b>`]] };
    }
    const kv = U(150, 500, 2), c = kv - 273.15;
    return { prompt: `Convert ${f2(kv)} K to °C. Round to 2 decimal places.`, kind: 'num', value: +f2(c), tol: 0.0051, abs: true, unit: '°C', display: f2(c) + ' °C',
      steps: [[M, '<b>°C = K − 273.15</b>'], [W, `${f2(kv)} − 273.15 = <b>${f2(c)} °C</b>`]] };
  }
  function g19units() {
    const k = R(0, 4);
    if (k === 0) { const t = U(150, 1500, 1), a = t / 760; const u = pick(['torr', 'mmHg']);
      return num(`A gas is measured at ${f1(t)} ${u}. What is the pressure in atm? (Don't lose any sig figs.)`, a, 4, 'atm',
        [[M, `<b>1 atm = 760 ${u}</b> (exact, so it doesn't limit sig figs).`], [W, fl([f1(t), u], [[['1', 'atm'], ['760', u]]], [sig(a, 4), 'atm'])]]); }
    if (k === 1) { const p = R(110, 990), a = p / 101.325;
      return num(`A gas is measured at ${p} kPa. What is the pressure in atm?`, a, 3, 'atm',
        [[M, '<b>1 atm = 101.325 kPa</b>.'], [W, fl([p, 'kPa'], [[['1', 'atm'], ['101.325', 'kPa']]], [sig(a, 3), 'atm'])]]); }
    if (k === 2) { const a = U(0.2, 4, 3), t = a * 760;
      return num(`A gas is at ${a.toFixed(3)} atm. What is the pressure in mmHg?`, t, 4, 'mmHg',
        [[M, '<b>1 atm = 760 mmHg</b>.'], [W, fl([a.toFixed(3), 'atm'], [[['760', 'mmHg'], ['1', 'atm']]], [sig(t, 4), 'mmHg'])]]); }
    if (k === 3) { const ml = U(20, 950, 1), l = ml / 1000;
      return num(`A gas volume is ${f1(ml)} mL. What is the volume in L? (Don't lose any sig figs.)`, l, String(f1(ml)).replace('.', '').replace(/^0+/, '').length, 'L',
        [[M, '<b>1 L = 1000 mL</b>.'], [W, fl([f1(ml), 'mL'], [[['1', 'L'], ['1000', 'mL']]], [sig(l, String(f1(ml)).replace('.', '').replace(/^0+/, '').length), 'L'])]]); }
    const a = U(0.5, 3.5, 3), kp = a * 101.325;
    return num(`A gas is at ${a.toFixed(3)} atm. What is the pressure in kPa?`, kp, 4, 'kPa',
      [[M, '<b>1 atm = 101.325 kPa</b>.'], [W, fl([a.toFixed(3), 'atm'], [[['101.325', 'kPa'], ['1', 'atm']]], [sig(kp, 4), 'kPa'])]]);
  }
  function g19boyle() {
    const pu = pick(['atm', 'mmHg', 'torr']), vu = pick(['L', 'mL']);
    const P1 = pu === 'atm' ? U(0.6, 15, 2) : U(200, 950, 0), V1 = vu === 'L' ? U(2, 40, 1) : U(20, 400, 1);
    const ratio = U(0.4, 2.2, 2), askV = Math.random() < 0.5;
    const P2 = pu === 'atm' ? +(P1 * ratio).toFixed(2) : Math.round(P1 * ratio), V2 = +(V1 / ratio).toFixed(1);
    if (askV) {
      const v = P1 * V1 / P2;
      return num(`A gas at ${P1} ${pu} occupies ${V1} ${vu}. At the same temperature the pressure changes to ${P2} ${pu}. What is the new volume?`, v, 3, vu,
        [[M, '<b>Boyle\'s law: P₁V₁ = P₂V₂</b> (constant T and n). Units only have to match each other.'], [W, `V₂ = P₁V₁ ÷ P₂ = (${P1} × ${V1}) ÷ ${P2} = ${sig(v, 4)} ${vu}`],
          [M, `Check: pressure went ${P2 > P1 ? 'up' : 'down'}, so volume should go ${P2 > P1 ? 'down' : 'up'}.`]]);
    }
    const p = P1 * V1 / V2;
    return num(`A ${V1} ${vu} sample of gas is at ${P1} ${pu}. What pressure would the gas be at in a ${V2} ${vu} container at the same temperature?`, p, 3, pu,
      [[M, '<b>Boyle\'s law: P₁V₁ = P₂V₂</b>.'], [W, `P₂ = P₁V₁ ÷ V₂ = (${P1} × ${V1}) ÷ ${V2} = ${sig(p, 4)} ${pu}`], [M, `Smaller volume → higher pressure (and vice versa).`]]);
  }
  function g19charles() {
    const vu = pick(['L', 'mL']), V1 = vu === 'L' ? U(1.5, 30, 2) : U(15, 400, 1), T1 = R(-30, 150), askT = Math.random() < 0.5;
    if (askT) {
      const V2 = +(V1 * U(0.5, 1.8, 2)).toFixed(vu === 'L' ? 2 : 1), Tk = K(T1) * V2 / V1, Tc = Tk - 273.15;
      return { prompt: `A gas at ${T1} °C occupies ${V1} ${vu}. At constant pressure its volume changes to ${V2} ${vu}. What is the new temperature in °C? Round to the ones place.`,
        kind: 'num', value: Math.round(Tc), tol: 1.01, abs: true, unit: '°C', display: Math.round(Tc) + ' °C',
        steps: [[M, '<b>Charles\'s law: V₁/T₁ = V₂/T₂</b>, with T in <b>Kelvin</b>.'], [W, `T₁ = ${T1} + 273.15 = ${f2(K(T1))} K`],
          [W, `T₂ = T₁ × V₂/V₁ = ${f2(K(T1))} × ${V2}/${V1} = ${f1(Tk)} K`], [M, `Back to °C: ${f1(Tk)} − 273.15 = <b>${Math.round(Tc)} °C</b>. (The Kelvin number is a common wrong choice.)`]] };
    }
    const T2 = R(-30, 200), v = V1 * K(T2) / K(T1);
    return num(`A gas occupies ${V1} ${vu} at ${T1} °C. What volume does it occupy at ${T2} °C and the same pressure?`, v, 3, vu,
      [[M, '<b>Charles\'s law: V₁/T₁ = V₂/T₂</b>, T in Kelvin.'], [W, `T₁ = ${f2(K(T1))} K, T₂ = ${f2(K(T2))} K`], [W, `V₂ = V₁ × T₂/T₁ = ${V1} × ${f2(K(T2))}/${f2(K(T1))} = ${sig(v, 4)} ${vu}`]]);
  }
  function g19combined() {
    const pu = pick(['atm', 'mmHg', 'torr']), vu = pick(['L', 'mL']);
    const P1 = pu === 'atm' ? U(0.5, 6, 2) : U(250, 990, 0), V1 = vu === 'L' ? U(2, 40, 1) : U(20, 450, 1), T1 = R(-20, 140);
    const P2 = pu === 'atm' ? +(P1 * U(0.4, 2.2, 2)).toFixed(2) : Math.round(P1 * U(0.4, 2.2, 2)), V2 = +(V1 * U(0.4, 2.2, 2)).toFixed(1), T2 = R(-20, 160);
    const ask = R(0, 2), base = [[M, '<b>Combined gas law: P₁V₁/T₁ = P₂V₂/T₂</b>. T must be in <b>Kelvin</b>; P and V units only have to match.'], [W, `T₁ = ${T1} + 273.15 = ${f2(K(T1))} K` + (ask !== 2 ? `, T₂ = ${T2} + 273.15 = ${f2(K(T2))} K` : '')]];
    if (ask === 0) {
      const p = P1 * V1 * K(T2) / (K(T1) * V2);
      return num(`A gas sample at ${P1} ${pu} occupies ${V1} ${vu} at ${T1} °C. It is changed to ${V2} ${vu} and ${T2} °C. What is the final pressure?`, p, 3, pu,
        base.concat([[W, `P₂ = P₁ × (V₁/V₂) × (T₂/T₁) = ${P1} × (${V1}/${V2}) × (${f2(K(T2))}/${f2(K(T1))}) = ${sig(p, 4)} ${pu}`]]));
    }
    if (ask === 1) {
      const v = V1 * P1 * K(T2) / (P2 * K(T1));
      return num(`A gas sample occupies ${V1} ${vu} at ${T1} °C and ${P1} ${pu}. What is the volume at ${T2} °C and ${P2} ${pu}?`, v, 3, vu,
        base.concat([[W, `V₂ = V₁ × (P₁/P₂) × (T₂/T₁) = ${V1} × (${P1}/${P2}) × (${f2(K(T2))}/${f2(K(T1))}) = ${sig(v, 4)} ${vu}`]]));
    }
    const Tk = K(T1) * P2 * V2 / (P1 * V1), Tc = Tk - 273.15;
    return { prompt: `A gas sample occupies ${V1} ${vu} at ${T1} °C and ${P1} ${pu}. What is the temperature in °C if it changes to ${V2} ${vu} and ${P2} ${pu}? Round to 1 decimal place.`,
      kind: 'num', value: +f1(Tc), tol: 0.3, abs: true, unit: '°C', display: f1(Tc) + ' °C',
      steps: base.concat([[W, `T₂ = T₁ × (P₂V₂)/(P₁V₁) = ${f2(K(T1))} × (${P2} × ${V2})/(${P1} × ${V1}) = ${f1(Tk)} K`],
        [M, `Back to °C: ${f1(Tk)} − 273.15 = <b>${f1(Tc)} °C</b>.`]]) };
  }

  /* ================= HW 20: ideal gas law, molar mass, density, gas stoichiometry ================= */
  const IG = [[M, '<b>PV = nRT</b> with R = 0.0821 L·atm/(mol·K): P in <b>atm</b>, V in <b>L</b>, T in <b>K</b>.']];
  function g20ideal() {
    const ask = R(0, 4), T = R(-20, 300), Tk = K(T), Rg = 'R = 0.0821 L·atm/(mol·K)';
    if (ask === 0) {
      const n = U(0.05, 3, 3), ml = Math.random() < 0.4, V = ml ? R(150, 950) : U(1, 30, 2), VL = ml ? V / 1000 : V, p = n * RG * Tk / VL;
      return num(`What pressure in atm will ${n} moles of a gas exert in ${V} ${ml ? 'mL' : 'L'} at ${T} °C?`, p, 3, 'atm',
        IG.concat(ml ? [[M, `${V} mL ÷ 1000 = <b>${VL} L</b>`]] : []).concat([[W, `T = ${T} + 273.15 = ${f2(Tk)} K`], [W, `P = nRT/V = ${n} × 0.0821 × ${f2(Tk)} ÷ ${VL} = ${sig(p, 4)} atm`]]), Rg);
    }
    if (ask === 1) {
      const n = U(0.1, 3, 3), P = U(0.5, 3, 3), v = n * RG * Tk / P;
      return num(`What volume will ${n} moles of gas occupy at ${P} atm and ${T} °C?`, v, 3, 'L',
        IG.concat([[W, `T = ${f2(Tk)} K`], [W, `V = nRT/P = ${n} × 0.0821 × ${f2(Tk)} ÷ ${P} = ${sig(v, 4)} L`]]), Rg);
    }
    if (ask === 2) {
      const V = U(2, 40, 1), mm = Math.random() < 0.4, P = mm ? R(300, 990) : U(0.3, 4, 3), Pa = mm ? P / 760 : P, n = Pa * V / (RG * Tk);
      return num(`How many moles of gas are in a ${V} L container at ${P} ${mm ? 'mmHg' : 'atm'} and ${T} °C?`, n, 3, 'mol',
        IG.concat(mm ? [[M, `Pressure to atm: ${P} ÷ 760 = <b>${sig(Pa, 4)} atm</b>`]] : []).concat([[W, `T = ${f2(Tk)} K`], [W, `n = PV/RT = ${sig(Pa, 4)} × ${V} ÷ (0.0821 × ${f2(Tk)}) = ${sig(n, 4)} mol`]]), Rg);
    }
    if (ask === 3) {
      const n = U(0.5, 3, 2), V = U(5, 50, 1), P = U(0.8, 4, 2), Tk2 = P * V / (n * RG), Tc = Tk2 - 273.15;
      if (Tc < -100) return g20ideal();
      return { prompt: `${n} moles of a gas occupy ${V} L at ${P} atm. What is the temperature in °C? Round to the ones place.`, given: Rg,
        kind: 'num', value: Math.round(Tc), tol: 1.01, abs: true, unit: '°C', display: Math.round(Tc) + ' °C',
        steps: IG.concat([[W, `T = PV/(nR) = ${P} × ${V} ÷ (${n} × 0.0821) = ${f1(Tk2)} K`], [M, `PV = nRT gives Kelvin. Convert: ${f1(Tk2)} − 273.15 = <b>${Math.round(Tc)} °C</b>.`]]) };
    }
    const g = pick(GAS.filter(x => x[0].length > 1 || x[0] === 'He' || x[0] === 'Ne')), m = U(1, 25, 2), V = U(1, 12, 2), p = (m / g[2]) * RG * Tk / V;
    const dia = ['H₂', 'N₂', 'O₂', 'Cl₂'].includes(g[0]);
    return num(`What pressure is exerted by ${m} grams of ${g[1]} gas in a ${V} L container at ${T} °C?`, p, 3, 'atm',
      [[M, 'Grams aren\'t in PV = nRT. Turn grams into <b>moles</b> first.'], [B, `${dia ? `${g[1]} gas is <b>diatomic</b>: use ` : 'Molar mass of '}${g[0]} = <b>${g[2]} g/mol</b>.`],
        [W, fl([m, 'g ' + g[0]], [[['1', 'mol ' + g[0]], [g[2], 'g ' + g[0]]]], [sig(m / g[2], 4), 'mol ' + g[0]])], [W, `T = ${f2(Tk)} K`],
        [W, `P = nRT/V = ${sig(m / g[2], 4)} × 0.0821 × ${f2(Tk)} ÷ ${V} = ${sig(p, 4)} atm`]], Rg);
  }
  function g20stp() {
    const ask = R(0, 2);
    if (ask === 0) { const n = U(0.1, 4, 2), v = n * 22.4;
      return num(`What volume (in L) does ${n} mol of gas occupy at STP?`, v, String(n).replace('.', '').replace(/^0+/, '').length, 'L',
        [[M, '<b>At STP (0 °C, 1 atm), 1 mol of any gas = 22.4 L.</b>'], [W, fl([n, 'mol'], [[['22.4', 'L'], ['1', 'mol']]], [sig(v, 3), 'L'])]]); }
    if (ask === 1) { const v = U(2, 90, 1), n = v / 22.4;
      return num(`A gas fills a ${v} L container at STP. How many moles are in the container?`, n, 3, 'mol',
        [[M, '<b>1 mol = 22.4 L at STP.</b>'], [W, fl([v, 'L'], [[['1', 'mol'], ['22.4', 'L']]], [sig(n, 3), 'mol'])]]); }
    const S = [['standard temperature for gases in °C', '0 °C', ['25 °C', '273.15 °C', '100 °C']], ['standard temperature for gases in Kelvin', '273.15 K', ['298.15 K', '0 K', '373.15 K']],
      ['standard pressure for gases', '1 atm', ['760 atm', '0 atm', '101.325 atm']], ['molar volume of a gas at STP', '22.4 L/mol', ['24.5 L/mol', '1.00 L/mol', '0.0821 L/mol']],
      ['correct value of R for PV = nRT with P in atm', '0.0821 L·atm/(mol·K)', ['0.821 L·atm/(mol·K)', '8.314 L·atm/(mol·K)', '22.4 L·atm/(mol·K)']]];
    const [w, r, ds] = pick(S);
    return mc(`What is the ${w}?`, r, ds, [[M, 'Gas STP = <b>0 °C (273.15 K) and 1 atm</b>; 1 mol = 22.4 L; R = 0.0821 L·atm/(mol·K) with T always in Kelvin. (Thermodynamic standard state is 25 °C; don\'t mix them up.)']]);
  }
  function g20molar() {
    const g = pick(GAS.slice(2)), T = R(0, 120), Tk = K(T);
    if (Math.random() < 0.5) {
      const V = U(0.3, 5, 3), P = U(0.6, 2, 3), m = +(P * V / (RG * Tk) * g[2]).toFixed(2), mm = m * RG * Tk / (P * V);
      return num(`What is the molar mass of a gas if ${m} g of it in a ${V} L flask at ${T} °C has a pressure of ${P} atm?`, mm, 3, 'g/mol',
        [[M, '<b>Molar mass = grams ÷ moles</b>. Get moles from PV = nRT (or use M = mRT/PV).'], [W, `n = PV/RT = ${P} × ${V} ÷ (0.0821 × ${f2(Tk)}) = ${sig(P * V / (RG * Tk), 4)} mol`],
          [W, `M = ${m} g ÷ ${sig(P * V / (RG * Tk), 4)} mol = ${sig(mm, 4)} g/mol`]], 'R = 0.0821 L·atm/(mol·K)');
    }
    const P = U(0.8, 20, 2), d = P * g[2] / (RG * Tk);
    return num(`Determine the density in g/L of a gas with a molar mass of ${g[2]} g/mol at ${f2(Tk)} K and ${P} atm.`, d, 3, 'g/L',
      [[M, '<b>Density d = PM/(RT)</b> (from PV = nRT with n = m/M).'], [W, `d = ${P} × ${g[2]} ÷ (0.0821 × ${f2(Tk)}) = ${sig(d, 4)} g/L`]], 'R = 0.0821 L·atm/(mol·K)');
  }
  const GSTOICH = [
    { eq: '2 KClO₃ → 2 KCl + 3 O₂', s: 'KClO₃', ms: 122.55, a: 2, g: 'O₂', b: 3, name: 'potassium chlorate decomposes' },
    { eq: '2 N₂ + 3 O₂ → 2 N₂O₃', s: 'N₂O₃', ms: 76.02, a: 2, g: 'O₂', b: 3, name: 'oxygen is used to make dinitrogen trioxide', rev: true },
    { eq: '2 H₂O₂ → 2 H₂O + O₂', s: 'H₂O₂', ms: 34.02, a: 2, g: 'O₂', b: 1, name: 'hydrogen peroxide decomposes' },
    { eq: 'CaCO₃ → CaO + CO₂', s: 'CaCO₃', ms: 100.09, a: 1, g: 'CO₂', b: 1, name: 'calcium carbonate is heated' },
    { eq: 'Zn + 2 HCl → ZnCl₂ + H₂', s: 'Zn', ms: 65.38, a: 1, g: 'H₂', b: 1, name: 'zinc reacts with excess hydrochloric acid' },
    { eq: '2 NaN₃ → 2 Na + 3 N₂', s: 'NaN₃', ms: 65.02, a: 2, g: 'N₂', b: 3, name: 'sodium azide decomposes (air bag)' },
  ];
  function g20stoich() {
    const r = pick(GSTOICH), m = U(1, 20, 2), mol = m / r.ms * r.b / r.a, chain = fl([m, 'g ' + r.s], [[['1', 'mol ' + r.s], [r.ms, 'g ' + r.s]], [[r.b, 'mol ' + r.g], [r.a, 'mol ' + r.s]]], [sig(mol, 4), 'mol ' + r.g]);
    const head = [[M, 'Gas stoichiometry: grams → moles → <b>mole ratio</b> → moles of gas, then <b>PV = nRT</b> (or 22.4 L/mol at STP).'], [C, `Balanced: ${r.eq}. Molar mass ${r.s} = ${r.ms} g/mol.`], [W, chain]];
    const k = R(0, 2);
    if (k === 0) {
      const v = mol * 22.4;
      return num(`${r.name[0].toUpperCase() + r.name.slice(1)}: ${r.eq}. How many liters of ${r.g} ${r.rev ? 'are needed to make' : 'form from'} ${m} g of ${r.s} at STP?`, v, 3, 'L',
        head.concat([[M, fl([sig(mol, 4), 'mol ' + r.g], [[['22.4', 'L'], ['1', 'mol ' + r.g]]], [sig(v, 4), 'L'])]]));
    }
    const T = R(0, 60), Tk = K(T);
    if (k === 1) {
      const P = R(700, 780), Pa = P / 760, v = mol * RG * Tk / Pa;
      return num(`${r.name[0].toUpperCase() + r.name.slice(1)}: ${r.eq}. What volume of ${r.g} is ${r.rev ? 'needed to make' : 'collected from'} ${m} g of ${r.s} at ${T} °C and ${P} mmHg?`, v, 3, 'L',
        head.concat([[M, `P to atm: ${P} ÷ 760 = ${sig(Pa, 4)} atm; T = ${f2(Tk)} K.`], [W, `V = nRT/P = ${sig(mol, 4)} × 0.0821 × ${f2(Tk)} ÷ ${sig(Pa, 4)} = ${sig(v, 4)} L`]]), 'R = 0.0821 L·atm/(mol·K)');
    }
    const V = U(1.5, 12, 2), p = mol * RG * Tk / V;
    return num(`${r.eq}. What pressure of ${r.g} is ${r.rev ? 'required to produce' : 'produced from'} ${m} g of ${r.s} in a ${V} L container at ${f2(Tk)} K?`, p, 3, 'atm',
      head.concat([[W, `P = nRT/V = ${sig(mol, 4)} × 0.0821 × ${f2(Tk)} ÷ ${V} = ${sig(p, 4)} atm`]]), 'R = 0.0821 L·atm/(mol·K)');
  }
  const GVOL = [['N₂ (g) + 3 H₂ (g) → 2 NH₃ (g)', [['N₂', 1], ['H₂', 3]], [['NH₃', 2]]], ['2 H₂ (g) + O₂ (g) → 2 H₂O (g)', [['H₂', 2], ['O₂', 1]], [['H₂O', 2]]],
    ['2 CO (g) + O₂ (g) → 2 CO₂ (g)', [['CO', 2], ['O₂', 1]], [['CO₂', 2]]], ['CH₄ (g) + 2 O₂ (g) → CO₂ (g) + 2 H₂O (g)', [['CH₄', 1], ['O₂', 2]], [['CO₂', 1], ['H₂O', 2]]],
    ['A₂Z (g) + 2 X (g) → 2 AX (g) + Z (g)', [['A₂Z', 1], ['X', 2]], [['AX', 2], ['Z', 1]]], ['2 SO₂ (g) + O₂ (g) → 2 SO₃ (g)', [['SO₂', 2], ['O₂', 1]], [['SO₃', 2]]]];
  function g20vol() {
    const [eq, rs, ps] = pick(GVOL), a = pick(rs), b = pick(ps.concat(rs.filter(x => x !== a))), L = U(0.5, 15, 2), v = L * b[1] / a[1];
    return num(`At constant temperature and pressure: ${eq}. If ${L} L of ${a[0]} react${b[0] === a[0] ? '' : ' completely'}, how many liters of ${b[0]} ${rs.includes(b) ? 'react with it' : 'form'}?`, v, String(L).replace('.', '').replace(/^0+/, '').length, 'L',
      [[M, '<b>Volume shortcut</b>: when every substance is a gas at the same T and P, liters follow the same ratio as the coefficients.'],
        [W, fl([L, 'L ' + a[0]], [[[b[1], 'L ' + b[0]], [a[1], 'L ' + a[0]]]], [sig(v, 3), 'L ' + b[0]])]]);
  }

  /* ================= HW 21: Dalton, mole fraction, specific heat, calorimetry ================= */
  function g21dalton() {
    const k = R(0, 3);
    if (k === 0) {
      const n = R(3, 5), ps = Array.from({ length: n }, () => U(0.2, 3, 2)), tot = ps.reduce((a, b) => a + b, 0);
      return { prompt: `${n} gases are mixed in one container with partial pressures ${ps.map((p, i) => `${'ABCDE'[i]} = ${f2(p)} atm`).join(', ')}. What is the total pressure in atm? Round to the hundredths place.`,
        kind: 'num', value: +f2(tot), tol: 0.011, abs: true, unit: 'atm', display: f2(tot) + ' atm',
        steps: [[M, '<b>Dalton\'s law: P_total = P_A + P_B + …</b>'], [W, ps.map(f2).join(' + ') + ` = <b>${f2(tot)} atm</b>`]] };
    }
    if (k === 1) {
      const mm = U(150, 900, 1), a = U(0.2, 2, 2), b = U(0.5, 4, 2), tot = mm / 760 + a + b;
      return { prompt: `Three gases are mixed. Partial pressures: A = ${f1(mm)} mmHg, B = ${f2(a)} atm, C = ${f2(b)} atm. What is the total pressure in atm? Round to the hundredths place.`,
        kind: 'num', value: +f2(tot), tol: 0.011, abs: true, unit: 'atm', display: f2(tot) + ' atm',
        steps: [[M, '<b>Units first</b>: every pressure must be in the same unit before adding. 1 atm = 760 mmHg.'], [W, `${f1(mm)} ÷ 760 = ${(mm / 760).toFixed(3)} atm`],
          [W, `${(mm / 760).toFixed(3)} + ${f2(a)} + ${f2(b)} = <b>${f2(tot)} atm</b>`]] };
    }
    if (k === 2) {
      const tot = U(600, 1200, 1), a = U(50, 300, 1), b = U(50, 300, 1), c = tot - a - b;
      return { prompt: `Gases A, B and C are in one container at a total pressure of ${f1(tot)} mmHg. P_A = ${f1(a)} mmHg and P_B = ${f1(b)} mmHg. What is P_C in mmHg? Round to the tenths place.`,
        kind: 'num', value: +f1(c), tol: 0.11, abs: true, unit: 'mmHg', display: f1(c) + ' mmHg',
        steps: [[M, '<b>P_total = P_A + P_B + P_C</b>, so P_C = P_total − P_A − P_B.'], [W, `${f1(tot)} − ${f1(a)} − ${f1(b)} = <b>${f1(c)} mmHg</b>`]] };
    }
    const [g1, g2] = shuffle(GAS).slice(0, 2), n1 = U(0.2, 2, 2), n2 = U(0.2, 2, 2), V = U(2, 12, 2), T = R(0, 300), p = (n1 + n2) * RG * K(T) / V;
    return num(`${n1} mol of ${g1[1]} and ${n2} mol of ${g2[1]} are placed in a ${V} L container at ${T} °C. What total pressure does the mixture exert?`, p, 3, 'atm',
      [[M, 'For a mixture, add the moles and use <b>PV = nRT</b> with n_total.'], [W, `n_total = ${n1} + ${n2} = ${f2(n1 + n2)} mol; T = ${f2(K(T))} K`],
        [W, `P = ${f2(n1 + n2)} × 0.0821 × ${f2(K(T))} ÷ ${V} = ${sig(p, 4)} atm`]], 'R = 0.0821 L·atm/(mol·K)');
  }
  function g21frac() {
    const k = R(0, 2);
    if (k === 0) {
      const ma = U(20, 140, 1), mb = U(20, 140, 1), g = U(1, 10, 2), na = g / ma, nb = g / mb, x = na / (na + nb);
      return num(`A gas mixture contains ${g} g of element A (${ma} g/mol) and ${g} g of element B (${mb} g/mol). What is the mole fraction of A?`, x, 3, '',
        [[M, '<b>Mole fraction X_A = mol A ÷ total mol</b> (no unit).'], [W, `n_A = ${g} ÷ ${ma} = ${sig(na, 4)} mol; n_B = ${g} ÷ ${mb} = ${sig(nb, 4)} mol`],
          [W, `X_A = ${sig(na, 4)} ÷ (${sig(na, 4)} + ${sig(nb, 4)}) = ${sig(x, 4)}`]]);
    }
    if (k === 1) {
      const xs = shuffle([0.10, 0.20, 0.30, 0.40]), tot = U(1, 6, 2), p = xs[0] * tot;
      return num(`Gases A, B, C and D are in a sealed container at a total pressure of ${tot} atm. The mole fractions are A = ${xs[0].toFixed(2)}, B = ${xs[1].toFixed(2)}, C = ${xs[2].toFixed(2)}, D = ${xs[3].toFixed(2)}. What is the partial pressure of A?`, p, 2, 'atm',
        [[M, '<b>P_A = X_A × P_total</b>.'], [W, `${xs[0].toFixed(2)} × ${tot} = ${sig(p, 4)} atm`]]);
    }
    const P1 = R(100, 400), V1 = U(1, 4, 2), P2 = R(100, 500), V2 = U(1, 4, 2), Vt = +(V1 + V2).toFixed(2), a = P1 * V1 / Vt, b = P2 * V2 / Vt, t = a + b;
    return num(`Helium at ${P1} mmHg is in a ${V1} L container and argon at ${P2} mmHg is in a ${V2} L container, both at the same temperature. The containers are connected (total volume ${Vt} L). What is the total pressure?`, t, 3, 'mmHg',
      [[M, 'Each gas expands into the <b>whole</b> volume (Boyle: P₁V₁ = P₂V₂), then add the partial pressures.'], [W, `He: ${P1} × ${V1}/${Vt} = ${sig(a, 4)} mmHg`],
        [W, `Ar: ${P2} × ${V2}/${Vt} = ${sig(b, 4)} mmHg`], [W, `Total = ${sig(a, 4)} + ${sig(b, 4)} = ${sig(t, 4)} mmHg`]]);
  }
  const METAL = [['aluminum', 0.897], ['iron', 0.449], ['copper', 0.385], ['gold', 0.129], ['lead', 0.128], ['silver', 0.235], ['zinc', 0.388], ['nickel', 0.444]];
  const ENERGY = [
    ['The symbol q represents heat energy.', true, 'q = heat transferred.'],
    ['Energy cannot be created or destroyed.', true, 'First law of thermodynamics (conservation of energy).'],
    ['Kinetic energy is energy due to composition or position.', false, 'Kinetic = energy of <b>motion</b>. Composition/position = <b>potential</b> energy.'],
    ['Potential energy is stored energy due to position or composition.', true, 'e.g. chemical energy stored in bonds.'],
    ['Phase changes do not involve any energy transfer.', false, 'Melting, boiling and so on always absorb or release energy.'],
    ['Some chemical reactions absorb energy while others release energy.', true, 'Endothermic absorb; exothermic release.'],
    ['Energy can change forms, such as from heat energy to chemical energy.', true, 'It changes form but the total stays constant.'],
    ['A positive q means the system absorbed heat.', true, '+q = heat in (endothermic for that object); −q = heat out.'],
    ['When a cold metal is placed in hot water, heat flows from the cold metal to the hot water.', false, 'Heat always flows <b>hot → cold</b>: water (−q) to metal (+q).'],
    ['A substance with a higher specific heat needs more energy to raise its temperature by the same amount.', true, 'c = J per gram per °C; bigger c = more J per degree.'],
    ['Two equal masses absorb the same heat; the one with the lower specific heat ends up at the higher temperature.', true, 'ΔT = q/(mc): smaller c → bigger ΔT.'],
    ['As two hot objects cool by the same amount, the one with the higher specific heat releases less heat.', false, 'Higher c releases <b>more</b> heat for the same ΔT.'],
    ['Metal samples of equal mass heated to 100 °C are dropped into equal amounts of room-temperature water; the metal with the higher specific heat makes its water warmer.', true, 'It carries more heat into the water.'],
    ['The first law of thermodynamics says the energy of the universe is constant.', true, 'Energy is transferred or changes form, never created or destroyed.'],
    ['Temperature measures heat energy.', true, 'Your course grades this as true (HW 21). Strictly, temperature tracks average kinetic energy.'],
  ];
  function g21concept() {
    if (Math.random() < 0.3) {
      const [a, b] = shuffle(METAL).slice(0, 2), hi = a[1] > b[1] ? a : b, lo = hi === a ? b : a, small = Math.random() < 0.5;
      return mc(`1.0 g of ${a[0]} (c = ${a[1]} J/g·°C) and 1.0 g of ${b[0]} (c = ${b[1]} J/g·°C) start at the same temperature and each absorbs 100 J. Which one ends at the ${small ? 'lower' : 'higher'} temperature?`,
        small ? hi[0] : lo[0], [small ? lo[0] : hi[0], 'They end at the same temperature'],
        [[M, '<b>ΔT = q ÷ (m·c)</b>: the higher specific heat gets the <b>smaller</b> temperature change.'], [W, `${hi[0]} has the higher c (${hi[1]}), so it warms less; ${lo[0]} warms more.`]]);
    }
    const [s, t, why] = pick(ENERGY);
    return tf(s, t, [[M, why]]);
  }
  function g21q() {
    const [nm, c] = pick(METAL), m = U(5, 60, 1), T1 = U(15, 60, 1), heat = Math.random() < 0.6, T2 = +(heat ? T1 + U(20, 90, 1) : T1 - U(5, 14, 1)).toFixed(1);
    const dT = +(T2 - T1).toFixed(1), q = m * c * dT, k = R(0, 3), base = [[M, '<b>q = m · c · ΔT</b>, with ΔT = T_final − T_initial. Heat absorbed is +q; heat released is −q.']];
    const sfd = String(Math.abs(dT).toFixed(1)).replace('.', '').replace(/^0+/, '').length, sf = Math.min(3, sfd);
    if (k === 0) return num(`${m} g of ${nm} (c = ${c} J/(g·°C)) goes from ${T1} °C to ${T2} °C. How much heat is ${dT > 0 ? 'absorbed' : 'released'}? (Give the amount as a positive number.)`, Math.abs(q), sf, 'J',
      base.concat([[W, `ΔT = ${T2} − ${T1} = ${dT} °C`], [W, `q = ${m} × ${c} × ${dT} = ${sig(q, 4)} J (${q > 0 ? 'absorbed' : 'released'})`]]));
    const Q = Number(Math.abs(q).toPrecision(3));
    if (k === 1) { const mm = Q / (c * Math.abs(dT));
      return num(`A metal with c = ${c} J/(g·°C) ${dT > 0 ? 'was heated' : 'was COOLED'} from ${T1} °C to ${T2} °C. If ${Q} J were ${dT > 0 ? 'absorbed' : 'released'}, what was the mass of the metal?`, mm, sf, 'g',
        base.concat([[W, `m = q ÷ (c·ΔT) = ${dT > 0 ? '' : '−'}${Q} ÷ (${c} × ${dT}) = ${sig(mm, 4)} g${dT > 0 ? '' : ' (the negatives cancel)'}`]])); }
    if (k === 2) { const cc = Q / (m * Math.abs(dT));
      return num(`${Q} J of heat were ${dT > 0 ? 'absorbed' : 'released'} when ${m} g of a metal went from ${T1} °C to ${T2} °C. What is its specific heat in J/(g·°C)?`, cc, sf, 'J/(g·°C)',
        base.concat([[W, `c = q ÷ (m·ΔT) = ${dT > 0 ? '' : '−'}${Q} ÷ (${m} × ${dT}) = ${sig(cc, 4)} J/(g·°C)`], [M, 'A specific heat is never negative; if you get one, a sign is off.']])); }
    const Tf = T1 + (dT > 0 ? 1 : -1) * Q / (m * c);
    return { prompt: `A ${m} g sample of ${nm} (c = ${c} J/(g·°C)) is initially at ${T1} °C. It ${dT > 0 ? 'absorbs' : 'loses'} ${Q} J of heat. What is its final temperature? One decimal place.`,
      kind: 'num', value: +f1(Tf), tol: 0.15, abs: true, unit: '°C', display: f1(Tf) + ' °C',
      steps: base.concat([[W, `ΔT = q ÷ (m·c) = ${dT > 0 ? '' : '−'}${Q} ÷ (${m} × ${c}) = ${dT > 0 ? '' : '−'}${f2(Q / (m * c))} °C`], [W, `T_final = ${T1} ${dT > 0 ? '+' : '−'} ${f2(Q / (m * c))} = <b>${f1(Tf)} °C</b>`]]) };
  }
  function g21cal() {
    const [nm, c] = pick(METAL), mm = U(20, 80, 1), Tm = U(90, 170, 1), mw = R(30, 200), Tw = U(18, 26, 1);
    const Tf = +((mm * c * Tm + mw * CW * Tw) / (mm * c + mw * CW)).toFixed(1);
    if (Tf - Tw < 1.5) return g21cal();
    const dm = +(Tm - Tf).toFixed(1), dw = +(Tf - Tw).toFixed(1), k = R(0, 3);
    const base = [[M, '<b>Heat lost by the metal = heat gained by the water</b>: m·c·ΔT (metal) = m·c·ΔT (water). Water c = 4.184 J/(g·°C).'],
      [W, `ΔT metal = ${Tm} − ${Tf} = ${dm} °C; ΔT water = ${Tf} − ${Tw} = ${dw} °C`]];
    const sfw = Math.min(3, String(dw.toFixed(1)).replace('.', '').replace(/^0+/, '').length);
    if (k === 0) { const v = mw * CW * dw / (c * dm);
      return num(`A piece of ${nm} at ${Tm} °C is placed in a calorimeter with ${mw} g of water at ${Tw} °C. The final temperature is ${Tf} °C. What is the mass of the ${nm}? (c = ${c} J/(g·°C))`, v, sfw, 'g',
        base.concat([[W, `Water gains ${mw} × 4.184 × ${dw} = ${sig(mw * CW * dw, 4)} J`], [W, `m = ${sig(mw * CW * dw, 4)} ÷ (${c} × ${dm}) = ${sig(v, 4)} g`]])); }
    if (k === 1) { const v = mm * c * dm / (CW * dw);
      return num(`A ${mm} g piece of ${nm} at ${Tm} °C is placed in a calorimeter with water at ${Tw} °C. The final temperature is ${Tf} °C. What is the mass of the water? (c = ${c} J/(g·°C))`, v, sfw, 'g',
        base.concat([[W, `Metal loses ${mm} × ${c} × ${dm} = ${sig(mm * c * dm, 4)} J`], [W, `m water = ${sig(mm * c * dm, 4)} ÷ (4.184 × ${dw}) = ${sig(v, 4)} g`]])); }
    if (k === 2) { const v = mw * CW * dw / (mm * dm);
      return num(`A ${mm} g piece of metal at ${Tm} °C is placed in a calorimeter with ${mw} g of water at ${Tw} °C. The final temperature is ${Tf} °C. What is the specific heat of the metal?`, v, sfw, 'J/(g·°C)',
        base.concat([[W, `Water gains ${mw} × 4.184 × ${dw} = ${sig(mw * CW * dw, 4)} J`], [W, `c = ${sig(mw * CW * dw, 4)} ÷ (${mm} × ${dm}) = ${sig(v, 4)} J/(g·°C)`]])); }
    const Ti = Tf - mm * c * dm / (mw * CW);
    return { prompt: `A ${mm} g piece of metal (c = ${c} J/(g·°C)) at ${Tm} °C is placed in a calorimeter with ${mw} g of water. The final temperature is ${Tf} °C. What was the initial temperature of the water? Round to the tenths place.`,
      kind: 'num', value: +f1(Ti), tol: 0.15, abs: true, unit: '°C', display: f1(Ti) + ' °C',
      steps: [base[0], [W, `Metal loses ${mm} × ${c} × (${Tm} − ${Tf}) = ${sig(mm * c * dm, 4)} J`], [W, `Water ΔT = ${sig(mm * c * dm, 4)} ÷ (${mw} × 4.184) = ${f2(mm * c * dm / (mw * CW))} °C`],
        [W, `Initial water T = ${Tf} − ${f2(mm * c * dm / (mw * CW))} = <b>${f1(Ti)} °C</b>`]] };
  }

  /* ================= HW 22: enthalpy, heats of formation, Hess's law ================= */
  const RX = [
    { eq: 'H₂ (g) + Cl₂ (g) → 2 HCl (g)', dh: -184.6 }, { eq: 'C₃H₈ (g) + 5 O₂ (g) → 3 CO₂ (g) + 4 H₂O (l)', dh: -2219.9 }, { eq: '2 CO₂ (g) → 2 CO (g) + O₂ (g)', dh: 566.0 },
    { eq: '4 HCl (g) + O₂ (g) → 2 H₂O (l) + 2 Cl₂ (g)', dh: -202.5 }, { eq: 'N₂ (g) + O₂ (g) → 2 NO (g)', dh: 180.5 }, { eq: '2 SO₃ (g) → 2 SO₂ (g) + O₂ (g)', dh: 198 },
    { eq: 'CaCO₃ (s) → CaO (s) + CO₂ (g)', dh: 178.1 }, { eq: 'CH₄ (g) + 2 O₂ (g) → CO₂ (g) + 2 H₂O (l)', dh: -890.4 }, { eq: '2 H₂O (l) → 2 H₂ (g) + O₂ (g)', dh: 571.6 }];
  function g22sign() {
    const r = pick(RX), exo = r.dh < 0, k = R(0, 3), dh = `ΔH = ${r.dh} kJ`;
    if (k === 0) return mc(`${r.eq}   ${dh}. Is this reaction exothermic or endothermic?`, exo ? 'exothermic' : 'endothermic', [exo ? 'endothermic' : 'exothermic'],
      [[M, '<b>Negative ΔH = exothermic</b> (releases heat). <b>Positive ΔH = endothermic</b> (absorbs heat).'], [W, `ΔH is ${exo ? 'negative' : 'positive'} → <b>${exo ? 'exothermic' : 'endothermic'}</b>.`]]);
    if (k === 1) return mc(`${r.eq}   ${dh}. Where would you write the word "heat" in this equation?`, exo ? 'to the RIGHT of the arrow (product)' : 'to the LEFT of the arrow (reactant)',
      [exo ? 'to the LEFT of the arrow (reactant)' : 'to the RIGHT of the arrow (product)'],
      [[M, 'Exothermic (−ΔH) gives off heat, so heat is a <b>product</b>. Endothermic (+ΔH) takes in heat, so heat is a <b>reactant</b>.'], [W, `ΔH ${exo ? '< 0' : '> 0'} → heat goes on the <b>${exo ? 'right' : 'left'}</b>.`]]);
    if (k === 2) {
      const [L, Rr] = r.eq.split(' → '), a = Math.abs(r.dh);
      const right = exo ? `${L} → ${Rr} + ${a} kJ` : `${L} + ${a} kJ → ${Rr}`;
      return mc(`${dh}. Which equation shows the energy written in correctly?`, right,
        [exo ? `${L} + ${a} kJ → ${Rr}` : `${L} → ${Rr} + ${a} kJ`, exo ? `${L} → ${Rr} − ${a} kJ` : `${L} − ${a} kJ → ${Rr}`],
        [[M, 'Energy written inside an equation is always <b>added (+)</b> on the correct side, never subtracted.'], [W, `${exo ? 'Exothermic: + kJ on the product side' : 'Endothermic: + kJ on the reactant side'}.`]]);
    }
    const abs = Math.random() < 0.5;
    return mc(`Which is a correct statement for a chemical reaction that ${abs ? 'absorbs' : 'releases'} heat?`, abs ? 'endothermic with a positive ΔH' : 'exothermic with a negative ΔH',
      ['exothermic with a positive ΔH', 'endothermic with a negative ΔH', abs ? 'exothermic with a negative ΔH' : 'endothermic with a positive ΔH', 'endothermic with ΔH = 0'],
      [[M, 'Absorbs heat = endo = +ΔH. Releases heat = exo = −ΔH.']]);
  }
  function g22perMol() {
    const mmP = U(60, 380, 2), g = U(0.5, 200, 2), kj = Math.random() < 0.5, rel = Math.random() < 0.5;
    const n = g / mmP, heatVal = kj ? U(50, 900, 1) : U(200, 1500, 1), heatKJ = kj ? heatVal : heatVal / 1000, dh = (rel ? -1 : 1) * heatKJ / n;
    return num(`If ${g} g of a new chemical 'XY₂' is produced by X + 2 Y → XY₂ and the reaction ${rel ? 'releases' : 'absorbs'} ${heatVal} ${kj ? 'kJ' : 'J'} of energy, what is the enthalpy change (ΔH in kJ)?`, dh, 4, 'kJ',
      [[M, '<b>ΔH is per mole of reaction as written</b>: ΔH = heat (kJ) ÷ moles. Sign: released = −, absorbed = +.'], ...(kj ? [] : [[M, `Heat to kJ: ${heatVal} J ÷ 1000 = ${heatKJ} kJ.`]]),
        [W, `n = ${g} g ÷ ${mmP} g/mol = ${sig(n, 4)} mol XY₂`], [W, `ΔH = ${rel ? '−' : '+'}${sig(heatKJ, 4)} kJ ÷ ${sig(n, 4)} mol = ${sig(dh, 5)} kJ`]], `XY₂ molar mass = ${mmP} g/mol`);
  }
  const HST = [
    { eq: '2 SO₃ (g) → 2 SO₂ (g) + O₂ (g)', dh: 198, sp: 'SO₂', co: 2, mm: 64.07 }, { eq: '4 NO + 6 H₂O → 4 NH₃ + 5 O₂', dh: 46.72, sp: 'NH₃', co: 4, mm: 17.04 },
    { eq: '2 H₂ (g) + O₂ (g) → 2 H₂O (l)', dh: -571.6, sp: 'H₂', co: 2, mm: 2.02 }, { eq: 'CH₄ (g) + 2 O₂ (g) → CO₂ (g) + 2 H₂O (l)', dh: -890.4, sp: 'CH₄', co: 1, mm: 16.05 },
    { eq: 'N₂ (g) + 3 H₂ (g) → 2 NH₃ (g)', dh: -92.2, sp: 'NH₃', co: 2, mm: 17.04 }, { eq: 'C₃H₈ (g) + 5 O₂ (g) → 3 CO₂ (g) + 4 H₂O (l)', dh: -2219.9, sp: 'C₃H₈', co: 1, mm: 44.11 },
    { eq: '2 Mg (s) + O₂ (g) → 2 MgO (s)', dh: -1203.4, sp: 'MgO', co: 2, mm: 40.31 }, { eq: 'CaCO₃ (s) → CaO (s) + CO₂ (g)', dh: 178.1, sp: 'CaO', co: 1, mm: 56.08 }];
  function g22stoich() {
    const r = pick(HST), endo = r.dh > 0, a = Math.abs(r.dh);
    if (Math.random() < 0.5) {
      const g = U(1, 60, 2), kj = g / r.mm * a / r.co;
      return num(`${r.eq}   ΔH = ${r.dh} kJ. How many kJ of heat are ${endo ? 'absorbed' : 'released'} when ${g} g of ${r.sp} ${['H₂', 'CH₄', 'C₃H₈', 'Mg'].includes(r.sp) ? 'react' : 'form'}?`, kj, 3, 'kJ',
        [[M, '<b>ΔH is a conversion factor</b>: ' + `(${a} kJ / ${r.co} mol ${r.sp}) — the coefficient of ${r.sp} sits under the kJ.`], [C, `Molar mass ${r.sp} = ${r.mm} g/mol.`],
          [W, fl([g, 'g ' + r.sp], [[['1', 'mol ' + r.sp], [r.mm, 'g ' + r.sp]], [[a, 'kJ'], [r.co, 'mol ' + r.sp]]], [sig(kj, 4), 'kJ'])]], `Molar mass ${r.sp} = ${r.mm} g/mol`);
    }
    const kj = U(10, Math.min(a * 3, 900), 1), g = kj / a * r.co * r.mm;
    return num(`${r.eq}   ΔH = ${r.dh} kJ. How many grams of ${r.sp} are involved when ${kj} kJ of heat ${endo ? 'are absorbed' : 'are released'}?`, g, 3, 'g',
      [[M, 'Start with the kJ, use <b>(' + r.co + ` mol ${r.sp} / ${a} kJ)</b>, then the molar mass.`], [W, fl([kj, 'kJ'], [[[r.co, 'mol ' + r.sp], [a, 'kJ']], [[r.mm, 'g ' + r.sp], ['1', 'mol ' + r.sp]]], [sig(g, 4), 'g ' + r.sp])]],
      `Molar mass ${r.sp} = ${r.mm} g/mol`);
  }
  const STD = [['O₂ (g)', 'O₂ is a gas'], ['N₂ (g)', 'N₂ is a gas'], ['H₂ (g)', 'H₂ is a gas'], ['Cl₂ (g)', 'Cl₂ is a gas'], ['Br₂ (l)', 'bromine is a liquid'], ['I₂ (s)', 'iodine is a solid'],
    ['Hg (l)', 'mercury is a liquid'], ['Fe (s)', 'iron is a solid'], ['Na (s)', 'sodium is a solid'], ['C (s, graphite)', 'carbon is graphite'], ['Ne (g)', 'neon is a gas'], ['Zn (s)', 'zinc is a solid'], ['Ca (s)', 'calcium is a solid']];
  const NOTSTD = ['N₂ (l)', 'Br₂ (s)', 'Br₂ (g)', 'Ca (l)', 'Ne (s)', 'O (g)', 'H (g)', 'H₂O (l)', 'CO₂ (g)', 'O₃ (g)', 'Fe (l)', 'Hg (g)', 'NaCl (s)', 'Cl (g)', 'I₂ (g)'];
  function g22zero() {
    const s = pick(STD);
    return mc('Which of these has a standard enthalpy of formation (ΔH_f°) of zero?', s[0], shuffle(NOTSTD).slice(0, 4),
      [[M, '<b>ΔH_f° = 0 only for an element in its standard state</b> (its normal form at 25 °C and 1 atm). Compounds, single atoms of diatomic elements, and other phases are not zero.'],
        [C, `${s[1]} at 25 °C, so <b>${s[0]}</b> is in its standard state.`]]);
  }
  const FORM = [
    ['CaO (s)', 'Ca (s) + 1/2 O₂ (g) → CaO (s)', ['2 Ca (s) + O₂ (g) → 2 CaO (s)', 'Ca²⁺ (aq) + O²⁻ (aq) → CaO (s)', 'Ca (s) + O (g) → CaO (s)', 'CaO (s) → Ca (s) + 1/2 O₂ (g)']],
    ['NH₃ (g)', '1/2 N₂ (g) + 3/2 H₂ (g) → NH₃ (g)', ['N₂ (g) + 3 H₂ (g) → 2 NH₃ (g)', 'N (g) + 3 H (g) → NH₃ (g)', 'N³⁻ (g) + 3 H⁺ (g) → NH₃ (g)', 'N (g) + H₃ (g) → NH₃ (g)']],
    ['NaCl (s)', 'Na (s) + 1/2 Cl₂ (g) → NaCl (s)', ['2 Na (s) + Cl₂ (g) → 2 NaCl (s)', 'Na⁺ (aq) + Cl⁻ (aq) → NaCl (s)', 'Na (l) + 1/2 Cl₂ (g) → NaCl (s)', 'Na (g) + Cl (g) → NaCl (s)']],
    ['H₂O (l)', 'H₂ (g) + 1/2 O₂ (g) → H₂O (l)', ['2 H₂ (g) + O₂ (g) → 2 H₂O (l)', '2 H (g) + O (g) → H₂O (l)', 'H₂O (l) → H₂ (g) + 1/2 O₂ (g)', 'H₂ (g) + O (g) → H₂O (l)']],
    ['CO₂ (g)', 'C (s, graphite) + O₂ (g) → CO₂ (g)', ['C (g) + 2 O (g) → CO₂ (g)', '2 C (s) + 2 O₂ (g) → 2 CO₂ (g)', 'CO (g) + 1/2 O₂ (g) → CO₂ (g)', 'C (s) + O₂ (l) → CO₂ (g)']],
    ['HCl (g)', '1/2 H₂ (g) + 1/2 Cl₂ (g) → HCl (g)', ['H₂ (g) + Cl₂ (g) → 2 HCl (g)', 'H⁺ (aq) + Cl⁻ (aq) → HCl (g)', 'H (g) + Cl (g) → HCl (g)', 'HCl (g) → 1/2 H₂ (g) + 1/2 Cl₂ (g)']],
    ['Fe₂O₃ (s)', '2 Fe (s) + 3/2 O₂ (g) → Fe₂O₃ (s)', ['4 Fe (s) + 3 O₂ (g) → 2 Fe₂O₃ (s)', '2 Fe³⁺ (aq) + 3 O²⁻ (aq) → Fe₂O₃ (s)', '2 Fe (s) + 3 O (g) → Fe₂O₃ (s)', 'Fe₂ (s) + O₃ (g) → Fe₂O₃ (s)']],
    ['CH₄ (g)', 'C (s, graphite) + 2 H₂ (g) → CH₄ (g)', ['C (g) + 4 H (g) → CH₄ (g)', 'C (s) + H₄ (g) → CH₄ (g)', '2 C (s) + 4 H₂ (g) → 2 CH₄ (g)', 'CH₄ (g) → C (s) + 2 H₂ (g)']],
  ];
  function g22form() {
    const [p, right, wrong] = pick(FORM);
    return mc(`Which is a correctly written formation reaction for ${p}?`, right, wrong,
      [[M, 'A <b>formation reaction</b> makes exactly <b>1 mole</b> of the compound from its <b>elements in their standard states</b> (diatomic gases as X₂, no ions, no lone atoms). Use fractions if needed.'],
        [W, `Only <b>${right}</b> makes 1 mol of ${p} from standard-state elements.`]]);
  }
  const HF = [['CH₄ (g)', -74.6], ['H₂O (l)', -285.83], ['H₂O (g)', -241.8], ['CO₂ (g)', -393.51], ['CO (g)', -110.52], ['NH₃ (g)', -45.9], ['NO (g)', 90.3], ['NO₂ (g)', 33.2],
    ['HCl (g)', -92.31], ['SO₂ (g)', -296.8], ['SO₃ (g)', -395.7], ['C₂H₄ (g)', 52.4], ['C₂H₆ (g)', -84.0], ['CH₃OH (l)', -238.6], ['CaO (s)', -634.9], ['CaCO₃ (s)', -1207.6], ['Fe₂O₃ (s)', -824.2], ['MgO (s)', -601.6]];
  const HFRX = [
    [[['CH₄ (g)', 1], ['O₂ (g)', 2]], [['CO₂ (g)', 1], ['H₂O (l)', 2]]], [[['C₂H₄ (g)', 1], ['O₂ (g)', 3]], [['CO₂ (g)', 2], ['H₂O (l)', 2]]], [[['CaCO₃ (s)', 1]], [['CaO (s)', 1], ['CO₂ (g)', 1]]],
    [[['NH₃ (g)', 4], ['O₂ (g)', 5]], [['NO (g)', 4], ['H₂O (l)', 6]]], [[['SO₂ (g)', 2], ['O₂ (g)', 1]], [['SO₃ (g)', 2]]], [[['CO (g)', 2], ['O₂ (g)', 1]], [['CO₂ (g)', 2]]],
    [[['C₂H₆ (g)', 2], ['O₂ (g)', 7]], [['CO₂ (g)', 4], ['H₂O (l)', 6]]], [[['CH₄ (g)', 3], ['H₂O (l)', 2], ['CO₂ (g)', 1]], [['CO (g)', 4], ['H₂ (g)', 8]]], [[['Fe₂O₃ (s)', 1], ['CO (g)', 3]], [['Fe (s)', 2], ['CO₂ (g)', 3]]],
    [[['NO (g)', 2], ['O₂ (g)', 1]], [['NO₂ (g)', 2]]], [[['CH₃OH (l)', 2], ['O₂ (g)', 3]], [['CO₂ (g)', 2], ['H₂O (l)', 4]]]];
  const hfOf = s => { const h = HF.find(x => x[0] === s); return h ? h[1] : 0; };
  const rxStr = (rs, ps) => rs.map(([s, n]) => (n > 1 ? n + ' ' : '') + s).join(' + ') + ' → ' + ps.map(([s, n]) => (n > 1 ? n + ' ' : '') + s).join(' + ');
  const sumStr = side => side.map(([s, n]) => `${n > 1 ? n + '(' : ''}${hfOf(s)}${n > 1 ? ')' : ''}`).join(' + ');
  function g22hf() {
    if (Math.random() < 0.35) {   // made-up letters like the homework
      const a = U(-400, 400, 1), b = U(-200, 200, 1), c = U(-500, 500, 1), nb = R(1, 3);
      if (Math.random() < 0.5) {
        const dh = c - (a + nb * b);
        return { prompt: `Using the ΔH_f° values, determine ΔH for A (g) + ${nb > 1 ? nb + ' ' : ''}B (g) → AB${nb > 1 ? SUB[nb] : ''} (g). Round to the tenths place.`,
          given: `ΔH_f°: A (g) = ${a} kJ/mol · B (g) = ${b} kJ/mol · AB${nb > 1 ? SUB[nb] : ''} (g) = ${c} kJ/mol`, kind: 'num', value: +f1(dh), tol: 0.15, abs: true, unit: 'kJ', display: f1(dh) + ' kJ',
          steps: [[M, '<b>ΔH_rxn = Σ n·ΔH_f(products) − Σ n·ΔH_f(reactants)</b>. Multiply each by its coefficient.'], [W, `${c} − [${a} + ${nb > 1 ? nb + '(' + b + ')' : b}] = ${c} − (${f1(a + nb * b)}) = <b>${f1(dh)} kJ</b>`]] };
      }
      const dh = U(-400, 400, 1), hfP = dh + (a + nb * b);
      return { prompt: `For A (g) + ${nb > 1 ? nb + ' ' : ''}B (g) → AB${nb > 1 ? SUB[nb] : ''} (g), ΔH_rxn = ${dh} kJ. Find ΔH_f of AB${nb > 1 ? SUB[nb] : ''}. Round to the tenths place.`,
        given: `ΔH_f°: A (g) = ${a} kJ/mol · B (g) = ${b} kJ/mol`, kind: 'num', value: +f1(hfP), tol: 0.15, abs: true, unit: 'kJ/mol', display: f1(hfP) + ' kJ/mol',
        steps: [[M, '<b>ΔH_rxn = products − reactants</b>; solve for the unknown product.'], [W, `${dh} = ΔH_f(AB) − [${a} + ${nb > 1 ? nb + '(' + b + ')' : b}] → ΔH_f(AB) = ${dh} + (${f1(a + nb * b)}) = <b>${f1(hfP)} kJ/mol</b>`]] };
    }
    const [rs, ps] = pick(HFRX), all = rs.concat(ps), pr = ps.reduce((s, [x, n]) => s + n * hfOf(x), 0), re = rs.reduce((s, [x, n]) => s + n * hfOf(x), 0), dh = pr - re;
    const given = all.filter(([x]) => hfOf(x) !== 0).map(([x]) => `${x} = ${hfOf(x)}`).filter((v, i, a) => a.indexOf(v) === i).join(' · ') + ' kJ/mol';
    const zeros = all.filter(([x]) => hfOf(x) === 0).map(([x]) => x);
    return { prompt: `Using standard enthalpies of formation, calculate ΔH for ${rxStr(rs, ps)}. Round to the tenths place.`, given: 'ΔH_f°: ' + given,
      kind: 'num', value: +f1(dh), tol: 0.6, abs: true, unit: 'kJ', display: f1(dh) + ' kJ',
      steps: [[M, '<b>ΔH_rxn = Σ n·ΔH_f(products) − Σ n·ΔH_f(reactants)</b>.'], ...(zeros.length ? [[M, `${[...new Set(zeros)].join(', ')}: element in its standard state → ΔH_f = <b>0</b>.`]] : []),
        [W, `Products: ${sumStr(ps)} = ${f2(pr)} kJ`], [W, `Reactants: ${sumStr(rs)} = ${f2(re)} kJ`], [W, `ΔH = ${f2(pr)} − (${f2(re)}) = <b>${f1(dh)} kJ</b>`]] };
  }
  const FR = { '-1': '−1', '1': '1', '2': '2', '3': '3', '-2': '−2', '-3': '−3', '0.5': '½', '-0.5': '−½' };
  const cf = n => n === 1 ? '' : (Math.abs(n) === 0.5 ? '½' : String(Math.abs(n))) + ' ';
  function g22hess() {
    if (Math.random() < 0.4) {   // one equation: reverse and/or multiply
      const dh = R(-30, 30) * 10 || 40, k = pick([1, 2, 3, 0.5, 10]), rev = Math.random() < 0.6 || k === 1, f = rev ? -k : k;
      const tgt = rev ? `${cf(k)}B (g) → ${cf(k)}A (g)` : `${cf(k)}A (g) → ${cf(k)}B (g)`, v = f * dh;
      return { prompt: `If A (g) → B (g) has ΔH = ${dh} kJ, what is ΔH for ${tgt}?`, kind: 'num', value: v, tol: 0.01, abs: true, unit: 'kJ', display: `${v} kJ`,
        steps: [[M, '<b>Reverse a reaction → flip the sign of ΔH. Multiply a reaction → multiply ΔH by the same number.</b>'], [W, `${rev ? 'Reversed' : 'Same direction'}${k !== 1 ? `, × ${FR[k] || k}` : ''}: ${FR[f] || f} × ${dh} = <b>${v} kJ</b>`]] };
    }
    // two equations X → Y (h1) and Y → Z (h2), combined k1·eq1 + k2·eq2
    const h1 = R(-20, 20) * 10 || -50, h2 = R(-20, 20) * 10 || 30;
    const combos = [[1, 1], [-1, -1], [2, 2], [1, -1], [-1, 1], [3, 3], [2, 1], [1, 2], [0.5, 0.5]];
    const [k1, k2] = pick(combos), net = { A: -k1, B: k1 - k2, C: k2 };
    const left = Object.entries(net).filter(([, n]) => n < 0).map(([s, n]) => cf(-n) + s), right = Object.entries(net).filter(([, n]) => n > 0).map(([s, n]) => cf(n) + s);
    if (!left.length || !right.length) return g22hess();
    const v = k1 * h1 + k2 * h2, desc = (k, n) => `${k < 0 ? 'reverse' : 'keep'} eq. ${n}${Math.abs(k) !== 1 ? ` and × ${FR[Math.abs(k)] || Math.abs(k)}` : ''}`;
    return { prompt: `Given A → B (ΔH = ${h1} kJ) and B → C (ΔH = ${h2} kJ), find ΔH for ${left.join(' + ')} → ${right.join(' + ')}.`,
      kind: 'num', value: v, tol: 0.01, abs: true, unit: 'kJ', display: `${v} kJ`,
      steps: [[M, '<b>Hess\'s law</b>: arrange the given equations so they add up to the target. Reversing flips the sign; multiplying multiplies ΔH.'],
        [W, `Match the target: ${desc(k1, 1)} → ${FR[k1] || k1} × ${h1} = ${k1 * h1} kJ; ${desc(k2, 2)} → ${FR[k2] || k2} × ${h2} = ${k2 * h2} kJ`],
        [W, `Add them (anything on both sides cancels): ${k1 * h1} + (${k2 * h2}) = <b>${v} kJ</b>`]] };
  }

  const TOPICS = [
    { id: 'kmt', hw: 19, label: 'Kinetic molecular theory & gas laws (true/false)', gen: g19kmt },
    { id: 'speed', hw: 19, label: 'Which gas moves fastest?', gen: g19speed },
    { id: 'effuse', hw: 19, label: 'Effusion & diffusion', gen: g19effuse },
    { id: 'avo', hw: 19, label: 'Avogadro: equal moles, equal volumes', gen: g19avo },
    { id: 'temp', hw: 19, label: 'Temperature conversions (°F, °C, K)', gen: g19temp },
    { id: 'units', hw: 19, label: 'Pressure & volume units', gen: g19units },
    { id: 'boyle', hw: 19, label: 'Boyle\'s law (P₁V₁ = P₂V₂)', gen: g19boyle },
    { id: 'charles', hw: 19, label: 'Charles\'s law (V₁/T₁ = V₂/T₂)', gen: g19charles },
    { id: 'combined', hw: 19, label: 'Combined gas law (P, V or T)', gen: g19combined },
    { id: 'ideal', hw: 20, label: 'Ideal gas law (PV = nRT)', gen: g20ideal },
    { id: 'stp', hw: 20, label: 'STP & 22.4 L/mol', gen: g20stp },
    { id: 'molar', hw: 20, label: 'Molar mass & density of a gas', gen: g20molar },
    { id: 'gstoich', hw: 20, label: 'Gas stoichiometry (grams → L or atm)', gen: g20stoich },
    { id: 'gvol', hw: 20, label: 'Volume ratios (all gases)', gen: g20vol },
    { id: 'dalton', hw: 21, label: 'Dalton\'s law: total & partial pressure', gen: g21dalton },
    { id: 'frac', hw: 21, label: 'Mole fraction & mixing gases', gen: g21frac },
    { id: 'energy', hw: 21, label: 'Energy & specific heat concepts', gen: g21concept },
    { id: 'q', hw: 21, label: 'q = mcΔT (q, m, c or T_final)', gen: g21q },
    { id: 'cal', hw: 21, label: 'Calorimetry: metal in water', gen: g21cal },
    { id: 'sign', hw: 22, label: 'Exo vs endo, sign of ΔH', gen: g22sign },
    { id: 'permol', hw: 22, label: 'ΔH from grams and heat', gen: g22perMol },
    { id: 'hstoich', hw: 22, label: 'Enthalpy stoichiometry (kJ ↔ g)', gen: g22stoich },
    { id: 'zero', hw: 22, label: 'Which ΔH_f° is zero?', gen: g22zero },
    { id: 'form', hw: 22, label: 'Formation reactions', gen: g22form },
    { id: 'hf', hw: 22, label: 'ΔH_rxn from heats of formation', gen: g22hf },
    { id: 'hess', hw: 22, label: 'Hess\'s law', gen: g22hess },
  ];
  function make(topicId) { const t = TOPICS.find(x => x.id === topicId); const q = t.gen(); q.topic = t.id; q.key = t.id + '|' + q.prompt + '|' + q.display; return q; }

  function check(q, input) {
    const raw = String(input == null ? '' : input).trim().replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, c => '0123456789-'['⁰¹²³⁴⁵⁶⁷⁸⁹⁻'.indexOf(c)]);
    if (q.kind === 'mc') return { ok: +input === q.correct };
    if (!raw) return { ok: false, msg: 'No answer typed.' };
    const m = raw.replace(/[−–]/g, '-').replace(/,/g, '').match(/^[-+]?(\d+\.?\d*|\.\d+)(\s*(e|x\s*10\^?|×\s*10\^?)\s*([-+]?\d+))?/i);
    if (!m) return { ok: false, msg: 'Type a number.' };
    const v = (raw.replace(/[−–]/g, '-').trim()[0] === '-' ? -1 : 1) * parseFloat(m[1]) * (m[4] ? 10 ** +m[4] : 1);
    const ok = q.abs ? Math.abs(v - q.value) <= q.tol : Math.abs(v - q.value) <= q.tol * Math.abs(q.value);
    return { ok };
  }

  root.Drill4 = { TOPICS, make, check, sig };
})(typeof window !== 'undefined' ? window : globalThis);
