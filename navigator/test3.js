/* Chem Navigator — Test 3 (HW 13–16). Loaded before the main Navigator script; it adds Test 3 groups, flowchart nodes
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
    { test: 'T3', name: 'Solubility, ionic equations & redox', tag: 'i16', ids: ['t3_solub', 't3_goes', 't3_ionic', 't3_ox', 't3_redox', 't3_activity'] }
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
        CH('grams ÷ atomic mass (periodic table) = <b>moles</b> of each element. Do every element. Never use diatomic masses (O, not O₂).'),
        MEM('<b>Divide every mole value by the smallest one.</b> This is the most-missed step.'),
        MEM('Within <b>0.1</b> of a whole number → round. Ends in <b>.5 → × 2</b>; <b>.33 / .67 → × 3</b>; <b>.25 / .75 → × 4</b>. Multiply every element.'),
        MEM('Write C, then H, then the rest. H never goes first unless it\'s an acid.')],
      watch: ['In lab you just round (lab data is messy). On the homework and tests, use the × 2 / × 3 fix.', 'Don\'t round 2.5 to 2 or 3. That\'s the case that needs × 2.'],
      tool: 't3empf', preset: { mode: 'pct', e1: 'C', a1: '53.3', e2: 'H', a2: '11.2', e3: 'O', a3: '' } },
    t3_empf_g: { title: 'Grams of each element (or a sample mass)', walk: 'hw13-q13',
      steps: [WK('Missing element by subtraction: sample mass − the known element.'),
        CH('grams ÷ atomic mass = <b>moles</b> for each element.'),
        MEM('<b>Divide by the smallest</b>, then fix any .5 / .33 / .25 with × 2 / × 3 / × 4.'),
        WK('Write the formula from the whole numbers.')],
      watch: ['HW 13 #13: Co 0.100 mol, O 0.150 mol → 1 : 1.5 → × 2 → Co₂O₃.'],
      tool: 't3empf', preset: { mode: 'g', total: '8.29', e1: 'Co', a1: '5.89', e2: 'O', a2: '', e3: '', a3: '' } },
    t3_atoms: { title: 'Which sample has the most atoms of an element?', hint: 'moles × subscript', walk: 'hw13-q02',
      steps: [WK('Moles of that element = <b>moles of compound × its subscript</b> in the formula.'),
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
      steps: [MEM('<b>M = mol ÷ L</b>.'), MEM('Volume in <b>liters</b>: mL ÷ 1000.'),
        CH('Given grams? grams ÷ molar mass (from the problem) = moles first.'),
        MEM('Sig figs: the least precise number given.')],
      watch: ['HW 14 #8–9: 997.7 mL is 0.9977 L. Using mL gives an answer 1000× too small.'],
      tool: 't3molarity', preset: { find: 'M', g: '4.90', mm: '132.10', vol: '123.0', vu: 'mL' } },
    t3_mol_n: { title: 'Find the moles', walk: 'hw14-q13',
      steps: [MEM('Rewrite <b>M as mol/L</b> so you can see L cancel.'), MEM('Start with the one-unit number: the volume in <b>L</b>.'), WK('L × mol/L = <b>mol</b>.')],
      tool: 't3molarity', preset: { find: 'mol', M: '0.139', vol: '115.0', vu: 'mL' } },
    t3_mol_g: { title: 'Find the grams needed', walk: 'hw14-q15',
      steps: [MEM('Volume in L × molarity (mol/L) = <b>moles</b>.'), CH('Moles × molar mass (g/mol) = <b>grams</b>.'), MEM('Factor-label: g/mol has the 1 under mol, the grams on top.')],
      watch: ['HW 14 #16: 0.41 M has only 2 sig figs → 29.9 g becomes 30 g.'],
      tool: 't3molarity', preset: { find: 'g', M: '0.132', vol: '150.0', vu: 'mL', mm: '241.86' } },
    t3_mol_V: { title: 'Find the volume (L or mL)', walk: 'hw14-q20',
      steps: [CH('Given grams? grams ÷ molar mass = moles.'), MEM('<b>L = mol ÷ M</b> (divide so mol cancels).'), MEM('Asked for mL? × 1000 at the end.')],
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
      tool: 't3activity', preset: { m: 'Zn', i: 'Cu' } }
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
        steps.push(CH('Moles: ' + els.map(function (e, j) { return e + ' ' + (j === blank ? amt.disp : amt[j]) + ' ÷ ' + D.MASS[e].toFixed(2) + ' = <b>' + mol[j].toFixed(4) + '</b>'; }).join('; ') + '.'));
        steps.push(MEM('Divide by the smallest: ' + els.map(function (e, j) { return e + ' <b>' + ratio[j].toFixed(2) + '</b>'; }).join(', ') + '.'));
        var mult = null; [1, 2, 3, 4, 5, 6].some(function (m) { if (ratio.every(function (x) { return Math.abs(x * m - Math.round(x * m)) <= 0.1; })) { mult = m; return true; } });
        if (!mult) return box(tagList(steps) + '<p>The ratios don\'t come out to whole numbers even × 6. Check the numbers you entered.</p>');
        var n = ratio.map(function (x) { return Math.round(x * mult); }), f = els.map(function (e, j) { return e + (n[j] === 1 ? '' : n[j]); }).join('');
        steps.push(MEM(mult === 1 ? 'All within 0.1 of whole numbers → round.' : 'Not whole → multiply everything by <b>' + mult + '</b>: ' + els.map(function (e, j) { return e + ' ' + (ratio[j] * mult).toFixed(2); }).join(', ') + '.'));
        return box(bigAns('Empirical formula', fmtF(f), 'typed: ' + f) + tagList(steps), 'res-ok');
      });
    };
    TOOLS.t3molarity = function (root, p) {
      root.innerHTML = '<div class="grid2">' + field('Find', sel('find', [['M', 'molarity (M)'], ['mol', 'moles'], ['g', 'grams'], ['L', 'volume in L'], ['mL', 'volume in mL']], p.find)) + field('Molarity (M)', inp('M', p.M, 'e.g. 0.139')) + field('Volume', inp('vol', p.vol, 'e.g. 115.0')) + field('Volume unit', sel('vu', ['mL', 'L'], p.vu || 'mL')) + field('Moles', inp('n', p.n, 'mol')) + field('Grams', inp('g', p.g, 'g')) + field('Molar mass (g/mol) or formula', inp('mm', p.mm, '58.44 or NaCl')) + '</div><p class="hint">Fill in what the problem gives; leave the rest blank.</p><div class="out"></div>';
      wire(root, function () {
        var find = val(root, 'find'), Ms = val(root, 'M').trim(), vs = val(root, 'vol').trim(), ns = val(root, 'n').trim(), gs = val(root, 'g').trim(), mms = val(root, 'mm').trim();
        var M = num(Ms), v = num(vs), n = num(ns), g = num(gs), mm = num(mms), steps = [], used = [];
        if (mms && mm === null) { var c = parseOrNull(mms); if (c) { mm = D.molar(c); steps.push(CH('Molar mass of ' + fmtF(mms) + ' = <b>' + mm.toFixed(2) + ' g/mol</b>.')); } }
        else if (mm) steps.push(CH('Molar mass is given: <b>' + mms + ' g/mol</b>.'));
        var L = null; if (v !== null) { L = val(root, 'vu') === 'mL' ? v / 1000 : v; used.push(vs); if (val(root, 'vu') === 'mL') steps.push(MEM('mL ÷ 1000: ' + vs + ' mL = <b>' + L.toPrecision(4) + ' L</b>.')); }
        if (M !== null) { used.push(Ms); steps.push(MEM('Rewrite <b>' + Ms + ' M as ' + Ms + ' mol/L</b>.')); }
        if (n === null && g !== null && mm) { n = g / mm; used.push(gs); steps.push(WK('Grams → moles: ' + gs + ' ÷ ' + mm.toFixed(2) + ' = <b>' + n.toPrecision(4) + ' mol</b>.')); }
        else if (n !== null) used.push(ns);
        var ans = null, unit = find;
        if (find === 'M') { if (n === null || L === null) return bad('To find M you need moles (or grams + molar mass) and a volume.'); ans = n / L; unit = 'M'; steps.push(MEM('M = mol ÷ L = <b>' + ans.toPrecision(4) + '</b>.')); }
        if (find === 'mol' || find === 'g') { if (M === null || L === null) return bad('You need the molarity and the volume.'); var nn = M * L; steps.push(WK(L.toPrecision(4) + ' L × ' + Ms + ' mol/L = <b>' + nn.toPrecision(4) + ' mol</b>.')); ans = nn; unit = 'mol';
          if (find === 'g') { if (!mm) return bad('Grams need a molar mass (or formula).'); ans = nn * mm; unit = 'g'; steps.push(CH(nn.toPrecision(4) + ' mol × ' + mm.toFixed(2) + ' g/mol = <b>' + ans.toPrecision(4) + ' g</b>.')); } }
        if (find === 'L' || find === 'mL') { if (M === null || n === null) return bad('You need the molarity and the moles (or grams + molar mass).'); ans = n / M; steps.push(MEM('L = mol ÷ M = <b>' + ans.toPrecision(4) + ' L</b>.')); unit = 'L'; if (find === 'mL') { ans *= 1000; unit = 'mL'; steps.push(MEM('× 1000 → <b>' + ans.toPrecision(4) + ' mL</b>.')); } }
        var sf = Math.min.apply(null, used.map(D.sfOf)); if (!isFinite(sf) || sf < 1) sf = 3;
        steps.push(MEM('Sig figs: the least precise given number has <b>' + sf + '</b>.'));
        return box(bigAns('Answer', D.sig(ans, sf) + ' ' + unit, 'unrounded ' + ans.toPrecision(6)) + tagList(steps), 'res-ok');
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
