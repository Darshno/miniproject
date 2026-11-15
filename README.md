# TuluTalk Translator

React / Express / tRPC / Drizzle starter, adapted from the Sandbox web-db-user template.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

## Deploying on Render

This application uses PostgreSQL in production. In Render, create a PostgreSQL
database and set its **Internal Database URL** as `DATABASE_URL` on the web
service. The Dockerfile builds and starts the application automatically.

Use these Render web-service settings:

- Runtime: `Docker`
- Dockerfile path: `./Dockerfile`
- Health check path: `/api/health`

The database schema can be applied from a shell connected to the service with:

```bash
pnpm db:migrate
```

Manus variables (`MANUS_PROJECT_ID`, `MANUS_OAUTH_API_URL`,
`MANUS_JWT_SECRET`, `MANUS_API_URL`, and `MANUS_API_KEY`) are only needed for
Manus login and Manus-backed AI/storage features. They cannot be invented:
obtain them from the Manus project that owns those integrations. A
`MANUS_JWT_SECRET` may be generated as a random secret, but it must remain
private. `OWNER_OPEN_ID` is optional.

Kodava translation uses the backend-only Gemini integration. Configure
`GEMINI_API_KEY` on the server/Render service (never in Vite or browser
environment variables). `GEMINI_MODEL` is optional and defaults to
`gemini-3.8-flash`. The Kodava dictionary and historical grammar are loaded
from `server/data/kodava/` and are cached in memory.
For temporary 429/503 capacity errors, the server retries automatically. You
can optionally configure `GEMINI_FALLBACK_MODEL` with another model available
to your Gemini API key.

Start with the Webdev skill's default-template guide. Platform login, storage, payments and service contracts live in its shared references; read the relevant capability before extending its helper.

`server/_core/publicConfig.ts` exposes only named public runtime values. Private keys stay server-side. The platform serves managed `/manus-storage/` assets; the application does not register a second proxy.

Platform configuration is readable and editable through `webdev.config`. Default settings are initial values, not enforced constraints. The agent may modify the files, commands and configuration or follow the flexible guide for another stack.
