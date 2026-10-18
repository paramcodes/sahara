import { getProducts } from "@/lib/repos/products";
import { DiscountsManager } from "@/components/admin/DiscountsManager";


export default async function AdminDiscountsPage() {
  const products = await getProducts({ activeOnly: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
          Promotions Engine
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ink)] mt-0.5">
          Store Discounts
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-secondary)] mt-1">
          Apply percentage or fixed reductions to individual items in your catalog.
        </p>
      </div>

      <DiscountsManager
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          priceCents: p.priceCents,
          discountType: p.discountType,
          discountValue: p.discountValue,
          discountStartsAt: p.discountStartsAt,
          discountEndsAt: p.discountEndsAt,
        }))}
      />
    </div>
  );
}
