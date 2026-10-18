# TODOS

## Design
### Generate Step 0.5 visual mockups (designer credentials needed)

**What:** Run the 4 saved briefs (`/tmp/sahara-briefs/` — home, product, cart, admin) through the gstack designer to produce reviewed mockups and an Approved Mockups table in the plan.

**Why:** Text specs were approved without pixels; mockups are the implementer's visual contract for the Apple-HIG layer.

**Context:** Briefs already written for `$D generate`; generation failed only on missing OpenAI key. Add key via `~/.gstack/openai.json` or `OPENAI_API_KEY`, then run the 4 generates, `$D check` each, and record approvals in the plan.

**Effort:** S
**Priority:** P1
**Depends on:** OpenAI API key

### Run /design-consultation for a real DESIGN.md (post-gate)

**What:** Formalize the plan's §E token system into a proper DESIGN.md the plan calibrates against.

**Why:** No DESIGN.md exists; the plan currently self-certifies its own tokens (flagged debt from Pass 5).

**Context:** §E in `docs/designs/sahara-single-store-wedge.md` is the interim source of truth; the consultation would bless or replace it. Deliberately scheduled after first orders — no polishing tokens for an unvalidated product.

**Effort:** M
**Priority:** P3
**Depends on:** Seller gate met + first real orders

## Infrastructure
### S3-compatible storage provider

**What:** Implement an S3/R2-compatible StorageProvider behind the existing interface, replacing LocalDiskProvider.

**Why:** Local disk only works on one machine; any real deploy or second device needs shared object storage.

**Context:** The StorageProvider interface ships in v1 with LocalDiskProvider only (review decision D20 kept v1 local). When a deploy target is chosen post-gate, add the S3 class + env vars — call sites never change by design. Start here: `lib/storage.ts`, then env config.

**Effort:** S
**Priority:** P2
**Depends on:** Deploy target decision (post-seller-gate)

## Review
### Full-text search upgrade (Postgres tsvector)

**What:** Replace ILIKE substring search with indexed tsvector search + ranking.

**Why:** Substring search was deliberately deferred in v1 (D5); ranking/typo tolerance only matters at catalog scale.

**Context:** Already on Postgres from day 1 (D7), so this is a query rewrite + GIN index, not a migration. Measure search misses/latency before building. Start here: `lib/repos` search query + migration for the index.

**Effort:** S
**Priority:** P3
**Depends on:** Catalog-growth evidence (single store today)

### Payment integration (Stripe / COD)

**What:** Move checkout from "order request" to real payment capture (Stripe hosted Checkout or cash-on-delivery marking).

**Why:** Revenue cannot flow without it; deliberately out of MVP scope (office-hours premises + D16).

**Context:** Snapshot pricing/discount model (D11) is payment-ready. Evaluate after the seller gate and a few real order-requests: Stripe hosted Checkout is the boring default. Start here: `lib/payments.ts` behind an interface, like storage.

**Effort:** M
**Priority:** P1
**Depends on:** Seller gate met (office-hours assignment), v1 order flow validated, deploy target

## Completed
