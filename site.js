/* ═══════════════════════════════════════════════════════════════
   BEHIND THE NUMBERS — site behavior
   (dates, share buttons, comments, newsletter)
   You don't need to edit this file.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  // ── Today's date in the top bar ─────────────────────────────
  var dateEls = document.querySelectorAll('[data-today]');
  var today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  dateEls.forEach(function (el) { el.textContent = today; });

  // ── Toast helper ────────────────────────────────────────────
  var toast = document.createElement('div');
  toast.id = 'toast';
  document.body.appendChild(toast);
  var toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }

  // ── Share buttons ───────────────────────────────────────────
  // Buttons carry data-share="linkedin|x|whatsapp|copy".
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-share]');
    if (!btn) return;
    var url = window.location.href;
    var title = document.title;
    var kind = btn.getAttribute('data-share');
    var open = function (u) { window.open(u, '_blank', 'noopener,width=620,height=520'); };

    if (kind === 'linkedin') {
      open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url));
    } else if (kind === 'x') {
      open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(url));
    } else if (kind === 'whatsapp') {
      open('https://wa.me/?text=' + encodeURIComponent(title + ' — ' + url));
    } else if (kind === 'copy') {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { showToast('Link copied'); });
      } else {
        showToast('Copy this link: ' + url);
      }
    }
  });

  // ── Comments (stored in each reader's browser) ──────────────
  // For real shared comments visible to everyone, see the
  // Publishing Guide — it explains the free Giscus option.
  var form = document.getElementById('comment-form');
  var list = document.getElementById('comment-list');

  function initials(name) {
    return name.trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
  }

  function renderComment(c) {
    var div = document.createElement('div');
    div.className = 'comment';
    var av = document.createElement('div');
    av.className = 'op-avatar';
    av.textContent = initials(c.name || '?');
    var body = document.createElement('div');
    var who = document.createElement('div');
    who.className = 'who';
    who.textContent = c.name;
    var when = document.createElement('span');
    when.className = 'when';
    when.textContent = c.when;
    who.appendChild(when);
    var what = document.createElement('div');
    what.className = 'what';
    what.textContent = c.text;
    body.appendChild(who);
    body.appendChild(what);
    div.appendChild(av);
    div.appendChild(body);
    list.appendChild(div);
  }

  if (form && list) {
    var storeKey = 'btn-comments-' + (document.body.getAttribute('data-article-id') || 'page');
    var saved = [];
    try { saved = JSON.parse(localStorage.getItem(storeKey) || '[]'); } catch (err) { saved = []; }
    saved.forEach(renderComment);
    var countEl = document.getElementById('comment-count');
    function updateCount() {
      if (countEl) countEl.textContent = list.querySelectorAll('.comment').length;
    }
    updateCount();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('[name="name"]').value.trim();
      var text = form.querySelector('[name="text"]').value.trim();
      if (!name || !text) return;
      var c = {
        name: name,
        text: text,
        when: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      saved.push(c);
      try { localStorage.setItem(storeKey, JSON.stringify(saved)); } catch (err) {}
      renderComment(c);
      updateCount();
      form.reset();
      showToast('Comment posted');
    });
  }

  // ── Newsletter form ─────────────────────────────────────────
  var nl = document.getElementById('newsletter-form');
  if (nl) {
    nl.addEventListener('submit', function (e) {
      var action = nl.getAttribute('action') || '';
      if (action.indexOf('YOUR_FORM_ID') !== -1) {
        e.preventDefault();
        showToast('Almost there — connect your signup form to activate (free)');
      }
    });
  }

  // ── Auto-updating headlines ─────────────────────────────────
  // Pulls the day's top finance stories automatically so you never
  // have to edit them by hand. Uses Google News' free RSS feed via a
  // free RSS→JSON service. If anything fails (offline, preview, rate
  // limit), the hand-written headlines already in the HTML stay put.
  //
  // ✏️ TO CHANGE THE TOPIC: edit the search words in NEWS_QUERY below.
  var NEWS_QUERY = 'stock market OR markets OR finance OR economy OR Fed OR RBI';

  var headlinesList = document.querySelector('#headlines .headlines-list');
  if (headlinesList) {
    var rss = 'https://news.google.com/rss/search?q=' +
      encodeURIComponent(NEWS_QUERY + ' when:1d') +
      '&hl=en-US&gl=US&ceid=US:en';
    var api = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rss);

    function timeAgo(dateStr) {
      var t = new Date(dateStr).getTime();
      if (!t) return '';
      var mins = Math.round((Date.now() - t) / 60000);
      if (mins < 60) return mins <= 1 ? 'just now' : mins + ' min ago';
      var hrs = Math.round(mins / 60);
      if (hrs < 24) return hrs + 'h ago';
      return Math.round(hrs / 24) + 'd ago';
    }

    fetch(api)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || d.status !== 'ok' || !d.items || !d.items.length) return;
        var rows = d.items.slice(0, 8).map(function (item) {
          // Google News titles look like "Headline - Source"
          var title = item.title || '';
          var src = '';
          var dash = title.lastIndexOf(' - ');
          if (dash > 0) { src = title.slice(dash + 3); title = title.slice(0, dash); }
          var row = document.createElement('div');
          row.className = 'headline-row';
          var s = document.createElement('span');
          s.className = 'src';
          s.textContent = src || 'Top story';
          var hl = document.createElement('span');
          hl.className = 'hl';
          var a = document.createElement('a');
          a.href = item.link;
          a.target = '_blank';
          a.rel = 'noopener';
          a.textContent = title;
          hl.appendChild(a);
          var ago = document.createElement('span');
          ago.className = 'ago';
          ago.textContent = timeAgo(item.pubDate);
          row.appendChild(s);
          row.appendChild(hl);
          row.appendChild(ago);
          return row;
        });
        headlinesList.innerHTML = '';
        rows.forEach(function (row) { headlinesList.appendChild(row); });
        var moreEl = document.querySelector('#headlines .section-head .more');
        if (moreEl) moreEl.textContent = 'Live · updates automatically';
      })
      .catch(function () { /* keep the static fallback headlines */ });
  }

  // ── Visit counter ───────────────────────────────────────────
  // ✏️ TO SHOW REAL TOTAL VISITS ACROSS ALL VISITORS (free, 2 min):
  //   1. Make a free account at https://www.goatcounter.com
  //   2. It gives you a code (your subdomain), e.g. "behindthenumbers"
  //   3. Put that code between the quotes below, replacing the blank.
  // Until you do, the footer shows visits counted in each reader's own
  // browser, so the number is always real-looking and never stuck at 0.
  var GOATCOUNTER_CODE = "";  // ← e.g. "behindthenumbers"

  var counterWrap = document.getElementById('visit-counter');
  var counterNum = document.getElementById('visit-count');

  function fmt(n) {
    return Number(n).toLocaleString('en-US');
  }
  function showCount(n) {
    if (!counterWrap || !counterNum) return;
    counterNum.textContent = fmt(n);
    counterWrap.hidden = false;
  }

  // Local fallback: counts page views stored in this reader's browser.
  function localCount() {
    var key = 'btn-visits';
    var n = 0;
    try { n = parseInt(localStorage.getItem(key) || '0', 10) || 0; } catch (e) {}
    n += 1;
    try { localStorage.setItem(key, String(n)); } catch (e) {}
    return n;
  }

  if (counterWrap && counterNum) {
    if (GOATCOUNTER_CODE && GOATCOUNTER_CODE.indexOf('YOUR') === -1) {
      // Real shared counter via GoatCounter (records this visit + reads total).
      var base = 'https://' + GOATCOUNTER_CODE + '.goatcounter.com';
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://gc.zgo.at/count.js';
      s.setAttribute('data-goatcounter', base + '/count');
      document.body.appendChild(s);

      fetch(base + '/counter/' + encodeURIComponent(location.pathname) + '.json')
        .then(function (r) { return r.json(); })
        .then(function (d) {
          // d.count is total pageviews for this path; use site-wide total instead:
          return fetch(base + '/counter/TOTAL.json').then(function (r2) { return r2.json(); });
        })
        .then(function (d) {
          var c = (d && d.count) ? String(d.count).replace(/[^0-9]/g, '') : null;
          showCount(c || localCount());
        })
        .catch(function () { showCount(localCount()); });
    } else {
      showCount(localCount());
    }
  }
})();
