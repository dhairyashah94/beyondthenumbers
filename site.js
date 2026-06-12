/* ═══════════════════════════════════════════════════════════════
   BEHIND THE NUMBERS — site behavior
   (dates, share buttons, live headlines, newsletter)
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
})();

/* ═══════════════════════════════════════════════════════════════
   Newsletter subscribe forms (Formspree)
   Any <form data-subscribe> is submitted in the background to its
   own action URL (a Formspree endpoint); on success the form is
   replaced with a thank-you note. Works on any host — Cloudflare
   Pages, GitHub Pages, Netlify — once the form's action points at a
   real Formspree form ID.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var forms = document.querySelectorAll('form[data-subscribe]');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var email = (form.querySelector('input[name="email"]') || {}).value || '';
      if (btn) { btn.disabled = true; btn.textContent = 'Subscribing…'; }

      var endpoint = form.getAttribute('action') || '';
      // If the form still has the placeholder ID, show a demo confirmation
      // instead of firing a real (failing) request.
      if (endpoint.indexOf('YOUR_FORM_ID') !== -1) {
        var demo = document.createElement('div');
        demo.className = 'form-success';
        demo.innerHTML = 'You\u2019re in. \u2713<small>Demo mode \u2014 connect a Formspree form ID to start collecting emails.</small>';
        form.parentNode.replaceChild(demo, form);
        return;
      }

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('bad status');
          var ok = document.createElement('div');
          ok.className = 'form-success';
          ok.innerHTML = 'You\u2019re in. \u2713<small>The next brief lands in your inbox before the bell \u2014 ' +
            email.replace(/[<>&]/g, '') + '</small>';
          form.parentNode.replaceChild(ok, form);
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = 'Subscribe'; }
          var note = form.querySelector('.form-error');
          if (!note) {
            note = document.createElement('p');
            note.className = 'form-error';
            note.style.cssText = 'font-family: var(--sans); font-size: 12.5px; margin-top: 8px; color: #E8A598; flex-basis: 100%;';
            form.appendChild(note);
          }
          note.textContent = 'That didn\u2019t go through \u2014 please try again, or subscribe via LinkedIn below.';
        });
    });
  });
})();
