# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mike is an AI-powered legal document assistant (AGPL-3.0). Monorepo with a Next.js frontend and Express backend. GitHub: `willchen96/mike`.

## Development Commands

```bash
# Install dependencies
npm install --prefix backend
npm install --prefix frontend

# Development (run both simultaneously)
npm run dev --prefix backend       # Express on :3001 (tsx watch)
npm run dev --prefix frontend      # Next.js on :3000

# Build
npm run build --prefix backend     # tsc -> dist/
npm run build --prefix frontend    # next build

# Lint (frontend only)
npm run lint --prefix frontend

# Production start
npm run start --prefix backend     # node dist/index.js
npm run start --prefix frontend    # next start
```

No test framework is configured. No CI/CD pipeline exists.

## Environment Setup

- `backend/.env` — copy from `backend/.env.example`. Contains Supabase service-role key, R2 credentials, LLM API keys (Anthropic/Gemini/OpenAI), Resend key, download signing secret, encryption secret.
- `frontend/.env.local` — copy from `frontend/.env.local.example`. Contains only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, `NEXT_PUBLIC_API_BASE_URL`.
- Service-role keys and provider keys must stay in `backend/.env`, never in the frontend.

## Architecture

### Security Model

The browser's Supabase anon/authenticated roles have **zero direct table access** — all tables have `REVOKE ALL FROM anon, authenticated`. Every data operation goes through the Express API using the Supabase **service role key** after JWT verification. The `requireAuth` middleware validates Bearer JWTs via `supabase.auth.getUser()` and places `userId`/`userEmail` on `res.locals`.

### Backend (`backend/src/`)

Express 4 + TypeScript. Path alias `@/*` → `./src/*`.

**Routes** (all behind `requireAuth`):
- `/chat` — standalone assistant chats (CRUD + SSE streaming)
- `/projects` — projects, documents, folders CRUD
- `/projects/:projectId/chat` — project-scoped assistant chat
- `/single-documents` — standalone document management, versioning, tracked changes
- `/tabular-review` — structured multi-document extraction reviews
- `/workflows` — reusable prompt templates, email-based sharing
- `/user`, `/users` — profile, API keys, account management
- `/download` — HMAC-signed token-based file downloads

**LLM layer** (`lib/llm/`): Adapter pattern — unified interface with provider-specific implementations. Provider routing by model prefix: `claude-*` → Anthropic, `gemini-*` → Gemini, `gpt-*` → OpenAI. All adapters speak OpenAI-style tool schemas internally. Users can bring their own API keys (AES-GCM encrypted in `user_api_keys` table).

**Chat streaming**: SSE with `data: {JSON}\n\n` lines. Event types: `content`, `reasoning`, `tool_call_start`, `doc_read`, `doc_find`, `doc_created`, `doc_edited`, `doc_replicated`, `workflow_applied`, `error`, `[DONE]`.

**Storage** (`lib/storage.ts`): Cloudflare R2 via S3-compatible SDK. Key patterns: `documents/{userId}/{docId}/source.ext`, `converted-pdfs/{userId}/{docId}.pdf`, `generated/{userId}/{docId}/generated.ext`.

**Access control** (`lib/access.ts`): Application-layer authorization — `checkProjectAccess`, `ensureDocAccess`, `ensureReviewAccess` check ownership and `shared_with` JSONB arrays.

**Document conversion**: DOC/DOCX→PDF via LibreOffice (installed via `nixpacks.toml` in production).

### Frontend (`frontend/src/`)

Next.js 16 (App Router, React 19, React Compiler enabled), Tailwind CSS 4, shadcn/ui (New York style). Path alias `@/*` → `./src/*`. Deploys to Cloudflare Pages via OpenNext.

**Key contexts**: `AuthContext` (Supabase auth), `UserProfileContext` (profile + API keys), `ChatHistoryContext`, `SidebarContext`.

**API client**: `src/app/lib/mikeApi.ts` — complete typed client for all backend endpoints, injects Supabase session token as Bearer auth.

**Core hooks**: `useAssistantChat` (SSE streaming + parsing), `useDocumentVersions`, `useSelectedModel`.

**Page structure**: Root redirects to `/assistant`. Auth guard in `(pages)/layout.tsx` redirects unauthenticated users to `/login`. Main areas: assistant chat, projects (with nested documents/folders/reviews), tabular reviews, workflows, account settings.

### Database

Supabase Postgres. Schema defined in `backend/schema.sql`. No ORM — direct Supabase client queries (`.from().select().eq()` pattern). No RLS; security enforced at the Express middleware layer.

## Contributing Conventions

- Prefer targeted edits over broad refactors. One bug/feature/cleanup per PR.
- Do not propose local-hosting refactors (local LLMs, local databases, local filesystem storage).
- Update env examples when changing config.
- Frontend uses ESLint with `next/core-web-vitals` and `next/typescript` configs.
- Backend uses Prettier.
