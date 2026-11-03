/* 介面：輸入表單、結果摘要、斷面圖、計算書 */
(function () {
  const KEY = 'rw-cantilever-v1';
  const clone = o => JSON.parse(JSON.stringify(o));
  let P = load() || clone(RW.DEFAULTS);

  function load() {
    try { const s = localStorage.getItem(KEY); if (s) { const raw = JSON.parse(s); return fix(Object.assign(clone(RW.DEFAULTS), raw), raw); } } catch (e) {}
    return null;
  }
  function fix(q, raw = q) {
    if (!['coulomb', 'ck', 'ckc'].includes(q.kpm)) q.kpm = 'rankine';
    delete q.deltaP;   // 已移除「被動牆面摩擦角 δp」，改採 δ
    if ('wt' in q) { if (!q.wt && +q.hw2 === 0) q.hw2 = null; delete q.wt; }   // 已移除「基底位於地下水位下」，改由 Hw2 判斷
    if (raw.Sf === undefined) { delete q.Sf; delete q.Sb; RW.syncDims(q); }   // 改以 S1、S2 輸入
    delete q.qsType;   // 超載一律為活載重 L
    if (q.heelSino === undefined) q.heelSino = true;
    if (!raw.rcVer) { Object.assign(q, { dStemN: 0.5, dStemE: 0, stemCos: false, stemInert: false, upMode: 'uni' }); q.rcVer = 1; }   // 配筋預設值更新
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
  const DIMK = ['T', 'H', 'C', 'Sf', 'Sb', 'E', 'D1', 'D2', 'Kd', 'Kc', 'Df', 'Ks'];
  function applyPreset(h) {
    const q = PRESETS.find(x => String(x.H) === h); if (!q) return;
    DIMK.forEach(k => { P[k] = q[k] ?? 0; });
    P.Sf = 0; P.Sb = +(q.S - q.T).toFixed(3);   // R-008 牆前垂直，牆背斜面寬 = S − T
    RW.syncDims(P);
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
      ['T', '(1) 牆身頂寬 T', 'm'], ['H', '(2) 牆體全高 H', 'm'], ['=h', '(3) 牆身高度 h = H − D1 − D2', 'm'],
      ['=B', '(4) 基礎寬度 B = C + S + E', 'm'], ['C', '(5) 基礎趾長 C', 'm'], ['=S', '(6) 牆身底寬 S = S1 + T + S2', 'm'],
      ['E', '(7) 基礎踵長 E', 'm'], ['D1', '(8) 基礎上高 D1', 'm'], ['D2', '(9) 基礎下高 D2', 'm'],
      ['=eta1', '(10) 牆前斜率 η1 = S1/h', ''], ['=eta', '(11) 牆背斜率 η2 = S2/h', ''],
      ['Kd', '(12) 止滑榫深度 Kd', 'm'], ['Ks', '(13) 止滑榫寬 Ks', 'm'], ['Kc', '(14) 止滑榫位置 Kc', 'm'],
      ['Df', '(15) 趾端覆土 Df', 'm'], ['=Y', '(16) 牆前回填 Y = Df + D1 + D2', 'm'], ['n', '(17) 背填坡度 1V : nH', 'n'],
      ['Sf', '(18) 牆身前底寬 S1', 'm'], ['Sb', '(19) 牆身後底寬 S2', 'm']],
      hint: '選擇牆高 H 即帶入建議尺寸，之後仍可自行修改任一尺寸（修改後顯示「自訂」）。實際條件不同時請自行檢核調整。' },
    { t: '2. 土壤參數', f: [
      ['gB', '回填土 γ2', 'tf/m³'], ['phiB', '回填土 ϕ2', '度'], ['cB', '回填土 c2', 'tf/m²'],
      ['gF', '承載層 γ1', 'tf/m³'], ['phiF', '承載層 ϕ1', '度'], ['cF', '承載層 c1', 'tf/m²'],
      ['gC', '混凝土 γc', 'tf/m³'], ['gW', '水 γw', 'tf/m³'],
      ['deltaR', '常時牆背摩擦角比 δ/ϕ2', ''], ['=dN', '常時 δ = (δ/ϕ2)·ϕ2', '度'],
      ['deltaRE', '地震時牆背摩擦角比 δ/ϕ2', ''], ['=dE', '地震時 δ = (δ/ϕ2)·ϕ2', '度'],
      ['deltaRP', '常時被動牆面摩擦角比 δp/ϕ1', ''], ['=dpN', '常時 δp = (δp/ϕ1)·ϕ1', '度'],
      ['deltaRPE', '地震時被動牆面摩擦角比 δp/ϕ1', ''], ['=dpE', '地震時 δp = (δp/ϕ1)·ϕ1', '度']],
      hint: 'δ 為牆背（回填土側）主動土壓之牆面摩擦角，以回填土 ϕ2 計算；δp 為止滑榫前緣被動土壓之牆面摩擦角，以承載層 ϕ1 計算。' },
    { t: '3. 地表超載重及地下水位', f: [
      ['qs', '牆背地表超載 qs（活載重 L）', 'tf/m²'],
      ['hw1r', '牆背水位比 Hw1/H', ''], ['=hw1', '牆背水位 Hw1', 'm'],
      ['hw2', '牆前水位 Hw2（自基底）', 'm', 'opt'], ['=g1', '基底下 B 範圍平均單位重', 'tf/m³']],
      hint: 'Hw2 空白＝無地下水；正值＝基底以上水深；負值＝水位位於基底以下之深度。基礎版底面以上土壤採回填土參數（γ2、ϕ2、c2），以下採承載層參數（γ1、ϕ1、c1）；水位以下採浸水單位重 γ2′ = γ2 − γw、γ1′ = γ1 − γw。基底下 B 範圍平均單位重供式(4.3-1) 第三項使用，自動計算。' },
    { t: '4. 載重組合', info: 'combo', f: [
      ['code', '配筋規範', '', 'select', [['hw', '公路橋梁設計規範'], ['c112', '112年建築物基礎構造設計規範'], ['rail', '鐵路橋梁耐震設計規範']]]],
      hint: '係數依所選規範自動帶入。公路橋梁設計規範：第3.23節表3.3。112年建築物基礎構造設計規範：第2.11節規定基礎構材以極限強度法設計時依「建築構造編」辦理，載重組合依112年建築物混凝土結構設計規範表5.3.1及第5.3.6、5.3.7節。組合內容見下表。鐵路橋梁耐震設計規範：地震時組合依第4.1節。' },
    { t: '5. 材料設計強度及保護層', f: [['fc', "混凝土 fc'", 'kgf/cm²'], ['fy', '鋼筋 fy（D13 以上）', 'kgf/cm²'], ['fy10', '鋼筋 fy（D10）', 'kgf/cm²'], ['cover', "保護層 d'", 'cm']] },
    { t: '6. 地震係數', site: true, f: [
      ['pgaH', '地表水平向尖峰加速度 PGAh', 'g'], ['pgaV', '地表垂直向尖峰加速度 PGAv', 'g'],
      ['khRes', '牆體側向位移完全受限', '', 'bool'], ['=khS', 'kh 建議值', ''], ['=kvS', 'kv 建議值', ''],
      ['kh', '水平向地震係數 kh（採用）', ''], ['kv', '垂直向地震係數 kv（採用，向下為正）', ''], ['pwRed', '牆背動水壓折減係數|基礎規範第7.3.6節解說 4', ''], ['kvPhi0', '計算 φ 時取 kv = 0', '', 'bool'],
      ['mvm', '牆體變位模式', '', 'select', [['rotBase', '對牆底旋轉'], ['slide', '滑移'], ['rotTop', '對牆頂旋轉']]]],
      hint: '基礎規範(112) 第7.3.4節解說3：kh 取地表水平向尖峰加速度之半，側向位移完全受限取 1.5 倍；kv 取垂直向之半（本表以向下為正），遠距離地震可令 kv = 0。牆背動水壓 ΔPwe = 折減係數 × (7/12)·kh·γw·Hw1²，第7.3.6節解說4 土側受限水可取 0.7。可參考建築物耐震設計規範設計地震（475年回歸期）EPA。變位模式決定動態土壓力作用點（解說2）。' },
    { t: '7. 安全係數', f: [
      ['fss_n', '抗滑動（常時）', ''], ['fss_e', '抗滑動（地震）', ''], ['fso_n', '抗傾覆（常時）', ''],
      ['fso_e', '抗傾覆（地震）', ''], ['fsb_n', '抗承載（常時）', ''], ['fsb_e', '抗承載（地震）', '']] },
    { t: '8. 土壓力參數', f: [
      ['kam', 'Ka 計算方法', '', 'select', [['coulomb', 'Coulomb'], ['rankine', 'Rankine']]],
      ['kaem', 'KAE 計算方法', '', 'select', [['mo', 'Mononobe-Okabe'], ['rankine', 'Rankine（擬靜態）']]],
      ['kpm', 'Kp 計算方法', '', 'select', [['rankine', 'Rankine'], ['coulomb', 'Coulomb'], ['ck', 'Caquot-Kerisel（反推）'], ['ckc', 'Caquot-Kerisel（查圖）']]],
      ['kpem', 'KPE 計算方法', '', 'select', [['mo', 'Mononobe-Okabe'], ['rankine', 'Rankine（擬靜態）'], ['rankine0', 'Rankine']]],
      ['kaOvr', 'Ka 指定值（空白=計算）', '', 'opt'], ['kaeOvr', 'KAE 指定值（空白=計算）', '', 'opt'],
      ['kpOvr', 'Kp 指定值（空白=計算）', '', 'opt'], ['kpeOvr', 'KPE 指定值（空白=計算）', '', 'opt']],
      htmlAfter: 'kpm', html: `<details class="figtog"><summary>圖-解7.3-1（Caquot-Kerisel 土壓力係數）</summary><a href="fig-7-3-1.jpg" target="_blank" rel="noopener" title="開新視窗檢視原尺寸"><img src="fig-7-3-1.jpg" alt="圖-解7.3-1 主動與被動土壓力係數－牆背傾斜" loading="lazy"></a><p class="hint">建築物基礎構造設計規範(112) 圖-解7.3-1（轉錄自 NAVFAC DM7.2, 1986）。Kp = R × Kp(δ/ϕ = −1)：上方曲線為 δ/ϕ = −1 之 Kp（依牆面傾角 θ），左上表為折減係數 R。止滑榫前緣垂直取 θ = 0°。「查圖」採 θ = 0° 曲線數位化值（ϕ ≤ 38°）；「反推」以 tan²(45° + ϕ/2)/R(δ = 0) 計算。</p></details>`,
      hint: 'Ka — Coulomb：式(7.3-5)，回填土 ϕ2、δ、牆背 θ、地表 α；Rankine：式(7.3-6) tan²(45−ϕ/2)（規範限地表水平、牆背垂直、不計牆面摩擦；地表傾斜時採 Rankine 傾斜地表式，合力平行地表）；亦可指定 Caquot-Kerisel 查圖值。地震時 KAE 依式(7.3-12)，亦可指定。<br>Kp — Rankine：tan²(45+ϕ/2)；Coulomb：承載層 ϕ1、δp（第2節）；Caquot-Kerisel：依第7.3.3節，以圖-解7.3-1（NAVFAC DM7.2）折減係數 R 計算，Kp = R·Kp(δ/ϕ=−1)，δp 不宜大於 2ϕ1/3。地震時 KPE 依式(7.3-14)，亦可指定。' },
    { t: '9. 擋土牆配筋設計', bars: true, f: [
      ['dStemN', '牆身配筋常時 δ/ϕ2（空白=同穩定分析）', '', 'opt'], ['dStemE', '牆身配筋地震時 δ/ϕ2（空白=同穩定分析）', '', 'opt'],
      ['stemCos', '牆身配筋土壓取水平分量 cos(δ+θ)', '', 'bool'], ['stemInert', '牆身配筋計入牆身慣性力', '', 'bool'],
      ['heelSino', '踵版彎矩最大值配頂層筋', '', 'bool'], ['upMode', '基礎版底揚壓力分布', '', 'select', [['uni', '均佈（踵版 γw·Hw1、趾版 γw·Hw2）'], ['trap', '梯形（同穩定分析 Pb）']]]],
      hint: '預設：牆身配筋常時 δ = ϕ2/2、地震時 δ = 0，土壓係數直接作為水平係數（不乘 cos），地震時不計牆身慣性力；踵版扣除均佈揚壓力 γw·Hw1；基礎版需要鋼筋量不小於 ρt/2（ρt 為基礎溫度鋼筋比）；踵版以 M = ∫(地盤反力 − 版上載重)·力臂 之最大值配頂層筋、最小值配底層筋（選「否」則依懸臂受拉側配筋）。超載側壓均不乘 cos。' },
    { t: '10. 鋼筋量計算', f: [
      ['ldhM', '彎鉤伸展長度 ℓdh 計算式', '', 'select', [['new', '新式（第25.4.3.1節）'], ['old', '舊式（第25.4.3.7節）']]],
      ['wallL', '牆長（空白=僅計每米）', 'm', 'opt'], ['stockL', '鋼筋定尺長度', 'm'],
      ['workPct', '工作筋', '%'], ['lossPct', '損耗', '%']],
      hint: '依112年建築物混凝土結構設計規範第25章：伸展長度 ℓd 採表25.4.2.3 簡化式；標準彎鉤依表25.3.1（90° 彎鉤直線延伸 12db）；彎鉤伸展長度 ℓdh 預設採第25.4.3.1節新式，可切換為第25.4.3.7節舊式；水平筋、縱向筋依定尺長度計入乙級搭接 1.3ℓd。合計 = 小計 ×(1 + 工作筋%)×(1 + 損耗%)。' }

  ];

  const form = document.getElementById('form');
  function buildForm() {
    form.innerHTML = '';
    for (const g of G) {
      const d = document.createElement(g.plain ? 'div' : 'details'); d.className = g.plain ? 'grp plain' : 'grp'; if (g.open) d.open = true;
      if (!g.plain) d.innerHTML = `<summary>${g.t}</summary>`;
      const box = document.createElement('div'); box.className = 'fields';
      if (g.hint) box.insertAdjacentHTML('beforeend', `<p class="hint">${g.hint}</p>`);
      if (g.html && !g.htmlAfter) box.insertAdjacentHTML('beforeend', g.html);
      if (g.site) box.insertAdjacentHTML('beforeend', '<div id="siteBox"></div>');
      if (g.info && !g.f) {
        box.insertAdjacentHTML('beforeend', `<div id="${g.info}"></div>`);
      } else if (g.bars) {
        const rows = [['S1', '牆身主筋（全高）', true], ['S2', '牆身補強（自牆底長）', true], ['S3', '牆身補強（自牆底長）', true],
          ['S4', '基礎版上層 S4、S6'], ['S5', '基礎版下層 S5、S7'], ['S8', '暴露面垂直筋'], ['T1', '牆身水平筋（每面）'], ['T2', '基礎溫度筋（每面）']];
        let h = '<div class="scroll"><table class="bars"><thead><tr><th>編號</th><th>長度 m</th><th>號數 D</th><th>間距 cm</th></tr></thead><tbody>';
        for (const [k, desc, hasL] of rows) {
          h += `<tr><td title="${desc}">${k}<br><span class="u hint">${desc}</span></td>
            <td>${hasL ? `<input data-bar="${k}" data-f="L" inputmode="decimal" value="${P.bars[k].L}">` : '–'}</td>
            <td><select data-bar="${k}" data-f="D">${Object.keys(RW.BARS).map(b => `<option ${+b === +P.bars[k].D ? 'selected' : ''}>${b}</option>`).join('')}</select></td>
            <td><input data-bar="${k}" data-f="s" inputmode="decimal" value="${P.bars[k].s}"></td></tr>`;
        }
        box.insertAdjacentHTML('beforeend', h + '</tbody></table></div>');
      }
      if (g.f && !(g.info && !g.f)) {
        for (const [k, lab, unit, type, opts] of g.f) {
          const id = 'in_' + k.replace('=', 'c_');
          let ctl;
          if (k.startsWith('=')) ctl = `<span class="calc" id="${id}"></span>`;
          else if (type === 'select') ctl = `<select id="${id}" data-k="${k}">${opts.map(([v, t]) => `<option value="${v}" ${P[k] === v ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
          else if (type === 'bool') ctl = `<select id="${id}" data-k="${k}" data-type="bool"><option value="1" ${P[k] ? 'selected' : ''}>是</option><option value="0" ${!P[k] ? 'selected' : ''}>否</option></select>`;
          else if (type === 'text') ctl = `<input id="${id}" data-k="${k}" data-type="text" value="${P[k] ?? ''}" style="text-align:left">`;
          else ctl = `<input id="${id}" data-k="${k}" ${type === 'opt' ? 'data-type="opt"' : ''} inputmode="decimal" value="${fmtIn(P[k])}">`;
          box.insertAdjacentHTML('beforeend', `<div class="f${type === 'select' ? ' wide' : ''}"><label for="${id}">${lab.includes('|') ? lab.replace(/\|(.*)$/, '<span class="rel">$1</span>') : k.startsWith('=') && lab.includes(' = ') ? lab.replace(/ = (.*)$/, '<span class="rel">= $1</span>') : lab}</label>${ctl}${type === 'select' ? '' : `<span class="u">${unit}</span>`}</div>`);
          if (g.html && g.htmlAfter === k) box.insertAdjacentHTML('beforeend', g.html);
        }
        if (g.info) box.insertAdjacentHTML('beforeend', `<div id="${g.info}"></div><p class="hint">載重係數與強度折減因子依所選配筋規範自動帶入，免輸入。</p>`);
      }
      d.appendChild(box); form.appendChild(d);
    }
    renderSite();
  }
  function fmtIn(v) { if (v === null || v === undefined || v === '') return ''; return Math.abs(v - 1 / 3) < 1e-9 ? '0.3333' : Math.abs(v - 2 / 3) < 1e-9 ? '0.6667' : v; }

  // ---------- 工址（建築物耐震設計規範 113年版）----------
  const CLS = [[1, '第一類地盤（堅實地盤）'], [2, '第二類地盤（普通地盤）'], [3, '第三類地盤（軟弱地盤）']];
  function renderSite() {
    const S = window.RWSEIS, box = document.getElementById('siteBox'); if (!box || !S) return;
    const m = P.siteMode || 'gen', esc = t => String(t).replace(/"/g, '&quot;');
    if (!S.tw[P.siteCounty]) P.siteCounty = '臺南市';
    const towns = S.tw[P.siteCounty]; if (!towns.find(r => r[0] === P.siteTown)) P.siteTown = towns[0][0];
    const row = towns.find(r => r[0] === P.siteTown), faults = row[5] || [];
    const gen = m === 'gen', tpe = m === 'tpe';
    box.innerHTML = `<div class="sitebox">
      <div class="srow"><label class="rad"><input type="radio" name="siteMode" data-site="mode" value="tpe" ${tpe ? 'checked' : ''}> 臺北盆地</label>
        <select data-site="zone" ${tpe ? '' : 'disabled'}>${Object.keys(S.tpe).map(z => `<option ${z === P.tpeZone ? 'selected' : ''}>${z}</option>`).join('')}</select><span class="sref">表2-6、圖2-1</span></div>
      <div class="srow"><label class="rad"><input type="radio" name="siteMode" data-site="mode" value="gen" ${gen ? 'checked' : ''}> 一般工址及近斷層區域</label><span class="sref">表2-1</span></div>
      <div class="srow ind">縣市 <select data-site="county" ${gen ? '' : 'disabled'}>${S.order.map(c => `<option ${c === P.siteCounty ? 'selected' : ''}>${c}</option>`).join('')}</select>
        <select data-site="town" class="stown" ${gen ? '' : 'disabled'}>${towns.map(r => `<option value="${esc(r[0])}" ${r[0] === P.siteTown ? 'selected' : ''}>${r[0]}</option>`).join('')}</select></div>
      ${gen && faults.length ? `<div class="srow ind sfault">${faults.join('、')}</div>` : ''}
      <div class="srow ind sss" id="siteSS"></div>
      <div class="srow">地盤分類 <select data-site="cls" ${tpe ? 'disabled' : ''}>${CLS.map(([v, t]) => `<option value="${v}" ${+P.siteClass === v ? 'selected' : ''}>${t}</option>`).join('')}</select><span class="sref">第2.5節</span></div>
      ${gen && faults.length ? `<table class="sft"><thead><tr><th>斷層名稱</th><th>近斷層距離 R (km)</th></tr></thead><tbody>${faults.map(f => `<tr><td>${f}</td><td><input data-site="r" data-fault="${esc(f)}" inputmode="decimal" value="${P.faultR && P.faultR[f] != null ? P.faultR[f] : ''}" placeholder="≥ 14"></td></tr>`).join('')}</tbody></table><p class="hint">R 為工址至中央地質調查所公布斷層地表跡線之最短水平距離；空白視為 R ≥ 14 km（取表2-1值）。任一斷層 R < 14 km 為近斷層工址，否則依一般工址計算 PGAv。多條斷層各參數取最大值（第2.4節）。</p>` : ''}
      <div class="srow"><label class="rad"><input type="radio" name="siteMode" data-site="mode" value="manual" ${m === 'manual' ? 'checked' : ''}> 手動輸入 PGAh、PGAv</label></div>
      <div id="siteOut" class="siteout"></div></div>`;
  }
  function updateSite() {
    const st = o && o.site, ss = document.getElementById('siteSS'), out = document.getElementById('siteOut');
    const S = window.RWSEIS;
    if (ss) {
      if (P.siteMode === 'gen' && S) { const row = (S.tw[P.siteCounty] || []).find(r => r[0] === P.siteTown);
        ss.innerHTML = row ? `SSᴰ = ${n(row[1])}　S1ᴰ = ${n(row[2])}　SSᴹ = ${n(row[3])}　S1ᴹ = ${n(row[4])}` : ''; }
      else ss.innerHTML = '';
    }
    if (out) {
      if (!st) out.innerHTML = '<span class="hint">PGAh、PGAv 請於下方自行輸入。</span>';
      else out.innerHTML = (st.mode === 'gen'
        ? (st.faults.some(f => f.r !== null) ? `近斷層調整：SSᴰ = ${n(st.adj.SSD)}、S1ᴰ = ${n(st.adj.S1D)}<br>` : '') + `Fa = ${n(st.Fa, 3)}，SDS = Fa·SSᴰ = ${n(st.SDS, 3)}<br>`
        : `${st.zone}：SDS = ${n(st.SDS)}，T0D = ${n(st.T0)} 秒<br>`)
        + `<b>PGAh = 0.4·SDS = ${n(st.pgaH, 3)} g</b><br><b>PGAv = ${st.vr === 0 ? '0' : st.vr > 0.6 ? '2/3' : '1/2'} × PGAh = ${n(st.pgaV, 3)} g</b><br><span class="hint">${st.vrNote}</span>`;
    }
    for (const k of ['pgaH', 'pgaV']) { const el = document.getElementById('in_' + k); if (!el) continue;
      el.readOnly = !!st; el.classList.toggle('ro', !!st); if (document.activeElement !== el) el.value = st ? n(st[k], 3) : P[k]; }
  }
  form.addEventListener('input', e => {
    const el = e.target, k = el.dataset.site; if (!k) return;
    const S = window.RWSEIS;
    if (k === 'mode') { if (el.value === 'manual' && o && o.site) { P.pgaH = +o.site.pgaH.toFixed(3); P.pgaV = +o.site.pgaV.toFixed(3); } P.siteMode = el.value; }
    else if (k === 'zone') P.tpeZone = el.value;
    else if (k === 'county') { P.siteCounty = el.value; P.siteTown = S.tw[el.value][0][0]; }
    else if (k === 'town') P.siteTown = el.value;
    else if (k === 'cls') P.siteClass = +el.value;
    else if (k === 'r') { const v = el.value.trim(); P.faultR = { ...(P.faultR || {}), [el.dataset.fault]: v === '' || !isFinite(parseFloat(v)) ? null : parseFloat(v) }; }
    if (k !== 'r') renderSite();
  }, true);
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
  // 數值與單位包在同一個不換行區塊，單位緊接數值
  const eq = (lab, v, u = '', key = false) => `<div class="eq${key ? ' key' : ''}"><span class="lb">${lab}</span><span class="vu"><span class="v">${v}</span><span class="u">${u}</span></span></div>`;

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
  const B_KAER = mFrac(mT('cos²(ϕ−φ)'), mT('cos²φ') + mBox('+', 'sinϕ·sin(ϕ−φ−α)', 'cosφ·cosα'));
  const FX_KAER = fx('AE', B_KAER, '擬靜態 Rankine（式(7.3-12) 令 δ = θ = 0）');
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
  // 計算書 2.3／2.4：穩定分析結果表（檢核項目／規範值／計算值／檢核結果／備註）
  function stabTable(X, elim) {
    const ck = (b, s) => `<span class="ck${b ? '' : ' ng'}">${s}　${b ? 'OK!' : 'NG!'}</span>`;
    return `<div class="scroll"><table class="t stab"><thead><tr><th colspan="2">檢核項目</th><th>規範值</th><th>計算值</th><th>檢核結果</th><th>備註</th></tr></thead><tbody>
      <tr><td rowspan="2">牆體傾覆</td><td>安全係數 FS</td><td>${n(X.fso)}</td><td>${n(X.FSo)}</td><td>${ck(X.okO, '≧ ' + n(X.fso, 1))}</td><td class="rm">Mr = ${n(X.Mr)} tf-m，Md = ${n(X.Md)} tf-m</td></tr>
      <tr><td class="c">偏心距 e (m)</td><td>${n(o.g.B / elim)}</td><td>${n(Math.abs(X.e))}</td><td>${ck(X.okE, '≦ B/' + elim)}</td><td class="rm">B/${elim} = ${n(o.g.B / elim)} m，e = ${n(X.e)} m</td></tr>
      <tr><td>基礎容許支承力</td><td>安全係數 FS</td><td>${n(X.fsb)}</td><td>${n(X.FSb)}</td><td>${ck(X.okB, '≧ ' + n(X.fsb, 1))}</td><td class="rm">qu = ${n(X.qu)} tf/m²，qmax = ${n(X.qmax)} tf/m²</td></tr>
      <tr><td>牆體滑動</td><td>安全係數 FS</td><td>${n(X.fss)}</td><td>${n(X.FSs)}</td><td>${ck(X.okS, '≧ ' + n(X.fss, 1))}</td><td class="rm">Hu = ${n(X.Hu)} tf，Hd = ${n(X.SH)} tf</td></tr>
    </tbody></table></div>`;
  }
  // 規範引用文字標記為 .cref（列印時隱藏）；.keep 元素（載重組合、安全係數備註）保留
  const CODE_RE = /規範|式\(|第[\d.～~]+節|解說|表\d|圖-解/;
  const TOK = String.raw`(?:建築物基礎構造設計規範\(112\)|公路橋梁設計規範)?\s*(?:式\(解?[\d.\-a-z]+\)(?:[、，]\s*\(解?[\d.\-a-z]+\))*|第[\d.～~]+節(?:【解說】|解說)?\s*\d*(?:第\d款)?|圖-解[\d.\-]+|表[\d.\-]+(?:\s*分類[ⅠⅡⅢⅣⅤⅥⅦ]+)?)|建築物基礎構造設計規範\(112\)|公路橋梁設計規範\s*[\d.、]*`;
  const CODE_TOK = new RegExp(String.raw`(?<=（)\s*(?:${TOK})\s*[，、；]?|[，、；　]?\s*(?:${TOK})`, 'g');
  function markCodeRefs(root) {
    root.querySelectorAll('p.note').forEach(el => { if (!el.closest('.keep') && CODE_RE.test(el.textContent) && !/※/.test(el.textContent)) el.classList.add('cref'); });
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: t =>
      t.parentElement.closest('.keep, .cref, math, svg, script') || !CODE_RE.test(t.nodeValue) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const t of nodes) {
      const v = t.nodeValue, ranges = [];
      // 含規範引用之全形括號整段隱藏；其餘單獨之式號、節次、表號隱藏
      v.replace(/（[^（）]*）/g, (m, i) => { if (CODE_RE.test(m) && !m.slice(1, -1).replace(CODE_TOK, '').replace(/[\s，、；：]/g, '')) ranges.push([i, i + m.length]); return m; });
      v.replace(CODE_TOK, (m, ...a) => { const i = a[a.length - 2]; if (m.trim() && !ranges.some(([s, e]) => i >= s && i < e)) ranges.push([i, i + m.length]); return m; });
      if (!ranges.length) continue;
      ranges.sort((a, b) => a[0] - b[0]);
      const frag = document.createDocumentFragment(); let k = 0;
      for (const [s0, e0] of ranges) { if (s0 < k) continue; frag.append(v.slice(k, s0)); const sp = document.createElement('span'); sp.className = 'cref'; sp.textContent = v.slice(s0, e0); frag.append(sp); k = e0; }
      frag.append(v.slice(k)); t.replaceWith(frag);
    }
  }
  // ---------- 6. 鋼筋量計算 ----------
  function qtyReport() {
    const q = o.qty, f1 = v => n(v, 1);
    let t = `<h2>6. 鋼筋量計算</h2>
    <h3>6.1 計算條件</h3>
    ${eq("混凝土強度 fc' ／ 鋼筋降伏強度 fy（D13 以上）／ fy（D10）", `${n(P.fc, 0)} / ${n(P.fy, 0)} / ${n(P.fy10, 0)}`, 'kgf/cm²')}
    ${eq("保護層 d'", n(P.cover, 1), 'cm')}
    ${eq('彎鉤伸展長度 ℓdh', q.ldhM === 'old' ? '舊式（第25.4.3.7節）' : '新式（第25.4.3.1節）', '')}
    ${eq('鋼筋定尺長度', n(q.stockL, 1), 'm')}
    ${eq('工作筋 ／ 損耗', `${n(q.work, 1)} / ${n(q.loss, 1)}`, '%')}
    ${eq('牆長', q.wallL ? n(q.wallL, 2) : '未輸入（僅計每米）', q.wallL ? 'm' : '')}
    <p class="note">修正因數：ψe = 1.0（無塗布）、λ = 1.0（常重混凝土）；ℓd 之 ψt 一般取 1.0，頂層鋼筋（其下新澆混凝土厚度大於 30 cm）取 1.3；ℓdh 之 ψo = 1.0（牆、版沿牆長連續，側向保護層充足），ψr 依鋼筋間距 s ≥ 6db 取 1.0，否則 1.6。</p>
    <h3>6.2 伸展長度、搭接長度及標準彎鉤（第25.3、25.4、25.5節）</h3>
    <div class="scroll"><table class="t"><thead><tr><th>號數</th><th>db (cm)</th><th>fy</th><th>ℓd (cm)<br>ψt = 1.0</th><th>ℓd (cm)<br>ψt = 1.3</th><th>ψc ／ ψr</th><th>ℓdh 新式 (cm)</th><th>ℓdh 舊式 (cm)</th><th>乙級搭接 1.3ℓd (cm)</th><th>90° 彎鉤長 (cm)</th></tr></thead><tbody>
    ${q.devList.map(d => `<tr><td>D${d.D}</td><td>${n(d.db, 2)}</td><td>${n(d.fy, 0)}</td><td>${f1(d.ld1)}</td><td>${f1(d.ld13)}</td><td>${n(d.psiC, 3)} / ${n(d.psiR, 1)}</td><td>${f1(d.ldhNew)}</td><td>${d.oldOK ? f1(d.ldhOld) : '不適用'}</td><td>${f1(d.lap)}</td><td>${f1(d.hook)}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="note">ℓd = fy·ψt·ψe/(K·λ·√fc')·db，D19 以下 K = 6.6、D22 以上 K = 5.3，且不小於 30 cm（表25.4.2.3）。ℓdh 新式 = fy·ψe·ψr·ψo·ψc/(23·λ·√fc')·db^1.5（db 以 cm 計），舊式 = 0.075·ψe·fy·db/√fc'，均不小於 8db 及 15 cm。90° 彎鉤長為外緣尺寸：直線延伸 12db + 彎曲內直徑/2 + db（D10～D25 內直徑 6db，D29～D36 為 8db，表25.3.1）。搭接長度 = max(1.3ℓd, 30 cm)（表25.5.2.1 乙級）。</p>
    <h3>6.3 錨定長度檢核</h3>
    <div class="scroll"><table class="t"><thead><tr><th>位置</th><th>需求長度 (cm)</th><th>可用長度 (cm)</th><th>結果</th></tr></thead><tbody>
    ${q.chk.map(c => `<tr><td>${c.pos}</td><td>${f1(c.req)}</td><td>${f1(c.avail)}</td><td>${tag(c.ok)}</td></tr>`).join('')}
    </tbody></table></div>
    <h3>6.4 鋼筋數量表（每公尺牆長）</h3>
    <div class="scroll"><table class="t qty"><thead><tr><th>編號</th><th>說明</th><th>號數</th><th>間距 (cm)</th><th>單支長度組成 (cm)</th><th>單支長度 (m)</th><th>支數 (支/m)</th><th>長度 (m/m)</th><th>單位重 (kg/m)</th><th>重量 (kg/m)</th></tr></thead><tbody>
    ${q.rows.map(r => `<tr><td>${r.k}</td><td>${r.label}${r.note ? `<br><span class="note">${r.note}</span>` : ''}</td><td>D${r.D}</td><td>${r.s}</td><td class="segs">${r.segs.map(x => `${x[0]} ${f1(x[1])}`).join('<br>')}</td><td>${n(r.L, 2)}</td><td>${n(r.n, 2)}</td><td>${n(r.Lm, 2)}</td><td>${n(r.wt, 3)}</td><td>${n(r.kg, 2)}</td></tr>`).join('')}
    <tr class="sum"><td colspan="9">小計</td><td>${n(q.sub, 2)}</td></tr>
    <tr><td colspan="9">工作筋 ${n(q.work, 1)}%</td><td>${n(q.wk, 2)}</td></tr>
    <tr><td colspan="9">損耗 ${n(q.loss, 1)}%（小計 + 工作筋）× 損耗%</td><td>${n(q.ls, 2)}</td></tr>
    <tr class="sum"><td colspan="9">合計 = 小計 ×(1 + 工作筋%)×(1 + 損耗%)</td><td>${n(q.tot, 2)}</td></tr>
    </tbody></table></div>
    <h3>6.5 依號數彙總</h3>
    <div class="scroll"><table class="t"><thead><tr><th>號數</th><th>小計 (kg/m)</th><th>合計 (kg/m)</th>${q.wallL ? `<th>全長合計 (kg)</th><th>全長合計 (t)</th>` : ''}</tr></thead><tbody>
    ${q.bySize.map(b => `<tr><td>D${b.D}</td><td>${n(b.kg, 2)}</td><td>${n(b.tot, 2)}</td>${q.wallL ? `<td>${n(b.tot * q.wallL, 1)}</td><td>${n(b.tot * q.wallL / 1000, 3)}</td>` : ''}</tr>`).join('')}
    <tr class="sum"><td>合計</td><td>${n(q.sub, 2)}</td><td>${n(q.tot, 2)}</td>${q.wallL ? `<td>${n(q.tot * q.wallL, 1)}</td><td>${n(q.tot * q.wallL / 1000, 3)}</td>` : ''}</tr>
    </tbody></table></div>`;
    return t;
  }
  // 5.3 基礎版計算過程表（比照計算書；僅畫面，可展開／隱藏，列印不輸出）
  function baseTables() {
    const t = o.baseTab; if (!t) return '';
    const cs = t.combos, nC = cs.length, hd = cs.map((c, i) => `<th title="${c.tag}">Comb ${i + 1}</th>`).join('');
    const row = (lab, fn, d = 2) => `<tr><td>${lab}</td>${cs.map(c => `<td>${n(fn(c), d)}</td>`).join('')}</tr>`;
    const leg = cs.map((c, i) => `Comb ${i + 1}：${c.tag}`).join('　');
    const g = o.g, C = P.C, S = o.p.S, B = g.B, upAny = cs.some(c => c.heel.upB > 0 || c.toe.up0 > 0), partial = cs.some(c => c.heel.aZero > 1e-6);
    let h = `<details class="calcdet scr-only"${baseOpen ? ' open' : ''}><summary>基礎版設計載重計算表（比照計算書，點選展開／隱藏）</summary>
      <p class="note">${leg}</p>
      <h4>(1) 設計載重</h4>
      <div class="scroll"><table class="t ctab"><thead><tr><th>載重組合</th>${hd}</tr></thead><tbody>
      ${row('垂直作用力 V (tf)', c => c.SV)}${row('水平作用力 H (tf)', c => c.SH)}${row('抵抗彎矩 Mr (tf-m)', c => c.Mr)}${row('驅動彎矩 Md (tf-m)', c => c.Md)}
      ${row('偏心距 e (m)', c => c.e)}${row('趾端反力 qt (tf/m²)', c => c.qt)}${row('踵端反力 qh (tf/m²)', c => c.qh)}
      </tbody></table></div>
      <p class="note">基礎平均厚度 tav = ${n(o.base.tav * 100, 1)} cm，有效深度 d = ${n(o.base.tav * 100 - P.cover, 1)} cm，基礎全寬 B = ${n(B)} m，趾長 C = ${n(C)} m，踵長 E = ${n(P.E)} m。</p>
      <h4>基礎趾端設計載重</h4>
      <div class="scroll"><table class="t ctab"><thead><tr><th>載重組合</th>${hd}</tr></thead><tbody>
      ${row('趾端長度 Ltoe (m)', c => c.toe.L)}${row('平均底板重 qslab (tf/m²)', c => c.toe.qslab)}${upAny ? row('版底揚壓力 F·γw·h (tf/m²)', c => c.toe.up0) : ''}
      ${row('地盤反力 w1 (x = 0.00)', c => c.toe.r1)}${row(`地盤反力 w2 (x = ${n(C)})`, c => c.toe.r2)}
      </tbody></table></div>
      <h4>基礎踵端設計載重</h4>
      <div class="scroll"><table class="t ctab"><thead><tr><th>載重組合</th>${hd}</tr></thead><tbody>
      ${row('踵端長度 Lheel (m)', c => c.heel.L)}${partial ? row('反力為零之長度 a (m)', c => c.heel.aZero) : ''}
      ${row('超載 qsur (tf/m²)', c => c.heel.qsur)}${row('平均覆土重 qsoil (tf/m²)', c => c.heel.qsoil)}${row('平均底板重 qslab (tf/m²)', c => c.heel.qslab)}
      ${upAny ? row('版底揚壓力 F·γw·h，牆背面 (tf/m²)', c => -c.heel.upF) : ''}
      ${row('上方載重 w，牆背面 (tf/m²)', c => c.heel.w)}
      ${row(`地盤反力 w1 (x = ${n(B)})`, c => c.heel.r1)}${row(`地盤反力 w2 (x = ${n(C + S)})`, c => c.heel.r2)}
      </tbody></table></div>
      <h4>(2) 設計載重計算</h4>
      <p class="note">x 自趾端起算；正值表示淨載重向上：M = ∫(地盤反力 − 版上載重)·力臂。趾版自趾端、踵版自踵端（自由端）積分至斷面。</p>
      <div class="scroll"><table class="t ctab"><thead><tr><th rowspan="2">位置 x (m)</th><th colspan="${nC}">設計彎矩 Mu (tf-m/m)</th><th colspan="${nC}">設計剪力 Vu (tf/m)</th></tr><tr>${hd}${hd}</tr></thead><tbody>`;
    t.xs.forEach((x, j) => { h += `<tr><td>${n(x)}</td>${cs.map(c => `<td>${n(c.st[j].M)}</td>`).join('')}${cs.map(c => `<td>${n(c.st[j].V)}</td>`).join('')}</tr>`; });
    const ext = (key, f) => cs.map(c => { let bi = 0; c.st.forEach((s2, j) => { if (f(s2[key], c.st[bi][key])) bi = j; }); return bi; });
    const mxM = ext('M', (a, b) => a > b), mnM = ext('M', (a, b) => a < b), mxV = ext('V', (a, b) => a > b), mnV = ext('V', (a, b) => a < b);
    h += `<tr class="sum"><td>Max.</td>${cs.map((c, i) => `<td>${n(c.st[mxM[i]].M)}</td>`).join('')}${cs.map((c, i) => `<td>${n(c.st[mxV[i]].V)}</td>`).join('')}</tr>
      <tr><td>Loc (m)</td>${mxM.map(j => `<td>${n(t.xs[j])}</td>`).join('')}${mxV.map(j => `<td>${n(t.xs[j])}</td>`).join('')}</tr>
      <tr class="sum"><td>Min.</td>${cs.map((c, i) => `<td>${n(c.st[mnM[i]].M)}</td>`).join('')}${cs.map((c, i) => `<td>${n(c.st[mnV[i]].V)}</td>`).join('')}</tr>
      <tr><td>Loc (m)</td>${mnM.map(j => `<td>${n(t.xs[j])}</td>`).join('')}${mnV.map(j => `<td>${n(t.xs[j])}</td>`).join('')}</tr>
      </tbody></table></div>
      <p class="note">表列為 ${t.xs.length} 個代表斷面；下方配筋採 40 等分逐斷面計算之極值，數值可能略大於表列。</p></details>`;
    return h;
  }
  let baseOpen = false;
  try { baseOpen = localStorage.getItem('rw-baseopen') === '1'; } catch (e) {}
  document.getElementById('report').addEventListener('toggle', e => { if (e.target.classList && e.target.classList.contains('calcdet')) { baseOpen = e.target.open; try { localStorage.setItem('rw-baseopen', baseOpen ? '1' : '0'); } catch (err) {} } }, true);
  // 計算書分頁（畫面）：1～4、5、6
  let curRT = '1';
  try { curRT = localStorage.getItem('rw-rt6') || '1'; } catch (e) {}
  if (!/^[1-6]$/.test(curRT)) curRT = '1';
  function showRT(k) {
    curRT = k; try { localStorage.setItem('rw-rt6', k); } catch (e) {}
    document.querySelectorAll('#report .rt').forEach(d => d.classList.toggle('on', d.dataset.rt === k));
    document.querySelectorAll('.rtabs button').forEach(b => b.classList.toggle('on', b.dataset.rt === k));
  }
  document.querySelectorAll('.rtabs button').forEach(b => b.onclick = () => showRT(b.dataset.rt));
  let o;
  function summary() {
    const v = document.getElementById('verdict');
    v.className = 'verdict ' + (o.allOK ? 'ok' : 'ng');
    v.innerHTML = `<span>${o.allOK ? '✔ 全部檢核 OK' : '✘ 有 NG 項目，請調整尺寸或配筋'}</span><small>${P.id || ''}　H = ${n(P.H)} m　B = ${n(o.g.B)} m</small>`;
    document.getElementById('sumN').innerHTML = sumTable(o.n, 6);
    document.getElementById('sumE').innerHTML = sumTable(o.e, 3);
    let h = `<div class="scroll"><table class="kv"><thead><tr><th>位置</th><th>Vu / φVc (tf)</th><th>Mu (tf·m)</th><th>As 需 / 配 (cm²)</th><th></th></tr></thead><tbody>`;
    for (const r of o.rc) h += `<tr><td>${r.lab || r.desc}</td><td class="num">${n(r.Vu)} / ${n(r.pVc)}</td><td class="num">${n(r.Mu)}</td><td class="num">${n(r.Asr)} / ${n(r.Asp)}</td><td>${tag(r.okV && r.okM)}</td></tr>`;
    for (const m of o.min) h += `<tr><td>${m.k}</td><td class="num">–</td><td class="num">–</td><td class="num">${n(m.Asr)} / ${n(m.Asp)}</td><td>${tag(m.ok)}</td></tr>`;
    document.getElementById('sumRC').innerHTML = h + '</tbody></table></div>';
  }

  // ---------- report ----------
  function forceTable(rows, ext, kind) {
    let h = `<div class="scroll"><table class="t"><thead><tr><th>項目</th><th>V (tf)</th><th>H (tf)</th><th>x (m)</th><th>y (m)</th><th>Mr (tf·m)</th><th>Md (tf·m)</th></tr></thead><tbody>`;
    if (kind === 'e') h += `<tr><td>Σ(1)~(16) 自重</td><td>${n(o.SW)}</td><td>–</td><td>–</td><td>–</td><td>${n(o.SWx)}</td><td>–</td></tr>`;
    for (const it of rows) {
      if (kind === 'n') h += `<tr><td>${it.name}</td><td>${n(it.W)}</td><td>–</td><td>${n(it.x)}</td><td>${n(it.y)}</td><td>${n(it.W * it.x)}</td><td>–</td></tr>`;
      else h += `<tr><td>${it.name.replace(')', ")'")}</td><td>${n(P.kv * it.W)}</td><td>${n(P.kh * it.W)}</td><td>${n(it.x)}</td><td>${n(it.y)}</td><td>${n(P.kv * it.W * it.x)}</td><td>${n(P.kh * it.W * it.y)}</td></tr>`;
    }
    for (const x of ext) h += `<tr><td>${x.name}</td><td>${x.V !== undefined ? n(x.V) : '–'}</td><td>${x.H !== undefined ? n(x.H) : '–'}</td><td>${x.x !== undefined ? n(x.x) : '–'}</td><td>${x.y !== undefined ? n(x.y) : '–'}</td><td>${x.V !== undefined ? n(x.V * x.x) : '–'}</td><td>${x.H !== undefined ? n(x.H * x.y) : '–'}</td></tr>`;
    const X = kind === 'n' ? o.n : o.e;
    h += `<tr class="sum"><td>Σ</td><td>${n(X.SV)}</td><td>${n(X.SH)}</td><td></td><td></td><td>${n(X.Mr)}</td><td>${n(X.Md)}</td></tr></tbody></table></div>`;
    return h;
  }
  const g1sym = () => ({ dry: 'γ1', sub: 'γ1′', mix: 'γ1m' })[o.g.g1mode];
  function stabReport(X, no, elim, kp, kfx = '') {
    const slideHead = `<h3>${no}.4 抗滑動檢核（設止滑榫）</h3>${kfx}`;
    const ok = (b, s) => `${s}　${b ? 'OK!' : 'NG!'}`;
    return `<h3>${no}.2 抗傾覆檢核</h3>
      ${eq('FS = Mr / Md = ' + n(X.Mr) + ' / ' + n(X.Md), n(X.FSo), ok(X.okO, '≥ ' + n(X.fso, 1)), true)}
      ${eq('e = B/2 − (Mr − Md)/ΣV', n(X.e), ok(X.okE, `B/${elim}=${n(o.g.B / elim)}`) , true)}
      <h3>${no}.3 抗承載檢核（建築物基礎構造設計規範(112) 式(4.3-1)、表4.3-1、表4.3-2）</h3>
      <div class="scroll"><table class="t"><thead><tr><th></th><th>${g1sym()} (tf/m³)</th><th>ϕ1 (度)</th><th>c1 (tf/m²)</th><th>Fcd</th><th>Fci</th><th>Fqd</th><th>Fqi</th><th>Frd</th><th>Fri</th></tr></thead>
      <tbody><tr><td>承載層</td><td>${n(X.g1)}</td><td>${n(P.phiF, 1)}</td><td>${n(P.cF)}</td><td>${n(X.Fcd)}</td><td>${n(X.Fci)}</td><td>${n(X.Fqd)}</td><td>${n(X.Fci)}</td><td>${n(X.Fqd)}</td><td>${n(X.Fri)}</td></tr></tbody></table></div>
      ${eq(`Nc = ${n(X.Nc, 1)}，Nq = ${n(X.Nq, 1)}，Nγ = ${n(X.Nr, 1)}（表4.3-1，ϕ1 = ${X.phiT}°）`, '', '')}
      ${eq('載重傾角 β = atan(ΣH/ΣV)', n(X.beta), '度')}
      ${(() => { const Y = o.g.Y, hw = Math.min(Y, o.g.h2);
        return hw > 0
          ? eq(`q = γ2·(Y − hw) + γ2′·hw = ${n(P.gB)} × ${n(Y - hw)} + ${n(o.g.g2s)} × ${n(hw)}（Y = Df + D1 + D2 = ${n(P.Df)} + ${n(P.D1)} + ${n(P.D2)} = ${n(Y)} m，hw = min(Y, Hw2) = ${n(hw)} m）`, n(X.q), 'tf/m²')
          : eq(`q = γ2·Y = ${n(P.gB)} × ${n(Y)}（Y = Df + D1 + D2 = ${n(P.Df)} + ${n(P.D1)} + ${n(P.D2)} = ${n(Y)} m）`, n(X.q), 'tf/m²'); })()}
      ${(() => { const f = v => n(v, 3), t1 = P.cF * X.Nc * X.Fcd * X.Fci, t2 = X.q * X.Nq * X.Fqd * X.Fci, t3 = 0.5 * X.g1 * X.Bp * X.Nr * X.Fqd * X.Fri;
        return eq(`有效寬度 B' = B − 2|e| = ${n(o.g.B)} − 2 × ${n(Math.abs(X.e), 3)}（第4.3.2節解說，Meyerhof 有效面積法）`, n(X.Bp), 'm')
          + eq(`qu = c1·Nc·Fcd·Fci + q·Nq·Fqd·Fqi + ½·${g1sym()}·B'·Nγ·Fγd·Fγi<br>　= ${n(P.cF)} × ${n(X.Nc, 1)} × ${f(X.Fcd)} × ${f(X.Fci)} + ${n(X.q)} × ${n(X.Nq, 1)} × ${f(X.Fqd)} × ${f(X.Fci)} + 0.5 × ${n(X.g1)} × ${n(X.Bp)} × ${n(X.Nr, 1)} × ${f(X.Fqd)} × ${f(X.Fri)}<br>　= ${n(t1)} + ${n(t2)} + ${n(t3)}`, n(X.qu), 'tf/m²', true); })()}
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
      ${(() => { const Y = o.g.Y, Kd = P.Kd, gs = X.ppWet ? 'γ1′' : 'γ1';
        return eq(`止滑榫平均有效垂直應力 σ′v,avg = ${gs}·(Y + Kd/2) = ${n(X.gp)} × (${n(Y)} + ${n(Kd)}/2)` + (X.ppWet ? '（地下水位高於止滑榫底，採 γ1′ = γ1 − γw）' : ''), n(X.svAvg), 'tf/m²')
          + eq(`Pp = σ′v,avg·Kp·Kd = ${n(X.svAvg)} × ${n(X.Kp, 3)} × ${n(Kd)}`, n(X.Pp), 'tf'); })()}
      ${eq("L' = B − 2|e|", n(X.Lp), 'm')}
      ${eq('L1 = min[Kc, Kd/tan(45−ϕ1/2)]', n(X.L1), 'm')}
      ${eq("V1 = L1/L'·ΣV", n(X.V1), 'tf')}
      ${eq('V2 = ΣV − V1', n(X.V2), 'tf')}
      ${eq('ΣHu = V1·tanϕ1 + V2·tan(2ϕ1/3) + (c1/2)·B + 50%·Pp', n(X.Hu), 'tf')}
      ${eq('ΣHd', n(X.SH), 'tf')}
      ${eq('FS = ΣHu / ΣHd', n(X.FSs), ok(X.okS, '≥ ' + n(X.fss, 1)), true)}</div><div class="sf-fig">${RWDraw.slide()}</div></div>`;
  }
  function rcReport(r) {
    return `<h4>${r.title}</h4>
      ${r.z !== null ? eq('斷面位置 z（自牆頂）', n(r.z), 'm') : ''}
      ${eq('斷面厚度 t ／ 有效深度 d', n(r.t, 1) + ' / ' + n(r.d), 'cm')}
      ${eq(`常時 Vu：${o.cf.combN} ／ 地震時 Vu：${o.cf.combE}`, n(r.Vun) + ' / ' + n(r.Vue), 'tf/m')}
      ${eq('Vu = max(常時, 地震時)', n(r.Vu), 'tf/m', true)}
      ${eq(`φVc = ${n(o.cf.pv)}×0.53√fc'·b·d`, n(r.pVc), r.okV ? 'φVc≥Vu OK!' : 'φVc<Vu NG!')}
      ${eq(`常時 Mu${o.cf.cn.length > 1 ? '（' + o.cf.cn[r.gn].tag + ' 控制）' : ''} ／ 地震時 Mu${o.cf.ce.length > 1 ? '（' + o.cf.ce[r.ge].tag + ' 控制）' : ''}`, n(r.Mun) + ' / ' + n(r.Mue), 'tf·m/m')}
      ${eq('Mu = max(常時, 地震時)', n(r.Mu), 'tf·m/m', true)}
      ${eq('Rn = Mu/(φb·b·d²)', n(r.Rn, 3), 'kgf/cm²')}
      ${eq(`ρ = (1/m)[1 − √(1 − 2mRn/fy)]，fy = ${n(r.fy, 0)}，m = fy/0.85fc' = ` + n(r.m, 3), r.rho > 1 ? '斷面不足' : n(r.rho, 4), '')}
      ${r.rhoT2 ? eq('ρmin ／ 4ρ/3 ／ ρt/2', n(r.rhoMin, 4) + ' / ' + n(r.rho43, 4) + ' / ' + n(r.rhoT2, 4), '') + eq('採用 ρ = max{ρ, min(ρmin, 4ρ/3), ρt/2}', n(r.rhoU, 4), '') : eq('ρmin ／ 4ρ/3', n(r.rhoMin, 4) + ' / ' + n(r.rho43, 4), '') + eq('採用 ρ = max[ρ, min(ρmin, 4ρ/3)]', n(r.rhoU, 4), '')}
      ${eq('As = ρ·b·d', n(r.Asr), 'cm²/m', true)}
      ${eq(`As'（${r.desc}）`, n(r.Asp), r.okM ? "As'≥As OK!" : "As'<As NG!", true)}`;
  }
  // 2.4 擋土牆配筋設計總表（鋼筋編號／長度／號數／間距／深度／配置／需求 As／設計 As／設計結果／備註）
  function rebarTable() {
    const B = P.bars, rc = o.rc, okc = (b, t) => `<span class="${b ? '' : 'ngt'}">${t}　${b ? 'OK!' : 'NG!'}</span>`;
    const gov = list => list.reduce((a, r) => (r.Asr / Math.max(r.Asp, 1e-9) > a.Asr / Math.max(a.Asp, 1e-9) ? r : a), list[0]);
    const row = (k, lab, hasL, H, cfg, Asr, Asp, okM, okV) => `<tr><td>${lab}</td><td class="in">${hasL && B[k].L ? n(B[k].L) : ''}</td><td class="in">${B[k].s > 0 ? B[k].D : ''}</td><td class="in">${B[k].s > 0 ? B[k].s : ''}</td>
      <td>${H === null ? '' : n(H)}</td><td>${cfg}</td><td>${Asr === null ? '' : n(Asr)}</td><td>${Asp === null ? '' : n(Asp)}</td>
      <td class="res">${okM === null ? '' : okc(okM, '≧As')}</td><td class="res">${okV === null ? '' : okc(okV, 'ψVc ≧ Vu')}</td></tr>`;
    const st = [rc[2], rc[1], rc[0]], hS4 = gov(rc.filter(r => r.desc === 'S4')), hS5 = gov(rc.filter(r => r.desc === 'S5'));
    const mn = k => o.min.find(m => m.k === k);
    const vS4 = rc.filter(r => r.desc === 'S4').every(r => r.okV), vS5 = rc.filter(r => r.desc === 'S5').every(r => r.okV);
    return `<div class="scroll"><table class="t rbt"><thead><tr><th rowspan="2">鋼筋編號</th><th>長度</th><th>號數</th><th>間距</th><th>深度</th><th>鋼筋</th><th>需求</th><th>設計</th><th rowspan="2">設計結果</th><th rowspan="2">備註</th></tr>
      <tr><th>L (m)</th><th>db (mm)</th><th>S (cm)</th><th>H (m)</th><th>配置</th><th>As (cm²)</th><th>As,des (cm²)</th></tr></thead><tbody>
      ${row('S1', 'S1', true, st[0].z, 'S1', st[0].Asr, st[0].Asp, st[0].okM, st[0].okV)}
      ${row('S2', 'S2', true, st[1].z, 'S1+S2', st[1].Asr, st[1].Asp, st[1].okM, st[1].okV)}
      ${row('S3', 'S3', true, st[2].z, 'S1+S2+S3', st[2].Asr, st[2].Asp, st[2].okM, st[2].okV)}
      ${row('S4', 'S4、S6', false, null, 'S4、S6', hS4.Asr, hS4.Asp, rc.filter(r => r.desc === 'S4').every(r => r.okM), vS4)}
      ${row('S5', 'S5、S7', false, null, 'S5、S7', hS5.Asr, hS5.Asp, rc.filter(r => r.desc === 'S5').every(r => r.okM), vS5)}
      ${row('S8', 'S8', false, null, 'S8', mn('S8').Asr, mn('S8').Asp, mn('S8').ok, null)}
      ${row('T1', 'T1', false, null, '2×T1', mn('T1').Asr, mn('T1').Asp, mn('T1').ok, null)}
      ${row('T2', 'T2', false, null, '2×T2', mn('T2').Asr, mn('T2').Asp, mn('T2').ok, null)}
    </tbody></table></div>`;
  }
  function barTable() {
    const rows = [['S1', '牆身主筋'], ['S2', '牆身補強'], ['S3', '牆身補強'], ['S4', '基礎版上層 S4、S6'], ['S5', '基礎版下層 S5、S7'], ['S8', '暴露面垂直筋'], ['T1', '牆身水平筋'], ['T2', '基礎溫度筋']];
    return `<div class="scroll"><table class="t"><thead><tr><th>編號</th><th>說明</th><th>長度 (m)</th><th>號數</th><th>間距 (cm)</th><th>As (cm²/m)</th></tr></thead><tbody>${rows.map(([k, d]) => `<tr><td>${k}</td><td style="text-align:left">${d}</td><td>${P.bars[k].L !== undefined ? n(P.bars[k].L) : '–'}</td><td>D${P.bars[k].D}</td><td>${P.bars[k].s}</td><td>${n(o.bar[k].As)}</td></tr>`).join('')}</tbody></table></div>`;
  }
  // 1.8 土壓力係數彙整：KA、KAE、KP、KPE 之計算方法／公式／參數／數值
  function kTable() {
    const p = P, N = o.n, Q = o.e, d1 = v => n(v, 1) + '°';
    const pa = `ϕ2 = ${d1(N.phi)}、δ = ${d1(N.delta)}、θ = ${d1(N.theta)}、α = ${d1(N.alpha)}`;
    const ka = N.kaOvr ? ['指定值', '—', '—']
      : p.kam === 'rankine'
        ? (N.alpha === 0 ? ['Rankine，式(7.3-6)', mK('A', mTan2('−')), `ϕ2 = ${d1(N.phi)}`]
          : ['Rankine（地表傾斜）', mK('A', B_KAR), `ϕ2 = ${d1(N.phi)}、α = ${d1(N.alpha)}`])
        : ['Coulomb，式(7.3-5)', mK('A', B_KA), pa];
    const kae = Q.kaeOvr ? [`指定值（式(7.3-12) 計算值 = ${n(Q.KaeCalc, 3)}）`, '—', '—']
      : p.kaem === 'rankine' ? ['擬靜態 Rankine（式(7.3-12) 令 δ = θ = 0，虛擬背面垂直、不計牆面摩擦）', mK('AE', B_KAER),
        `ϕ2 = ${d1(N.phi)}、α = ${d1(N.alpha)}、φ = tan⁻¹[kh/(1+kv)] = ${n(Q.vphi)}°（kv 取 ${Q.kvPhi === 0 ? '0' : n(-Q.kvPhi, 3)}，向下為正）`]
      : ['Mononobe-Okabe，式(7.3-12)', mK('AE', B_KAE),
        `ϕ2 = ${d1(N.phi)}、δ = ${d1(Q.delta)}（地震時）、θ = ${d1(N.theta)}、α = ${d1(N.alpha)}、φ = tan⁻¹[kh/(1+kv)] = ${n(Q.vphi)}°（kv 取 ${Q.kvPhi === 0 ? '0' : n(-Q.kvPhi, 3)}，向下為正）`];
    const pf = `ϕ1 = ${d1(p.phiF)}（承載層）`;
    const kp = N.kpOvr ? ['指定值', '—', '—']
      : p.kpm === 'coulomb' ? ['Coulomb', mK('P', B_KP), `${pf}、δp = ${d1(Q.deltaP)}、θ = α = 0°`]
      : p.kpm === 'ckc' ? ['Caquot-Kerisel（查圖），第7.3.3節、圖-解7.3-1', mK('P', `<mi>R</mi><mo>·</mo><msub><mi>K</mi><mi mathvariant="normal">P</mi></msub><mo stretchy="false">(</mo><mi>δ</mi><mo>/</mo><mi>ϕ</mi><mo>=</mo><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo>`) + (N.ck.outChart ? '<br>KP(δ/ϕ=−1) 超出圖框，改以 tan²(45°+ϕ/2)/R(δ=0) 反推' : '<br>KP(δ/ϕ=−1)：圖-解7.3-1 θ = 0° 曲線讀值'),
          `${pf}、δp = ${d1(Q.deltaP)}、δ/ϕ = ${n(N.ck.rat, 3)}、R = ${n(N.ck.R, 3)}（表）、KP(δ/ϕ=−1) = ${n(N.ck.Kp1, 2)}（${N.ck.outChart ? '反推' : '查圖'}）`]
      : p.kpm === 'ck' ? ['Caquot-Kerisel（反推），第7.3.3節、圖-解7.3-1', mK('P', `<mi>R</mi><mo>·</mo><msub><mi>K</mi><mi mathvariant="normal">P</mi></msub><mo stretchy="false">(</mo><mi>δ</mi><mo>/</mo><mi>ϕ</mi><mo>=</mo><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo>`) + '<br>' + `<math displaystyle="true"><mrow><msub><mi>K</mi><mi mathvariant="normal">P</mi></msub><mo stretchy="false">(</mo><mi>δ</mi><mo>/</mo><mi>ϕ</mi><mo>=</mo><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo><mo>=</mo>${mFrac(mTan2('+'), '<mi>R</mi><mo stretchy="false">(</mo><mi>δ</mi><mo>=</mo><mn>0</mn><mo stretchy="false">)</mo>')}</mrow></math>`,
          `${pf}、δp = ${d1(Q.deltaP)}、δ/ϕ = ${n(N.ck.rat, 3)}、R = ${n(N.ck.R, 3)}、KP(δ/ϕ=−1) = ${n(N.ck.Kp1, 3)}`]
      : ['Rankine', mK('P', mTan2('+')), pf];
    const kpe = Q.kpeOvr ? ['指定值', '—', '—']
      : p.kpem === 'rankine0' ? ['Rankine（同常時 Rankine KP，不計地震對被動土壓之折減）', mK('PE', mTan2('+')), pf]
      : p.kpem === 'rankine' ? ['擬靜態 Rankine（式(7.3-14) 令 δ = θ = α = 0；kh = 0 時即 tan²(45° + ϕ/2)）', mK('PE', B_KPER), `${pf}、φ = ${n(Q.vphi)}°`]
      : ['Mononobe-Okabe，式(7.3-14)', mK('PE', B_KPE),
        `${pf}、δ = ${d1(Q.deltaPE)}、θ = α = 0°（止滑榫前緣垂直、地表水平）、φ = ${n(Q.vphi)}°`];
    const row = (k, nm, r, v) => `<tr><td style="white-space:nowrap">${k}</td><td style="text-align:left;min-width:7em">${nm}</td><td style="text-align:left;min-width:9em">${r[0]}</td><td class="fxc" style="text-align:left">${r[1]}</td><td style="text-align:left">${r[2]}</td><td><b>${n(v, 3)}</b></td></tr>`;
    return `<div class="scroll"><table class="t"><thead><tr><th style="white-space:nowrap">係數</th><th>說明</th><th>計算方法</th><th>公式</th><th>採用參數</th><th>數值</th></tr></thead><tbody>
      ${row('KA', '常時主動（牆背土壤）', ka, N.Ka)}${row('KAE', '地震時主動（牆背土壤）', kae, Q.Kae)}
      ${row('KP', '常時被動（止滑榫前）', kp, N.Kp)}${row('KPE', '地震時被動（止滑榫前）', kpe, Q.Kp)}</tbody></table></div>
      <p class="note">依據：建築物基礎構造設計規範(112) 第7.3.2～7.3.5節。ϕ 為土壤內摩擦角，δ 為牆面摩擦角，θ 為牆背面與垂直面交角，α 為地表面與水平面交角，φ 為地震合成角。</p>`;
  }
  function report() {
    const p = P, N = o.n, Q = o.e, g = o.g;
    const kpLab = (N.kpOvr ? 'Kp' : p.kpm === 'coulomb' ? `Kp（Coulomb，δp = ${n(Q.deltaP, 1)}°）` : p.kpm === 'ckc'
      ? `Kp = R·Kp(δ/ϕ=−1)（Caquot-Kerisel 查圖，圖-解7.3-1；δp = ${n(Q.deltaP, 1)}°，δ/ϕ = ${n(N.ck.rat, 3)}，R = ${n(N.ck.R, 3)}（表），Kp(δ/ϕ=−1) = ${n(N.ck.Kp1, 2)}（${N.ck.outChart ? 'ϕ 超出圖框，以 tan²(45+ϕ/2)/R(0) 反推' : 'θ = 0° 曲線讀值'}））`
      : p.kpm === 'ck'
      ? `Kp = R·Kp(δ/ϕ=−1)（Caquot-Kerisel 反推，圖-解7.3-1；δp = ${n(Q.deltaP, 1)}°，δ/ϕ = ${n(N.ck.rat, 3)}，R = ${n(N.ck.R, 3)}，Kp(δ/ϕ=−1) = tan²(45+ϕ/2)/R(0) = ${n(N.ck.Kp1, 3)}）`
      : 'Kp = tan²(45 + ϕ/2)（Rankine）') + (N.kpOvr ? '（指定值）' : '');
    const kaLab = N.kaOvr ? 'Ka（指定值）' : p.kam === 'rankine'
      ? (N.alpha === 0 ? 'Ka = tan²(45 − ϕ/2)（Rankine，式(7.3-6)）' : 'Ka（Rankine 傾斜地表）')
      : 'Ka（Coulomb，式(7.3-5)）';
    const kaMeth = N.kaOvr ? '指定值' : p.kam === 'rankine' ? 'Rankine' : 'Coulomb';
    const inclLab = !N.kaOvr && p.kam === 'rankine' ? 'α' : 'δ+θ';
    const kpeLab = Q.kpeOvr ? 'KPE（指定值）' : p.kpem === 'rankine0' ? 'KPE = tan²(45 + ϕ/2)（Rankine）' : p.kpem === 'rankine' ? `KPE（擬靜態 Rankine，δ = θ = α = 0，φ = ${n(Q.vphi)}°）` : `KPE（第7.3.5節 Mononobe-Okabe，θ = α = 0，δ = ${n(Q.deltaPE, 1)}°，φ = ${n(Q.vphi)}°）`;
    let h = `<h1 class="rtitle">擋土牆設計及分析計算（H = <b class="hv">${n(p.H)}</b> m）</h1>${p.id ? `<p class="rid">計算書編號：${p.id}</p>` : ''}
    <div class="rt" data-rt="1"><h2>1. 設計依據</h2><div class="sec-in">
    <h3>1.1 材料參數</h3>
    <div class="scroll"><table class="t"><thead><tr><th></th><th>γ (tf/m³)</th><th>γ′ = γ − γw (tf/m³)</th><th>ϕ (度)</th><th>c (tf/m²)</th></tr></thead><tbody>
      <tr><td>回填土（γ2、γ2′、ϕ2、c2）</td><td>${n(p.gB)}</td><td>${n(o.g.g2s)}</td><td>${n(p.phiB, 1)}</td><td>${n(p.cB)}</td></tr>
      <tr><td>承載層（γ1、γ1′、ϕ1、c1）</td><td>${n(p.gF)}</td><td>${n(o.g.g1s)}</td><td>${n(p.phiF, 1)}</td><td>${n(p.cF)}</td></tr>
      <tr><td>混凝土</td><td>${n(p.gC)}</td><td>NA</td><td>NA</td><td>NA</td></tr></tbody></table></div>
    <h3>1.2 地表超載重及地下水位</h3>
    ${eq('牆背地表超載 qs（活載重 L）', n(p.qs), 'tf/m/m')}
    ${eq(`牆背地下水位 Hw1 = ${n(p.hw1r, 3)} × H`, n(o.hw1), 'm')}
    ${eq('牆前地下水位 Hw2（自基礎底面；負值表示位於基底以下）', o.hw2 === null ? '無地下水' : n(o.hw2), o.hw2 === null ? '' : 'm')}
    ${eq('基底下 B 範圍平均單位重（式(4.3-1) 第三項）' + ({ dry: '：γ1（水位位於基底下 B 以深或無地下水）', sub: '：γ1′ = γ1 − γw（基底位於水位以下）', mix: `：γ1m = γ1′ + (dw/B)·γw，dw = ${n(o.g.dw)} m` })[o.g.g1mode], n(o.g.g1), 'tf/m³')}
    <h3 class="keep">1.3 載重組合（${o.cf.name}）</h3>
    <div class="scroll"><table class="t"><thead><tr><th></th><th>穩定分析</th><th>配筋設計</th></tr></thead><tbody>
      <tr><td>常時</td><td>D+L+H+F</td><td>${o.cf.combN}</td></tr>
      <tr><td>地震時</td><td>D+L+H+F+EQ</td><td>${o.cf.combE}</td></tr></tbody></table></div>
    <p class="note keep">D：靜載重（含踵版上土重、超載重）；H：側向土壓力（含超載側壓）；F：水壓力；EQ：地震力（動態土壓增量、牆體慣性力、動水壓）。${P.code === 'hw' ? '地震時（表3.3 分類Ⅶ）浮力 B 欄 β＝1，靜水壓與揚壓力 F 以 1.3 計入；Westergaard 動水壓屬 EQ。' : ''}</p>
    ${eq('強度折減因子：彎矩 φb ／ 剪力 φv', n(o.cf.pb) + ' / ' + n(o.cf.pv), '')}
    <h3>1.4 材料設計強度</h3>
    ${eq("混凝土強度 fc'", n(p.fc, 0), 'kgf/cm²')}${eq('鋼筋降伏強度 fy（D13 以上）', n(p.fy, 0), 'kgf/cm²')}${eq('鋼筋降伏強度 fy（D10）', n(p.fy10, 0), 'kgf/cm²')}
    <h3>1.5 地震係數</h3>
    <div class="scr-only">
    ${(() => { const st = o.site; if (!st) return '';
      if (st.mode === 'tpe') return eq('工址：臺北盆地微分區（表2-6(c)）', st.zone, '') + eq('工址短週期設計水平譜加速度係數 SDS ／ 轉角週期 T0D', n(st.SDS, 2) + ' / ' + n(st.T0, 2), '—, 秒');
      let t = eq('工址（表2-1）', `${st.county} ${st.town}`, '') + eq('地盤分類（第2.5節）', CLS.find(c => c[0] === st.cls)[1], '')
        + eq('震區係數 SSᴰ ／ S1ᴰ ／ SSᴹ ／ S1ᴹ（表2-1）', `${n(st.base.SSD)} / ${n(st.base.S1D)} / ${n(st.base.SSM)} / ${n(st.base.S1M)}`, '');
      for (const f of st.faults) t += eq(`近斷層：${f.name}，R = ${f.r === null ? '未輸入（視為 ≥ 14 km）' : n(f.r, 1) + ' km'}（表2-3-1～2-3-4）`, `${n(f.v.SSD)} / ${n(f.v.S1D)} / ${n(f.v.SSM)} / ${n(f.v.S1M)}`, '');
      if (st.faults.length) t += eq('採用 SSᴰ ／ S1ᴰ ／ SSᴹ ／ S1ᴹ（各斷層取大值）', `${n(st.adj.SSD)} / ${n(st.adj.S1D)} / ${n(st.adj.SSM)} / ${n(st.adj.S1M)}`, '');
      return t + eq('工址放大係數 Fa（表2-4(a)）', n(st.Fa, 3), '') + eq('SDS = Fa·SSᴰ（式2-4）', n(st.SDS, 3), '');
    })()}
    ${o.site ? eq('PGAh = 0.4·SDS（設計地震，回歸期 475 年）', n(o.site.pgaH, 3), 'g') + eq(`PGAv = ${o.site.vr === 0 ? '0' : o.site.vr > 0.6 ? '2/3' : '1/2'} × PGAh（${o.site.vrNote}）`, n(o.site.pgaV, 3), 'g') : ''}
    ${o.site ? '' : eq('地表水平向 ／ 垂直向尖峰加速度 PGAh ／ PGAv', n(p.pgaH, 3) + ' / ' + n(p.pgaV, 3), 'g')}
    ${eq(`kh 建議值 = ${p.khRes ? '1.5' : '0.5'} × PGAh${p.khRes ? '（側向位移完全受限）' : ''} ／ kv 建議值 = 0.5 × PGAv`, n(o.khS, 3) + ' / ' + n(o.kvS, 3), '')}
    </div>
    ${eq('採用 kh ／ kv（kv 向下為正）', n(p.kh, 3) + ' / ' + n(p.kv, 3), p.kh < o.khS - 1e-9 ? '※ kh 小於規範解說建議值' : '')}
    <div class="scr-only">
    ${eq('牆體變位模式', o.mv.name, '')}
    <p class="note">依建築物基礎構造設計規範(112) 第7.3.4節解說3。</p>
    </div>
    <h3>1.6 安全係數</h3>
    <div class="scroll"><table class="t"><thead><tr><th></th><th>常時</th><th>地震時</th></tr></thead><tbody>
      <tr><td>抗滑動</td><td>${n(p.fss_n, 1)}</td><td>${n(p.fss_e, 1)}</td></tr>
      <tr><td>抗傾覆</td><td>${n(p.fso_n, 1)}</td><td>${n(p.fso_e, 1)}</td></tr>
      <tr><td>抗承載</td><td>${n(p.fsb_n, 1)}</td><td>${n(p.fsb_e, 1)}</td></tr></tbody></table></div>
    <p class="note keep">依建築物基礎構造設計規範(112) 第7.4.1節（滑動）、第7.4.2節（傾覆）、第7.4.3節（支承力）；公路橋梁設計規範 第6.2.8節。</p>
    <h3>1.7 保護層</h3>${eq("保護層厚度 d'", n(p.cover, 1), 'cm')}
    <div class="sec18"><h3>1.8 土壓力參數</h3>${eq('牆背摩擦角比 δ/ϕ2：常時 ／ 地震時', n(p.deltaR, 3) + ' / ' + n(p.deltaRE, 3), '')}${eq('牆背摩擦角 δ = (δ/ϕ2)·ϕ2：常時 ／ 地震時', n(N.delta, 1) + ' / ' + n(Q.delta, 1), '度')}${eq('被動牆面摩擦角比 δp/ϕ1：常時 ／ 地震時', n(P.deltaRP, 3) + ' / ' + n(P.deltaRPE, 3), '')}${eq('被動牆面摩擦角 δp = (δp/ϕ1)·ϕ1：常時 ／ 地震時', n(o.dpN, 1) + ' / ' + n(o.dpE, 1), '度')}${kTable()}${N.ck && !N.ck.inRange ? '<p class="note">※ 承載層 ϕ 超出圖-解7.3-1 表列範圍（10°～45°），以邊界值計算。</p>' : ''}${N.ck && N.ck.outChart ? '<p class="note">※ 承載層 ϕ 大於 38°，圖-解7.3-1 θ = 0° 曲線已超出圖框，Kp(δ/ϕ=−1) 改以 tan²(45+ϕ/2)/R(δ=0) 反推。</p>' : ''}${p.kpm !== 'rankine' && Q.deltaP > 2 * p.phiF / 3 + 1e-9 ? '<p class="note">※ δp 大於 2ϕ1/3，第7.3.3節解說3規定設計採用之牆面摩擦角不宜大於 2ϕ/3。</p>' : ''}</div></div>

    </div><div class="rt" data-rt="2"><h2>2. 擋土牆設計尺寸及分析結果</h2>
    <h3>2.1 擋土牆設計尺寸</h3>
    <div class="dimrow"><div class="dimtab">    <div class="scroll"><table class="t"><tbody>
      ${[['(1) 牆身頂寬 T', p.T], ['(2) 牆體全高 H', p.H], ['(3) 牆身高度 h = H − D1 − D2', g.h], ['(4) 基礎寬度 B = C + S + E', g.B], ['(5) 基礎趾長 C', p.C],
        ['(6) 牆身底寬 S = S1 + T + S2', p.S], ['(7) 基礎踵長 E', p.E], ['(8) 基礎上高 D1', p.D1], ['(9) 基礎下高 D2', p.D2], ['(10) 牆前斜率 η1 = S1/h', g.eta1], ['(11) 牆背斜率 η2 = S2/h', g.eta],
        ['(12) 止滑榫深度 Kd', p.Kd], ['(13) 止滑榫寬 Ks', p.Ks], ['(14) 止滑榫位置 Kc', p.Kc], ['(15) 趾端覆土 Df', p.Df], ['(16) 牆前回填 Y = Df + D1 + D2', g.Y]]
        .map(([a, b]) => `<tr><td>${a}${a.includes('η') ? '' : ' (m)'}</td><td>${n(b, a.includes('η') ? 3 : 2)}</td></tr>`).join('')}
      <tr><td>(17) 背填坡度</td><td>1V : ${p.n}H</td></tr>
      ${[['(18) 牆身前底寬 S1', g.S1f], ['(19) 牆身後底寬 S2', g.S2b]].map(([a, b]) => `<tr><td>${a} (m)</td><td>${n(b)}</td></tr>`).join('')}</tbody></table></div></div>
    <div class="dimimg"><div class="dimmask" role="img" aria-label="擋土牆設計尺寸示意圖"></div><img class="dimprint" src="wall-dims-v3.png" alt=""></div></div>
    <h3>2.2 穩定分析結果（常時）</h3>${stabTable(N, 6)}
    <h3>2.3 穩定分析結果（地震時）</h3>${stabTable(Q, 3)}
    <h3>2.4 擋土牆配筋設計</h3>${rebarTable()}

    </div><div class="rt" data-rt="3"><h2>3. 穩定分析（常時）</h2>
    <p class="note">穩定分析時，將擋土牆本身及趾（踵）版上方之填土視為一整體。</p>
    <h3>3.1 作用力計算</h3>
    <h4>a. 土壓力（${kaMeth === '指定值' ? '主動土壓力係數指定值' : kaMeth + ' 主動土壓力係數'}）</h4>
    ${eq('ϕ2 ／ δ ／ θ ／ α', `${n(N.phi, 1)} / ${n(N.delta, 1)} / ${n(N.theta, 1)} / ${n(N.alpha, 1)}`, '度')}
    ${eq(kaLab, n(N.Ka, 3), '', true)}
    ${!N.kaOvr && p.kam === 'rankine' && (N.theta !== 0 || N.alpha !== 0) ? '<p class="note">式(7.3-6) 適用於地表水平、牆背垂直且不計牆面摩擦之情況；本例採 Rankine 解，合力平行地表（傾角 α），未計牆面摩擦 δ 與牆背傾角 θ。</p>' : ''}
    ${eq('Pa = ½·γ2·H²·Ka　式(7.3-4)（水位以下採浸水單位重 γ2′ = γ2 − γw）', n(N.Pa), 'tf/m')}
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

    </div><div class="rt" data-rt="4"><h2>4. 穩定分析（地震時）</h2>
    <h3>4.1 動態主動土壓力（建築物基礎構造設計規範(112) 第7.3.4節，${P.kaem === 'rankine' ? '擬靜態 Rankine' : 'Mononobe-Okabe'}）</h3>
    <p class="note">ϕ 為牆背土壤內摩擦角，φ 為地震合成角；θ 為牆背面與垂直面交角（逆時針為正），α 為牆背地表面與水平面之交角。本法原則上只適用於非凝聚性土壤。</p>
    ${eq(`φ = tan⁻¹[kh/(1+kv)] = tan⁻¹[${n(P.kh, 3)}/(1+${Q.kvPhi === 0 ? '0' : n(-Q.kvPhi, 3)})]` + (P.kvPhi0 === false ? '' : '（kv ＝ 0）'), n(Q.vphi), '度')}
    ${P.kvPhi0 === false ? '' : `<p class="note">註：計算 φ 時 kv 取 0（不採第6節輸入之 kv）。依據：建築物基礎構造設計規範(112) 第7.3.4節【解說】3：「設計所採用之垂直向地震係數 kv，原則上可取基地地表垂直向尖峰加速度值之半估計，惟對於遠距離之地震，通常可忽略垂直地震力之影響，即令 kv ＝ 0。」</p>`}
    ${eq('ϕ2 − φ − α', n(Q.crit), Q.okCrit ? '≥ 0 OK!' : '< 0 NG!（回填土失穩，KAE 無解）')}
    ${Q.kaeOvr ? '' : P.kaem === 'rankine' ? FX_KAER : FX_KAE}
    ${eq('ϕ2 ／ δ（地震時）／ θ ／ α' + (P.kaem === 'rankine' ? '（擬靜態 Rankine 取 δ = θ = 0）' : ''), `${n(N.phi, 1)} / ${n(Q.deltaA, 1)} / ${n(Q.thetaA, 1)} / ${n(N.alpha, 1)}`, '度')}
    ${eq(Q.kaeOvr ? `KAE（指定值；式(7.3-12) 計算值 = ${n(Q.KaeCalc, 3)}）` : 'KAE', n(Q.Kae, 3), '', true)}
    ${eq('PAE = ½·γ2·H²·(1+kv)·KAE　式(7.3-11)（kv 向下為正；水位以下採浸水單位重 γ2′ = γ2 − γw，即 KAE(1+kv)·Σ）', n(Q.Pae), 'tf/m')}
    ${eq('ΔPAE = PAE − PA　式(解7.3-4)', n(Q.dPae), 'tf/m')}
    ${eq(`PAEh = PAE·cos(${P.kaem === 'rankine' ? 'α' : 'δ+θ'}) ／ yae`, n(Q.Paeh) + ' / ' + n(Q.yae), 'tf, m')}
    ${eq(`PAEv = PAE·sin(${P.kaem === 'rankine' ? 'α' : 'δ+θ'}) ／ xae`, n(Q.Paev) + ' / ' + n(Q.xae), 'tf, m')}
    ${eq(`合力作用點（${o.mv.name}）` + ({ rotBase: '：H̄ = [PA·yA + ΔPAE·(2H/3)]/PAE　式(解7.3-5)', slide: '：H̄ = [PA(0.42H) + ΔPAE(0.48H)]/PAE　式(解7.3-7)', rotTop: '：H̄ = 0.55H' }[P.mvm] || ''), n(Q.yae), 'm', true)}
    ${P.mvm === 'rotBase' ? `<p class="note">yA = ${n(N.ya)} m 為靜態主動土壓力實際形心（無地下水時即 H/3）。</p>` : ''}
    ${eq('PQEh（超載）／ yqe', n(Q.Pqeh) + ' / ' + n(Q.yqe), 'tf, m')}
    ${eq('PQEv（超載）／ xqe', n(Q.Pqev) + ' / ' + n(Q.xqe), 'tf, m')}
    <p class="note">依第7.3.7節第1款，均布超載折算為等值填土高度計算側壓，故地震時超載以 KAE 計算，其動態增量作用點比照 ΔPAE 之變位模式取用。</p>
    ${eq(`PWE（含動水壓增量 ΔPWE = ${n(P.pwRed ?? 1, 2)} × (7/12)·kh·γw·Hw1²，作用於 0.4Hw1，第7.3.6節解說3 式(解7.3-8)、(解7.3-9)${(P.pwRed ?? 1) < 1 ? '；折減依解說4' : ''}）／ ywe`, n(Q.Pwe) + ' / ' + n(Q.ywe), 'tf, m')}
    <h4>d. 作用力總表</h4><div class="sidefig"><div class="sf-main">${forceTable(o.items, Q.ext, 'e')}</div><div class="sf-fig">${RWDraw.blocks()}</div></div>
    ${stabReport(Q, 4, 3, kpeLab, Q.kpeOvr ? '' : P.kpem === 'rankine0' ? '' : P.kpem === 'rankine' ? FX_KPER : FX_KPE)}

    </div><div class="rt" data-rt="5"><h2><span class="scr-only">5. 配筋設計（USD）</span><span class="prt-only">5. 配筋設計（採用 USD 法設計）</span></h2>
    <h3>5.1 設計條件</h3>
    <div class="scr-only">
    <div class="conds"><p>1. 牆身與基礎交界為剛性區。</p><p>2. 牆身、趾版及踵版視為懸臂梁（公路橋梁設計規範 6.2.2、6.2.3）。</p>
    <p>3. 地震時土壓動態增量作用點依牆體變位模式（${o.mv.name}，第7.3.4節解說2，以斷面深度 z 取代 H），${P.stemInert === false ? '不計牆身慣性力' : '並計入牆身慣性力'}。</p><p>4. 基礎版依地盤反力分 40 等分條帶，沿版長逐斷面計算 V、M；配筋時地盤反力以因數化載重（各分項乘載重係數）重新計算，版底揚壓力（${o.base.upUni ? '均佈：踵版 γw·Hw1、趾版 γw·Hw2' : '梯形分布，同穩定分析 Pb'}）乘 F 係數自版上載重扣除。踵版、趾版均分別檢核正、反向彎矩（上層、下層鋼筋），剪力取各斷面絕對值最大者。${o.heelSino ? '踵版配筋層：M = ∫(地盤反力 − 版上載重)·力臂，最大值配頂層筋 S4、最小值配底層筋 S5。' : ''}</p>
    <p class="keep">5. 載重組合（${o.cf.name}）：常時 ${o.cf.combN}；地震時 ${o.cf.combE}。${o.cf.note || ''}多組組合時取最不利者。</p></div>
    ${eq("m = fy/0.85fc'（D13 以上）", n(o.m, 3), '')}${eq('ρmin（D13 以上）', n(o.rhoMin, 4), '')}<p class="note">主筋含 D10 之斷面以 fy = ${n(p.fy10, 0)} kgf/cm² 計算 m 與 ρmin。</p>
    </div>
    <div class="prt-only">
    ${(() => { const k = o.stemK, phiTxt = r => Math.abs(r) < 1e-9 ? '0' : Math.abs(r - 0.5) < 1e-9 ? 'ϕ/2' : Math.abs(r - 2 / 3) < 1e-6 ? '2ϕ/3' : Math.abs(r - 1 / 3) < 1e-6 ? 'ϕ/3' : n(r, 3) + 'ϕ';
      const rN = k.dN / N.phi, rE = k.dE / N.phi;
      return `<div class="conds c51">
      <p>1. 牆身與基礎交界為剛性區。</p>
      <p>2. 牆身、基礎趾端、基礎踵端均視為承受橫向載重之懸臂梁分析。</p>
      <p>3. 牆身材料強度：<span class="c51t"><span>混凝土抗壓強度，fc' = <b class="hl">${n(p.fc, 0)}</b> kgf/cm²</span><span>鋼筋降伏強度，fy = <b class="hl">${n(p.fy, 0)}</b> kgf/cm²</span></span></p>
      <p>4. 土壓力直接作用於牆背上，牆身與土壤之界面摩擦角：　δ = ${phiTxt(rN)}（平時）；δ = ${phiTxt(rE)}（地震時）</p>
      <p>5. 主動土壓力係數：平時，Ka = <b class="hl">${n(k.Ka, 3)}</b>　　地震時，Kae = <b class="hl">${n(k.Kae, 3)}</b></p></div>`; })()}
    </div>
    <h3>5.2 牆身設計</h3>${(() => { const k = o.stemK; return eq(`設計用牆背摩擦角 δ：常時 ／ 地震時${k.ovrN || k.ovrE ? '（另行指定）' : '（同穩定分析）'}`, n(k.dN, 1) + ' / ' + n(k.dE, 1), '度') + eq('Ka ／ KAE', n(k.Ka, 3) + ' / ' + n(k.Kae, 3), '') + eq(k.cos ? '水平係數 Ka·cos(δ+θ) ／ KAE·(1+kv)·cos(δ+θ)' : '水平係數 Ka ／ KAE·(1+kv)（不乘 cos(δ+θ)）', n(o.KAH, 3) + ' / ' + n(o.KAEH, 3), ''); })()}${o.rc.slice(0, 3).map(rcReport).join('')}
    ${o.min.slice(0, 2).map((m, i) => `<h4>(${i + 4}) ${m.title}</h4>${eq('ρt', n(m.rho, 4), '')}${eq('As = ' + m.basis, n(m.Asr), 'cm²/m', true)}${eq("As'", n(m.Asp), m.ok ? "As'≥As OK!" : "As'<As NG!", true)}`).join('')}
    <h3>5.3 基礎版設計</h3>
    ${eq('q0（超載）／ q1（填土）／ q2（版重）', `${n(o.base.q0)} / ${n(o.base.q1)} / ${n(o.base.q2)}`, 'tf/m²')}
    ${o.base.upH > 0 || o.base.upT > 0 ? eq(`版底揚壓力（${o.base.upUni ? '均佈：踵版 γw·Hw1、趾版 γw·Hw2' : '梯形，同 Pb'}）：踵版 ／ 趾版`, `${n(o.base.upH)} / ${n(o.base.upT)}`, 'tf/m²') : ''}
    <p class="note">踵版：w = LV·q0 + D·(q1 + q2) − F·γw·h − q（向下為正，正彎矩上層受拉）；趾版：w = q + F·γw·h − D·q2（向上為正，正彎矩下層受拉）。q 為因數化地盤反力。</p>
    ${baseTables()}
    ${o.rc.slice(3).map(rcReport).join('')}
    ${[o.min[2]].map(m => `<h4>(3) ${m.title}</h4>${eq('ρt', n(m.rho, 4), '')}${eq('As = ' + m.basis, n(m.Asr), 'cm²/m', true)}${eq("As'", n(m.Asp), m.ok ? "As'≥As OK!" : "As'<As NG!", true)}`).join('')}`;
    h += `</div><div class="rt" data-rt="6">${qtyReport()}</div>`;
    document.getElementById('report').innerHTML = h;
    showRT(curRT);
    markCodeRefs(document.getElementById('report'));
    // 數值儲存格標記（列印時以藍字表示）
    document.querySelectorAll('#report table.t td').forEach(td => { if (/^\s*[-−+]?[\d.,]+(\s*\/\s*[-−+]?[\d.,]+)*\s*$/.test(td.textContent)) td.classList.add('nv'); });
    // 列印頁尾：計算書編號-頁碼（比照計算書排版）
    let ps = document.getElementById('pageFoot'); if (!ps) { ps = document.createElement('style'); ps.id = 'pageFoot'; document.head.appendChild(ps); }
    const fid = String(P.id || 'RW').replace(/["\\]/g, '');
    ps.textContent = `@page { @bottom-right { content: "${fid}-" counter(page); font-family: "Noto Sans TC", "Microsoft JhengHei", system-ui, sans-serif; font-size: 8.5pt; color: #000; } }`;
  }

  function run() {
    RW.syncDims(P);
    try { o = RW.compute(P); } catch (e) { console.error(e); return; }
    updateSite();
    for (const [k, v] of [['h', o.g.h], ['B', o.g.B], ['eta', o.g.eta], ['eta1', o.g.eta1], ['S', o.g.S], ['Y', o.g.Y], ['hw1', o.hw1], ['khS', o.khS], ['g1', o.g.g1], ['kvS', o.kvS], ['dN', o.n.delta], ['dE', o.e.delta], ['dpN', o.dpN], ['dpE', o.dpE]]) {
      const el = document.getElementById('in_c_' + k); if (el) el.textContent = n(v, ['eta', 'eta1', 'khS', 'kvS'].includes(k) ? 3 : 2);
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
    f.text().then(t => { const raw = JSON.parse(t); P = fix(Object.assign(clone(RW.DEFAULTS), raw), raw); save(); buildForm(); fmtSymbols(form); run(); }).catch(() => alert('檔案格式錯誤'));
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
