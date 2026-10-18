"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn.email({
        email,
        password,
      });

      if (res?.error) {
        toast(res.error.message || "Invalid credentials", "error");
      } else {
        toast("Welcome back!", "success");
        router.push("/admin");
      }
    } catch {
      toast("Sign in failed. Check your credentials.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm">
        {}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-[var(--ink)]"
          >
            <span className="w-3 h-3 rounded-full bg-[var(--accent)]" />
            <span>SAHARA</span>
          </Link>
          <h1 className="text-xl font-semibold text-[var(--ink)] mt-3">Sign In</h1>
          <p className="text-xs text-[var(--ink-secondary)] mt-1">
            Access your merchant portal or buyer account.
          </p>
        </div>

        {}
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.06] shadow-sm flex flex-col gap-4"
        >
          <div>
            <label className="block text-xs font-medium text-[var(--ink-secondary)] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sahara.store"
              className="w-full text-xs sm:text-sm bg-black/[0.03] border border-black/[0.08] rounded-xl p-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-black/[0.1] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--ink-secondary)] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs sm:text-sm bg-black/[0.03] border border-black/[0.08] rounded-xl p-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-black/[0.1] focus:bg-white"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2 text-sm font-medium py-3"
          >
            Sign In
          </Button>

          <div className="text-center mt-2 text-xs text-[var(--ink-secondary)]">
            New here?{" "}
            <Link
              href="/auth/register"
              className="text-[var(--apple-blue)] font-medium hover:underline"
            >
              Create an account
            </Link>
          </div>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-[var(--ink-tertiary)] hover:text-[var(--ink)]">
            ← Return to storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
