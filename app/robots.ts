import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: ["OAI-SearchBot", "PerplexityBot", "GoogleOther"], allow: "/" },
      {
        userAgent: [
          "GPTBot",
          "Google-Extended",
          "CCBot",
          "anthropic-ai",
          "ClaudeBot",
          "Bytespider",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
