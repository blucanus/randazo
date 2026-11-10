/* GR 100.000 — formulario de inscripción (versión demo, sin backend) */
(function () {
  'use strict';

  var form = document.getElementById('form-inscripcion');
  if (!form) return;

  var alertBox = document.getElementById('form-alert');
  var hiddenAcomp = form.querySelector('input[name="acompanantes"]');
  var segButtons = form.querySelectorAll('.seg__btn');

  // Selector de acompañantes
  segButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      segButtons.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      hiddenAcomp.value = btn.getAttribute('data-value');
    });
  });

  var onlyDigits = function (v) { return (v || '').replace(/\D+/g, ''); };

  var rules = {
    nombre: function (v) { return v.trim().length >= 2; },
    apellido: function (v) { return v.trim().length >= 2; },
    dni: function (v) { var d = onlyDigits(v); return d.length >= 7 && d.length <= 8; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
    whatsapp: function (v) { return onlyDigits(v).length === 10; }
  };

  function setInvalid(name, invalid) {
    var wrap = form.querySelector('[data-field="' + name + '"]');
    var input = form.elements[name];
    if (!wrap || !input) return;
    wrap.classList.toggle('is-invalid', invalid);
    input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  }

  function validate() {
    var firstBad = null;
    Object.keys(rules).forEach(function (name) {
      var ok = rules[name](form.elements[name].value || '');
      setInvalid(name, !ok);
      if (!ok && !firstBad) firstBad = form.elements[name];
    });
    return firstBad;
  }

  // Revalida el campo mientras se corrige
  Object.keys(rules).forEach(function (name) {
    form.elements[name].addEventListener('input', function () {
      var wrap = form.querySelector('[data-field="' + name + '"]');
      if (wrap && wrap.classList.contains('is-invalid')) {
        setInvalid(name, !rules[name](this.value || ''));
      }
    });
  });

  function demoCode() {
    var n = Math.floor(Math.random() * 900000) + 100000;
    return 'GR-' + n;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = validate();
    if (firstBad) {
      alertBox.classList.add('is-visible');
      firstBad.focus();
      return;
    }
    alertBox.classList.remove('is-visible');

    var data = {
      nombre: form.elements.nombre.value.trim(),
      apellido: form.elements.apellido.value.trim(),
      dni: onlyDigits(form.elements.dni.value),
      email: form.elements.email.value.trim(),
      acompanantes: Number(hiddenAcomp.value || 0),
      codigo: demoCode()
    };

    // TODO producción: enviar `data` (+ whatsapp y novedades) a la API de eventos.hands.com.ar
    try { sessionStorage.setItem('gr100k_entrada', JSON.stringify(data)); } catch (err) { /* modo privado */ }
    window.location.href = '/gracias';
  });
})();
