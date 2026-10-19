import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { calculateProductPrice, formatCents } from "@/lib/pricing";
import { Badge } from "../ui/Badge";

export interface ProductRowProps {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    priceCents: number;
    discountType: string | null;
    discountValue: number | null;
    discountStartsAt: Date | string | null;
    discountEndsAt: Date | string | null;
    stockQty: number | null;
    bannerPath: string | null;
  };
}

export const ProductRow: React.FC<ProductRowProps> = ({ product }) => {
  const pricing = calculateProductPrice(product);
  const isOutOfStock = product.stockQty !== null && product.stockQty <= 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group card-hover block rounded-2xl bg-white p-4 sm:p-5 border border-black/[0.04] hover:border-black/[0.1] hover:shadow-md"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        {/* Left: Image & Info */}
        <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
          {/* Thumbnail */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-black/[0.03] overflow-clip shrink-0 flex items-center justify-center border border-black/[0.04]">
            {product.bannerPath ? (
              <Image
                src={product.bannerPath}
                alt={product.name}
                fill
                sizes="96px"
                className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
              />
            ) : (
              <span className="text-xs text-[var(--ink-tertiary)]">No image</span>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mbe-1">
              <h3 className="text-base sm:text-lg font-medium text-[var(--ink)] tracking-tight truncate group-hover:text-[var(--accent)] transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]">
                {product.name}
              </h3>
              {pricing.isActive && (
                <Badge variant="accent">
                  {product.discountType === "percent"
                    ? `${product.discountValue}% OFF`
                    : `Save ${formatCents(pricing.discountCents)}`}
                </Badge>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[var(--ink-secondary)] line-clamp-2 max-w-lg mbe-2">
              {product.description}
            </p>

            {/* Stock badge */}
            <div className="flex items-center gap-2 text-xs">
              {isOutOfStock ? (
                <span className="text-[var(--error)] font-medium">Sold Out</span>
              ) : product.stockQty !== null ? (
                <span className="text-[var(--ink-tertiary)]">
                  {product.stockQty <= 5 ? `Only ${product.stockQty} left` : "In Stock"}
                </span>
              ) : (
                <span className="text-[var(--ink-tertiary)]">Made to Order</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Pricing & CTA */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 pbs-2 sm:pbs-0 border-t sm:border-t-0 border-black/[0.04]">
          <div className="text-left sm:text-right">
            {pricing.isActive ? (
              <div className="flex items-baseline gap-2">
                <span className="text-base sm:text-lg font-semibold text-[var(--ink)] tabular-nums">
                  <span className="sr-only">Sale price: </span>
                  {formatCents(pricing.finalPriceCents)}
                </span>
                <span className="text-xs text-[var(--ink-secondary)] line-through tabular-nums">
                  <span className="sr-only">Original price: </span>
                  {formatCents(product.priceCents)}
                </span>
              </div>
            ) : (
              <span className="text-base sm:text-lg font-semibold text-[var(--ink)] tabular-nums">
                {formatCents(product.priceCents)}
              </span>
            )}
          </div>

          <span className="text-xs font-medium text-[var(--accent)] group-hover:translate-x-0.5 transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center gap-1 sm:mbs-2">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
};
