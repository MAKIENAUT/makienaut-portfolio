"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type MouseEvent,
  type ReactNode,
  useEffect,
  useState,
} from "react";

interface PendingNavigationLinkProps {
  children: ReactNode;
  className: string;
  eagerPrefetch?: boolean;
  href: string;
  pendingLabel: string;
  prefetch?: boolean;
}

const ROUTE_PREFETCH_REFRESH_MS = 305_000;

export function PendingNavigationLink({
  children,
  className,
  eagerPrefetch = false,
  href,
  pendingLabel,
  prefetch = true,
}: PendingNavigationLinkProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!eagerPrefetch || !prefetch) {
      return;
    }

    const keepRouteWarm = () => router.prefetch(href);
    keepRouteWarm();
    const refreshInterval = window.setInterval(
      keepRouteWarm,
      ROUTE_PREFETCH_REFRESH_MS
    );

    return () => window.clearInterval(refreshInterval);
  }, [eagerPrefetch, href, prefetch, router]);

  const warmRoute = () => {
    if (prefetch) {
      router.prefetch(href);
    }
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    setIsPending(true);
  };

  return (
    <>
      {isPending && (
        <span
          aria-hidden="true"
          className="fixed inset-x-0 top-0 z-[200] h-1 overflow-hidden bg-amber-300/20"
        >
          <span className="block h-full w-full animate-pulse bg-amber-400" />
        </span>
      )}
      <Link
        href={href}
        prefetch={prefetch}
        onClick={handleClick}
        onFocus={warmRoute}
        onPointerEnter={warmRoute}
        onTouchStart={warmRoute}
        aria-disabled={isPending}
        className={className}
      >
        {isPending ? (
          <>
            <span
              aria-hidden="true"
              className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
            />
            <span role="status" aria-live="polite">
              {pendingLabel}
            </span>
          </>
        ) : (
          children
        )}
      </Link>
    </>
  );
}
