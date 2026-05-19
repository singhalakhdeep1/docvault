# DocsVault — Notion-Style Realtime Collaboration Platform

> A production-grade **Notion / Confluence clone** built with NestJS, Yjs CRDT, Meilisearch, and MinIO.
> Realtime multi-user document editing with live cursors, workspace RBAC, folder hierarchy, full-text search, S3-compatible file attachments, and inline comments.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Database Schema](#4-database-schema)
5. [Realtime Collaboration (Yjs + Socket.IO)](#5-realtime-collaboration-yjs--socketio)
6. [API Reference](#6-api-reference)
7. [Frontend Application](#7-frontend-application)
8. [Environment Variables](#8-environment-variables)
9. [Quick Start](#9-quick-start)
10. [Full Docker Deployment](#10-full-docker-deployment)
11. [Key Design Decisions](#11-key-design-decisions)
12. [Project Structure](#12-project-structure)

---

## 1. Project Overview

DocsVault is a collaborative knowledge-base platform where teams can:

- Create **workspaces** with folder hierarchies and nested documents
- Edit documents simultaneously with **live cursors** and conflict-free merging (Yjs CRDT)
- **Search** across all documents in a workspace via Meilisearch full-text + fuzzy search
- Attach **files** (images, PDFs, etc.) via pre-signed MinIO upload URLs — no server-side multipart
- Leave and resolve **inline comments** on documents
- Track every write action in a per-workspace / per-document **activity feed**
- Manage team access with three-tier **RBAC** (OWNER / EDITOR / VIEWER)

---

## 2. Architecture

```
docsvault/
├── apps/
│   ├── api/        ← NestJS 10 monolith on port 4000
│   │               ← Socket.IO /collab namespace (Yjs WebSocket)
│   └── web/        ← Next.js 15 App Router on port 3000
├── packages/
│   ├── database/   ← Prisma 5 schema (12 models) + seed
│   └── shared/     ← Zod schemas, TypeScript types, enums
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

### Service Ports

| Service                       | Port |
| ----------------------------- | ---- |
| API + WebSocket (NestJS)      | 4000 |
| Web application (Next.js)     | 3000 |
| PostgreSQL                    | 5432 |
| Redis                         | 6379 |
| Meilisearch                   | 7700 |
| MinIO (S3-compatible storage) | 9000 |
| MinIO Console (web UI)        | 9001 |

---

## 3. Tech Stack

| Layer            | Technology                                                               |
| ---------------- | ------------------------------------------------------------------------ |
| API              | NestJS 10, class-validator, class-transformer, @nestjs/swagger           |
| Realtime         | Socket.IO 4 (`/collab` namespace), Yjs 13 (CRDT)                         |
| Rich Text Editor | Tiptap 2 + Collaboration + CollaborationCursor extensions                |
| Database         | PostgreSQL 16, Prisma ORM 5                                              |
| Cache            | Redis 7 (ioredis)                                                        |
| Full-text Search | Meilisearch v1.10                                                        |
| File Storage     | MinIO (S3-compatible), pre-signed PUT URLs                               |
| Auth             | bcryptjs password hashing, jsonwebtoken (HS256)                          |
| Frontend         | Next.js 15 App Router, TailwindCSS, TanStack Query v5, Zustand, date-fns |
| Monorepo         | Turborepo 2, pnpm 9 workspaces                                           |
| Containerisation | Docker 26, Docker Compose                                                |

---

## 4. Database Schema

12 Prisma models organized across five domains:

### Auth

| Model         | Key Fields                                                                   |
| ------------- | ---------------------------------------------------------------------------- |
| `User`        | id (cuid), email (unique), fullName, passwordHash, avatarUrl                 |
| `UserSession` | id, userId, token (unique), expiresAt — used for explicit session revocation |

### Workspaces & RBAC

| Model             | Key Fields                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------- |
| `Workspace`       | id, name, slug (unique), description, logoUrl                                                 |
| `WorkspaceMember` | id, workspaceId, userId, role (OWNER \| EDITOR \| VIEWER) — `@@unique([workspaceId, userId])` |

**WorkspaceRole enum:** `OWNER` → full control, `EDITOR` → create/edit docs, `VIEWER` → read-only

### Folders

| Model    | Key Fields                                                                            |
| -------- | ------------------------------------------------------------------------------------- |
| `Folder` | id, workspaceId, parentFolderId (self-referential for nesting), name, emoji, position |

Folders support **unlimited nesting** via `parentFolder`/`children` self-relation.

### Documents

| Model             | Key Fields                                                                                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Document`        | id, workspaceId, folderId, authorId, title, emoji, status (ACTIVE \| ARCHIVED \| TRASHED), yjsState (Bytes), textContent (plain-text snapshot for search) |
| `DocumentVersion` | id, documentId, createdById, yjsState (Bytes), snapshot (text) — named version history                                                                    |

**DocumentStatus enum:** `ACTIVE`, `ARCHIVED`, `TRASHED`

### Collaboration

| Model        | Key Fields                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------- |
| `Attachment` | id, documentId, uploadedById, fileName, mimeType, fileSize, storageKey, publicUrl, confirmed |
| `Comment`    | id, documentId, authorId, content, resolved, resolvedById                                    |
| `Activity`   | id, workspaceId, documentId, userId, action, metadata (JSON)                                 |

---

## 5. Realtime Collaboration (Yjs + Socket.IO)

### Connection

Connect to the Socket.IO `/collab` namespace:

```ts
import { io } from "socket.io-client";

const socket = io("http://localhost:4000/collab", {
  auth: { token: "Bearer <jwt>" },
  query: { docId: "<document-id>" },
});
```

On connection, the server:

1. Verifies the JWT token
2. Loads (or creates) the in-memory `Y.Doc` for the document
3. Applies any persisted `yjsState` bytes from PostgreSQL
4. Joins the socket to room `doc:<docId>`
5. Broadcasts the new participant's awareness info to other clients

### Events

**Client → Server**

| Event              | Payload                                 | Description                                     |
| ------------------ | --------------------------------------- | ----------------------------------------------- |
| `sync:update`      | `{ docId: string, update: Uint8Array }` | Send a Yjs state update (delta)                 |
| `cursor:update`    | `{ docId: string, position: object }`   | Send cursor/selection position                  |
| `awareness:update` | `{ docId: string, awareness: object }`  | Send full awareness state (name, color, cursor) |

**Server → Client**

| Event              | Payload                                           | Description                                  |
| ------------------ | ------------------------------------------------- | -------------------------------------------- |
| `sync:init`        | `{ docId, state: Uint8Array, clients: Client[] }` | Full Yjs document state on join              |
| `sync:update`      | `{ docId, update: Uint8Array, senderId }`         | Broadcast delta from another client          |
| `cursor:update`    | `{ docId, userId, position, color, name }`        | Another user's cursor moved                  |
| `awareness:update` | `{ docId, clients: Client[] }`                    | Full updated client list (join/leave/update) |
| `client:joined`    | `{ userId, email, color, docId }`                 | New collaborator joined                      |
| `client:left`      | `{ userId, docId }`                               | Collaborator disconnected                    |

### Persistence Strategy

- **In-memory:** Each `Y.Doc` lives in a `Map<docId, Y.Doc>` on the server process
- **Persistence:** Every `sync:update` triggers `documentsService.saveYjsState(docId, state)` — writes the full Yjs state as `Bytes` to PostgreSQL
- **Recovery:** On cold start (or first connection after all clients leave), the persisted state is loaded back into a fresh `Y.Doc`

### Cursor Colors

The server assigns one of 10 distinct colors from `CURSOR_COLORS` at connection time, ensuring visually distinct cursors for each collaborator.

---

## 6. API Reference

Base URL: `http://localhost:4000`
Swagger UI: `http://localhost:4000/api/docs`

All routes require `Authorization: Bearer <token>` unless marked Public.

### Authentication

| Method | Path                | Auth   | Description                  |
| ------ | ------------------- | ------ | ---------------------------- |
| POST   | `/v1/auth/register` | Public | Register → `{ token, user }` |
| POST   | `/v1/auth/login`    | Public | Login → `{ token, user }`    |
| GET    | `/v1/auth/me`       | JWT    | Get current user profile     |
| PATCH  | `/v1/auth/me`       | JWT    | Update fullName or avatarUrl |

### Workspaces

| Method | Path                                 | Auth        | Description                            |
| ------ | ------------------------------------ | ----------- | -------------------------------------- |
| POST   | `/v1/workspaces`                     | JWT         | Create a new workspace                 |
| GET    | `/v1/workspaces`                     | JWT         | List all workspaces for current user   |
| GET    | `/v1/workspaces/:id`                 | JWT         | Get workspace (with folders + members) |
| PATCH  | `/v1/workspaces/:id`                 | JWT (OWNER) | Update name / description / logo       |
| DELETE | `/v1/workspaces/:id`                 | JWT (OWNER) | Delete workspace                       |
| POST   | `/v1/workspaces/:id/members`         | JWT (OWNER) | Invite member by email + role          |
| DELETE | `/v1/workspaces/:id/members/:userId` | JWT (OWNER) | Remove member                          |
| PATCH  | `/v1/workspaces/:id/members/:userId` | JWT (OWNER) | Update member role                     |

### Folders

| Method | Path                       | Auth          | Description                           |
| ------ | -------------------------- | ------------- | ------------------------------------- |
| POST   | `/v1/folders?workspaceId=` | JWT (EDITOR+) | Create folder                         |
| GET    | `/v1/folders?workspaceId=` | JWT           | List folders in workspace             |
| PATCH  | `/v1/folders/:id`          | JWT (EDITOR+) | Update folder name / emoji / position |
| DELETE | `/v1/folders/:id`          | JWT (EDITOR+) | Delete folder (and its documents)     |

### Documents

| Method | Path                                   | Auth          | Description                            |
| ------ | -------------------------------------- | ------------- | -------------------------------------- |
| POST   | `/v1/documents?workspaceId=`           | JWT (EDITOR+) | Create document                        |
| GET    | `/v1/documents?workspaceId=&folderId=` | JWT           | List documents (optionally by folder)  |
| GET    | `/v1/documents/:id`                    | JWT           | Get document metadata + Yjs state      |
| PATCH  | `/v1/documents/:id`                    | JWT (EDITOR+) | Update title / emoji / folder / status |
| DELETE | `/v1/documents/:id`                    | JWT (EDITOR+) | Trash a document                       |
| POST   | `/v1/documents/:id/restore`            | JWT (EDITOR+) | Restore from trash                     |
| GET    | `/v1/documents/:id/versions`           | JWT           | List named version history             |

### Attachments

| Method | Path                                           | Auth          | Description                     |
| ------ | ---------------------------------------------- | ------------- | ------------------------------- |
| POST   | `/v1/documents/:docId/attachments/upload-url`  | JWT (EDITOR+) | Get pre-signed MinIO PUT URL    |
| POST   | `/v1/documents/:docId/attachments/:id/confirm` | JWT (EDITOR+) | Confirm upload completed        |
| GET    | `/v1/documents/:docId/attachments`             | JWT           | List attachments for a document |
| DELETE | `/v1/documents/:docId/attachments/:id`         | JWT (EDITOR+) | Delete an attachment            |

**Upload flow:**

1. Call `POST .../upload-url` with `{ fileName, mimeType, fileSize }` → receive `{ uploadUrl, attachmentId }`
2. `PUT <uploadUrl>` directly from the browser (no server-side proxy)
3. Call `POST .../confirm` → marks attachment as confirmed, sets `publicUrl`

### Comments

| Method | Path                                        | Auth | Description                  |
| ------ | ------------------------------------------- | ---- | ---------------------------- |
| POST   | `/v1/documents/:docId/comments`             | JWT  | Add comment                  |
| GET    | `/v1/documents/:docId/comments`             | JWT  | List comments on document    |
| PATCH  | `/v1/documents/:docId/comments/:id/resolve` | JWT  | Mark comment as resolved     |
| DELETE | `/v1/documents/:docId/comments/:id`         | JWT  | Delete comment (author only) |

### Search

| Method | Path                                | Auth | Description                              |
| ------ | ----------------------------------- | ---- | ---------------------------------------- |
| GET    | `/v1/search?q=&workspaceId=&limit=` | JWT  | Full-text + fuzzy search via Meilisearch |

Returns up to `limit` (default 20) document hits with highlighted snippets.

### Activity

| Method | Path                                  | Auth | Description                   |
| ------ | ------------------------------------- | ---- | ----------------------------- |
| GET    | `/v1/activity/workspace/:workspaceId` | JWT  | Activity feed for a workspace |
| GET    | `/v1/activity/document/:documentId`   | JWT  | Activity feed for a document  |

Both endpoints accept an optional `?limit=` query param (default 50).

### Health

| Method | Path      | Auth   | Description                   |
| ------ | --------- | ------ | ----------------------------- |
| GET    | `/health` | Public | `{ status: "ok", timestamp }` |

---

## 7. Frontend Application

Built with **Next.js 15 App Router**, TailwindCSS, TanStack Query v5, Zustand, Tiptap, socket.io-client, date-fns.

### Routes

| Route                         | Description                                                            |
| ----------------------------- | ---------------------------------------------------------------------- |
| `/auth/login`                 | Login form                                                             |
| `/auth/register`              | Registration form                                                      |
| `/dashboard`                  | Workspace grid — create workspace, see recent activity                 |
| `/workspace/[id]`             | Workspace overview — recent documents, folder tree, stats              |
| `/workspace/[id]/doc/[docId]` | **Document editor** — Tiptap + live cursors + comments panel           |
| `/workspace/[id]/settings`    | Workspace settings — rename, invite/remove members, change roles       |
| `/search`                     | Global search — Meilisearch full-text across all accessible workspaces |

### Document Editor Features

- **Rich text formatting:** Bold, italic, underline, strikethrough, inline code, headings (H1–H3), bullet list, ordered list, blockquote, code block, horizontal rule
- **Realtime collaboration:** Multiple users edit simultaneously with CRDT conflict resolution
- **Live cursors:** Each collaborator's cursor shown in a distinct color with their name label
- **Awareness panel:** Connected users list in the sidebar
- **Title editing:** Click to edit document title inline (auto-saves)
- **Emoji picker:** Set document emoji
- **Comments panel:** Add, resolve, and delete threaded comments
- **Trash:** Soft-delete with restore support
- **Attachment uploads:** Drag-and-drop or click to upload files directly to MinIO
- **Optimistic UI:** Title edits, emoji changes, and comment posts update the UI instantly before the server confirms — TanStack Query's `onMutate` / `onError` rollback pattern
- **Offline queue (IndexedDB):** Yjs state deltas that fail to deliver (network loss) are buffered in IndexedDB via `idb-keyval` and replayed with jittered backoff once the connection is restored. The document remains fully editable offline.

### Sidebar

- Workspace switcher (all your workspaces)
- Folder tree with expand/collapse
- Document list per folder
- "New Document" button per folder
- User profile footer with logout

---

## 8. Environment Variables

Copy `.env.example` to `.env` (root):

```bash
# App
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=changeme-at-least-32-chars-secret-key
JWT_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://docsvault:docsvault@localhost:5432/docsvault

# Redis
REDIS_URL=redis://localhost:6379

# Meilisearch
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=masterKey

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio
MINIO_BUCKET=docsvault
MINIO_PUBLIC_URL=http://localhost:9000

# CORS
CORS_ORIGIN=http://localhost:3000

# Next.js public
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 9. Quick Start

### Prerequisites

- **Docker & Docker Compose** v2+
- **Node.js** 20+ and **pnpm** 9+

### Step 1 — Start all infrastructure

```bash
docker compose up postgres redis meilisearch minio -d
docker compose ps   # wait for all containers to be healthy/running
```

### Step 2 — Install dependencies

```bash
pnpm install
```

### Step 3 — Run migrations and seed

```bash
pnpm --filter @docsvault/database db:generate
pnpm --filter @docsvault/database db:migrate
pnpm --filter @docsvault/database db:seed
```

The seed creates:

- Workspace: "Product Team" (`slug: product-team`)
- Owner account: `alice@example.com` / `password123` (role: OWNER)
- Editor account: `bob@example.com` / `password123` (role: EDITOR)
- Two folders: "Engineering", "Design"
- Three sample documents with content

### Step 4 — Start all services

```bash
pnpm dev
```

- API + WebSocket: http://localhost:4000
- Swagger UI: http://localhost:4000/api/docs
- Web app: http://localhost:3000
- MinIO Console: http://localhost:9001 (user: `minio` / `minio`)
- Meilisearch: http://localhost:7700

### Step 5 — Create Meilisearch index (first run)

The API automatically calls `ensureIndex()` on startup, which creates the `documents` index with `title` and `textContent` as searchable attributes. No manual action needed.

---

## 10. Full Docker Deployment

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env — set strong JWT_SECRET, MINIO credentials, etc.

# 2. Build and start all containers
docker compose up -d --build

# 3. Run migrations
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

The `docker-compose.yml` includes: `postgres`, `redis`, `meilisearch`, `minio`, `api`, `web`.

---

## 11. Key Design Decisions

### Yjs CRDT for conflict-free editing

Yjs uses Conflict-free Replicated Data Types (CRDTs) — concurrent edits from multiple users are **automatically merged** without conflicts. No operational transformation (OT) algorithm or locking needed. Tiptap's `@tiptap/extension-collaboration` provides first-class Yjs integration.

### In-memory Yjs docs + PostgreSQL persistence

Each `Y.Doc` lives in a server-side `Map<docId, Y.Doc>`. On every `sync:update` event, the full serialized Yjs state (`Y.encodeStateAsUpdate(ydoc)`) is written to the `yjsState Bytes` column in PostgreSQL. On cold reconnect, the persisted state is applied to a fresh `Y.Doc` using `Y.applyUpdate()`.

This hybrid approach means:

- **Low latency** — updates are applied to in-memory docs instantly
- **Durability** — state survives server restarts
- **Simplicity** — no Redis pub/sub needed for single-instance deployments

### Meilisearch for full-text search

When a document's `textContent` is updated via `PATCH /v1/documents/:id`, the API calls `searchService.indexDocument()` which upserts the document into Meilisearch. The `documents` index is configured with `title` and `textContent` as searchable fields and `workspaceId` as a filterable attribute — so search results are always scoped to the workspace the user has access to.

### MinIO pre-signed URLs (no server-side uploads)

Attachments never pass through the API server. The client gets a pre-signed `PUT` URL from MinIO (valid for 15 minutes), uploads directly from the browser, then calls the confirm endpoint. This eliminates file upload memory pressure on the API, supports files up to 50 MB, and keeps the API stateless.

### Optimistic UI + IndexedDB offline queue

All metadata mutations (title, emoji, folder move, comment post) use TanStack Query's **optimistic update** pattern:

1. `onMutate` — immediately writes the new value into the query cache
2. On success — server response reconciles the cache
3. `onError` — rolls back to the snapshot taken in `onMutate`

This makes the UI feel instant even on slow connections.

For the Yjs collaboration layer, outbound `sync:update` messages that cannot be delivered (WebSocket disconnected) are serialised and stored in **IndexedDB** (`idb-keyval`). A reconnection listener replays the queue in order once the socket reconnects:

```ts
socket.on("connect", async () => {
  const pending = await getPendingUpdates(docId); // read from IndexedDB
  for (const update of pending) {
    socket.emit("sync:update", { docId, update });
  }
  await clearPendingUpdates(docId);
});
```

Documents remain **fully editable offline** — Yjs applies changes locally, and CRDT merging guarantees correct reconciliation when the queue flushes.

### `@Global()` infrastructure modules

`DatabaseModule` and `RedisModule` are decorated with `@Global()` so the Prisma client and Redis client are injected as singletons app-wide without needing to import the modules in every feature module. This prevents multiple connection pool instances.

### `APP_GUARD` global JWT guard + `@Public()` opt-out

The `JwtAuthGuard` is registered globally via `APP_GUARD`. Routes that need to be public (register, login, health) are decorated with `@Public()`, which sets a metadata key that the guard checks before verifying the token. This inverts the typical pattern ("secure by default, opt out for public routes") for better security hygiene.

---

## 12. Project Structure

```
docsvault/
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── auth/
│   │       │   ├── auth.controller.ts    ← register, login, me, update profile
│   │       │   ├── auth.service.ts       ← bcryptjs + jsonwebtoken
│   │       │   ├── guards/
│   │       │   │   └── jwt.guard.ts      ← JwtAuthGuard + @Public() decorator
│   │       │   └── decorators/
│   │       │       └── current-user.ts   ← @CurrentUser() param decorator
│   │       ├── workspaces/               ← CRUD + member management + RBAC checks
│   │       ├── folders/                  ← Nested folder tree CRUD
│   │       ├── documents/                ← Document CRUD + Yjs state + version history
│   │       ├── collab/
│   │       │   └── collab.gateway.ts     ← Socket.IO /collab namespace + Yjs sync
│   │       ├── search/                   ← Meilisearch index + search endpoint
│   │       ├── attachments/              ← MinIO pre-signed URLs + confirm flow
│   │       ├── comments/                 ← Document comments + resolve
│   │       ├── activity/                 ← Activity feed per workspace / document
│   │       ├── database/                 ← @Global() PrismaClient module
│   │       ├── redis/                    ← @Global() ioredis module
│   │       ├── config/                   ← @nestjs/config typed app config
│   │       ├── health/                   ← GET /health
│   │       ├── app.module.ts
│   │       └── main.ts                   ← NestFactory, URI versioning, Swagger, port 4000
│   └── web/
│       ├── app/
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   └── register/page.tsx
│       │   └── (app)/
│       │       ├── layout.tsx            ← Auth guard + sidebar layout
│       │       ├── dashboard/page.tsx    ← Workspace grid
│       │       ├── workspace/[id]/
│       │       │   ├── page.tsx          ← Workspace overview
│       │       │   ├── doc/[docId]/page.tsx  ← Document editor
│       │       │   └── settings/page.tsx     ← Workspace settings
│       │       └── search/page.tsx       ← Meilisearch search UI
│       ├── components/
│       │   ├── editor/
│       │   │   └── tiptap-editor.tsx     ← Tiptap + Collaboration + Toolbar
│       │   └── sidebar/
│       │       └── workspace-sidebar.tsx ← Workspace + folder + doc tree
│       ├── lib/
│       │   ├── api-client.ts             ← Axios with auto Bearer + 401 redirect
│       │   ├── api/                      ← auth, workspaces, documents, folders, search, comments
│       │   ├── collab/
│       │   │   └── collab-provider.ts    ← Socket.IO Yjs provider
│       │   └── providers/
│       │       ├── auth-provider.tsx     ← AuthContext (login/register/logout)
│       │       └── query-provider.tsx    ← TanStack Query QueryClientProvider
│       └── package.json
├── packages/
│   ├── database/
│   │   └── prisma/
│   │       ├── schema.prisma             ← 12 models, WorkspaceRole + DocumentStatus enums
│   │       └── seed.ts                   ← alice + bob + "product-team" workspace
│   └── shared/
│       └── src/
│           ├── types.ts                  ← WorkspaceRole, DocumentStatus enums, JwtPayload
│           ├── validators.ts             ← Zod schemas
│           └── index.ts
├── docker-compose.yml                    ← postgres, redis, meilisearch, minio
├── turbo.json
├── pnpm-workspace.yaml
└── .env.example
```
