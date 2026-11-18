/* GR 100.000 — pantalla de confirmación (la entrada con QR la manda Hands Eventos por email) */
(function () {
  'use strict';

  var data = null;
  try { data = JSON.parse(sessionStorage.getItem('gr100k_entrada') || 'null'); } catch (err) { data = null; }
  if (!data) return; // sin datos: queda el texto genérico

  var fill = function (key, value) {
    document.querySelectorAll('[data-fill="' + key + '"]').forEach(function (el) { el.textContent = value; });
  };

  var dni = String(data.dni || '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  fill('saludo', ', ' + data.nombre);
  fill('email', data.email);
  fill('nombre', data.nombre + ' ' + data.apellido);
  fill('dni', dni || '—');
})();
