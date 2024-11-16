import { useMap } from "@vis.gl/react-google-maps";
import { Card } from "antd";
import { useEffect, useState } from "react";
import { COLORS } from "../../theme/style-constants";

interface LatLng {
  lat: number;
  lng: number;
}

interface LineFeature {
  name: string;
  coordinates: LatLng[];
  strokeColor: string;
  strokeOpacity: number;
  strokeWeight: number;
}

export const RoadInfra: React.FC<any> = ({ roadData }) => {
  const map = useMap();
  const [lines, setLines] = useState<LineFeature[]>([]);

  const [selectedLine, setSelectedLine] = useState<LineFeature | null>(null);
  const [popupPosition, setPopupPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const extractedLines: LineFeature[] = roadData.features
      .map((feature: any) => {
        const {
          stroke = COLORS.primaryColor,
          "stroke-opacity": strokeOpacity = 1,
          "stroke-width": strokeWeight = 5,
        } = feature.properties;

        if (feature.geometry.type === "LineString") {
          const coordinates: LatLng[] = feature.geometry.coordinates.map(
            ([lng, lat]: [number, number]) => ({ lat, lng })
          );

          return {
            name: feature.properties.name,
            coordinates: [coordinates],
            strokeColor: stroke,
            strokeOpacity: strokeOpacity,
            strokeWeight: strokeWeight,
          };
        } else if (feature.geometry.type === "MultiLineString") {
          const coordinates: LatLng[][] = feature.geometry.coordinates.map(
            (line: [number, number, number][]) =>
              line.map(([lng, lat]: [number, number, number]) => ({ lat, lng }))
          );
          return {
            name: feature.properties.name,
            coordinates,
            strokeColor: stroke,
            strokeOpacity: strokeOpacity,
            strokeWeight: strokeWeight,
          };
        }
        return null;
      })
      .filter(Boolean) as LineFeature[];

    setLines(extractedLines);
  }, []);

  useEffect(() => {
    if (!map) return;

    const mapListeners = [
      map.addListener("click", () => {
        setSelectedLine(null);
        setPopupPosition(null);
      }),
      map.addListener("dragstart", () => {
        setSelectedLine(null);
        setPopupPosition(null);
      }),
      map.addListener("zoom_changed", () => {
        setSelectedLine(null);
        setPopupPosition(null);
      }),
    ];

    const polylineObjects = lines.flatMap((line) =>
      line.coordinates.map((coords) => {
        const polyline = new google.maps.Polyline({
          path: coords as any,
          strokeColor: line.strokeColor,
          strokeOpacity: line.strokeOpacity,
          strokeWeight: line.strokeWeight,
          map: map,
        });

        polyline.addListener("click", (e: any) => {
          e.stop();
          setSelectedLine(line);
          setPopupPosition({
            x: e.domEvent.clientX,
            y: e.domEvent.clientY,
          });
        });

        return polyline;
      })
    );

    // Cleanup when unmounting
    return () => {
      polylineObjects.forEach((polyline) => {
        google.maps.event.clearListeners(polyline, "click");
        polyline.setMap(null);
      });
      mapListeners.forEach((listener) =>
        google.maps.event.removeListener(listener)
      );
    };
  }, [map, lines]);

  return (
    <>
      <>
        {selectedLine && popupPosition && selectedLine.name && (
          <div
            style={{
              position: "fixed",
              left: popupPosition.x,
              top: popupPosition.y,
              zIndex: 1000,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              borderRadius: "10px",
              maxWidth: "200px",
              backgroundColor: "white",
            }}
          >
            <div style={{ padding: "8px" }}>
              <strong>{selectedLine.name}</strong>
            </div>
          </div>
        )}
      </>
    </>
  );
};
