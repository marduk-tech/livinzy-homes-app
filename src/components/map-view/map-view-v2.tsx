import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const MapViewV2 = () => {
  return (
    <MapContainer
      center={[12.9716, 77.5946]}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      {/* OpenStreetMap Tiles */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* Marker Example */}
      <Marker position={[12.9716, 77.5946]}>
        <Popup>Foxconn (Example Location)</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapViewV2;
