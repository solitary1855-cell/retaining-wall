/* 介面：輸入表單、結果摘要、斷面圖、計算書 */
(function () {
  const KEY = 'rw-cantilever-v1';
  const clone = o => JSON.parse(JSON.stringify(o));
  let P = load() || clone(RW.DEFAULTS);

  function load() {
    try { const s = localStorage.getItem(KEY); if (s) return Object.assign(clone(RW.DEFAULTS), JSON.parse(s)); } catch (e) {}
    return null;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} }

  // ---------- form schema ----------
  const G = [
    { t: '基本資料', open: true, f: [['id', '計算書編號', '', 'text']] },
    { t: '1.1 材料參數', f: [
      ['gB', '背填土 γ', 'tf/m³'], ['phiB', '背填土 φ', '度'], ['cB', '背填土 c', 'tf/m²'],
      ['gF', '承載層 γ', 'tf/m³'], ['phiF', '承載層 φ', '度'], ['cF', '承載層 c', 'tf/m²'],
      ['gC', '混凝土 γc', 'tf/m³'], ['gW', '水 γw', 'tf/m³']] },
    { t: '1.2 地表超載重及地下水位', f: [
      ['qs', '牆背地表超載 qs', 'tf/m²'], ['hw1r', '牆背水位比 Hw1/H', ''], ['=hw1', '牆背水位 Hw1', 'm'],
      ['hw2', '牆前水位 Hw2（自基底）', 'm'], ['wt', '基底位於地下水位下', '', 'bool']] },
    { t: '1.3 載重組合', info: 'combo' },
    { t: '1.4 材料設計強度', f: [['fc', "混凝土 fc'", 'kgf/cm²'], ['fy', '鋼筋 fy', 'kgf/cm²']] },
    { t: '1.5 地震係數', f: [['kh', '水平地震係數 Kh', ''], ['kv', '垂直地震係數 Kv', '']] },
    { t: '1.6 安全係數', f: [
      ['fss_n', '抗滑動（常時）', ''], ['fss_e', '抗滑動（地震）', ''], ['fso_n', '抗傾覆（常時）', ''],
      ['fso_e', '抗傾覆（地震）', ''], ['fsb_n', '抗承載（常時）', ''], ['fsb_e', '抗承載（地震）', '']] },
    { t: '1.7 配筋規範與強度折減因子', f: [
      ['code', '配筋規範', '', 'select', [['hw', '公路橋梁規範（範例版）'], ['c112', '112年混凝土規範']]]],
      hint: '範例版：1.69／1.3、φv=0.85、ρmin=14/fy；112版：1.6／1.2、φv=0.75、ρmin=max(0.8√fc\'/fy,14/fy)' },
    { t: '1.8 保護層', f: [['cover', "保護層 d'", 'cm']] },
    { t: '1.9 土壓力參數', f: [
      ['deltaR', '牆背摩擦角比 δ/φ', ''],
      ['kpm', 'Kp 計算方法', '', 'select', [['rankine', 'Rankine'], ['coulomb', 'Coulomb'], ['example', '範例沿用法']]],
      ['deltaP', '被動牆面摩擦角 δp', '度'], ['kpOvr', 'Kp 指定值（空白=計算）', '', 'opt'], ['kpeOvr', 'Kpe 指定值（空白=計算）', '', 'opt']],
      hint: 'Rankine：tan²(45+φ/2)；Coulomb：承載層 φ、δp（建議 ≤ φ/3）；範例沿用法：沿用牆背主動土壓參數，僅供比對舊計算書。' },
    { t: '2.1 擋土牆設計尺寸', open: true, f: [
      ['T', '(1) 牆身頂寬 T', 'm'], ['H', '(2) 牆體全高 H', 'm'], ['=h', '(3) 牆身高度 h', 'm'],
      ['=B', '(4) 基礎寬度 B', 'm'], ['C', '(5) 基礎趾長 C', 'm'], ['S', '(6) 牆身底寬 S', 'm'],
      ['E', '(7) 基礎踵長 E', 'm'], ['D1', '(8) 基礎上高 D1', 'm'], ['D2', '(9) 基礎下高 D2', 'm'],
      ['=eta', '(10) 牆背斜率 η', ''], ['Kd', '(11) 止滑榫尺寸 Kd', 'm'], ['Kc', '(12) 止滑榫位置 Kc', 'm'],
      ['Df', '(13) 趾版覆土 Df', 'm'], ['=Y', '(14) 牆前回填 Y', 'm'], ['n', '(15) 背填坡度 1V : nH', 'n'],
      ['Ks', '止滑榫寬度 Ks（繪圖用）', 'm']] },
    { t: '2.4 擋土牆配筋設計', bars: true }
  ];

  const form = document.getElementById('form');
  function buildForm() {
    form.innerHTML = '';
    for (const g of G) {
      const d = document.createElement('details'); d.className = 'grp'; if (g.open) d.open = true;
      d.innerHTML = `<summary>${g.t}</summary>`;
      const box = document.createElement('div'); box.className = 'fields';
      if (g.hint) box.insertAdjacentHTML('beforeend', `<p class="hint">${g.hint}</p>`);
      if (g.info) {
        box.insertAdjacentHTML('beforeend', `<div id="${g.info}"></div><p class="hint">由 1.7 配筋規範自動帶入，免輸入。</p>`);
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
          box.insertAdjacentHTML('beforeend', `<div class="f${type === 'select' ? ' wide' : ''}"><label for="${id}">${lab}</label>${ctl}${type === 'select' ? '' : `<span class="u">${unit}</span>`}</div>`);
        }
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
      else if (t === 'opt') P[k] = el.value.trim() === '' ? null : parseFloat(el.value);
      else { const v = parseFloat(el.value); if (!isFinite(v)) return; P[k] = v; }
    }
    save(); run();
  });

  // ---------- helpers ----------
  const n = (v, d = 2) => (v === null || v === undefined || !isFinite(v)) ? '–' : (+v).toFixed(d);
  const tag = ok => `<span class="tag ${ok ? 'ok' : 'ng'}">${ok ? 'OK' : 'NG'}</span>`;
  const eq = (lab, v, u = '', key = false) => `<div class="eq${key ? ' key' : ''}"><span>${lab}</span><span class="v">${v}</span><span class="u">${u}</span></div>`;

  // ---------- drawings ----------
  let mode = 'n';
  function drawSection(o) {
    document.getElementById('section').innerHTML = RWDraw.loads(o, mode);
    document.getElementById('dims').innerHTML = RWDraw.dims(o);
  }
  document.querySelectorAll('.seg button').forEach(b => b.onclick = () => {
    mode = b.dataset.mode;
    document.querySelectorAll('.seg button').forEach(x => x.classList.toggle('on', x === b));
    drawSection(o);
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
  function stabReport(X, no, elim, kp) {
    const ok = (b, s) => `${s}　${b ? 'OK!' : 'NG!'}`;
    return `<h3>${no}.2 抗傾覆檢核</h3>
      ${eq('FS = Mr / Md = ' + n(X.Mr) + ' / ' + n(X.Md), n(X.FSo), ok(X.okO, '≥ ' + n(X.fso, 1)), true)}
      ${eq('e = B/2 − (Mr − Md)/ΣV', n(X.e), ok(X.okE, `B/${elim}=${n(o.g.B / elim)}`) , true)}
      <h3>${no}.3 抗承載檢核（基礎規範 式4.3-1）</h3>
      <div class="scroll"><table class="t"><thead><tr><th></th><th>γ1 (tf/m³)</th><th>φ (度)</th><th>c (tf/m²)</th><th>Fcd</th><th>Fci</th><th>Fqd</th><th>Fqi</th><th>Frd</th><th>Fri</th></tr></thead>
      <tbody><tr><td>承載層</td><td>${n(X.g1)}</td><td>${n(P.phiF, 1)}</td><td>${n(P.cF)}</td><td>${n(X.Fcd)}</td><td>${n(X.Fci)}</td><td>${n(X.Fqd)}</td><td>${n(X.Fci)}</td><td>${n(X.Fqd)}</td><td>${n(X.Fri)}</td></tr></tbody></table></div>
      ${eq(`Nc = ${n(X.Nc, 1)}，Nq = ${n(X.Nq, 1)}，Nγ = ${n(X.Nr, 1)}（表4.3-1，φ = ${X.phiT}°）`, '', '')}
      ${eq('載重傾角 β = atan(ΣH/ΣV)', n(X.beta), '度')}
      ${eq("q = γ2·Df'（Df' = Y）", n(X.q), 'tf/m²')}
      ${eq('qu = cNcFcdFci + qNqFqdFqi + ½γ1BNγFrdFri', n(X.qu), 'tf/m²', true)}
      ${eq('qt（趾端）', n(X.qt), 'tf/m²')}
      ${eq('qh（踵端）' + (Math.abs(X.e) > o.g.B / 6 ? '　※ |e|>B/6 採三角形分布' : ''), n(X.qh), 'tf/m²')}
      ${eq('FS = qu / max(qt, qh)', n(X.FSb), ok(X.okB, '≥ ' + n(X.fsb, 1)), true)}
      <h3>${no}.4 抗滑動檢核（設止滑榫）</h3>
      <div class="sidefig"><div class="sf-main"><p class="note">設置剪力榫時，潛在滑動面為止滑榫前端之被動受剪區域。</p>
      ${eq(kp, n(X.Kp, 3), '', true)}
      ${eq('止滑榫位置 Kc ／ 尺寸 Kd', n(P.Kc) + ' / ' + n(P.Kd), 'm')}
      ${eq('趾地覆土深度 D = Y + Kd', n(o.g.Y + P.Kd), 'm')}
      ${eq('被動區單位重 γp', n(X.gp), 'tf/m³')}
      ${eq('Pp = γp(Y + Kd/2)·Kp·Kd', n(X.Pp), 'tf')}
      ${eq("L' = B − 2|e|", n(X.Lp), 'm')}
      ${eq('L1 = min(Kc, Kd/tan(45−φ/2))', n(X.L1), 'm')}
      ${eq("V1 = L1/L'·ΣV ／ V2 = ΣV − V1", n(X.V1) + ' / ' + n(X.V2), 'tf')}
      ${eq('ΣHu = V1·tanφ + V2·tan(2φ/3) + (c/2)·B + 50%·Pp', n(X.Hu), 'tf')}
      ${eq('ΣHd', n(X.SH), 'tf')}
      ${eq('FS = ΣHu / ΣHd', n(X.FSs), ok(X.okS, '≥ ' + n(X.fss, 1)), true)}</div><div class="sf-fig">${RWDraw.slide()}</div></div>`;
  }
  function rcReport(r) {
    return `<h4>${r.title}</h4>
      ${r.z !== null ? eq('斷面位置 z（自牆頂）', n(r.z), 'm') : ''}
      ${eq('斷面厚度 t ／ 有效深度 d', n(r.t, 1) + ' / ' + n(r.d), 'cm')}
      ${eq('常時 V ／ M', n(r.Vn) + ' / ' + n(r.Mn), 'tf, tf·m')}
      ${eq('地震時 V ／ M', n(r.Ve) + ' / ' + n(r.Me), 'tf, tf·m')}
      ${eq(`Vu = max(${n(o.cf.lfn)}Vn, ${n(o.cf.lfe)}Ve)`, n(r.Vu), 'tf/m', true)}
      ${eq(`φVc = ${n(o.cf.pv)}×0.53√fc'·b·d`, n(r.pVc), r.okV ? 'φVc≥Vu OK!' : 'φVc<Vu NG!')}
      ${eq(`Mu = max(${n(o.cf.lfn)}Mn, ${n(o.cf.lfe)}Me)`, n(r.Mu), 'tf·m/m', true)}
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
  function report() {
    const p = P, N = o.n, Q = o.e, g = o.g;
    const kpLab = { rankine: 'Kp = tan²(45 + φ/2)（Rankine）', coulomb: `Kp（Coulomb，δp = ${n(p.deltaP, 1)}°）`, example: 'Kp（範例沿用法：背填土 φ、δ、牆背 θ）' }[p.kpm] + (p.kpOvr ? '（指定值）' : '');
    const kpeLab = (p.kpm === 'example' ? 'Kpe（範例沿用法：靜態 Rankine）' : 'Kpe（M-O 被動式）') + (p.kpeOvr ? '（指定值）' : '');
    let h = `<p class="note">${p.id || ''}　H = ${n(p.H)} m</p>
    <h2>1. 設計依據</h2>
    <h3>1.1 材料參數</h3>
    <div class="scroll"><table class="t"><thead><tr><th></th><th>γ (tf/m³)</th><th>φ (度)</th><th>c (tf/m²)</th></tr></thead><tbody>
      <tr><td>背填土</td><td>${n(p.gB)}</td><td>${n(p.phiB, 1)}</td><td>${n(p.cB)}</td></tr>
      <tr><td>承載層</td><td>${n(p.gF)}</td><td>${n(p.phiF, 1)}</td><td>${n(p.cF)}</td></tr>
      <tr><td>混凝土</td><td>${n(p.gC)}</td><td>NA</td><td>NA</td></tr></tbody></table></div>
    <h3>1.2 地表超載重及地下水位</h3>
    ${eq('牆背地表超載 qs', n(p.qs), 'tf/m/m')}
    ${eq(`牆背地下水位 Hw1 = ${n(p.hw1r, 3)} × H`, n(o.hw1), 'm')}
    ${eq('牆前地下水位 Hw2（自基礎底面）', n(p.hw2), 'm')}
    <h3>1.3 載重組合</h3>
    <div class="scroll"><table class="t"><thead><tr><th></th><th>穩定分析</th><th>配筋設計</th></tr></thead><tbody>
      <tr><td>常時</td><td>D+L+H+F</td><td>${n(o.cf.lfn)}(D+L+H+F)</td></tr>
      <tr><td>地震時</td><td>D+L+H+F+EQ</td><td>${n(o.cf.lfe)}(D+L+H+F+EQ)</td></tr></tbody></table></div>
    <h3>1.4 材料設計強度</h3>
    ${eq("混凝土強度 fc'", n(p.fc, 0), 'kgf/cm²')}${eq('鋼筋降伏強度 fy', n(p.fy, 0), 'kgf/cm²')}
    <h3>1.5 地震係數</h3>${eq('Kh ／ Kv', n(p.kh, 3) + ' / ' + n(p.kv, 3), '')}
    <h3>1.6 安全係數</h3>
    <div class="scroll"><table class="t"><thead><tr><th></th><th>常時</th><th>地震時</th></tr></thead><tbody>
      <tr><td>抗滑動</td><td>${n(p.fss_n, 1)}</td><td>${n(p.fss_e, 1)}</td></tr>
      <tr><td>抗傾覆</td><td>${n(p.fso_n, 1)}</td><td>${n(p.fso_e, 1)}</td></tr>
      <tr><td>抗承載</td><td>${n(p.fsb_n, 1)}</td><td>${n(p.fsb_e, 1)}</td></tr></tbody></table></div>
    <h3>1.7 強度折減因子（${o.cf.name}）</h3>${eq('彎矩 φb ／ 剪力 φv', n(o.cf.pb) + ' / ' + n(o.cf.pv), '')}
    <h3>1.8 保護層</h3>${eq("保護層厚度 d'", n(p.cover, 1), 'cm')}
    <h3>1.9 土壓力參數</h3>${eq('牆背摩擦角比 δ/φ', n(p.deltaR, 3), '')}${eq('被動土壓係數計算方法', {rankine:'Rankine',coulomb:'Coulomb（δp = '+n(p.deltaP,1)+'°）',example:'範例沿用法'}[p.kpm], '')}

    <h2>2. 擋土牆設計尺寸及分析結果</h2>
    <h3>2.1 擋土牆設計尺寸</h3>
    <div class="dimrow"><div class="dimtab">    <div class="scroll"><table class="t"><tbody>
      ${[['(1) 牆身頂寬 T', p.T], ['(2) 牆體全高 H', p.H], ['(3) 牆身高度 h', g.h], ['(4) 基礎寬度 B', g.B], ['(5) 基礎趾長 C', p.C],
        ['(6) 牆身底寬 S', p.S], ['(7) 基礎踵長 E', p.E], ['(8) 基礎上高 D1', p.D1], ['(9) 基礎下高 D2', p.D2], ['(10) 牆背斜率 η', g.eta],
        ['(11) 止滑榫尺寸 Kd', p.Kd], ['(12) 止滑榫位置 Kc', p.Kc], ['(13) 趾版覆土 Df', p.Df], ['(14) 牆前回填 Y', g.Y]]
        .map(([a, b]) => `<tr><td>${a} (m)</td><td>${n(b)}</td></tr>`).join('')}
      <tr><td>(15) 背填坡度</td><td>1 : ${p.n}</td></tr></tbody></table></div></div>
    <div class="dimimg"><div class="dimmask" role="img" aria-label="擋土牆設計尺寸示意圖"></div><img class="dimprint" src="wall-dims.png" alt=""></div></div>
    <h3>2.2 常時，穩定分析結果</h3>${sumTable(N, 6)}
    <h3>2.3 地震時，穩定分析結果</h3>${sumTable(Q, 3)}
    <h3>2.4 擋土牆配筋設計</h3>${barTable()}

    <h2>3. 穩定分析（常時）</h2>
    <p class="note">穩定分析時，將擋土牆本身及趾（踵）版上方之填土視為一整體。</p>
    <h3>3.1 作用力計算</h3>
    <h4>a. 土壓力（Coulomb 主動土壓力係數）</h4>
    ${eq('φ ／ δ ／ θ ／ α', `${n(N.phi, 1)} / ${n(N.delta, 1)} / ${n(N.theta, 1)} / ${n(N.alpha, 1)}`, '度')}
    ${eq('Ka', n(N.Ka, 3), '', true)}
    ${eq('Pa', n(N.Pa), 'tf/m')}
    ${eq('Pah = Pa·cos(δ+θ) ／ ya', n(N.Pah) + ' / ' + n(N.ya), 'tf, m')}
    ${eq('Pav = Pa·sin(δ+θ) ／ xa', n(N.Pav) + ' / ' + n(N.xa), 'tf, m')}
    <h4>b. 超載重</h4>
    ${eq('Pqh = qs·Ka·H ／ yq', n(N.Pqh) + ' / ' + n(N.yq), 'tf, m')}
    ${eq('Pqv = qs·Ws ／ xq', n(N.Pqv) + ' / ' + n(N.xq), 'tf, m')}
    <h4>c. 水壓力</h4>
    ${eq('Pw ／ yw', n(N.Pw) + ' / ' + n(N.yw), 'tf, m')}
    ${eq('Pb（揚壓力）／ xb', n(N.Pb) + ' / ' + n(N.xb), 'tf, m')}
    <h4>d. 作用力總表</h4><div class="sidefig"><div class="sf-main">${forceTable(o.items, N.ext, 'n')}</div><div class="sf-fig">${RWDraw.blocks()}</div></div>
    ${stabReport(N, 3, 6, kpLab)}

    <h2>4. 穩定分析（地震時）</h2>
    <h3>4.1 動態土壓力（Mononobe-Okabe）</h3>
    ${eq('ψ = atan[Kh/(1−Kv)]', n(Q.psi), '度')}
    ${eq('Kae', n(Q.Kae, 3), '', true)}
    ${eq('Pae = Kae(1−Kv)·Σ', n(Q.Pae), 'tf/m')}
    ${eq('Paeh ／ yae', n(Q.Paeh) + ' / ' + n(Q.yae), 'tf, m')}
    ${eq('Paev ／ xae', n(Q.Paev) + ' / ' + n(Q.xae), 'tf, m')}
    ${eq('Pqeh ／ yqe', n(Q.Pqeh) + ' / ' + n(Q.yqe), 'tf, m')}
    ${eq('Pwe（含 Westergaard 動水壓）／ ywe', n(Q.Pwe) + ' / ' + n(Q.ywe), 'tf, m')}
    <h4>d. 作用力總表</h4><div class="sidefig"><div class="sf-main">${forceTable(o.items, Q.ext, 'e')}</div><div class="sf-fig">${RWDraw.blocks()}</div></div>
    ${stabReport(Q, 4, 3, kpeLab)}

    <h2>5. 配筋設計（USD）</h2>
    <h3>5.1 設計條件</h3>
    <p>1. 牆身與基礎交界為剛性區。2. 牆身、趾版及踵版視為懸臂梁（公路橋梁設計規範 6.2.2、6.2.3）。
    3. 地震時土壓動態增量作用於斷面以上 2z/3 處，並計入牆身慣性力。4. 基礎版依地盤反力分 20 等分條帶積分。</p>
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
    for (const [k, v] of [['h', o.g.h], ['B', o.g.B], ['eta', o.g.eta], ['Y', o.g.Y], ['hw1', o.hw1]]) {
      const el = document.getElementById('in_c_' + k); if (el) el.textContent = n(v, k === 'eta' ? 3 : 2);
    }
    const cb = document.getElementById('combo');
    if (cb) cb.innerHTML = `<table class="kv"><thead><tr><th></th><th>穩定分析</th><th>配筋設計</th></tr></thead><tbody>
      <tr><td>常時</td><td>D+L+H+F</td><td>${n(o.cf.lfn)}(D+L+H+F)</td></tr>
      <tr><td>地震時</td><td>D+L+H+F+EQ</td><td>${n(o.cf.lfe)}(D+L+H+F+EQ)</td></tr></tbody></table>
      <p class="hint">D=靜載重　L=活載重　H=土壓力　F=水壓力　EQ=地震力</p>`;
    summary(); drawSection(o); report();
  }

  // ---------- actions ----------
  document.getElementById('btnPrint').onclick = () => window.print();
  document.getElementById('btnReset').onclick = () => { P = clone(RW.DEFAULTS); save(); buildForm(); run(); };
  document.getElementById('btnSave').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(P, null, 2)], { type: 'application/json' }));
    a.download = (P.id || 'retaining-wall') + '.json'; a.click(); URL.revokeObjectURL(a.href);
  };
  document.getElementById('fileLoad').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then(t => { P = Object.assign(clone(RW.DEFAULTS), JSON.parse(t)); save(); buildForm(); run(); }).catch(() => alert('檔案格式錯誤'));
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
  buildForm(); run(); setTop();
})();
