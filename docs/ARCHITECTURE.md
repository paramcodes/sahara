# Architecture Overview — Sahara

Sahara is a single-brand, Apple-HIG inspired e-commerce storefront engineered specifically for independent creators and merchants migrating from Instagram DMs and chat threads into an owned digital storefront.

---

## 1. Core Architectural Principles

1. **Single-Store Wedge, Multi-Tenant Foundation**
   - **Wedge v1**: Operates as a focused single-tenant storefront for one brand (`org_id`), eliminating marketplace discovery overhead.
   - **Forward Compatibility**: Every database table carries `org_id` from migration #1. Transitioning to a multi-merchant marketplace is an additive evolution, never a database rewrite.

2. **Money as Integer Cents**
   - Floating-point arithmetic is forbidden for currencies to eliminate rounding drift (`0.1 + 0.2 !== 0.3`).
   - Prices, discounts, and order totals are stored strictly as integer cents (e.g., `$42.00` = `4200`).

3. **Immutable Historical Price Snapshots**
   - When an order request is placed, the exact base price, per-unit discount, and net price are copied permanently into `order_items`.
   - Modifying or deleting a product price later never retroactively corrupts past financial records or customer order histories.

4. **Order Status State Machine**
   - Status transitions follow a strict directed graph:
     `placed` → `confirmed` → `fulfilled` | `cancelled`
   - Invalid or backward transitions (e.g., `fulfilled` → `placed`) are rejected at the repository layer.
   - Every transition writes an immutable audit record to `order_status_history`.

5. **Single Pricing Engine (`lib/pricing.ts`)**
   - Cart calculations, checkout order totals, and merchant preview screens share one unified pricing engine.
   - Discounts support percentage (`percent`), fixed cents (`fixed`), and promotional date windows (`startsAt` / `endsAt`).

---

## 2. Request & Data Flow

```
Buyer Browser / Admin Browser
             │
             ▼
  Next.js 16 (App Router)
  ├── Server Components (RSC) -> Direct DB queries via Drizzle ORM
  ├── Server Actions          -> Zod validated mutations (cart, orders, admin CRUD)
  └── API Routes              -> Better Auth (/api/auth) & File Uploads (/api/upload)
             │
             ▼
      PostgreSQL 16 (Docker)
```

---

## 3. Security & Validation Architecture

- **Role Protection**: User registration via Better Auth has `input: false` on `role` and `orgId`. Administrative accounts can only be provisioned server-side via seed or verified internal operations.
- **Upload Hardening**: Storage (`lib/storage.ts`) validates both HTTP MIME types and binary magic-byte signatures (JPEG, PNG, WebP) while deriving file extensions strictly from a trusted mapping, neutralizing Stored XSS and extension spoofing.
- **Cart Scoping**: Cart mutations (`lib/actions/cart.ts`) enforce boundary checks with Zod and scope database updates strictly to the active caller's session cart to prevent IDOR tampering.
- **High-Entropy Identifiers**: Order numbers incorporate random hexadecimal tokens to eliminate sequential enumeration.
- **Fail-Fast Secrets**: In production environments, missing critical secrets (e.g. `BETTER_AUTH_SECRET`) fail immediately at startup rather than silently falling back to insecure defaults.

## 4. State ownership

Three owners, no overlaps:
- **Store**: playback/UI ephemera (none in this app beyond cart badge).
- **Query**: server state + library (products, cart, orders via Drizzle/server actions).
- **Component**: local UI state (search input, sheet open, etc.).

## 5. Repository seam

Persisted domains (products, orders, cart, storage) go through repository modules in `lib/repos/*`
and `lib/storage.ts`. Ad-hoc storage is not allowed; localStorage adapter (if added) must be
Zod-validated and versioned.
