# SPEC 02 — Home (landing) de Arcade Vault

> **Estado:** approved
> **Depende de:** SPEC 01 (rutas, `lib/games.ts`, nav, estilos neón en `app/globals.css`)
> **Fecha:** 2026-10-11
> **Objetivo:** Portar la landing `Home` de `references/home-about/` a la ruta `/`, mover la Biblioteca a `/biblioteca` y sumar el link "Inicio" al nav.

---

## Por qué existe este spec

`references/home-about/` contiene el prototipo de dos pantallas nuevas: **Home** (`home.jsx`) y **Acerca de** (`about.jsx`), más una versión actualizada del nav (`nav.jsx`) y de los estilos (`styles.css`). Este spec cubre todo lo de esa carpeta **excepto** Acerca de / Contacto, que va en su propio spec.

Hoy `/` es la Biblioteca. El prototipo las separa en dos pantallas (`home` y `biblioteca`), así que la Biblioteca se mueve a `/biblioteca` y se arreglan todos los enlaces que apuntaban a `/` esperando la biblioteca.

El prototipo es React UMD con router por hash (igual que en SPEC 01): se porta el comportamiento visible, no el código.

---

## Alcance

**Dentro:**

- Home en `/` con 7 bloques, en este orden:
  1. **Hero**: eyebrow "INSERTA UNA MONEDA_", título de 3 líneas, subtítulo, CTAs EXPLORAR JUEGOS (`/biblioteca`) y CREAR CUENTA (`/auth`), indicador DESLIZA y 8 siluetas pixel flotantes decorativas.
  2. **// 01 ¿POR QUÉ ARCADE VAULT?**: 4 tarjetas de características con ícono pixel (GAMEPAD, FREE, TROPHY, ROCKET).
  3. **// 02 JUEGOS DISPONIBLES AHORA**: riel con los 6 primeros de `GAMES` (`mini-card` → `/juegos/[id]`) y botón VER TODOS LOS JUEGOS → `/biblioteca`.
  4. **Estadísticas**: 3 bloques ("12+ JUEGOS", "MILES DE PARTIDAS", "GLOBAL RANKING").
  5. **// 03 ACTIVIDAD EN VIVO**: tarjeta ÚLTIMAS PUNTUACIONES (7 filas) y tarjeta TOP JUGADORES · HOY (5 filas, link VER SALÓN → `/salon`).
  6. **// 04 PRECIOS**: tarjeta plan único "$0 / SIEMPRE" con botón EMPEZAR GRATIS → `/auth` y 3 preguntas frecuentes.
  7. **CTA final**: "¿LISTO PARA JUGAR?" con botón INSERTAR MONEDA → `/biblioteca`.
- Animación de entrada por scroll (`.reveal` → `.in` con `IntersectionObserver`).
- Biblioteca movida de `/` a `/biblioteca` (misma pantalla de SPEC 01, sin cambios funcionales).
- Nav (desktop + panel móvil): agregar "Inicio" (`/`) como primer link; "Biblioteca" pasa a `/biblioteca`; logo apunta a `/`.
- Actualizar enlaces internos que apuntaban a la Biblioteca en `/`.
- Copiar a `app/globals.css` las clases faltantes del prototipo para Home (ver plan, paso 1).

**Fuera de alcance (para otros specs):**

- Pantalla **Acerca de** y formulario de **Contacto** (`about.jsx`, `/about`, estilos `ABOUT PAGE`). El link "Acerca de" del nav del prototipo **no** se agrega todavía.
- Estilos `GAMEPAD` y `Theme variants` de `references/home-about/styles.css` (no los usa Home ni el nav).
- Datos reales de actividad/top: "Últimas puntuaciones" y "Top jugadores" son texto fijo.
- Créditos reales (el "CRÉDITOS · 03" sigue fijo).
- Backend, newsletter, formularios o cualquier envío de datos.
- Pricing real: la tarjeta de precios es copy de marketing, sin lógica de pagos.
- Cambios a `references/home-about/arcade-vault-standalone.html` (bundle de referencia, no se porta).

---

## Modelo de datos

Este spec no agrega estructuras de datos persistentes ni toca `lib/games.ts` ni `lib/scores.ts`; reutiliza `GAMES` de SPEC 01.

Contenido fijo de la Home, tipado y local al componente que lo usa (copy tal cual del prototipo):

```ts
type Accent = "cyan" | "yellow" | "magenta" | "green";

type Feature = { icon: "GAMEPAD" | "FREE" | "TROPHY" | "ROCKET"; title: string; desc: string; accent: Accent };
type Stat = { n: string; u: string; s: string };
type RecentScore = { player: string; game: string; score: number; when: string; accent: Accent };
type TopPlayer = { rank: number; player: string; score: number };
type Faq = { q: string; a: string };
```

Convenciones:

- Números con `toLocaleString("es-ES")`.
- `RecentScore.game` es texto libre del prototipo (ej. "Caída", "Bloque Buster"); no se enlaza con `Game.id`.
- Riel de juegos: `GAMES.slice(0, 6)`.
- Ancho de barra del top: `100 - índice * 16` %.

---

## Plan de implementación

Antes del paso 1: leer en `node_modules/next/dist/docs/` (`01-app`) lo relativo a `cacheComponents`, Server vs Client Components y `Link`, porque este Next.js tiene cambios incompatibles.

1. **Estilos.** Copiar a `app/globals.css`, desde `references/home-about/styles.css`: sección `HOME PAGE` (incluye `.reveal`/`.reveal.in`), `ACTIVITY (leaderboard + ticker)` y `PRICING`. No copiar `ABOUT PAGE`, `GAMEPAD` ni `Theme variants`. Comparar con `app/globals.css` antes de pegar para no duplicar reglas ni pisar las de SPEC 01. Agregar `@media (prefers-reduced-motion: reduce)` para anular la animación de `.reveal`, flotado de siluetas y `pulse`/`blink` nuevos si corresponde. `npx eslint app components lib` y `npm run build` pasan.
2. **Mover Biblioteca.** Crear `app/biblioteca/page.tsx` con el contenido actual de `app/page.tsx` (hero `av-hero` + `<Library />`). Todavía no tocar `app/page.tsx`. `/biblioteca` funciona.
3. **Enlaces y nav.** Cambiar `href="/"` → `href="/biblioteca"` donde significa "volver a la biblioteca": `app/juegos/[id]/page.tsx` (VOLVER AL VAULT), `app/juegos/[id]/not-found.tsx`, `components/hall-of-fame.tsx`, `components/game-player.tsx`. En `components/nav.tsx`: agregar "Inicio" (`/`, activo solo en `pathname === "/"`), "Biblioteca" a `/biblioteca` (activo en `/biblioteca` y `/juegos*`), logo a `/`, en desktop y panel móvil. `router.push("/")` de `components/auth-form.tsx` queda como está (Home).
4. **Piezas de Home.** Crear componentes: `components/reveal.tsx` (Client; observa `.reveal` y agrega `.in`, desconecta al desmontar), `components/home-silhouettes.tsx` (SVG decorativos, `aria-hidden`, Server Component), `components/feature-icon.tsx` (Server Component), `components/mini-card.tsx` (`Link` a `/juegos/[id]`, usa `.cover-bg` + `game.cover`).
5. **Home.** Reemplazar `app/page.tsx` por la Home: 7 bloques con los datos fijos y `GAMES`. Server Component salvo `Reveal`. Todos los botones del prototipo pasan a `Link` (con clases `btn`). `npm run build` pasa.
6. **Documentación.** Actualizar `CLAUDE.md`: rutas (`/` home, `/biblioteca`), componentes nuevos y nota de que `references/home-about/` es la referencia de Home/Acerca de.

---

## Criterios de aceptación

- [ ] `npx eslint app components lib`, `npx tsc --noEmit` y `npm run build` terminan sin errores.
- [ ] `/` muestra los 7 bloques en el orden indicado, con el copy del prototipo.
- [ ] EXPLORAR JUEGOS, VER TODOS LOS JUEGOS e INSERTAR MONEDA llevan a `/biblioteca`.
- [ ] CREAR CUENTA y EMPEZAR GRATIS llevan a `/auth`.
- [ ] VER SALÓN lleva a `/salon`.
- [ ] El riel muestra 6 mini-tarjetas y cada una navega a `/juegos/<id>` del juego correspondiente.
- [ ] `/biblioteca` se comporta igual que la antigua `/` (búsqueda, chips, "NO HAY RESULTADOS").
- [ ] "VOLVER AL VAULT" en detalle, 404 de juego, salón y reproductor lleva a `/biblioteca`.
- [ ] El nav muestra Inicio, Biblioteca, Salón de la Fama (y Iniciar Sesión/nombre); no muestra "Acerca de".
- [ ] "Inicio" está activo solo en `/`; "Biblioteca" está activo en `/biblioteca` y `/juegos/**`.
- [ ] El logo lleva a `/`.
- [ ] En `/` las secciones aparecen con animación al hacer scroll y con `prefers-reduced-motion` aparecen sin animar.
- [ ] Con JavaScript lento o `Reveal` sin hidratar, el contenido no queda invisible de forma permanente (fallback documentado en el paso 1 o en `Reveal`).
- [ ] A 375 px: sin scroll horizontal; `feature-grid` en 1 columna, riel en 2, estadísticas apiladas, actividad y precios en 1 columna.
- [ ] Login válido sigue redirigiendo a `/` (Home).
- [ ] Las siluetas decorativas no reciben foco ni se anuncian (`aria-hidden`).
- [ ] No hay clases CSS de `ABOUT PAGE` ni `/about` en `app/`.

---

## Decisiones tomadas y descartadas

- **Sí:** Home en `/`, Biblioteca en `/biblioteca`. Coincide con las rutas separadas del prototipo y mantiene `/` como landing.
- **No:** dejar la Biblioteca en `/` y la Home en otra ruta. La landing perdería su lugar natural.
- **Sí:** no agregar el link "Acerca de" hasta el spec de About. Evita un enlace roto.
- **Sí:** "Últimas puntuaciones" y "Top jugadores · hoy" como arrays fijos del prototipo. Es copy/maqueta, no un dato real.
- **No:** derivarlos de `lib/scores`. Agregaría lógica y nombres distintos a los del diseño sin pedirlo.
- **Sí:** copy de marketing tal cual del prototipo ("12+ JUEGOS", "Nuevos juegos cada mes"), aunque hoy `GAMES` tenga 8. Fidelidad visual; se ajusta cuando cambie el catálogo.
- **Sí:** `Link` de Next.js en lugar de `navigate()` por hash.
- **Sí:** Home como Server Component; solo `Reveal` es cliente. Respeta el modelo de caché de `cacheComponents`.
- **Sí:** copiar solo las secciones de CSS que usa Home. `GAMEPAD` y `Theme variants` pertenecen a otra funcionalidad del prototipo.
- **Sí:** el login sigue redirigiendo a `/` (Home). Es el comportamiento de SPEC 01 y no se reabre.
- **Sí:** respetar `prefers-reduced-motion`. El prototipo no lo hace; es una mejora de accesibilidad de bajo costo.

---

## Riesgos identificados

| Riesgo | Mitigación |
| ------ | ---------- |
| Enlaces a `/` que significaban "biblioteca" quedan sin migrar | Paso 3 enumera los 4 archivos; verificar con `grep -rn 'href="/"' app components`. |
| `.reveal` deja secciones invisibles si el observer no corre (sin JS, o error de hidratación) | Aplicar el estado oculto solo cuando `Reveal` ya montó (clase en `<html>`/contenedor) o usar `<noscript>`; criterio de aceptación lo verifica. |
| Conflicto de clases entre el CSS nuevo y el de SPEC 01 (nombres como `.kicker`, `.pixel`, `.section-head`) | Comparar antes de pegar (paso 1); si hay colisión, mostrar ambas versiones y confirmar. |
| Colisión de nombre con la clase `.home` o `.fade-in` existentes | Verificar en `app/globals.css`; reutilizar si ya existe. |
| `references/home-about/` está sin versionar (untracked) | Confirmar con el usuario si se commitea antes o junto con el spec. |
| Textos que prometen "12+ juegos" y "Ranking global" cuando no existe | Aceptado como copy de marketing (decisión explícita). |

---

## Qué **no** está en este spec

- Acerca de y Contacto.
- Estilos de gamepad y variantes de tema.
- Actividad y top reales / ranking global.
- Créditos, pagos o suscripciones.
- Tests automatizados.

Cada uno, si se hace, va en su propio spec.
