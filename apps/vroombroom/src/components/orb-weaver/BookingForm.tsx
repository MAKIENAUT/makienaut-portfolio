"use client";

import { useSearchParams } from "next/navigation";
import { AppointmentForm } from "@/components/orb-weaver/AppointmentForm";
import {
  ORB_WEAVER_SERVICES,
  type OrbWeaverServiceId,
} from "@/types/orb-weaver";

export function BookingForm() {
  const searchParams = useSearchParams();
  const requestedService = searchParams.get("service");
  const initialServiceId = ORB_WEAVER_SERVICES.some(
    (service) => service.id === requestedService && service.available
  )
    ? (requestedService as OrbWeaverServiceId)
    : undefined;

  return <AppointmentForm initialServiceId={initialServiceId} />;
}
