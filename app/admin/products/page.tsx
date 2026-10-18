import Link from "next/link";
import { ProductsManager } from "@/components/admin/ProductsManager";
import { Button } from "@/components/ui/Button";
import { getProducts } from "@/lib/repos/products";

export default async function AdminProductsPage() {
  const products = await getProducts({ activeOnly: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
            Catalog Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ink)] mt-0.5">
            Products ({products.length})
          </h1>
        </div>

        <Link href="/admin/products/new">
          <Button size="md">
            <span>+</span> Add New Product
          </Button>
        </Link>
      </div>

      <ProductsManager
        initialProducts={products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          priceCents: p.priceCents,
          stockQty: p.stockQty,
          active: p.active,
          bannerPath: p.bannerPath,
        }))}
      />
    </div>
  );
}
