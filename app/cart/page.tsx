import { CartView } from "@/components/storefront/CartView";
import { Footer } from "@/components/storefront/Footer";
import { Navbar } from "@/components/storefront/Navbar";
import { getCurrentCartData } from "@/lib/actions/cart";

export default async function CartPage() {
  const { items } = await getCurrentCartData();
  const totalCartQty = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar cartCount={totalCartQty} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ink)] mbe-8">
          Shopping Bag
        </h1>

        <CartView
          initialItems={items.map((i) => ({
            id: i.id,
            productId: i.productId,
            qty: i.qty,
            product: {
              id: i.product.id,
              name: i.product.name,
              slug: i.product.slug,
              priceCents: i.product.priceCents,
              discountType: i.product.discountType,
              discountValue: i.product.discountValue,
              discountStartsAt: i.product.discountStartsAt,
              discountEndsAt: i.product.discountEndsAt,
              bannerPath: i.product.bannerPath,
              stockQty: i.product.stockQty,
            },
          }))}
        />
      </main>

      <Footer />
    </div>
  );
}
