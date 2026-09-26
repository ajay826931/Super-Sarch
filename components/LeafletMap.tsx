"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

interface LeafletMapProps {
  lat: number;
  lng: number;
  onPositionChange: (lat: number, lng: number) => void;
}

function LocationMarker({ lat, lng, onPositionChange }: LeafletMapProps) {
  // Listen for click events on the map
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend(e: any) {
        const marker = e.target;
        if (marker != null) {
          const newPos = marker.getLatLng();
          onPositionChange(newPos.lat, newPos.lng);
        }
      },
    }),
    [onPositionChange]
  );

  return (
    <Marker
      position={[lat, lng]}
      draggable={true}
      eventHandlers={eventHandlers}
    />
  );
}

export default function LeafletMap({ lat, lng, onPositionChange }: LeafletMapProps) {
  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-200 relative z-0">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker lat={lat} lng={lng} onPositionChange={onPositionChange} />
      </MapContainer>
    </div>
  );
}
