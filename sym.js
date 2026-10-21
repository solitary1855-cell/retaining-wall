/* 參數代號上下標格式化：掃描文字節點，把 Ka、Pah、Hw1、f'c… 轉成下標／上標 */
(function (root) {
  // [代號, 主符號, 下標, 上標]
  const T = [
    ["fc'", 'f', 'c', '′'], ['fy', 'f', 'y'],
    ['Kae', 'K', 'ae'], ['Kpe', 'K', 'pe'], ['Kah', 'K', 'ah'], ['Kaeh', 'K', 'aeh'],
    ['Ka', 'K', 'a'], ['Kp', 'K', 'p'], ['Kh', 'K', 'h'], ['Kv', 'K', 'v'],
    ['Kd', 'K', 'd'], ['Kc', 'K', 'c'], ['Ks', 'K', 's'],
    ['Paeh', 'P', 'aeh'], ['Paev', 'P', 'aev'], ['Pqeh', 'P', 'qeh'], ['Pqev', 'P', 'qev'],
    ['Pae', 'P', 'ae'], ['Pah', 'P', 'ah'], ['Pav', 'P', 'av'], ['Pqh', 'P', 'qh'], ['Pqv', 'P', 'qv'],
    ['Pwe', 'P', 'we'], ['Pbe', 'P', 'be'], ['Pa', 'P', 'a'], ['Pw', 'P', 'w'], ['Pb', 'P', 'b'], ['Pp', 'P', 'p'],
    ['qs', 'q', 's'], ['qt', 'q', 't'], ['qh', 'q', 'h'], ['qu', 'q', 'u'], ['q0', 'q', '0'], ['q1', 'q', '1'], ['q2', 'q', '2'],
    ['Nc', 'N', 'c'], ['Nq', 'N', 'q'], ['Nγ', 'N', 'γ'],
    ['Fcd', 'F', 'cd'], ['Fci', 'F', 'ci'], ['Fqd', 'F', 'qd'], ['Fqi', 'F', 'qi'], ['Frd', 'F', 'γd'], ['Fri', 'F', 'γi'],
    ['Fcs', 'F', 'cs'], ['Fqs', 'F', 'qs'], ['Frs', 'F', 'γs'],
    ['γc', 'γ', 'c'], ['γw', 'γ', 'w'], ['γ1', 'γ', '1'], ['γ2', 'γ', '2'], ['γp', 'γ', 'p'],
    ['Hw1', 'H', 'w1'], ['Hw2', 'H', 'w2'], ['H1', 'H', '1'],
    ['D1', 'D', '1'], ['D2', 'D', '2'], ['Df', 'D', 'f'], ['L1', 'L', '1'], ['L2', 'L', '2'], ['L3', 'L', '3'],
    ['xae', 'x', 'ae'], ['yae', 'y', 'ae'], ['xqe', 'x', 'qe'], ['yqe', 'y', 'qe'], ['xbe', 'x', 'be'], ['ywe', 'y', 'we'],
    ['xa', 'x', 'a'], ['ya', 'y', 'a'], ['xq', 'x', 'q'], ['yq', 'y', 'q'], ['xb', 'x', 'b'], ['yw', 'y', 'w'],
    ['φVc', 'φV', 'c'], ['φb', 'φ', 'b'], ['φv', 'φ', 'v'], ['ϕVc', 'ϕV', 'c'], ['ϕb', 'ϕ', 'b'], ['ϕv', 'ϕ', 'v'], ['δp', 'δ', 'p'],
    ['ρmin', 'ρ', 'min'], ['ρt', 'ρ', 't'],
    ['Vu', 'V', 'u'], ['Mu', 'M', 'u'], ['Vn', 'V', 'n'], ['Mn', 'M', 'n'], ['Ve', 'V', 'e'], ['Me', 'M', 'e'],
    ['Vc', 'V', 'c'], ['Rn', 'R', 'n'], ['Mr', 'M', 'r'], ['Md', 'M', 'd'], ['Hu', 'H', 'u'], ['Hd', 'H', 'd'],
    ['V1', 'V', '1'], ['V2', 'V', '2'], ["As'", 'A', 's', '′'], ['As', 'A', 's'], ['Ab', 'A', 'b'],
    ['KAE', 'K', 'AE'], ['KPE', 'K', 'PE'], ['KA', 'K', 'A'], ['KP', 'K', 'P'], ['PAEh', 'P', 'AEh'], ['PAEv', 'P', 'AEv'], ['PAE', 'P', 'AE'],
    ['PQEh', 'P', 'QEh'], ['PQEv', 'P', 'QEv'], ['PWE', 'P', 'WE'], ['PA', 'P', 'A'], ['yA', 'y', 'A'], ['xA', 'x', 'A'],
    ['PGAh', 'PGA', 'h'], ['PGAv', 'PGA', 'v'], ['kh', 'k', 'h'], ['kv', 'k', 'v'],
    ['Ws', 'W', 's'], ['tav', 't', 'av'], ['hav', 'h', 'av'], ['ta', 't', 'a'], ['db', 'd', 'b']
  ];
  const map = new Map(T.map(t => [t[0], t]));
  const esc = s => s.replace(/[.*+?^${}()|[\]\\']/g, '\\$&');
  const keys = T.map(t => t[0]).sort((a, b) => b.length - a.length).map(esc);
  const RE = new RegExp(`(?<![A-Za-z_'])(${keys.join('|')})(?![A-Za-z0-9_])`, 'g');
  const SVGNS = 'http://www.w3.org/2000/svg';
  const SKIP = new Set(['SCRIPT', 'STYLE', 'INPUT', 'SELECT', 'OPTION', 'TEXTAREA', 'SUB', 'SUP', 'tspan']);

  function htmlFrag(text) {
    const f = document.createDocumentFragment(); let last = 0, m;
    RE.lastIndex = 0;
    while ((m = RE.exec(text))) {
      if (m.index > last) f.appendChild(document.createTextNode(text.slice(last, m.index)));
      const [, base, sub, sup] = map.get(m[1]);
      const sp = document.createElement('span'); sp.className = 'sym';
      sp.appendChild(document.createTextNode(base));
      if (sup) { const e = document.createElement('sup'); e.textContent = sup; sp.appendChild(e); }
      const s = document.createElement('sub'); s.textContent = sub; sp.appendChild(s);
      f.appendChild(sp); last = RE.lastIndex;
    }
    if (last < text.length) f.appendChild(document.createTextNode(text.slice(last)));
    return f;
  }
  function svgText(el) {
    const text = el.textContent; RE.lastIndex = 0;
    if (!RE.test(text)) return;
    RE.lastIndex = 0;
    while (el.firstChild) el.removeChild(el.firstChild);
    const add = (t, cls) => { const s = document.createElementNS(SVGNS, 'tspan'); s.textContent = t; if (cls) s.setAttribute('class', cls); el.appendChild(s); return s; };
    let last = 0, m;
    while ((m = RE.exec(text))) {
      if (m.index > last) add(text.slice(last, m.index));
      const [, base, sub, sup] = map.get(m[1]);
      add(base + (sup || ''));
      const s = add(sub, 'tsub'); s.setAttribute('baseline-shift', 'sub'); s.setAttribute('font-size', '75%');
      const back = add('​'); back.setAttribute('baseline-shift', '0');
      last = RE.lastIndex;
    }
    if (last < text.length) add(text.slice(last));
  }
  function fmt(rootEl) {
    if (!rootEl) return;
    rootEl.querySelectorAll('svg text').forEach(t => { if (!t.querySelector('tspan')) svgText(t); });
    const w = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        for (let p = n.parentNode; p && p !== rootEl.parentNode; p = p.parentNode) {
          if (SKIP.has(p.nodeName) || p.namespaceURI === SVGNS || p.namespaceURI === 'http://www.w3.org/1998/Math/MathML' || p.nodeName.toLowerCase() === 'math') return NodeFilter.FILTER_REJECT;
          if (p.classList && p.classList.contains('sym')) return NodeFilter.FILTER_REJECT;
        }
        RE.lastIndex = 0;
        return RE.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(n => n.parentNode.replaceChild(htmlFrag(n.nodeValue), n));
  }
  root.fmtSymbols = fmt;
})(window);
