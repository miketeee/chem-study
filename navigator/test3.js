/* Chem Navigator — Test 3 (HW 13–18). Conversions are shown as factor-label chains (how Dr. Bragg teaches). Loaded before the main Navigator script; it adds Test 3 groups, flowchart nodes
   and "Check my work" tools. The chemistry comes from ../drill3/engine.js (Drill3), the same engine as the Test 3 Drill,
   so the Navigator and the Drill always agree. */
(function () {
  var D = window.Drill3;
  var MEM = function (s) { return '<span class="tg tg-m">🧠 Memorize</span> ' + s; };
  var CH = function (s) { return '<span class="tg tg-c">📊 Chart</span> ' + s; };
  var BO = function (s) { return '<span class="tg tg-b">🧠📊 Both</span> ' + s; };
  var WK = function (s) { return '<span class="tg tg-w">Work</span> ' + s; };

  var groups = [
    { test: 'T3', name: 'Formulas & percent composition', tag: 'f13', ids: ['t3_empid', 't3_pct', 't3_molform', 't3_empf', 't3_atoms'] },
    { test: 'T3', name: 'Solutions, molarity & dilution', tag: 's14', ids: ['t3_solnwords', 't3_molarity', 't3_dilution'] },
    { test: 'T3', name: 'Reactions & balancing', tag: 'r15', ids: ['t3_diatomic', 't3_rxntype', 't3_balance', 't3_predict', 't3_names', 't3_conserve'] },
    { test: 'T3', name: 'Solubility, ionic equations & redox', tag: 'i16', ids: ['t3_solub', 't3_goes', 't3_ionic', 't3_ox', 't3_redox', 't3_activity'] },
    { test: 'T3', name: 'Stoichiometry & percent yield', tag: 'y17', ids: ['t3_mm', 't3_ratio', 't3_gg', 't3_yield', 't3_titr'] },
    { test: 'T3', name: 'Limiting & excess reactant', tag: 'l18', ids: ['t3_solnst', 't3_lr', 't3_excess'] }
  ];

  var nodes = {
    /* ---------- HW 13 ---------- */
    t3_empid: { title: 'Is it an empirical or a molecular formula?', hint: 'C₆H₁₂O₄ vs C₃H₆O₂', walk: 'hw13-q01',
      steps: [MEM('<b>Empirical</b> = the smallest whole-number ratio ("easiest on the eyes"). <b>Molecular</b> = a multiple of it.'),
        MEM('Look for one number (2, 3, 5…) that divides <b>every</b> subscript. Found one → molecular. None → empirical.'),
        MEM('Any subscript of <b>1</b> (written or understood) → it can\'t be reduced → <b>empirical</b>.'),
        WK('Multi-selects list several; check each one on its own.')],
      watch: ['A formula with no 1 can still be empirical: Al₂O₃ (2 and 3 share nothing).'], tool: 't3empid', preset: { f: 'C6H12O4' } },
    t3_pct: { title: 'Percent composition (% of one element)', hint: '% H in C₂H₈O', walk: 'hw13-q09',
      steps: [MEM('<b>% = (mass of ALL of that element ÷ molar mass) × 100</b>. Part over whole, like any percent.'),
        BO('Top: atomic mass from the periodic table <b>× its subscript</b> (all the H, not one H).'),
        CH('Bottom: the whole molar mass, every element × its subscript, added up. Use 2 decimal places.'),
        WK('Divide, × 100, then round the way the problem says (2 decimals, or the ones place).')],
      watch: ['The most common slip is forgetting the subscript on top (C₂H₈O: 8 × 1.01, not 1.01).', 'If the problem gives molar masses, use those, not the chart.'],
      tool: 't3pct', preset: { f: 'C2H8O' } },
    t3_molform: { title: 'Molecular formula from empirical formula + molar mass', hint: 'SO₂ and 256 g/mol → S₄O₈', walk: 'hw13-q06',
      steps: [CH('Add up the <b>empirical mass</b> from the periodic table.'),
        MEM('<b>Factor = molar mass ÷ empirical mass</b>. It should come out (very close to) a whole number.'),
        MEM('<b>Multiply every subscript</b> by the factor.'),
        WK('Check: add up your new formula; it should match the molar mass in the problem.')],
      watch: ['eLearn can\'t take subscripts: type S4O8.'], tool: 't3molform', preset: { f: 'SO2', mm: '256' } },
    t3_empf: { title: 'Empirical formula from percents or grams', hint: '82.66 % C, rest H → C₂H₅', q: 'What does the problem give you?', opts: ['t3_empf_pct', 't3_empf_g'] },
    t3_empf_pct: { title: 'Percent of each element', walk: 'hw13-q16',
      steps: [MEM('<b>Assume 100 g</b>, so every percent becomes grams (53.3 % → 53.3 g).'),
        WK('A missing element ("no other element except oxygen") = 100 − the others.'),
        CH('Grams → <b>moles</b> by factor label, for every element: ' + D.fl(['53.3', 'g C'], [[['1', 'mol C'], ['12.01', 'g C']]], ['4.438', 'mol C'], false) + '. The atomic mass goes with grams. Never use diatomic masses (O, not O₂).'),
        MEM('<b>Divide every mole value by the smallest one.</b> This is the most-missed step.'),
        MEM('Within <b>0.1</b> of a whole number → round. Ends in <b>.5 → × 2</b>; <b>.33 / .67 → × 3</b>; <b>.25 / .75 → × 4</b>. Multiply every element.'),
        MEM('Write C, then H, then the rest. H never goes first unless it\'s an acid.')],
      watch: ['In lab you just round (lab data is messy). On the homework and tests, use the × 2 / × 3 fix.', 'Don\'t round 2.5 to 2 or 3. That\'s the case that needs × 2.'],
      tool: 't3empf', preset: { mode: 'pct', e1: 'C', a1: '53.3', e2: 'H', a2: '11.2', e3: 'O', a3: '' } },
    t3_empf_g: { title: 'Grams of each element (or a sample mass)', walk: 'hw13-q13',
      steps: [WK('Missing element by subtraction: sample mass − the known element.'),
        CH('Grams → <b>moles</b> by factor label for each element: ' + D.fl(['5.89', 'g Co'], [[['1', 'mol Co'], ['58.93', 'g Co']]], ['0.100', 'mol Co'], false) + '.'),
        MEM('<b>Divide by the smallest</b>, then fix any .5 / .33 / .25 with × 2 / × 3 / × 4.'),
        WK('Write the formula from the whole numbers.')],
      watch: ['HW 13 #13: Co 0.100 mol, O 0.150 mol → 1 : 1.5 → × 2 → Co₂O₃.'],
      tool: 't3empf', preset: { mode: 'g', total: '8.29', e1: 'Co', a1: '5.89', e2: 'O', a2: '', e3: '', a3: '' } },
    t3_atoms: { title: 'Which sample has the most atoms of an element?', hint: 'moles × subscript', walk: 'hw13-q02',
      steps: [MEM('Use the <b>subscript</b> as a factor label: ' + D.fl(['0.450', 'mol Al₂(CO₃)₃'], [[['3', 'mol C'], ['1', 'mol Al₂(CO₃)₃']]], ['1.35', 'mol C'], false) + '.'),
        MEM('A subscript outside parentheses multiplies everything inside: Al₂(CO₃)₃ has 3 C.'),
        WK('Compare the results; the largest wins.'),
        MEM('1 mol of anything = 6.022 × 10²³ of it; 1 mol Cl₂ = 2 mol Cl atoms.')] },

    /* ---------- HW 14 ---------- */
    t3_solnwords: { title: 'Solution words (solute, solvent, saturated, dilute)', hint: 'concepts, no math', walk: 'hw14-q02',
      steps: [MEM('<b>Solute</b> = the smaller amount, what dissolves. <b>Solvent</b> = the larger amount, what dissolves it (usually water). <b>Solution</b> = the even (homogeneous) mix.'),
        MEM('Mass is conserved: solution mass = solute + solvent (1 g + 20 g = 21 g).'),
        MEM('<b>Unsaturated</b> = more can dissolve. <b>Saturated</b> = at the limit, solid on the bottom. <b>Supersaturated</b> = heated, loaded, cooled; holds more than it should.'),
        MEM('<b>Dilute</b> = add solvent: lighter color, lower molarity. <b>Concentrate</b> = boil off solvent: solute stays the same.'),
        MEM('Molarity is written <b>M</b>, "molar", <b>mol/L</b> or [ ]. Molality is a different unit.')],
      watch: ['A volumetric flask is filled to the graduation line, not the very top.'] },
    t3_molarity: { title: 'Molarity problems: find M, moles, grams or volume', hint: 'M = mol ÷ L', q: 'What does the question ask you to find?', opts: ['t3_mol_M', 't3_mol_n', 't3_mol_g', 't3_mol_V'] },
    t3_mol_M: { title: 'Find the molarity (M)', walk: 'hw14-q12',
      steps: [MEM('Finding the molarity itself: get <b>mol</b> and <b>L</b>, then <b>M = mol ÷ L</b>.'),
        MEM('Volume to liters by factor label: ' + D.fl(['123.0', 'mL'], [[['1', 'L'], ['1000', 'mL']]], ['0.1230', 'L'], false) + '.'),
        CH('Given grams? Grams → moles first: ' + D.fl(['4.90', 'g Ca(NO₂)₂'], [[['1', 'mol Ca(NO₂)₂'], ['132.10', 'g Ca(NO₂)₂']]], ['0.03709', 'mol'], false) + '.'),
        MEM('Sig figs: the least precise number given.')],
      watch: ['HW 14 #8–9: 997.7 mL is 0.9977 L. Using mL gives an answer 1000× too small.'],
      tool: 't3molarity', preset: { find: 'M', g: '4.90', mm: '132.10', vol: '123.0', vu: 'mL' } },
    t3_mol_n: { title: 'Find the moles', walk: 'hw14-q13',
      steps: [MEM('Rewrite molarity as two units: <b>0.139 M = (0.139 mol / 1 L)</b>.'), MEM('<b>Start with the one-unit number</b> (the volume), never the molarity.'),
        WK(D.fl(['115.0', 'mL'], [[['1', 'L'], ['1000', 'mL']], [['0.139', 'mol KCl'], ['1', 'L']]], ['0.0160', 'mol KCl'], false))],
      tool: 't3molarity', preset: { find: 'mol', M: '0.139', vol: '115.0', vu: 'mL' } },
    t3_mol_g: { title: 'Find the grams needed', walk: 'hw14-q15',
      steps: [MEM('<b>Start with the volume</b> (one unit) and chain mL → L → mol → g.'), CH('Molar mass as a fraction: <b>(241.86 g / 1 mol)</b>; the number goes with grams.'),
        WK(D.fl(['150.0', 'mL'], [[['1', 'L'], ['1000', 'mL']], [['0.132', 'mol Fe(NO₃)₃'], ['1', 'L']], [['241.86', 'g Fe(NO₃)₃'], ['1', 'mol Fe(NO₃)₃']]], ['4.79', 'g Fe(NO₃)₃'], false))],
      watch: ['HW 14 #16: 0.41 M has only 2 sig figs → 29.9 g becomes 30 g.'],
      tool: 't3molarity', preset: { find: 'g', M: '0.132', vol: '150.0', vu: 'mL', mm: '241.86' } },
    t3_mol_V: { title: 'Find the volume (L or mL)', walk: 'hw14-q20',
      steps: [MEM('<b>Start with what you have</b> (grams or moles) and head to moles first.'), MEM('Flip the molarity so mol cancels: <b>(1 L / 0.911 mol)</b>. Asked for mL? Add <b>(1000 mL / 1 L)</b>.'),
        WK(D.fl(['3.41', 'g LiNO₃'], [[['1', 'mol LiNO₃'], ['68.95', 'g LiNO₃']], [['1', 'L'], ['0.911', 'mol LiNO₃']], [['1000', 'mL'], ['1', 'L']]], ['54.3', 'mL'], false))],
      watch: ['Read the unit the question wants: HW 14 #18–19 want L, #20–21 want mL.'],
      tool: 't3molarity', preset: { find: 'mL', M: '0.911', g: '3.41', mm: '68.95' } },
    t3_dilution: { title: 'Dilution (M₁V₁ = M₂V₂)', hint: '20.0 mL of 1.69 M diluted to 175.0 mL', walk: 'hw14-q25',
      steps: [MEM('<b>M₁V₁ = M₂V₂</b> (you may see CV = CV). Concentrated on one side, dilute on the other.'),
        WK('Numbers joined by "<b>of</b>" go on the same side: "20.0 mL <i>of</i> 1.69 M" → M₁ = 1.69, V₁ = 20.0.'),
        MEM('Both volumes in the <b>same unit</b> (both mL or both L). There are always exactly three numbers given.'),
        WK('Divide to get the unknown alone, then round to the right sig figs.')],
      watch: ['HW 14 #27: 0.31 M has TWO sig figs → 3.937 mL is reported as 3.9 mL.'],
      tool: 't3dilution', preset: { M1: '1.69', V1: '20.0', M2: '', V2: '175.0' } },

    /* ---------- HW 15 ---------- */
    t3_diatomic: { title: 'Diatomic elements: N or N₂?', hint: 'HOFBrINCl', walk: 'hw15-q02',
      steps: [MEM('Seven elements always come in pairs: <b>H₂, N₂, O₂, F₂, Cl₂, Br₂, I₂</b> ("HOFBrINCl": the 7 shape on the table plus H).'),
        MEM('The word "hydrogen", "oxygen", etc. in a problem always means the pair (H₂, O₂).'),
        MEM('Everything else is a single symbol: Na, K, Mg, C, Ne, Fe…'),
        MEM('Phases at room temperature: Hg and Br₂ are the liquids; H₂, N₂, O₂, F₂, Cl₂ and the noble gases are gases; the rest are solids.')],
      watch: ['Don\'t use diatomic masses for percent composition or empirical formulas.'] },
    t3_rxntype: { title: 'What type of reaction is it?', hint: 'synthesis, decomposition, single, double, combustion', walk: 'hw15-q31',
      steps: [MEM('Look for <b>combustion</b> first: fuel + O₂ → <b>CO₂ + H₂O</b>.'),
        MEM('Only <b>one product</b> → <b>synthesis</b>. Only <b>one reactant</b> → <b>decomposition</b>.'),
        MEM('An element <b>by itself</b> on each side swapping into a compound → <b>single replacement</b>.'),
        MEM('Two compounds <b>swapping partners</b> → <b>double replacement</b>. If it makes a solid (s) it is also <b>precipitation</b>.')],
      tool: 't3rxntype', preset: { eq: 'Mg + 2 NaNO3 -> Mg(NO3)2 + Na' } },
    t3_balance: { title: 'Balance an equation', hint: 'coefficients only', q: 'What kind of equation is it?', opts: ['t3_bal_comb', 't3_bal_poly', 't3_bal_gen'] },
    t3_bal_comb: { title: 'Combustion (CₓHᵧ + O₂ → CO₂ + H₂O)', walk: 'hw15-q22',
      steps: [WK('C first → coefficient on CO₂. Then H → coefficient on H₂O (H ÷ 2).'),
        WK('O last: add up all the O on the right; ÷ 2 gives the O₂ coefficient. If the fuel has O, subtract it first.'),
        MEM('Got a fraction (or an odd O total)? <b>Double everything</b>. Only leave the fraction if the problem asks for it.'),
        MEM('Keep the product order the problem uses (eLearn sometimes writes H₂O before CO₂).')],
      watch: ['eLearn wants a 1 typed in every empty blank; the paper report doesn\'t.'], tool: 't3balance', preset: { eq: 'C2H6 + O2 -> H2O + CO2' } },
    t3_bal_poly: { title: 'Has a polyatomic ion on both sides', walk: 'hw15-q16',
      steps: [MEM('Count <b>NO₃, SO₄, PO₄, OH…</b> as one group if it shows up on both sides.'),
        MEM('Balance the metals and groups first, then H, then O last.'),
        WK('Water can be thought of as H–OH to balance with OH⁻ groups.'),
        WK('Recount every atom at the end; a coefficient multiplies the whole formula.')],
      tool: 't3balance', preset: { eq: 'Al2O3 + H2SO4 -> Al2(SO4)3 + H2O' } },
    t3_bal_gen: { title: 'Anything else', walk: 'hw15-q23',
      steps: [WK('Make a quick count of each atom on both sides.'),
        MEM('Order: everything except H and O, then H, then O. Leave lone elements (Na, C, Fe) for last since they\'re easy to fix.'),
        MEM('A <b>2 and a 3</b>? Swap them as coefficients (O₂ → Al₂O₃: 3 and 2).'),
        MEM('Never change a subscript: that makes a different substance.'),
        WK('Going back and forth? Erase it and restart from a different element.')],
      tool: 't3balance', preset: { eq: 'C + SO2 -> CS2 + CO' } },
    t3_predict: { title: 'Predict the products', hint: 'swap partners', q: 'What do the reactants look like?', opts: ['t3_pred_comb', 't3_pred_sr', 't3_pred_dr'] },
    t3_pred_comb: { title: 'Fuel (C, H, maybe O) + O₂', walk: 'hw15-q29',
      steps: [MEM('That is <b>combustion</b>. The products are <b>always CO₂ + H₂O</b>.'), WK('Then balance if asked (C, H, O last).')] },
    t3_pred_sr: { title: 'A lone element + a compound', walk: 'hw15-q30',
      steps: [MEM('<b>Single replacement</b>: the lone metal takes the place of the compound\'s metal (a halogen replaces a halogen).'),
        BO('Build the new compound from charges: column charge for the metal, ion chart for the polyatomic.'),
        WK('The replaced element is left alone (diatomic if it\'s H, a halogen, etc.).')],
      watch: ['NaClO₃ + Mg → Mg(ClO₃)₂ + Na: Mg²⁺ needs two ClO₃⁻.'], tool: 't3activity', preset: { m: 'Mg', i: 'Cu' } },
    t3_pred_dr: { title: 'Two ionic compounds', walk: 'hw15-q27',
      steps: [MEM('<b>Double replacement</b>: keep the positives in place and <b>swap the negatives</b>.'),
        CH('Charges: column charges and the <b>polyatomic ion chart</b>; a transition metal\'s charge comes from what it\'s holding (Ni(NO₃)₃ → Ni³⁺).'),
        MEM('<b>Rebuild each formula from the charges</b> (criss-cross). Never carry the old subscripts over.'),
        WK('Balance with coefficients, then (HW 16) use the solubility chart for the phases.')],
      watch: ['HW 15 #28: Ni(NO₃)₃ + KBr → KNO₃ + NiBr₃ (not K(NO₃)₃ + NiBr).'], tool: 't3ions', preset: { c1: 'NH4', a1: 'CO3', c2: 'Al', a2: 'NO3' } },
    t3_names: { title: 'Names → balanced equation', hint: 'copper(II) chlorite + lithium sulfide', walk: 'hw15-q03',
      steps: [CH('Polyatomic names from the <b>ion chart</b>: chlorite ClO₂⁻, chlorate ClO₃⁻, sulfite SO₃²⁻, sulfate SO₄²⁻, nitrate NO₃⁻…'),
        MEM('"<b>-ide</b>" = a single element ion (sulfide S²⁻, chloride Cl⁻).'),
        BO('Charges by column: +1, +2, Al +3 … −3, −2, −1. A Roman numeral gives the metal\'s charge.'),
        MEM('Criss-cross to make each formula neutral, then balance with coefficients.')] },
    t3_conserve: { title: 'True/false on conservation, moles and subscripts', hint: 'law of conservation of mass', walk: 'hw15-q12',
      steps: [MEM('<b>Mass</b> and the <b>number of each type of atom</b> are the same before and after. The number of <b>molecules can change</b>.'),
        MEM('Balance with coefficients only; different subscripts = a different substance (H₂O vs H₂O₂).'),
        MEM('1 mol = 6.022 × 10²³ particles. 1 mol NaCl has 1 mol Na; 1 mol Cl₂ has <b>2 mol Cl</b>.')] },

    /* ---------- HW 16 ---------- */
    t3_solub: { title: 'Soluble or insoluble?', hint: 'solubility chart', walk: 'hw16-q07',
      steps: [MEM('Start at the <b>top of the chart with the positive ion</b>: Group 1 (Li, Na, K…) or NH₄⁺ → <b>soluble</b>. Stop.'),
        CH('Otherwise go to the <b>negative ion</b> and apply the <b>first rule</b> that matches, checking its exceptions.'),
        CH('Soluble side: NO₃⁻ and C₂H₃O₂⁻ always; Cl⁻, Br⁻, I⁻ except Ag⁺, Pb²⁺, Hg₂²⁺; SO₄²⁻ except Ba²⁺, Sr²⁺, Ca²⁺, Pb²⁺, Ag⁺, Hg₂²⁺.'),
        CH('Insoluble side (with soluble exceptions): OH⁻ (Ba²⁺ is an exception), CO₃²⁻, PO₄³⁻, S²⁻, CrO₄²⁻.'),
        MEM('<b>Soluble = (aq)</b>, dissolves, dissociates into ions. <b>Insoluble = (s)</b>, a precipitate.')],
      watch: ['The left side of the chart is "soluble except…"; the right side is "insoluble except…". Don\'t mix them up.', 'Insoluble starts with "in" but the S for solid goes with it.'],
      tool: 't3solub', preset: { c: 'Ag', a: 'SO4' } },
    t3_goes: { title: 'Will the reaction happen?', hint: 'look at product phases', walk: 'hw16-q08',
      steps: [MEM('Look only at the <b>product phases</b>.'),
        MEM('A <b>solid (s)</b>, a <b>gas (g)</b> or <b>liquid water (l)</b> → it goes.'),
        MEM('Every product <b>(aq)</b> → <b>no reaction</b>.'),
        CH('No phases given? Use the solubility chart on each product.')],
      tool: 't3ions', preset: { c1: 'Na', a1: 'Cl', c2: 'K', a2: 'I' } },
    t3_ionic: { title: 'Full ionic, net ionic and spectator ions', hint: 'cancel what\'s on both sides', q: 'Which one does the question want?', opts: ['t3_ion_full', 't3_ion_net', 't3_ion_spec'] },
    t3_ion_full: { title: 'The full (complete) ionic equation', walk: 'hw16-q10',
      steps: [MEM('Split every <b>(aq)</b> compound into ions; keep <b>(s)</b>, <b>(l)</b> and <b>(g)</b> together.'),
        MEM('Coefficients and subscripts multiply the ions: 2 AgNO₃ → 2 Ag⁺ + 2 NO₃⁻; CaCl₂ → Ca²⁺ + 2 Cl⁻ (never Cl₂⁻).'),
        CH('Polyatomic ions (ion chart) stay in one piece.'),
        WK('Check: the left and right sides must match ion for ion.')],
      watch: ['The full ionic still has the spectators in it. The short one is the net.'], tool: 't3ions', preset: { c1: 'Pb', a1: 'NO3', c2: 'K', a2: 'I' } },
    t3_ion_net: { title: 'The net ionic equation', walk: 'hw16-q11',
      steps: [WK('Write the full ionic first.'), MEM('Cancel the <b>spectators</b>: ions that are identical on both sides.'),
        MEM('What\'s left is the <b>net</b>: the ions that make the solid (or gas or water). It\'s the shortest choice.'),
        WK('If every coefficient shares a factor, reduce it (2 Ag⁺ + 2 Cl⁻ → 2 AgCl becomes Ag⁺ + Cl⁻ → AgCl).'),
        MEM('Everything (aq) → no net reaction.')],
      tool: 't3ions', preset: { c1: 'NH4', a1: 'I', c2: 'Ag', a2: 'NO3' } },
    t3_ion_spec: { title: 'The spectator ions', walk: 'hw16-q09',
      steps: [WK('Write the full ionic equation.'), MEM('<b>Spectators</b> = the ions that appear unchanged on both sides; they\'re just "watching".'),
        MEM('They\'re never part of the solid.')],
      tool: 't3ions', preset: { c1: 'Na', a1: 'OH', c2: 'Ni', a2: 'C2H3O2' } },
    t3_ox: { title: 'Oxidation numbers', hint: 'N in NCl₃ = +3', q: 'What are you finding the oxidation number of?', opts: ['t3_ox_el', 't3_ox_ionic', 't3_ox_cov'] },
    t3_ox_el: { title: 'A lone element or a single ion', walk: 'hw16-q17',
      steps: [MEM('A <b>neutral element</b> by itself is <b>0</b>, even diatomic ones (O₂, F₂, Na(s), C graphite).'),
        MEM('A <b>monatomic ion</b>\'s oxidation number is its <b>charge</b> (K⁺ +1, Cl⁻ −1, Al³⁺ +3).')], tool: 't3ox', preset: { f: 'Al3+' } },
    t3_ox_ionic: { title: 'An element in an ionic compound (metal + nonmetal)', walk: 'hw16-q16',
      steps: [MEM('All the oxidation numbers <b>add up to the overall charge</b> (0 for a neutral compound).'),
        BO('Give the metal its usual column charge (Na +1, Mg +2, Al +3) and O −2.'),
        WK('Solve for the one that\'s left: Na₂C₂O₄ → 2(+1) + 2C + 4(−2) = 0 → C = +3.')], tool: 't3ox', preset: { f: 'Na2C2O4' } },
    t3_ox_cov: { title: 'An element in a covalent molecule or polyatomic ion', walk: 'hw16-q14',
      steps: [MEM('Total = the overall charge (0, or the ion\'s charge like −1 for BrO₃⁻).'),
        MEM('<b>H first</b>: H = +1, except next to a Group 1 or 2 metal, where H = −1 (CaH₂).'),
        BO('Then the <b>more electronegative</b> element (closer to F, top right) gets its usual charge (O −2, Cl −1…).'),
        WK('The other element "adapts": solve so the total comes out. It can look strange (N in NCl₃ = +3, O in OF₂ = +2).')],
      watch: ['These are not real charges; they track where electrons would go.', 'ClBr: Cl is more electronegative → Cl −1, Br +1.'], tool: 't3ox', preset: { f: 'BrO3-' } },
    t3_redox: { title: 'Oxidation or reduction? Oxidizing or reducing agent?', hint: 'OIL RIG', walk: 'hw16-q19',
      steps: [MEM('<b>OIL RIG</b>: Oxidation Is Loss, Reduction Is Gain (of electrons).'),
        MEM('Electrons on the <b>right</b> of the arrow = lost = <b>oxidation</b>; charge goes <b>up</b> (Zn⁰ → Zn²⁺).'),
        MEM('Electrons on the <b>left</b> = gained = <b>reduction</b>; charge goes <b>down</b> (O₂ → O²⁻).'),
        MEM('The species <b>reduced</b> is the <b>oxidizing agent</b>; the species <b>oxidized</b> is the <b>reducing agent</b>.')],
      watch: ['HW 16 #21 lists N⁻³ → N⁻¹ with the reductions, but the charge goes up, so it is really an oxidation.'], tool: 't3redox', preset: { eq: 'Cu2+ + 2e- -> Cu' } },
    t3_activity: { title: 'Will a metal replace an ion? (activity series)', hint: 'Zn + Cu²⁺', walk: 'hw16-q20',
      steps: [CH('Find both on the <b>activity series</b>: Li > K > Ba > Ca > Na > Mg > Al > Zn > Cr > Fe > Cd > Co > Ni > Sn > Pb > H > Cu > Ag > Hg > Pt > Au.'),
        MEM('Compare the <b>neutral</b> reactant with the <b>charged</b> one. The neutral one is <b>higher</b> → it goes.'),
        MEM('Neutral one lower → no reaction.')],
      tool: 't3activity', preset: { m: 'Zn', i: 'Cu' } },

    /* ---------- HW 17 ---------- */
    t3_mm: { title: 'Molar mass of a compound', hint: 'Na₂CO₃ = 105.99 g/mol', walk: 'hw17-q10',
      steps: [CH('Atomic masses from the <b>periodic chart</b>.'), BO('Each one × its subscript; a subscript outside parentheses multiplies everything inside.'),
        MEM('Put it all in the calculator at once; <b>don\'t round early</b>. Report 2 decimal places.')],
      watch: ['Save the HW 17 molar masses: the later problems reuse them.'], tool: 't3pct', preset: { f: 'Na2CO3' } },
    t3_ratio: { title: 'Mole to mole (coefficient ratios)', hint: '2.0 mol O₂ → ? mol NO', walk: 'hw17-q04',
      steps: [MEM('The <b>coefficients</b> are the mole ratio. No coefficient showing = an understood <b>1</b>.'),
        MEM('<b>Start with the moles you\'re given</b>, labeled with the substance (mol O₂, not just mol).'),
        MEM('Ratio = (coefficient of what you <b>want</b> / coefficient of what you <b>have</b>). What you have goes on the bottom so it cancels.'),
        WK(D.fl(['2.0', 'mol O₂'], [[['4', 'mol NO'], ['5', 'mol O₂']]], ['1.6', 'mol NO'], false)),
        MEM('Mole ratios are <b>exact</b>; they never limit sig figs.')],
      watch: ['Not balanced yet (HW 17 #7–9)? Balance it first, then use the coefficients.'], tool: 't3stoich', preset: { eq: '4 NH3 + 5 O2 -> 4 NO + 6 H2O', amt: '2.0', gu: 'mol', A: 'O2', B: 'NO', fu: 'mol' } },
    t3_gg: { title: 'Grams of one substance → grams of another', hint: 'stoichiometry, theoretical yield', walk: 'hw17-q15',
      steps: [MEM('<b>Start with the given grams</b> (one unit), labeled with the substance.'),
        CH('Grams → moles: <b>(1 mol / molar-mass g)</b>; the number goes with grams.'),
        MEM('Moles → moles of the <b>other</b> substance with the coefficients. This is the only step that switches substances.'),
        CH('Moles → grams with the new substance\'s molar mass: <b>(molar-mass g / 1 mol)</b>.'),
        WK(D.fl(['24.43', 'g Na₂CO₃'], [[['1', 'mol Na₂CO₃'], ['105.99', 'g Na₂CO₃']], [['2', 'mol NaCl'], ['1', 'mol Na₂CO₃']], [['58.44', 'g NaCl'], ['1', 'mol NaCl']]], ['26.94', 'g NaCl'], false)),
        MEM('Grams of a <b>product</b> = the <b>theoretical yield</b>. Sig figs: usually the starting number.')],
      watch: ['Always head toward moles first; you can\'t switch substances in grams.', 'If the problem gives a molar mass, use its number (Ca(NO₃)₂ = 164.09 in HW 17).'],
      tool: 't3stoich', preset: { eq: 'Na2CO3 + 2 HCl -> 2 NaCl + CO2 + H2O', amt: '24.43', gu: 'g', A: 'Na2CO3', B: 'NaCl', fu: 'g' } },
    t3_yield: { title: 'Percent yield', hint: 'actual ÷ theoretical × 100', q: 'What does the problem give you?', opts: ['t3_y_both', 't3_y_pct', 't3_y_full'] },
    t3_y_both: { title: 'The actual and the theoretical yield', walk: 'hw17-q20',
      steps: [MEM('<b>% yield = actual ÷ theoretical × 100</b>.'), MEM('<b>Actual</b> = what was weighed in the lab. <b>Theoretical</b> = the math.'),
        MEM('Over 100 % → probably still wet; exactly 100 % is unrealistic.')],
      watch: ['HW 17 #22: 12 g out of 16 g is 75 %. 133 % is the upside-down answer.'], tool: 't3yield', preset: { act: '27.5', th: '34.8' } },
    t3_y_pct: { title: 'The percent yield and the theoretical yield (find the actual)', walk: 'hw17-q23',
      steps: [MEM('Rearrange: <b>actual = theoretical × (% ÷ 100)</b>.'), WK('Use the decimal: 74.3 % → 0.743.'), MEM('Sig figs from the numbers given (74.3 has 3).')],
      tool: 't3yield', preset: { th: '203.13', pct: '74.3' } },
    t3_y_full: { title: 'Grams of a reactant and the grams actually collected', walk: 'hw17-q24',
      steps: [MEM('<b>Theoretical yield first</b>: a grams-to-grams factor-label chain to the product.'),
        MEM('Then <b>% yield = actual ÷ theoretical × 100</b>.')],
      tool: 't3stoich', preset: { eq: '2 CH3OH -> (CH3)2O + H2O', amt: '50', gu: 'g', A: 'CH3OH', B: '(CH3)2O', fu: 'g', mmA: '32.04', mmB: '46.09' } },
    t3_titr: { title: 'Solution stoichiometry and titrations', hint: 'mL + molarity → moles → other substance', 
      steps: [MEM('<b>Start with the volume</b> (one unit), never the molarity (two units).'),
        MEM('Molarity as a fraction: <b>(0.250 mol NaOH / 1 L)</b>. mL → L with (1 L / 1000 mL).'),
        MEM('Switch substances with the <b>coefficients</b>, like any stoichiometry.'),
        WK(D.fl(['35.23', 'mL NaOH'], [[['1', 'L NaOH'], ['1000', 'mL NaOH']], [['0.250', 'mol NaOH'], ['1', 'L NaOH']], [['1', 'mol HCl'], ['1', 'mol NaOH']]], ['0.008808', 'mol HCl'], false)),
        MEM('Asked for the other molarity? <b>M = mol ÷ L</b> of that solution: 0.008808 mol ÷ 0.05000 L = 0.176 M.'),
        MEM('Sig figs here come from the shortest measured number (often the molarity).')],
      watch: ['H₂SO₄ is the classic 1 : 2 acid (H₂SO₄ + 2 NaOH). Check the coefficients before using 1 : 1.'],
      tool: 't3stoich', preset: { eq: 'HCl + NaOH -> NaCl + H2O', amt: '35.23', gu: 'mL', MA: '0.250', A: 'NaOH', B: 'HCl', fu: 'M', VB: '50.00' } },
    /* ---------- HW 18 ---------- */
    t3_solnst: { title: 'Solution stoichiometry (mL + molarity → grams, or grams → molarity)', hint: '45.0 mL of 0.149 M CuBr₂ → ? g AgBr', walk: 'hw18-q04',
      steps: [MEM('<b>Balance first</b>. eLearn often gives it UNBALANCED (HW 18 #4–7).'),
        MEM('<b>Start with the one-unit number</b> (mL, or grams of the solid). Molarity is only a factor: <b>(0.149 mol / 1 L)</b>.'),
        WK(D.fl(['45.0', 'mL CuBr₂'], [[['1', 'L CuBr₂'], ['1000', 'mL CuBr₂']], [['0.149', 'mol CuBr₂'], ['1', 'L CuBr₂']], [['2', 'mol AgBr'], ['1', 'mol CuBr₂']], [['187.77', 'g AgBr'], ['1', 'mol AgBr']]], ['2.52', 'g AgBr'], false)),
        MEM('Asked for a <b>molarity</b>? Chain grams → mol of the solution\'s substance, then <b>M = mol ÷ L</b> (HW 18 #2–3).')],
      watch: ['Forgot to balance CuBr₂ + 2 AgCH₃CO₂? Your answer comes out exactly half.'],
      tool: 't3stoich', preset: { eq: 'CuBr2 + AgCH3CO2 -> AgBr + Cu(CH3CO2)2', amt: '45.0', gu: 'mL', MA: '0.149', A: 'CuBr2', B: 'AgBr', fu: 'g', mmB: '187.77' } },
    t3_lr: { title: 'Limiting reactant (two amounts given)', hint: 'which runs out first?', q: 'What does the problem give you?', opts: ['t3_lr_mol', 't3_lr_g', 't3_lr_pic'] },
    t3_lr_mol: { title: 'Moles of both reactants', walk: 'hw18-q10',
      steps: [MEM('The <b>limiting reactant</b> runs out first, so it makes the <b>least product</b>.'),
        MEM('Chain <b>each reactant</b> to the <b>same product</b> with the coefficients.'),
        WK(D.fl(['0.15', 'mol C₂H₅OH'], [[['2', 'mol CO₂'], ['1', 'mol C₂H₅OH']]], ['0.30', 'mol CO₂'], false) + '<br>' + D.fl(['0.40', 'mol O₂'], [[['2', 'mol CO₂'], ['3', 'mol O₂']]], ['0.27', 'mol CO₂'], false)),
        MEM('<b>Smaller amount wins</b> → O₂ is limiting. That smaller amount is also the theoretical yield (HW 18 #13–14).')],
      watch: ['Fewer moles doesn\'t mean limiting: ethanol needs 3 O₂ each.', 'A product can never be the limiting reactant.'],
      tool: 't3limit', preset: { eq: 'C2H5OH + 3 O2 -> 2 CO2 + 3 H2O', a: '0.15', A: 'C2H5OH', b: '0.40', B: 'O2', u: 'mol', P: 'CO2' } },
    t3_lr_g: { title: 'Grams of both reactants (how much product?)', walk: 'hw18-q15',
      steps: [MEM('Run a <b>grams-to-grams chain from each reactant</b> to grams of the product.'),
        CH('Molar masses from the chart (or given): the number goes with grams, over 1 mol.'),
        MEM('<b>Smaller amount = the answer</b> (the theoretical yield). The bigger number is the trap answer.')],
      watch: ['HW 18 #15: 27.7 g is what H₂ <b>could</b> make; N₂ runs out first, so 7.52 g.'],
      tool: 't3limit', preset: { eq: '3 H2 + N2 -> 2 NH3', a: '4.93', A: 'H2', b: '6.18', B: 'N2', u: 'g', P: 'NH3', mA: '2.02', mB: '28.02', mP: '17.04' } },
    t3_lr_pic: { title: 'A picture of particles in a box', walk: 'hw18-q09',
      steps: [WK('<b>Count</b> each kind of particle in the start box (O₂ counts as one molecule).'),
        MEM('Use the coefficients to see which <b>runs out first</b>: 6 O₂ × (2 S / 3 O₂) = 4 S needed.'),
        WK('Draw the products it makes (4 SO₃) and <b>keep the leftovers</b> of the other reactant (2 S).'),
        MEM('Atoms are conserved: the answer box has the same atoms as the start box.')],
      tool: 't3limit', preset: { eq: '2 S + 3 O2 -> 2 SO3', a: '6', A: 'S', b: '6', B: 'O2', u: 'mol', P: 'SO3' } },
    t3_excess: { title: 'How much excess reactant is left over?', hint: 'started − used', walk: 'hw18-q20',
      steps: [MEM('<b>Left over = started with − used</b>.'),
        MEM('Find "used" with a chain that <b>starts with the limiting reactant</b> (it\'s used up) and ends in grams of the excess one.'),
        WK(D.fl(['3.16', 'g O₂'], [[['1', 'mol O₂'], ['32.00', 'g O₂']], [['2', 'mol H₂'], ['1', 'mol O₂']], [['2.02', 'g H₂'], ['1', 'mol H₂']]], ['0.399', 'g H₂ used'], false)),
        WK('3.16 g − 0.399 g = <b>2.76 g H₂</b> left. eLearn wants the hundredths place.')],
      watch: ['A negative leftover means you started the chain from the excess reactant.'],
      tool: 't3limit', preset: { eq: '2 H2 + O2 -> 2 H2O', a: '3.16', A: 'H2', b: '3.16', B: 'O2', u: 'g', P: 'H2O', mA: '2.02', mB: '32.00' } }
  };

  /* ---------- tools (they use the main Navigator's field/inp/sel/val/wire/box/bad/bigAns/list helpers) ---------- */
  function fmtF(f) { return D.sub(f); }
  function parseOrNull(f) { try { return D.parse(f); } catch (e) { return null; } }
  function num(s) { var v = parseFloat(String(s).replace(/,/g, '')); return isNaN(v) ? null : v; }
  function sg(v) { return (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v); }
  function tagList(steps) { return '<ol class="why t3steps">' + steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }
  function elOpts(v) { return [['', '—']].concat(Object.keys(D.MASS).sort().map(function (e) { return [e, e]; })); }

  function install(TOOLS) {
    TOOLS.t3empid = function (root, p) {
      root.innerHTML = '<div class="grid2">' + field('Formula', inp('f', p.f, 'C6H12O4')) + '</div><div class="out"></div>';
      wire(root, function () {
        var f = val(root, 'f').trim(); if (!f) return ''; var c = parseOrNull(f); if (!c) return bad('I can\'t read that formula. Use symbols and plain numbers (C6H12O4).');
        var els = Object.keys(c), n = els.map(function (e) { return c[e]; }), g = D.gcdAll(n);
        var red = els.map(function (e) { return e + (c[e] / g === 1 ? '' : c[e] / g); }).join('');
        return box(bigAns('Answer', g === 1 ? 'Empirical' : 'Molecular', g === 1 ? 'No number divides all of ' + n.join(', ') + '.' : 'Every subscript divides by ' + g + ' → empirical formula ' + fmtF(red)), g === 1 ? 'res-ok' : '');
      });
    };
    TOOLS.t3pct = function (root, p) {
      root.innerHTML = '<div class="grid2">' + field('Formula', inp('f', p.f, 'C2H8O')) + '</div><p class="hint">Uses the class molar masses (2 decimals). Parentheses work: Ca(NO3)2.</p><div class="out"></div>';
      wire(root, function () {
        var f = val(root, 'f').trim(); if (!f) return ''; var c = parseOrNull(f); if (!c) return bad('I can\'t read that formula.');
        var tot = D.molar(c), rows = Object.keys(c).map(function (e) { var m = c[e] * D.MASS[e]; return '<tr><td>' + e + '</td><td>' + c[e] + ' × ' + D.MASS[e].toFixed(2) + '</td><td>' + m.toFixed(2) + '</td><td><b>' + (100 * m / tot).toFixed(2) + ' %</b></td></tr>'; }).join('');
        return box(bigAns('Molar mass of ' + fmtF(f), tot.toFixed(2) + ' g/mol') + '<table class="t3tab"><tr><th>Element</th><th>count × mass</th><th>g/mol</th><th>% by mass</th></tr>' + rows + '</table><p class="hint">% = (count × atomic mass) ÷ ' + tot.toFixed(2) + ' × 100</p>', 'res-ok');
      });
    };
    TOOLS.t3molform = function (root, p) {
      root.innerHTML = '<div class="grid2">' + field('Empirical formula', inp('f', p.f, 'SO2')) + field('Molar mass (g/mol)', inp('mm', p.mm, '256')) + '</div><div class="out"></div>';
      wire(root, function () {
        var c = parseOrNull(val(root, 'f').trim()), mm = num(val(root, 'mm')); if (!c || !mm) return '';
        var em = D.molar(c), k = mm / em, kr = Math.round(k);
        var mf = Object.keys(c).map(function (e) { return e + (c[e] * kr === 1 ? '' : c[e] * kr); }).join('');
        var steps = [CH('Empirical mass = <b>' + em.toFixed(2) + ' g/mol</b>.'), MEM('Factor = ' + mm + ' ÷ ' + em.toFixed(2) + ' = <b>' + k.toFixed(3) + '</b>' + (Math.abs(k - kr) > 0.1 ? ' (not close to a whole number: check the numbers)' : ' ≈ ' + kr) + '.'), MEM('Multiply every subscript by ' + kr + ' → <b>' + fmtF(mf) + '</b>.')];
        return box(bigAns('Molecular formula', fmtF(mf), 'typed for eLearn: ' + mf) + tagList(steps), 'res-ok');
      });
    };
    TOOLS.t3empf = function (root, p) {
      var row = function (i) { return field('Element ' + i, sel('e' + i, elOpts(), p['e' + i])) + field(i === 1 ? 'Amount' : 'Amount (blank = by subtraction)', inp('a' + i, p['a' + i], p.mode === 'g' ? 'grams' : '%')); };
      root.innerHTML = '<div class="grid2">' + field('The problem gives', sel('mode', [['pct', 'percent of each'], ['g', 'grams, with a sample mass']], p.mode)) + field('Sample mass (g, grams mode)', inp('total', p.total, 'e.g. 8.29')) + '</div><div class="grid2">' + row(1) + row(2) + row(3) + '</div><p class="hint">Leave one amount blank and it is filled by subtraction from 100 % (or from the sample mass).</p><div class="out"></div>';
      wire(root, function () {
        var mode = val(root, 'mode'), total = mode === 'pct' ? 100 : num(val(root, 'total')), els = [], amt = [], blank = -1;
        for (var i = 1; i <= 3; i++) { var e = val(root, 'e' + i); if (!e) continue; var a = num(val(root, 'a' + i)); els.push(e); amt.push(a); if (a === null) { if (blank >= 0) return bad('Leave at most one amount blank.'); blank = amt.length - 1; } }
        if (els.length < 2) return '';
        var steps = [];
        if (mode === 'pct') steps.push(MEM('<b>Assume 100 g</b>: each percent becomes grams.'));
        if (blank >= 0) { if (!total) return bad('Enter the sample mass to fill the blank by subtraction.'); var known = amt.reduce(function (s, x) { return s + (x || 0); }, 0); var dec = Math.max.apply(null, [String(val(root, 'total') || '100')].concat(amt.filter(function (x) { return x !== null; }).map(String)).map(function (t) { return (t.split('.')[1] || '').length; })); amt[blank] = +(total - known).toFixed(dec); amt.disp = (total - known).toFixed(dec); steps.push(WK(els[blank] + ' by subtraction: ' + total + ' − ' + amt.filter(function (x, j) { return j !== blank; }).join(' − ') + ' = <b>' + amt.disp + ' g</b>.')); }
        var mol = els.map(function (e, j) { return amt[j] / D.MASS[e]; }), mn = Math.min.apply(null, mol), ratio = mol.map(function (x) { return x / mn; });
        steps.push(CH('Grams → moles by factor label:<br>' + els.map(function (e, j) { return D.fl([String(j === blank ? amt.disp : amt[j]), 'g ' + e], [[['1', 'mol ' + e], [D.MASS[e].toFixed(2), 'g ' + e]]], [mol[j].toFixed(4), 'mol ' + e]); }).join('<br>')));
        steps.push(MEM('Divide by the smallest: ' + els.map(function (e, j) { return e + ' <b>' + ratio[j].toFixed(2) + '</b>'; }).join(', ') + '.'));
        var mult = null; [1, 2, 3, 4, 5, 6].some(function (m) { if (ratio.every(function (x) { return Math.abs(x * m - Math.round(x * m)) <= 0.1; })) { mult = m; return true; } });
        if (!mult) return box(tagList(steps) + '<p>The ratios don\'t come out to whole numbers even × 6. Check the numbers you entered.</p>');
        var n = ratio.map(function (x) { return Math.round(x * mult); }), f = els.map(function (e, j) { return e + (n[j] === 1 ? '' : n[j]); }).join('');
        steps.push(MEM(mult === 1 ? 'All within 0.1 of whole numbers → round.' : 'Not whole → multiply everything by <b>' + mult + '</b>: ' + els.map(function (e, j) { return e + ' ' + (ratio[j] * mult).toFixed(2); }).join(', ') + '.'));
        return box(bigAns('Empirical formula', fmtF(f), 'typed: ' + f) + tagList(steps), 'res-ok');
      });
    };
    TOOLS.t3molarity = function (root, p) {
      root.innerHTML = '<div class="grid2">' + field('Find', sel('find', [['M', 'molarity (M)'], ['mol', 'moles'], ['g', 'grams'], ['L', 'volume in L'], ['mL', 'volume in mL']], p.find)) + field('Substance (optional)', inp('sub', p.sub, 'e.g. KCl')) + field('Molarity (M)', inp('M', p.M, 'e.g. 0.139')) + field('Volume', inp('vol', p.vol, 'e.g. 115.0')) + field('Volume unit', sel('vu', ['mL', 'L'], p.vu || 'mL')) + field('Moles', inp('n', p.n, 'mol')) + field('Grams', inp('g', p.g, 'g')) + field('Molar mass (g/mol) or formula', inp('mm', p.mm, '58.44 or NaCl')) + '</div><p class="hint">Fill in what the problem gives; leave the rest blank. The steps are written as factor-label chains.</p><div class="out"></div>';
      wire(root, function () {
        var find = val(root, 'find'), Ms = val(root, 'M').trim(), vs = val(root, 'vol').trim(), ns = val(root, 'n').trim(), gs = val(root, 'g').trim(), mms = val(root, 'mm').trim(), vu = val(root, 'vu');
        var M = num(Ms), v = num(vs), n = num(ns), g = num(gs), mm = num(mms), steps = [], used = [];
        var X = val(root, 'sub').trim(); if (!X && mms && mm === null && parseOrNull(mms)) X = mms; X = X ? ' ' + fmtF(X) : '';
        if (mms && mm === null) { var c = parseOrNull(mms); if (c) { mm = D.molar(c); steps.push(CH('Molar mass of ' + fmtF(mms) + ' (periodic chart) = <b>' + mm.toFixed(2) + ' g/mol</b>.')); } }
        else if (mm) steps.push(CH('Molar mass is given: <b>' + mms + ' g/mol</b>.'));
        var mmS = mm ? (num(mms) !== null ? mms : mm.toFixed(2)) : null;
        if (v !== null) used.push(vs); if (M !== null) used.push(Ms); if (g !== null) used.push(gs); if (n !== null) used.push(ns);
        var toL = vu === 'mL' ? [[['1', 'L'], ['1000', 'mL']]] : [], L = v === null ? null : (vu === 'mL' ? v / 1000 : v);
        var molF = M !== null ? [[Ms, 'mol' + X], ['1', 'L']] : null, flip = M !== null ? [['1', 'L'], [Ms, 'mol' + X]] : null;
        var ans, unit;
        if (M !== null && find !== 'M') steps.push(MEM('Rewrite molarity as two units: <b>' + Ms + ' M = (' + Ms + ' mol / 1 L)</b>.'));
        if (find === 'M') {
          if (L === null || (n === null && (g === null || !mm))) return bad('To find M you need moles (or grams + molar mass) and a volume.');
          steps.push(MEM('Finding molarity itself: get <b>mol</b> and <b>L</b>, then <b>M = mol ÷ L</b>.'));
          if (n === null) { n = g / mm; steps.push(MEM('Grams → moles: ' + D.fl([gs, 'g' + X], [[['1', 'mol' + X], [mmS, 'g' + X]]], [n.toPrecision(4), 'mol' + X]))); }
          if (vu === 'mL') steps.push(MEM('Volume to liters: ' + D.fl([vs, 'mL'], toL, [L.toPrecision(4), 'L'])));
          ans = n / L; unit = 'M'; steps.push(WK('M = ' + n.toPrecision(4) + ' mol ÷ ' + L.toPrecision(4) + ' L = <b>' + ans.toPrecision(4) + ' M</b>.'));
        } else if (find === 'mol' || find === 'g') {
          if (M === null || L === null) return bad('You need the molarity and the volume.');
          if (find === 'g' && !mm) return bad('Grams need a molar mass (or formula).');
          ans = M * L * (find === 'g' ? mm : 1); unit = find;
          steps.push(MEM('<b>Start with the one-unit number</b> (the volume) and let the units cancel:'));
          steps.push(WK(D.fl([vs, vu], toL.concat([molF]).concat(find === 'g' ? [[[mmS, 'g' + X], ['1', 'mol' + X]]] : []), [ans.toPrecision(4), (find === 'g' ? 'g' : 'mol') + X])));
        } else {
          if (M === null || (n === null && (g === null || !mm))) return bad('You need the molarity and the moles (or grams + molar mass).');
          var startG = n === null, fs = (startG ? [[['1', 'mol' + X], [mmS, 'g' + X]]] : []).concat([flip]).concat(find === 'mL' ? [[['1000', 'mL'], ['1', 'L']]] : []);
          ans = (startG ? g / mm : n) / M * (find === 'mL' ? 1000 : 1); unit = find;
          steps.push(MEM('<b>Start with what you have</b> (' + (startG ? 'grams' : 'moles') + ') and flip the molarity so mol cancels:'));
          steps.push(WK(D.fl(startG ? [gs, 'g' + X] : [ns, 'mol' + X], fs, [ans.toPrecision(4), find])));
        }
        var sf = Math.min.apply(null, used.map(D.sfOf)); if (!isFinite(sf) || sf < 1) sf = 3;
        steps.push(MEM('Sig figs: the least precise given number has <b>' + sf + '</b>.'));
        return box(bigAns('Answer', D.sig(ans, sf) + ' ' + unit, 'unrounded ' + ans.toPrecision(6)) + tagList(steps), 'res-ok');
      });
    };
    function eqParts(str) {   // "2 H2 + O2 -> 2 H2O" -> {all:[{f,c,k}], nre}
      var parts = String(str).replace(/→|=+>|-+>|⟶/g, '>').split('>'); if (parts.length !== 2) return null;
      var side = function (t) { return t.split('+').map(function (x) { x = x.trim().replace(/\((aq|s|l|g)\)/g, '').trim(); var m = /^(\d+)\s*/.exec(x); return { k: m ? +m[1] : null, f: m ? x.slice(m[0].length).trim() : x }; }).filter(function (x) { return x.f; }); };
      var L = side(parts[0]), R = side(parts[1]), all = L.concat(R);
      for (var i = 0; i < all.length; i++) { all[i].c = parseOrNull(all[i].f); if (!all[i].c) return { error: 'I can\'t read "' + all[i].f + '".' }; }
      return { all: all, nre: L.length };
    }
    function sameC(a, b) { var ka = Object.keys(a), kb = Object.keys(b); return ka.length === kb.length && ka.every(function (k) { return a[k] === b[k]; }); }
    TOOLS.t3stoich = function (root, p) {
      root.innerHTML = field('Balanced equation (coefficients optional; I balance it if they\'re missing)', inp('eq', p.eq, 'Na2CO3 + 2 HCl -> 2 NaCl + CO2 + H2O')) +
        '<div class="grid2">' + field('Given amount', inp('amt', p.amt, 'e.g. 24.43')) + field('Given unit', sel('gu', [['g', 'grams'], ['mol', 'moles'], ['mL', 'mL of solution'], ['L', 'L of solution']], p.gu)) + field('Given substance', inp('A', p.A, 'Na2CO3')) + field('Its molarity (if mL/L)', inp('MA', p.MA, 'M')) +
        field('Find: substance', inp('B', p.B, 'NaCl')) + field('Find: unit', sel('fu', [['g', 'grams'], ['mol', 'moles'], ['mL', 'mL of solution'], ['L', 'L of solution'], ['M', 'molarity']], p.fu)) + field('Its molarity (for mL/L)', inp('MB', p.MB, 'M')) + field('Its volume in mL (for molarity)', inp('VB', p.VB, 'mL')) +
        field('Given molar mass (blank = chart)', inp('mmA', p.mmA, 'g/mol')) + field('Find molar mass (blank = chart)', inp('mmB', p.mmB, 'g/mol')) + '</div><div class="out"></div>';
      wire(root, function () {
        var E = eqParts(val(root, 'eq')); if (!E) return ''; if (E.error) return bad(esc(E.error));
        var ks = E.all.map(function (x) { return x.k; }), co;
        if (ks.every(function (k) { return k === null; })) co = D.balance(E.all.slice(0, E.nre).map(function (x) { return x.f; }), E.all.slice(E.nre).map(function (x) { return x.f; }));
        else co = ks.map(function (k) { return k || 1; });
        if (!co) return bad('That equation can\'t be balanced as written.');
        var Af = val(root, 'A').trim(), Bf = val(root, 'B').trim(), ca = parseOrNull(Af), cb = parseOrNull(Bf); if (!ca || !cb) return '';
        var ia = E.all.findIndex(function (x) { return sameC(x.c, ca); }), ib = E.all.findIndex(function (x) { return sameC(x.c, cb); });
        if (ia < 0 || ib < 0) return bad('Both substances have to appear in the equation.');
        var A = fmtF(Af), Bs = fmtF(Bf), amtS = val(root, 'amt').trim(), amt = num(amtS), gu = val(root, 'gu'), fu = val(root, 'fu');
        if (amt === null) return '';
        var used = [amtS], steps = [], fs = [];
        var mmAS = val(root, 'mmA').trim() || D.molar(ca).toFixed(2), mmBS = val(root, 'mmB').trim() || D.molar(cb).toFixed(2), MAS = val(root, 'MA').trim(), MBS = val(root, 'MB').trim(), VBS = val(root, 'VB').trim();
        var eqTxt = E.all.map(function (x, i) { return (co[i] > 1 ? co[i] + ' ' : '') + fmtF(x.f); }), eqStr = eqTxt.slice(0, E.nre).join(' + ') + ' → ' + eqTxt.slice(E.nre).join(' + ');
        steps.push(MEM('Balanced: <b>' + eqStr + '</b>. Coefficient ratio: <b>' + co[ib] + ' ' + Bs + ' : ' + co[ia] + ' ' + A + '</b>.'));
        var mol;
        if (gu === 'g') { fs.push([['1', 'mol ' + A], [mmAS, 'g ' + A]]); mol = amt / +mmAS; steps.push(CH('Molar mass of ' + A + ': <b>' + mmAS + ' g/mol</b> (the number goes with grams).')); }
        else if (gu === 'mol') mol = amt;
        else { if (!num(MAS)) return bad('Enter the given solution\'s molarity.'); used.push(MAS); if (gu === 'mL') fs.push([['1', 'L ' + A], ['1000', 'mL ' + A]]); fs.push([[MAS, 'mol ' + A], ['1', 'L ' + A]]); mol = amt / (gu === 'mL' ? 1000 : 1) * +MAS; }
        fs.push([[String(co[ib]), 'mol ' + Bs], [String(co[ia]), 'mol ' + A]]); var molB = mol * co[ib] / co[ia], ans = molB, unit = 'mol ' + Bs, extra = '';
        if (fu === 'g') { fs.push([[mmBS, 'g ' + Bs], ['1', 'mol ' + Bs]]); ans = molB * +mmBS; unit = 'g ' + Bs; steps.push(CH('Molar mass of ' + Bs + ': <b>' + mmBS + ' g/mol</b>.')); }
        if (fu === 'L' || fu === 'mL') { if (!num(MBS)) return bad('Enter the molarity of the solution you\'re finding the volume of.'); used.push(MBS); fs.push([['1', 'L ' + Bs], [MBS, 'mol ' + Bs]]); ans = molB / +MBS; unit = 'L ' + Bs; if (fu === 'mL') { fs.push([['1000', 'mL ' + Bs], ['1', 'L ' + Bs]]); ans *= 1000; unit = 'mL ' + Bs; } }
        steps.push(MEM('<b>Start with the given ' + (gu === 'g' ? 'grams' : gu === 'mol' ? 'moles' : 'volume') + '</b> and chain the factors so each unit cancels:'));
        steps.push(WK(D.fl([amtS, (gu === 'g' ? 'g ' : gu === 'mol' ? 'mol ' : gu + ' ') + A], fs, [ans.toPrecision(5), unit])));
        if (fu === 'M') { if (!num(VBS)) return bad('Enter the volume (mL) of the solution whose molarity you want.'); used.push(VBS); var LB = +VBS / 1000; ans = molB / LB; unit = 'M ' + Bs; extra = WK('M = mol ÷ L: ' + molB.toPrecision(5) + ' mol ÷ ' + LB.toPrecision(4) + ' L = <b>' + ans.toPrecision(5) + ' M</b>.'); steps.push(extra); }
        var sf = Math.min.apply(null, used.map(D.sfOf)); if (!isFinite(sf) || sf < 1) sf = 3;
        if (fu === 'g' && ib >= E.nre) steps.push(MEM(Bs + ' is a product, so grams of it = the <b>theoretical yield</b>.'));
        steps.push(MEM('Sig figs: <b>' + sf + '</b> (mole ratios are exact; molar masses usually have extra).'));
        return box(bigAns('Answer', D.sig(ans, sf) + ' ' + unit.split(' ')[0], 'unrounded ' + ans.toPrecision(6) + ' ' + unit) + tagList(steps), 'res-ok');
      });
    };
    TOOLS.t3limit = function (root, p) {
      root.innerHTML = field('Equation (coefficients optional; I balance it if they\'re missing)', inp('eq', p.eq, '3 H2 + N2 -> 2 NH3')) +
        '<div class="grid2">' + field('Reactant 1', inp('A', p.A, 'H2')) + field('Amount of reactant 1', inp('a', p.a, 'e.g. 4.93')) + field('Reactant 2', inp('B', p.B, 'N2')) + field('Amount of reactant 2', inp('b', p.b, 'e.g. 6.18')) +
        field('Both amounts are in', sel('u', [['g', 'grams'], ['mol', 'moles']], p.u)) + field('Product to compare', inp('P', p.P, 'NH3')) +
        field('Molar mass 1 (blank = chart)', inp('mA', p.mA, 'g/mol')) + field('Molar mass 2 (blank = chart)', inp('mB', p.mB, 'g/mol')) + field('Product molar mass (blank = chart)', inp('mP', p.mP, 'g/mol')) + '</div><div class="out"></div>';
      wire(root, function () {
        var E = eqParts(val(root, 'eq')); if (!E) return ''; if (E.error) return bad(esc(E.error));
        var ks = E.all.map(function (x) { return x.k; }), co;
        if (ks.every(function (k) { return k === null; })) co = D.balance(E.all.slice(0, E.nre).map(function (x) { return x.f; }), E.all.slice(E.nre).map(function (x) { return x.f; }));
        else co = ks.map(function (k) { return k || 1; });
        if (!co) return bad('That equation can\'t be balanced as written.');
        var fA = val(root, 'A').trim(), fB = val(root, 'B').trim(), fP = val(root, 'P').trim(), cA = parseOrNull(fA), cB = parseOrNull(fB), cP = parseOrNull(fP);
        if (!cA || !cB || !cP) return '';
        var find = function (c) { return E.all.findIndex(function (x) { return sameC(x.c, c); }); }, iA = find(cA), iB = find(cB), iP = find(cP);
        if (iA < 0 || iB < 0 || iP < 0) return bad('All three substances have to appear in the equation.');
        if (iA >= E.nre || iB >= E.nre) return bad('Both of the first two have to be <b>reactants</b>. A product can never be limiting.');
        if (iP < E.nre) return bad('Pick a <b>product</b> to compare.');
        var aS = val(root, 'a').trim(), bS = val(root, 'b').trim(), a = num(aS), b = num(bS), u = val(root, 'u'); if (a === null || b === null) return '';
        var A = fmtF(fA), Bs = fmtF(fB), Ps = fmtF(fP), g = u === 'g';
        var mA = val(root, 'mA').trim() || D.molar(cA).toFixed(2), mB = val(root, 'mB').trim() || D.molar(cB).toFixed(2), mP = val(root, 'mP').trim() || D.molar(cP).toFixed(2);
        var eqTxt = E.all.map(function (x, i) { return (co[i] > 1 ? co[i] + ' ' : '') + fmtF(x.f); }), eqStr = eqTxt.slice(0, E.nre).join(' + ') + ' → ' + eqTxt.slice(E.nre).join(' + ');
        var chain = function (amtS, amt, X, coX, mX) {
          var fs = (g ? [[['1', 'mol ' + X], [mX, 'g ' + X]]] : []).concat([[[String(co[iP]), 'mol ' + Ps], [String(coX), 'mol ' + X]]]).concat(g ? [[[mP, 'g ' + Ps], ['1', 'mol ' + Ps]]] : []);
          var v = (g ? amt / +mX : amt) * co[iP] / coX * (g ? +mP : 1);
          return { v: v, html: D.fl([amtS, (g ? 'g ' : 'mol ') + X], fs, [v.toPrecision(4), (g ? 'g ' : 'mol ') + Ps]) };
        };
        var cAc = chain(aS, a, A, co[iA], mA), cBc = chain(bS, b, Bs, co[iB], mB);
        if (Math.abs(cAc.v - cBc.v) < 1e-9 * Math.max(cAc.v, cBc.v)) return box(tagList([MEM('Balanced: <b>' + eqStr + '</b>.'), WK(cAc.html), WK(cBc.html), MEM('They come out <b>equal</b>: neither is limiting; both run out together.')]), 'res-ok');
        var limA = cAc.v < cBc.v, L = limA ? [A, aS, a, co[iA], mA] : [Bs, bS, b, co[iB], mB], X = limA ? [Bs, bS, b, co[iB], mB] : [A, aS, a, co[iA], mA];
        var sf = Math.min(D.sfOf(aS), D.sfOf(bS)); if (!isFinite(sf) || sf < 1) sf = 2;
        var y = Math.min(cAc.v, cBc.v), unit = g ? 'g' : 'mol';
        var steps = [MEM('Balanced: <b>' + eqStr + '</b>.'), MEM('Chain <b>each reactant</b> to the same product (' + Ps + '); the <b>smaller</b> amount wins.'), WK(cAc.html), WK(cBc.html),
          MEM('<b>' + L[0] + '</b> makes less → it is the <b>limiting reactant</b>; ' + X[0] + ' is in <b>excess</b>. Theoretical yield: <b>' + D.sig(y, sf) + ' ' + unit + ' ' + Ps + '</b>.')];
        var fs2 = (g ? [[['1', 'mol ' + L[0]], [L[4], 'g ' + L[0]]]] : []).concat([[[String(X[3]), 'mol ' + X[0]], [String(L[3]), 'mol ' + L[0]]]]).concat(g ? [[[X[4], 'g ' + X[0]], ['1', 'mol ' + X[0]]]] : []);
        var used = (g ? L[2] / +L[4] : L[2]) * X[3] / L[3] * (g ? +X[4] : 1), left = X[2] - used;
        steps.push(MEM('Left over = started − used. Start the "used" chain with the <b>limiting</b> reactant:'));
        steps.push(WK(D.fl([L[1], unit + ' ' + L[0]], fs2, [used.toPrecision(4), unit + ' ' + X[0] + ' used'])));
        steps.push(WK(X[1] + ' ' + unit + ' − ' + used.toPrecision(4) + ' ' + unit + ' = <b>' + left.toFixed(2) + ' ' + unit + ' ' + X[0] + '</b> left over.'));
        return box(bigAns('Limiting reactant', L[0], 'makes ' + D.sig(y, sf) + ' ' + unit + ' ' + Ps + ' · ' + left.toFixed(2) + ' ' + unit + ' ' + X[0] + ' left over') + tagList(steps), 'res-ok');
      });
    };
    TOOLS.t3yield = function (root, p) {
      root.innerHTML = '<div class="grid3">' + field('Actual yield (g)', inp('act', p.act, 'weighed')) + field('Theoretical yield (g)', inp('th', p.th, 'the math')) + field('Percent yield (%)', inp('pct', p.pct, '%')) + '</div><p class="hint">Leave exactly one blank.</p><div class="out"></div>';
      wire(root, function () {
        var s = ['act', 'th', 'pct'].map(function (k) { return val(root, k).trim(); }), v = s.map(num), blanks = v.map(function (x, i) { return x === null ? i : -1; }).filter(function (i) { return i >= 0; });
        if (blanks.length !== 1) return '';
        var b = blanks[0], ans, lab, eq;
        if (b === 2) { ans = v[0] / v[1] * 100; lab = 'Percent yield'; eq = s[0] + ' g ÷ ' + s[1] + ' g × 100'; }
        else if (b === 0) { ans = v[1] * v[2] / 100; lab = 'Actual yield'; eq = s[1] + ' g × ' + (v[2] / 100) + ' (the % as a decimal)'; }
        else { ans = v[0] / (v[2] / 100); lab = 'Theoretical yield'; eq = s[0] + ' g ÷ ' + (v[2] / 100); }
        var sf = Math.min.apply(null, s.filter(Boolean).map(D.sfOf)), u = b === 2 ? ' %' : ' g';
        var warn = b === 2 && ans > 100 ? '<p class="cmp cmp-bad">Over 100 %: the product is probably still wet (or the actual and theoretical are swapped).</p>' : '';
        return box(bigAns(lab, D.sig(ans, sf) + u, 'unrounded ' + ans.toPrecision(6)) + warn + tagList([MEM('<b>% yield = actual ÷ theoretical × 100</b>.'), WK(eq + ' = <b>' + ans.toPrecision(5) + u + '</b>.'), MEM('Sig figs: <b>' + sf + '</b>.')]), 'res-ok');
      });
    };
    TOOLS.t3dilution = function (root, p) {
      root.innerHTML = '<div class="grid4">' + field('M₁ (concentrated)', inp('M1', p.M1, 'M')) + field('V₁', inp('V1', p.V1, 'volume')) + field('M₂ (dilute)', inp('M2', p.M2, 'M')) + field('V₂', inp('V2', p.V2, 'volume')) + '</div><p class="hint">Leave exactly one blank. Use the same volume unit for V₁ and V₂.</p><div class="out"></div>';
      wire(root, function () {
        var k = ['M1', 'V1', 'M2', 'V2'], s = k.map(function (x) { return val(root, x).trim(); }), v = s.map(num), blanks = v.map(function (x, i) { return x === null ? i : -1; }).filter(function (i) { return i >= 0; });
        if (blanks.length !== 1) return blanks.length ? '' : bad('Leave the one you\'re solving for blank.');
        var b = blanks[0], ans = b === 0 ? v[2] * v[3] / v[1] : b === 1 ? v[2] * v[3] / v[0] : b === 2 ? v[0] * v[1] / v[3] : v[0] * v[1] / v[2];
        var sf = Math.min.apply(null, s.filter(Boolean).map(D.sfOf)), name = ['M₁', 'V₁', 'M₂', 'V₂'][b];
        var expr = b === 0 ? 'M₂V₂ ÷ V₁' : b === 1 ? 'M₂V₂ ÷ M₁' : b === 2 ? 'M₁V₁ ÷ V₂' : 'M₁V₁ ÷ M₂';
        return box(bigAns(name, D.sig(ans, sf) + (b % 2 ? ' (same volume unit)' : ' M'), 'unrounded ' + ans.toPrecision(6)) + tagList([MEM('M₁V₁ = M₂V₂ → ' + name + ' = ' + expr + '.'), WK('= <b>' + ans.toPrecision(5) + '</b>.'), MEM('Sig figs: <b>' + sf + '</b>.')]), 'res-ok');
      });
    };
    function parseEq(str) {
      var parts = String(str).replace(/→|=+>|-+>|⟶/g, '>').split('>'); if (parts.length !== 2) return null;
      var side = function (t) { return t.split('+').map(function (x) { x = x.trim().replace(/\((aq|s|l|g)\)/g, '').trim(); var m = /^(\d+)\s*/.exec(x); return { k: m ? +m[1] : null, f: m ? x.slice(m[0].length) : x }; }).filter(function (x) { return x.f; }); };
      var L = side(parts[0]), R = side(parts[1]);
      for (var i = 0; i < L.length + R.length; i++) { var sp = i < L.length ? L[i] : R[i - L.length]; sp.c = parseOrNull(sp.f); if (!sp.c) return { error: 'I can\'t read "' + sp.f + '".' }; }
      return { L: L, R: R };
    }
    TOOLS.t3balance = function (root, p) {
      root.innerHTML = field('Equation (with or without your coefficients)', inp('eq', p.eq, 'C2H6 + O2 -> H2O + CO2')) + '<p class="hint">Use -> or → for the arrow. Type your coefficients in front (2 H2 + O2 -> 2 H2O) to check them.</p><div class="out"></div>';
      wire(root, function () {
        var E = parseEq(val(root, 'eq')); if (!E) return ''; if (E.error) return bad(esc(E.error));
        var co = D.balance(E.L.map(function (x) { return x.f; }), E.R.map(function (x) { return x.f; }));
        var html = '';
        var mine = E.L.concat(E.R).map(function (x) { return x.k; });
        if (mine.some(function (x) { return x !== null; })) {
          var k = mine.map(function (x) { return x || 1; }), t = function (arr, off) { var o = {}; arr.forEach(function (sp, i) { for (var e in sp.c) o[e] = (o[e] || 0) + sp.c[e] * k[i + off]; }); return o; };
          var l = t(E.L, 0), r = t(E.R, E.L.length), els = Object.keys(Object.assign({}, l, r)), ok = els.every(function (e) { return l[e] === r[e]; });
          html += '<table class="t3tab"><tr><th>Atom</th><th>Left</th><th>Right</th></tr>' + els.map(function (e) { return '<tr><td>' + e + '</td><td>' + (l[e] || 0) + '</td><td>' + (r[e] || 0) + (l[e] === r[e] ? ' ✓' : ' ✗') + '</td></tr>'; }).join('') + '</table>' + (ok ? '<p class="cmp cmp-ok">✓ Your coefficients balance.</p>' : '<p class="cmp cmp-bad">✗ Not balanced yet. Compare with the answer below.</p>');
        }
        if (!co) return box(html + '<p>This one doesn\'t have a single balanced answer (check the formulas).</p>');
        var all = E.L.concat(E.R), s = function (arr, off) { return arr.map(function (x, i) { return (co[i + off] > 1 ? co[i + off] + ' ' : '') + fmtF(x.f); }).join(' + '); };
        return box(html + bigAns('Balanced', s(E.L, 0) + ' → ' + s(E.R, E.L.length), 'coefficients in order (type 1s for eLearn): ' + co.join(', ')), 'res-ok');
      });
    };
    TOOLS.t3rxntype = function (root, p) {
      root.innerHTML = field('Equation', inp('eq', p.eq, 'CH4 + O2 -> CO2 + H2O')) + '<div class="out"></div>';
      wire(root, function () {
        var E = parseEq(val(root, 'eq')); if (!E) return ''; if (E.error) return bad(esc(E.error));
        var lone = function (sp) { return Object.keys(sp.c).length === 1; }, fs = function (a) { return a.map(function (x) { return x.f.replace(/\s/g, ''); }); };
        var t, why;
        if (fs(E.L).indexOf('O2') >= 0 && fs(E.R).indexOf('CO2') >= 0 && fs(E.R).indexOf('H2O') >= 0) { t = 'combustion'; why = 'O₂ in, CO₂ + H₂O out.'; }
        else if (E.R.length === 1) { t = 'synthesis'; why = 'only one product.'; }
        else if (E.L.length === 1) { t = 'decomposition'; why = 'only one reactant.'; }
        else if (E.L.some(lone) && E.R.some(lone)) { t = 'single replacement'; why = 'a lone element on each side; one swaps into the compound.'; }
        else if (E.L.length === 2 && E.R.length === 2) { t = 'double replacement'; why = 'two compounds swap partners.'; }
        else { t = 'not one of the five patterns'; why = 'check the equation.'; }
        return box(bigAns('Type', t, why) + tagList([MEM('Order to check: combustion → one product → one reactant → lone element → swap.')]), 'res-ok');
      });
    };
    var cats = Object.keys(D.CAT).map(function (k) { return [k, D.CAT[k][0] === 'NH4' ? 'NH₄⁺ (ammonium)' : D.sub(D.CAT[k][0]) + D.chg(D.CAT[k][1]) + ' (' + D.CAT[k][2] + ')']; });
    var ans = Object.keys(D.AN).map(function (k) { return [k, D.sub(D.AN[k][0]) + D.chg(D.AN[k][1]) + ' (' + D.AN[k][2] + ')']; });
    TOOLS.t3solub = function (root, p) {
      root.innerHTML = '<div class="grid2">' + field('Positive ion', sel('c', cats, p.c)) + field('Negative ion', sel('a', ans, p.a)) + '</div><div class="out"></div>';
      wire(root, function () {
        var c = val(root, 'c'), a = val(root, 'a'), s = D.salt(c, a), r = D.soluble(c, a);
        return box(bigAns(fmtF(s.f) + ' (' + s.name + ')', r[0] ? 'Soluble (aq)' : 'Insoluble (s)') + tagList([MEM('Positive ion first, then the negative ion; stop at the first rule.'), (r[2] === 'mem' ? MEM : CH)(r[1])]), r[0] ? 'res-ok' : '');
      });
    };
    TOOLS.t3ions = function (root, p) {
      root.innerHTML = '<div class="grid2">' + field('Compound 1: positive ion', sel('c1', cats, p.c1)) + field('Compound 1: negative ion', sel('a1', ans, p.a1)) + field('Compound 2: positive ion', sel('c2', cats, p.c2)) + field('Compound 2: negative ion', sel('a2', ans, p.a2)) + '</div><p class="hint">Pick the ions of the two reactants (dissolved in water). You get the products, phases, balanced equation, whether it goes, the full and net ionic equations and the spectators.</p><div class="out"></div>';
      wire(root, function () {
        var c1 = val(root, 'c1'), a1 = val(root, 'a1'), c2 = val(root, 'c2'), a2 = val(root, 'a2');
        if (c1 === c2 || a1 === a2) return bad('Pick two different positive ions and two different negative ions.');
        var r = D.explainDR(c1, a1, c2, a2);
        var warn = r.reactantsSoluble ? '' : '<p class="cmp cmp-bad">Heads-up: a reactant is insoluble on the chart, so it wouldn\'t really be (aq).</p>';
        return box(warn + bigAns('Molecular (balanced)', r.mol) + list([
          '<b>Products</b>: swap the negatives and rebuild from charges → ' + fmtF(r.p1.f) + ' and ' + fmtF(r.p2.f) + '.',
          '<b>Phases</b> (solubility chart): ' + fmtF(r.p1.f) + ' ' + (r.sol.p1[0] ? '(aq)' : '<b>(s)</b>') + ', ' + fmtF(r.p2.f) + ' ' + (r.sol.p2[0] ? '(aq)' : '<b>(s)</b>') + '.',
          '<b>Does it go?</b> ' + (r.goes ? 'Yes, a precipitate forms.' : 'No, every product is (aq).'),
          '<b>Full ionic</b>: ' + r.full,
          '<b>Spectators</b>: ' + (r.spectators.length ? r.spectators.join(', ') : 'none'),
          '<b>Net ionic</b>: ' + r.net]), r.goes ? 'res-ok' : '');
      });
    };
    TOOLS.t3ox = function (root, p) {
      root.innerHTML = '<div class="grid2">' + field('Formula with charge', inp('f', p.f, 'BrO3-  ·  SO4 2-  ·  Al3+  ·  NCl3')) + '</div><p class="hint">Write a charge at the end: MnO4-, Cr2O7 2-, NH4+, Fe3+.</p><div class="out"></div>';
      wire(root, function () {
        var raw = val(root, 'f').trim().replace(/[−–]/g, '-').replace(/\^/g, ''); if (!raw) return '';
        var f = raw, q = 0, m;
        if ((m = /^(.*\S)\s+(\d*)([+-])$/.exec(raw))) { f = m[1]; q = (m[2] ? +m[2] : 1) * (m[3] === '+' ? 1 : -1); }   // "SO4 2-"
        else if ((m = /^([A-Z][a-z]?)(\d+)([+-])$/.exec(raw))) { f = m[1]; q = +m[2] * (m[3] === '+' ? 1 : -1); }   // "Fe3+": one element, digits are the charge
        else if ((m = /^(.*?)([+-])$/.exec(raw))) { f = m[1]; q = m[2] === '+' ? 1 : -1; }   // "MnO4-", "NH4+"
        if (!parseOrNull(f)) return bad('I can\'t read that formula.');
        var r = D.oxSolve(f, q), c = D.parse(f);
        var out = Object.keys(c).map(function (e) { return e + ' = <b>' + sg(r.ox[e]) + '</b>'; }).join(' &nbsp;·&nbsp; ');
        var tagMap = { mem: MEM, chart: CH, both: BO, '': WK };
        return box(bigAns('Oxidation numbers in ' + fmtF(f) + D.chg(q), out) + tagList(r.steps.map(function (s) { return tagMap[s[0]](s[1]); })), 'res-ok');
      });
    };
    TOOLS.t3redox = function (root, p) {
      root.innerHTML = field('Half-reaction', inp('eq', p.eq, 'Fe -> Fe3+ + 3e-')) + '<p class="hint">Write electrons as e-. Example: O2 + 4e- -> 2O2-</p><div class="out"></div>';
      wire(root, function () {
        var s = String(val(root, 'eq')).replace(/→|-+>/g, '>').split('>'); if (s.length !== 2) return '';
        var hasL = /(^|\+|\s)\d*\s*e[-⁻]?(\s|$|\+)/.test(s[0]), hasR = /(^|\+|\s)\d*\s*e[-⁻]?(\s|$|\+)/.test(s[1]);
        if (hasL === hasR) return bad('Put the electrons (e-) on one side.');
        var ox = hasR, sp = s[0].split(/\s+\+\s+/).map(function (x) { return x.trim(); }).filter(function (x) { return x && !/^\d*\s*e[-⁻]?$/.test(x); })[0] || '';
        sp = sp.replace(/^\d+\s*/, '').replace(/^([A-Za-z()\d]*?[A-Za-z)])(\d*)([+-])$/, function (_, f, n, g) { return D.sub(f) + D.chg((n ? +n : 1) * (g === '+' ? 1 : -1)); });
        if (!/[⁺⁻]/.test(sp)) sp = D.sub(sp);
        return box(bigAns('This is', ox ? 'Oxidation' : 'Reduction', sp + ' is the ' + (ox ? 'reducing' : 'oxidizing') + ' agent') + tagList([MEM('Electrons on the ' + (ox ? 'right = lost' : 'left = gained') + ' → ' + (ox ? 'oxidation' : 'reduction') + ' (OIL RIG).'), MEM('Oxidized = reducing agent; reduced = oxidizing agent.')]), 'res-ok');
      });
    };
    TOOLS.t3activity = function (root, p) {
      var opt = D.SERIES.map(function (x) { return [x, x]; });
      root.innerHTML = '<div class="grid2">' + field('Neutral metal (solid)', sel('m', opt.filter(function (o) { return o[0] !== 'H'; }), p.m)) + field('Ion in solution', sel('i', D.SERIES.map(function (x) { return [x, x + D.chg(D.ION_CH[x])]; }), p.i)) + '</div><div class="out"></div>';
      wire(root, function () {
        var m = val(root, 'm'), i = val(root, 'i'); if (m === i) return bad('Pick two different elements.');
        var goes = D.SERIES.indexOf(m) < D.SERIES.indexOf(i);
        return box(bigAns(m + '(s) + ' + i + D.chg(D.ION_CH[i]) + '(aq)', goes ? 'Goes' : 'No reaction', m + ' is ' + (goes ? 'above' : 'below') + ' ' + i + ' on the activity series') + tagList([CH('Series: ' + D.SERIES.map(function (x) { return x === m || x === i ? '<b>' + x + '</b>' : x; }).join(' > ')), MEM('Neutral higher than the ion → it goes.')]), goes ? 'res-ok' : '');
      });
    };
  }

  window.T3NAV = { groups: groups, nodes: nodes, install: install };
})();
