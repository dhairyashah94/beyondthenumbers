/* ═══════════════════════════════════════════════════════════════
   BEHIND THE NUMBERS — quote search
   Adds a "Quotes" search to the top bar on any page that loads
   this file. Type a company, commodity, currency pair or index;
   a live TradingView chart opens in an overlay. No API keys.
   You don't need to edit this file — to add symbols to the
   suggestion list, copy a line in SYMBOLS below.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  // ✏️ EDIT: the curated suggestion list. Format:
  // { s: 'EXCHANGE:TICKER' (TradingView symbol), n: 'Display name', t: 'Type', k: 'extra search words' }
  var SYMBOLS = [
    // US stocks
    { s: 'NASDAQ:AAPL', n: 'Apple', t: 'Stock', k: 'aapl' },
    { s: 'NASDAQ:MSFT', n: 'Microsoft', t: 'Stock', k: 'msft' },
    { s: 'NASDAQ:NVDA', n: 'NVIDIA', t: 'Stock', k: 'nvda chips' },
    { s: 'NASDAQ:GOOGL', n: 'Alphabet (Google)', t: 'Stock', k: 'googl goog' },
    { s: 'NASDAQ:AMZN', n: 'Amazon', t: 'Stock', k: 'amzn' },
    { s: 'NASDAQ:META', n: 'Meta Platforms', t: 'Stock', k: 'facebook' },
    { s: 'NASDAQ:TSLA', n: 'Tesla', t: 'Stock', k: 'tsla' },
    { s: 'NYSE:ORCL', n: 'Oracle', t: 'Stock', k: 'orcl' },
    { s: 'NASDAQ:NFLX', n: 'Netflix', t: 'Stock', k: 'nflx' },
    { s: 'NASDAQ:AMD', n: 'AMD', t: 'Stock', k: 'advanced micro' },
    { s: 'NASDAQ:AVGO', n: 'Broadcom', t: 'Stock', k: 'avgo' },
    { s: 'NYSE:JPM', n: 'JPMorgan Chase', t: 'Stock', k: 'jpm bank' },
    { s: 'NYSE:GS', n: 'Goldman Sachs', t: 'Stock', k: 'gs bank' },
    { s: 'NYSE:BRK.B', n: 'Berkshire Hathaway', t: 'Stock', k: 'brk buffett' },
    { s: 'NYSE:V', n: 'Visa', t: 'Stock', k: '' },
    { s: 'NYSE:XOM', n: 'Exxon Mobil', t: 'Stock', k: 'xom oil' },
    { s: 'NYSE:CVX', n: 'Chevron', t: 'Stock', k: 'cvx oil' },
    { s: 'NYSE:WMT', n: 'Walmart', t: 'Stock', k: 'wmt retail' },
    { s: 'NYSE:DIS', n: 'Disney', t: 'Stock', k: 'dis' },
    { s: 'NYSE:BA', n: 'Boeing', t: 'Stock', k: 'ba' },
    { s: 'NASDAQ:PLTR', n: 'Palantir', t: 'Stock', k: 'pltr' },
    { s: 'NYSE:CRM', n: 'Salesforce', t: 'Stock', k: 'crm' },
    { s: 'NASDAQ:CHWY', n: 'Chewy', t: 'Stock', k: 'chwy' },

    // Indian stocks
    { s: 'NSE:RELIANCE', n: 'Reliance Industries', t: 'Stock · India', k: 'ril' },
    { s: 'NSE:TCS', n: 'Tata Consultancy Services', t: 'Stock · India', k: 'tcs' },
    { s: 'NSE:HDFCBANK', n: 'HDFC Bank', t: 'Stock · India', k: '' },
    { s: 'NSE:INFY', n: 'Infosys', t: 'Stock · India', k: '' },
    { s: 'NSE:ICICIBANK', n: 'ICICI Bank', t: 'Stock · India', k: '' },
    { s: 'NSE:SBIN', n: 'State Bank of India', t: 'Stock · India', k: 'sbi' },
    { s: 'NSE:TATAMOTORS', n: 'Tata Motors', t: 'Stock · India', k: '' },
    { s: 'NSE:ITC', n: 'ITC', t: 'Stock · India', k: '' },
    { s: 'NSE:LT', n: 'Larsen & Toubro', t: 'Stock · India', k: 'l&t' },
    { s: 'NSE:BAJFINANCE', n: 'Bajaj Finance', t: 'Stock · India', k: '' },

    // Indices
    { s: 'SP:SPX', n: 'S&P 500', t: 'Index', k: 'spx us market' },
    { s: 'NASDAQ:IXIC', n: 'Nasdaq Composite', t: 'Index', k: 'tech' },
    { s: 'DJ:DJI', n: 'Dow Jones Industrial', t: 'Index', k: 'dow' },
    { s: 'NSE:NIFTY', n: 'Nifty 50', t: 'Index · India', k: 'nifty india' },
    { s: 'BSE:SENSEX', n: 'Sensex', t: 'Index · India', k: 'bse india' },
    { s: 'TVC:NI225', n: 'Nikkei 225', t: 'Index · Japan', k: 'japan' },
    { s: 'TVC:HSI', n: 'Hang Seng', t: 'Index · HK', k: 'hong kong china' },
    { s: 'TVC:DXY', n: 'US Dollar Index', t: 'Index', k: 'dxy dollar' },
    { s: 'CBOE:VIX', n: 'VIX (Volatility)', t: 'Index', k: 'fear' },

    // Commodities
    { s: 'TVC:GOLD', n: 'Gold (spot)', t: 'Commodity', k: 'xau' },
    { s: 'TVC:SILVER', n: 'Silver (spot)', t: 'Commodity', k: 'xag' },
    { s: 'TVC:UKOIL', n: 'Brent Crude Oil', t: 'Commodity', k: 'oil brent' },
    { s: 'TVC:USOIL', n: 'WTI Crude Oil', t: 'Commodity', k: 'oil wti' },
    { s: 'NYMEX:NG1!', n: 'Natural Gas (futures)', t: 'Commodity', k: 'natgas' },
    { s: 'COMEX:HG1!', n: 'Copper (futures)', t: 'Commodity', k: '' },

    // Currencies
    { s: 'FX_IDC:USDINR', n: 'USD / INR', t: 'Currency', k: 'rupee dollar india' },
    { s: 'FX:EURUSD', n: 'EUR / USD', t: 'Currency', k: 'euro' },
    { s: 'FX:GBPUSD', n: 'GBP / USD', t: 'Currency', k: 'pound sterling cable' },
    { s: 'FX:USDJPY', n: 'USD / JPY', t: 'Currency', k: 'yen' },
    { s: 'FX_IDC:EURINR', n: 'EUR / INR', t: 'Currency', k: 'euro rupee' },

    // Crypto
    { s: 'BITSTAMP:BTCUSD', n: 'Bitcoin', t: 'Crypto', k: 'btc' },
    { s: 'BITSTAMP:ETHUSD', n: 'Ethereum', t: 'Crypto', k: 'eth' },

    // Rates
    { s: 'TVC:US10Y', n: 'US 10-Year Yield', t: 'Yield', k: 'treasury bond rates' },
    { s: 'TVC:US02Y', n: 'US 2-Year Yield', t: 'Yield', k: 'treasury bond rates fed' }
  ];

  var RECENT_KEY = 'btn-quote-recents';

  /* ── Build UI ─────────────────────────────────────────────── */
  var nav = document.querySelector('.topbar nav');
  if (!nav) return;

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'qs-open';
  btn.innerHTML = '<span class="qs-glyph">⌕</span> Quotes';
  nav.appendChild(btn);

  var overlay = document.createElement('div');
  overlay.className = 'qs-overlay';
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="qs-modal" role="dialog" aria-label="Search quotes">' +
    '  <div class="qs-head">' +
    '    <span class="qs-glyph big">⌕</span>' +
    '    <input type="text" class="qs-input" placeholder="Search a stock, index, commodity or currency…" autocomplete="off" spellcheck="false">' +
    '    <button type="button" class="qs-close" aria-label="Close">✕</button>' +
    '  </div>' +
    '  <div class="qs-results"></div>' +
    '  <div class="qs-chart" hidden></div>' +
    '  <p class="qs-note">Live data via TradingView. Quotes may be delayed by the exchange. Press Esc to close.</p>' +
    '</div>';
  document.body.appendChild(overlay);

  var input = overlay.querySelector('.qs-input');
  var results = overlay.querySelector('.qs-results');
  var chartBox = overlay.querySelector('.qs-chart');

  /* ── Open / close ─────────────────────────────────────────── */
  function open() {
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    input.value = '';
    chartBox.hidden = true;
    renderList('');
    setTimeout(function () { input.focus(); }, 30);
  }
  function close() {
    overlay.hidden = true;
    document.body.style.overflow = '';
  }
  btn.addEventListener('click', open);
  overlay.querySelector('.qs-close').addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) close();
    if (e.key === '/' && overlay.hidden && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
      e.preventDefault(); open();
    }
  });

  /* ── Recents (stored locally in the reader's browser) ─────── */
  function getRecents() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch (e) { return []; }
  }
  function addRecent(item) {
    var rec = getRecents().filter(function (r) { return r.s !== item.s; });
    rec.unshift({ s: item.s, n: item.n, t: item.t });
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(rec.slice(0, 6))); } catch (e) {}
  }

  /* ── Search + result list ─────────────────────────────────── */
  function matches(q, item) {
    var hay = (item.n + ' ' + item.s + ' ' + item.t + ' ' + (item.k || '')).toLowerCase();
    return q.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }

  function renderList(q) {
    q = q.trim().toLowerCase();
    results.innerHTML = '';
    chartBox.hidden = true;

    var list, heading;
    if (!q) {
      list = getRecents();
      heading = list.length ? 'Recent' : '';
      if (!list.length) list = SYMBOLS.slice(0, 8), heading = 'Popular';
    } else {
      list = SYMBOLS.filter(function (s) { return matches(q, s); }).slice(0, 9);
      heading = '';
    }

    if (heading) {
      var h = document.createElement('div');
      h.className = 'qs-heading';
      h.textContent = heading;
      results.appendChild(h);
    }

    list.forEach(function (item, i) {
      var row = document.createElement('button');
      row.type = 'button';
      row.className = 'qs-row' + (i === 0 && q ? ' active' : '');
      row.innerHTML = '<span class="qs-name">' + item.n + '</span>' +
        '<span class="qs-sym">' + item.s.split(':').pop() + '</span>' +
        '<span class="qs-type">' + item.t + '</span>';
      row.addEventListener('click', function () { select(item); });
      results.appendChild(row);
    });

    // raw-ticker fallback: try whatever was typed as a symbol
    if (q && q.length >= 2) {
      var raw = q.toUpperCase().replace(/\s+/g, '');
      var row = document.createElement('button');
      row.type = 'button';
      row.className = 'qs-row qs-raw' + (list.length ? '' : ' active');
      row.innerHTML = '<span class="qs-name">Look up “' + raw.replace(/[<>&"]/g, '') + '” as a ticker</span>' +
        '<span class="qs-type">Any symbol</span>';
      row.addEventListener('click', function () {
        select({ s: raw, n: raw, t: 'Symbol' });
      });
      results.appendChild(row);
    }

    if (!results.children.length) {
      var empty = document.createElement('div');
      empty.className = 'qs-empty';
      empty.textContent = 'Keep typing — a company name, ticker, commodity or currency pair.';
      results.appendChild(empty);
    }
  }

  input.addEventListener('input', function () { renderList(input.value); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var first = results.querySelector('.qs-row.active') || results.querySelector('.qs-row');
      if (first) first.click();
    }
  });

  /* ── Chart (TradingView symbol-overview widget) ───────────── */
  function select(item) {
    addRecent(item);
    results.innerHTML = '';
    chartBox.hidden = false;
    chartBox.innerHTML = '';

    var back = document.createElement('button');
    back.type = 'button';
    back.className = 'qs-back';
    back.textContent = '← Search again';
    back.addEventListener('click', function () {
      input.value = '';
      renderList('');
      input.focus();
    });
    chartBox.appendChild(back);

    var holder = document.createElement('div');
    holder.className = 'tradingview-widget-container';
    var inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    holder.appendChild(inner);
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
    script.async = true;
    script.text = JSON.stringify({
      symbols: [[item.n, item.s + '|12M']],
      chartOnly: false,
      width: '100%',
      height: 400,
      locale: 'en',
      colorTheme: 'light',
      autosize: false,
      showVolume: false,
      hideDateRanges: false,
      scalePosition: 'right',
      scaleMode: 'Normal',
      fontFamily: 'Archivo, -apple-system, sans-serif',
      noTimeScale: false,
      valuesTracking: '1',
      chartType: 'area',
      lineColor: '#1E3A5F',
      topColor: 'rgba(30, 58, 95, 0.16)',
      bottomColor: 'rgba(30, 58, 95, 0)',
      dateRanges: ['1d|1', '1m|30', '3m|60', '12m|1D', '60m|1W', 'all|1M']
    });
    holder.appendChild(script);
    chartBox.appendChild(holder);
  }
})();
