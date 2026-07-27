export const ORB_WEAVER_SERVICES = [
  {
    id: "deep_clean",
    name: "Deep Clean",
    price: 300,
    priceSuffix: "per helmet",
    minimumHelmets: 1,
    available: true,
    popular: true,
    shortDescription:
      "A thorough interior treatment for frequently used helmets.",
    inclusions: [
      "Removable liner hand wash",
      "Vent and crevice detailing",
      "Odor neutralizing",
      "Strap cleaning",
    ],
  },
  {
    id: "visor_refresh",
    name: "Full Reset",
    price: 350,
    priceSuffix: "per helmet",
    minimumHelmets: 1,
    available: false,
    popular: false,
    shortDescription:
      "The complete refresh for helmets that need extra attention.",
    inclusions: [
      "Everything in Deep Clean",
      "Heavy odor or grime treatment",
      "Exterior buffing and protective finish",
    ],
  },
  {
    id: "multiple_helmets",
    name: "Multi-Helmet Deep Clean",
    price: 250,
    priceSuffix: "each · minimum 2",
    minimumHelmets: 2,
    available: true,
    popular: false,
    shortDescription:
      "Deep Clean treatment for two or more helmets in one booking.",
    inclusions: [
      "Deep Clean treatment for every helmet",
      "₱250 per helmet · minimum 2",
      "Free pickup and return within 10 km",
    ],
  },
] as const;

export const ORB_WEAVER_ADD_ONS = [
  {
    id: "visor_waterproof_coating",
    name: "Visor Waterproof Coating",
    price: 20,
    perBooking: false,
    includedIn: [],
  },
  {
    id: "helmet_bag",
    name: "Helmet Bag Cleaning",
    price: 20,
    perBooking: false,
    includedIn: [],
  },
  {
    id: "rush_service",
    name: "Rush Service (if available)",
    price: 75,
    perBooking: true,
    includedIn: [],
  },
] as const;

export const ORB_WEAVER_LEGACY_SERVICE_NAMES: Readonly<
  Record<string, string>
> = {
  essential_clean: "Standard Clean (legacy)",
};

export const ORB_WEAVER_TIME_WINDOWS = [
  {
    id: "weekday_evening",
    name: "Weekday handoff · 7:30–9:30 PM",
    shortName: "7:30–9:30 PM",
    completionTime: "Next day · 6:00–7:30 AM",
    handoffEndMinutes: 21 * 60 + 30,
    availability: "weekday",
  },
  {
    id: "weekend_morning",
    name: "Weekend morning · 7:00 AM–12:00 PM",
    shortName: "7:00 AM–12:00 PM",
    completionTime: "9:00 AM–2:00 PM",
    handoffEndMinutes: 12 * 60,
    availability: "weekend",
  },
  {
    id: "weekend_afternoon",
    name: "Weekend afternoon · 12:00–5:00 PM",
    shortName: "12:00–5:00 PM",
    completionTime: "2:00–7:00 PM",
    handoffEndMinutes: 17 * 60,
    availability: "weekend",
  },
  {
    id: "weekend_evening",
    name: "Weekend evening · 5:00–9:00 PM",
    shortName: "5:00–9:00 PM",
    completionTime: "7:00–11:00 PM",
    handoffEndMinutes: 21 * 60,
    availability: "weekend",
  },
] as const;

export const ORB_WEAVER_LEGACY_TIME_WINDOW_NAMES: Readonly<
  Record<string, string>
> = {
  morning: "Morning · 9:00 AM–12:00 PM (legacy)",
  afternoon: "Afternoon · 12:00–4:00 PM (legacy)",
  evening: "Evening · 4:00–7:00 PM (legacy)",
};

export const ORB_WEAVER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "READY",
  "COMPLETED",
  "CANCELLED",
] as const;

export const ORB_WEAVER_HANDOFF_METHODS = [
  "drop_off",
  "pickup_return",
] as const;

export type OrbWeaverServiceId = (typeof ORB_WEAVER_SERVICES)[number]["id"];
export type OrbWeaverTimeWindow =
  (typeof ORB_WEAVER_TIME_WINDOWS)[number]["id"];
export type OrbWeaverAppointmentStatus =
  (typeof ORB_WEAVER_STATUSES)[number];
export type OrbWeaverHandoffMethod =
  (typeof ORB_WEAVER_HANDOFF_METHODS)[number];

export interface OrbWeaverRequestedAddOn {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface NewOrbWeaverAppointment {
  customerName: string;
  email: string;
  phone: string;
  service: OrbWeaverServiceId;
  helmetCount: number;
  preferredDate: Date;
  preferredWindow: OrbWeaverTimeWindow;
  handoffMethod: OrbWeaverHandoffMethod;
  handoffWindow: string;
  completionWindow: string;
  pickupArea?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  requestedAddOns: OrbWeaverRequestedAddOn[];
  serviceUnitPrice: number;
  addOnSubtotal: number;
  estimatedSubtotal: number;
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
  handoffMethod: OrbWeaverHandoffMethod | null;
  handoffWindow: string | null;
  completionWindow: string | null;
  pickupArea: string | null;
  pickupLatitude: number | null;
  pickupLongitude: number | null;
  requestedAddOns: OrbWeaverRequestedAddOn[];
  serviceUnitPrice: number | null;
  addOnSubtotal: number | null;
  estimatedSubtotal: number | null;
  notes: string | null;
  status: OrbWeaverAppointmentStatus;
  createdAt: string;
  updatedAt: string;
}
