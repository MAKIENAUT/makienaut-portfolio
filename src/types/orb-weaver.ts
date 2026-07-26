export const ORB_WEAVER_SERVICES = [
  {
    id: "essential_clean",
    name: "Essential clean",
    shortDescription: "A careful exterior, visor, and interior refresh.",
  },
  {
    id: "deep_clean",
    name: "Deep clean",
    shortDescription: "A more thorough reset for frequently used helmets.",
  },
  {
    id: "visor_refresh",
    name: "Visor refresh",
    shortDescription: "Focused cleaning for clearer, streak-free visibility.",
  },
  {
    id: "multiple_helmets",
    name: "Multiple helmets",
    shortDescription: "A coordinated clean for two or more helmets.",
  },
] as const;

export const ORB_WEAVER_TIME_WINDOWS = [
  { id: "morning", name: "Morning · 9:00 AM–12:00 PM" },
  { id: "afternoon", name: "Afternoon · 12:00–4:00 PM" },
  { id: "evening", name: "Evening · 4:00–7:00 PM" },
] as const;

export const ORB_WEAVER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "READY",
  "COMPLETED",
  "CANCELLED",
] as const;

export type OrbWeaverServiceId = (typeof ORB_WEAVER_SERVICES)[number]["id"];
export type OrbWeaverTimeWindow =
  (typeof ORB_WEAVER_TIME_WINDOWS)[number]["id"];
export type OrbWeaverAppointmentStatus =
  (typeof ORB_WEAVER_STATUSES)[number];

export interface NewOrbWeaverAppointment {
  customerName: string;
  email: string;
  phone: string;
  service: OrbWeaverServiceId;
  helmetCount: number;
  preferredDate: Date;
  preferredWindow: OrbWeaverTimeWindow;
  notes?: string;
  sourceFingerprint?: string;
}

export interface OrbWeaverAppointmentRecord {
  id: string;
  reference: string;
  customerName: string;
  email: string;
  phone: string;
  service: OrbWeaverServiceId;
  helmetCount: number;
  preferredDate: string;
  preferredWindow: OrbWeaverTimeWindow;
  notes: string | null;
  status: OrbWeaverAppointmentStatus;
  createdAt: string;
  updatedAt: string;
}
