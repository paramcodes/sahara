---
name: verify-sahara
description: Drive the Sahara storefront with Playwright to prove features work.
---

# Verify Sahara

Run `pnpm dev` (or use webServer). Base URL http://localhost:3000.

## Recipes

- Home renders heading "Everyday Essentials".
- Search: submit search form, URL contains `?q=`.
- Product detail: click product link, URL `/product/...`.
- Reduced motion: emulate reduced motion, content visible.
- Persistence: reload, content visible.

See features/*.md.
