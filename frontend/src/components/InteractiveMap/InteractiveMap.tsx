"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  InfoWindow,
  useJsApiLoader,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

const containerStyle = {
  width: "100%",
  height: "calc(100vh - 64px)",
};

// Mumbai Center
const center = { lat: 19.076, lng: 72.8777 };

const toLatLng = (coords: number[]) => ({
  lat: coords[0],
  lng: coords[1],
});

// --- TYPES ---
export interface PHCNode {
  id: string; // Changed to string to match UUID
  name: string;
  status: "healthy" | "warning" | "critical";
  coords: number[];
}

export interface TransferEdge {
  id: string;
  fromName: string;
  toName: string;
  from: number[];
  to: number[];
  progress: number[];
}

interface MapProps {
  phcs: PHCNode[];
  transfers: TransferEdge[];
  activeLayer: string;
}

export default function FullScreenInteractiveMap({ phcs, transfers, activeLayer }: MapProps) {
  const [showRoutes, setShowRoutes] = useState(true);
  const [activeInfo, setActiveInfo] = useState<string | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const vehicleMarkersRef = useRef<Record<string, google.maps.marker.AdvancedMarkerElement>>({});
  const phcMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  // Store directions result
  const [directions, setDirections] = useState<Record<string, google.maps.DirectionsResult>>({});

  /* Load Google Maps API */
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["marker"],
  });

  // --- 1. RENDER PHC MARKERS ---
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    // Clear old markers
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    }
    phcMarkersRef.current.forEach((m) => (m.map = null));
    phcMarkersRef.current = [];

    // Create new markers
    const markers = phcs.map((p) => {
      const color =
        p.status === "critical"
          ? "#EF4444" // Red
          : p.status === "warning"
          ? "#EAB308" // Yellow
          : "#22C55E"; // Green

      // Create Pin Element (Note: AdvancedMarkerElement requires a DOM element)
      const pin = document.createElement("div");
      pin.style.backgroundColor = color;
      pin.style.width = "16px";
      pin.style.height = "16px";
      pin.style.borderRadius = "50%";
      pin.style.border = "2px solid white";
      pin.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position: toLatLng(p.coords),
        content: pin,
        title: p.name,
      });

      marker.addListener("click", () => setActiveInfo(p.id));
      return marker;
    });

    phcMarkersRef.current = markers;
    
    // Add to clusterer
    clustererRef.current = new MarkerClusterer({
      markers,
      map: mapRef.current,
    });

  }, [phcs, isLoaded]); // Re-run when PHC data changes

  // --- 2. RENDER & ANIMATE VEHICLES ---
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    // Initialize/Update Vehicle Markers
    transfers.forEach((t) => {
      if (!vehicleMarkersRef.current[t.id]) {
        const pin = document.createElement("div");
        pin.innerHTML = "🚚"; // Emoji as truck
        pin.style.fontSize = "20px";

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map: mapRef.current,
          position: toLatLng(t.progress), // Start at current progress
          content: pin,
          title: `Transfer to ${t.toName}`,
        });

        marker.addListener("click", () => setActiveInfo(t.id));
        vehicleMarkersRef.current[t.id] = marker;
      }
    });

    // Cleanup old transfers
    Object.keys(vehicleMarkersRef.current).forEach(key => {
        if (!transfers.find(t => t.id === key)) {
            vehicleMarkersRef.current[key].map = null;
            delete vehicleMarkersRef.current[key];
        }
    });

    // Fetch Directions for Routes
    if (window.google) {
      const service = new google.maps.DirectionsService();
      transfers.forEach((t) => {
        if (!directions[t.id]) {
          service.route(
            {
              origin: toLatLng(t.from),
              destination: toLatLng(t.to),
              travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === "OK" && result) {
                setDirections((prev) => ({ ...prev, [t.id]: result }));
              }
            }
          );
        }
      });
    }

    // Animation Loop
    const interval = setInterval(() => {
      transfers.forEach((t) => {
        const marker = vehicleMarkersRef.current[t.id];
        if (!marker) return;

        // Simple Linear Interpolation (Lerp) towards destination for demo
        // In real app, follow the polyline
        const currentPos = marker.position as google.maps.LatLngLiteral;
        if (!currentPos) return;

        const dest = toLatLng(t.to);
        const step = 0.005; // Speed factor
        
        const newLat = currentPos.lat + (dest.lat - currentPos.lat) * step;
        const newLng = currentPos.lng + (dest.lng - currentPos.lng) * step;

        marker.position = { lat: newLat, lng: newLng };
      });
    }, 100); // Smooth 60fps-ish

    return () => clearInterval(interval);
  }, [transfers, isLoaded]);


  // --- RENDER ---
  if (loadError) return <div className="h-full flex items-center justify-center">Map Error</div>;
  if (!isLoaded) return <div className="h-full flex items-center justify-center">Loading Map...</div>;

  return (
    <div className="relative w-full h-full">
      <button
        onClick={() => setShowRoutes(!showRoutes)}
        className="absolute top-4 right-4 z-50 px-3 py-1 bg-white border shadow rounded text-xs font-semibold"
      >
        {showRoutes ? "Hide Routes" : "Show Routes"}
      </button>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={11}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID, // Use a Map ID for Advanced Markers
        }}
      >
        {/* Render Route Lines */}
        {showRoutes && activeLayer !== "lowStock" &&
          transfers.map((t) => (
            <React.Fragment key={t.id}>
              {directions[t.id] && (
                <DirectionsRenderer
                  options={{
                    directions: directions[t.id],
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: "#2563EB", // Blue-600
                      strokeWeight: 4,
                      strokeOpacity: 0.7,
                    },
                  }}
                />
              )}

              {activeInfo === t.id && (
                <InfoWindow
                  position={toLatLng(t.progress)} // Show info at truck location
                  onCloseClick={() => setActiveInfo(null)}
                >
                  <div className="p-1">
                    <div className="font-bold text-xs text-blue-600">IN TRANSIT</div>
                    <div className="text-xs">{t.fromName} ➝ {t.toName}</div>
                  </div>
                </InfoWindow>
              )}
            </React.Fragment>
          ))}

        {/* PHC Info Windows */}
        {phcs.map(
          (p) =>
            activeInfo === p.id && (
              <InfoWindow
                key={p.id}
                position={toLatLng(p.coords)}
                onCloseClick={() => setActiveInfo(null)}
              >
                <div className="p-1">
                  <strong className="text-sm">{p.name}</strong>
                  <div className={`text-xs uppercase font-bold mt-1 ${
                      p.status === 'critical' ? 'text-red-600' : 
                      p.status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {p.status}
                  </div>
                </div>
              </InfoWindow>
            )
        )}
      </GoogleMap>
    </div>
  );
}