/* GR 100.000 — formulario de inscripción
 * Envía los datos a Hands Eventos (POST /api/register, proxiado por vercel.json a eventos.hands.com.ar).
 * Los campos extra que se agregan al evento en el panel (ej. restricción alimentaria) se dibujan solos.
 */
(function () {
  'use strict';

  var EVENT_SLUG = 'randazzo';
  var NATIVOS = ['dni', 'whatsapp']; // ya están dibujados en el HTML con su propio diseño

  var form = document.getElementById('form-inscripcion');
  if (!form) return;

  var alertBox = document.getElementById('form-alert');
  var extrasBox = document.getElementById('campos-extra');
  var submitBtn = form.querySelector('button[type="submit"]');
  var submitLabel = submitBtn ? submitBtn.innerHTML : '';

  var onlyDigits = function (v) { return (v || '').replace(/\D+/g, ''); };
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var rules = {
    nombre: function (v) { return v.trim().length >= 2; },
    apellido: function (v) { return v.trim().length >= 2; },
    dni: function (v) { var d = onlyDigits(v); return d.length >= 7 && d.length <= 8; },
    email: function (v) { return EMAIL_RE.test(v.trim()); },
    whatsapp: function (v) { return onlyDigits(v).length === 10; }
  };

  function setInvalid(name, invalid) {
    var wrap = form.querySelector('[data-field="' + name + '"]');
    var input = form.elements[name];
    if (!wrap || !input) return;
    wrap.classList.toggle('is-invalid', invalid);
    input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
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

  // ---- Campos extra del evento (panel de Hands Eventos) ----
  var extras = [];

  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text != null) n.textContent = text;
    return n;
  }
  var inputDe = function (c) { return document.getElementById('x-' + c.key); };

  function mensajeError(c) {
    if (c.type === 'select') return 'Elegí una opción.';
    if (c.type === 'checkbox') return 'Tenés que marcar esta opción.';
    if (c.type === 'email') return 'Ingresá un email válido.';
    if (c.type === 'number') return 'Ingresá solo números.';
    return 'Completá este campo.';
  }

  function renderCampo(c) {
    var id = 'x-' + c.key;
    var wrap = el('div', { 'class': 'field' + (c.type === 'checkbox' ? ' field--check' : ''), 'data-extra': c.key });
    var label = el('label', { 'class': 'field__label', 'for': id }, c.label);
    if (!c.required) label.appendChild(el('span', { 'class': 'field__opt' }, ' (opcional)'));
    var input;
    if (c.type === 'select') {
      input = el('select', { 'class': 'field__input', id: id, name: c.key });
      input.appendChild(el('option', { value: '' }, 'Elegí una opción'));
      (c.options || []).forEach(function (o) { input.appendChild(el('option', { value: o }, o)); });
    } else if (c.type === 'textarea') {
      input = el('textarea', { 'class': 'field__input', id: id, name: c.key, rows: '3' });
    } else if (c.type === 'checkbox') {
      input = el('input', { type: 'checkbox', id: id, name: c.key });
    } else {
      var tipos = { email: 'email', tel: 'tel', whatsapp: 'tel', date: 'date' };
      input = el('input', { 'class': 'field__input', id: id, name: c.key, type: tipos[c.type] || 'text' });
      if (c.type === 'number') input.setAttribute('inputmode', 'decimal');
    }
    var err = el('p', { 'class': 'field__error', id: id + '-err' }, mensajeError(c));
    input.setAttribute('aria-describedby', id + '-err');
    if (c.required) input.setAttribute('aria-required', 'true');
    if (c.type === 'checkbox') {
      var texto = el('div', { 'class': 'field__check-text' });
      texto.appendChild(label);
      texto.appendChild(err);
      wrap.appendChild(input);
      wrap.appendChild(texto);
    } else {
      wrap.appendChild(label);
      wrap.appendChild(input);
      wrap.appendChild(err);
    }
    input.addEventListener(c.type === 'select' || c.type === 'checkbox' ? 'change' : 'input', function () {
      if (wrap.classList.contains('is-invalid')) validarExtra(c);
    });
    extrasBox.appendChild(wrap);
  }

  function valorExtra(c) {
    var i = inputDe(c);
    if (!i) return c.type === 'checkbox' ? false : '';
    return c.type === 'checkbox' ? i.checked : String(i.value || '').trim();
  }

  function validarExtra(c) {
    var v = valorExtra(c), ok = true;
    if (c.type === 'checkbox') ok = !c.required || v === true;
    else if (v === '') ok = !c.required;
    else if (c.type === 'email') ok = EMAIL_RE.test(v);
    else if (c.type === 'number') ok = /^-?\d+([.,]\d+)?$/.test(v);
    var wrap = form.querySelector('[data-extra="' + c.key + '"]');
    if (wrap) wrap.classList.toggle('is-invalid', !ok);
    if (inputDe(c)) inputDe(c).setAttribute('aria-invalid', ok ? 'false' : 'true');
    return ok;
  }

  // Si esto falla, igual se puede enviar: la API avisa qué campo falta
  var cargaCampos = fetch('/api/events?slug=' + EVENT_SLUG, { headers: { Accept: 'application/json' } })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      extras = ((res && res.data && res.data.campos) || []).filter(function (c) { return NATIVOS.indexOf(c.key) === -1; });
      extras.forEach(renderCampo);
    })
    .catch(function () { extras = []; });

  // ---- Validación y envío ----
  function validate() {
    var firstBad = null;
    Object.keys(rules).forEach(function (name) {
      var ok = rules[name](form.elements[name].value || '');
      setInvalid(name, !ok);
      if (!ok && !firstBad) firstBad = form.elements[name];
    });
    extras.forEach(function (c) {
      if (!validarExtra(c) && !firstBad) firstBad = inputDe(c);
    });
    return firstBad;
  }

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
    if (/ya está inscripto/i.test(msg)) return 'Ese email ya está anotado. Revisá tu casilla (y spam): te escribimos ahí.';
    if (/cupo completo/i.test(msg)) return 'Se completó el cupo del evento. ¡Gracias por tu interés!';
    if (/no encontrado|cerrado/i.test(msg)) return 'La inscripción no está disponible en este momento.';
    return msg || 'No pudimos registrar tu inscripción. Probá de nuevo en unos minutos.';
  }

  function enviar() {
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
      dni: onlyDigits(form.elements.dni.value),
      whatsapp: '+549' + onlyDigits(form.elements.whatsapp.value)
    };
    extras.forEach(function (c) {
      var v = valorExtra(c);
      payload[c.key] = c.type === 'number' && v !== '' ? v.replace(',', '.') : v;
    });

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
          window.location.href = '/e/randazzo/gracias';
          return;
        }
        setSending(false);
        showAlert(friendly(res && res.message));
      })
      .catch(function () {
        setSending(false);
        showAlert('No pudimos conectarnos. Revisá tu conexión y probá de nuevo.');
      });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    cargaCampos.then(enviar);
  });
})();
