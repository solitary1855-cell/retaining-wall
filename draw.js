/* 斷面圖：載重示意圖與設計尺寸示意圖（SVG） */
(function (root) {
  const f2 = v => (+v).toFixed(2);
  const TA = d => Math.tan(d * Math.PI / 180);

  function frame(xmin, xmax, ymin, ymax, W, fs = 1) {
    const pad = 34;
    const s = (W - 2 * pad) / (xmax - xmin);
    const H = (ymax - ymin) * s + 2 * pad;
    return {
      s, W, H, fs,
      X: x => +(pad + (x - xmin) * s).toFixed(1),
      Y: y => +(pad + (ymax - y) * s).toFixed(1),
      P: a => a.map(([x, y]) => `${(pad + (x - xmin) * s).toFixed(1)},${(pad + (ymax - y) * s).toFixed(1)}`).join(' ')
    };
  }

  const defs = `<defs>
    <pattern id="pConc" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill="var(--concrete)"/>
      <circle cx="2.5" cy="3" r=".9" fill="var(--ink)" opacity=".18"/><circle cx="7.5" cy="7.5" r=".7" fill="var(--ink)" opacity=".14"/>
    </pattern>
    <pattern id="pSoil" width="14" height="14" patternUnits="userSpaceOnUse">
      <rect width="14" height="14" fill="var(--soil)" opacity=".38"/>
      <circle cx="3" cy="4" r="1.1" fill="var(--soil)"/><circle cx="10" cy="10" r=".9" fill="var(--soil)"/><circle cx="11" cy="3" r=".6" fill="var(--soil)"/>
    </pattern>
    <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9z" fill="context-stroke"/></marker>
    <marker id="tk" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M2,8 L8,2" stroke="currentColor" stroke-width="1.4"/></marker>
  </defs>`;

  // 牆體外形
  function wallPoly(p, B) {
    return [[0, 0], [B, 0], [B, p.D2], [p.C + p.S, p.D2 + p.D1], [p.C + p.T, p.H], [p.C, p.H], [p.C, p.D2 + p.D1], [0, p.D2]];
  }
  function keyPoly(p) {
    const ks = p.Ks || 0.3;
    return p.Kd > 0 ? [[p.Kc, 0], [p.Kc + ks, 0], [p.Kc + ks, -p.Kd], [p.Kc, -p.Kd]] : null;
  }
  // 尺寸線
  function dimH(F, x1, x2, y, label, cls = '') {
    const a = F.X(x1), b = F.X(x2), yy = F.Y(y);
    if (Math.abs(b - a) < 1) return '';
    label = fitLab(F, label, Math.abs(b - a));
    return `<g class="dim ${cls}"><line x1="${a}" y1="${yy}" x2="${b}" y2="${yy}" marker-start="url(#tk)" marker-end="url(#tk)"/>
      <text x="${(a + b) / 2}" y="${yy - 5 * (F.fs || 1)}" text-anchor="middle">${label}</text></g>`;
  }
  function dimV(F, x, y1, y2, label, side = 1) {
    const xx = F.X(x), a = F.Y(y1), b = F.Y(y2);
    if (Math.abs(b - a) < 1) return '';
    label = fitLab(F, label, Math.abs(b - a));
    const fs = F.fs || 1, tx = side > 0 ? xx + 2 + 12 * fs : xx - 4 * fs, my = (a + b) / 2;
    return `<g class="dim"><line x1="${xx}" y1="${a}" x2="${xx}" y2="${b}" marker-start="url(#tk)" marker-end="url(#tk)"/>
      <text x="${tx}" y="${my}" text-anchor="middle" transform="rotate(-90 ${tx} ${my})">${label}</text></g>`;
  }
  // 標註長度超過尺寸線時，只保留代號（去掉 =數值）
  function fitLab(F, label, len) {
    const fs = F.fs || 1, w = t => [...t].length * 7.4 * fs;
    if (!label || F.fs === undefined || fs === 1) return label;
    return w(label) > len - 4 && label.includes('=') ? label.split('=')[0] : label;
  }
  function ext(F, x1, y1, x2, y2) { return `<line class="ext" x1="${F.X(x1)}" y1="${F.Y(y1)}" x2="${F.X(x2)}" y2="${F.Y(y2)}"/>`; }
  function grass(F, x1, x2, y) {
    let g = `<line class="gl" x1="${F.X(x1)}" y1="${F.Y(y)}" x2="${F.X(x2)}" y2="${F.Y(y)}"/>`;
    for (let px = F.X(x1) + 4; px < F.X(x2) - 4; px += 9) g += `<line class="gh" x1="${px}" y1="${F.Y(y)}" x2="${px - 5}" y2="${F.Y(y) + 6}"/>`;
    return g;
  }

  /* ---------------- 載重示意圖 ---------------- */
  function loads(o, mode) {
    const p = o.p, g = o.g, B = g.B, X = mode === 'e' ? o.e : o.n, N = o.n;
    const ta = TA(N.alpha);
    const hw1 = o.hw1;
    // 主動土壓分布（水平）於虛擬背面 x = B
    const K = mode === 'e' ? o.KAEH : o.KAH;
    const qK = mode === 'e' ? p.qs * o.e.Kae * (1 - p.kv) : p.qs * N.Ka;
    const zw = Math.max(0, p.H - hw1);
    const sig = z => { const m = Math.min(z, zw), d = Math.max(0, z - zw); return K * (p.gB * m + (p.gB - p.gW) * d) + qK; };
    const sMax = Math.max(sig(p.H), 1e-6), wMax = p.gW * hw1;
    const pw = Math.max(0.45 * p.H, 0.8);           // 壓力圖寬
    const ps = pw / Math.max(sMax + wMax, 1e-6);
    const rd = 0.32 * p.H;                           // 地反力圖深
    const rs = rd / Math.max(X.qt, X.qh, 1e-6);
    const FS = 2, Wd = 760;                          // 標示字體倍率（上方動態圖放大 1 倍）
    let xmin = Math.min(-0.2 * p.H - 0.5, p.Kc - 1.25), xmax = B + pw + 0.7;
    const xmin0 = xmin, xmax0 = xmax;
    for (let it = 0; it < 4; it++) {                 // 依字寬預留左右邊界（Pp、qh、Pw 標示）
      const s0 = (Wd - 68) / (xmax - xmin);
      xmin = Math.min(xmin0, p.Kd > 0 ? p.Kc - 0.35 - 210 / s0 : xmin0);
      xmax = Math.max(xmax0, B + 230 / s0, B + pw + 150 / s0);
    }
    const s1 = (Wd - 68) / (xmax - xmin);
    const ymin = -Math.max(p.Kd, 0) - rd - 0.3 - 20 / s1, ymax = p.H + Math.max(0.45, (B - p.C - p.T) * ta + 0.4) + 0.12 + 40 / s1;
    const F = frame(xmin, xmax, ymin, ymax, Wd, FS);
    const x0 = B;
    let s = `<svg viewBox="0 0 ${F.W} ${F.H.toFixed(0)}" class="draw" role="img" aria-label="擋土牆載重示意圖">${defs}`;
    // soils
    const backfill = [[p.C + p.T, p.H], [x0, p.H + (x0 - p.C - p.T) * ta], [x0, 0], [p.C + p.S, 0]];
    s += `<polygon points="${F.P([[p.C + p.T, p.H], [x0, p.H + (x0 - p.C - p.T) * ta], [x0, p.D2], [p.C + p.S, p.D2 + p.D1]])}" fill="url(#pSoil)"/>`;
    s += `<polygon points="${F.P([[xmin + 0.1, g.Y], [p.C, g.Y], [p.C, p.D2 + p.D1], [0, p.D2], [0, g.Y > p.D2 ? p.D2 : 0], [xmin + 0.1, g.Y > p.D2 ? p.D2 : 0]])}" fill="url(#pSoil)"/>`;
    s += grass(F, xmin + 0.1, p.C, g.Y);
    s += `<line class="gl" x1="${F.X(p.C + p.T)}" y1="${F.Y(p.H)}" x2="${F.X(x0)}" y2="${F.Y(p.H + (x0 - p.C - p.T) * ta)}"/>`;
    // water
    if (hw1 > 0) s += `<rect x="${F.X(p.C + p.S)}" y="${F.Y(hw1)}" width="${F.X(x0) - F.X(p.C + p.S)}" height="${F.Y(Math.max(p.D2, 0)) - F.Y(hw1)}" fill="var(--water)" opacity=".10"/>
      <line class="wl" x1="${F.X(p.C + p.S)}" y1="${F.Y(hw1)}" x2="${F.X(x0)}" y2="${F.Y(hw1)}"/>
      <text class="wt" x="${F.X(p.C + p.S) + 6}" y="${F.Y(hw1) - 8}">▽ Hw1 = ${f2(hw1)}</text>`;
    // wall
    s += `<polygon points="${F.P(wallPoly(p, B))}" fill="url(#pConc)" class="conc"/>`;
    const kp = keyPoly(p); if (kp) s += `<polygon points="${F.P(kp)}" fill="url(#pConc)" class="conc"/>`;
    // virtual back
    s += `<line class="vb" x1="${F.X(x0)}" y1="${F.Y(0)}" x2="${F.X(x0)}" y2="${F.Y(p.H + 0.2)}"/>`;
    // surcharge
    if (p.qs > 0) {
      const xs = p.C + p.T, xe = x0, nA = 7;
      let arr = '';
      for (let i = 0; i <= nA; i++) { const x = xs + (xe - xs) * i / nA, y = p.H + (x - xs) * ta; arr += `<line class="ld" x1="${F.X(x)}" y1="${F.Y(y) - 24}" x2="${F.X(x)}" y2="${F.Y(y) - 2}" marker-end="url(#ar)"/>`; }
      s += arr + `<line class="ld" x1="${F.X(xs)}" y1="${F.Y(p.H) - 24}" x2="${F.X(xe)}" y2="${F.Y(p.H + (xe - xs) * ta) - 24}"/>
        <text class="lt" x="${F.X((xs + xe) / 2)}" y="${F.Y(p.H + (xe - xs) / 2 * ta) - 30}" text-anchor="middle">qs = ${f2(p.qs)} tf/m²</text>`;
    }
    // earth pressure diagram
    const pts = [[x0, p.H]];
    for (let i = 0; i <= 24; i++) { const z = p.H * i / 24; pts.push([x0 + sig(z) * ps, p.H - z]); }
    pts.push([x0, 0]);
    s += `<polygon points="${F.P(pts)}" class="pe"/>`;
    if (hw1 > 0) s += `<polygon points="${F.P([[x0 + sig(p.H) * ps, hw1], [x0 + sig(p.H) * ps + wMax * ps, 0], [x0 + sig(p.H) * ps, 0]])}" class="pwd"/>`;
    // resultant arrows
    const Ph = mode === 'e' ? o.e.Paeh + o.e.Pqeh : N.Pah + N.Pqh;
    const yh = mode === 'e' ? (o.e.Paeh * o.e.yae + o.e.Pqeh * o.e.yqe) / Ph : (N.Pah * N.ya + N.Pqh * N.yq) / Ph;
    const Pw = mode === 'e' ? o.e.Pwe : N.Pw;
    s += `<line class="res" x1="${F.X(x0 + pw + 0.35)}" y1="${F.Y(yh)}" x2="${F.X(x0) + 3}" y2="${F.Y(yh)}" marker-end="url(#ar)"/>
      <text class="rt" x="${F.X(x0 + pw + 0.35)}" y="${F.Y(yh) - 16}" text-anchor="end">${mode === 'e' ? 'Paeh+Pqeh' : 'Pah+Pqh'} = ${f2(Ph)} tf</text>`;
    if (Pw > 0) s += `<text class="wt" x="${F.X(x0 + sig(p.H) * ps + wMax * ps) + 4}" y="${F.Y(0) - 4}">Pw = ${f2(Pw)}</text>`;
    s += `<text class="lt" x="${F.X(x0 + sig(p.H * 0.2) * ps) + 10}" y="${F.Y(p.H) + 40}">${mode === 'e' ? 'Kae' : 'Ka'} = ${(mode === 'e' ? o.e.Kae : N.Ka).toFixed(3)}</text>`;
    // base reaction
    const base = -0.02 - Math.max(0, 0) ;
    const rp = [];
    const n = 30;
    for (let i = 0; i <= n; i++) {
      const u = B * i / n;
      const q = Math.abs(X.e) <= B / 6 ? X.qt + (X.qh - X.qt) * u / B : (X.e > 0 ? Math.max(0, X.qt * (1 - u / X.a)) : Math.max(0, X.qh * (1 - (B - u) / X.a)));
      rp.push([u, -Math.max(p.Kd, 0) - 0.12 - q * rs]);
    }
    const yb = -Math.max(p.Kd, 0) - 0.12;
    s += `<polygon points="${F.P([[0, yb], ...rp, [B, yb]])}" class="pr"/>`;
    for (let i = 1; i < 6; i++) { const r = rp[Math.round(i * n / 6)]; s += `<line class="ra" x1="${F.X(r[0])}" y1="${F.Y(r[1])}" x2="${F.X(r[0])}" y2="${F.Y(yb) + 1}" marker-end="url(#ar)"/>`; }
    s += `<text class="rt" x="${F.X(0)}" y="${F.Y(rp[0][1]) + 28}">qt = ${f2(X.qt)}</text>
      <text class="rt" x="${F.X(B) + 6}" y="${Math.max(F.Y(rp[n][1]), F.Y(yb) + 22) + 8}">qh = ${f2(X.qh)} tf/m²</text>`;
    // passive
    if (p.Kd > 0) {
      const xk = p.Kc, kw = 0.35;
      s += `<polygon points="${F.P([[xk, 0], [xk, -p.Kd], [xk - kw, -p.Kd], [xk - kw * 0.55, 0]])}" class="pp"/>
        <line class="res pp-a" x1="${F.X(xk - kw) - 50}" y1="${F.Y(-p.Kd / 2)}" x2="${F.X(xk) - 2}" y2="${F.Y(-p.Kd / 2)}" marker-end="url(#ar)"/>
        <text class="rt" x="${F.X(xk - kw) - 56}" y="${F.Y(-p.Kd / 2) + 8}" text-anchor="end">Pp = ${f2(X.Pp)}</text>`;
    }
    return s + '</svg>';
  }

  /* ---------------- 設計尺寸示意圖 ---------------- */
  function dims(o) {
    const p = o.p, g = o.g, B = g.B, ta = TA(o.n.alpha);
    const ks = p.Ks || 0.3;
    const L = Math.max(B, 1.2);
    const FS = 2;                                   // 標示字體倍率（上方動態圖放大 1 倍）
    const xmin = -0.42 * L - 0.3, xmax = B + 0.42 * L + 0.15;
    const s0 = (760 - 68) / (xmax - xmin), u = 13 * FS / s0;   // u：一行字高（m）
    const yk = -p.Kd - 0.04 - u, y1 = (p.Kd > 0 ? yk : -0.02) - 1.15 * u, y2 = y1 - 1.15 * u;
    const ymin = Math.min(-p.Kd - 0.75, y2 - 0.3), ymax = p.H + Math.max(0.45, 0.35 * L * ta + 0.3) + 0.15 + u;
    const F = frame(xmin, xmax, ymin, ymax, 760, FS);
    const c = Math.min(0.075, p.T / 4, p.D2 / 4);
    const yb = p.D2 + p.D1;
    let s = `<svg viewBox="0 0 ${F.W} ${F.H.toFixed(0)}" class="draw" role="img" aria-label="擋土牆設計尺寸示意圖">${defs}`;
    // ground & backfill
    s += grass(F, xmin + 0.15, p.C, g.Y);
    const xr = xmax - 0.1;
    s += `<line class="gl" x1="${F.X(p.C + p.T)}" y1="${F.Y(p.H)}" x2="${F.X(xr)}" y2="${F.Y(p.H + (xr - p.C - p.T) * ta)}"/>`;
    // slope mark
    const sx = p.C + p.T + 0.5 * (xr - p.C - p.T), sy = p.H + (sx - p.C - p.T) * ta + 0.1 + 0.5 * u;
    s += `<text class="lt" x="${F.X(sx)}" y="${F.Y(sy)}" text-anchor="middle">背填坡度 1 : ${p.n}</text>`;
    // wall
    s += `<polygon points="${F.P(wallPoly(p, B))}" fill="url(#pConc)" class="conc"/>`;
    const kp = keyPoly(p); if (kp) s += `<polygon points="${F.P(kp)}" fill="url(#pConc)" class="conc"/>`;
    // leveling concrete
    s += `<rect x="${F.X(-0.1)}" y="${F.Y(0)}" width="${F.X(B + 0.1) - F.X(-0.1)}" height="4" class="lev"/>`;
    // ---- rebar ----
    const sb = (x1, y1, x2, y2, cls = 'rb') => `<line class="${cls}" x1="${F.X(x1)}" y1="${F.Y(y1)}" x2="${F.X(x2)}" y2="${F.Y(y2)}"/>`;
    const backX = y => p.C + p.T + (p.S - p.T) * (p.H - y) / g.h; // 牆背 x at y
    // S1 back face full height + hook into base
    s += `<polyline class="rb" points="${F.P([[backX(p.H - c) - c, p.H - c], [backX(yb) - c, yb], [backX(c) - c, c], [backX(c) - c - 0.25, c]])}"/>`;
    const L2 = p.bars.S2.L, L3 = p.bars.S3.L;
    if (L2 > 0) s += `<polyline class="rb rb2" points="${F.P([[backX(yb + L2) - 2 * c, yb + L2], [backX(yb) - 2 * c, yb], [backX(c) - 2 * c, c + 0.02]])}"/>`;
    if (L3 > 0) s += `<polyline class="rb rb3" points="${F.P([[backX(yb + L3) - 2.8 * c, yb + L3], [backX(yb) - 2.8 * c, yb], [backX(c) - 2.8 * c, c + 0.04]])}"/>`;
    // S8 front face
    s += `<polyline class="rb" points="${F.P([[p.C + c, p.H - c], [p.C + c, c], [p.C + c + 0.2, c]])}"/>`;
    // S4 heel top, S5 bottom
    s += `<polyline class="rb" points="${F.P([[p.C + p.S - 0.25, yb - c], [p.C + p.S, yb - c], [B - c, p.D2 - c], [B - c, p.D2 - 0.25]])}"/>`;
    s += `<polyline class="rb" points="${F.P([[c, p.D2 - 0.2], [c, c], [B - c, c], [B - c, c + 0.2]])}"/>`;
    // T1 / T2 dots
    let dots = '', t1 = null, t2 = null;
    for (let y = yb + 0.2; y < p.H - 0.05; y += 0.25) { t1 = [p.C + c, y]; dots += `<circle class="rd" cx="${F.X(p.C + c)}" cy="${F.Y(y)}" r="2.2"/><circle class="rd" cx="${F.X(backX(y) - c)}" cy="${F.Y(y)}" r="2.2"/>`; }
    for (let x = 0.15; x < B - 0.05; x += 0.2) { dots += `<circle class="rd" cx="${F.X(x)}" cy="${F.Y(c + 0.03)}" r="2.2"/>`; }
    for (let x = p.C + p.S + 0.1; x < B - 0.05; x += 0.2) { const yt = p.D2 + p.D1 * (B - x) / Math.max(p.E, 1e-6); t2 = [x, yt - c - 0.03]; dots += `<circle class="rd" cx="${F.X(x)}" cy="${F.Y(yt - c - 0.03)}" r="2.2"/>`; }
    s += dots;
    // labels
    const lab = (x, y, tx, ty, t, anchor = 'start') => `<line class="ldr" x1="${F.X(x)}" y1="${F.Y(y)}" x2="${F.X(tx)}" y2="${F.Y(ty)}"/> <text class="bl" x="${F.X(tx) + (anchor === 'start' ? 4 : -4)}" y="${F.Y(ty) + 8}" text-anchor="${anchor}">${t}</text>`;
    const rx = B + 0.12 * L;
    s += lab(backX(p.H - 0.25) - c, p.H - 0.25, rx * 0.55 + backX(p.H - 0.25) * 0.45 + 0.1, p.H - 0.12 - 0.6 * u, 'S1');
    if (L2 > 0) s += lab(backX(yb + L2 * 0.6) - 2 * c, yb + L2 * 0.6, backX(yb + L2 * 0.6) + 0.35, yb + L2 * 0.6 + 0.1, 'S2');
    if (L3 > 0) s += lab(backX(yb + L3 * 0.4) - 2.8 * c, yb + L3 * 0.4, backX(yb + L3 * 0.4) + 0.35, yb + L3 * 0.4 - 0.05, 'S3');
    s += lab(p.C + c, yb + g.h * 0.45, p.C - 0.25, yb + g.h * 0.45 + 0.05, 'S8', 'end');
    const ring = d => `<circle class="ring" cx="${F.X(d[0])}" cy="${F.Y(d[1])}" r="6"/>`;
    const toward = (d, tx, ty) => { const dx = F.X(tx) - F.X(d[0]), dy = F.Y(ty) - F.Y(d[1]), L = Math.hypot(dx, dy) || 1; return [d[0] + (dx / L) * 6 / F.s, d[1] - (dy / L) * 6 / F.s]; };
    if (t1) { const tp = [p.C - 0.25, t1[1] - 0.3 * u]; s += ring(t1) + lab(...toward(t1, ...tp), ...tp, 'T1', 'end'); }
    s += lab((p.C + p.S + B) / 2, p.D2 + p.D1 / 2 - c, (p.C + p.S + B) / 2 + 0.15, yb + 0.35, 'S4');
    s += lab(B - 0.25, c, B + 0.12, -0.2, 'S5', 'start');
    if (t2) { const tp = [B + 0.15, p.D2 + 0.12]; s += ring(t2) + lab(...toward(t2, ...tp), ...tp, 'T2'); }
    // ---- dimensions ----
    // top T
    s += ext(F, p.C, p.H, p.C, p.H + 0.32) + ext(F, p.C + p.T, p.H, p.C + p.T, p.H + 0.32);
    s += dimH(F, p.C, p.C + p.T, p.H + 0.26, 'T=' + f2(p.T));
    // bottom chains
    for (const x of [0, p.C, p.C + p.S, B]) s += ext(F, x, 0, x, y1 - 0.06);
    s += ext(F, 0, 0, 0, y2 - 0.06) + ext(F, B, 0, B, y2 - 0.06);
    s += dimH(F, 0, p.C, y1, 'C=' + f2(p.C)) + dimH(F, p.C, p.C + p.S, y1, 'S=' + f2(p.S)) + dimH(F, p.C + p.S, B, y1, 'E=' + f2(p.E));
    s += dimH(F, 0, B, y2, 'B=' + f2(B));
    if (p.Kd > 0) {
      s += dimH(F, 0, p.Kc, yk, p.Kc > 0 ? 'Kc=' + f2(p.Kc) : '', 'kc') + dimH(F, p.Kc, p.Kc + ks, yk, 'Ks');
    }
    // left vertical chain
    const xl1 = -0.24 * L - 0.08, xl2 = -0.36 * L - 0.2;
    for (const y of [-p.Kd, 0, p.D2, yb, p.H]) s += ext(F, y === p.H ? p.C : 0, y, xl1 - 0.05, y);
    s += dimV(F, xl1, -p.Kd, 0, p.Kd > 0 ? 'Kd=' + f2(p.Kd) : '', -1) + dimV(F, xl1, 0, p.D2, 'D2=' + f2(p.D2), -1);
    if (p.D1 > 0) s += dimV(F, xl1, p.D2, yb, 'D1', -1);
    s += dimV(F, xl1, yb, p.H, 'h=' + f2(g.h), -1);
    s += ext(F, 0, 0, xl2 - 0.05, 0) + dimV(F, xl2, 0, p.H, 'H=' + f2(p.H), -1);
    // Y / Df at toe
    const xy = -0.06 * L - 0.04;
    s += dimV(F, xy, 0, g.Y, 'Y=' + f2(g.Y), 1);
    // S2/S3 lengths on right of stem
    const xL = B + 0.3 * L;
    if (L2 > 0 || L3 > 0) {
      s += ext(F, backX(yb), yb, xL + 0.05, yb);
      if (L2 > 0) s += ext(F, backX(yb + L2), yb + L2, xL + 0.05, yb + L2) + dimV(F, xL, yb, yb + L2, 'L2=' + f2(L2), 1);
      if (L3 > 0) s += ext(F, backX(yb + L3), yb + L3, xL - 0.12, yb + L3) + dimV(F, xL - 0.17, yb, yb + L3, 'L3=' + f2(L3), 1);
    }
    return s + '</svg>';
  }

  /* ---------------- 作用力分塊編號示意圖（固定比例） ---------------- */
  function blocks() {
    const C = 0.8, S = 0.6, T = 0.3, E = 2.0, B = C + S + E, D2 = 0.5, D1 = 0.2, H = 3.6, yb = D1 + D2, ta = 0.35, Y = 1.15;
    const Ws = B - C - T, Kc = 1.75, Ks = 0.3, Kd = 0.3;
    const F = frame(-0.35, B + 0.35, -Kd - 0.15, H + Ws * ta + 0.2, 420);
    const conc = 'fill="var(--concrete)" fill-opacity=".55"', soil = 'fill="var(--soil)" fill-opacity=".35"';
    const poly = (pts, st) => `<polygon points="${F.P(pts)}" ${st} stroke="var(--ink)" stroke-width="1"/>`;
    const lab = (x, y, t) => `<text x="${F.X(x)}" y="${F.Y(y) + 5}" text-anchor="middle" class="bn">${t}</text>`;
    let s = `<svg viewBox="0 0 ${F.W} ${F.H.toFixed(0)}" class="draw" role="img" aria-label="作用力分塊編號示意圖">${defs}`;
    s += poly([[C + T, H], [B, H], [B, H + Ws * ta]], soil);                       // 9
    s += poly([[C + T, H], [C + S, yb], [C + S, H]], soil);                        // 10
    s += poly([[C + S, yb], [B, yb], [B, H], [C + S, H]], soil);                   // 8
    s += poly([[C + S, yb], [B, D2], [B, yb]], soil);                              // 11
    s += poly([[0, D2], [C, yb], [C, Y], [0, Y]], soil);                           // 12
    s += `<rect x="${F.X(0)}" y="${F.Y(Y + 0.28)}" width="${F.X(C) - F.X(0)}" height="${F.Y(Y) - F.Y(Y + 0.28)}" fill="var(--water)" fill-opacity=".25" stroke="var(--water)" stroke-dasharray="4 3"/>`; // 13
    s += poly([[C, yb], [C + T, yb], [C + T, H], [C, H]], conc);                   // 1
    s += poly([[C + T, yb], [C + S, yb], [C + T, H]], conc);                       // 7
    s += poly([[C, 0], [C + S, 0], [C + S, yb], [C, yb]], conc);                   // 2
    s += poly([[0, 0], [C, 0], [C, D2], [0, D2]], conc);                           // 3
    s += poly([[C + S, 0], [B, 0], [B, D2], [C + S, D2]], conc);                   // 4
    s += poly([[0, D2], [C, D2], [C, yb]], conc);                                  // 5
    s += poly([[C + S, D2], [B, D2], [C + S, yb]], conc);                          // 6
    s += poly([[Kc, 0], [Kc + Ks, 0], [Kc + Ks, -Kd], [Kc, -Kd]], conc);
    s += grass(F, -0.3, 0, Y);
    s += `<line class="gl" x1="${F.X(C + T)}" y1="${F.Y(H)}" x2="${F.X(B + 0.3)}" y2="${F.Y(H + (B + 0.3 - C - T) * ta)}"/>`;
    s += lab(C + T / 2, H * 0.62, 1) + lab(C + S / 2, yb / 2, 2) + lab(C / 2, D2 / 2, 3) + lab(C + S + E / 2, D2 / 2, 4)
      + lab(C * 0.66, D2 + D1 * 0.3, 5) + lab(C + S + E / 3, D2 + D1 * 0.3, 6) + lab(C + T + (S - T) / 3, yb + 0.6, 7)
      + lab(C + S + E / 2, (yb + H) / 2, 8) + lab(C + T + Ws * 0.7, H + Ws * ta * 0.3, 9) + lab(C + T + 2 * (S - T) / 3, H - 0.55, 10)
      + lab(C + S + E * 0.75, yb - D1 * 0.3, 11) + lab(C / 2, (D2 + Y) / 2 + 0.05, 12) + lab(C / 2, Y + 0.14, 13);
    s += `<text class="cap" x="${F.W - 6}" y="14" text-anchor="end">編號對應作用力總表 (1)~(13)</text>`;
    return s + '</svg>';
  }

  /* ---------------- 抗滑動（止滑榫）示意圖（固定比例） ---------------- */
  function slide() {
    const C = 0.8, S = 0.6, T = 0.3, B = 3.4, D2 = 0.5, D1 = 0.2, yb = D1 + D2, Y = 1.15, Kd = 0.45, Kc = 2.0, Ks = 0.35, L1 = 0.75, e = 0.2;
    const Lp = B - 2 * e;
    const F = frame(-1.75, B + 0.2, -Kd - 1.2, Y + 0.75, 520);
    let s = `<svg viewBox="0 0 ${F.W} ${F.H.toFixed(0)}" class="draw" role="img" aria-label="抗滑動示意圖">${defs}`;
    s += `<polygon points="${F.P([[-1.2, Y], [C, Y], [C, yb], [0, D2], [0, -Kd - 0.25], [-1.2, -Kd - 0.25]])}" fill="url(#pSoil)"/>`;
    s += grass(F, -1.2, C, Y);
    s += `<polygon points="${F.P([[0, 0], [B, 0], [B, D2], [C + S, yb], [C + S, Y + 0.65], [C, Y + 0.65], [C, yb], [0, D2]])}" fill="url(#pConc)" class="conc"/>`;
    s += `<polygon points="${F.P([[Kc, 0], [Kc + Ks, 0], [Kc + Ks, -Kd], [Kc, -Kd]])}" fill="url(#pConc)" class="conc"/>`;
    s += `<line x1="${F.X(C)}" y1="${F.Y(Y + 0.65)}" x2="${F.X(C + S)}" y2="${F.Y(Y + 0.65)}" stroke="var(--muted)" stroke-dasharray="6 4"/>`;
    // slip surface
    s += `<polyline points="${F.P([[0, -0.02], [Kc - L1, -0.02], [Kc, -Kd - 0.02], [Kc + Ks + 0.02, -Kd - 0.02], [Kc + Ks + 0.02, -0.02], [B, -0.02]])}" fill="none" stroke="#d62728" stroke-width="3.5" stroke-dasharray="12 6"/>`;
    s += `<line class="ldr" x1="${F.X(Kc - L1 / 2)}" y1="${F.Y(-Kd / 2)}" x2="${F.X(0.9)}" y2="${F.Y(-0.18)}"/><text class="bl" x="${F.X(0.87)}" y="${F.Y(-0.18) + 5}" text-anchor="end">滑動面</text>`;
    // Pp arrows
    for (let i = 0; i < 5; i++) {
      const y = -Kd + i * Kd / 4, len = 0.2 + 0.25 * (4 - i) / 4;
      s += `<line class="ppa" x1="${F.X(-0.05 - len)}" y1="${F.Y(y)}" x2="${F.X(-0.03)}" y2="${F.Y(y)}" marker-end="url(#ar)"/>`;
    }
    s += `<text class="bl" x="${F.X(-0.3)}" y="${F.Y(0) - 6}" text-anchor="middle">Pp</text>`;
    // dims left
    s += dimV(F, -1.5, -Kd, Y, 'D = Y + Kd', -1) + dimV(F, -1.0, 0, Y, 'Y', -1) + dimV(F, -1.0, -Kd, 0, 'Kd', -1);
    s += ext(F, -0.6, -Kd, -1.55, -Kd) + ext(F, -0.6, 0, -1.05, 0) + ext(F, -1.2, Y, -1.55, Y);
    // dims bottom
    const y1 = -Kd - 0.35, y2 = -Kd - 0.65, y3 = -Kd - 0.95;
    for (const x of [0, Kc - L1, Kc, Kc + Ks]) s += ext(F, x, x >= Kc ? -Kd : 0, x, y2 - 0.06);
    s += ext(F, Lp, 0, Lp, y3 - 0.06);
    s += dimH(F, 0, Kc, y1, 'Kc') + dimH(F, 0, Kc - L1, y2, 'L2') + dimH(F, Kc - L1, Kc, y2, 'L1') + dimH(F, Kc, Kc + Ks, y2, 'Ks');
    s += dimH(F, 0, Lp, y3, "L' = B − 2e");
    return s + '</svg>';
  }

  root.RWDraw = { loads, dims, blocks, slide };
})(window);
