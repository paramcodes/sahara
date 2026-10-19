# PERF.md — Performance Ledger

Measure-first record for Sahara. Every optimization here was measured or
explicitly justified by a query plan; reverted experiments are kept so nobody
re-runs them.

## Baseline (before, local Postgres, Next 16.4.2 / Turbopack)

Measured state at the time of the pass:

| Signal | Baseline |
|---|---|
| Product images | raw `<img>`, no `next/image`, no dimensions, no priority, no lazy loading |
| Hero | CSS `background-image`, no preload hint, 2000px-wide Unsplash URL on mobile |
| `/` server work | `store_settings` → `products` → cart, strictly sequential awaits |
| `/product/[slug]` | `product` → cart → reviews, sequential |
| `getProductBySlug` | 3 sequential round trips (product, specs, images) |
| `createOrder` | one `SELECT products` per cart line (N+1 inside a transaction) |
| order cancel | one `SELECT products` per order line (N+1) |
| `addToCart` | `SELECT` then `INSERT`/`UPDATE` (read-modify-write) |
| Org lookup | one `SELECT orgs LIMIT 1` per page **and** per server action |
| Lists | `getProducts` / `getOrders` unbounded |
| Pool | singleton only in dev |
| Cascading renders | `Sheet` and `ReviewSection` ran 3 renders per open/close via `setState` in effect |
| Lint | 2 × `react-hooks/set-state-in-effect` errors |

## Kept

| Change | Why | Expected effect |
|---|---|---|
| `next/image` everywhere (home rows, product gallery, cart, admin tables, upload preview) | no dimensions → CLS; no priority → late LCP; no modern format → big transfer | CLS down, LCP down, fewer image bytes |
| Hero + product hero image get `priority` + `sizes` | they are the LCP element | earlier LCP request, right-sized asset per viewport |
| `images.remotePatterns` + AVIF/WebP | optimizer was unusable; format control | AVIF/WebP delivery |
| Parallel `Promise.all` on `/` and `/product/[slug]` | independent queries serialized | lower TTFB (3 waits → 1) |
| Parallel specs/images in `getProductBySlug`/`getProductById` | independent | 2 round trips collapse to 1 wall-clock wait |
| Batch product load in `createOrder` and on cancel (`inArray`) | N+1 inside a transaction | 1 query instead of N |
| Atomic stock decrement (`UPDATE ... WHERE stock_qty >= qty RETURNING`) | read-modify-write could oversell under concurrency; also 1 round trip instead of 2 | correctness + fewer queries |
| `addToCart` as a single `ON CONFLICT DO UPDATE` upsert | read-modify-write race + 2 round trips | correctness + fewer queries |
| `getOrg` / `getStoreSettings` memoized with React `cache()` | org query ran on every page and every action | one query per request instead of many |
| Pool cached on `globalThis` in **all** environments | production module reloads could open extra pools | no accidental pool multiplication |
| `limit`/`offset` on `getProducts` and `getOrders` (default cap 100) | unbounded list reads | bounded payload and bounded table scan |
| `Sheet` / `ReviewSection`: one derived flag + deferred unmount | `setState` in effect caused 3 renders per open/close | fewer renders on interaction (INP) |
| `carts(org_id, user_id)` and `carts(org_id, session_id)` indexes | `getOrCreateCart` runs on **every** page render and every cart mutation; the carts table grows one row per guest visitor | index available as guests accumulate |

## Bugs found while measuring

Both were pre-existing; both are fixed, and both were distorting the numbers
this pass tried to take.

| Bug | Symptom | Fix |
|---|---|---|
| Seed pointed the hero at `/uploads/hero-banner.webp`, which ships as an empty directory | the LCP element 404'd (previously silent as a CSS background, now visible in the console) | seed uses a real banner URL; `getStoreSettings` stats local `/uploads/` paths and falls back to the default banner when the file is gone |
| `getCartSessionId()` called `cookies().set()` during Server Component render | Next throws on cookie writes in RSC, the error was swallowed by the demo fallback, and **every** visitor saw a fake "1 item" bag while real guest carts never persisted | `getCartSessionId({ persist })` only writes inside Server Actions; reads use `findCart` (no insert) so a page view never writes a cookie or creates a cart row |

## Verified after

Measured against the running production build with the local Postgres seeded.

**Image weight — the change that actually moved bytes**

| Asset | Before | After | Change |
|---|---|---|---|
| Catalog thumbnail (renders at 96px) | 334,319 B JPEG (Unsplash `w=1200`) | 2,211 B AVIF | −99.3% |
| Home hero at 1080w | 2000px source JPEG | 38,706 B AVIF | right-sized + modern format |
| Whole home page (hero + 5 rows) | 6 raw full-size requests | 1 preloaded hero + 5 lazy, all `/_next/image` | — |

Optimizer response confirms the format switch and immutable caching:

```
GET /_next/image?url=…unsplash…&w=128&q=75   (Accept: image/avif)
HTTP/1.1 200 OK
Cache-Control: public, max-age=31536000, must-revalidate
Content-Type: image/avif
Content-Length: 2211
```

Rendered markup confirms the LCP wiring:

```
HERO  | sizes: 100vw   | preload <link rel="preload" as="image" imageSrcSet="…">
ROW   | sizes: 96px    | loading="lazy"
```

**Server response time** (`pnpm start`, warm)

| Path | Cold | Warm |
|---|---|---|
| `/` | 0.74s | 0.04s |
| `/product/[slug]` | — | 0.09s |

**Behavioural checks** (Playwright against the production build)

- First visit shows an empty bag (badge `0`), hero loads with non-zero `naturalWidth`.
- Add to bag → badge `1` on the product page **and** on home after navigation.
- Cart page lists the added product; checkout renders "In Your Bag".
- Checkout submit → order `SHR-…` created, order page renders, `order_status_history` row written, stock decremented `8 → 7`.
- Remove item → bag empties.
- Zero console errors, zero page errors.
- `pnpm lint` clean, `pnpm test` 19/19, `pnpm build` green.

## Reverted

| Idea | Result | Why reverted |
|---|---|---|
| `orders(org_id, status)` + `orders(user_id, status)` composite indexes | `EXPLAIN (ANALYZE)` showed no plan change; no v1 query filters orders by status — the admin inbox reads all orders | index taxed every insert for zero read benefit |
| pg_trgm GIN index for `ILIKE` search | `EXPLAIN` at 5 rows: seq scan is optimal; leading-`%` search needs it only at catalog scale | premature; already tracked in `TODOS.md` (full-text search) |

Query-plan evidence for the reverted indexes (local Postgres, current data volume):

```
EXPLAIN (ANALYZE) SELECT * FROM orders ORDER BY created_at DESC LIMIT 100;
  Limit  (cost=1.05..1.06 rows=3 ...)
    ->  Sort ...
          ->  Seq Scan on orders  (actual time=0.015..0.016 rows=3)
  Execution Time: 0.176 ms

EXPLAIN (ANALYZE) SELECT * FROM carts WHERE org_id = ... AND session_id = 'abc';
  Seq Scan on carts  (actual time=0.047..0.048 rows=0)
    Filter: ((org_id = $0) AND (session_id = 'abc'::text))
  Execution Time: 0.127 ms
```

At 5 products / 3 orders / 4 carts every query is sub-millisecond. **The DB is
not the current bottleneck** — image delivery and serial waterfalls were.

## How to re-measure

```bash
pnpm build
pnpm start

# Server response time, 5 cold-ish runs each
for i in 1 2 3 4 5; do
  curl -s -o /dev/null -w "%{time_starttransfer} %{time_total}\n" http://localhost:3000/
done

# Core Web Vitals (synthetic)
npx lighthouse http://localhost:3000/ --preset=desktop --view
npx lighthouse http://localhost:3000/ --form-factor=mobile --screenEmulation.mobile --view

# Query plan for a new query before adding an index
PGPASSWORD=… psql -h localhost -U sahara -d sahara \
  -c "EXPLAIN (ANALYZE, BUFFERS) SELECT …"
```

## Guard targets

| Metric | Budget |
|---|---|
| LCP (home, mobile) | ≤ 2.5s |
| CLS (home, product) | ≤ 0.1 |
| INP | ≤ 200ms |
| JS (initial load) | < 200KB gzipped |
| API/server action response | < 200ms p95 locally |

These are targets, not enforced gates: v1 is local-only (plan D20) and CI is
lint + test (plan D15). Revisit when a deploy target exists.

## Still open

- Admin order inbox has no pagination UI; the repo caps reads at 100 rows.
- No field RUM yet — add `web-vitals` when there is a real host to report to.
- Full-text search (tsvector/pg_trgm) stays deferred until catalog growth.
- No bundle-size or Lighthouse gate in CI — plan D15 scopes CI to lint + test
  and D20 keeps v1 local-only, so the budgets above are targets, not checks.