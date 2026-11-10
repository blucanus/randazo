/* GR 100.000 — pantalla de confirmación con entrada QR (demo) */
(function () {
  'use strict';

  var data = null;
  try { data = JSON.parse(sessionStorage.getItem('gr100k_entrada') || 'null'); } catch (err) { data = null; }
  if (!data) return; // sin datos: queda la entrada de ejemplo

  var fill = function (key, value) {
    document.querySelectorAll('[data-fill="' + key + '"]').forEach(function (el) { el.textContent = value; });
  };

  var acomp = ['Solo yo', '+1', '+2'][data.acompanantes] || 'Solo yo';
  var dni = String(data.dni || '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  fill('saludo', ', ' + data.nombre);
  fill('email', data.email);
  fill('nombre', data.nombre + ' ' + data.apellido);
  fill('dni', dni || '—');
  fill('acompanantes', acomp);
  fill('codigo', data.codigo);

  // QR con el código de la entrada
  if (typeof window.qrcode === 'function') {
    try {
      var qr = window.qrcode(0, 'M');
      qr.addData(data.codigo);
      qr.make();
      var box = document.getElementById('ticket-qr');
      box.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 0, scalable: true, title: 'Código QR de acceso ' + data.codigo });
      var path = box.querySelector('svg path');
      if (path) path.setAttribute('fill', '#2d2d2d');
    } catch (err) { /* deja el QR de ejemplo */ }
  }
})();
