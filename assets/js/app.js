/* ==========================================================================
   ほどく経営研究所 — app.js
   1. 目次（進捗の糸・現在地）
   2. お問い合わせフォーム
   3. 線が描かれる演出（支援内容の図・フッター）
   外部ライブラリなし。innerHTML / eval 等は一切使いません（Trusted Types 準拠）。
   ========================================================================== */
(() => {
  'use strict';

  const doc = document, root = doc.documentElement;
  root.classList.add('js');
  const $ = (sel, ctx) => (ctx || doc).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || doc).querySelectorAll(sel));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mqMobile = window.matchMedia('(max-width: 860px)');
  const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  const easeInOut = p => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const easeOut = p => 1 - Math.pow(1 - p, 3);

  /* ========================================================================
     1. 目次 — 進捗の糸と現在地、屋号の省略表示
     ====================================================================== */
  function initToc() {
    const toc = $('.toc'), hero = $('#hero');
    const links = $$('.toc__list a');
    const secs = links.map(a => doc.getElementById(a.getAttribute('href').slice(1)));
    const list = $('.toc__list');
    let current = -1, ticking = false;

    function update() {
      ticking = false;
      const max = root.scrollHeight - window.innerHeight;
      if (toc) toc.style.setProperty('--p', (max > 0 ? clamp01(window.scrollY / max) : 0).toFixed(4));
      const heroEnd = hero ? hero.offsetTop + hero.offsetHeight - window.innerHeight * 0.9 : 0;
      root.classList.toggle('is-scrolled', window.scrollY > Math.max(40, heroEnd));

      let active = -1; const line = window.innerHeight * 0.4;
      secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= line) active = i; });
      if (active !== current) {
        current = active;
        links.forEach((a, i) => { if (i === active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
        if (active > -1 && mqMobile.matches && list) {
          const li = links[active].parentElement;
          list.scrollTo({ left: li.offsetLeft - list.clientWidth / 2 + li.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
        }
      }
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ========================================================================
     2. お問い合わせフォーム
     送信方式は <form> の data-transport で切り替え：
       "formsubmit" … FormSubmit（https://formsubmit.co）経由でメール受信
       "netlify"    … Netlify Forms（ホスティング元で受信。第三者を経由しない）
     ====================================================================== */
  function initForm() {
    const form = $('#contactForm');
    const ml = $('#mailLink');
    const TO = ml ? ml.dataset.u + '@' + ml.dataset.d : '';
    if (ml && TO.length > 3) { ml.href = 'mailto:' + TO; ml.textContent = TO; }   // 収集ボット対策：実行時に組み立てる
    if (!form) return;

    const status = $('#formStatus'), btn = $('#submitBtn'), alt = $('#formAlt');
    const T0 = performance.now();
    const LIMITS = { name: 80, org: 120, email: 254, tel: 30, subject: 60, message: 4000 };
    const REQUIRED = ['name', 'email', 'subject', 'message'];
    let sending = false, lockedUntil = 0;

    // 制御文字を除去（メールヘッダーへの改行混入＝ヘッダーインジェクションを防ぐ）。本文だけ改行とタブを残す
    const clean = (v, multi) => {
      let s = String(v == null ? '' : v).normalize('NFC');
      s = multi ? s.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B-\u001F\u007F\u2028\u2029]/g, '')
                : s.replace(/[\u0000-\u001F\u007F\u2028\u2029]+/g, ' ');
      return s.trim();
    };
    const val = n => { const el = form.elements[n]; return el ? clean(el.value, n === 'message').slice(0, LIMITS[n] || 200) : ''; };
    const say = (msg, isError) => { status.textContent = msg; status.classList.toggle('is-error', !!isError); };
    const mark = (el, bad) => { if (bad) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); };

    function validate() {
      let first = null;
      REQUIRED.forEach(n => {
        const el = form.elements[n];
        let bad = !val(n);
        if (n === 'email' && !bad) bad = !/^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/.test(val(n));
        mark(el, bad);
        if (bad && !first) first = el;
      });
      const tel = form.elements.tel;
      const telBad = !!val('tel') && !/^[0-9+\-() 　]{6,30}$/.test(val('tel'));
      mark(tel, telBad); if (telBad && !first) first = tel;
      if (first) first.focus();
      return !first;
    }
    form.addEventListener('input', e => { if (e.target && e.target.removeAttribute) e.target.removeAttribute('aria-invalid'); });

    const subjectLine = () => '【ほどく経営研究所】' + val('subject') + ' — ' + val('name') + ' 様';
    const bodyText = () => [
      'お名前：' + val('name'),
      '会社名：' + (val('org') || '—'),
      'メール：' + val('email'),
      '電話番号：' + (val('tel') || '—'),
      '件名：' + val('subject'),
      '',
      '── お問い合わせ内容 ──',
      val('message'),
      '',
      '（ほどく経営研究所 Webサイト お問い合わせフォームより）'
    ].join('\n');

    function showFallbacks() {
      const su = encodeURIComponent(subjectLine()), bo = encodeURIComponent(bodyText()), to = encodeURIComponent(TO);
      $('#altMail').href = 'mailto:' + TO + '?subject=' + su + '&body=' + bo;
      $('#altGmail').href = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + to + '&su=' + su + '&body=' + bo;
      $('#altOutlook').href = 'https://outlook.office.com/mail/deeplink/compose?to=' + to + '&subject=' + su + '&body=' + bo;
      alt.hidden = false;
    }
    $('#altCopy').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('宛先：' + TO + '\n件名：' + subjectLine() + '\n\n' + bodyText());
        say('宛先・件名・本文をコピーしました。お使いのメールに貼り付けて送信してください。');
      } catch (e) { say('コピーできませんでした。お手数ですが、メールに直接ご記入ください。', true); }
    });

    async function post(url, init) {
      const ac = new AbortController(), timer = setTimeout(() => ac.abort(), 15000);
      try {
        return await fetch(url, Object.assign({
          method: 'POST', mode: 'cors', credentials: 'omit', cache: 'no-store',
          referrerPolicy: 'no-referrer', signal: ac.signal
        }, init));
      } finally { clearTimeout(timer); }
    }

    async function sendFormSubmit() {
      const id = (form.dataset.formsubmitId || '').trim();
      const target = /^[A-Za-z0-9]{16,64}$/.test(id) ? id : TO;
      const res = await post('https://formsubmit.co/ajax/' + target, {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'お名前': val('name'), '会社名': val('org') || '—', 'メール': val('email'), '電話番号': val('tel') || '—',
          '件名': val('subject'), 'お問い合わせ内容': val('message'),
          _subject: subjectLine(), _replyto: val('email'), _template: 'table', _captcha: 'false', _honey: ''
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) === 'false') throw new Error('formsubmit');
    }

    async function sendNetlify() {
      const body = new URLSearchParams();
      body.set('form-name', form.getAttribute('name') || 'contact');
      body.set('bot-field', '');
      ['name', 'org', 'email', 'tel', 'subject', 'message'].forEach(n => body.set(n, val(n)));
      const res = await post('/', { mode: 'same-origin', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
      if (!res.ok) throw new Error('netlify');
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (sending) return;
      const now = performance.now();
      if (form.elements['bot-field'] && form.elements['bot-field'].value) return;                 // ボット（隠し欄に入力）
      if (now - T0 < 3000) { say('入力内容をご確認のうえ、もう一度お試しください。'); return; }     // ボット（速すぎる送信）
      if (now < lockedUntil) { say('送信しました。続けて送る場合は、少し時間をおいてください。'); return; }
      if (!validate()) { say('未入力、または形式の異なる項目があります。印のついた欄をご確認ください。', true); return; }

      sending = true; btn.disabled = true; say('送信しています…');
      try {
        if (form.dataset.transport === 'netlify') await sendNetlify(); else await sendFormSubmit();
        say('送信しました。原則3営業日以内にご返信いたします。');
        alt.hidden = true; form.reset(); lockedUntil = performance.now() + 30000;
      } catch (err) {
        say('フォームから送信できませんでした。下のいずれかの方法でお送りください。', true);
        showFallbacks();
      } finally { sending = false; btn.disabled = false; }
    });
  }

  /* 支援内容の三つの糸と、フッターの線は、見えたときに一度だけ描かれる */
  function initReveal() {
    const els = $$('.steps, .footer__line');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.25 });
    els.forEach(el => io.observe(el));
  }

  const boot = () => { initToc(); initForm(); initReveal(); };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
