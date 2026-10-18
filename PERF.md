# Performance ledger — Sahara

## Baseline

Measured by Lighthouse mobile (`--only-categories=performance`) against a production build,
simulated slow 4G, 4x CPU. Machine noise ±0.2s LCP / ±300ms TBT; deltas smaller than that
are not wins.

| Route | Score | LCP (s) | CLS | TBT (ms) | Date |
|---|---|---|---|---|---|
| / | 0.63 | 3.8 | 0 | 1460 | 2026-10-18 |
| /product/[slug] | TBD | TBD | TBD | TBD | 2026-10-18 |

## Kept

- (none yet)

## Reverted

- (none yet)

## After this pass

- (pending measurement)

## Open, not yet attempted

- Reserve skeleton heights to reduce CLS.
- Lazy-load heavy panels.
- Virtualize genuinely long lists with TanStack Virtual.
- Cache external fetches with TTL + LRU.
