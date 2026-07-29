export interface OrbWeaverGeoPoint {
  latitude: number;
  longitude: number;
}

export const ORB_WEAVER_MEETUP = {
  name: "Belton Drive",
  label: "In front of SM Hypermarket Novaliches",
  latitude: 14.68267928165286,
  longitude: 121.02078252192456,
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=14.68267928165286,121.02078252192456",
} as const;

export const getOrbWeaverPickupMapUrl = ({
  latitude,
  longitude,
}: OrbWeaverGeoPoint) =>
  `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

export const getOrbWeaverPickupDirectionsUrl = ({
  latitude,
  longitude,
}: OrbWeaverGeoPoint) =>
  `https://www.google.com/maps/dir/?api=1&origin=${ORB_WEAVER_MEETUP.latitude},${ORB_WEAVER_MEETUP.longitude}&destination=${latitude},${longitude}`;
