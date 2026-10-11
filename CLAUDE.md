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

No hay framework de tests configurado. Typecheck: `npx tsc --noEmit`.

## Stack y particularidades

- Next.js 16.4.0, React 19.3.0, Tailwind v4, TypeScript estricto. App Router en `app/`. Alias `@/*` apunta a la raíz del repo.
- **Next.js con breaking changes**: leer la guía relevante en `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`, `04-community`) antes de escribir código. `AGENTS.md` lo exige.
- `next.config.ts` activa `cacheComponents`, `partialPrefetching` y `experimental.agentFeedback`: modelo de caché/prefetch distinto al Next clásico.
- Tailwind se procesa vía regla turbopack (`@tailwindcss/turbopack` sobre `*.css`) en `next.config.ts`, no vía PostCSS. Tokens de tema en `app/globals.css` (`@theme inline`).
- Layout tipado con el helper global `LayoutProps<"/">` (sin import).
- `app/layout.tsx` y `app/page.tsx` siguen siendo el boilerplate de Create Next App (metadata "Create Next App", `lang="en"`).

## `templates/` — prototipo de diseño (no es código de la app)

Maqueta estática en HTML + React 18 UMD + Babel standalone (scripts globales, sin bundler ni imports). Sirve de referencia visual/UX para portar a `app/`:

- `Arcade Vault.html` carga `data.jsx` → `nav.jsx` → pantallas (`biblioteca`, `detalle`, `reproductor`, `auth`, `salon`) → `app.jsx`; orden importa porque todo comparte scope global.
- `data.jsx`: datos mock (`GAMES`, etc.). `styles.css`: estilos retro/neón de todo el prototipo.
- `app.jsx`: router casero por `location.hash` (rutas `biblioteca`, `detalle`, `player`, `auth`, `salon`); sesión y puntajes simulados en `localStorage` (`av_user`, `av_scores`).
- UI en español.

## Estado de git

`templates/` aún sin trackear y `README.md` con cambios sin commitear al momento de generar este archivo.
