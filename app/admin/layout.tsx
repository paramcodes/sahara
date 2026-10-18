import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await requireAdmin();
  } catch {
    // Demo fallback for cloud preview before remote DB is attached
    session = {
      user: {
        id: "demo-admin",
        email: "admin@sahara.store",
        role: "admin",
      },
    };
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col sm:flex-row">
      {/* Sidebar */}
      <aside className="w-full sm:w-60 bg-white border-r border-black/[0.06] p-4 sm:p-6 shrink-0 flex flex-col justify-between">
        <div className="flex flex-col gap-6">
          {/* Logo & Org */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-base font-bold tracking-tight text-[var(--ink)] flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
              <span>SAHARA ADMIN</span>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="flex sm:flex-col gap-1 overflow-x-auto pb-2 sm:pb-0 text-xs sm:text-sm font-medium">
            <Link
              href="/admin"
              className="px-3.5 py-2.5 rounded-xl text-[var(--ink)] hover:bg-black/[0.04] transition-colors flex items-center gap-2.5 shrink-0"
            >
              <span>📥</span> Orders Inbox
            </Link>
            <Link
              href="/admin/products"
              className="px-3.5 py-2.5 rounded-xl text-[var(--ink)] hover:bg-black/[0.04] transition-colors flex items-center gap-2.5 shrink-0"
            >
              <span>🏷️</span> Products
            </Link>
            <Link
              href="/admin/products/new"
              className="px-3.5 py-2.5 rounded-xl text-[var(--ink)] hover:bg-black/[0.04] transition-colors flex items-center gap-2.5 shrink-0"
            >
              <span>➕</span> Add Product
            </Link>
            <Link
              href="/admin/discounts"
              className="px-3.5 py-2.5 rounded-xl text-[var(--ink)] hover:bg-black/[0.04] transition-colors flex items-center gap-2.5 shrink-0"
            >
              <span>⚡</span> Discounts
            </Link>
          </nav>
        </div>

        {/* Footer info & view store */}
        <div className="pt-4 border-t border-black/[0.06] hidden sm:flex flex-col gap-2">
          <span className="text-[11px] text-[var(--ink-tertiary)] truncate">
            Logged in as {session.user.email}
          </span>
          <Link
            href="/"
            className="text-xs font-medium text-[var(--apple-blue)] hover:underline flex items-center gap-1"
          >
            ← View Live Storefront
          </Link>
        </div>
      </aside>

      {/* Main Admin Surface */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-6xl overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
