import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-black/[0.06] bg-[#fbfbfd] text-[var(--ink-secondary)] text-xs py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center sm:items-start gap-1">
          <span className="font-semibold text-[var(--ink)] tracking-tight">SAHARA ATELIER</span>
          <p className="text-[var(--ink-tertiary)]">
            A single-brand storefront built on Apple design principles.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/#catalog" className="hover:text-[var(--ink)] transition-colors">
            Catalog
          </Link>
          <Link href="/cart" className="hover:text-[var(--ink)] transition-colors">
            Bag
          </Link>
          <Link href="/admin" className="hover:text-[var(--ink)] transition-colors">
            Admin
          </Link>
          <Link href="/docs" className="hover:text-[var(--ink)] transition-colors">
            Documentation
          </Link>
        </div>
      </div>
    </footer>
  );
}
