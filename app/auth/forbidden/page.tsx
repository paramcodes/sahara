import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col justify-center items-center px-4 py-12 text-center">
      <div className="max-w-md p-8 rounded-3xl bg-white border border-black/[0.06] shadow-sm flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-[var(--error)] flex items-center justify-center text-xl font-bold mbe-4">
          !
        </div>
        <h1 className="text-xl font-semibold text-[var(--ink)] mbe-2">Merchant Access Required</h1>
        <p className="text-xs sm:text-sm text-[var(--ink-secondary)] mbe-6 leading-relaxed">
          The merchant administration area requires an administrator account. You are currently
          logged in with a customer account or not authorized.
        </p>

        <div className="flex gap-3">
          <Link href="/auth/login">
            <Button size="md">Sign in as Admin</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary" size="md">
              Storefront
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
