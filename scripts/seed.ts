import crypto from "crypto";
import { eq } from "drizzle-orm";
import { auth } from "../lib/auth";
import { db, schema } from "../lib/db";

async function seed() {
  console.log("🌱 Starting Sahara single-store database seed...");

  const orgName = process.env.SEED_ORG_NAME || "Sahara Store";
  const orgSlug = process.env.SEED_ORG_SLUG || "sahara";
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@sahara.store";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "SaharaAdmin2026!";

  let [org] = await db.select().from(schema.orgs).where(eq(schema.orgs.slug, orgSlug)).limit(1);

  if (!org) {
    const orgId = crypto.randomUUID();
    const [newOrg] = await db
      .insert(schema.orgs)
      .values({
        id: orgId,
        name: orgName,
        slug: orgSlug,
      })
      .returning();
    org = newOrg;
    console.log(`✓ Created store organization: ${org.name} (id: ${org.id})`);
  } else {
    console.log(`ℹ Organization already exists: ${org.name}`);
  }

  const [settings] = await db
    .select()
    .from(schema.storeSettings)
    .where(eq(schema.storeSettings.orgId, org.id))
    .limit(1);

  if (!settings) {
    await db.insert(schema.storeSettings).values({
      orgId: org.id,
      storeName: "Sahara Atelier",
      tagline: "Handcrafted essentials with quiet refinement.",
      heroHeadline: "Crafted for Daily Living.",
      heroSubheadline:
        "Every piece is designed with pure materials, understated form, and enduring longevity.",
      heroBannerPath:
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop",
      accentColor: "#1d3529",
      announcement: "Complimentary local delivery on all inaugural orders.",
    });
    console.log("✓ Initialized store settings & hero copy");
  }

  const [existingAdmin] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, adminEmail))
    .limit(1);

  if (!existingAdmin) {
    try {
      const res = await auth.api.signUpEmail({
        body: {
          email: adminEmail,
          password: adminPassword,
          name: "Store Owner",
        },
      });
      console.log(`✓ Created admin user: ${adminEmail}`);

      if (res?.user?.id) {
        await db
          .update(schema.users)
          .set({ role: "admin", orgId: org.id })
          .where(eq(schema.users.id, res.user.id));
      }
    } catch (e: unknown) {
      console.warn("Notice during admin signup:", e instanceof Error ? e.message : e);
    }
  } else {
    await db
      .update(schema.users)
      .set({ role: "admin", orgId: org.id })
      .where(eq(schema.users.id, existingAdmin.id));
    console.log(`ℹ Admin user already exists: ${adminEmail}`);
  }

  const sampleProducts = [
    {
      name: "Obsidian Ceramic Tumbler",
      slug: "obsidian-ceramic-tumbler",
      description:
        "Hand-thrown stoneware finished with a matte black volcanic glaze. Double-walled for thermal retention while remaining cool to the hand.",
      priceCents: 4200,
      discountType: "none",
      discountValue: 0,
      stockQty: 24,
      featured: true,
      image:
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop",
      specs: [
        { key: "Material", value: "High-fire stoneware ceramic" },
        { key: "Capacity", value: "350ml / 12 fl oz" },
        { key: "Origin", value: "Kyoto Studio, Japan" },
        { key: "Care", value: "Dishwasher safe; microwave gentle" },
      ],
    },
    {
      name: "Merino Wool Everyday Throw",
      slug: "merino-wool-throw",
      description:
        "Woven from extra-fine 19.5-micron Australian merino wool. Soft, breathable, and finished with a minimalist purl edge stitch.",
      priceCents: 16500,
      discountType: "percent",
      discountValue: 15,
      stockQty: 10,
      featured: true,
      image:
        "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=1200&auto=format&fit=crop",
      specs: [
        { key: "Dimensions", value: "130cm x 180cm" },
        { key: "Fiber", value: "100% Extra-fine Merino Wool" },
        { key: "Weight", value: "720g" },
        { key: "Care", value: "Dry clean or cold hand wash flat" },
      ],
    },
    {
      name: "Cast Iron Teapot with Trivet",
      slug: "cast-iron-teapot",
      description:
        "Traditional sand-cast Tetsubin teapot with an enamel interior and stainless steel infuser basket. Retains heat for extended tea ceremonies.",
      priceCents: 8900,
      discountType: "fixed",
      discountValue: 1500,
      stockQty: 8,
      featured: true,
      image:
        "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1200&auto=format&fit=crop",
      specs: [
        { key: "Capacity", value: "800ml" },
        { key: "Finish", value: "Textured charcoal matte enamel" },
        { key: "Included", value: "Infuser mesh + cast iron trivet" },
      ],
    },
    {
      name: "Brass Desk Tray",
      slug: "brass-desk-tray",
      description:
        "Solid spun brass valet tray with an unlacquered living finish that develops a rich, personal patina over time.",
      priceCents: 5800,
      discountType: "none",
      discountValue: 0,
      stockQty: null,
      featured: false,
      image:
        "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=1200&auto=format&fit=crop",
      specs: [
        { key: "Material", value: "Solid C260 brass" },
        { key: "Diameter", value: "180mm" },
        { key: "Base", value: "Vegetable-tanned leather pad" },
      ],
    },
    {
      name: "Cold-Pressed Cedar & Hinoki Candle",
      slug: "cedar-hinoki-candle",
      description:
        "Hand-poured coconut-soy wax infused with wild Japanese cypress, cedarwood needles, and smoked vetiver.",
      priceCents: 3600,
      discountType: "none",
      discountValue: 0,
      stockQty: 35,
      featured: false,
      image:
        "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1200&auto=format&fit=crop",
      specs: [
        { key: "Burn Time", value: "55 hours" },
        { key: "Wax", value: "100% Coconut Soy Blend" },
        { key: "Wick", value: "Unbleached organic cotton" },
      ],
    },
  ];

  for (const p of sampleProducts) {
    const [existing] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.slug, p.slug))
      .limit(1);

    if (!existing) {
      const prodId = crypto.randomUUID();
      await db.insert(schema.products).values({
        id: prodId,
        orgId: org.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        priceCents: p.priceCents,
        discountType: p.discountType,
        discountValue: p.discountValue,
        stockQty: p.stockQty,
        bannerPath: p.image,
        featured: p.featured,
        active: true,
      });

      for (let i = 0; i < p.specs.length; i++) {
        await db.insert(schema.productSpecs).values({
          id: crypto.randomUUID(),
          productId: prodId,
          key: p.specs[i].key,
          value: p.specs[i].value,
          displayOrder: i,
        });
      }

      await db.insert(schema.productImages).values({
        id: crypto.randomUUID(),
        productId: prodId,
        imagePath: p.image,
        displayOrder: 0,
        altText: p.name,
      });

      console.log(`✓ Added product: ${p.name}`);
    }
  }

  const [existingOrder] = await db.select().from(schema.orders).limit(1);
  if (!existingOrder) {
    const allProducts = await db.select().from(schema.products);
    const tumbler = allProducts.find((p) => p.slug === "obsidian-ceramic-tumbler");
    const throwBlanket = allProducts.find((p) => p.slug === "merino-wool-throw");
    const teapot = allProducts.find((p) => p.slug === "cast-iron-teapot");

    if (tumbler && throwBlanket && teapot) {
      const order1Id = crypto.randomUUID();
      await db.insert(schema.orders).values({
        id: order1Id,
        orgId: org.id,
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
      });
      await db.insert(schema.orderItems).values({
        id: crypto.randomUUID(),
        orderId: order1Id,
        productId: tumbler.id,
        productName: tumbler.name,
        priceCents: 4200,
        discountCents: 0,
        finalPriceCents: 4200,
        qty: 1,
      });
      await db.insert(schema.orderStatusHistory).values({
        id: crypto.randomUUID(),
        orderId: order1Id,
        status: "placed",
        actorRole: "buyer",
        notes: "Order placed by customer via store request.",
      });

      const order2Id = crypto.randomUUID();
      await db.insert(schema.orders).values({
        id: order2Id,
        orgId: org.id,
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
      });
      await db.insert(schema.orderItems).values({
        id: crypto.randomUUID(),
        orderId: order2Id,
        productId: throwBlanket.id,
        productName: throwBlanket.name,
        priceCents: 16500,
        discountCents: 2475,
        finalPriceCents: 14025,
        qty: 1,
      });
      await db.insert(schema.orderStatusHistory).values({
        id: crypto.randomUUID(),
        orderId: order2Id,
        status: "placed",
        actorRole: "buyer",
        notes: "Order placed by customer via store request.",
      });
      await db.insert(schema.orderStatusHistory).values({
        id: crypto.randomUUID(),
        orderId: order2Id,
        status: "confirmed",
        actorRole: "admin",
        notes: "Merchant confirmed order. Packaged for delivery dispatch.",
      });

      const order3Id = crypto.randomUUID();
      await db.insert(schema.orders).values({
        id: order3Id,
        orgId: org.id,
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
      });
      await db.insert(schema.orderItems).values({
        id: crypto.randomUUID(),
        orderId: order3Id,
        productId: teapot.id,
        productName: teapot.name,
        priceCents: 8900,
        discountCents: 1500,
        finalPriceCents: 7400,
        qty: 1,
      });
      await db.insert(schema.orderStatusHistory).values({
        id: crypto.randomUUID(),
        orderId: order3Id,
        status: "placed",
        actorRole: "buyer",
        notes: "Order placed by customer via store request.",
      });
      await db.insert(schema.orderStatusHistory).values({
        id: crypto.randomUUID(),
        orderId: order3Id,
        status: "confirmed",
        actorRole: "admin",
        notes: "Merchant confirmed availability.",
      });
      await db.insert(schema.orderStatusHistory).values({
        id: crypto.randomUUID(),
        orderId: order3Id,
        status: "fulfilled",
        actorRole: "admin",
        notes: "Order delivered and payment collected.",
      });

      console.log("✓ Seeded sample orders across Placed, Confirmed, and Fulfilled states");

      await db.insert(schema.reviews).values([
        {
          id: crypto.randomUUID(),
          orgId: org.id,
          productId: tumbler.id,
          authorName: "Liam K.",
          rating: 5,
          comment:
            "The matte volcanic glaze feels incredible in hand. Keeps tea warm for over an hour. Absolute masterclass in craftsmanship.",
          approved: true,
        },
        {
          id: crypto.randomUUID(),
          orgId: org.id,
          productId: tumbler.id,
          authorName: "Claire D.",
          rating: 5,
          comment: "Minimalist, weighty, and balanced. I use it every morning for espresso.",
          approved: true,
        },
        {
          id: crypto.randomUUID(),
          orgId: org.id,
          productId: throwBlanket.id,
          authorName: "Julian R.",
          rating: 5,
          comment:
            "Extraordinarily soft and warm without feeling heavy. The stitching details along the edge are clean.",
          approved: true,
        },
      ]);
      console.log("✓ Seeded customer reviews with 5-star ratings");
    }
  }

  console.log("✅ Seed completed successfully!");
}

seed()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
