/* =========================================================
   rsvp.js · ส่งข้อมูลฟอร์มไปยัง Google Apps Script
   ========================================================= */

/* ── 1) สร้าง Google Sheet ใหม่ คอลัมน์: timestamp, name, email, phone, attending, guests, diet, message
   ── 2) Extensions → Apps Script → วางโค้ดจาก README.md
   ── 3) Deploy → New deployment → Web app → "Anyone"
   ── 4) คัดลอก URL ที่ลงท้ายด้วย /exec แล้ววางด้านล่างนี้ */

const RSVP_ENDPOINT = ''; // ← วาง URL ที่นี่

(function () {
  'use strict';

  const form = document.getElementById('rsvpForm');
  if (!form) return;

  const submitBtn = document.getElementById('rsvpSubmit');
  const status = document.getElementById('formStatus');

  function t(key) {
    const lang = localStorage.getItem('wedding.lang') || 'th';
    return (window.I18N && window.I18N[lang] && window.I18N[lang][key]) || key;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitBtn.disabled = true;
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = t('rsvp.f.sending');

    const data = Object.fromEntries(new FormData(form));
    data.timestamp = new Date().toISOString();

    try {
      if (!RSVP_ENDPOINT) {
        // Demo mode — no endpoint configured. Log instead of submitting.
        console.log('[RSVP demo mode] data =', data);
        await new Promise((r) => setTimeout(r, 600));
      } else {
        // Note: using `text/plain` keeps the request "simple" so it doesn't
        // trigger a CORS preflight against Apps Script. Apps Script parses
        // JSON body from e.postData.contents.
        const res = await fetch(RSVP_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(data)
        });
        // With no-cors we can't read the response, but if fetch didn't throw,
        // the request was delivered.
        void res;
      }

      status.className = 'form-status success';
      status.textContent = t('rsvp.f.success');
      form.reset();
    } catch (err) {
      console.error(err);
      status.className = 'form-status error';
      status.textContent = t('rsvp.f.error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
})();
