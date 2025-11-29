"use client";

import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { useState, useEffect } from "react";

export default function LiveVehicleTracking() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||"",
  });

  const [vehiclePos, setVehiclePos] = useState({ lat: 15.2900, lng: 73.9580 });
  const [showInfo, setShowInfo] = useState(false);

  const driver = {
    name: "Rohit Naik",
    phone: "+91 9876543210",
    vehicle: "Mahindra Bolero Ambulance",
    number: "GA-09 T 4456",
  };

  const containerStyle = {
    width: "100%",
    height: "380px",
    borderRadius: "12px",
  };

  const destination = { lat: 15.2993, lng: 74.1230 };

  // Simulate slow vehicle movement
  useEffect(() => {
    const interval = setInterval(() => {
      setVehiclePos((prev) => {
        const lat = prev.lat + (destination.lat - prev.lat) * 0.005;
        const lng = prev.lng + (destination.lng - prev.lng) * 0.005;
        return { lat, lng };
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div style={styles.screen}>
      <h2 style={styles.title}>Live Vehicle Tracking</h2>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={vehiclePos}
        zoom={10}
      >
        <Marker
          position={vehiclePos}
          onClick={() => setShowInfo(true)}
        />

        {showInfo && (
          <InfoWindow
            position={vehiclePos}
            onCloseClick={() => setShowInfo(false)}
          >
            <div>
              <strong>Ambulance</strong>
              <p>{driver.name}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Details Panel */}
      <div style={styles.detailsBox}>
        <div style={styles.row}>
          <span style={styles.label}>Driver Name:</span>
          <span style={styles.value}>{driver.name}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Vehicle:</span>
          <span style={styles.value}>{driver.vehicle}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Vehicle Number:</span>
          <span style={styles.value}>{driver.number}</span>
        </div>

        <button
          style={styles.callBtn}
          onClick={() => window.open(`tel:${driver.phone}`)}
        >
          Call Driver
        </button>
      </div>
    </div>
  );
}

const styles = {
  screen: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
  title: {
    fontSize: "22px",
    fontWeight: "600",
    marginBottom: "16px",
  },
  detailsBox: {
    background: "#ffffff",
    borderRadius: "12px",
    marginTop: "20px",
    padding: "18px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  row: {
    marginBottom: "12px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#64748B",
  },
  value: {
    display: "block",
    marginTop: "2px",
    fontSize: "15px",
    color: "#1E293B",
  },
  callBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "12px",
    background: "#2563EB",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: "600",
  },
};