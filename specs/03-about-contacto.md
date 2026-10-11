# SPEC 03 — Acerca de y Contacto

> **Estado:** approved
> **Depende de:** SPEC 01 (rutas, nav, estilos neón, `.field`/`.field-error`, patrón de persistencia en `lib/scores.ts`), SPEC 02 (`Reveal`, `.reveal`, link "Inicio" en el nav)
> **Fecha:** 2026-10-11
> **Objetivo:** Portar la pantalla `About` de `references/home-about/about.jsx` a la ruta `/about` (misión, 3 destacados y formulario de contacto simulado con guardado local) y sumar el link "Acerca de" al nav.

---

## Por qué existe este spec

SPEC 02 portó la Home y dejó fuera `about.jsx` a propósito (ver su "Fuera de alcance"). Este spec cierra esa carpeta de referencia: la pantalla **Acerca de** con su sección de **Contacto**, más el link del nav que SPEC 02 evitó agregar para no dejar un enlace roto.

El prototipo es React UMD con router por hash: se porta el comportamiento visible, no el código. Sigue sin haber backend, así que el formulario no envía nada; solo simula el envío y guarda una copia local.

---

## Alcance

**Dentro:**

- Pantalla `/about` con 3 bloques en este orden:
  1. **Acerca de**: kicker "▸ ACERCA DE", título "ACERCA DE ARCADE VAULT", párrafo de misión y 3 tarjetas destacadas (HEART "HECHO CON ❤️ PARA JUGADORES", BROWSER "JUEGOS EN HTML — CORREN EN CUALQUIER NAVEGADOR", PLANT "PROYECTO EN CONSTANTE CRECIMIENTO") con íconos pixel SVG.
  2. **Divisor decorativo**: barras degradadas + 24 píxeles parpadeantes, `aria-hidden`, con `.reveal`.
  3. **Contacto**: kicker "▸ CONTACTO", título "CONTÁCTANOS", subtítulo, 3 tips con LED (RESPUESTA EN 24-48H, SUGERENCIAS BIENVENIDAS, SIN SPAM, JAMÁS) y formulario NOMBRE / CORREO ELECTRÓNICO / MENSAJE, con `.reveal`.
- Formulario simulado:
  - Validación al enviar: nombre y mensaje no vacíos (tras `trim`), correo con formato válido.
  - Con errores: mensaje inline por campo (`.field-error`, `aria-invalid`), foco al primer campo inválido y animación `shake` del formulario.
  - Sin errores: guarda el mensaje en localStorage y muestra la terminal de éxito `VAULT-OS // TERMINAL` con el nombre en mayúsculas y botón ENVIAR OTRO MENSAJE (limpia el formulario).
- Persistencia local de los mensajes enviados (ver Modelo de datos).
- Nav (desktop + panel móvil): agregar "Acerca de" (`/about`) como último link de navegación, activo solo en `pathname === "/about"`.
- Animación de entrada por scroll reutilizando `Reveal` de SPEC 02.
- Copiar a `app/globals.css` la sección `ABOUT PAGE` de `references/home-about/styles.css` (ver plan, paso 1).
- Actualizar `CLAUDE.md` con la ruta y los componentes nuevos.

**Fuera de alcance (para otros specs):**

- Backend, envío real de correo, `mailto:` o cualquier llamada de red del formulario.
- Pantalla o vista para leer los mensajes guardados: se guardan, nadie los lee todavía.
- Link a "Acerca de" en el footer.
- Estilos `GAMEPAD` y `Theme variants` de `references/home-about/styles.css`.
- Metadatos SEO/Open Graph específicos de la página.
- Cambios a `references/home-about/arcade-vault-standalone.html` (bundle de referencia, no se porta).
- Anti-spam (captcha, rate limit) y límite de longitud del mensaje.

---

## Modelo de datos

Un mensaje enviado, persistido en localStorage. Vive en `lib/contact.ts`.

```ts
export type ContactMessage = {
  name: string;   // trim()
  email: string;  // trim()
  msg: string;    // trim()
  at: number;     // Date.now() al enviar
};

export const MESSAGES_KEY = "av_messages";
export const MAX_MESSAGES = 20;
```

Convenciones:

- Valor almacenado: JSON con un array de `ContactMessage`, el más reciente primero, recortado a `MAX_MESSAGES`.
- Misma estrategia de `lib/scores.ts`: localStorage con fallback en memoria si está bloqueado; lectura tolerante (JSON inválido o con forma incorrecta → `[]`).
- La clave sigue la convención existente `av_*` (`av_user`, `av_scores`).
- El formulario no lee `av_messages` para renderizar; el nombre de la terminal de éxito sale del estado del componente.
- No se guarda nada sensible fuera de lo que el usuario escribe en el formulario.

Tipos de contenido fijo, locales al componente que los usa (copy tal cual del prototipo):

```ts
type Accent = "cyan" | "magenta" | "green";
type Highlight = { icon: "HEART" | "BROWSER" | "PLANT"; text: string; accent: Accent };
```

---

## Plan de implementación

Antes del paso 1: leer en `node_modules/next/dist/docs/` (`01-app`) lo relativo a Server vs Client Components y `Link`, porque este Next.js tiene cambios incompatibles.

1. **Estilos.** Copiar a `app/globals.css`, desde `references/home-about/styles.css`, la sección `ABOUT PAGE` (`.about*`, `.highlight*`, `.about-divider`, `.div-*`, `.about-contact`, `.contact-*`, `.btn.press:active`, `.terminal-success`, `.term-*`, `@keyframes pxblink` y `@keyframes shake`). Comparar con `app/globals.css` antes de pegar: `.divider` y `@keyframes blink` ya existen, no duplicar. No copiar `GAMEPAD` ni `Theme variants`. Agregar `@media (prefers-reduced-motion: reduce)` que anule `shake`, `pxblink` y el `caret`. `npx eslint app components lib` y `npm run build` pasan.
2. **Persistencia.** Crear `lib/contact.ts` con `ContactMessage`, `MESSAGES_KEY`, `MAX_MESSAGES` y `addMessage(entry: Omit<ContactMessage, "at">)`. Reutilizar el acceso a localStorage con fallback en memoria de `lib/scores.ts` (exportar `readRaw`/`writeRaw` desde ahí en vez de duplicarlos). Sin cambios de comportamiento en `lib/scores.ts`.
3. **Piezas.** Crear `components/highlight-icon.tsx` (Server Component, SVG HEART/BROWSER/PLANT con `aria-hidden`) y `components/contact-form.tsx` (Client Component: estado del formulario, validación, `shake`, éxito con terminal, llama `addMessage`).
4. **Pantalla.** Crear `app/about/page.tsx` (Server Component, salvo `Reveal` y `ContactForm`) con los 3 bloques y el copy del prototipo. `/about` funciona; el link del nav todavía no existe.
5. **Nav.** En `components/nav.tsx` agregar "Acerca de" (`/about`) en desktop y panel móvil, activo solo en `/about`. `Link` de Next.js, igual que los demás.
6. **Documentación.** Actualizar `CLAUDE.md`: ruta `/about`, componentes nuevos (`contact-form`, `highlight-icon`), `lib/contact.ts` y clave `av_messages`; ajustar la nota de `references/home-about/` (Home y About ya portados).

---

## Criterios de aceptación

- [ ] `npx eslint app components lib`, `npx tsc --noEmit` y `npm run build` terminan sin errores.
- [ ] `/about` muestra los 3 bloques en el orden indicado, con el copy del prototipo.
- [ ] El nav muestra Inicio, Biblioteca, Salón de la Fama y Acerca de (y Iniciar Sesión/nombre), en desktop y en el panel móvil.
- [ ] "Acerca de" está activo solo en `/about`; Inicio y Biblioteca no lo están ahí.
- [ ] Enviar con nombre, correo o mensaje vacío (o solo espacios) muestra un error bajo cada campo inválido, no guarda nada y no muestra la terminal.
- [ ] Enviar con un correo sin formato válido (ej. `abc`, `a@b`) muestra el error en el campo correo y no guarda nada.
- [ ] Un envío inválido hace `shake` del formulario y mueve el foco al primer campo inválido; los campos inválidos tienen `aria-invalid="true"`.
- [ ] Un envío válido muestra la terminal `VAULT-OS // TERMINAL` con "GRACIAS, <NOMBRE EN MAYÚSCULAS>".
- [ ] Tras un envío válido, `localStorage["av_messages"]` contiene el mensaje con `name`, `email`, `msg` y `at`, sin espacios sobrantes.
- [ ] Tras 21 envíos válidos, `av_messages` contiene exactamente 20, el más reciente primero.
- [ ] ENVIAR OTRO MENSAJE vuelve al formulario con los tres campos vacíos y sin errores.
- [ ] Con localStorage bloqueado el envío sigue mostrando la terminal de éxito y no lanza errores en consola.
- [ ] La página no realiza ninguna petición de red al enviar el formulario.
- [ ] Con `prefers-reduced-motion`, el divisor, el `shake` y el caret no animan y las secciones aparecen sin transición.
- [ ] A 375 px: sin scroll horizontal; `highlight-row` en 1 columna y `contact-grid` en 1 columna.
- [ ] El divisor decorativo y los íconos pixel no reciben foco ni se anuncian (`aria-hidden`).
- [ ] No hay clases CSS de `GAMEPAD` ni `Theme variants` en `app/`.

---

## Decisiones tomadas y descartadas

- **Sí:** ruta `/about`, tal como la nombra SPEC 02 y el prototipo.
- **No:** `/acerca-de`. Era más consistente con `/biblioteca` y `/salon`, pero se prefirió mantener el nombre del prototipo y de SPEC 02.
- **Sí:** envío simulado con guardado en localStorage (`av_messages`). El usuario lo pidió así; deja un registro local sin backend.
- **No:** `mailto:`. Requiere una dirección real que hoy no existe.
- **No:** solo simulado sin persistir. Era más simple, pero se descartó por pedido explícito.
- **Sí:** array acotado a `MAX_MESSAGES = 20`. Evita crecimiento ilimitado de localStorage sin que nadie lo lea.
- **Sí:** reutilizar el acceso a localStorage con fallback de `lib/scores.ts` exportando `readRaw`/`writeRaw`. Evita duplicar lógica de persistencia.
- **No:** `useSyncExternalStore` para los mensajes. Ninguna UI los lee; un store reactivo sería código muerto.
- **Sí:** validación con errores por campo, formato de correo, foco al primer error y `aria-invalid`. El prototipo solo hacía `shake` sin decir qué fallaba; es una mejora de accesibilidad pedida.
- **Sí:** reutilizar `.field-error` y `.field input[aria-invalid]` de SPEC 01.
- **Sí:** link "Acerca de" solo en nav (desktop + panel móvil). Igual que el prototipo.
- **No:** link en el footer. Toca otro componente sin que se haya pedido.
- **Sí:** `Link` de Next.js en lugar de `navigate()` por hash.
- **Sí:** página como Server Component; solo `Reveal` y `ContactForm` son cliente. Respeta el modelo de caché de `cacheComponents`.
- **Sí:** copiar solo `ABOUT PAGE` del CSS. `GAMEPAD` y `Theme variants` pertenecen a otra funcionalidad del prototipo.
- **Sí:** respetar `prefers-reduced-motion`. El prototipo no lo hace.

---

## Riesgos identificados

| Riesgo | Mitigación |
| ------ | ---------- |
| Los mensajes se guardan pero nadie los lee: parece funcionalidad real | Aceptado explícitamente; documentado en Fuera de alcance. El texto "MENSAJE RECIBIDO" es copy del prototipo. |
| El copy dice "RESPUESTA EN 24-48H" y no hay quién responda | Aceptado como copy de marketing, igual que "12+ JUEGOS" en SPEC 02. |
| Conflicto de clases entre `ABOUT PAGE` y el CSS existente (`.divider`, `.tip`, `.field`, `.line`, `.dot`) | Comparar antes de pegar (paso 1); si hay colisión, mostrar ambas versiones y confirmar. |
| Exportar `readRaw`/`writeRaw` de `lib/scores.ts` amplía su API pública | Cambio mínimo y sin lógica nueva; validar que `lib/scores.ts` sigue sin cambios de comportamiento (paso 2). |
| El correo y el mensaje del usuario quedan en localStorage en claro | Acotado a 20 mensajes y solo en el navegador del propio usuario; no sale de él. |
| `references/home-about/` sigue sin versionar | Confirmar con el usuario si se commitea antes o junto con este spec. |

---

## Qué **no** está en este spec

- Envío real, backend o correo.
- Lectura/administración de los mensajes guardados.
- Link en el footer, SEO por página, anti-spam.
- Estilos de gamepad y variantes de tema.
- Tests automatizados.

Cada uno, si se hace, va en su propio spec.
