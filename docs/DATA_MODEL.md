# Data Model & Schema — Sahara

The relational schema is defined in `lib/db/schema.ts` using Drizzle ORM pg-core.

---

## 1. Table Summaries

### `orgs`
Represents the merchant organization.
- `id` (text, PK)
- `name` (text): Brand name (e.g., "Sahara Atelier")
- `slug` (text, unique): URL slug
- `created_at`, `updated_at` (timestamp with timezone)

### `users`
Authenticated users (both buyers and merchants).
- `id` (text, PK)
- `name` (text)
- `email` (text, unique)
- `role` (text): `'user'` or `'admin'`
- `org_id` (text, FK -> orgs.id)

### `products`
Storefront product catalog.
- `id` (text, PK)
- `org_id` (text, FK -> orgs.id)
- `name` (text)
- `slug` (text): Unique within organization
- `description` (text)
- `price_cents` (integer): Base item price in cents
- `discount_type` (text): `'none'` | `'percent'` | `'fixed'`
- `discount_value` (integer): Percent or fixed cents
- `discount_starts_at`, `discount_ends_at` (timestamp, optional window)
- `stock_qty` (integer, nullable): `NULL` = unlimited/made-to-order; integer = tracked inventory
- `banner_path` (text): Image path or URL
- `active` (boolean): Whether visible on storefront
- `featured` (boolean): Prioritized in catalog sort

### `product_specs`
Key/value structured technical details displayed on product pages.
- `id` (text, PK)
- `product_id` (text, FK -> products.id, cascade)
- `key` (text): e.g. "Material", "Dimensions", "Origin"
- `value` (text): e.g. "Stoneware Ceramic"
- `display_order` (integer)

### `product_images`
Gallery photos for a product.
- `id` (text, PK)
- `product_id` (text, FK -> products.id, cascade)
- `image_path` (text)
- `display_order` (integer)
- `alt_text` (text)

### `carts` & `cart_items`
Shopping cart state for signed-in buyers or anonymous guest sessions.
- `carts`: `id`, `org_id`, `user_id` (optional), `session_id` (optional)
- `cart_items`: `id`, `cart_id`, `product_id`, `qty`

### `orders` & `order_items`
Order requests placed by customers.
- `orders`:
  - `id` (text, PK)
  - `org_id` (text, FK -> orgs.id)
  - `order_number` (text, unique): Human readable (e.g. `SHR-123456-789`)
  - `customer_name`, `customer_email`, `customer_phone`, `customer_address`, `notes`
  - `total_cents`, `discount_cents`, `final_cents`
  - `status`: `'placed'` | `'confirmed'` | `'fulfilled'` | `'cancelled'`
- `order_items`:
  - `id` (text, PK)
  - `order_id` (text, FK -> orders.id)
  - `product_id` (text, FK -> products.id)
  - `product_name` (text): Immutable snapshot of name
  - `price_cents` (integer): Snapshot of base unit price
  - `discount_cents` (integer): Snapshot of discount per unit
  - `final_price_cents` (integer): Snapshot of net unit price
  - `qty` (integer)

### `order_status_history`
Audit ledger tracking every order status mutation.
- `id` (text, PK)
- `order_id` (text, FK -> orders.id)
- `status` (text): Target status
- `actor_id` (text, nullable)
- `actor_role` (text): `'admin'` | `'buyer'` | `'system'` | `'guest'`
- `notes` (text): Reason or description
- `created_at` (timestamp)

### `reviews`
Verified buyer customer ratings and reviews.
- `id` (text, PK)
- `product_id` (text, FK -> products.id)
- `author_name` (text)
- `rating` (integer): 1 through 5
- `comment` (text)
- `approved` (boolean)
