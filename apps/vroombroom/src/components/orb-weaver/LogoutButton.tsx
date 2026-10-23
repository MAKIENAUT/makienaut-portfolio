"use client";

import { useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";

interface OrbWeaverLogoutButtonProps {
  compactOnMobile?: boolean;
}

export function OrbWeaverLogoutButton({
  compactOnMobile = false,
}: OrbWeaverLogoutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = async () => {
    setIsSigningOut(true);

    try {
      await fetch("/api/orb-weaver/session", { method: "DELETE" });
    } finally {
      window.location.assign("/vroombroom/backoffice/login");
    }
  };

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={isSigningOut}
      aria-label={compactOnMobile ? "Sign out" : undefined}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-stone-200 transition hover:border-amber-300/30 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:opacity-60 sm:px-4"
    >
      <FaSignOutAlt aria-hidden="true" />
      <span className={compactOnMobile ? "sr-only sm:not-sr-only" : undefined}>
        {isSigningOut ? "Signing out…" : "Sign out"}
      </span>
    </button>
  );
}
