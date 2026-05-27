/* =========================================================
   qr.js · render QR live + download PNG/SVG
   ใช้ library qrcode (https://github.com/soldair/node-qrcode)
   ========================================================= */

(function () {
  'use strict';

  if (typeof QRCode === 'undefined') {
    console.error('QRCode library not loaded');
    return;
  }

  const input    = document.getElementById('qrUrl');
  const plainEl  = document.getElementById('qrPlain');
  const cardEl   = document.getElementById('qrCardScan');
  const urlLabel = document.getElementById('qrUrlLabel');
  const dlPng    = document.getElementById('dlPng');
  const dlSvg    = document.getElementById('dlSvg');
  const printBtn = document.getElementById('printBtn');

  const baseOpts = {
    errorCorrectionLevel: 'M',
    margin: 2,
    color: { dark: '#1A1A1A', light: '#FFFFFF' }
  };

  function getUrl() {
    return (input.value || '').trim() || 'https://example.com';
  }

  /* render <canvas> into a target element (clear children first) */
  function renderCanvas(target, url, size) {
    target.innerHTML = '';
    const canvas = document.createElement('canvas');
    target.appendChild(canvas);
    QRCode.toCanvas(canvas, url, { ...baseOpts, width: size }, (err) => {
      if (err) console.error(err);
    });
  }

  function render() {
    const url = getUrl();
    urlLabel.textContent = url;
    renderCanvas(plainEl, url, 560);
    renderCanvas(cardEl, url, 400);
  }

  /* trigger download for a Blob */
  function download(filename, blob) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 100);
  }

  /* sanitize URL for filename */
  function filenameFromUrl(url, ext) {
    const clean = url
      .replace(/^https?:\/\//, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'qr';
    return `wedding-qr-${clean}.${ext}`;
  }

  dlPng.addEventListener('click', () => {
    const url = getUrl();
    QRCode.toDataURL(url, { ...baseOpts, width: 1024 }, (err, dataUrl) => {
      if (err) { console.error(err); return; }
      fetch(dataUrl)
        .then((r) => r.blob())
        .then((blob) => download(filenameFromUrl(url, 'png'), blob));
    });
  });

  dlSvg.addEventListener('click', () => {
    const url = getUrl();
    QRCode.toString(url, { ...baseOpts, type: 'svg', width: 1024 }, (err, svgStr) => {
      if (err) { console.error(err); return; }
      const blob = new Blob([svgStr], { type: 'image/svg+xml' });
      download(filenameFromUrl(url, 'svg'), blob);
    });
  });

  printBtn.addEventListener('click', () => window.print());

  /* re-render as the user types, debounced */
  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(render, 200);
  });

  document.addEventListener('DOMContentLoaded', render);
  // also render immediately in case DOMContentLoaded already fired
  if (document.readyState !== 'loading') render();
})();
