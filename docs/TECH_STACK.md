# Tech Stack — Sahara

Sahara is built on modern, battle-tested primitives chosen for developer speed, type safety, and longevity.

---

## 1. Core Framework & Language

- **Next.js 16 (App Router)**:
  - React Server Components (RSC) for fast, SEO-optimized data fetching without client-side waterfall requests.
  - Server Actions with Zod validation for mutations (Cart, Checkout, Admin Products, Reviews).
  - Pinned to stable `16.4.2`.
- **TypeScript 5**: Strict typing across database schemas, repository functions, server actions, and UI component props.
- **Node.js**: Runs seamlessly on Node `v20+` and `v26+`.

---

## 2. Database & Persistence

- **PostgreSQL 16**:
  - Hosted locally via Docker Compose (`docker-compose.yml`) for reproducible local development and CI.
  - Native support for relational constraints, cascading deletes, transactions, and future full-text indexing.
- **Drizzle ORM (`drizzle-orm` + `drizzle-kit`)**:
  - Type-safe query builder with direct SQL control and zero runtime overhead.
  - Schema defined centrally in `lib/db/schema.ts`.
  - Migrations and schema sync managed via `pnpm drizzle-kit push`.

---

## 3. Authentication & Authorization

- **Better Auth (1.7.x)**:
  - Credentials provider with email and password hashing.
  - Direct integration with Drizzle ORM PostgreSQL adapter.
  - Role-based access control (`user` vs `admin`) with DB-backed session tokens.
  - Server-side helpers: `requireSession()` and `requireAdmin()`.

---

## 4. Design System & Styling

- **Tailwind CSS v4**: Utility-first CSS engine.
- **Custom Apple HIG Component Layer**:
  - Custom token system in `app/globals.css`: `-apple-system` SF font stacks, frosted backdrop blur (`frosted-nav`), hairline borders (`border-hairline`), and warm neutral palette (`#f5f5f7`).
  - Nine dependency-free primitives in `components/ui/**` (Button, Badge, Stepper, Switch, Segmented, Skeleton, EmptyState, Toast, Sheet).

---

## 5. Testing & Quality Assurance

- **Vitest**: Blazing-fast unit and integration testing engine.
- Test coverage for:
  - Pricing engine (`tests/pricing.test.ts`)
  - Order state machine (`tests/orders.test.ts`)
  - Storage provider file constraints (`tests/storage.test.ts`)
