import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/storefront/CheckoutForm";
import { Footer } from "@/components/storefront/Footer";
import { Navbar } from "@/components/storefront/Navbar";
import { getCurrentCartData } from "@/lib/actions/cart";
import { calculateCartTotals, calculateProductPrice, formatCents } from "@/lib/pricing";

export default async function CheckoutPage() {
  const { items } = await getCurrentCartData();

  if (!items || items.length === 0) {
    redirect("/cart");
  }

  const totals = calculateCartTotals(items.map((i) => ({ product: i.product, qty: i.qty })));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar cartCount={totals.itemCount} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ink)] mb-2">
          Checkout Request
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-secondary)] mb-8">
          Place your order request. We will review availability and message you to confirm dispatch.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          {}
          <div className="md:col-span-3">
            <CheckoutForm />
          </div>

          {}
          <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-black/[0.06] shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-[var(--ink)]">
              In Your Bag ({totals.itemCount})
            </h3>

            <div className="flex flex-col divide-y divide-black/[0.04] max-h-72 overflow-y-auto">
              {items.map((item) => {
                const linePrice = calculateProductPrice(item.product).finalPriceCents * item.qty;
                return (
                  <div key={item.id} className="py-2.5 flex justify-between text-xs">
                    <div>
                      <span className="font-medium text-[var(--ink)]">{item.product.name}</span>
                      <span className="text-[var(--ink-secondary)] block">Qty: {item.qty}</span>
                    </div>
                    <span className="text-[var(--ink)] font-medium tabular-nums">
                      {formatCents(linePrice)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-black/[0.06] flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between text-[var(--ink-secondary)]">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCents(totals.subtotalCents)}</span>
              </div>
              {totals.discountCents > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Savings</span>
                  <span className="tabular-nums">-{formatCents(totals.discountCents)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-sm text-[var(--ink)] pt-1.5">
                <span>Estimated Due</span>
                <span className="tabular-nums">{formatCents(totals.totalCents)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
