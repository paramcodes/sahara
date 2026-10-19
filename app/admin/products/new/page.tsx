import { AddProductForm } from "@/components/admin/AddProductForm";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
          Quick Launch
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ink)] mbs-0.5">
          Add New Product
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-secondary)] mbs-1">
          Add photos, title, price, and specs. Live in under 5 minutes.
        </p>
      </div>

      <AddProductForm />
    </div>
  );
}
