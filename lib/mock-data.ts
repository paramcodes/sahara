export const MOCK_STORE_SETTINGS = {
  orgId: "demo-org-1",
  storeName: "Sahara Atelier",
  tagline: "Handcrafted essentials with quiet refinement.",
  heroHeadline: "Crafted for Daily Living.",
  heroSubheadline:
    "Every piece is designed with pure materials, understated form, and enduring longevity.",
  heroBannerPath:
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop",
  accentColor: "#1d3529",
  announcement: "Complimentary local delivery on all inaugural orders.",
  updatedAt: new Date(),
};

export interface MockProduct {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  discountType: "none" | "percent" | "fixed";
  discountValue: number;
  discountStartsAt: Date | null;
  discountEndsAt: Date | null;
  stockQty: number | null;
  bannerPath: string | null;
  active: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
  specs: { id: string; productId: string; key: string; value: string; displayOrder: number }[];
  images: {
    id: string;
    productId: string;
    imagePath: string;
    displayOrder: number;
    altText: string;
  }[];
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "prod-1",
    orgId: "demo-org-1",
    name: "Obsidian Ceramic Tumbler",
    slug: "obsidian-ceramic-tumbler",
    description:
      "Hand-thrown stoneware finished with a matte black volcanic glaze. Double-walled for thermal retention while remaining cool to the hand.",
    priceCents: 4200,
    discountType: "none",
    discountValue: 0,
    discountStartsAt: null,
    discountEndsAt: null,
    stockQty: 24,
    featured: true,
    active: true,
    createdAt: new Date("2026-10-01"),
    updatedAt: new Date("2026-10-01"),
    bannerPath:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop",
    specs: [
      {
        id: "s1",
        productId: "prod-1",
        key: "Material",
        value: "High-fire stoneware ceramic",
        displayOrder: 0,
      },
      {
        id: "s2",
        productId: "prod-1",
        key: "Capacity",
        value: "350ml / 12 fl oz",
        displayOrder: 1,
      },
      {
        id: "s3",
        productId: "prod-1",
        key: "Origin",
        value: "Kyoto Studio, Japan",
        displayOrder: 2,
      },
      {
        id: "s4",
        productId: "prod-1",
        key: "Care",
        value: "Dishwasher safe; microwave gentle",
        displayOrder: 3,
      },
    ],
    images: [
      {
        id: "img1",
        productId: "prod-1",
        imagePath:
          "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop",
        displayOrder: 0,
        altText: "Obsidian Ceramic Tumbler",
      },
      {
        id: "img1-2",
        productId: "prod-1",
        imagePath:
          "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?q=80&w=1200&auto=format&fit=crop",
        displayOrder: 1,
        altText: "Obsidian Ceramic Tumbler Detail",
      },
    ],
  },
  {
    id: "prod-2",
    orgId: "demo-org-1",
    name: "Merino Wool Everyday Throw",
    slug: "merino-wool-throw",
    description:
      "Woven from extra-fine 19.5-micron Australian merino wool. Soft, breathable, and finished with a minimalist purl edge stitch.",
    priceCents: 16500,
    discountType: "percent",
    discountValue: 15,
    discountStartsAt: null,
    discountEndsAt: null,
    stockQty: 10,
    featured: true,
    active: true,
    createdAt: new Date("2026-10-02"),
    updatedAt: new Date("2026-10-02"),
    bannerPath:
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=1200&auto=format&fit=crop",
    specs: [
      { id: "s5", productId: "prod-2", key: "Dimensions", value: "130cm x 180cm", displayOrder: 0 },
      {
        id: "s6",
        productId: "prod-2",
        key: "Fiber",
        value: "100% Extra-fine Merino Wool",
        displayOrder: 1,
      },
      { id: "s7", productId: "prod-2", key: "Weight", value: "720g", displayOrder: 2 },
      {
        id: "s8",
        productId: "prod-2",
        key: "Care",
        value: "Dry clean or cold hand wash flat",
        displayOrder: 3,
      },
    ],
    images: [
      {
        id: "img2",
        productId: "prod-2",
        imagePath:
          "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=1200&auto=format&fit=crop",
        displayOrder: 0,
        altText: "Merino Wool Everyday Throw",
      },
    ],
  },
  {
    id: "prod-3",
    orgId: "demo-org-1",
    name: "Cast Iron Teapot with Trivet",
    slug: "cast-iron-teapot",
    description:
      "Traditional sand-cast Tetsubin teapot with an enamel interior and stainless steel infuser basket. Retains heat for extended tea ceremonies.",
    priceCents: 8900,
    discountType: "fixed",
    discountValue: 1500,
    discountStartsAt: null,
    discountEndsAt: null,
    stockQty: 8,
    featured: true,
    active: true,
    createdAt: new Date("2026-10-03"),
    updatedAt: new Date("2026-10-03"),
    bannerPath:
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1200&auto=format&fit=crop",
    specs: [
      { id: "s9", productId: "prod-3", key: "Capacity", value: "800ml", displayOrder: 0 },
      {
        id: "s10",
        productId: "prod-3",
        key: "Finish",
        value: "Textured charcoal matte enamel",
        displayOrder: 1,
      },
      {
        id: "s11",
        productId: "prod-3",
        key: "Included",
        value: "Infuser mesh + cast iron trivet",
        displayOrder: 2,
      },
    ],
    images: [
      {
        id: "img3",
        productId: "prod-3",
        imagePath:
          "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1200&auto=format&fit=crop",
        displayOrder: 0,
        altText: "Cast Iron Teapot with Trivet",
      },
    ],
  },
  {
    id: "prod-4",
    orgId: "demo-org-1",
    name: "Brass Desk Tray",
    slug: "brass-desk-tray",
    description:
      "Solid spun brass valet tray with an unlacquered living finish that develops a rich, personal patina over time.",
    priceCents: 5800,
    discountType: "none",
    discountValue: 0,
    discountStartsAt: null,
    discountEndsAt: null,
    stockQty: null, // Made to order
    featured: false,
    active: true,
    createdAt: new Date("2026-10-04"),
    updatedAt: new Date("2026-10-04"),
    bannerPath:
      "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=1200&auto=format&fit=crop",
    specs: [
      {
        id: "s12",
        productId: "prod-4",
        key: "Material",
        value: "Solid C260 brass",
        displayOrder: 0,
      },
      { id: "s13", productId: "prod-4", key: "Diameter", value: "180mm", displayOrder: 1 },
      {
        id: "s14",
        productId: "prod-4",
        key: "Base",
        value: "Vegetable-tanned leather pad",
        displayOrder: 2,
      },
    ],
    images: [
      {
        id: "img4",
        productId: "prod-4",
        imagePath:
          "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=1200&auto=format&fit=crop",
        displayOrder: 0,
        altText: "Brass Desk Tray",
      },
    ],
  },
  {
    id: "prod-5",
    orgId: "demo-org-1",
    name: "Cold-Pressed Cedar & Hinoki Candle",
    slug: "cedar-hinoki-candle",
    description:
      "Hand-poured coconut-soy wax infused with wild Japanese cypress, cedarwood needles, and smoked vetiver.",
    priceCents: 3600,
    discountType: "none",
    discountValue: 0,
    discountStartsAt: null,
    discountEndsAt: null,
    stockQty: 35,
    featured: false,
    active: true,
    createdAt: new Date("2026-10-05"),
    updatedAt: new Date("2026-10-05"),
    bannerPath:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1200&auto=format&fit=crop",
    specs: [
      { id: "s15", productId: "prod-5", key: "Burn Time", value: "55 hours", displayOrder: 0 },
      {
        id: "s16",
        productId: "prod-5",
        key: "Wax",
        value: "100% Coconut Soy Blend",
        displayOrder: 1,
      },
      {
        id: "s17",
        productId: "prod-5",
        key: "Wick",
        value: "Unbleached organic cotton",
        displayOrder: 2,
      },
    ],
    images: [
      {
        id: "img5",
        productId: "prod-5",
        imagePath:
          "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1200&auto=format&fit=crop",
        displayOrder: 0,
        altText: "Cold-Pressed Cedar & Hinoki Candle",
      },
    ],
  },
];

export const MOCK_ORDERS = [
  {
    id: "order-1",
    orgId: "demo-org-1",
    orderNumber: "SHR-849201-9021",
    customerName: "Elena Rostova",
    customerEmail: "elena@example.com",
    customerPhone: "+1 (555) 349-8812",
    customerAddress: "742 Evergreen Terrace, Apt 4B, Portland, OR 97201",
    notes: "Please call upon arrival at the gate",
    totalCents: 4200,
    discountCents: 0,
    finalCents: 4200,
    status: "placed",
    createdAt: new Date("2026-10-18T10:00:00Z"),
    updatedAt: new Date("2026-10-18T10:00:00Z"),
    items: [
      {
        id: "oi-1",
        orderId: "order-1",
        productId: "prod-1",
        productName: "Obsidian Ceramic Tumbler",
        priceCents: 4200,
        discountCents: 0,
        finalPriceCents: 4200,
        qty: 1,
      },
    ],
    history: [
      {
        id: "oh-1",
        orderId: "order-1",
        status: "placed",
        actorRole: "buyer",
        notes: "Order placed by customer via store request.",
        createdAt: new Date("2026-10-18T10:00:00Z"),
      },
    ],
  },
  {
    id: "order-2",
    orgId: "demo-org-1",
    orderNumber: "SHR-621940-8842",
    customerName: "Marcus Vance",
    customerEmail: "marcus.vance@example.com",
    customerPhone: "+1 (555) 782-9901",
    customerAddress: "1200 Grand Avenue, Suite 300, Seattle, WA 98101",
    notes: "Leave with front desk concierge",
    totalCents: 16500,
    discountCents: 2475,
    finalCents: 14025,
    status: "confirmed",
    createdAt: new Date("2026-10-17T14:30:00Z"),
    updatedAt: new Date("2026-10-17T15:00:00Z"),
    items: [
      {
        id: "oi-2",
        orderId: "order-2",
        productId: "prod-2",
        productName: "Merino Wool Everyday Throw",
        priceCents: 16500,
        discountCents: 2475,
        finalPriceCents: 14025,
        qty: 1,
      },
    ],
    history: [
      {
        id: "oh-2a",
        orderId: "order-2",
        status: "placed",
        actorRole: "buyer",
        notes: "Order placed by customer via store request.",
        createdAt: new Date("2026-10-17T14:30:00Z"),
      },
      {
        id: "oh-2b",
        orderId: "order-2",
        status: "confirmed",
        actorRole: "admin",
        notes: "Merchant confirmed order. Packaged for delivery dispatch.",
        createdAt: new Date("2026-10-17T15:00:00Z"),
      },
    ],
  },
  {
    id: "order-3",
    orgId: "demo-org-1",
    orderNumber: "SHR-510482-7719",
    customerName: "Sophia Chen",
    customerEmail: "sophia.chen@example.com",
    customerPhone: "+1 (555) 902-4411",
    customerAddress: "450 Sutter Street, San Francisco, CA 94108",
    notes: null,
    totalCents: 8900,
    discountCents: 1500,
    finalCents: 7400,
    status: "fulfilled",
    createdAt: new Date("2026-10-16T09:15:00Z"),
    updatedAt: new Date("2026-10-16T16:20:00Z"),
    items: [
      {
        id: "oi-3",
        orderId: "order-3",
        productId: "prod-3",
        productName: "Cast Iron Teapot with Trivet",
        priceCents: 8900,
        discountCents: 1500,
        finalPriceCents: 7400,
        qty: 1,
      },
    ],
    history: [
      {
        id: "oh-3a",
        orderId: "order-3",
        status: "placed",
        actorRole: "buyer",
        notes: "Order placed by customer via store request.",
        createdAt: new Date("2026-10-16T09:15:00Z"),
      },
      {
        id: "oh-3b",
        orderId: "order-3",
        status: "confirmed",
        actorRole: "admin",
        notes: "Merchant confirmed availability.",
        createdAt: new Date("2026-10-16T11:00:00Z"),
      },
      {
        id: "oh-3c",
        orderId: "order-3",
        status: "fulfilled",
        actorRole: "admin",
        notes: "Order delivered and payment collected.",
        createdAt: new Date("2026-10-16T16:20:00Z"),
      },
    ],
  },
];

export const MOCK_REVIEWS = [
  {
    id: "rev-1",
    orgId: "demo-org-1",
    productId: "prod-1",
    authorName: "Liam K.",
    rating: 5,
    comment:
      "The matte volcanic glaze feels incredible in hand. Keeps tea warm for over an hour. Absolute masterclass in craftsmanship.",
    approved: true,
    createdAt: new Date("2026-10-10"),
  },
  {
    id: "rev-2",
    orgId: "demo-org-1",
    productId: "prod-1",
    authorName: "Claire D.",
    rating: 5,
    comment: "Minimalist, weighty, and balanced. I use it every morning for espresso.",
    approved: true,
    createdAt: new Date("2026-10-12"),
  },
  {
    id: "rev-3",
    orgId: "demo-org-1",
    productId: "prod-2",
    authorName: "Julian R.",
    rating: 5,
    comment:
      "Extraordinarily soft and warm without feeling heavy. The stitching details along the edge are clean.",
    approved: true,
    createdAt: new Date("2026-10-14"),
  },
];
