import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapViewV2 = () => {
  const position = [12.9716, 77.5946]; // Example: Bangalore

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      {/* OpenStreetMap Tiles */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* Marker Example */}
      <Marker position={position}>
        <Popup>Foxconn (Example Location)</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapViewV2;
