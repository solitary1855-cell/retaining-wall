/* 懸臂式擋土牆分析與設計 — 計算核心（與 Excel 試算表邏輯一致） */
(function (root) {
  const R = d => d * Math.PI / 180, D = r => r * 180 / Math.PI;
  const sin = x => Math.sin(R(x)), cos = x => Math.cos(R(x)), tan = x => Math.tan(R(x));

  // 建築物基礎構造設計規範(112) 表4.3-1：[Nc, Nq, Nγ]
  const NTAB = [[5.3,1.0,0],[5.3,1.1,0],[5.3,1.1,0],[5.3,1.2,0],[5.3,1.3,0],[5.3,1.4,0],[5.3,1.5,0],[5.3,1.6,0],
    [5.3,1.7,0],[5.3,1.8,0],[5.3,1.9,0],[5.5,2.1,0],[5.8,2.2,0],[6.0,2.4,0],[6.2,2.5,1.1],[6.5,2.7,1.2],[6.7,2.9,1.3],
    [7.0,3.1,1.5],[7.3,3.4,1.6],[7.6,3.6,1.8],[7.9,3.9,2.0],[8.2,4.2,2.2],[8.6,4.5,2.4],[9.0,4.8,2.7],[9.4,5.2,3.0],
    [9.9,5.6,3.3],[10.4,6.0,3.6],[10.9,6.5,4.0],[11.4,7.1,4.4],[13.2,8.3,5.4],[15.3,9.8,6.6],[17.9,11.7,8.4],
    [20.9,14.1,10.6],[24.7,17.0,13.7],[29.3,20.8,17.8],[35.1,25.5,23.2],[42.2,31.6,30.5],[51.2,39.6,41.4],
    [62.5,49.8,57.6],[77.0,63.4,80.0],[95.7,81.2,114.0]];
  const BARS = { 10: 0.7133, 13: 1.267, 16: 1.986, 19: 2.865, 22: 3.871, 25: 5.067, 29: 6.469, 32: 8.143, 36: 10.07 };
  const CODES = {
    // 配筋載重組合分項係數（每種狀況可有多組，取最不利）：
    // D 靜載重（牆體、填土自重）、LV 超載垂直分量、LH 超載側壓、H 側向土壓力、F 水壓力（靜水壓、揚壓力）、EQ 地震力（動態增量、慣性力、動水壓）
    hw: { name: '公路橋梁設計規範',
      cn: [{ D: 1.3, LV: 1.3, LH: 1.69, H: 1.69, F: 1.3, EQ: 0 }],
      ce: [{ D: 1.3, LV: 1.3, LH: 1.69, H: 1.69, F: 1.3, EQ: 1.3 }],
      combN: '1.3D + 1.69H + 1.3F', combE: '1.3D + 1.69H + 1.3F + 1.3EQ',
      note: '依第3.23節表3.3：γ＝1.3，擋土牆側向土壓 βE＝1.3、垂直土壓 βE＝1.0、受撓構材 βD＝1.0；水壓比照浮力 B（分類Ⅰ、Ⅶ 之 β＝1）取 1.3，地震時（分類Ⅶ）亦計入。', pb: 0.9, pv: 0.85, s8: 0.0018, t1: 0.0025, t2: 0.0018 },
    // 112年混凝土規範 表5.3.1 + 第5.3.7節：H（含土中水壓）一律 1.6；超載為活載重 L；
    // 常時 (5.3.1b) 1.2D+1.6L+1.6H，另依解說以 0.9D 檢核靜載重有利之斷面；地震時 (5.3.1e) 1.2D+1.0E+1.0L+1.6H、(5.3.1g) 0.9D+1.0E+1.6H
    c112: { name: '112年建築物基礎構造設計規範／混凝土結構設計規範',
      cn: [{ D: 1.2, LV: 1.6, LH: 1.6, H: 1.6, F: 1.6, EQ: 0, tag: '1.2D+1.6L+1.6H' },
           { D: 0.9, LV: 1.6, LH: 1.6, H: 1.6, F: 1.6, EQ: 0, tag: '0.9D+1.6L+1.6H' }],
      ce: [{ D: 1.2, LV: 1.0, LH: 1.0, H: 1.6, F: 1.6, EQ: 1.0, tag: '1.2D+1.0E+1.0L+1.6H' },
           { D: 0.9, LV: 0, LH: 0, H: 1.6, F: 1.6, EQ: 1.0, tag: '0.9D+1.0E+1.6H' }],
      combN: '1.2D + 1.6L + 1.6H（另以 0.9D 檢核）', combE: '1.2D + 1.0E + 1.0L + 1.6H、0.9D + 1.0E + 1.6H',
      note: '依112年建築物混凝土結構設計規範表5.3.1：常時 (5.3.1b)、地震時 (5.3.1e)、(5.3.1g)；第5.3.7節 H 含土中水壓，載重因數 1.6；地表超載視為活載重 L（亦可於第3節改為永久載重）。',
      pb: 0.9, pv: 0.75, s8: 0.0015, t1: 0.0025, t2: 0.0018 }
  };

  const DEFAULTS = {
    id: 'RW-1',
    // 預設條件比照「道路工程參考圖」R-008：回填土 γ=1.9、活載重相當 60cm 土重、Z=0.33、f'c=210、牆背設濾層洩水（不計水位）；
    // 承載層採緊密礫石級配（R-008 附註10：承載力不足時挖除以礫石級配回填）
    gB: 1.9, phiB: 30, cB: 0, gF: 2.1, phiF: 38, cF: 0, gC: 2.4, gW: 1.0,
    qs: 1.14, qsType: 'L', hw1r: 0, hw2: null,
    fc: 210, fy: 4200, fy10: 2800, code: 'hw', kh: 0.165, kv: 0, pgaH: 0.33, pgaV: 0, khRes: false, kvPhi0: true, mvm: 'rotBase',
    fss_n: 1.5, fss_e: 1.2, fso_n: 2.0, fso_e: 1.5, fsb_n: 3.0, fsb_e: 2.0,
    cover: 7.5, deltaR: 2 / 3, deltaRE: 2 / 3, deltaRP: 2 / 3, deltaRPE: 2 / 3, kam: 'coulomb', kaOvr: null, kaeOvr: null, kaem: 'mo', kpm: 'rankine', kpem: 'mo', kpOvr: null, kpeOvr: null,
    preset: '', T: 0.30, H: 2.00, C: 0.00, S: 0.40, E: 1.40, D1: 0.00, D2: 0.40, Kd: 0.30, Kc: 0.00, Df: 0.80, n: 0, Ks: 0.30,
    bars: {
      S1: { L: 1.6, D: 16, s: 30 }, S2: { L: 0, D: 16, s: 30 }, S3: { L: 0, D: 16, s: 15 },
      S4: { D: 16, s: 20 }, S5: { D: 16, s: 30 }, S8: { D: 19, s: 30 }, T1: { D: 19, s: 30 }, T2: { D: 19, s: 30 }
    }
  };

  function coulombKa(phi, delta, theta, alpha) {
    return cos(phi - theta) ** 2 / (cos(theta) ** 2 * cos(delta + theta) *
      (1 + Math.sqrt(Math.max(0, sin(phi + delta) * sin(phi - alpha)) / (cos(delta + theta) * cos(theta - alpha)))) ** 2);
  }
  // Caquot-Kerisel 被動土壓力係數（牆面垂直、地表水平）：依基礎規範(112) 圖-解7.3-1（NAVFAC DM7.2）
  // Kp = R(ϕ, −δ/ϕ)·Kp(δ/ϕ=−1)；δ = 0 時 Caquot-Kerisel 解即 Rankine，故 Kp(δ/ϕ=−1) = tan²(45+ϕ/2) / R(ϕ, 0)
  const CK_PHI = [10, 15, 20, 25, 30, 35, 40, 45], CK_RAT = [-0.7, -0.6, -0.5, -0.4, -0.3, -0.2, -0.1, 0];
  const CK_R = [
    [.978, .962, .946, .929, .912, .898, .881, .864], [.961, .934, .907, .881, .854, .830, .803, .775],
    [.939, .901, .862, .824, .787, .752, .716, .678], [.912, .860, .808, .759, .711, .666, .620, .574],
    [.878, .811, .746, .686, .627, .574, .520, .467], [.836, .752, .674, .603, .536, .475, .417, .362],
    [.783, .682, .592, .512, .439, .375, .316, .262], [.718, .600, .500, .414, .339, .276, .221, .174]];
  const lerp = (xs, ys, x) => { if (x <= xs[0]) return ys[0]; for (let i = 1; i < xs.length; i++) if (x <= xs[i]) return ys[i - 1] + (ys[i] - ys[i - 1]) * (x - xs[i - 1]) / (xs[i] - xs[i - 1]); return ys[ys.length - 1]; };
  function ckR(phi, rat) {   // rat = −δ/ϕ ∈ [−1, 0]；−1～−0.7 之間以 R(−1) = 1 線性內插
    const row = r => rat >= -0.7 ? lerp(CK_RAT, r, rat) : lerp([-1, -0.7], [1, r[0]], rat);
    return lerp(CK_PHI, CK_R.map(row), phi);
  }
  // 圖-解7.3-1 被動曲線 θ = 0°、δ/ϕ = −1 之 Kp 數位化值（ϕ = 0～38°，每 1°；ϕ > 38° 曲線超出圖框）
  const CK_CHART0 = [1.0, 1.06, 1.12, 1.18, 1.24, 1.3, 1.37, 1.44, 1.52, 1.6, 1.69, 1.78, 1.88, 1.98, 2.1, 2.22, 2.35, 2.5, 2.66, 2.83, 3.02, 3.22, 3.45, 3.71, 3.98, 4.29, 4.64, 5.02, 5.46, 5.94, 6.48, 7.09, 7.78, 8.56, 9.44, 10.44, 11.59, 12.9, 14.39];
  function ckKpChart(phi, delta) {
    const b = ckKp(phi, delta);
    if (phi < 0 || phi > 38) return { ...b, chart: true, outChart: true };
    const i = Math.min(37, Math.floor(phi)), t = phi - i;
    const Kp1 = Math.exp(Math.log(CK_CHART0[i]) * (1 - t) + Math.log(CK_CHART0[i + 1]) * t);   // 對數刻度內插
    return { ...b, Kp1, Kp: b.R * Kp1, chart: true, outChart: false };
  }
  function ckKp(phi, delta) {
    const ph = Math.min(45, Math.max(10, phi)), rat = -Math.min(1, Math.abs(delta) / ph);
    const R = ckR(ph, rat), R0 = ckR(ph, 0), Kp1 = tan(45 + ph / 2) ** 2 / R0;
    return { Kp: R * Kp1, R, R0, Kp1, rat, inRange: phi >= 10 && phi <= 45 };
  }
  // Rankine 主動土壓力係數；α = 0 時即式(7.3-6) tan²(45 − ϕ/2)，合力平行地表（傾角 α）
  function rankineKa(phi, alpha) {
    const r = Math.sqrt(Math.max(0, cos(alpha) ** 2 - cos(phi) ** 2));
    return cos(alpha) * (cos(alpha) - r) / (cos(alpha) + r);
  }
  // 建築物基礎構造設計規範(112) 式(7.3-12)：ϕ=內摩擦角、φ=地震合成角(此處參數名 vphi)
  // 若 ϕ−φ−α < 0（回填土失穩），根號項取 0 並由 Q.okCrit 標示 NG
  function moKae(phi, delta, theta, alpha, vphi) {
    return cos(phi - theta - vphi) ** 2 / (cos(vphi) * cos(theta) ** 2 * cos(delta + vphi + theta) *
      (1 + Math.sqrt(Math.max(0, sin(phi + delta) * sin(phi - vphi - alpha)) / (cos(delta + vphi + theta) * cos(theta - alpha)))) ** 2);
  }
  function coulombKp(phi, delta, theta, alpha) {
    return cos(phi + theta) ** 2 / (cos(theta) ** 2 * cos(delta - theta) *
      (1 - Math.sqrt(sin(phi + delta) * sin(phi + alpha) / (cos(delta - theta) * cos(alpha - theta)))) ** 2);
  }
  // 建築物基礎構造設計規範(112) 式(7.3-14)
  function moKpe(phi, delta, theta, alpha, vphi) {
    return cos(phi + theta - vphi) ** 2 / (cos(vphi) * cos(theta) ** 2 * cos(delta - theta + vphi) *
      (1 - Math.sqrt(Math.max(0, sin(phi + delta) * sin(phi - vphi + alpha)) / (cos(delta - theta + vphi) * cos(alpha - theta)))) ** 2);
  }
  // 第7.3.4節解說2：牆體變位模式與作用點（自基礎底面，以 H 之倍數表示）
  const MVM = {
    rotBase: { name: '對牆底旋轉', s: null, d: 2 / 3 },   // PA 於 H/3（本程式取靜態土壓實際形心），ΔPAE 於 2H/3
    slide: { name: '滑移', s: 0.42, d: 0.48 },            // PA 於 0.42H，ΔPAE 於 0.48H
    rotTop: { name: '對牆頂旋轉', s: null, d: null, t: 0.55 } // PAE 於 0.55H
  };

  function compute(inp) {
    const p = Object.assign({}, inp);
    const o = { p };
    const cf0 = CODES[p.code] || CODES.hw;
    // 超載性質：L＝活載重（依 L 係數）；D＝永久載重（垂直分量歸 D、側壓歸 H）
    const qsPerm = p.qsType === 'D';
    const adj = f => qsPerm ? { ...f, LV: f.D, LH: f.H } : f;
    const cf = { ...cf0, cn: cf0.cn.map(adj), ce: cf0.ce.map(adj) };
    if (p.code === 'c112' && qsPerm) { cf.combN = '1.2D + 1.6H（另以 0.9D 檢核；超載歸 D、H）'; cf.combE = '1.2D + 1.0E + 1.6H、0.9D + 1.0E + 1.6H（超載歸 D、H）'; }
    o.cf = cf;
    // geometry
    const g = o.g = {};
    g.h = p.H - p.D1 - p.D2; g.B = p.C + p.S + p.E; g.eta = (p.S - p.T) / g.h; g.Y = p.Df + p.D1 + p.D2;   // 牆前回填高度（自基底），Df 為牆身前緣處趾版頂面以上覆土
    g.Ws = g.B - p.C - p.T;
    const B = g.B, h = g.h;
    o.hw1 = p.hw1r * p.H;
    // 牆前水位 Hw2（自基底）：空白＝無地下水；正值＝基底以上水深；負值＝水位在基底以下 |Hw2|
    const hw2 = (p.hw2 === null || p.hw2 === undefined || p.hw2 === '' || !isFinite(p.hw2)) ? null : +p.hw2;
    o.hw2 = hw2; g.h2 = Math.max(0, hw2 ?? 0);
    g.dw = hw2 === null ? Infinity : Math.max(0, -hw2);   // 基底至地下水位深度
    // 式(4.3-1) γ1：基礎板底以下 B 深度範圍內之平均單位重，水位以下取有效單位重
    g.g1 = g.dw >= B ? p.gF : (p.gF - p.gW) + g.dw / B * p.gW;
    g.g1s = p.gF - p.gW; g.g2s = p.gB - p.gW;   // 浸水單位重 γ1′（承載層）、γ2′（回填土）
    g.g1mode = g.dw >= B ? 'dry' : g.dw > 0 ? 'mix' : 'sub';
    o.rhoMin = p.code === 'hw' ? 14 / p.fy : Math.max(0.8 * Math.sqrt(p.fc) / p.fy, 14 / p.fy);

    // ---------- 常時 ----------
    const N = o.n = {};
    N.phi = p.phiB; N.delta = p.deltaR * p.phiB; N.theta = D(Math.atan(g.eta));
    N.alpha = p.n === 0 ? 0 : D(Math.atan(1 / p.n));
    const useOvr = v => v !== null && v !== undefined && v !== '' && isFinite(v);
    N.kaOvr = useOvr(p.kaOvr);
    N.Ka = N.kaOvr ? +p.kaOvr : p.kam === 'rankine' ? rankineKa(N.phi, N.alpha) : coulombKa(N.phi, N.delta, N.theta, N.alpha);
    // 合力傾角（自水平）：Coulomb 為 δ+θ；Rankine 平行地表為 α
    N.incl = !N.kaOvr && p.kam === 'rankine' ? N.alpha : N.delta + N.theta;
    N.H1 = Math.max(0, p.H - o.hw1);
    const gB = p.gB, gp = p.gB - p.gW, hw1 = o.hw1;
    N.Ip = 0.5 * gB * N.H1 ** 2 + gB * N.H1 * hw1 + 0.5 * gp * hw1 ** 2;
    N.Ipm = 0.5 * gB * N.H1 ** 2 * (hw1 + N.H1 / 3) + gB * N.H1 * hw1 * hw1 / 2 + 0.5 * gp * hw1 ** 3 / 3;
    N.Pa = N.Ka * N.Ip; N.Pah = N.Pa * cos(N.incl); N.Pav = N.Pa * sin(N.incl);
    N.ya = N.Ipm / N.Ip; N.xa = B;
    N.Pqh = p.qs * N.Ka * p.H; N.yq = p.H / 2; N.Pqv = p.qs * g.Ws; N.xq = p.C + p.T + g.Ws / 2;
    const h2 = g.h2;
    N.Pw = 0.5 * p.gW * (hw1 ** 2 - h2 ** 2);
    N.yw = N.Pw === 0 ? 0 : p.gW * (hw1 ** 3 - h2 ** 3) / 6 / N.Pw;
    N.Pb = p.gW * (hw1 + h2) / 2 * B;
    N.xb = hw1 + h2 === 0 ? B / 2 : B * (h2 + 2 * hw1) / (3 * (hw1 + h2));
    const ta = tan(N.alpha), C = p.C, S = p.S, T = p.T, E = p.E, D1 = p.D1, D2 = p.D2, gc = p.gC;
    o.items = [
      ['(1) 牆身矩形', T * h * gc, C + T / 2, D1 + D2 + h / 2],
      ['(2) 牆身下基礎', S * (D1 + D2) * gc, C + S / 2, (D1 + D2) / 2],
      ['(3) 趾版矩形', C * D2 * gc, C / 2, D2 / 2],
      ['(4) 踵版矩形', E * D2 * gc, C + S + E / 2, D2 / 2],
      ['(5) 趾版斜坡', 0.5 * C * D1 * gc, 2 * C / 3, D2 + D1 / 3],
      ['(6) 踵版斜坡', 0.5 * E * D1 * gc, C + S + E / 3, D2 + D1 / 3],
      ['(7) 牆背斜面', 0.5 * (S - T) * h * gc, C + T + (S - T) / 3, D1 + D2 + h / 3],
      ['(8) 踵版上填土', E * h * gB, C + S + E / 2, D1 + D2 + h / 2],
      ['(9) 背填坡填土', 0.5 * g.Ws ** 2 * ta * gB, C + T + 2 * g.Ws / 3, p.H + g.Ws * ta / 3],
      ['(10) 牆背斜面上填土', 0.5 * (S - T) * h * gB, C + T + 2 * (S - T) / 3, D1 + D2 + 2 * h / 3],
      ['(11) 踵版斜坡上填土', 0.5 * E * D1 * gB, C + S + 2 * E / 3, D2 + 2 * D1 / 3],
      ['(12) 趾版上覆土', C * (p.Df + D1 / 2) * gB, C / 2, (g.Y + D2 + D1 / 2) / 2],
      ['(13) 牆前積水', p.gW * Math.max(0, g.h2 - g.Y) * C, C / 2, g.Y + Math.max(0, g.h2 - g.Y) / 2],
      ['(14) 止滑榫', (p.Kd > 0 ? (p.Ks || 0) * p.Kd : 0) * gc, p.Kc + (p.Ks || 0) / 2, -p.Kd / 2]
    ].map(([name, W, x, y]) => ({ name, W, x, y }));
    o.SW = o.items.reduce((a, b) => a + b.W, 0);
    o.SWx = o.items.reduce((a, b) => a + b.W * b.x, 0);
    o.SWy = o.items.reduce((a, b) => a + b.W * b.y, 0);
    N.ext = [
      { name: 'Pah 主動土壓水平', H: N.Pah, y: N.ya }, { name: 'Pav 主動土壓垂直', V: N.Pav, x: N.xa },
      { name: 'Pqh 超載水平', H: N.Pqh, y: N.yq }, { name: 'Pqv 超載垂直', V: N.Pqv, x: N.xq },
      { name: 'Pw 水壓', H: N.Pw, y: N.yw }, { name: 'Pb 揚壓力', V: -N.Pb, x: N.xb }];
    N.SV = o.SW + N.Pav + N.Pqv - N.Pb;
    N.SH = N.Pah + N.Pqh + N.Pw;
    N.Mr = o.SWx + N.Pav * N.xa + N.Pqv * N.xq - N.Pb * N.xb;
    N.Md = N.Pah * N.ya + N.Pqh * N.yq + N.Pw * N.yw;

    // ---------- 地震 ----------
    const Q = o.e = {};
    const mv = o.mv = MVM[p.mvm] || MVM.rotBase;
    // 第7.3.4節解說3：kh 取地表水平向尖峰加速度之半（側向位移完全受限取1.5倍）；kv 取垂直向之半
    o.khS = (p.khRes ? 1.5 : 0.5) * p.pgaH; o.kvS = 0.5 * p.pgaV;
    // 地震合成角 φ：勾選 kvPhi0 時依第7.3.4節解說3（遠距離地震可忽略垂直地震力）令 kv = 0，否則採輸入之 kv
    Q.kvPhi = p.kvPhi0 === false ? p.kv : 0;
    Q.vphi = D(Math.atan(p.kh / (1 - Q.kvPhi)));
    Q.crit = N.phi - Q.vphi - N.alpha; Q.okCrit = Q.crit >= 0;
    Q.delta = p.deltaRE * p.phiB;   // 地震時牆背摩擦角（獨立輸入）
    // KAE：Mononobe-Okabe 式(7.3-12)；或擬靜態 Rankine（虛擬背面垂直、不計牆面摩擦：式(7.3-12) 令 δ = θ = 0）
    if (p.kaem !== 'rankine') p.kaem = 'mo';
    const rkE = p.kaem === 'rankine';
    Q.deltaA = rkE ? 0 : Q.delta; Q.thetaA = rkE ? 0 : N.theta;
    Q.inclE = rkE ? N.alpha : Q.delta + N.theta;   // 合力傾角（自水平）
    Q.KaeCalc = moKae(N.phi, Q.deltaA, Q.thetaA, N.alpha, Q.vphi);
    Q.kaeOvr = useOvr(p.kaeOvr);
    Q.Kae = Q.kaeOvr ? +p.kaeOvr : Q.KaeCalc;
    Q.Pae = Q.Kae * (1 - p.kv) * N.Ip; Q.Paeh = Q.Pae * cos(Q.inclE); Q.Paev = Q.Pae * sin(Q.inclE);
    Q.dPae = Q.Pae - N.Pa; Q.dPaeh = Q.Paeh - N.Pah;
    // 合力作用點 H̄：式(解7.3-5)、(解7.3-7)、對牆頂旋轉 0.55H
    const hbar = (S, yS, T) => T === 0 ? 0 : mv.t ? mv.t * p.H :
      (S * (mv.s === null ? yS : mv.s * p.H) + (T - S) * mv.d * p.H) / T;
    Q.yae = hbar(N.Pah, N.ya, Q.Paeh); Q.xae = B;
    Q.Pqeh = p.qs * Q.Kae * (1 - p.kv) * p.H;
    // 超載：靜態部分維持 H/2，動態增量依變位模式（規範未另規定，比照 ΔPAE）
    Q.yqe = Q.Pqeh === 0 ? 0 : mv.t ? mv.t * p.H : (N.Pqh * N.yq + (Q.Pqeh - N.Pqh) * mv.d * p.H) / Q.Pqeh;
    Q.Pqev = N.Pqv; Q.xqe = N.xq;
    const dPw = 7 / 12 * p.kh * p.gW * hw1 ** 2;
    Q.Pwe = N.Pw + dPw; Q.ywe = Q.Pwe === 0 ? 0 : (N.Pw * N.yw + dPw * 0.4 * hw1) / Q.Pwe;
    Q.Pbe = N.Pb; Q.xbe = N.xb;
    Q.ext = [
      { name: 'PAEh 動態主動土壓水平', H: Q.Paeh, y: Q.yae }, { name: 'PAEv 動態主動土壓垂直', V: Q.Paev, x: Q.xae },
      { name: 'Pqeh 超載水平', H: Q.Pqeh, y: Q.yqe }, { name: 'Pqev 超載垂直', V: Q.Pqev, x: Q.xqe },
      { name: 'Pwe 水壓', H: Q.Pwe, y: Q.ywe }, { name: 'Pbe 揚壓力', V: -Q.Pbe, x: Q.xbe }];
    // 分項載重（配筋用因數化分析）：c = D / H / F / EQ
    const yAs = mv.t ? mv.t * p.H : mv.s === null ? N.ya : mv.s * p.H, yAd = mv.t ? mv.t * p.H : mv.d * p.H;
    const yQs = mv.t ? mv.t * p.H : N.yq;
    const itemComp = it => ({ c: it.name.startsWith('(13)') ? 'F' : 'D', V: it.W, x: it.x });
    N.comp = [...o.items.map(itemComp),
      { c: 'H', H: N.Pah, y: N.ya }, { c: 'H', V: N.Pav, x: N.xa }, { c: 'LH', H: N.Pqh, y: N.yq }, { c: 'LV', V: N.Pqv, x: N.xq },
      { c: 'F', H: N.Pw, y: N.yw }, { c: 'F', V: -N.Pb, x: N.xb }];
    Q.comp = [...o.items.map(itemComp),
      ...o.items.map(it => ({ c: 'EQ', V: -p.kv * it.W, x: it.x })), ...o.items.map(it => ({ c: 'EQ', H: p.kh * it.W, y: it.y })),
      { c: 'H', H: N.Pah, y: yAs }, { c: 'EQ', H: Q.Paeh - N.Pah, y: yAd },
      { c: 'H', V: N.Pav, x: Q.xae }, { c: 'EQ', V: Q.Paev - N.Pav, x: Q.xae },
      { c: 'LH', H: N.Pqh, y: yQs }, { c: 'EQ', H: Q.Pqeh - N.Pqh, y: yAd }, { c: 'LV', V: Q.Pqev, x: Q.xqe },
      { c: 'F', H: N.Pw, y: N.yw }, { c: 'EQ', H: dPw, y: 0.4 * hw1 }, { c: 'F', V: -Q.Pbe, x: Q.xbe }];
    Q.SV = o.SW * (1 - p.kv) + Q.Paev + Q.Pqev - Q.Pbe;
    Q.SH = p.kh * o.SW + Q.Paeh + Q.Pqeh + Q.Pwe;
    Q.Mr = o.SWx * (1 - p.kv) + Q.Paev * Q.xae + Q.Pqev * Q.xqe - Q.Pbe * Q.xbe;
    Q.Md = p.kh * o.SWy + Q.Paeh * Q.yae + Q.Pqeh * Q.yqe + Q.Pwe * Q.ywe;

    // Kp
    // Kp：Rankine 或 Coulomb（承載層 ϕ、δp）；KPE：式(7.3-14)，止滑榫前緣為垂直面、地表水平（θ = α = 0）
    if (!['coulomb', 'ck', 'ckc'].includes(p.kpm)) p.kpm = 'rankine';
    // δp 直接採牆背摩擦角 δ（常時 Kp 用常時 δ，地震時 KPE 用地震時 δ）；Rankine 不計牆面摩擦
    // 被動牆面摩擦角 δp：以牆面摩擦角比 δ/ϕ 乘承載層 ϕ1 計算（常時、地震時分別）
    o.dpN = (p.deltaRP ?? p.deltaR) * p.phiF; o.dpE = (p.deltaRPE ?? p.deltaRE) * p.phiF;
    Q.deltaP = p.kpm === 'rankine' ? 0 : o.dpN;
    N.kpOvr = useOvr(p.kpOvr); Q.kpeOvr = useOvr(p.kpeOvr);
    N.ck = p.kpm === 'ck' ? ckKp(p.phiF, Q.deltaP) : p.kpm === 'ckc' ? ckKpChart(p.phiF, Q.deltaP) : null;
    N.Kp = N.kpOvr ? +p.kpOvr : p.kpm === 'coulomb' ? coulombKp(p.phiF, Q.deltaP, 0, 0) : N.ck ? N.ck.Kp : tan(45 + p.phiF / 2) ** 2;
    // KPE：Mononobe-Okabe 式(7.3-14)（δ 同 Kp 方法）；或擬靜態 Rankine（式(7.3-14) 令 δ = θ = α = 0，kh = 0 時即 tan²(45+ϕ/2)）
    // 或 Rankine（非擬靜態）：KPE = tan²(45+ϕ/2)，與常時 Rankine Kp 相同，不計地震對被動土壓之折減
    if (!['rankine', 'rankine0'].includes(p.kpem)) p.kpem = 'mo';
    Q.deltaPE = p.kpem === 'mo' && p.kpm !== 'rankine' ? o.dpE : 0;
    Q.Kp = Q.kpeOvr ? +p.kpeOvr : p.kpem === 'rankine0' ? tan(45 + p.phiF / 2) ** 2 : moKpe(p.phiF, Q.deltaPE, 0, 0, Q.vphi);

    for (const [X, sfx, elim] of [[N, 'n', 6], [Q, 'e', 3]]) stability(X, p, g, sfx, elim);

    // ---------- 配筋 ----------
    const bar = k => { const b = p.bars[k]; const Ab = BARS[b.D] || 0; return { Ab, As: b.s > 0 ? Ab * 100 / b.s : 0 }; };
    o.bar = {}; for (const k of Object.keys(p.bars)) o.bar[k] = bar(k);
    const KAH = N.Ka * cos(N.incl), KAEH = Q.Kae * (1 - p.kv) * cos(Q.inclE);
    o.KAH = KAH; o.KAEH = KAEH; o.m = p.fy / (0.85 * p.fc);
    const zw = Math.max(0, p.H - hw1);
    function stem(z) {
      const m = Math.min(z, zw), d = Math.max(0, z - zw);
      const Fe = KAH * (gB * m * m / 2 + gB * m * d + gp * d * d / 2);
      const Me = KAH * (gB * m * m / 2 * (d + m / 3) + gB * m * d * d / 2 + gp * d ** 3 / 6);
      const Fw = p.gW * d * d / 2, Mw = p.gW * d ** 3 / 6;
      const Fq = p.qs * N.Ka * z, Mq = p.qs * N.Ka * z * z / 2;
      const rat = KAEH / KAH - 1, dFq = (p.qs * Q.Kae * (1 - p.kv) - p.qs * N.Ka) * z, dFw = 7 / 12 * p.kh * p.gW * d * d;
      // 斷面以上土壓之作用點依變位模式（z 取代 H）
      const MeSoil = mv.t ? Fe * (1 + rat) * mv.t * z : (mv.s === null ? Me : Fe * mv.s * z) + Fe * rat * mv.d * z;
      const MqE = mv.t ? (Fq + dFq) * mv.t * z : Mq + dFq * mv.d * z;
      const Wst = (T * z + 0.5 * (S - T) * z * z / h) * gc + 0.5 * (S - T) * z * z / h * gB;
      const Mst = (T * z * z / 2 + 0.5 * (S - T) * z ** 3 / (3 * h)) * gc + 0.5 * (S - T) * z ** 3 / (3 * h) * gB;
      const Ve = Fe * (1 + rat) + Fw + dFw + Fq + dFq + p.kh * Wst, MeT = MeSoil + Mw + dFw * 0.4 * d + MqE + p.kh * Mst;
      // 地震時之 H 為靜態側壓（作用點依變位模式），超載靜態側壓為 LH，其餘為 EQ
      const MHs = mv.t ? Fe * mv.t * z : (mv.s === null ? Me : Fe * mv.s * z), MHq = mv.t ? Fq * mv.t * z : Mq;
      const VEQ = Ve - Fe - Fq - Fw, MEQ = MeT - MHs - MHq - Mw;
      const fN = f => ({ V: f.H * Fe + f.LH * Fq + f.F * Fw, M: f.H * Me + f.LH * Mq + f.F * Mw });
      const fE = f => ({ V: f.H * Fe + f.LH * Fq + f.F * Fw + f.EQ * VEQ, M: f.H * MHs + f.LH * MHq + f.F * Mw + f.EQ * MEQ });
      const un = env(cf.cn.map(fN)), ue = env(cf.ce.map(fE));
      return { Vn: Fe + Fw + Fq, Mn: Me + Mw + Mq, Ve, Me: MeT, Vun: un.V, Mun: un.M, Vue: ue.V, Mue: ue.M, gn: un.i, ge: ue.i };
    }
    // 多組載重組合取包絡（依 |M| 最大者，剪力另取最大）
    function env(list) {
      let iM = 0, iV = 0;
      list.forEach((r, i) => { if (r.M > list[iM].M) iM = i; if (r.V > list[iV].V) iV = i; });
      return { V: list[iV].V, M: list[iM].M, i: iM, iv: iV };
    }
    function design(title, z, t, f, Asp, desc) {
      const r = { title, z, t, desc, ...f };
      // 鋼筋降伏強度：D10 採 fy10，D13 以上採 fy；同一斷面混用時取小值
      const keys = desc.split('+').filter(k => p.bars[k] && p.bars[k].s > 0);
      r.fy = Math.min(...keys.map(k => p.bars[k].D <= 10 ? p.fy10 : p.fy));
      r.m = r.fy / (0.85 * p.fc);
      r.rhoMinS = p.code === 'hw' ? 14 / r.fy : Math.max(0.8 * Math.sqrt(p.fc) / r.fy, 14 / r.fy);
      r.d = t - p.cover;
      r.Vu = Math.max(f.Vun, f.Vue);
      r.pVc = cf.pv * 0.53 * Math.sqrt(p.fc) * 100 * r.d / 1000;
      r.okV = r.pVc >= r.Vu;
      r.Mu = Math.max(f.Mun, f.Mue, 0);
      r.Rn = r.Mu * 1e5 / (cf.pb * 100 * r.d ** 2);
      const k = 2 * r.m * r.Rn / r.fy;
      r.rho = k >= 1 ? 99 : (1 - Math.sqrt(1 - k)) / r.m;
      r.rhoMin = r.rhoMinS; r.rho43 = 4 / 3 * r.rho;
      r.rhoU = Math.max(r.rho, Math.min(r.rhoMin, r.rho43));
      r.Asr = r.rhoU * 100 * r.d; r.Asp = Asp; r.okM = Asp >= r.Asr;
      return r;
    }
    const tz = z => (T + (S - T) * z / h) * 100;
    const As = k => o.bar[k].As;
    o.rc = [];
    const z1 = h, z2 = h - p.bars.S3.L, z3 = h - p.bars.S2.L;
    o.rc.push(design('(1) 牆身鋼筋 S1+S2+S3（牆底）', z1, tz(z1), stem(z1), As('S1') + As('S2') + As('S3'), 'S1+S2+S3'));
    o.rc.push(design('(2) 牆身鋼筋 S1+S2（S3 斷筋處）', z2, tz(z2), stem(z2), As('S1') + As('S2'), 'S1+S2'));
    o.rc.push(design('(3) 牆身鋼筋 S1（S2 斷筋處）', z3, tz(z3), stem(z3), As('S1'), 'S1'));
    // base
    const tav = D2 + D1 / 2, q1 = gB * (p.H - tav), q2 = gc * tav, q0 = p.qs;
    o.base = { tav, q1, q2, q0 };
    const pres = (u, X) => Math.abs(X.e) <= B / 6 ? X.qt + (X.qh - X.qt) * u / B :
      (X.e > 0 ? Math.max(0, X.qt * (1 - u / X.a)) : Math.max(0, X.qh * (1 - (B - u) / X.a)));
    const NS = 20;
    function heel(X, f = { D: 1, LV: 1 }) { let V = 0, M = 0; const dx = E / NS; for (let i = 1; i <= NS; i++) { const x = (i - .5) * dx; const w = f.LV * q0 + f.D * (q1 + q2) - pres(B - x, X); V += w * dx; M += w * dx * (E - x); } return { V, M }; }
    function toe(X, f = { D: 1 }) { let V = 0, M = 0; const dx = C / NS; for (let i = 1; i <= NS; i++) { const u = (i - .5) * dx; const w = pres(u, X) - f.D * q2; V += w * dx; M += w * dx * (C - u); } return { V, M }; }
    // 因數化地盤反力：各分項載重乘係數後重算偏心與反力
    function factored(comp, f) {
      let SV = 0, Mr = 0, Md = 0;
      for (const k of comp) { const c = f[k.c]; if (k.V !== undefined) { SV += c * k.V; Mr += c * k.V * k.x; } if (k.H !== undefined) Md += c * k.H * k.y; }
      const X = { SV, e: B / 2 - (Mr - Md) / SV };
      X.a = Math.min(B, 3 * (B / 2 - Math.abs(X.e)));
      if (Math.abs(X.e) <= B / 6) { X.qt = SV / B * (1 + 6 * X.e / B); X.qh = SV / B * (1 - 6 * X.e / B); }
      else if (X.e > 0) { X.qt = 2 * SV / (3 * (B / 2 - X.e)); X.qh = 0; }
      else { X.qt = 0; X.qh = 2 * SV / (3 * (B / 2 + X.e)); }
      return X;
    }
    o.nu = cf.cn.map(f => factored(N.comp, f)); o.eu = cf.ce.map(f => factored(Q.comp, f));
    const hn = heel(N), he = heel(Q), tn = toe(N), te = toe(Q);
    const hnu = env(cf.cn.map((f, i) => heel(o.nu[i], f))), heu = env(cf.ce.map((f, i) => heel(o.eu[i], f)));
    const tnu = env(cf.cn.map((f, i) => toe(o.nu[i], f))), teu = env(cf.ce.map((f, i) => toe(o.eu[i], f)));
    const tb = (D2 + D1) * 100;
    o.rc.push(design('(1) 基礎踵端鋼筋 S4、S6（上層筋）', null, tb, { Vn: hn.V, Mn: hn.M, Ve: he.V, Me: he.M, Vun: hnu.V, Mun: hnu.M, Vue: heu.V, Mue: heu.M, gn: hnu.i, ge: heu.i }, As('S4'), 'S4'));
    o.rc.push(design('(2) 基礎趾端鋼筋 S5、S7（下層筋）', null, tb, { Vn: tn.V, Mn: tn.M, Ve: te.V, Me: te.M, Vun: tnu.V, Mun: tnu.M, Vue: teu.V, Mue: teu.M, gn: tnu.i, ge: teu.i }, As('S5'), 'S5'));
    const taS = (T + S) / 2 * 100;
    o.min = [
      { k: 'S8', title: '暴露面垂直鋼筋 S8（單層）', rho: cf.s8, Asr: cf.s8 * 100 * taS / 2, Asp: As('S8'), basis: `ρt·b·ta/2，ta = ${taS.toFixed(1)} cm` },
      { k: 'T1', title: '牆身水平鋼筋 T1（雙面）', rho: cf.t1, Asr: cf.t1 * 100 * taS, Asp: 2 * As('T1'), basis: `ρt·b·ta，ta = ${taS.toFixed(1)} cm` },
      { k: 'T2', title: '基礎溫度鋼筋 T2（雙面）', rho: cf.t2, Asr: cf.t2 * 100 * tav * 100, Asp: 2 * As('T2'), basis: `ρt·b·tav，tav = ${(tav * 100).toFixed(1)} cm` }
    ].map(x => ({ ...x, ok: x.Asp >= x.Asr }));

    const checks = [N.okO, N.okE, N.okB, N.okS, Q.okO, Q.okE, Q.okB, Q.okS, Q.okCrit,
      ...o.rc.map(r => r.okV && r.okM), ...o.min.map(m => m.ok)];
    o.allOK = checks.every(Boolean);
    return o;
  }

  function stability(X, p, g, sfx, elim) {
    const B = g.B;
    X.FSo = X.Md <= 0 ? 99 : X.Mr / X.Md;
    X.fso = p['fso_' + sfx]; X.fss = p['fss_' + sfx]; X.fsb = p['fsb_' + sfx];
    X.okO = X.FSo >= X.fso;
    X.e = B / 2 - (X.Mr - X.Md) / X.SV; X.elim = elim; X.okE = Math.abs(X.e) <= B / elim;
    X.phiT = Math.min(40, Math.floor(p.phiF));
    [X.Nc, X.Nq, X.Nr] = NTAB[X.phiT];
    X.g1 = g.g1;
    // 基礎版底面以上（牆前覆土 Y）採回填土 γ2，水位以下 γ2′
    X.q = p.gB * g.Y - p.gW * Math.min(g.Y, g.h2);
    X.beta = D(Math.atan(X.SH / X.SV));
    const kp = tan(45 + p.phiF / 2);
    X.Fcd = p.phiF >= 10 ? 1 + 0.2 * g.Y / B * kp : Math.min(1.5, 1 + 0.2 * g.Y / B);
    X.Fqd = p.phiF >= 10 ? 1 + 0.1 * g.Y / B * kp : 1;
    X.Fci = (1 - X.beta / 90) ** 2;
    X.Fri = p.phiF >= 10 ? Math.max(0, 1 - X.beta / p.phiF) ** 2 : 0;
    X.qu = p.cF * X.Nc * X.Fcd * X.Fci + X.q * X.Nq * X.Fqd * X.Fci + 0.5 * X.g1 * B * X.Nr * X.Fqd * X.Fri;
    X.a = Math.min(B, 3 * (B / 2 - Math.abs(X.e)));
    if (Math.abs(X.e) <= B / 6) { X.qt = X.SV / B * (1 + 6 * X.e / B); X.qh = X.SV / B * (1 - 6 * X.e / B); }
    else if (X.e > 0) { X.qt = 2 * X.SV / (3 * (B / 2 - X.e)); X.qh = 0; }
    else { X.qt = 0; X.qh = 2 * X.SV / (3 * (B / 2 + X.e)); }
    X.qmax = Math.max(X.qt, X.qh);
    X.FSb = X.qu / X.qmax; X.okB = X.FSb >= X.fsb;
    // 被動土壓：止滑榫平均有效垂直應力 σ'v,avg = γ·(Y + Kd/2)，採承載層單位重；
    // 地下水位高於止滑榫底時整段採 γ1′ = γ1 − γw，否則採 γ1（不分段）
    const zw = g.dw === Infinity ? Infinity : Math.max(0, g.Y - (g.h2 > 0 ? g.h2 : -g.dw));
    X.zw = zw; X.ppWet = zw < g.Y + p.Kd;
    X.gp = X.ppWet ? p.gF - p.gW : p.gF;
    X.svAvg = X.gp * (g.Y + p.Kd / 2);
    X.Pp = X.svAvg * X.Kp * p.Kd;
    X.Lp = B - 2 * Math.abs(X.e);
    X.L1 = Math.min(p.Kc, p.Kd / tan(45 - p.phiF / 2), X.Lp);
    X.V1 = X.Lp <= 0 ? 0 : X.L1 / X.Lp * X.SV; X.V2 = X.SV - X.V1;
    X.Hu = X.V1 * tan(p.phiF) + X.V2 * tan(p.phiF * 2 / 3) + p.cF / 2 * B + 0.5 * X.Pp;
    X.FSs = X.Hu / X.SH; X.okS = X.FSs >= X.fss;
  }

  root.RW = { compute, DEFAULTS, CODES, BARS, NTAB, MVM, moKae, moKpe, ckKp, ckKpChart };
})(typeof window !== 'undefined' ? window : globalThis);
