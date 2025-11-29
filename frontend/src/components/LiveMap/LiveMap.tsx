"use client";

import { GoogleMap, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { useRef, useState } from "react";

export type NetworkStatus = "critical" | "warning" | "healthy";

export interface PHCMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  criticalItem: string;
  daysOfStockLeft: number;
  status: NetworkStatus;
}

const pinColors: Record<NetworkStatus, string> = {
  critical: "#dc2626", // red-600
  warning: "#facc15", // yellow-400
  healthy: "#22c55e", // green-500
};

export default function LiveMap({ phcList }: { phcList: PHCMarker[] }) {
  const [activePHC, setActivePHC] = useState<PHCMarker | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRefs = useRef<Record<string, google.maps.marker.AdvancedMarkerElement>>(
    {}
  );

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["marker"],
  });

  const mapCenter = { lat: 19.076, lng: 72.8777 };

  const createMarkers = () => {
    if (!mapRef.current) return;

    phcList.forEach((phc) => {
      const color = pinColors[phc.status];

      // SVG pin element
      const svgMarkup = `
        <svg width="50" height="50" viewBox="0 0 24 24">
          <path
            fill="${color}"
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5
              c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"
          />
        </svg>
      `;

      const wrapper = document.createElement("div");
      wrapper.innerHTML = svgMarkup;
      wrapper.style.cursor = "pointer";
      wrapper.style.width = "50px";
      wrapper.style.height = "50px";
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";
      wrapper.style.justifyContent = "center";
      wrapper.style.position = "absolute";
      wrapper.style.transform = "translate(-50%, -100%)";

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position: { lat: phc.latitude, lng: phc.longitude },
        content: wrapper,
      });

      marker.addListener("click", () => setActivePHC(phc));

      markerRefs.current[phc.id] = marker;
    });
  };

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={mapCenter}
        zoom={11}
        onLoad={(map) => {
          mapRef.current = map;
          createMarkers();
        }}
        options={{
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID,
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {activePHC && (
          <InfoWindow
            position={{
              lat: activePHC.latitude,
              lng: activePHC.longitude,
            }}
            onCloseClick={() => setActivePHC(null)}
          >
            <div className="space-y-1">
              <h3 className="font-bold text-lg">{activePHC.name}</h3>

              <div className="text-sm">
                <p><b>Critical Item:</b> {activePHC.criticalItem}</p>

                <p>
                  <b>Days of Stock Left:</b>{" "}
                  <span
                    className={
                      activePHC.daysOfStockLeft < 7
                        ? "text-red-600 font-semibold"
                        : activePHC.daysOfStockLeft < 15
                        ? "text-yellow-600 font-semibold"
                        : "text-green-600 font-semibold"
                    }
                  >
                    {activePHC.daysOfStockLeft} days
                  </span>
                </p>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}