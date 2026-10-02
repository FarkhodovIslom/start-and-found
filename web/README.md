# Start & Found — web

Next.js (App Router) front end of start-and-found.

```bash
cp .env.example .env.local   # API_BASE_URL, defaults to http://localhost:8080/v1
pnpm dev                     # http://localhost:3000
```

Server Components read the Go API through `src/lib/api/server.ts`; browsers go through the `/api/proxy` BFF route. The JWT access and refresh tokens live in the httpOnly cookies `saf_access` and `saf_refresh` (set by the `/api/auth/*` route handlers) and never reach client JavaScript.

Colors come from the semantic tokens in `src/app/globals.css`, each declared as a `light-dark()` pair, so every component follows the active scheme without a `dark:` variant. The visitor picks system/light/dark with the control in the header or on `/settings`; the choice is stored in the `saf_theme` cookie and the root layout renders `data-theme` from it, which keeps the first paint correct and works without JavaScript.

Quality gates: `pnpm lint`, `pnpm typecheck`, `pnpm build`.

