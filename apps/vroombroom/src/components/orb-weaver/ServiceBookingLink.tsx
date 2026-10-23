import type { ReactNode } from "react";
import type { OrbWeaverServiceId } from "@/types/orb-weaver";
import { PendingNavigationLink } from "@/components/orb-weaver/PendingNavigationLink";

interface ServiceBookingLinkProps {
  children: ReactNode;
  className: string;
  serviceId: OrbWeaverServiceId;
}

export function ServiceBookingLink({
  children,
  className,
  serviceId,
}: ServiceBookingLinkProps) {
  return (
    <PendingNavigationLink
      href={`/vroombroom/book?service=${serviceId}`}
      className={className}
      pendingLabel="Opening…"
    >
      {children}
    </PendingNavigationLink>
  );
}
