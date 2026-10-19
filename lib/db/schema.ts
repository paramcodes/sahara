import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// 1. Orgs (Single org in v1, multi-tenant ready with org_id everywhere)
export const orgs = pgTable("orgs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. Users (Better Auth integration compatible + org_id + role)
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    role: text("role").default("user").notNull(), // 'user' | 'admin'
    orgId: text("org_id").references(() => orgs.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("users_org_id_idx").on(table.orgId), index("users_email_idx").on(table.email)],
);

// Better Auth Sessions
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  orgId: text("org_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Better Auth Accounts (credentials or OAuth)
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 3. Products
// price_cents: integer cents
// stock_qty: integer NULL means unlimited/made-to-order
// discount_type: 'none' | 'percent' | 'fixed'
export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull().default(""),
    priceCents: integer("price_cents").notNull(),
    discountType: text("discount_type").default("none").notNull(), // 'none' | 'percent' | 'fixed'
    discountValue: integer("discount_value").default(0).notNull(), // percent (e.g. 15 for 15%) or fixed cents
    discountStartsAt: timestamp("discount_starts_at", { withTimezone: true }),
    discountEndsAt: timestamp("discount_ends_at", { withTimezone: true }),
    stockQty: integer("stock_qty"), // null = made to order / unlimited
    bannerPath: text("banner_path"),
    active: boolean("active").default(true).notNull(),
    featured: boolean("featured").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("products_org_slug_idx").on(table.orgId, table.slug),
    index("products_org_active_idx").on(table.orgId, table.active),
    index("products_name_idx").on(table.name),
  ],
);

// 4. Product Specs (Key/Value technical specs shown on product page)
export const productSpecs = pgTable(
  "product_specs",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: text("value").notNull(),
    displayOrder: integer("display_order").default(0).notNull(),
  },
  (table) => [index("product_specs_product_id_idx").on(table.productId)],
);

// 5. Product Images
export const productImages = pgTable(
  "product_images",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    imagePath: text("image_path").notNull(),
    displayOrder: integer("display_order").default(0).notNull(),
    altText: text("alt_text"),
  },
  (table) => [index("product_images_product_id_idx").on(table.productId)],
);

// 6. Carts & Cart Items
export const carts = pgTable(
  "carts",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    sessionId: text("session_id"), // for guest carts
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // getOrCreateCart resolves a cart by (orgId, userId) or (orgId, sessionId)
    // on every page render and every cart mutation.
    index("carts_org_user_idx").on(table.orgId, table.userId),
    index("carts_org_session_idx").on(table.orgId, table.sessionId),
  ],
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: text("id").primaryKey(),
    cartId: text("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    qty: integer("qty").notNull().default(1),
  },
  (table) => [uniqueIndex("cart_items_cart_product_idx").on(table.cartId, table.productId)],
);

// 7. Orders & Order Items
// Status state machine: placed -> confirmed -> fulfilled | cancelled
export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    orderNumber: text("order_number").notNull().unique(),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone").notNull(),
    customerAddress: text("customer_address").notNull(),
    notes: text("notes"),
    totalCents: integer("total_cents").notNull(),
    discountCents: integer("discount_cents").default(0).notNull(),
    finalCents: integer("final_cents").notNull(),
    status: text("status").default("placed").notNull(), // 'placed' | 'confirmed' | 'fulfilled' | 'cancelled'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("orders_org_id_idx").on(table.orgId),
    index("orders_user_id_idx").on(table.userId),
    index("orders_status_idx").on(table.status),
    index("orders_created_at_idx").on(table.createdAt),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    productName: text("product_name").notNull(),
    priceCents: integer("price_cents").notNull(), // base price snapshot
    discountCents: integer("discount_cents").default(0).notNull(), // per-unit discount snapshot
    finalPriceCents: integer("final_price_cents").notNull(), // net per-unit price snapshot
    qty: integer("qty").notNull(),
  },
  (table) => [index("order_items_order_id_idx").on(table.orderId)],
);

// 8. Order Status History (audit trail)
export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    actorId: text("actor_id"),
    actorRole: text("actor_role").notNull().default("system"), // 'system' | 'admin' | 'buyer'
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("order_status_history_order_id_idx").on(table.orderId)],
);

// 9. Reviews
export const reviews = pgTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    authorName: text("author_name").notNull(),
    rating: integer("rating").notNull(), // 1 to 5
    comment: text("comment").notNull(),
    approved: boolean("approved").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("reviews_product_id_idx").on(table.productId),
    index("reviews_org_id_idx").on(table.orgId),
  ],
);

// 10. Store Settings / Metadata (storefront title, banner, announcement)
export const storeSettings = pgTable("store_settings", {
  orgId: text("org_id")
    .primaryKey()
    .references(() => orgs.id, { onDelete: "cascade" }),
  storeName: text("store_name").notNull().default("Sahara"),
  tagline: text("tagline").default("Curated products, crafted with care."),
  heroHeadline: text("hero_headline").default("Elegance in Every Detail."),
  heroSubheadline: text("hero_subheadline").default(
    "Experience hand-crafted essentials designed for modern living.",
  ),
  heroBannerPath: text("hero_banner_path"),
  accentColor: text("accent_color").default("#1d3529"), // Deep forest green
  announcement: text("announcement").default("Free delivery on all local orders this week"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
