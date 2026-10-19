"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary triggered:", error);
  }, [error]);

  const isDbError =
    error.message?.includes("connect") ||
    error.message?.includes("ECONNREFUSED") ||
    error.message?.includes("DATABASE_URL") ||
    error.message?.includes("query");

  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col justify-center items-center px-4 py-12 text-center">
      <div className="max-w-md p-8 sm:p-10 rounded-3xl bg-white border border-black/[0.06] shadow-sm flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold mbe-4">
          !
        </div>

        <h1 className="text-xl font-semibold text-[var(--ink)] tracking-tight mbe-2">
          {isDbError ? "Database Connecting" : "Something Went Wrong"}
        </h1>

        <p className="text-xs sm:text-sm text-[var(--ink-secondary)] mbe-6 leading-relaxed">
          {isDbError
            ? "The storefront could not reach the database. If this is a new Vercel deployment, please connect a remote PostgreSQL connection string (e.g. Neon or Supabase) in Vercel project environment variables."
            : "An unexpected error occurred while loading this view. You can try reloading or return to the storefront."}
        </p>

        <div className="flex gap-3">
          <Button size="md" onClick={() => reset()}>
            Retry Connection
          </Button>
          <Link href="/docs">
            <Button variant="secondary" size="md">
              View Setup Docs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
