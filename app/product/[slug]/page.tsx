import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AddToCartForm } from "@/components/storefront/AddToCartForm";
import { Footer } from "@/components/storefront/Footer";
import { Navbar } from "@/components/storefront/Navbar";
import { ReviewSection } from "@/components/storefront/ReviewSection";
import { Badge } from "@/components/ui/Badge";
import { getCurrentCartData } from "@/lib/actions/cart";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import Image from "next/image";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { Badge } from "@/components/ui/Badge";
import { AddToCartForm } from "@/components/storefront/AddToCartForm";
import { ReviewSection } from "@/components/storefront/ReviewSection";
import { formatCents, calculateProductPrice } from "@/lib/pricing";
import { MOCK_REVIEWS } from "@/lib/mock-data";
import { calculateProductPrice, formatCents } from "@/lib/pricing";
import { getProductBySlug } from "@/lib/repos/products";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Product and cart are independent — fetch in parallel
  const [product, cartData] = await Promise.all([
    getProductBySlug(slug),
    getCurrentCartData().catch(() => ({ cartId: "", items: [] })),
  ]);

  if (!product || !product.active) {
    notFound();
  }

  const { items: cartItems } = cartData;
  const totalCartQty = cartItems.reduce((sum, item) => sum + item.qty, 0);

  let reviews: {
    id: string;
    authorName: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }[] = [];
  try {
    const rows = await db
      .select()
      .from(schema.reviews)
      .where(eq(schema.reviews.productId, product.id))
      .orderBy(desc(schema.reviews.createdAt));
    reviews = rows;
  } catch {
    reviews = MOCK_REVIEWS.filter((r) => r.productId === product.id);
  }

  const pricing = calculateProductPrice(product);
  const heroImage =
    product.images[0]?.imagePath ||
    product.bannerPath ||
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar cartCount={totalCartQty} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
          {}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square w-full rounded-3xl bg-white border border-black/[0.06] overflow-clip shadow-sm flex items-center justify-center">
              <Image
                src={heroImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pbe-2">
                {product.images.map((img) => (
                  <div
                    key={img.id}
                    className="relative w-20 h-20 rounded-xl bg-white border border-black/[0.06] overflow-clip shrink-0"
                  >
                    <Image
                      src={img.imagePath}
                      alt={img.altText || product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {}
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] mbe-2">
              Sahara Collection
            </span>

            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[var(--ink)] mbe-3">
              {product.name}
            </h1>

            {/* Pricing */}
            <div className="flex items-center gap-3 mbe-6">
              {pricing.isActive ? (
                <>
                  <span className="text-2xl sm:text-3xl font-semibold text-[var(--ink)] tabular-nums">
                    {formatCents(pricing.finalPriceCents)}
                  </span>
                  <span className="text-base sm:text-lg text-[var(--ink-tertiary)] line-through tabular-nums">
                    {formatCents(product.priceCents)}
                  </span>
                  <Badge variant="accent">
                    {product.discountType === "percent"
                      ? `${product.discountValue}% OFF`
                      : `Save ${formatCents(pricing.discountCents)}`}
                  </Badge>
                </>
              ) : (
                <span className="text-2xl sm:text-3xl font-semibold text-[var(--ink)] tabular-nums">
                  {formatCents(product.priceCents)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-[var(--ink-secondary)] leading-relaxed mbe-8">
              {product.description}
            </p>

            {}
            {product.specs && product.specs.length > 0 && (
              <div className="mbe-8 rounded-2xl bg-white border border-black/[0.06] overflow-clip p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-tertiary)] mbe-3">
                  Specifications
                </h3>
                <dl className="divide-y divide-black/[0.04]">
                  {product.specs.map((spec) => (
                    <div
                      key={spec.id}
                      className="py-2.5 flex items-center justify-between text-xs sm:text-sm"
                    >
                      <dt className="text-[var(--ink-secondary)] font-medium">{spec.key}</dt>
                      <dd className="text-[var(--ink)] font-normal text-right">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {}
            <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-sm">
              <AddToCartForm productId={product.id} stockQty={product.stockQty} />
            </div>
          </div>
        </div>

        {}
        <ReviewSection
          productId={product.id}
          reviews={reviews.map((r) => ({
            id: r.id,
            authorName: r.authorName,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
          }))}
        />
      </main>

      <Footer />
    </div>
  );
}
