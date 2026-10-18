# Features & User Flows — Sahara

---

## 1. Storefront Browsing & Search

- **Hero Landing**: Full-bleed lifestyle banner showcasing brand tagline, headline, and direct anchor link to `#catalog`.
- **Airy Product Rows**: Products are displayed in clean rows rather than a cluttered card mosaic, showing high-res thumbnails, titles, prices, active discounts, and stock status.
- **Search**: Fast case-insensitive substring search (`ILIKE`) across product names and descriptions.

---

## 2. Product Detail & Specifications

- **Gallery**: High-resolution photography display.
- **Dynamic Pricing**: Shows active discounts (percentage or fixed amount), with original crossed-out prices.
- **Technical Specs**: Clean hairline key/value table for materials, dimensions, care instructions, and provenance.
- **Stock Warnings**: Displays "In Stock", "Only X left", or "Made to Order".
- **Reviews**: Verified customer ratings (1–5 stars) and feedback with an inline review submission form.

---

## 3. Shopping Bag & Order Request Checkout

- **Shopping Bag**: Allows incrementing, decrementing, and removing items with immediate subtotal and discount calculations.
- **Order Request**:
  - Customers provide Full Name, Email, Phone Number, and Delivery Address.
  - **No Upfront Payment Required**: Customers place an "order request" and pay cash or digital transfer upon delivery.
  - Reassurance messaging highlights: *"Pay on delivery — confirm by message"*.

---

## 4. Real-time Order Tracking

- Once placed, buyers receive an order number (e.g. `SHR-123456-789`).
- A status stepper visualizes progress:
  `Request Placed` ➔ `Confirmed by Merchant` ➔ `Fulfilled / Delivered`.
- Full immutable receipt showing items ordered, unit price snapshots, and delivery destination.

---

## 5. Merchant Administration Workspace

- **Inbox-First Landing (`/admin`)**: Prioritizes new incoming orders and immediate fulfillment actions.
- **Order Actions**: Confirm, Fulfill (Mark Delivered), or Cancel orders with a single click.
- **Product Management (`/admin/products`)**:
  - Quick toggle to activate/pause products on the live catalog.
  - Delete obsolete products.
- **Add Product Form (`/admin/products/new`)**:
  - Photo-first layout: Drag & drop upload or paste image URL.
  - Title, price in dollars, optional stock quantity, and dynamic key/value specifications.
  - Publishes live to the storefront in under 5 minutes.
- **Promotions Engine (`/admin/discounts`)**: Configure percentage or fixed-amount discounts across catalog items.
