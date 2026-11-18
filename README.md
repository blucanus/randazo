# GR 100.000 · Grupo Randazzo

Landing de inscripción para la entrega del auto N.º 100.000 de Grupo Randazzo.
**Viernes 18.12.2026 · 20 HS · Calle 149 e/ 39 y 40.**

Sitio estático (HTML + CSS + JS, sin build). Las inscripciones se guardan en **Hands Eventos**
(evento `randazzo` de `eventos.hands.com.ar`), que es el que genera y manda la entrada con QR.

## Páginas

| Ruta | Archivo | Qué es |
| --- | --- | --- |
| `/` (también `/e/randazo`) | `index.html` | Hero con el key visual del flyer + formulario de inscripción |
| `/gracias` | `gracias.html` | Confirmación: avisa que la entrada con QR llegó por email |

## Inscripción

- `assets/app.js` valida y hace `POST /api/register` con `{slug: "randazzo", nombre, apellido, email, dni, whatsapp}`.
- `vercel.json` reescribe `/api/register` → `https://eventos.hands.com.ar/api/register` (proxy: mismo origen, sin CORS).
- `dni` y `whatsapp` solo se guardan si el evento tiene esos **campos extra** creados en el panel
  (etiquetas "DNI" y "WhatsApp" → claves `dni` y `whatsapp`). WhatsApp se envía como `+549` + 10 dígitos.
- Hands Eventos responde `{ok:true}` y manda el mail con el PDF + QR. Errores (email repetido, cupo, evento cerrado)
  se muestran en el formulario.

## Assets

- `assets/img/*` — logos, key visual y grunge extraídos del flyer original con fondo transparente,
  más la textura foil generada. Para producción conviene reemplazar los logos por los originales en SVG.
- Tipografía: [Archivo](https://fonts.google.com/specimen/Archivo) (Google Fonts), ejes de ancho 75–125.

## Desarrollo local

```bash
npx serve .
```

Deploy: Vercel (proyecto estático, sin framework). Cada push a `main` publica en producción.
