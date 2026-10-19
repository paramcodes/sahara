"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";

export function Navbar({ cartCount = 0 }: { cartCount?: number }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/?q=${encodeURIComponent(search.trim())}#catalog`);
    } else {
      router.push("/#catalog");
    }
  };

  return (
    <header className="sticky inset-bs-0 z-40 frosted-nav transition-[background-color,backdrop-filter]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {}
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-[var(--ink)] flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
          <span>SAHARA</span>
        </Link>

        {}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center relative max-w-xs w-full mx-8"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog..."
            aria-label="Search catalog"
            className="w-full text-xs bg-black/[0.04] hover:bg-black/[0.06] focus:bg-white border border-transparent focus:border-black/[0.1] rounded-full py-2 ps-9 pe-4 text-[var(--ink)] placeholder-[var(--ink-tertiary)] transition-colors focus:ring-2 focus:ring-black/[0.05]"
          />
          <svg
            className="w-3.5 h-3.5 absolute inset-is-3 text-[var(--ink-tertiary)]"
            fill="none"
            aria-hidden="true"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
        </form>

        {}
        <nav
          aria-label="Main Navigation"
          className="flex items-center gap-4 text-xs font-medium text-[var(--ink-secondary)]"
        >
          <Link
            href="/#catalog"
            className="hover:text-[var(--ink)] transition-colors hidden sm:inline-block py-2 min-h-[44px] flex items-center"
          >
            Catalog
          </Link>

          <Link
            href="/admin"
            className="hover:text-[var(--ink)] transition-colors hidden sm:inline-block py-2 min-h-[44px] flex items-center"
          >
            Merchant Admin
          </Link>

          {}
          <Link
            href="/cart"
            aria-label={`Shopping Bag (${cartCount} items)`}
            className="relative flex items-center gap-1.5 py-2 px-3 min-h-[44px] rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[var(--ink)] transition-[background-color,transform] active:scale-95"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              aria-hidden="true"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="text-xs font-semibold tabular-nums">{cartCount}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
