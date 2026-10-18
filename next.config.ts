import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { remotePatterns: [] },
  experimental: {
    optimizePackageImports: ["zod"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
