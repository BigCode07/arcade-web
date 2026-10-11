# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Skills

Usa siempre /frontend-design para diseñar interaz de usuarios.

## Proyecto

Arcade Vault: plataforma web para jugar online y competir por puntos. Repo en etapa inicial (scaffold de Create Next App sin tocar + prototipo de diseño en `templates/`). README declara flujo Spec Driven Design (`/spec`, `/spec-impl`) con skills de `Klerith/fernando-skills`.

## Comandos

```bash
npm run dev     # next dev
npm run build   # next build
npm run start   # next start
npm run lint    # eslint (flat config, next core-web-vitals + typescript)
```

No hay framework de tests configurado. Typecheck: `npx tsc --noEmit` (si falla por `PageProps<...>`, correr `npx next typegen` antes). `npm run lint` también recorre `references/templates/` y reporta errores propios del prototipo; para validar la app: `npx eslint app components lib`.

## Stack y particularidades

- Next.js 16.4.0, React 19.3.0, Tailwind v4, TypeScript estricto. App Router en `app/`. Alias `@/*` apunta a la raíz del repo.
- **Next.js con breaking changes**: leer la guía relevante en `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`, `04-community`) antes de escribir código. `AGENTS.md` lo exige.
- `next.config.ts` activa `cacheComponents`, `partialPrefetching` y `experimental.agentFeedback`: modelo de caché/prefetch distinto al Next clásico.
- Tailwind se procesa vía regla turbopack (`@tailwindcss/turbopack` sobre `*.css`) en `next.config.ts`, no vía PostCSS. Tokens de tema en `app/globals.css` (`@theme inline`).
- Layout tipado con el helper global `LayoutProps<"/">` (sin import).
- Rutas dinámicas: `params` es `Promise`; tipar con `PageProps<"/juegos/[id]">`.

## Estructura de la app

Rutas (App Router): `/` biblioteca, `/juegos/[id]` detalle (404 propio en `not-found.tsx`), `/juegos/[id]/jugar` reproductor simulado, `/auth`, `/salon`. Layout global (`app/layout.tsx`) monta `SessionProvider` + `Nav` + `Footer`.

- `lib/games.ts`: tipos y `GAMES`/`CATS` (origen único de datos de juegos).
- `lib/scores.ts`: ranking mock determinista (semilla por hash de `game.id`, #1 = `game.best`) fusionado con puntajes locales (`mergeScores`), `personalBest`, y store en localStorage (`av_user`, `av_scores`) con fallback en memoria, expuesto vía `useSyncExternalStore`.
- `components/`: `session-provider` (contexto `useSession`), `nav`, `footer`, `library`, `game-card`, `leaderboard`, `game-player`, `auth-form`, `hall-of-fame`. Son Client Components solo los que usan estado/localStorage.
- Sin backend: auth falsa (la contraseña no se persiste), puntaje del reproductor simulado.

## `references/templates/` — prototipo de diseño (no es código de la app)

Maqueta estática en HTML + React 18 UMD + Babel standalone (scripts globales, sin bundler ni imports). Sirve de referencia visual/UX para portar a `app/`:

- `Arcade Vault.html` carga `data.jsx` → `nav.jsx` → pantallas (`biblioteca`, `detalle`, `reproductor`, `auth`, `salon`) → `app.jsx`; orden importa porque todo comparte scope global.
- `data.jsx`: datos mock (`GAMES`, etc.). `styles.css`: estilos retro/neón de todo el prototipo.
- `app.jsx`: router casero por `location.hash` (rutas `biblioteca`, `detalle`, `player`, `auth`, `salon`); sesión y puntajes simulados en `localStorage` (`av_user`, `av_scores`).
- UI en español.
