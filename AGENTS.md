# AGENTS.md

Repository guidance for AI agents working in this monorepo. Prefer executable sources over README prose — the README is partially stale (see "Doc drift" below).

## Structure

Monorepo with two independent npm packages. No root workspace manifest; install per-package.

- `backend/` — NestJS 11 + Prisma 6 + PostgreSQL (Supabase). Internal name `apt-backend`. Entrypoint `src/main.ts`, module graph `src/app.module.ts`.
- `frontend/` — Next.js 16 (App Router) + React 19. Internal name `apt-frontend`. Custom dev port 3001 (`next dev -p 3001`).
- `docs-mvp/` — Project docs and the n8n workflow exports (`n8n-workflows/`). Read-only reference, not code.

## Commands (per package)

Backend (`cd backend`):
- Dev: `npm run start:dev` (watch). API on `:3000`, Swagger at `/api/docs`, health at `/health`.
- Prisma: `npm run prisma:generate`, `npm run prisma:migrate`, `npm run prisma:migrate:deploy`, `npm run prisma:studio`.
- Lint/auto-fix: `npm run lint`. Format: `npm run format` (Prettier).
- Test: `npm test` (Jest on `src/**.spec.ts`). Single file: `npx jest path/to/file.spec.ts`. E2E: `npm run test:e2e` (config `test/jest-e2e.json`).
- Build: `npm run build` -> `dist/`. Prod start: `npm run start:prod`.

Frontend (`cd frontend`):
- Dev: `npm run dev` (port 3001). Build: `npm run build`. Start: `npm run start` (3001).
- Lint: `npm run lint` (eslint over `.ts,.tsx,.js,.jsx`). Format: `npm run format`.
- No test runner configured (README's "front tests" snippet is non-functional).

## Toolchain quirks

- **Package manager mismatch.** Both packages ship `package-lock.json` and CI uses `npm ci`; README/pnpm-workspace files recommend `pnpm` but there is no `pnpm-lock.yaml` committed (it's gitignored). Use **npm** to match CI and lockfiles.
- **Node version mismatch.** CI (`actions/setup-node`) uses Node 22; Dockerfiles (`backend/Dockerfile.dev`, `frontend/Dockerfile.dev`) pin Node 18. Match 22 for local/CI parity; the Node 18 images may lag on Next.js 16 / React 19.
- **Frontend `--legacy-peer-deps`.** CI installs the frontend with `npm ci --legacy-peer-deps` (React 19 peer conflicts). Replicate locally or installs can fail.
- **Prisma postinstall.** `backend/package.json` has `postinstall: prisma generate` — any `npm install` in `backend/` will try to generate the client. Needs `prisma/schema.prisma` present and reachable.
- **Required env vars gate startup.** `backend/src/main.ts` hard-exits if any of `DATABASE_URL`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` are unset. Backend won't boot without a real `.env`.
- **Backend validation is strict.** Global `ValidationPipe` runs with `whitelist: true, forbidNonWhitelisted: true, transform: true` — extra fields in payloads 400, unknown fields rejected. Mirror this in any DTO work.
- **Express v5 query parser.** `main.ts` forces `query parser: 'extended'` for array/nested query strings; don't remove without checking call sites.
- **Frontend `/api/*` rewrite.** `next.config.js` rewrites `/api/:path*` to `${NEXT_PUBLIC_API_URL}` (default `http://localhost:3000`). Frontend code should hit `/api/...`, not the backend origin directly, to stay environment-portable.
- **Frontend image hosts.** `next.config.js` allows images from `**.supabase.co`, `techcorp.com`, and http `localhost`. Add new image hosts there or `<Image>` will 400.

## Migrations / codegen

- Prisma schema at `backend/prisma/schema.prisma`; migrations under `backend/prisma/migrations/` (currently only `20251115000000_add_security_validation`). Root-level `backend/migration.sql` is a standalone SQL file, not part of the Prisma migrations folder.
- After schema edits: edit `schema.prisma` -> `npm run prisma:migrate` (dev, creates+applies migration) -> `npm run prisma:generate` (regenerate client). In CI/deploy use `prisma migrate deploy` (never create migrations in prod).
- CI fallback: when `migrate deploy` fails it runs `prisma db push` (see `ci-cd.yml`).

## Environment setup

- `backend/.env` and `frontend/.env.local` are gitignored; templates are `backend/.env.example` and `frontend/.env.example`. `start-dev.ps1` copies them if missing.
- Backend vars that matter most: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_KEY`, `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_URL_CARGO`, OAuth (`LINKEDIN_*`, `GOOGLE_*`), email (`EMAIL_*`).
- Frontend only needs `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_JWT_SECRET`.
- CORS allowlist in `main.ts` is hardcoded to `frontend-magnolias.vercel.app`, `localhost:3001`, `localhost:3000`, plus `process.env.FRONTEND_URL`. Add new origins there.

## Doc drift (trust code over README)

- README and `start-dev.ps1`/`stop-dev.ps1` reference `docker-compose.mvp.yml` for a full stack (backend + frontend + n8n on `:5678`, admin/admin123). **That compose file is not present in the repo**, so the PowerShell scripts (`.\start-dev.ps1`) will fail. Don't promise the one-command Docker flow; run services manually until/unless the compose file is restored.
- README "Inicio Rápido" links `docs-mvp/INICIO-RAPIDO.md` (does not exist; actual set is `ARCHITECTURE.md`, `PRUEBA-END-TO-END.md`, `RESUMEN-FINAL.md`, `INTEGRACION-N8N.md`). Verify any `docs-mvp/*.md` link before citing.
- README claims Step 1 `cp frontend/.env.example frontend/.env`; Next.js actually reads `.env.local`. The PowerShell script does the correct `frontend/.env.local` copy.
- README says Swagger at `/api`; it's actually at `/api/docs` (per `main.ts`).

## CI behavior (`.github/workflows`)

- `ci-cd.yml` (push/PR to `main`/`develop`): backend job spins up Postgres 15, generates prisma, deploys migrations, then lint/tests/build. **Lint and test steps are `continue-on-error: true`** — they won't fail CI. Only `npm run build` is gating. Mirror this expectation; don't be surprised by lint-only PR failures slipping through.
- `pr-check.yml` (PR opened/sync/reopened): runs `npx tsc --noEmit` and `prisma format --check` on backend, `tsc --noEmit` + `depcheck` + `npm run build` on frontend. Both jobs gated on path-filter `contains(github.event.pull_request.changed_files, 'backend/')` / `'frontend/'`.
- Conventional-commits prefixes (`feat|fix|docs|style|refactor|test|chore|perf`) are checked in `pr-check.yml` but only warn — they don't block.

## Style / conventions

- Backend modules are domain-foldered under `src/modules/` (`auth`, `empresas`, `postulantes`, `cargos`, `postulaciones`, `ia`, `storage`, `admin`, `reportes`); shared infra under `src/common/` (`prisma`, `decorators`, `validators`). Mirror this split — don't put domain logic in `common/`.
- Frontend layering under `src/`: `types/` (centralized interfaces, single source of truth), `services/` (HTTP client + per-entity API calls), `hooks/` (business logic), `lib/` (formatters/validators/constants), `components/`, `app/` (App Router pages). New code should fit a layer, not bleed across.
- Backend lint config: `eslint + eslint-config-prettier + eslint-plugin-prettier` (`backend/.eslintrc.js`), Prettier config in `backend/.prettierrc`. Frontend uses `eslint-config-next` (`frontend/.eslintrc.json`) + `prettier-plugin-tailwindcss`.
- Forms/validation on frontend: React Hook Form + Zod (`@hookform/resolvers/zod`). State: Zustand. Styling: Tailwind v4 (CSS-first, via `@tailwindcss/postcss` in `postcss.config.js`). Animations: Framer Motion with `useInView`.
- Spanish is used in code comments and user-facing strings; keep that convention when editing existing files.

## Don't

- Don't run `npx prisma migrate reset` against the Supabase shared DB without coordination — it drops data.
- Don't add new packages without `--legacy-peer-deps` on the frontend (React 19 peer constraints).
- Don't trust the README's Docker/n8n flow until the compose file returns; verify the file exists before invoking it.
