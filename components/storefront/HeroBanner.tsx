import Image from "next/image";
import type React from "react";
import { Button } from "../ui/Button";

export interface HeroBannerProps {
  headline?: string;
  subheadline?: string;
  tagline?: string;
  bannerImage?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  headline = "Crafted for Daily Living.",
  subheadline = "Every piece is designed with pure materials, understated form, and enduring longevity.",
  tagline = "Sahara Atelier",
  bannerImage = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop",
}) => {
  return (
    <section className="relative w-full h-[540px] sm:h-[620px] flex items-center justify-center overflow-clip bg-[oklch(92.334%_0.0067_286.27)]">
      {/* Background Image with subtle gradient overlay */}
      <Image
        src={bannerImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] hover-scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/10" />

      {/* Content Container */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center text-white flex flex-col items-center">
        <span className="text-xs uppercase tracking-[0.25em] font-medium text-white/80 mbe-3">
          {tagline}
        </span>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white mbe-4 text-balance">
          {headline}
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-xl font-normal leading-relaxed mbe-8 text-balance">
          {subheadline}
        </p>

        <a href="#catalog">
          <Button
            size="lg"
            className="bg-white text-[var(--ink)] hover:bg-white/90 shadow-lg px-8 text-sm sm:text-base font-medium"
          >
            Explore Collection ↓
          </Button>
        </a>
      </div>
    </section>
  );
};
