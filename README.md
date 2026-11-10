# GR 100.000 · Grupo Randazzo

Landing de inscripción para la entrega del auto N.º 100.000 de Grupo Randazzo.
**Viernes 18.12.2026 · 20 HS · Calle 149 e/ 39 y 40.**

Sitio estático (HTML + CSS + JS, sin build) pensado para mostrar el diseño antes de
integrarlo en `eventos.hands.com.ar/e/randazo`.

## Páginas

| Ruta | Archivo | Qué es |
| --- | --- | --- |
| `/` (también `/e/randazo`) | `index.html` | Hero con el key visual del flyer + formulario de inscripción |
| `/gracias` | `gracias.html` | Confirmación con entrada personal y QR |

## Estado: demo

- El formulario valida los datos en el navegador y pasa a `/gracias` con una entrada de ejemplo
  (código y QR generados en el momento). **No guarda inscripciones ni envía emails.**
- Para producción: enviar los datos a la API de la plataforma de eventos (ver el `TODO` en `assets/app.js`).

## Assets

- `assets/img/*` — logos, key visual y grunge extraídos del flyer original con fondo transparente,
  más la textura foil generada. Para producción conviene reemplazar los logos por los originales en SVG.
- `assets/vendor/qrcode-generator-1.4.4.js` — [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT).
- Tipografía: [Archivo](https://fonts.google.com/specimen/Archivo) (Google Fonts), ejes de ancho 75–125.

## Desarrollo local

```bash
npx serve .
```

Deploy: Vercel (proyecto estático, sin framework). Cada push a `main` publica en producción.
