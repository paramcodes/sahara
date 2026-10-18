import React from "react";

export function AnnouncementBar({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <aside
      aria-label="Store Announcement"
      className="bg-[var(--accent)] text-white text-[11px] sm:text-xs font-medium py-2 px-4 text-center tracking-wide"
    >
      {text}
    </aside>
  );
}
