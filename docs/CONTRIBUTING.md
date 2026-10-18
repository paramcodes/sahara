# Contributor Guide — Sahara

Welcome to Sahara! This guide helps new contributors get up and running quickly.

---

## 1. Prerequisites

- **Node.js**: v20 or higher (v26 tested)
- **pnpm**: v10+ (v12 tested)
- **Docker**: For running the local PostgreSQL container

---

## 2. Quickstart

1. **Clone and Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Start Local Database**:
   ```bash
   docker compose up -d
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```

4. **Push Database Schema**:
   ```bash
   pnpm drizzle-kit push
   ```

5. **Seed Sample Products & Admin Account**:
   ```bash
   pnpm seed
   ```
   *Default Admin credentials:*
   - **Email**: `admin@sahara.store`
   - **Password**: `SaharaAdmin2026!`

6. **Start Development Server**:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Running Tests & Builds

- **Run Unit Tests**:
  ```bash
  pnpm test
  ```
- **Run Production Build**:
  ```bash
  pnpm build
  ```

---

## 4. Coding Conventions

- **Money**: Always integer cents (`priceCents`, `discountCents`). Never store floating point dollars.
- **Components**: Follow Apple-HIG aesthetics in `components/ui/**`. Maintain clean, high-contrast typography and min 44px touch targets.
- **Data Mutations**: Use Server Actions validated with Zod schemas.
