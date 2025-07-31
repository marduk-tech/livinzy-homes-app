import { useEffect, useState } from "react";
import { Polyline } from "react-leaflet";

interface FlickerPolylineProps {
  positions: L.LatLngExpression[];
  pathOptions: L.PathOptions;
  key: string;
  toFlicker: boolean;
}

export const FlickerPolyline: React.FC<FlickerPolylineProps> = ({
  positions,
  pathOptions,
  key,
  toFlicker,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible((v) => !v);
    }, 500); // Flicker every 500ms

    return () => clearInterval(interval);
  }, []);

  return (
    <Polyline
      key={key}
      positions={positions}
      pathOptions={{
        ...pathOptions,
        opacity: toFlicker ? (isVisible ? 1 : 0.3) : 1,
      }}
    />
  );
};
