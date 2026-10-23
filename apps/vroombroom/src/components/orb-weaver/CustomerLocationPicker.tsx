"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import {
  FaCheckCircle,
  FaCrosshairs,
  FaMapMarkerAlt,
} from "react-icons/fa";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import {
  ORB_WEAVER_MEETUP,
  type OrbWeaverGeoPoint,
} from "@/lib/orb-weaver/location";

interface CustomerLocationPickerProps {
  compact?: boolean;
  error?: string;
  onChange: (location: OrbWeaverGeoPoint) => void;
  value: OrbWeaverGeoPoint | null;
}

const normalizeCoordinate = (value: number) => Number(value.toFixed(6));

export function CustomerLocationPicker({
  compact = false,
  error,
  onChange,
  value,
}: CustomerLocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const onChangeRef = useRef(onChange);
  const [isMapReady, setIsMapReady] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "locating" | "pinned" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState(
    "Use your current location or tap the map to place the pickup pin."
  );

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | undefined;

    void import("leaflet").then((leaflet) => {
      if (cancelled || !containerRef.current || mapRef.current) {
        return;
      }

      leafletRef.current = leaflet;
      map = leaflet
        .map(containerRef.current, {
          attributionControl: true,
          zoomControl: true,
        })
        .setView(
          [ORB_WEAVER_MEETUP.latitude, ORB_WEAVER_MEETUP.longitude],
          13
        );

      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        })
        .addTo(map);

      map.on("click", ({ latlng }) => {
        onChangeRef.current({
          latitude: normalizeCoordinate(latlng.lat),
          longitude: normalizeCoordinate(latlng.lng),
        });
        setLocationStatus("pinned");
        setStatusMessage(
          "Pickup location pinned. Drag the marker if it needs adjustment."
        );
      });

      mapRef.current = map;
      setIsMapReady(true);
      window.setTimeout(() => map?.invalidateSize(), 0);
    });

    return () => {
      cancelled = true;
      markerRef.current = null;
      leafletRef.current = null;
      mapRef.current = null;
      map?.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const leaflet = leafletRef.current;

    if (!map || !leaflet) {
      return;
    }

    if (!value) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const latLng: [number, number] = [value.latitude, value.longitude];

    if (markerRef.current) {
      markerRef.current.setLatLng(latLng);
      return;
    }

    const markerIcon = leaflet.divIcon({
      className: "vroom-location-pin",
      html: '<span class="vroom-location-pin__dot" aria-hidden="true"></span>',
      iconAnchor: [18, 42],
      iconSize: [36, 44],
    });
    const marker = leaflet
      .marker(latLng, { draggable: true, icon: markerIcon })
      .addTo(map);

    marker.on("dragend", () => {
      const position = marker.getLatLng();
      onChangeRef.current({
        latitude: normalizeCoordinate(position.lat),
        longitude: normalizeCoordinate(position.lng),
      });
      setLocationStatus("pinned");
      setStatusMessage("Pickup location updated.");
    });

    markerRef.current = marker;
  }, [isMapReady, value]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setStatusMessage(
        "Location access is not supported here. Tap the map to place your pin."
      );
      return;
    }

    setLocationStatus("locating");
    setStatusMessage("Finding your current location…");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = {
          latitude: normalizeCoordinate(coords.latitude),
          longitude: normalizeCoordinate(coords.longitude),
        };

        onChangeRef.current(location);
        mapRef.current?.setView(
          [location.latitude, location.longitude],
          17,
          { animate: true }
        );
        setLocationStatus("pinned");
        setStatusMessage(
          "Pickup location pinned. Drag the marker if it needs adjustment."
        );
      },
      () => {
        setLocationStatus("error");
        setStatusMessage(
          "We could not access your location. Allow location access or tap the map instead."
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30_000,
        timeout: 12_000,
      }
    );
  };

  return (
    <div
      id="orb-pickup-location"
      tabIndex={-1}
      className={`rounded-2xl border ${compact ? "p-3" : "p-4"} ${
        error
          ? "border-red-400/40 bg-red-400/[0.04]"
          : "border-white/10 bg-black/20"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-white">Pin the pickup location</p>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            This private pin is saved with the appointment and is not shown
            publicly.
          </p>
        </div>
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locationStatus === "locating"}
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-wait disabled:opacity-60 ${
            compact ? "min-h-10" : "min-h-11"
          }`}
        >
          <FaCrosshairs aria-hidden="true" />
          {locationStatus === "locating"
            ? "Finding location…"
            : "Use my location"}
        </button>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-xl border border-white/10">
        <div
          ref={containerRef}
          role="application"
          aria-label="Pickup location map. Tap to place a pin or drag the existing marker."
          className={`w-full bg-[#171915] ${
            compact ? "h-48 sm:h-56" : "h-72 sm:h-80"
          }`}
        />
        {!isMapReady && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#171915] text-sm text-stone-500">
            Loading pickup map…
          </div>
        )}
      </div>

      <div
        className={`mt-3 flex items-start gap-2 text-xs leading-5 ${
          locationStatus === "error"
            ? "text-red-200"
            : value
            ? "text-emerald-200"
            : "text-stone-500"
        }`}
      >
        {value ? (
          <FaCheckCircle aria-hidden="true" className="mt-0.5 shrink-0" />
        ) : (
          <FaMapMarkerAlt aria-hidden="true" className="mt-0.5 shrink-0" />
        )}
        <span>{statusMessage}</span>
      </div>

      {value && (
        <p className="mt-2 text-[0.7rem] text-stone-600">
          Saved pin: {value.latitude.toFixed(6)},{" "}
          {value.longitude.toFixed(6)}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-200">
          {error}
        </p>
      )}

      <input
        type="hidden"
        name="pickupLatitude"
        value={value?.latitude ?? ""}
      />
      <input
        type="hidden"
        name="pickupLongitude"
        value={value?.longitude ?? ""}
      />
    </div>
  );
}
