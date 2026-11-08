# AGENTS.md

## Project

`lin-auth-web` is a frontend-only React 19 + Vite SPA for the **Lin Auth** system.

- There is no backend in this repository.
- The app communicates with **lin-auth-api** via `VITE_API_URL` (and optional `VITE_AUTH_API_URL`).
- Default API URL: `http://127.0.0.1:8080`
- Authentication uses JWT (Bearer token).
- Path aliases:
  - `src` → `src/`
  - `~` → `node_modules/`

## Commands

- Development: `npm run dev` (default port **3001**)
- Lint: `npm run lint`
- Build: `npm run build`
- Preview: `npm run preview`

There is currently no automated test suite configured.

## Layout

Framework-only tree (no Lin Langa product modules):

- `src/auth`, `src/theme`, `src/components`, `src/layouts`, `src/routes`, `src/locales`
- `src/sections/auth`, `src/sections/error`
- `src/pages/auth`, `src/pages/home`, `src/pages/error`
- `src/api/axios.js`, `src/api/services/userService.js`, `src/api/services/personaService.js`
- `src/sections/persona`, `src/pages/persona` — persona manage (`GET/POST/DELETE /persona`)

## Development Notes

- The frontend can start without the backend running.
- Login and API calls fail when **lin-auth-api** is unavailable; that is not a frontend setup failure.
- Copy `.env.example` to `.env` and set Firebase vars if you use Google sign-in.
- Session user is loaded from `GET /profile` on **lin-auth-api**.
