# Sahara — Single-Brand E-Commerce Storefront

<p align="center">
  <img src="public/docs/screenshots/sahara-walkthrough.gif" alt="Sahara Storefront & Merchant Walkthrough" width="850" />
</p>

<p align="center">
  <strong>An Apple-HIG inspired digital storefront engineered for independent brands and creators migrating from Instagram DMs and chat threads into an owned, refined shopping experience.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.4.2-black?style=flat&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?style=flat" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/Better_Auth-1.7-6366f1?style=flat" alt="Better Auth" />
  <img src="https://img.shields.io/badge/Vitest-5.0-729B1B?style=flat&logo=vitest" alt="Vitest" />
</p>

---

## 📽️ Live Walkthrough & Video Demonstration

* **Animated Walkthrough**: Included above (`public/docs/screenshots/sahara-walkthrough.gif`)
* **High-Definition Video Demo**: [`public/docs/screenshots/sahara-demo.mp4`](public/docs/screenshots/sahara-demo.mp4) (Download or open to view the complete end-to-end buyer and merchant flow in 1080p).

---

## 📸 Visual Showcase

| 1. Full-Bleed Hero & Collection | 2. Product Detail & Technical Specs |
|:---:|:---:|
| <img src="public/docs/screenshots/01-home.png" width="420" alt="Homepage" /> | <img src="public/docs/screenshots/02-product.png" width="420" alt="Product Detail" /> |
| **3. Shopping Bag** | **4. Request-Order Checkout** |
| <img src="public/docs/screenshots/03-cart.png" width="420" alt="Shopping Bag" /> | <img src="public/docs/screenshots/04-checkout.png" width="420" alt="Checkout" /> |
| **5. Live Order Status Stepper** | **6. Merchant Orders Inbox (Money First)** |
| <img src="public/docs/screenshots/05-order-tracking.png" width="420" alt="Order Tracking" /> | <img src="public/docs/screenshots/06-admin-inbox.png" width="420" alt="Admin Inbox" /> |
| **7. Catalog Management** | **8. 5-Minute Add Product Form** |
| <img src="public/docs/screenshots/07-admin-products.png" width="420" alt="Products Table" /> | <img src="public/docs/screenshots/08-admin-new-product.png" width="420" alt="Add Product" /> |
| **9. In-App Documentation** | |
| <img src="public/docs/screenshots/09-docs.png" width="420" alt="Docs" /> | |

---

## ✨ Key Features

### For Shoppers (Buyer Arc)
- **Persuade Landing**: Full-bleed lifestyle hero banner anchoring directly into an airy, calm product collection (`#catalog`).
- **Deep Technical Specifications**: Products feature hairline key/value specification tables (materials, dimensions, origins, care).
- **Subtle Dynamic Discounts**: Automatic percentage and fixed-amount savings calculations with crossed-out original prices.
- **Cash / Transfer on Delivery**: No upfront credit card barrier. Customers place an "order request" and settle payment upon delivery.
- **Live Status Stepper**: Real-time order tracking: `Request Placed` ➔ `Confirmed by Merchant` ➔ `Fulfilled / Delivered`.
- **Verified Reviews**: Community reviews with 5-star ratings and feedback submissions.

### For Merchants (5-Minutes-to-Live Arc)
- **Orders Inbox First (`/admin`)**: Land immediately on revenue operations. Confirm, fulfill, or cancel orders in a single click with audit timestamps.
- **Photo-First Cataloging**: One-screen product creation form (`/admin/products/new`) with instant file upload or image URL embedding, title, dollar pricing, inventory limits, and dynamic specs.
- **Promotions Engine (`/admin/discounts`)**: Configure percentage or fixed promotional price reductions across any catalog item.
- **Quick Catalog Toggles**: Instantly pause or activate items from the live storefront.

---

## 🏛️ Architecture & Financial Invariants

1. **Integer Cents Money Model**: Float arithmetic is banned. All prices, discounts, and order totals are computed and stored as integer cents (e.g. `$42.00` = `4200`).
2. **Immutable Price Snapshots**: Line item base prices, discounts, and net totals are permanently snapshotted into `order_items` during checkout to guarantee historic reporting integrity.
3. **Multi-Tenant Foundation**: Every tenant table carries `org_id` from migration #1. Transitioning from a single brand to a multi-merchant marketplace is purely additive.
4. **Order State Machine**: Enforces valid forward status transitions (`placed → confirmed → fulfilled | cancelled`) and logs every mutation to `order_status_history`.
5. **Security Hardening**:
   - Better Auth with client-tamper-proof roles (`input: false` on `role`).
   - Magic-byte binary verification on file uploads (JPEG, PNG, WebP) with strict extension derivation.
   - Session-scoped cart mutations preventing IDOR tampering.

---

## ⚡ Quickstart

### Prerequisites
- Node.js `v20+` or `v26+`
- `pnpm` (`v10+` or `v12+`)
- `docker` and `docker compose`

### 1. Clone & Install
```bash
git clone https://github.com/paramcodes/sahara.git
cd sahara
pnpm install
```

### 2. Launch Local PostgreSQL
```bash
docker compose up -d
```

### 3. Initialize Database & Seed Demo Data
```bash
cp .env.example .env
pnpm drizzle-kit push
pnpm seed
```

### 4. Start Development Server
```bash
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access URL |
|---|---|---|---|
| **Store Admin** | `admin@sahara.store` | `SaharaAdmin2026!` | [http://localhost:3000/admin](http://localhost:3000/admin) |
| **Customer** | (Self-registration or Guest) | Any | [http://localhost:3000](http://localhost:3000) |

---

## 🧪 Test Suite

Run the unit and integration test suite via Vitest:
```bash
pnpm test
```
Run production build & static typechecks:
```bash
pnpm build
```

---

## 📚 In-Depth Documentation

Interactive in-app documentation is accessible at **[http://localhost:3000/docs](http://localhost:3000/docs)**, or view the Markdown specifications directly:
- [Architecture & Core Invariants](docs/ARCHITECTURE.md)
- [Technology Stack & Decisions](docs/TECH_STACK.md)
- [Relational Data Model](docs/DATA_MODEL.md)
- [Apple-HIG UI Component Layer](docs/UI_COMPONENTS.md)
- [Features & Journey Storyboards](docs/FEATURES_GUIDE.md)
- [Contributor Guide](docs/CONTRIBUTING.md)

---

## 📄 License
MIT License. Crafted with precision for modern commerce.
