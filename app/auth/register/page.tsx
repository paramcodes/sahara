"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signUp.email({
        name,
        email,
        password,
      });

      if (res?.error) {
        toast(res.error.message || "Registration failed", "error");
      } else {
        toast("Account created successfully!", "success");
        router.push("/");
      }
    } catch {
      toast("Registration failed. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-[var(--ink)]"
          >
            <span className="w-3 h-3 rounded-full bg-[var(--accent)]" />
            <span>SAHARA</span>
          </Link>
          <h1 className="text-xl font-semibold text-[var(--ink)] mt-3">
            Create an Account
          </h1>
          <p className="text-xs text-[var(--ink-secondary)] mt-1">
            Join Sahara for order tracking and quick checkouts.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.06] shadow-sm flex flex-col gap-4"
        >
          <div>
            <label className="block text-xs font-medium text-[var(--ink-secondary)] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full text-xs sm:text-sm bg-black/[0.03] border border-black/[0.08] rounded-xl p-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-black/[0.1] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--ink-secondary)] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full text-xs sm:text-sm bg-black/[0.03] border border-black/[0.08] rounded-xl p-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-black/[0.1] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--ink-secondary)] mb-1.5">
              Password (min. 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
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
            Create Account
          </Button>

          <div className="text-center mt-2 text-xs text-[var(--ink-secondary)]">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-[var(--apple-blue)] font-medium hover:underline"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
