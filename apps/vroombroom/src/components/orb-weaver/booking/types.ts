import type { OrbWeaverGeoPoint } from "@/lib/orb-weaver/location";
import type {
  ORB_WEAVER_ADD_ONS,
  OrbWeaverServiceId,
  OrbWeaverTimeWindow,
} from "@/types/orb-weaver";

export type FormState =
  | { status: "idle"; message?: undefined; reference?: undefined }
  | { status: "submitting"; message?: undefined; reference?: undefined }
  | { status: "success"; message: string; reference: string }
  | { status: "error"; message: string; reference?: undefined };

export interface AppointmentFormProps {
  initialServiceId?: OrbWeaverServiceId;
}

export type ReviewValues = Record<string, string>;

export interface BookingStep {
  label: string;
  title: string;
  description: string;
}

export const BOOKING_STEPS: readonly BookingStep[] = [
  {
    label: "Contact",
    title: "How can we reach you?",
    description: "We only use these details to confirm this booking.",
  },
  {
    label: "Cleaning",
    title: "Choose your helmet care",
    description: "Pick a cleaning option and any useful extras.",
  },
  {
    label: "Schedule",
    title: "Choose a handoff schedule",
    description:
      "Choose how the helmet changes hands, then allow at least a 2-hour cleaning buffer.",
  },
  {
    label: "Review",
    title: "Review your request",
    description: "Check the essentials before sending it to VroomBroom.",
  },
] as const;

export const inputClasses =
  "min-h-11 w-full rounded-xl border border-white/10 bg-black/35 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20";
export const labelClasses = "mb-1.5 block text-sm font-medium text-stone-200";

export const isAddOnIncluded = (
  addOn: (typeof ORB_WEAVER_ADD_ONS)[number],
  serviceId: OrbWeaverServiceId | ""
) => (addOn.includedIn as readonly string[]).includes(serviceId);

export const formatReviewDate = (value?: string) => {
  if (!value) {
    return "Not selected";
  }

  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00+08:00`));
};
