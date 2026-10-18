import { getProducts } from "@/lib/repos/products";
import { db, schema } from "@/lib/db";
import { getCurrentCartData } from "@/lib/actions/cart";
import { Navbar } from "@/components/storefront/Navbar";
import { AnnouncementBar } from "@/components/storefront/AnnouncementBar";
import { HeroBanner } from "@/components/storefront/HeroBanner";
import { ProductRow } from "@/components/storefront/ProductRow";
import { Footer } from "@/components/storefront/Footer";
import { EmptyState } from "@/components/ui/EmptyState";
import { MOCK_STORE_SETTINGS } from "@/lib/mock-data";


interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  let settings = null;
  try {
    const [row] = await db.select().from(schema.storeSettings).limit(1);
    settings = row || MOCK_STORE_SETTINGS;
  } catch {
    settings = MOCK_STORE_SETTINGS;
  }

  const products = await getProducts({ query: q, activeOnly: true });
  const { items } = await getCurrentCartData();

  const totalCartQty = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar text={settings?.announcement || undefined} />
      <Navbar cartCount={totalCartQty} />

      <main className="flex-1">
        {/* Only show full hero on unsearched landing */}
        {!q && (
          <HeroBanner
            headline={settings?.heroHeadline || undefined}
            subheadline={settings?.heroSubheadline || undefined}
            tagline={settings?.storeName || undefined}
            bannerImage={settings?.heroBannerPath || undefined}
          />
        )}

        {/* Catalog Section */}
        <section
          id="catalog"
          className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 scroll-mt-14"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-black/[0.06] gap-2">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--accent)]">
                {q ? "Search Results" : "Collection"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ink)] mt-1">
                {q ? `Matches for “${q}”` : "Everyday Essentials"}
              </h2>
            </div>
            <span className="text-xs text-[var(--ink-secondary)]">
              {products.length} {products.length === 1 ? "item" : "items"}
            </span>
          </div>

          {products.length === 0 ? (
            <EmptyState
              title={q ? "No matches found" : "No products yet"}
              description={
                q
                  ? "Try checking your spelling or using fewer keywords to find what you're looking for."
                  : "We're curating our upcoming collection. Please check back shortly."
              }
              actionText={q ? "Clear search" : undefined}
              actionHref={q ? "/" : undefined}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {products.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
