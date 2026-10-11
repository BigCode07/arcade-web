# SPEC 01 — MVP de pantallas de Arcade Vault

> **Estado:** approved
> **Depende de:** ninguna (el estilo neón retro ya está en `app/globals.css` y las fuentes en `app/layout.tsx`)
> **Fecha:** 2026-10-10
> **Objetivo:** Portar las 5 pantallas del prototipo `references/templates/` (biblioteca, detalle, reproductor simulado, auth y salón de la fama) a rutas reales de Next.js App Router con persistencia en localStorage.

---

## Por qué existe este spec

El prototipo en `references/templates/` es HTML + React UMD + Babel con router por `location.hash`. No es código de la app. Este spec define cómo pasa a `app/` sin perder su comportamiento visible y corrigiendo tres incoherencias del prototipo (rankings distintos entre detalle y salón, "tu mejor marca" inventada, nivel que sube varias veces).

El producto se llama **Arcade Vault** (README, logo y textos del prototipo). "Arcade Bot" no se usa.

---

## Alcance

**Dentro:**

- Pantalla Biblioteca en `/`: hero, búsqueda por nombre, chips de categoría, grilla de tarjetas, estado "NO HAY RESULTADOS".
- Pantalla Detalle en `/juegos/[id]`: portada, etiquetas, descripción, estadísticas, ranking top 10, botones JUGAR AHORA y VOLVER AL VAULT. Id inexistente muestra 404.
- Pantalla Reproductor en `/juegos/[id]/jugar`: HUD, pausa, fin de juego, modal con guardado de puntaje. El juego es **simulado** como en `reproductor.jsx`.
- Pantalla Auth en `/auth`: pestañas iniciar sesión / crear cuenta, validación mínima, entrada como invitado, botones sociales deshabilitados.
- Pantalla Salón de la Fama en `/salon`: pestañas por juego, podio top 3, tabla top 12, fila "tu mejor marca" real.
- Navegación global (desktop + panel móvil) y footer, compartidos por todas las rutas desde `app/layout.tsx`.
- Datos de juegos tipados en `lib/games.ts`.
- Sesión y puntajes en localStorage (`av_user`, `av_scores`), sin backend.
- `<html lang="es">` y metadata "Arcade Vault".

**Fuera de alcance (para otros specs):**

- Juegos realmente jugables (cada uno va en su propio spec; hoy el puntaje es simulado).
- Backend, base de datos, auth real, hash de contraseñas, OAuth Google/GitHub.
- Sistema de créditos (el "CRÉDITOS · 03" es texto fijo).
- Ranking global compartido entre usuarios.
- Tests automatizados (el repo no tiene framework de tests).
- Cambios de estilos en `app/globals.css` salvo clases faltantes detectadas al portar.
- Internacionalización (la UI queda solo en español).

---

## Modelo de datos

```ts
// lib/games.ts
export type Category = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type CoverId =
  | "cover-bricks" | "cover-tetro" | "cover-snake" | "cover-glot"
  | "cover-invaders" | "cover-rocas" | "cover-rana" | "cover-duelo";

export type Game = {
  id: string;            // slug, ej. "bloque-buster"; es el segmento de URL
  title: string;
  short: string;
  long: string;
  cat: Category;
  cover: CoverId;
  color: "cyan" | "magenta" | "yellow" | "green";
  best: number;          // "mejor global" estático
  plays: string;         // texto fijo, ej. "12.4K"
  difficulty: 1 | 2 | 3 | 4 | 5; // nuevo; reemplaza las estrellas fijas del prototipo
};

export const GAMES: Game[];                 // los 8 juegos de data.jsx
export const CATS: ["TODOS", ...Category[]];
```

```ts
// lib/scores.ts
export type ScoreRow = { rank: number; name: string; score: number; date: string }; // date: "dd/mm/aaaa"
export type LocalScore = { game: string; score: number; name: string; at: number }; // at = Date.now()
export type Session = { name: string };       // name en mayúsculas, máx. 10 chars
```

Claves de localStorage (se mantienen las del prototipo):

- `av_user`: `Session | null` serializado.
- `av_scores`: `LocalScore[]` serializado.

Convenciones:

- Ranking de un juego = filas mock deterministas (12) + `LocalScore` de ese juego, ordenado por `score` desc, rangos recalculados.
- Las filas mock se generan con una semilla derivada de un hash de `game.id` (no de su longitud) y se escalan para que la fila #1 valga `game.best`.
- Detalle muestra las primeras 10 filas del ranking; salón las primeras 12. Ambas usan la misma función, así un juego tiene un solo ranking.
- "Tu mejor marca" = mayor `score` de `LocalScore` con `game` actual y `name === session.name`. Su rango es 1 + cantidad de filas del ranking completo con `score` mayor. Sin marca previa se muestra "AÚN SIN MARCA".
- Números con `toLocaleString("es-ES")`.

---

## Plan de implementación

Antes del paso 1: leer la guía relevante en `node_modules/next/dist/docs/` (`01-app`) sobre `params` asíncronos, `generateStaticParams`, `not-found` y `cacheComponents`, porque este Next.js tiene cambios incompatibles.

1. **Datos.** Crear `lib/games.ts` (tipos + `GAMES` + `CATS`, con `difficulty` por juego) y `lib/scores.ts` (hash de id, `seededScores`, `mergeScores`, lectura/escritura segura de localStorage con `try/catch` y fallback en memoria). `npm run build` pasa.
2. **Shell global.** Crear `components/session-provider.tsx` (contexto cliente: lee `av_user` tras montar, expone `user`, `login`, `signOut`, `saveScore`), `components/nav.tsx` (logo, link Biblioteca, contador "CRÉDITOS · 03" fijo, botón de sesión, panel móvil) y `components/footer.tsx`. Actualizar `app/layout.tsx`: `lang="es"`, metadata "Arcade Vault", provider + nav + footer. Los links a Salón y Auth se agregan en los pasos 5 y 7 para no apuntar a rutas inexistentes.
3. **Biblioteca.** Reemplazar `app/page.tsx` con hero, filtros y grilla. Componentes `components/game-card.tsx` (con tilt por mouse) y `components/library.tsx` (cliente, estado `q` y `cat`). Navega a `/juegos/[id]`.
4. **Detalle.** Crear `app/juegos/[id]/page.tsx` con `generateStaticParams` desde `GAMES`, `app/juegos/[id]/not-found.tsx` y `components/leaderboard.tsx` (ranking top 10 que fusiona puntajes locales tras montar). Botón JUGAR AHORA apunta a `/juegos/[id]/jugar` (404 hasta el paso 6; se acepta porque el paso 6 va inmediatamente después, ver nota).
5. **Auth.** Crear `app/auth/page.tsx` y `components/auth-form.tsx`: pestañas, validación mínima, errores inline, invitado, sociales deshabilitados con "PRÓXIMAMENTE". Al éxito guarda sesión y redirige a `/`. Agregar botón "Iniciar sesión" al nav.
6. **Reproductor.** Crear `app/juegos/[id]/jugar/page.tsx` y `components/game-player.tsx`: HUD, pausa, FIN, SALIR, modal de fin con guardado en `av_scores`, JUGAR DE NUEVO, VOLVER AL VAULT.
7. **Salón de la Fama.** Crear `app/salon/page.tsx` y `components/hall-of-fame.tsx`: pestañas por juego, podio, tabla, fila "tu mejor marca". Agregar link "Salón de la Fama" al nav.
8. **Documentación.** Actualizar `CLAUDE.md`: ruta real del prototipo (`references/templates/`), estructura de rutas y estado de la app.

> Nota sobre el paso 4: para mantener cada paso sin enlaces rotos, el botón JUGAR AHORA puede implementarse junto con el paso 6 si se prefiere; el orden 4 → 6 se hace en commits consecutivos.

---

## Criterios de aceptación

- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` terminan sin errores.
- [ ] `/` muestra las 8 tarjetas; escribir "caí" deja solo CAÍDA; el chip SHOOTER deja INVASORES y ROCAS.
- [ ] Buscar "zzz" muestra "NO HAY RESULTADOS".
- [ ] Clic en una tarjeta navega a `/juegos/<id>` con título, descripción y ranking de 10 filas.
- [ ] `/juegos/no-existe` muestra la página 404.
- [ ] JUGAR AHORA lleva a `/juegos/<id>/jugar` y el puntaje empieza a subir solo.
- [ ] PAUSA detiene el puntaje y muestra "EN PAUSA"; REANUDAR lo retoma.
- [ ] FIN abre el modal con la puntuación final; GUARDAR PUNTUACIÓN queda deshabilitado con el campo de nombre vacío.
- [ ] Guardar un puntaje agrega una entrada a `av_scores` y muestra "PUNTUACIÓN GUARDADA".
- [ ] Tras guardar, el puntaje aparece en el ranking de `/juegos/<id>` y en `/salon` con el mismo rango en ambas pantallas.
- [ ] Para un mismo juego, detalle y salón muestran los mismos 10 primeros nombres y puntajes.
- [ ] El nivel del HUD es `floor(puntaje / 2500) + 1` y nunca baja.
- [ ] En `/auth`, enviar con usuario vacío, email inválido (solo en crear cuenta) o contraseña de menos de 4 caracteres muestra error y no crea sesión.
- [ ] Login válido guarda `av_user`, redirige a `/` y el nav muestra el nombre en mayúsculas.
- [ ] La contraseña no se guarda en localStorage ni en ninguna otra parte.
- [ ] JUGAR COMO INVITADO elimina `av_user` y redirige a `/`.
- [ ] Los botones Google y GitHub están deshabilitados.
- [ ] En `/salon`, con sesión y sin puntajes guardados, la fila personal muestra "AÚN SIN MARCA"; tras guardar uno, muestra el mayor.
- [ ] Recargar la página mantiene sesión y puntajes.
- [ ] Con localStorage bloqueado, la app navega y juega sin lanzar excepciones.
- [ ] A 375 px de ancho el nav muestra el botón hamburguesa y abre el panel móvil con los 3 enlaces.
- [ ] `<html>` tiene `lang="es"` y el título de pestaña es "Arcade Vault".
- [ ] No quedan referencias a "Create Next App" en `app/`.

---

## Decisiones tomadas y descartadas

- **Sí:** nombre "Arcade Vault". Coincide con README, logo y prototipo; "Arcade Bot" se tomó como error de tipeo.
- **Sí:** rutas reales de App Router. URLs compartibles, 404 nativo y `generateStaticParams`.
- **No:** router por hash dentro de `app/page.tsx`. Va contra el framework y rompe enlaces directos.
- **Sí:** reproductor simulado. Cada juego real merece su propio spec; el MVP valida el flujo jugar → puntaje → ranking.
- **No:** implementar un juego real o los 8 en este spec. Excede el tamaño razonable de un spec.
- **Sí:** localStorage con claves `av_user` y `av_scores` del prototipo. Sin backend no hay otra opción razonable y se mantiene compatibilidad con el prototipo.
- **No:** versionar las claves (`av_scores:v1`). El esquema es mínimo; si cambia se agrega migración en un spec posterior.
- **No:** backend/DB/auth real en este spec. Requiere decidir proveedor y modelo; va en otro spec.
- **Sí:** auth falsa con validación mínima (usuario requerido, email válido en registro, contraseña ≥ 4) y sin guardar la contraseña. Evita dar la falsa impresión de que se almacenan credenciales.
- **Sí:** botones sociales visibles pero deshabilitados. Mantienen el diseño sin prometer una función inexistente.
- **Sí:** datos de juegos en `lib/games.ts` tipado. Origen único, fácil de reemplazar por una API.
- **No:** JSON en `data/`. Los tipos quedarían separados de los datos.
- **Sí:** ranking mock + puntajes locales fusionados. El usuario ve el efecto de su partida.
- **No:** ranking 100 % mock como el prototipo. Guardar un puntaje no tendría efecto visible.
- **Sí:** una sola función de ranking por juego, semilla por hash de `id` y #1 escalado a `game.best`. El prototipo usaba semillas distintas en detalle y salón, y juegos con ids de igual longitud compartían ranking.
- **Sí:** nivel derivado del puntaje (`floor(puntaje / 2500) + 1`). El prototipo comparaba `score % 2500 < 100` y podía subir varias veces seguidas.
- **Sí:** vidas fijas en 3 como en el prototipo; no hay mecánica que las reduzca mientras el juego sea simulado.
- **Sí:** créditos, versión del footer y estrellas de dificultad estáticos (dificultad pasa a campo `difficulty`).
- **No:** lógica de créditos. Agregaría reglas que el prototipo no tiene.
- **Sí:** el nav con nombre de usuario cierra sesión al hacer clic, como en el prototipo.

---

## Riesgos identificados

| Riesgo | Mitigación |
| ------ | ---------- |
| Desajuste de hidratación al leer localStorage | El provider arranca con `user = null` y lee `av_user` en un efecto tras montar. Los rankings renderizan primero las filas mock (deterministas) y fusionan locales tras montar. |
| localStorage bloqueado o lleno (modo privado) | Todas las lecturas/escrituras en `try/catch` con fallback a objeto en memoria; la app sigue funcionando sin persistir. |
| `cacheComponents` y `partialPrefetching` cambian el modelo de caché | Leer la guía de Next.js en `node_modules/next/dist/docs/` antes del paso 1; marcar como Client Components solo lo que usa estado o localStorage. |
| `Mejor global` (`game.best`) puede quedar por debajo de un puntaje local #1 | Limitación conocida del MVP: `best` es estático. Se resuelve cuando exista ranking global real. |
| Clases CSS del prototipo ausentes en `app/globals.css` | Comparar con `references/templates/styles.css` al portar cada pantalla y copiar solo las clases faltantes. |

---

## Qué **no** está en este spec

- Juegos jugables reales.
- Backend, base de datos y autenticación real u OAuth.
- Sistema de créditos.
- Ranking global compartido.
- Tests automatizados.
- Internacionalización.

Cada uno, si se hace, va en su propio spec.
