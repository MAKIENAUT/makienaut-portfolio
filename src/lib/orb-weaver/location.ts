export interface OrbWeaverGeoPoint {
  latitude: number;
  longitude: number;
}

export const ORB_WEAVER_MEETUP = {
  name: "SM Hypermarket Novaliches",
  label: "VroomBroom public meetup point",
  latitude: 14.6813322,
  longitude: 121.0213053,
  mapsUrl: "https://maps.app.goo.gl/DqEH4iSwjHqLLgQU6",
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
