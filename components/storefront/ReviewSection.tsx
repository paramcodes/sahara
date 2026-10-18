"use client";

import type React from "react";
import { useState } from "react";
import { postReviewAction } from "@/lib/actions/reviews";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";

export interface ReviewItem {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export function ReviewSection({
  productId,
  reviews,
}: {
  productId: string;
  reviews: ReviewItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await postReviewAction({
      productId,
      authorName,
      rating,
      comment,
    });
    setIsSubmitting(false);

    if (res.success) {
      toast("Thank you! Your review has been posted.", "success");
      setAuthorName("");
      setComment("");
      setIsOpen(false);
    } else {
      toast(res.error || "Could not post review.", "error");
    }
  };

  return (
    <section className="mt-16 pt-12 border-t border-black/[0.06]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ink)] tracking-tight">
            Customer Reviews
          </h2>
          <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
            {reviews.length === 0
              ? "No reviews yet. Be the first to share your thoughts."
              : `${reviews.length} verified thoughts`}
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "Close" : "Write a Review"}
        </Button>
      </div>

      {isOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-2xl bg-white border border-black/[0.06] mb-8 max-w-lg transition-all"
        >
          <h3 className="text-sm font-semibold text-[var(--ink)] mb-4">Share Your Experience</h3>

          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="reviewAuthor"
                className="block text-xs font-medium text-[var(--ink-secondary)] mb-1"
              >
                Your Name
              </label>
              <input
                id="reviewAuthor"
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Sarah M."
                className="w-full text-xs bg-black/[0.04] border border-black/[0.06] rounded-xl p-2.5 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-black/[0.1]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">
                Rating
              </label>
              <div className="flex gap-1" role="group" aria-label="Rating Selection">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    aria-label={`${star} out of 5 stars`}
                    aria-pressed={star === rating}
                    onClick={() => setRating(star)}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-xl transition-transform hover:scale-110 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/[0.1] rounded-lg"
                  >
                    <span aria-hidden="true">{star <= rating ? "★" : "☆"}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="reviewComment"
                className="block text-xs font-medium text-[var(--ink-secondary)] mb-1"
              >
                Your Comments
              </label>
              <textarea
                id="reviewComment"
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How does this piece feel and perform?"
                className="w-full text-xs bg-black/[0.04] border border-black/[0.06] rounded-xl p-2.5 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-black/[0.1]"
              />
            </div>

            <Button type="submit" size="md" isLoading={isSubmitting} className="mt-2">
              Post Review
            </Button>
          </div>
        </form>
      )}

      {}
      <div className="flex flex-col gap-4">
        {reviews.map((r) => (
          <div key={r.id} className="p-5 rounded-2xl bg-white border border-black/[0.04]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[var(--ink)]">{r.authorName}</span>
              <span
                className="text-amber-600 text-xs tracking-widest"
                aria-label={`${r.rating} out of 5 stars`}
              >
                <span aria-hidden="true">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--ink-secondary)] leading-relaxed">
              {r.comment}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
