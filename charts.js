/* ═══════════════════════════════════════════════════════════════
   BEHIND THE NUMBERS — chart engine
   Lightweight, dependency-free SVG charts styled to match the site.
   You don't need to edit this file. You build charts in your HTML
   with simple data- attributes — see the comment block at the bottom
   for copy-paste examples.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  var SVGNS = 'http://www.w3.org/2000/svg';

  // Pull the live palette straight from the stylesheet so charts always
  // match the site even if you re-skin the colors in styles.css :root.
  function cssVar(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v && v.trim()) || fallback;
  }
  var COL = {
    navy:  cssVar('--navy', '#1E3A5F'),
    deep:  cssVar('--navy-deep', '#16293F'),
    ink:   cssVar('--ink', '#1B2536'),
    faint: cssVar('--ink-faint', '#8A91A0'),
    soft:  cssVar('--ink-soft', '#4A5567'),
    up:    cssVar('--up', '#2E7D5B'),
    down:  cssVar('--down', '#B3402F'),
    rule:  'rgba(27,37,54,0.14)',
    paper: cssVar('--paper', '#FAF7F0')
  };
  var SANS = 'Archivo, "Helvetica Neue", Arial, sans-serif';
  var MONO = '"IBM Plex Mono", "Courier New", monospace';

  function el(name, attrs) {
    var n = document.createElementNS(SVGNS, name);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function text(x, y, str, opts) {
    opts = opts || {};
    var t = el('text', {
      x: x, y: y,
      'font-family': opts.mono ? MONO : SANS,
      'font-size': opts.size || 11,
      'font-weight': opts.weight || 400,
      fill: opts.fill || COL.faint,
      'text-anchor': opts.anchor || 'start',
      'letter-spacing': opts.ls || 0
    });
    if (opts.transform) t.setAttribute('transform', opts.transform);
    t.textContent = str;
    return t;
  }
  function nums(str) {
    return (str || '').split(',').map(function (s) { return parseFloat(s.trim()); })
      .filter(function (n) { return !isNaN(n); });
  }
  function items(str) {
    return (str || '').split(',').map(function (s) { return s.trim(); });
  }
  function niceMax(v) {
    if (v <= 0) return 1;
    var pow = Math.pow(10, Math.floor(Math.log10(v)));
    var f = v / pow;
    var nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
    return nf * pow;
  }
  function fmtNum(n) {
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
    return (Math.round(n * 100) / 100).toString();
  }

  // ── LINE (1 or 2 series, optional end-of-line annotation) ──────
  function lineChart(host, cfg) {
    var W = cfg.w, H = cfg.h;
    var compact = cfg.compact;
    var s1 = nums(host.dataset.series);
    var s2 = nums(host.dataset.series2);
    var labels = items(host.dataset.labels);
    var unit = host.dataset.unit || '';
    var pad = { t: 16, r: compact ? 14 : 18, b: 26, l: compact ? 34 : 42 };
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%',
      role: 'img', preserveAspectRatio: 'xMidYMid meet' });

    var all = s1.concat(s2);
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
    var span = hi - lo || 1;
    lo -= span * 0.12; hi += span * 0.12;
    var plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
    var x = function (i, n) { return pad.l + (n <= 1 ? plotW / 2 : (plotW * i) / (n - 1)); };
    var y = function (v) { return pad.t + plotH * (1 - (v - lo) / (hi - lo)); };

    // horizontal gridlines + y labels
    var ticks = 4;
    for (var g = 0; g <= ticks; g++) {
      var val = lo + ((hi - lo) * g) / ticks;
      var gy = y(val);
      svg.appendChild(el('line', { x1: pad.l, y1: gy, x2: W - pad.r, y2: gy,
        stroke: COL.rule, 'stroke-width': 1 }));
      svg.appendChild(text(pad.l - 7, gy + 3.5, fmtNum(val) + (unit && g === ticks ? unit : ''),
        { anchor: 'end', mono: true, size: compact ? 9 : 10, fill: COL.faint }));
    }

    function path(series, color, fill) {
      if (!series.length) return;
      var d = '';
      series.forEach(function (v, i) { d += (i ? 'L' : 'M') + x(i, series.length).toFixed(1) + ' ' + y(v).toFixed(1) + ' '; });
      if (fill) {
        var area = d + 'L' + x(series.length - 1, series.length).toFixed(1) + ' ' + (pad.t + plotH) +
          ' L' + x(0, series.length).toFixed(1) + ' ' + (pad.t + plotH) + ' Z';
        var grad = 'g' + Math.random().toString(36).slice(2, 7);
        var defs = el('defs');
        var lg = el('linearGradient', { id: grad, x1: 0, y1: 0, x2: 0, y2: 1 });
        lg.appendChild(el('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': 0.16 }));
        lg.appendChild(el('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': 0 }));
        defs.appendChild(lg); svg.appendChild(defs);
        svg.appendChild(el('path', { d: area, fill: 'url(#' + grad + ')' }));
      }
      svg.appendChild(el('path', { d: d.trim(), fill: 'none', stroke: color,
        'stroke-width': compact ? 2 : 2.25, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
      // end dot
      var lx = x(series.length - 1, series.length), ly = y(series[series.length - 1]);
      svg.appendChild(el('circle', { cx: lx, cy: ly, r: compact ? 3 : 3.5, fill: color,
        stroke: COL.paper, 'stroke-width': 2 }));
    }

    if (s2.length) path(s2, COL.faint, false);
    path(s1, COL.navy, true);

    // x labels (sparse allowed — blank entries skipped)
    labels.forEach(function (lab, i) {
      if (!lab) return;
      svg.appendChild(text(x(i, Math.max(labels.length, s1.length)), H - 8, lab,
        { anchor: i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle',
          mono: true, size: compact ? 9 : 10, fill: COL.faint }));
    });

    host.appendChild(svg);
    buildLegend(host, cfg, [[COL.navy, host.dataset.legend], [COL.faint, host.dataset.legend2]]);
  }

  // ── BARS (single series; negatives render in the "down" color) ─
  function barChart(host, cfg) {
    var W = cfg.w, H = cfg.h, compact = cfg.compact;
    var s = nums(host.dataset.series);
    var labels = items(host.dataset.labels);
    var unit = host.dataset.unit || '';
    var diverging = s.some(function (v) { return v < 0; });
    var pad = { t: 14, r: 12, b: 26, l: compact ? 32 : 40 };
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', role: 'img', preserveAspectRatio: 'xMidYMid meet' });

    var hi = Math.max.apply(null, s.concat(diverging ? [] : [0]));
    var lo = diverging ? Math.min.apply(null, s) : 0;
    var topNice = niceMax(hi), botNice = diverging ? -niceMax(Math.abs(lo)) : 0;
    var plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
    var y = function (v) { return pad.t + plotH * (1 - (v - botNice) / (topNice - botNice)); };
    var zeroY = y(0);

    var ticks = diverging ? 4 : 4;
    for (var g = 0; g <= ticks; g++) {
      var val = botNice + ((topNice - botNice) * g) / ticks;
      var gy = y(val);
      svg.appendChild(el('line', { x1: pad.l, y1: gy, x2: W - pad.r, y2: gy,
        stroke: Math.abs(val) < 1e-9 ? COL.rule : COL.rule, 'stroke-width': Math.abs(val) < 1e-9 ? 1.4 : 1 }));
      svg.appendChild(text(pad.l - 6, gy + 3.5, fmtNum(val), { anchor: 'end', mono: true, size: compact ? 9 : 10 }));
    }

    var n = s.length, gap = compact ? 6 : 9;
    var bw = (plotW - gap * (n - 1)) / n;
    s.forEach(function (v, i) {
      var bx = pad.l + i * (bw + gap);
      var top = Math.min(y(v), zeroY), hgt = Math.abs(y(v) - zeroY);
      var color = v < 0 ? COL.down : (diverging ? COL.up : COL.navy);
      svg.appendChild(el('rect', { x: bx, y: top, width: bw, height: Math.max(hgt, 0.5), fill: color, opacity: 0.92 }));
      if (labels[i]) svg.appendChild(text(bx + bw / 2, H - 8, labels[i],
        { anchor: 'middle', mono: true, size: compact ? 9 : 10 }));
    });

    host.appendChild(svg);
    if (unit) host.setAttribute('data-unit-rendered', unit);
  }

  // ── GROUPED (two series side by side) ──────────────────────────
  function groupedChart(host, cfg) {
    var W = cfg.w, H = cfg.h, compact = cfg.compact;
    var a = nums(host.dataset.series), b = nums(host.dataset.series2);
    var labels = items(host.dataset.labels);
    var pad = { t: 14, r: 12, b: 26, l: compact ? 32 : 40 };
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', role: 'img', preserveAspectRatio: 'xMidYMid meet' });
    var all = a.concat(b);
    var hi = Math.max.apply(null, all.concat([0])), lo = Math.min.apply(null, all.concat([0]));
    var topNice = niceMax(hi), botNice = lo < 0 ? -niceMax(Math.abs(lo)) : 0;
    var plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
    var y = function (v) { return pad.t + plotH * (1 - (v - botNice) / (topNice - botNice)); };
    var zeroY = y(0);
    for (var g = 0; g <= 4; g++) {
      var val = botNice + ((topNice - botNice) * g) / 4, gy = y(val);
      svg.appendChild(el('line', { x1: pad.l, y1: gy, x2: W - pad.r, y2: gy, stroke: COL.rule,
        'stroke-width': Math.abs(val) < 1e-9 ? 1.4 : 1 }));
      svg.appendChild(text(pad.l - 6, gy + 3.5, fmtNum(val), { anchor: 'end', mono: true, size: compact ? 9 : 10 }));
    }
    var n = a.length, groupGap = compact ? 8 : 12, innerGap = 3;
    var gw = (plotW - groupGap * (n - 1)) / n;
    var bw = (gw - innerGap) / 2;
    for (var i = 0; i < n; i++) {
      var gx = pad.l + i * (gw + groupGap);
      [[a[i], COL.navy, 0], [b[i], COL.up, bw + innerGap]].forEach(function (p) {
        if (isNaN(p[0])) return;
        var top = Math.min(y(p[0]), zeroY), hgt = Math.abs(y(p[0]) - zeroY);
        svg.appendChild(el('rect', { x: gx + p[2], y: top, width: bw, height: Math.max(hgt, 0.5), fill: p[1], opacity: 0.92 }));
      });
      if (labels[i]) svg.appendChild(text(gx + gw / 2, H - 8, labels[i], { anchor: 'middle', mono: true, size: compact ? 9 : 10 }));
    }
    host.appendChild(svg);
    buildLegend(host, cfg, [[COL.navy, host.dataset.legend], [COL.up, host.dataset.legend2]]);
  }

  // ── SPLIT (horizontal 100% stacked — sum-of-the-parts) ─────────
  function splitChart(host, cfg) {
    var W = cfg.w, H = 64;
    var parts = items(host.dataset.parts).map(function (p) {
      var ix = p.lastIndexOf(':');
      return { label: p.slice(0, ix).trim(), val: parseFloat(p.slice(ix + 1)) };
    }).filter(function (p) { return !isNaN(p.val); });
    var total = parts.reduce(function (s, p) { return s + p.val; }, 0) || 1;
    var shades = [COL.navy, COL.up, COL.faint, COL.down, COL.soft];
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', role: 'img', preserveAspectRatio: 'xMidYMid meet' });
    var barH = 30, padX = 2, run = padX, gap = 2;
    var usable = W - padX * 2 - gap * (parts.length - 1);
    parts.forEach(function (p, i) {
      var w = (usable * p.val) / total;
      var color = shades[i % shades.length];
      svg.appendChild(el('rect', { x: run, y: 6, width: Math.max(w, 1), height: barH, fill: color, opacity: 0.92 }));
      var pct = Math.round((p.val / total) * 100);
      if (w > 34) svg.appendChild(text(run + w / 2, 26, pct + '%', { anchor: 'middle', mono: true,
        size: 12, weight: 600, fill: '#FFFFFF' }));
      run += w + gap;
    });
    host.appendChild(svg);
    // legend row
    var leg = document.createElement('div');
    leg.className = 'chart-legend';
    parts.forEach(function (p, i) {
      var span = document.createElement('span');
      span.className = 'chart-legend-item';
      var sw = document.createElement('i');
      sw.style.background = shades[i % shades.length];
      span.appendChild(sw);
      span.appendChild(document.createTextNode(p.label));
      leg.appendChild(span);
    });
    host.appendChild(leg);
  }

  function buildLegend(host, cfg, pairs) {
    var valid = pairs.filter(function (p) { return p[1]; });
    if (!valid.length) return;
    var leg = document.createElement('div');
    leg.className = 'chart-legend';
    valid.forEach(function (p) {
      var span = document.createElement('span');
      span.className = 'chart-legend-item';
      var sw = document.createElement('i');
      sw.style.background = p[0];
      span.appendChild(sw);
      span.appendChild(document.createTextNode(p[1]));
      leg.appendChild(span);
    });
    host.appendChild(leg);
  }

  var RENDERERS = { line: lineChart, bars: barChart, grouped: groupedChart, split: splitChart };

  function render(host) {
    if (host.dataset.rendered) return;
    var kind = host.dataset.chart;
    var fn = RENDERERS[kind];
    if (!fn) return;
    var compact = host.classList.contains('chart--card');
    var w = parseInt(host.dataset.w, 10) || (compact ? 360 : 680);
    var h = parseInt(host.dataset.h, 10) || (compact ? 200 : 300);
    var canvas = document.createElement('div');
    canvas.className = 'chart-canvas';
    for (var k in host.dataset) { canvas.dataset[k] = host.dataset[k]; }
    host.appendChild(canvas);
    fn(canvas, { w: w, h: h, compact: compact });
    host.dataset.rendered = '1';
  }

  function init() {
    var nodes = document.querySelectorAll('[data-chart]');
    nodes.forEach(render);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* ───────────────────────────────────────────────────────────────
   HOW TO ADD A CHART (copy a block into your article or homepage)

   Wrap any chart in a <figure class="figure"> with a caption + source.
   The numbers live in the data- attributes — edit those by hand.

   LINE (one trend; add data-series2 + data-legend/legend2 for two):
     <figure class="figure">
       <figcaption class="fig-cap">The 2-year yield, since April</figcaption>
       <div class="chart" data-chart="line"
            data-series="4.72,4.66,4.58,4.51,4.44,4.39,4.34"
            data-labels="Apr,,,May,,,Jun"
            data-unit="%"></div>
       <p class="fig-src">Source: Behind The Numbers · Treasury data</p>
     </figure>

   BARS (single series; use negatives for outflows — they turn red):
     data-chart="bars" data-series="-4.1,-2.8,-3.3,1.2,5.6" data-labels="Jan,Feb,Mar,Apr,May"

   GROUPED (two series side by side):
     data-chart="grouped" data-series="..." data-series2="..."
     data-legend="FII" data-legend2="DII" data-labels="..."

   SPLIT (100% stacked — sum-of-the-parts):
     data-chart="split" data-parts="Starlink:78, Launch:17, Other:5"

   Add class="chart--card" for the smaller homepage-card size.
   ─────────────────────────────────────────────────────────────── */
