/* 介面：輸入表單、結果摘要、斷面圖、計算書 */
(function () {
  const KEY = 'rw-cantilever-v1';
  const clone = o => JSON.parse(JSON.stringify(o));
  let P = load() || clone(RW.DEFAULTS);

  function load() {
    try { const s = localStorage.getItem(KEY); if (s) return fix(Object.assign(clone(RW.DEFAULTS), JSON.parse(s))); } catch (e) {}
    return null;
  }
  function fix(q) {
    if (!['coulomb', 'ck'].includes(q.kpm)) q.kpm = 'rankine';
    if ('wt' in q) { if (!q.wt && +q.hw2 === 0) q.hw2 = null; delete q.wt; }   // 已移除「基底位於地下水位下」，改由 Hw2 判斷
    return q; }  // 已移除「範例沿用法」
  function save() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} }

  // ---------- 建議尺寸（依牆高 H） ----------
  // 依「道路工程參考圖（勘誤版）」R-008 鋼筋混凝土懸臂式擋土牆 表一（H = 4.70～10.50 m）內插；H < 4.70 m 依 4.70 m 列等比例外推
  const PRESETS = [{"H": 1.5, "T": 0.3, "D1": 0, "D2": 0.35, "C": 0.3, "S": 0.4, "E": 0.55, "Kd": 0.3, "Ks": 0.3, "Kc": 0.55, "Df": 0.6, "src": "外推"}, {"H": 2.0, "T": 0.3, "D1": 0, "D2": 0.35, "C": 0.3, "S": 0.4, "E": 0.75, "Kd": 0.3, "Ks": 0.3, "Kc": 0.65, "Df": 0.6, "src": "外推"}, {"H": 2.5, "T": 0.3, "D1": 0, "D2": 0.35, "C": 0.3, "S": 0.4, "E": 0.95, "Kd": 0.3, "Ks": 0.3, "Kc": 0.7, "Df": 0.6, "src": "外推"}, {"H": 3.0, "T": 0.3, "D1": 0, "D2": 0.45, "C": 0.4, "S": 0.4, "E": 1.1, "Kd": 0.3, "Ks": 0.3, "Kc": 0.85, "Df": 0.6, "src": "外推"}, {"H": 3.5, "T": 0.3, "D1": 0, "D2": 0.5, "C": 0.45, "S": 0.5, "E": 1.3, "Kd": 0.3, "Ks": 0.3, "Kc": 1.05, "Df": 0.6, "src": "外推"}, {"H": 4.0, "T": 0.3, "D1": 0, "D2": 0.6, "C": 0.5, "S": 0.55, "E": 1.5, "Kd": 0.35, "Ks": 0.35, "Kc": 1.2, "Df": 0.6, "src": "外推"}, {"H": 4.5, "T": 0.3, "D1": 0, "D2": 0.65, "C": 0.55, "S": 0.6, "E": 1.7, "Kd": 0.4, "Ks": 0.4, "Kc": 1.3, "Df": 0.6, "src": "外推"}, {"H": 5.0, "T": 0.3, "D1": 0, "D2": 0.75, "C": 0.65, "S": 0.7, "E": 1.85, "Kd": 0.4, "Ks": 0.4, "Kc": 1.45, "Df": 0.6, "src": "內插"}, {"H": 5.5, "T": 0.3, "D1": 0, "D2": 0.8, "C": 0.65, "S": 0.7, "E": 2.0, "Kd": 0.4, "Ks": 0.4, "Kc": 1.45, "Df": 0.6, "src": "內插"}, {"H": 6.0, "T": 0.3, "D1": 0, "D2": 0.9, "C": 0.7, "S": 0.8, "E": 2.2, "Kd": 0.45, "Ks": 0.45, "Kc": 1.6, "Df": 0.6, "src": "內插"}, {"H": 6.5, "T": 0.3, "D1": 0, "D2": 0.95, "C": 0.75, "S": 0.85, "E": 2.45, "Kd": 0.5, "Ks": 0.5, "Kc": 1.55, "Df": 0.6, "src": "內插"}, {"H": 7.0, "T": 0.3, "D1": 0, "D2": 1.05, "C": 0.75, "S": 0.9, "E": 2.8, "Kd": 0.5, "Ks": 0.5, "Kc": 1.95, "Df": 0.6, "src": "內插"}, {"H": 7.5, "T": 0.3, "D1": 0, "D2": 1.1, "C": 0.85, "S": 1.0, "E": 3.1, "Kd": 0.6, "Ks": 0.6, "Kc": 1.95, "Df": 0.6, "src": "內插"}, {"H": 8.0, "T": 0.3, "D1": 0, "D2": 1.15, "C": 0.85, "S": 1.05, "E": 3.5, "Kd": 0.6, "Ks": 0.6, "Kc": 2.3, "Df": 0.6, "src": "內插"}, {"H": 8.5, "T": 0.3, "D1": 0, "D2": 1.2, "C": 0.9, "S": 1.1, "E": 3.8, "Kd": 0.6, "Ks": 0.6, "Kc": 2.05, "Df": 0.6, "src": "內插"}, {"H": 9.0, "T": 0.3, "D1": 0, "D2": 1.25, "C": 0.95, "S": 1.2, "E": 4.15, "Kd": 0.6, "Ks": 0.6, "Kc": 2.2, "Df": 0.6, "src": "內插"}, {"H": 9.5, "T": 0.3, "D1": 0, "D2": 1.3, "C": 1.0, "S": 1.25, "E": 4.65, "Kd": 0.65, "Ks": 0.65, "Kc": 2.75, "Df": 0.6, "src": "內插"}, {"H": 10.0, "T": 0.3, "D1": 0, "D2": 1.45, "C": 1.05, "S": 1.3, "E": 5.2, "Kd": 0.7, "Ks": 0.7, "Kc": 3.35, "Df": 0.6, "src": "內插"}, {"H": 10.5, "T": 0.3, "D1": 0, "D2": 1.5, "C": 1.05, "S": 1.35, "E": 5.6, "Kd": 0.7, "Ks": 0.7, "Kc": 3.8, "Df": 0.6, "src": "R-008 表列"}];
  // R-008 表二 鋼筋配置（依牆身高 J）：①→S4 踵版上層、②→S5 趾版下層、④→T2、⑥→S1 牆背主筋、⑦→S2 牆背補強（a＝長度）、⑧→S8 暴露面、⑨→T1
  const RBARS = [
    { J: 4.0, S1: [19, 30], S2: [19, 30, 263], S4: [19, 15], S5: [13, 30], S8: [13, 30] },
    { J: 4.5, S1: [19, 30], S2: [19, 30, 293], S4: [19, 15], S5: [16, 30], S8: [13, 30] },
    { J: 5.0, S1: [22, 30], S2: [22, 30, 328], S4: [22, 15], S5: [16, 30], S8: [13, 30] },
    { J: 5.5, S1: [22, 30], S2: [22, 30, 363], S4: [25, 15], S5: [19, 30], S8: [16, 30] },
    { J: 6.0, S1: [22, 30], S2: [22, 30, 398], S4: [25, 15], S5: [19, 30], S8: [16, 30] },
    { J: 6.5, S1: [25, 30], S2: [25, 30, 428], S4: [25, 15], S5: [19, 30], S8: [16, 30] },
    { J: 7.0, S1: [25, 30], S2: [25, 30, 458], S4: [25, 15], S5: [19, 30], S8: [16, 30] },
    { J: 7.5, S1: [25, 30], S2: [25, 30, 488], S4: [29, 15], S5: [22, 30], S8: [16, 30] },
    { J: 8.0, S1: [29, 30], S2: [29, 30, 518], S4: [29, 15], S5: [22, 30], S8: [19, 30] },
    { J: 8.5, S1: [29, 30], S2: [29, 30, 563], S4: [32, 15], S5: [22, 30], S8: [19, 30] },
    { J: 9.0, S1: [32, 30], S2: [32, 30, 593], S4: [25, 7.5], S5: [22, 30], S8: [19, 30] }  // ① 2-D25@15 以 D25@7.5 計
  ];
  const DIMK = ['T', 'H', 'C', 'S', 'E', 'D1', 'D2', 'Kd', 'Kc', 'Df', 'Ks'];
  function applyPreset(h) {
    const q = PRESETS.find(x => String(x.H) === h); if (!q) return;
    DIMK.forEach(k => { P[k] = q[k]; });
    const hs = +(q.H - q.D1 - q.D2).toFixed(2);
    // 取 R-008 表二中牆身高 J ≥ 本牆身高之最小一欄（偏保守）
    const rb = RBARS.find(x => x.J >= hs - 1e-6) || RBARS[RBARS.length - 1];
    const set = (k, d, s, L) => { P.bars[k].D = d; P.bars[k].s = s; if (L !== undefined) P.bars[k].L = L; };
    set('S1', rb.S1[0], rb.S1[1], hs);
    const L2 = Math.min(hs, Math.max(0, Math.round((rb.S2[2] / 100 - q.D2 + 0.10) / 0.05) * 0.05));
    set('S2', rb.S2[0], rb.S2[1], +L2.toFixed(2));
    set('S3', P.bars.S3.D, 0, 0);  // R-008 牆背僅 ⑥、⑦ 兩種，S3 不使用（間距 0）
    set('S4', rb.S4[0], rb.S4[1]); set('S5', rb.S5[0], rb.S5[1]); set('S8', rb.S8[0], rb.S8[1]);
    set('T1', 13, 30); set('T2', 13, 30);
    // 主筋：R-008 表二配筋若不足目前所選規範之需求，逐級加大號數（S1、S2 同步）
    try {
      const SIZES = [13, 16, 19, 22, 25, 29, 32, 36];
      const up = k => { const i = SIZES.indexOf(P.bars[k].D); if (i >= 0 && i < SIZES.length - 1) { P.bars[k].D = SIZES[i + 1]; return true; } if (P.bars[k].s > 10) { P.bars[k].s = +(P.bars[k].s - 2.5).toFixed(1); return true; } return false; };
      for (let it = 0; it < 12; it++) {
        const o1 = RW.compute(P); let changed = false;
        for (const r of o1.rc) if (!(r.okM && r.okV)) {
          if (/^S1/.test(r.desc)) { changed = up('S1') | up('S2') || changed; }
          else if (r.desc === 'S4') changed = up('S4') || changed;
          else if (r.desc === 'S5') changed = up('S5') || changed;
        }
        if (!changed) break;
      }
    } catch (e) {}
    // 溫度筋／暴露面筋：R-008 為 D13@30，若不足目前規範最少鋼筋量則自動加大
    try {
      const o2 = RW.compute(P);
      for (const m of o2.min) if (!m.ok) {
        const need = m.Asr / (m.k === 'S8' ? 1 : 2);
        let best = null;
        for (const d of [13, 16, 19, 22]) for (const s of [30, 25, 20, 15]) { const As = RW.BARS[d] * 100 / s; if (As >= need && (!best || As < best.As)) best = { d, s, As }; }
        if (best) set(m.k, best.d, best.s);
      }
    } catch (e) {}
    P.barSrc = `R-008 表二 J = ${rb.J.toFixed(1)} m`;
  }


  // ---------- form schema ----------
  const G = [
    { plain: true, f: [['id', '計算書編號', '', 'text']] },
    { t: '1. 擋土牆設計尺寸', open: true, f: [
      ['preset', '建議尺寸（選擇牆高 H）', '', 'select', [['', '自訂'], ...PRESETS.map(q => [String(q.H), `H = ${q.H.toFixed(1)} m`])]],
      ['H', '(1) 牆體全高 H', 'm'], ['T', '(2) 牆身頂寬 T', 'm'], ['=h', '(3) 牆身高度 h = H − D1 − D2', 'm'],
      ['=B', '(4) 基礎寬度 B = C + S + E', 'm'], ['C', '(5) 基礎趾長 C', 'm'], ['S', '(6) 牆身底寬 S', 'm'],
      ['E', '(7) 基礎踵長 E', 'm'], ['D1', '(8) 基礎上高 D1', 'm'], ['D2', '(9) 基礎下高 D2', 'm'],
      ['=eta', '(10) 牆背斜率 η = (S − T)/h', ''], ['Kd', '(11) 止滑榫尺寸 Kd', 'm'], ['Kc', '(12) 止滑榫位置 Kc', 'm'],
      ['Df', '(13) 趾版覆土 Df', 'm'], ['=Y', '(14) 牆前回填 Y = Df + D2', 'm'], ['n', '(15) 背填坡度 1V : nH', 'n'],
      ['Ks', '止滑榫寬度 Ks（繪圖用）', 'm']],
      hint: '選擇牆高 H 即帶入建議尺寸，之後仍可自行修改任一尺寸（修改後顯示「自訂」）。實際條件不同時請自行檢核調整。' },
    { t: '2. 土壤參數', f: [
      ['gB', '背填土 γ', 'tf/m³'], ['phiB', '背填土 ϕ', '度'], ['cB', '背填土 c', 'tf/m²'],
      ['gF', '承載層 γ', 'tf/m³'], ['phiF', '承載層 ϕ', '度'], ['cF', '承載層 c', 'tf/m²'],
      ['gC', '混凝土 γc', 'tf/m³'], ['gW', '水 γw', 'tf/m³']] },
    { t: '3. 地表超載重及地下水位', f: [
      ['qs', '牆背地表超載 qs', 'tf/m²'],
      ['qsType', '超載性質（配筋載重組合）', '', 'select', [['L', '活載重 L'], ['D', '永久載重（歸 D、H）']]],
      ['hw1r', '牆背水位比 Hw1/H', ''], ['=hw1', '牆背水位 Hw1', 'm'],
      ['hw2', '牆前水位 Hw2（自基底）', 'm', 'opt'], ['=g1', '承載層平均單位重 γ1', 'tf/m³']],
      hint: 'Hw2 空白＝無地下水；正值＝基底以上水深；負值＝水位位於基底以下之深度。γ1 依基礎規範(112) 式(4.3-1)，取基底下 B 深度範圍內平均單位重（水位以下採有效單位重）自動計算。' },
    { t: '4. 載重組合（含配筋規範與強度折減因子）', info: 'combo', f: [
      ['code', '配筋規範', '', 'select', [['hw', '公路橋梁設計規範'], ['c112', '112年建築物基礎構造設計規範']]]],
      hint: '係數依所選規範自動帶入。公路橋梁設計規範：第3.23節表3.3。112年建築物基礎構造設計規範：第2.11節規定基礎構材以極限強度法設計時依「建築構造編」辦理，載重組合依112年建築物混凝土結構設計規範表5.3.1及第5.3.6、5.3.7節。組合內容見下表。' },
    { t: '5. 材料設計強度及保護層', f: [['fc', "混凝土 fc'", 'kgf/cm²'], ['fy', '鋼筋 fy', 'kgf/cm²'], ['cover', "保護層 d'", 'cm']] },
    { t: '6. 地震係數', f: [
      ['pgaH', '地表水平向尖峰加速度 PGAh', 'g'], ['pgaV', '地表垂直向尖峰加速度 PGAv', 'g'],
      ['khRes', '牆體側向位移完全受限', '', 'bool'], ['=khS', 'kh 建議值', ''], ['=kvS', 'kv 建議值', ''],
      ['kh', '水平向地震係數 kh（採用）', ''], ['kv', '垂直向地震係數 kv（採用）', ''],
      ['mvm', '牆體變位模式', '', 'select', [['rotBase', '對牆底旋轉'], ['slide', '滑移'], ['rotTop', '對牆頂旋轉']]]],
      hint: '基礎規範(112) 第7.3.4節解說3：kh 取地表水平向尖峰加速度之半，側向位移完全受限取 1.5 倍；kv 取垂直向之半，遠距離地震可令 kv = 0。可參考建築物耐震設計規範設計地震（475年回歸期）EPA。變位模式決定動態土壓力作用點（解說2）。' },
    { t: '7. 安全係數', f: [
      ['fss_n', '抗滑動（常時）', ''], ['fss_e', '抗滑動（地震）', ''], ['fso_n', '抗傾覆（常時）', ''],
      ['fso_e', '抗傾覆（地震）', ''], ['fsb_n', '抗承載（常時）', ''], ['fsb_e', '抗承載（地震）', '']] },
    { t: '8. 土壓力參數', f: [
      ['deltaR', '常時牆背摩擦角比 δ/ϕ', ''], ['=dN', '常時 δ', '度'],
      ['deltaRE', '地震時牆背摩擦角比 δ/ϕ', ''], ['=dE', '地震時 δ', '度'],
      ['kam', 'Ka 計算方法', '', 'select', [['coulomb', 'Coulomb'], ['rankine', 'Rankine']]],
      ['kaOvr', 'Ka 指定值（空白=計算）', '', 'opt'],
      ['kaeOvr', 'KAE 指定值（空白=計算）', '', 'opt'],
      ['kpm', 'Kp 計算方法', '', 'select', [['rankine', 'Rankine'], ['coulomb', 'Coulomb'], ['ck', 'Caquot-Kerisel']]],
      ['kpem', 'KPE 計算方法', '', 'select', [['mo', 'Mononobe-Okabe'], ['rankine', 'Rankine（擬靜態）'], ['rankine0', 'Rankine']]],
      ['deltaP', '被動牆面摩擦角 δp', '度'], ['kpOvr', 'Kp 指定值（空白=計算）', '', 'opt'], ['kpeOvr', 'KPE 指定值（空白=計算）', '', 'opt']],
      hint: 'Ka — Coulomb：式(7.3-5)，背填土 ϕ、δ、牆背 θ、地表 α；Rankine：式(7.3-6) tan²(45−ϕ/2)（規範限地表水平、牆背垂直、不計牆面摩擦；地表傾斜時採 Rankine 傾斜地表式，合力平行地表）；亦可指定 Caquot-Kerisel 查圖值。地震時 KAE 依式(7.3-12)，亦可指定。<br>Kp — Rankine：tan²(45+ϕ/2)；Coulomb：承載層 ϕ、δp（建議 ≤ ϕ/3）；Caquot-Kerisel：依第7.3.3節，以圖-解7.3-1（NAVFAC DM7.2）折減係數 R 計算，Kp = R·Kp(δ/ϕ=−1)，δp 不宜大於 2ϕ/3。地震時 KPE 依式(7.3-14)，亦可指定。' },
    { t: '9. 擋土牆配筋設計', bars: true }

  ];

  const form = document.getElementById('form');
  function buildForm() {
    form.innerHTML = '';
    for (const g of G) {
      const d = document.createElement(g.plain ? 'div' : 'details'); d.className = g.plain ? 'grp plain' : 'grp'; if (g.open) d.open = true;
      if (!g.plain) d.innerHTML = `<summary>${g.t}</summary>`;
      const box = document.createElement('div'); box.className = 'fields';
      if (g.hint) box.insertAdjacentHTML('beforeend', `<p class="hint">${g.hint}</p>`);
      if (g.info && !g.f) {
        box.insertAdjacentHTML('beforeend', `<div id="${g.info}"></div>`);
      } else if (g.bars) {
        const rows = [['S1', '牆身主筋（全高）', true], ['S2', '牆身補強（自牆底長）', true], ['S3', '牆身補強（自牆底長）', true],
          ['S4', '踵版上層 S4、S6'], ['S5', '趾版下層 S5、S7'], ['S8', '暴露面垂直筋'], ['T1', '牆身水平筋（每面）'], ['T2', '基礎溫度筋（每面）']];
        let h = '<div class="scroll"><table class="bars"><thead><tr><th>編號</th><th>長度 m</th><th>號數 D</th><th>間距 cm</th></tr></thead><tbody>';
        for (const [k, desc, hasL] of rows) {
          h += `<tr><td title="${desc}">${k}<br><span class="u hint">${desc}</span></td>
            <td>${hasL ? `<input data-bar="${k}" data-f="L" inputmode="decimal" value="${P.bars[k].L}">` : '–'}</td>
            <td><select data-bar="${k}" data-f="D">${Object.keys(RW.BARS).map(b => `<option ${+b === +P.bars[k].D ? 'selected' : ''}>${b}</option>`).join('')}</select></td>
            <td><input data-bar="${k}" data-f="s" inputmode="decimal" value="${P.bars[k].s}"></td></tr>`;
        }
        box.insertAdjacentHTML('beforeend', h + '</tbody></table></div>');
      } else {
        for (const [k, lab, unit, type, opts] of g.f) {
          const id = 'in_' + k.replace('=', 'c_');
          let ctl;
          if (k.startsWith('=')) ctl = `<span class="calc" id="${id}"></span>`;
          else if (type === 'select') ctl = `<select id="${id}" data-k="${k}">${opts.map(([v, t]) => `<option value="${v}" ${P[k] === v ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
          else if (type === 'bool') ctl = `<select id="${id}" data-k="${k}" data-type="bool"><option value="1" ${P[k] ? 'selected' : ''}>是</option><option value="0" ${!P[k] ? 'selected' : ''}>否</option></select>`;
          else if (type === 'text') ctl = `<input id="${id}" data-k="${k}" data-type="text" value="${P[k] ?? ''}" style="text-align:left">`;
          else ctl = `<input id="${id}" data-k="${k}" ${type === 'opt' ? 'data-type="opt"' : ''} inputmode="decimal" value="${fmtIn(P[k])}">`;
          box.insertAdjacentHTML('beforeend', `<div class="f${type === 'select' ? ' wide' : ''}"><label for="${id}">${k.startsWith('=') && lab.includes(' = ') ? lab.replace(/ = (.*)$/, '<span class="rel">= $1</span>') : lab}</label>${ctl}${type === 'select' ? '' : `<span class="u">${unit}</span>`}</div>`);
        }
        if (g.info) box.insertAdjacentHTML('beforeend', `<div id="${g.info}"></div><p class="hint">載重係數與強度折減因子依所選配筋規範自動帶入，免輸入。</p>`);
      }
      d.appendChild(box); form.appendChild(d);
    }
  }
  function fmtIn(v) { if (v === null || v === undefined || v === '') return ''; return Math.abs(v - 1 / 3) < 1e-9 ? '0.3333' : Math.abs(v - 2 / 3) < 1e-9 ? '0.6667' : v; }

  form.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.bar) {
      const v = parseFloat(el.value); if (!isFinite(v)) return;
      P.bars[el.dataset.bar][el.dataset.f] = v;
    } else if (el.dataset.k) {
      const k = el.dataset.k, t = el.dataset.type;
      if (t === 'text') P[k] = el.value;
      else if (t === 'bool') P[k] = el.value === '1';
      else if (el.tagName === 'SELECT') P[k] = el.value;
      if (k === 'preset') { applyPreset(el.value); save(); buildForm(); fmtSymbols(form); run(); return; }
      if (DIMK.includes(k) && P.preset) { P.preset = ''; const ps = document.getElementById('in_preset'); if (ps) ps.value = ''; }
      if (t === 'text' || t === 'bool' || el.tagName === 'SELECT') { /* 已處理 */ }
      else if (t === 'opt') P[k] = el.value.trim() === '' ? null : parseFloat(el.value);
      else { const v = parseFloat(el.value); if (!isFinite(v)) return; P[k] = v; }
    }
    save(); run();
  });

  // ---------- helpers ----------
  const n = (v, d = 2) => (v === null || v === undefined || !isFinite(v)) ? '–' : (+v).toFixed(d);
  const tag = ok => `<span class="tag ${ok ? 'ok' : 'ng'}">${ok ? 'OK' : 'NG'}</span>`;
  const eq = (lab, v, u = '', key = false) => `<div class="eq${key ? ' key' : ''}"><span>${lab}</span><span class="v">${v}</span><span class="u">${u}</span></div>`;

  // ---------- 直式公式（MathML） ----------
  const mT = str => str.replace(/(sin|cos|tan)(²)?|([A-Za-zα-ωϕ])|(\d+)|(.)/g, (m, fn, sq, v, d, op) =>
    fn ? (sq ? `<msup><mi>${fn}</mi><mn>2</mn></msup>` : `<mi>${fn}</mi>`) + '<mspace width="0.08em"/>' :
      v ? `<mi>${v}</mi>` : d ? `<mn>${d}</mn>` : '()'.includes(op) ? `<mo stretchy="false" lspace="0" rspace="0">${op}</mo>` : `<mo>${op}</mo>`);
  const mFrac = (a, b) => `<mfrac><mrow>${a}</mrow><mrow>${b}</mrow></mfrac>`;
  const mBox = (sign, num, den) => `<msup><mrow><mo>[</mo><mn>1</mn><mo>${sign}</mo><msqrt><mfrac displaystyle="true"><mrow>${mT(num)}</mrow><mrow>${mT(den)}</mrow></mfrac></msqrt><mo>]</mo></mrow><mn>2</mn></msup>`;
  const fx = (lhs, body, tag) => `<div class="fx"><math display="block"><mrow><msub><mi>K</mi><mi>${lhs}</mi></msub><mo>=</mo>${body}</mrow></math><span class="u">${tag}</span></div>`;
  // 表格內行內直式公式
  const mK = (sub, body) => `<math displaystyle="true"><mrow><msub><mi>K</mi><mi mathvariant="normal">${sub}</mi></msub><mo>=</mo>${body}</mrow></math>`;
  const mTan2 = sign => `<msup><mi>tan</mi><mn>2</mn></msup><mo>(</mo><mn>45</mn><mo>°</mo><mo>${sign}</mo><mfrac><mi>ϕ</mi><mn>2</mn></mfrac><mo>)</mo>`;
  const B_KA = mFrac(mT('cos²(ϕ−θ)'), mT('cos²θ·cos(δ+θ)') + mBox('+', 'sin(ϕ+δ)·sin(ϕ−α)', 'cos(δ+θ)·cos(θ−α)'));
  const B_KAE = mFrac(mT('cos²(ϕ−θ−φ)'), mT('cosφ·cos²θ·cos(δ+φ+θ)') + mBox('+', 'sin(ϕ+δ)·sin(ϕ−φ−α)', 'cos(δ+φ+θ)·cos(θ−α)'));
  const B_KP = mFrac(mT('cos²(ϕ+θ)'), mT('cos²θ·cos(δ−θ)') + mBox('−', 'sin(ϕ+δ)·sin(ϕ+α)', 'cos(δ−θ)·cos(α−θ)'));
  const B_KPE = mFrac(mT('cos²(ϕ+θ−φ)'), mT('cosφ·cos²θ·cos(δ−θ+φ)') + mBox('−', 'sin(ϕ+δ)·sin(ϕ−φ+α)', 'cos(δ−θ+φ)·cos(α−θ)'));
  const SQ = `<msqrt>${mT('cos²α−cos²ϕ')}</msqrt>`;
  const B_KAR = mT('cosα·') + mFrac(mT('cosα−') + SQ, mT('cosα+') + SQ);
  const FX_KAE = fx('AE', mFrac(mT('cos²(ϕ−θ−φ)'), mT('cosφ·cos²θ·cos(δ+φ+θ)') + mBox('+', 'sin(ϕ+δ)·sin(ϕ−φ−α)', 'cos(δ+φ+θ)·cos(θ−α)')), '式(7.3-12)');
  const B_KPER = mFrac(mT('cos²(ϕ−φ)'), mT('cos²φ') + mBox('−', 'sinϕ·sin(ϕ−φ)', 'cosφ'));
  const FX_KPER = fx('PE', B_KPER, '擬靜態 Rankine（式(7.3-14) 令 δ = θ = α = 0）');
  const FX_KPE = fx('PE', mFrac(mT('cos²(ϕ+θ−φ)'), mT('cosφ·cos²θ·cos(δ−θ+φ)') + mBox('−', 'sin(ϕ+δ)·sin(ϕ−φ+α)', 'cos(δ−θ+φ)·cos(α−θ)')), '式(7.3-14)');

  // ---------- drawings ----------
  let mode = 'n';
  function drawSection(o) {
    document.getElementById('section').innerHTML = RWDraw.loads(o, mode);
    document.getElementById('dims').innerHTML = RWDraw.dims(o);
  }
  document.querySelectorAll('.seg button').forEach(b => b.onclick = () => {
    mode = b.dataset.mode;
    document.querySelectorAll('.seg button').forEach(x => x.classList.toggle('on', x === b));
    drawSection(o); fmtSymbols(document.querySelector('.figs'));
  });

  // ---------- summary ----------
  function sumTable(X, elim) {
    return `<div class="scroll"><table class="kv"><thead><tr><th>項目</th><th>計算值</th><th>規定</th><th></th></tr></thead><tbody>
      <tr><td>抗傾覆 FS</td><td class="num">${n(X.FSo)}</td><td class="num">≥ ${n(X.fso, 1)}</td><td>${tag(X.okO)}</td></tr>
      <tr><td>偏心 e (m)</td><td class="num">${n(X.e)}</td><td class="num">≤ B/${elim} = ${n(o.g.B / elim)}</td><td>${tag(X.okE)}</td></tr>
      <tr><td>抗承載 FS</td><td class="num">${n(X.FSb)}</td><td class="num">≥ ${n(X.fsb, 1)}</td><td>${tag(X.okB)}</td></tr>
      <tr><td>抗滑動 FS</td><td class="num">${n(X.FSs)}</td><td class="num">≥ ${n(X.fss, 1)}</td><td>${tag(X.okS)}</td></tr>
      <tr><td>地盤最大反力 (tf/m²)</td><td class="num">${n(X.qmax)}</td><td class="num">qu = ${n(X.qu)}</td><td></td></tr>
    </tbody></table></div>`;
  }
  let o;
  function summary() {
    const v = document.getElementById('verdict');
    v.className = 'verdict ' + (o.allOK ? 'ok' : 'ng');
    v.innerHTML = `<span>${o.allOK ? '✔ 全部檢核 OK' : '✘ 有 NG 項目，請調整尺寸或配筋'}</span><small>${P.id || ''}　H = ${n(P.H)} m　B = ${n(o.g.B)} m</small>`;
    document.getElementById('sumN').innerHTML = sumTable(o.n, 6);
    document.getElementById('sumE').innerHTML = sumTable(o.e, 3);
    let h = `<div class="scroll"><table class="kv"><thead><tr><th>位置</th><th>Vu / φVc (tf)</th><th>Mu (tf·m)</th><th>As 需 / 配 (cm²)</th><th></th></tr></thead><tbody>`;
    for (const r of o.rc) h += `<tr><td>${r.desc}</td><td class="num">${n(r.Vu)} / ${n(r.pVc)}</td><td class="num">${n(r.Mu)}</td><td class="num">${n(r.Asr)} / ${n(r.Asp)}</td><td>${tag(r.okV && r.okM)}</td></tr>`;
    for (const m of o.min) h += `<tr><td>${m.k}</td><td class="num">–</td><td class="num">–</td><td class="num">${n(m.Asr)} / ${n(m.Asp)}</td><td>${tag(m.ok)}</td></tr>`;
    document.getElementById('sumRC').innerHTML = h + '</tbody></table></div>';
  }

  // ---------- report ----------
  function forceTable(rows, ext, kind) {
    let h = `<div class="scroll"><table class="t"><thead><tr><th>項目</th><th>V (tf)</th><th>H (tf)</th><th>x (m)</th><th>y (m)</th><th>Mr (tf·m)</th><th>Md (tf·m)</th></tr></thead><tbody>`;
    if (kind === 'e') h += `<tr><td>Σ(1)~(13) 自重</td><td>${n(o.SW)}</td><td>–</td><td>–</td><td>–</td><td>${n(o.SWx)}</td><td>–</td></tr>`;
    for (const it of rows) {
      if (kind === 'n') h += `<tr><td>${it.name}</td><td>${n(it.W)}</td><td>–</td><td>${n(it.x)}</td><td>${n(it.y)}</td><td>${n(it.W * it.x)}</td><td>–</td></tr>`;
      else h += `<tr><td>${it.name.replace(')', ")'")}</td><td>${n(-P.kv * it.W)}</td><td>${n(P.kh * it.W)}</td><td>${n(it.x)}</td><td>${n(it.y)}</td><td>${n(-P.kv * it.W * it.x)}</td><td>${n(P.kh * it.W * it.y)}</td></tr>`;
    }
    for (const x of ext) h += `<tr><td>${x.name}</td><td>${x.V !== undefined ? n(x.V) : '–'}</td><td>${x.H !== undefined ? n(x.H) : '–'}</td><td>${x.x !== undefined ? n(x.x) : '–'}</td><td>${x.y !== undefined ? n(x.y) : '–'}</td><td>${x.V !== undefined ? n(x.V * x.x) : '–'}</td><td>${x.H !== undefined ? n(x.H * x.y) : '–'}</td></tr>`;
    const X = kind === 'n' ? o.n : o.e;
    h += `<tr class="sum"><td>Σ</td><td>${n(X.SV)}</td><td>${n(X.SH)}</td><td></td><td></td><td>${n(X.Mr)}</td><td>${n(X.Md)}</td></tr></tbody></table></div>`;
    return h;
  }
  function stabReport(X, no, elim, kp, kfx = '') {
    const slideHead = `<h3>${no}.4 抗滑動檢核（設止滑榫）</h3>${kfx}`;
    const ok = (b, s) => `${s}　${b ? 'OK!' : 'NG!'}`;
    return `<h3>${no}.2 抗傾覆檢核</h3>
      ${eq('FS = Mr / Md = ' + n(X.Mr) + ' / ' + n(X.Md), n(X.FSo), ok(X.okO, '≥ ' + n(X.fso, 1)), true)}
      ${eq('e = B/2 − (Mr − Md)/ΣV', n(X.e), ok(X.okE, `B/${elim}=${n(o.g.B / elim)}`) , true)}
      <h3>${no}.3 抗承載檢核（建築物基礎構造設計規範(112) 式(4.3-1)、表4.3-1、表4.3-2）</h3>
      <div class="scroll"><table class="t"><thead><tr><th></th><th>γ1 (tf/m³)</th><th>ϕ (度)</th><th>c (tf/m²)</th><th>Fcd</th><th>Fci</th><th>Fqd</th><th>Fqi</th><th>Frd</th><th>Fri</th></tr></thead>
      <tbody><tr><td>承載層</td><td>${n(X.g1)}</td><td>${n(P.phiF, 1)}</td><td>${n(P.cF)}</td><td>${n(X.Fcd)}</td><td>${n(X.Fci)}</td><td>${n(X.Fqd)}</td><td>${n(X.Fci)}</td><td>${n(X.Fqd)}</td><td>${n(X.Fri)}</td></tr></tbody></table></div>
      ${eq(`Nc = ${n(X.Nc, 1)}，Nq = ${n(X.Nq, 1)}，Nγ = ${n(X.Nr, 1)}（表4.3-1，ϕ = ${X.phiT}°）`, '', '')}
      ${eq('載重傾角 β = atan(ΣH/ΣV)', n(X.beta), '度')}
      ${(() => { const Y = o.g.Y, hw = Math.min(Y, o.g.h2);
        return hw > 0
          ? eq(`q = γ2·Df' = γ·(Y − hw) + (γ − γw)·hw = ${n(P.gF)} × ${n(Y)} − ${n(P.gW)} × ${n(hw)}（Df' = Y = Df + D2，hw = min(Y, Hw2)）`, n(X.q), 'tf/m²')
          : eq(`q = γ2·Df' = ${n(P.gF)} × ${n(Y)}（Df' = Y = Df + D2）`, n(X.q), 'tf/m²'); })()}
      ${eq('qu = c·Nc·Fcd·Fci + q·Nq·Fqd·Fqi + ½·γ1·B·Nγ·Frd·Fri', n(X.qu), 'tf/m²', true)}
      <p class="note">擋土牆為條形基礎（B/L ≈ 0），形狀影響因素 Fcs = Fqs = Fγs = 1.0（表4.3-2），式中省略。</p>
      ${(() => {
        const B = o.g.B, sv = n(X.SV), e = n(X.e, 3), b = n(B);
        if (Math.abs(X.e) <= B / 6) return eq(`qt（趾端）= ΣV/B·(1 + 6e/B) = ${sv}/${b} × (1 + 6×${e}/${b})`, n(X.qt), 'tf/m²')
          + eq(`qh（踵端）= ΣV/B·(1 − 6e/B) = ${sv}/${b} × (1 − 6×${e}/${b})`, n(X.qh), 'tf/m²');
        if (X.e > 0) return eq(`qt（趾端）= 2ΣV / [3(B/2 − e)] = 2×${sv} / [3×(${b}/2 − ${e})]　※ e > B/6 採三角形分布`, n(X.qt), 'tf/m²')
          + eq('qh（踵端）= 0（e > B/6，踵端與地盤分離）', n(X.qh), 'tf/m²');
        return eq('qt（趾端）= 0（e < −B/6，趾端與地盤分離）', n(X.qt), 'tf/m²')
          + eq(`qh（踵端）= 2ΣV / [3(B/2 + e)] = 2×${sv} / [3×(${b}/2 + ${e})]　※ |e| > B/6 採三角形分布`, n(X.qh), 'tf/m²');
      })()}
      ${eq('FS = qu / max(qt, qh)', n(X.FSb), ok(X.okB, '≥ ' + n(X.fsb, 1)), true)}
      ${slideHead}
      <div class="sidefig"><div class="sf-main"><p class="note">設置剪力榫時，潛在滑動面為止滑榫前端之被動受剪區域。</p>
      ${eq(kp, n(X.Kp, 3), '', true)}
      ${eq('止滑榫位置 Kc ／ 尺寸 Kd', n(P.Kc) + ' / ' + n(P.Kd), 'm')}
      ${eq('趾地覆土深度 D = Y + Kd', n(o.g.Y + P.Kd), 'm')}
      ${eq(o.hw2 === null || o.g.Y + P.Kd <= o.g.Y - o.hw2 ? '被動區單位重 γp' : '被動區等效單位重 γp（依水位分段計算有效應力）', n(X.gp), 'tf/m³')}
      ${eq('Pp = γp(Y + Kd/2)·Kp·Kd', n(X.Pp), 'tf')}
      ${eq("L' = B − 2|e|", n(X.Lp), 'm')}
      ${eq('L1 = min(Kc, Kd/tan(45−ϕ/2))', n(X.L1), 'm')}
      ${eq("V1 = L1/L'·ΣV", n(X.V1), 'tf')}
      ${eq('V2 = ΣV − V1', n(X.V2), 'tf')}
      ${eq('ΣHu = V1·tanϕ + V2·tan(2ϕ/3) + (c/2)·B + 50%·Pp', n(X.Hu), 'tf')}
      ${eq('ΣHd', n(X.SH), 'tf')}
      ${eq('FS = ΣHu / ΣHd', n(X.FSs), ok(X.okS, '≥ ' + n(X.fss, 1)), true)}</div><div class="sf-fig">${RWDraw.slide()}</div></div>`;
  }
  function rcReport(r) {
    return `<h4>${r.title}</h4>
      ${r.z !== null ? eq('斷面位置 z（自牆頂）', n(r.z), 'm') : ''}
      ${eq('斷面厚度 t ／ 有效深度 d', n(r.t, 1) + ' / ' + n(r.d), 'cm')}
      ${eq('常時 V ／ M', n(r.Vn) + ' / ' + n(r.Mn), 'tf, tf·m')}
      ${eq('地震時 V ／ M', n(r.Ve) + ' / ' + n(r.Me), 'tf, tf·m')}
      ${eq(`常時 Vu：${o.cf.combN} ／ 地震時 Vu：${o.cf.combE}`, n(r.Vun) + ' / ' + n(r.Vue), 'tf/m')}
      ${eq('Vu = max(常時, 地震時)', n(r.Vu), 'tf/m', true)}
      ${eq(`φVc = ${n(o.cf.pv)}×0.53√fc'·b·d`, n(r.pVc), r.okV ? 'φVc≥Vu OK!' : 'φVc<Vu NG!')}
      ${eq(`常時 Mu${o.cf.cn.length > 1 ? '（' + o.cf.cn[r.gn].tag + ' 控制）' : ''} ／ 地震時 Mu${o.cf.ce.length > 1 ? '（' + o.cf.ce[r.ge].tag + ' 控制）' : ''}`, n(r.Mun) + ' / ' + n(r.Mue), 'tf·m/m')}
      ${eq('Mu = max(常時, 地震時)', n(r.Mu), 'tf·m/m', true)}
      ${eq('Rn = Mu/(φb·b·d²)', n(r.Rn, 3), 'kgf/cm²')}
      ${eq("ρ = (1/m)[1 − √(1 − 2mRn/fy)]，m = fy/0.85fc' = " + n(o.m, 3), r.rho > 1 ? '斷面不足' : n(r.rho, 4), '')}
      ${eq('ρmin ／ 4ρ/3', n(r.rhoMin, 4) + ' / ' + n(r.rho43, 4), '')}
      ${eq('As = ρ·b·d', n(r.Asr), 'cm²/m', true)}
      ${eq(`As'（${r.desc}）`, n(r.Asp), r.okM ? "As'≥As OK!" : "As'<As NG!", true)}`;
  }
  function barTable() {
    const rows = [['S1', '牆身主筋'], ['S2', '牆身補強'], ['S3', '牆身補強'], ['S4', '踵版上層 S4、S6'], ['S5', '趾版下層 S5、S7'], ['S8', '暴露面垂直筋'], ['T1', '牆身水平筋'], ['T2', '基礎溫度筋']];
    return `<div class="scroll"><table class="t"><thead><tr><th>編號</th><th>說明</th><th>長度 (m)</th><th>號數</th><th>間距 (cm)</th><th>As (cm²/m)</th></tr></thead><tbody>${rows.map(([k, d]) => `<tr><td>${k}</td><td style="text-align:left">${d}</td><td>${P.bars[k].L !== undefined ? n(P.bars[k].L) : '–'}</td><td>D${P.bars[k].D}</td><td>${P.bars[k].s}</td><td>${n(o.bar[k].As)}</td></tr>`).join('')}</tbody></table></div>`;
  }
  // 1.8 土壓力係數彙整：KA、KAE、KP、KPE 之計算方法／公式／參數／數值
  function kTable() {
    const p = P, N = o.n, Q = o.e, d1 = v => n(v, 1) + '°';
    const pa = `ϕ = ${d1(N.phi)}、δ = ${d1(N.delta)}、θ = ${d1(N.theta)}、α = ${d1(N.alpha)}`;
    const ka = N.kaOvr ? ['指定值', '—', '—']
      : p.kam === 'rankine'
        ? (N.alpha === 0 ? ['Rankine，式(7.3-6)', mK('A', mTan2('−')), `ϕ = ${d1(N.phi)}`]
          : ['Rankine（地表傾斜）', mK('A', B_KAR), `ϕ = ${d1(N.phi)}、α = ${d1(N.alpha)}`])
        : ['Coulomb，式(7.3-5)', mK('A', B_KA), pa];
    const kae = Q.kaeOvr ? [`指定值（式(7.3-12) 計算值 = ${n(Q.KaeCalc, 3)}）`, '—', '—']
      : ['Mononobe-Okabe，式(7.3-12)', mK('AE', B_KAE),
        `ϕ = ${d1(N.phi)}、δ = ${d1(Q.delta)}（地震時）、θ = ${d1(N.theta)}、α = ${d1(N.alpha)}、φ = tan⁻¹[kh/(1−0)] = ${n(Q.vphi)}°（kv 取 0）`];
    const pf = `ϕ = ${d1(p.phiF)}（承載層）`;
    const kp = N.kpOvr ? ['指定值', '—', '—']
      : p.kpm === 'coulomb' ? ['Coulomb', mK('P', B_KP), `${pf}、δp = ${d1(p.deltaP)}、θ = α = 0°`]
      : p.kpm === 'ck' ? ['Caquot-Kerisel，第7.3.3節、圖-解7.3-1', mK('P', `<mi>R</mi><mo>·</mo><msub><mi>K</mi><mi mathvariant="normal">P</mi></msub><mo stretchy="false">(</mo><mi>δ</mi><mo>/</mo><mi>ϕ</mi><mo>=</mo><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo>`) + '<br>' + `<math displaystyle="true"><mrow><msub><mi>K</mi><mi mathvariant="normal">P</mi></msub><mo stretchy="false">(</mo><mi>δ</mi><mo>/</mo><mi>ϕ</mi><mo>=</mo><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo><mo>=</mo>${mFrac(mTan2('+'), '<mi>R</mi><mo stretchy="false">(</mo><mi>δ</mi><mo>=</mo><mn>0</mn><mo stretchy="false">)</mo>')}</mrow></math>`,
          `${pf}、δp = ${d1(p.deltaP)}、δ/ϕ = ${n(N.ck.rat, 3)}、R = ${n(N.ck.R, 3)}、KP(δ/ϕ=−1) = ${n(N.ck.Kp1, 3)}`]
      : ['Rankine', mK('P', mTan2('+')), pf];
    const kpe = Q.kpeOvr ? ['指定值', '—', '—']
      : p.kpem === 'rankine0' ? ['Rankine（同常時 Rankine KP，不計地震對被動土壓之折減）', mK('PE', mTan2('+')), pf]
      : p.kpem === 'rankine' ? ['擬靜態 Rankine（式(7.3-14) 令 δ = θ = α = 0；kh = 0 時即 tan²(45° + ϕ/2)）', mK('PE', B_KPER), `${pf}、φ = ${n(Q.vphi)}°`]
      : ['Mononobe-Okabe，式(7.3-14)', mK('PE', B_KPE),
        `${pf}、δ = ${d1(Q.deltaP)}、θ = α = 0°（止滑榫前緣垂直、地表水平）、φ = ${n(Q.vphi)}°`];
    const row = (k, nm, r, v) => `<tr><td style="white-space:nowrap">${k}</td><td style="text-align:left;min-width:7em">${nm}</td><td style="text-align:left;min-width:9em">${r[0]}</td><td class="fxc" style="text-align:left">${r[1]}</td><td style="text-align:left">${r[2]}</td><td><b>${n(v, 3)}</b></td></tr>`;
    return `<div class="scroll"><table class="t"><thead><tr><th style="white-space:nowrap">係數</th><th>說明</th><th>計算方法</th><th>公式</th><th>採用參數</th><th>數值</th></tr></thead><tbody>
      ${row('KA', '常時主動（牆背土壤）', ka, N.Ka)}${row('KAE', '地震時主動（牆背土壤）', kae, Q.Kae)}
      ${row('KP', '常時被動（止滑榫前）', kp, N.Kp)}${row('KPE', '地震時被動（止滑榫前）', kpe, Q.Kp)}</tbody></table></div>
      <p class="note">依據：建築物基礎構造設計規範(112) 第7.3.2～7.3.5節。ϕ 為土壤內摩擦角，δ 為牆面摩擦角，θ 為牆背面與垂直面交角，α 為地表面與水平面交角，φ 為地震合成角。</p>`;
  }
  function report() {
    const p = P, N = o.n, Q = o.e, g = o.g;
    const kpLab = (N.kpOvr ? 'Kp' : p.kpm === 'coulomb' ? `Kp（Coulomb，δp = ${n(p.deltaP, 1)}°）` : p.kpm === 'ck'
      ? `Kp = R·Kp(δ/ϕ=−1)（Caquot-Kerisel，圖-解7.3-1；δp = ${n(p.deltaP, 1)}°，δ/ϕ = ${n(N.ck.rat, 3)}，R = ${n(N.ck.R, 3)}，Kp(δ/ϕ=−1) = tan²(45+ϕ/2)/R(0) = ${n(N.ck.Kp1, 3)}）`
      : 'Kp = tan²(45 + ϕ/2)（Rankine）') + (N.kpOvr ? '（指定值）' : '');
    const kaLab = N.kaOvr ? 'Ka（指定值）' : p.kam === 'rankine'
      ? (N.alpha === 0 ? 'Ka = tan²(45 − ϕ/2)（Rankine，式(7.3-6)）' : 'Ka（Rankine 傾斜地表）')
      : 'Ka（Coulomb，式(7.3-5)）';
    const kaMeth = N.kaOvr ? '指定值' : p.kam === 'rankine' ? 'Rankine' : 'Coulomb';
    const inclLab = !N.kaOvr && p.kam === 'rankine' ? 'α' : 'δ+θ';
    const kpeLab = Q.kpeOvr ? 'KPE（指定值）' : p.kpem === 'rankine0' ? 'KPE = tan²(45 + ϕ/2)（Rankine）' : p.kpem === 'rankine' ? `KPE（擬靜態 Rankine，δ = θ = α = 0，φ = ${n(Q.vphi)}°）` : `KPE（第7.3.5節 Mononobe-Okabe，θ = α = 0，δ = ${n(Q.deltaPE, 1)}°，φ = ${n(Q.vphi)}°）`;
    let h = `<p class="note">${p.id || ''}　H = ${n(p.H)} m</p>
    <h2>1. 設計依據</h2>
    <h3>1.1 材料參數</h3>
    <div class="scroll"><table class="t"><thead><tr><th></th><th>γ (tf/m³)</th><th>ϕ (度)</th><th>c (tf/m²)</th></tr></thead><tbody>
      <tr><td>背填土</td><td>${n(p.gB)}</td><td>${n(p.phiB, 1)}</td><td>${n(p.cB)}</td></tr>
      <tr><td>承載層</td><td>${n(p.gF)}</td><td>${n(p.phiF, 1)}</td><td>${n(p.cF)}</td></tr>
      <tr><td>混凝土</td><td>${n(p.gC)}</td><td>NA</td><td>NA</td></tr></tbody></table></div>
    <h3>1.2 地表超載重及地下水位</h3>
    ${eq('牆背地表超載 qs', n(p.qs), 'tf/m/m')}
    ${eq('超載性質（配筋載重組合）', p.qsType === 'D' ? '永久載重（歸 D、H）' : '活載重 L', '')}
    ${eq(`牆背地下水位 Hw1 = ${n(p.hw1r, 3)} × H`, n(o.hw1), 'm')}
    ${eq('牆前地下水位 Hw2（自基礎底面；負值表示位於基底以下）', o.hw2 === null ? '無地下水' : n(o.hw2), o.hw2 === null ? '' : 'm')}
    ${eq('承載層平均單位重 γ1（基底下 B 範圍）' + (o.hw2 === null || o.g.dw >= o.g.B ? '' : o.g.dw > 0 ? ' = γ′ + (dw/B)·γw' : ' = γ − γw'), n(o.g.g1), 'tf/m³')}
    <h3>1.3 載重組合（${o.cf.name}）</h3>
    <div class="scroll"><table class="t"><thead><tr><th></th><th>穩定分析</th><th>配筋設計</th></tr></thead><tbody>
      <tr><td>常時</td><td>D+L+H+F</td><td>${o.cf.combN}</td></tr>
      <tr><td>地震時</td><td>D+L+H+F+EQ</td><td>${o.cf.combE}</td></tr></tbody></table></div>
    <p class="note">D：靜載重（含踵版上土重、超載重）；H：側向土壓力（含超載側壓）；F：水壓力；EQ：地震力（動態土壓增量、牆體慣性力、動水壓）。${P.code === 'hw' ? '地震時（表3.3 分類Ⅶ）浮力 B 欄 β＝1，靜水壓與揚壓力 F 以 1.3 計入；Westergaard 動水壓屬 EQ。' : ''}</p>
    ${eq('強度折減因子：彎矩 φb ／ 剪力 φv', n(o.cf.pb) + ' / ' + n(o.cf.pv), '')}
    <h3>1.4 材料設計強度</h3>
    ${eq("混凝土強度 fc'", n(p.fc, 0), 'kgf/cm²')}${eq('鋼筋降伏強度 fy', n(p.fy, 0), 'kgf/cm²')}
    <h3>1.5 地震係數</h3>
    ${eq('地表水平向 ／ 垂直向尖峰加速度 PGAh ／ PGAv', n(p.pgaH, 3) + ' / ' + n(p.pgaV, 3), 'g')}
    ${eq(`kh 建議值 = ${p.khRes ? '1.5' : '0.5'} × PGAh${p.khRes ? '（側向位移完全受限）' : ''} ／ kv 建議值 = 0.5 × PGAv`, n(o.khS, 3) + ' / ' + n(o.kvS, 3), '')}
    ${eq('採用 kh ／ kv', n(p.kh, 3) + ' / ' + n(p.kv, 3), p.kh < o.khS - 1e-9 ? '※ kh 小於規範解說建議值' : '')}
    ${eq('牆體變位模式', o.mv.name, '')}
    <p class="note">依建築物基礎構造設計規範(112) 第7.3.4節解說3。</p>
    <h3>1.6 安全係數</h3>
    <div class="scroll"><table class="t"><thead><tr><th></th><th>常時</th><th>地震時</th></tr></thead><tbody>
      <tr><td>抗滑動</td><td>${n(p.fss_n, 1)}</td><td>${n(p.fss_e, 1)}</td></tr>
      <tr><td>抗傾覆</td><td>${n(p.fso_n, 1)}</td><td>${n(p.fso_e, 1)}</td></tr>
      <tr><td>抗承載</td><td>${n(p.fsb_n, 1)}</td><td>${n(p.fsb_e, 1)}</td></tr></tbody></table></div>
    <p class="note">依建築物基礎構造設計規範(112) 第7.4.1節（滑動）、第7.4.2節（傾覆）、第7.4.3節（支承力）；公路橋梁設計規範 第6.2.8節。</p>
    <h3>1.7 保護層</h3>${eq("保護層厚度 d'", n(p.cover, 1), 'cm')}
    <h3>1.8 土壓力參數</h3>${eq('牆背摩擦角比 δ/ϕ：常時 ／ 地震時', n(p.deltaR, 3) + ' / ' + n(p.deltaRE, 3), '')}${eq('牆背摩擦角 δ：常時 ／ 地震時', n(N.delta, 1) + ' / ' + n(Q.delta, 1), '度')}${kTable()}${p.kpm === 'ck' && !N.ck.inRange ? '<p class="note">※ 承載層 ϕ 超出圖-解7.3-1 表列範圍（10°～45°），以邊界值計算。</p>' : ''}${p.kpm !== 'rankine' && p.deltaP > 2 * p.phiF / 3 ? '<p class="note">※ δp 大於 2ϕ/3，第7.3.3節解說3規定設計採用之牆面摩擦角不宜大於 2ϕ/3。</p>' : ''}

    <h2>2. 擋土牆設計尺寸及分析結果</h2>
    <h3>2.1 擋土牆設計尺寸</h3>
    <div class="dimrow"><div class="dimtab">    <div class="scroll"><table class="t"><tbody>
      ${[['(1) 牆體全高 H', p.H], ['(2) 牆身頂寬 T', p.T], ['(3) 牆身高度 h = H − D1 − D2', g.h], ['(4) 基礎寬度 B = C + S + E', g.B], ['(5) 基礎趾長 C', p.C],
        ['(6) 牆身底寬 S', p.S], ['(7) 基礎踵長 E', p.E], ['(8) 基礎上高 D1', p.D1], ['(9) 基礎下高 D2', p.D2], ['(10) 牆背斜率 η = (S − T)/h', g.eta],
        ['(11) 止滑榫尺寸 Kd', p.Kd], ['(12) 止滑榫位置 Kc', p.Kc], ['(13) 趾版覆土 Df', p.Df], ['(14) 牆前回填 Y = Df + D2', g.Y]]
        .map(([a, b]) => `<tr><td>${a}${a.includes('η') ? '' : ' (m)'}</td><td>${n(b, a.includes('η') ? 3 : 2)}</td></tr>`).join('')}
      <tr><td>(15) 背填坡度</td><td>1 : ${p.n}</td></tr></tbody></table></div></div>
    <div class="dimimg"><div class="dimmask" role="img" aria-label="擋土牆設計尺寸示意圖"></div><img class="dimprint" src="wall-dims-v2.png" alt=""></div></div>
    <h3>2.2 擋土牆配筋設計</h3>${barTable()}
    <h3>2.3 常時，穩定分析結果</h3>${sumTable(N, 6)}
    <h3>2.4 地震時，穩定分析結果</h3>${sumTable(Q, 3)}

    <h2>3. 穩定分析（常時）</h2>
    <p class="note">穩定分析時，將擋土牆本身及趾（踵）版上方之填土視為一整體。</p>
    <h3>3.1 作用力計算</h3>
    <h4>a. 土壓力（${kaMeth === '指定值' ? '主動土壓力係數指定值' : kaMeth + ' 主動土壓力係數'}）</h4>
    ${eq('ϕ ／ δ ／ θ ／ α', `${n(N.phi, 1)} / ${n(N.delta, 1)} / ${n(N.theta, 1)} / ${n(N.alpha, 1)}`, '度')}
    ${eq(kaLab, n(N.Ka, 3), '', true)}
    ${!N.kaOvr && p.kam === 'rankine' && (N.theta !== 0 || N.alpha !== 0) ? '<p class="note">式(7.3-6) 適用於地表水平、牆背垂直且不計牆面摩擦之情況；本例採 Rankine 解，合力平行地表（傾角 α），未計牆面摩擦 δ 與牆背傾角 θ。</p>' : ''}
    ${eq('Pa', n(N.Pa), 'tf/m')}
    ${eq(`Pah = Pa·cos(${inclLab}) ／ ya`, n(N.Pah) + ' / ' + n(N.ya), 'tf, m')}
    ${eq(`Pav = Pa·sin(${inclLab}) ／ xa`, n(N.Pav) + ' / ' + n(N.xa), 'tf, m')}
    <h4>b. 超載重</h4>
    ${eq('Pqh = qs·Ka·H ／ yq', n(N.Pqh) + ' / ' + n(N.yq), 'tf, m')}
    ${eq('Pqv = qs·Ws ／ xq', n(N.Pqv) + ' / ' + n(N.xq), 'tf, m')}
    <h4>c. 水壓力</h4>
    ${eq('Pw ／ yw', n(N.Pw) + ' / ' + n(N.yw), 'tf, m')}
    ${eq('Pb（揚壓力）／ xb', n(N.Pb) + ' / ' + n(N.xb), 'tf, m')}
    <h4>d. 作用力總表</h4><div class="sidefig"><div class="sf-main">${forceTable(o.items, N.ext, 'n')}</div><div class="sf-fig">${RWDraw.blocks()}</div></div>
    ${stabReport(N, 3, 6, kpLab)}

    <h2>4. 穩定分析（地震時）</h2>
    <h3>4.1 動態主動土壓力（建築物基礎構造設計規範(112) 第7.3.4節，Mononobe-Okabe）</h3>
    <p class="note">ϕ 為牆背土壤內摩擦角，φ 為地震合成角；θ 為牆背面與垂直面交角（逆時針為正），α 為牆背地表面與水平面之交角。本法原則上只適用於非凝聚性土壤。</p>
    ${eq(`φ = tan⁻¹[kh/(1−kv)] = tan⁻¹[${n(P.kh, 3)}/(1−0)]（kv ＝ 0）`, n(Q.vphi), '度')}
    <p class="note">註：計算 φ 時 kv 取 0（不採第6節輸入之 kv）。依據：建築物基礎構造設計規範(112) 第7.3.4節【解說】3：「設計所採用之垂直向地震係數 kv，原則上可取基地地表垂直向尖峰加速度值之半估計，惟對於遠距離之地震，通常可忽略垂直地震力之影響，即令 kv ＝ 0。」</p>
    ${eq('ϕ − φ − α', n(Q.crit), Q.okCrit ? '≥ 0 OK!' : '< 0 NG!（背填土失穩，KAE 無解）')}
    ${FX_KAE}
    ${eq('ϕ ／ δ（地震時）／ θ ／ α', `${n(N.phi, 1)} / ${n(Q.delta, 1)} / ${n(N.theta, 1)} / ${n(N.alpha, 1)}`, '度')}
    ${eq(Q.kaeOvr ? `KAE（指定值；式(7.3-12) 計算值 = ${n(Q.KaeCalc, 3)}）` : 'KAE', n(Q.Kae, 3), '', true)}
    ${eq('PAE = ½·γ·H²·(1−kv)·KAE　式(7.3-11)（水位以下採浸水單位重，即 KAE(1−kv)·Σ）', n(Q.Pae), 'tf/m')}
    ${eq('ΔPAE = PAE − PA　式(解7.3-4)', n(Q.dPae), 'tf/m')}
    ${eq('PAEh = PAE·cos(δ+θ) ／ ΔPAEh', n(Q.Paeh) + ' / ' + n(Q.dPaeh), 'tf')}
    ${eq('PAEv = PAE·sin(δ+θ) ／ xae', n(Q.Paev) + ' / ' + n(Q.xae), 'tf, m')}
    ${eq(`合力作用點（${o.mv.name}）` + ({ rotBase: '：H̄ = [PA·yA + ΔPAE·(2H/3)]/PAE　式(解7.3-5)', slide: '：H̄ = [PA(0.42H) + ΔPAE(0.48H)]/PAE　式(解7.3-7)', rotTop: '：H̄ = 0.55H' }[P.mvm] || ''), n(Q.yae), 'm', true)}
    ${P.mvm === 'rotBase' ? `<p class="note">yA = ${n(N.ya)} m 為靜態主動土壓力實際形心（無地下水時即 H/3）。</p>` : ''}
    ${eq('PQEh（超載）／ yqe', n(Q.Pqeh) + ' / ' + n(Q.yqe), 'tf, m')}
    <p class="note">依第7.3.7節第1款，均布超載折算為等值填土高度計算側壓，故地震時超載以 KAE 計算，其動態增量作用點比照 ΔPAE 之變位模式取用。</p>
    ${eq('PWE（含動水壓增量 ΔPWE = (7/12)·kh·γw·Hw1²，作用於 0.4Hw1，第7.3.6節解說3 式(解7.3-8)、(解7.3-9)）／ ywe', n(Q.Pwe) + ' / ' + n(Q.ywe), 'tf, m')}
    <h4>d. 作用力總表</h4><div class="sidefig"><div class="sf-main">${forceTable(o.items, Q.ext, 'e')}</div><div class="sf-fig">${RWDraw.blocks()}</div></div>
    ${stabReport(Q, 4, 3, kpeLab, Q.kpeOvr ? '' : P.kpem === 'rankine0' ? '' : P.kpem === 'rankine' ? FX_KPER : FX_KPE)}

    <h2>5. 配筋設計（USD）</h2>
    <h3>5.1 設計條件</h3>
    <p>1. 牆身與基礎交界為剛性區。2. 牆身、趾版及踵版視為懸臂梁（公路橋梁設計規範 6.2.2、6.2.3）。
    3. 地震時土壓動態增量作用點依牆體變位模式（${o.mv.name}，第7.3.4節解說2，以斷面深度 z 取代 H），並計入牆身慣性力。4. 基礎版依地盤反力分 20 等分條帶積分；配筋時地盤反力以因數化載重（各分項乘載重係數）重新計算。
    5. 載重組合（${o.cf.name}）：常時 ${o.cf.combN}；地震時 ${o.cf.combE}。${o.cf.note ? o.cf.note + (P.qsType === 'D' ? '本案超載視為永久載重，垂直分量歸 D、側壓歸 H。' : '') : ''}多組組合時取最不利者。</p>
    ${eq("m = fy/0.85fc'", n(o.m, 3), '')}${eq('ρmin', n(o.rhoMin, 4), '')}
    <h3>5.2 牆身設計</h3>${o.rc.slice(0, 3).map(rcReport).join('')}
    ${o.min.slice(0, 2).map((m, i) => `<h4>(${i + 4}) ${m.title}</h4>${eq('ρt', n(m.rho, 4), '')}${eq('As = ' + m.basis, n(m.Asr), 'cm²/m', true)}${eq("As'", n(m.Asp), m.ok ? "As'≥As OK!" : "As'<As NG!", true)}`).join('')}
    <h3>5.3 基礎版設計</h3>
    ${eq('q0（超載）／ q1（填土）／ q2（版重）', `${n(o.base.q0)} / ${n(o.base.q1)} / ${n(o.base.q2)}`, 'tf/m²')}
    ${o.rc.slice(3).map(rcReport).join('')}
    ${[o.min[2]].map(m => `<h4>(3) ${m.title}</h4>${eq('ρt', n(m.rho, 4), '')}${eq('As = ' + m.basis, n(m.Asr), 'cm²/m', true)}${eq("As'", n(m.Asp), m.ok ? "As'≥As OK!" : "As'<As NG!", true)}`).join('')}`;
    document.getElementById('report').innerHTML = h;
  }

  function run() {
    try { o = RW.compute(P); } catch (e) { console.error(e); return; }
    for (const [k, v] of [['h', o.g.h], ['B', o.g.B], ['eta', o.g.eta], ['Y', o.g.Y], ['hw1', o.hw1], ['khS', o.khS], ['g1', o.g.g1], ['kvS', o.kvS], ['dN', o.n.delta], ['dE', o.e.delta]]) {
      const el = document.getElementById('in_c_' + k); if (el) el.textContent = n(v, ['eta', 'khS', 'kvS'].includes(k) ? 3 : 2);
    }
    const cb = document.getElementById('combo');
    if (cb) cb.innerHTML = `<table class="kv"><thead><tr><th></th><th>穩定分析</th><th>配筋設計</th></tr></thead><tbody>
      <tr><td>常時</td><td>D+L+H+F</td><td>${o.cf.combN}</td></tr>
      <tr><td>地震時</td><td>D+L+H+F+EQ</td><td>${o.cf.combE}</td></tr></tbody></table>
      <p class="hint">D=靜載重　L=活載重　H=土壓力　F=水壓力　EQ=地震力${o.cf.note ? '<br>' + o.cf.note : ''}</p>
      <table class="kv"><tbody><tr><td>強度折減因子 φb ／ φv</td><td class="num">${n(o.cf.pb)} / ${n(o.cf.pv)}</td></tr></tbody></table>`;
    summary(); drawSection(o); report();
    fmtSymbols(document.querySelector('.right')); fmtSymbols(document.getElementById('combo'));
  }

  // ---------- actions ----------
  document.getElementById('btnPrint').onclick = () => window.print();
  document.getElementById('btnReset').onclick = () => { P = clone(RW.DEFAULTS); save(); buildForm(); fmtSymbols(form); run(); };
  document.getElementById('btnSave').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(P, null, 2)], { type: 'application/json' }));
    a.download = (P.id || 'retaining-wall') + '.json'; a.click(); URL.revokeObjectURL(a.href);
  };
  document.getElementById('fileLoad').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then(t => { P = fix(Object.assign(clone(RW.DEFAULTS), JSON.parse(t))); save(); buildForm(); fmtSymbols(form); run(); }).catch(() => alert('檔案格式錯誤'));
    e.target.value = '';
  };
  document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => {
    document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b));
    document.querySelectorAll('.pane').forEach(x => x.classList.toggle('on', x.id === 'pane-' + b.dataset.tab));
    window.scrollTo(0, 0);
  });

  function setTop() {
    const t = document.querySelector('.topbar');
    const fixed = getComputedStyle(t).position === 'sticky';
    document.documentElement.style.setProperty('--topbar-h', (fixed ? t.offsetHeight + 16 : 16) + 'px');
  }
  window.addEventListener('resize', setTop);
  // theme toggle: auto -> light -> dark
  const TH = ['auto', 'light', 'dark'], THL = { auto: '◐ 自動', light: '☀ 淺色', dark: '☾ 深色' };
  let theme = 'auto';
  try { theme = localStorage.getItem('rw-theme') || 'auto'; } catch (e) {}
  const applyTheme = () => {
    if (theme === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('btnTheme').textContent = THL[theme];
  };
  document.getElementById('btnTheme').onclick = () => {
    theme = TH[(TH.indexOf(theme) + 1) % 3];
    try { localStorage.setItem('rw-theme', theme); } catch (e) {}
    applyTheme();
  };
  applyTheme();
  buildForm(); fmtSymbols(form); run(); setTop();
})();
