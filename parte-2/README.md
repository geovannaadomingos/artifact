# Part 2 – Practical Application (Next.js 15 & tRPC)

This directory contains the practical implementation of the technical challenge: a full-stack Task Management application built with **Next.js 15 (App Router)**, **tRPC**, **TypeScript**, **Zod**, and **Tailwind CSS**.

---

## 🏗️ Application Architecture

The application is engineered following strict separation of concerns into distinct architectural tiers:

```text
src/
├── app/
│   ├── api/trpc/[trpc]/route.ts  # tRPC Fetch HTTP adapter for Next.js App Router
│   ├── layout.tsx                # Root layout with TRPCProvider and global navigation
│   └── page.tsx                  # Server Component for task listing with SSR prefetching
│
├── components/
│   ├── tasks/
│   │   ├── task-card.tsx         # Individual task display card with action controls
│   │   ├── task-form.tsx         # Reusable form component for creation and editing
│   │   └── task-list.tsx         # Client Component with infinite scroll, hydration, and deletion
│   └── ui/
│       └── feedback-alert.tsx    # Reusable visual alert (success, error, and info)
│
├── server/
│   ├── errors/
│   │   └── task.errors.ts        # Semantic domain errors (TaskNotFoundError, TaskValidationError)
│   ├── repositories/
│   │   └── task.repository.ts    # In-memory repository using Map stored in globalThis
│   ├── schemas/
│   │   └── task.schema.ts        # Strict Zod validation schemas and inferred types
│   ├── services/
│   │   └── task.service.ts       # Domain business rules and validation logic
│   └── trpc/
│       ├── init.ts               # tRPC instance initialization and Zod error formatting
│       ├── router.ts             # Central root router aggregation (AppRouter)
│       └── routers/
│           └── task.router.ts    # CRUD tRPC procedures (list, getAll, getById, create, update, delete)
│
└── trpc/
    ├── client.tsx                # Client-side tRPC React client and TRPCProvider
    ├── query-client.ts           # QueryClient factory configured for SSR and hydration
    └── server.tsx                # Server-side caller and hydration helpers for Server Components (RSC)
```

---

## ⚙️ Architectural Decisions

### 1. Layered Separation (Router → Service → Repository)
* **Router (`task.router.ts`):** Serves solely as the transport and I/O tier. Validates incoming requests against Zod schemas and translates domain exceptions into standard semantic `TRPCError` codes (`NOT_FOUND`, `BAD_REQUEST`, `INTERNAL_SERVER_ERROR`).
* **Service (`task.service.ts`):** Centralizes all domain business rules, string sanitization, and missing-record handling, decoupling core logic from transport protocols. Supports dependency injection for seamless testing.
* **Repository (`task.repository.ts`):** Isolates data storage and retrieval. Utilizes an internal `Map<string, Task>` anchored to `globalThis`, preventing state loss during Next.js Hot Module Replacement (HMR) reloads.

### 2. Validation & Security with Zod
* `id`: Universal unique identifier in RFC 4122 UUID v4 format, generated and controlled exclusively by the backend.
* `titulo`: Mandatory string, sanitized with `.trim()`, rejecting submissions that contain only whitespace.
* `descricao`: Optional string (up to 500 characters).
* `dataCriacao`: Numeric timestamp in milliseconds assigned by the backend at insertion time.
* **Strict Validation:** Input schemas enforce `.strict()` to reject any payload attempting to inject or overwrite `id` or `dataCriacao`.

### 3. Rendering: Server Components (SSR) & Client Components
* **SSR Listing:** The home page (`src/app/page.tsx`) is an asynchronous Server Component that invokes `trpc.task.list.prefetchInfinite(...)` directly within the server runtime using an internal caller (zero network loopback latency).
* **Hydration:** `<HydrateClient>` embeds the prefetched data cache into the initial HTML response, delivering instant First Contentful Paint (FCP) and optimal SEO.
* **Interactivity:** Interactive elements (`TaskList`, `TaskForm`, `TaskCard`) are Client Components (`"use client"`), handling mutations, deletions, live validation, and on-demand pagination (*Infinite Scroll* via `IntersectionObserver`).

---

## 🧪 Automated Testing

The project includes a comprehensive suite of unit and integration tests using the native Node.js test runner (`node:test` and `node:assert/strict`):

* **17 tests implemented**, covering 100% of positive and negative scenarios across all CRUD operations:
  * Task creation with and without description;
  * Validation rejection for empty titles, whitespace-only titles, and titles exceeding character limits;
  * Ordered retrieval and cursor-based pagination;
  * Single-record retrieval by valid ID and semantic not-found errors;
  * Record updates preserving original ID and creation timestamp;
  * Record deletion with confirmation and not-found error handling.

To run the test suite:

```bash
npm run test
```

---

## 🚀 Running the Application

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build

```bash
npm run build
npm run start
```
