/* GR 100.000 — formulario de inscripción
 * Envía los datos a Hands Eventos (POST /api/register, proxiado por vercel.json a eventos.hands.com.ar).
 * La plataforma guarda la inscripción y manda la entrada con QR por email.
 */
(function () {
  'use strict';

  var EVENT_SLUG = 'randazzo';

  var form = document.getElementById('form-inscripcion');
  if (!form) return;

  var alertBox = document.getElementById('form-alert');
  var submitBtn = form.querySelector('button[type="submit"]');
  var submitLabel = submitBtn ? submitBtn.innerHTML : '';

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

  function showAlert(msg) {
    alertBox.textContent = msg;
    alertBox.classList.add('is-visible');
  }

  function setSending(sending) {
    if (!submitBtn) return;
    submitBtn.disabled = sending;
    submitBtn.setAttribute('aria-busy', sending ? 'true' : 'false');
    submitBtn.innerHTML = sending ? 'Enviando…' : submitLabel;
  }

  // Mensajes de la API de Hands Eventos, en el tono de la landing
  function friendly(msg) {
    if (/ya está inscripto/i.test(msg)) return 'Ese email ya está anotado. Revisá tu casilla (y spam): ahí está tu entrada con QR.';
    if (/cupo completo/i.test(msg)) return 'Se completó el cupo del evento. ¡Gracias por tu interés!';
    if (/no encontrado|cerrado/i.test(msg)) return 'La inscripción no está disponible en este momento.';
    return msg || 'No pudimos registrar tu inscripción. Probá de nuevo en unos minutos.';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = validate();
    if (firstBad) {
      showAlert('Revisá los campos marcados.');
      firstBad.focus();
      return;
    }
    alertBox.classList.remove('is-visible');

    var payload = {
      slug: EVENT_SLUG,
      nombre: form.elements.nombre.value.trim(),
      apellido: form.elements.apellido.value.trim(),
      email: form.elements.email.value.trim().toLowerCase(),
      // Claves = campos extra del evento en Hands Eventos ("DNI" y "WhatsApp")
      dni: onlyDigits(form.elements.dni.value),
      whatsapp: '+549' + onlyDigits(form.elements.whatsapp.value)
    };

    setSending(true);
    fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (r) {
        return r.json().catch(function () { return { ok: false }; });
      })
      .then(function (res) {
        if (res && res.ok) {
          // Evento pago (no aplica hoy): la plataforma devuelve el link de Mercado Pago
          if (res.pago && res.url) { window.location.href = res.url; return; }
          try {
            sessionStorage.setItem('gr100k_entrada', JSON.stringify({
              nombre: payload.nombre, apellido: payload.apellido, email: payload.email, dni: payload.dni
            }));
          } catch (err) { /* modo privado */ }
          window.location.href = '/gracias';
          return;
        }
        setSending(false);
        showAlert(friendly(res && res.message));
      })
      .catch(function () {
        setSending(false);
        showAlert('No pudimos conectarnos. Revisá tu conexión y probá de nuevo.');
      });
  });
})();
