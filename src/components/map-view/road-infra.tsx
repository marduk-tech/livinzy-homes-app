import { useMap } from "@vis.gl/react-google-maps";
import { Card, Tag } from "antd";
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
    const extractedLines: LineFeature[] =
      (roadData?.features
        .map((feature: any) => {
          const {
            stroke = COLORS.primaryColor,
            "stroke-opacity": strokeOpacity = 1,
            "stroke-width": strokeWeight = 5,
          } = feature.properties;

          // const roadName = feature.properties.name
          //   ? feature.properties.name
          //   : feature.properties.wikipedia
          //   ? feature.properties.wikipedia.startsWith("en:")
          //     ? feature.properties.wikipedia.slice(3)
          //     : feature.properties.wikipedia
          //   : "";

          const roadName = roadData.name.startsWith("en:")
            ? roadData.name.slice(3)
            : roadData.name;

          console.log(feature);

          if (feature.geometry.type === "LineString") {
            const coordinates: LatLng[] = feature.geometry.coordinates.map(
              ([lng, lat]: [number, number]) => ({ lat, lng })
            );

            return {
              name: roadName,
              coordinates: [coordinates],
              strokeColor: stroke,
              strokeOpacity: strokeOpacity,
              strokeWeight: strokeWeight,
            };
          } else if (feature.geometry.type === "MultiLineString") {
            const coordinates: LatLng[][] = feature.geometry.coordinates.map(
              (line: [number, number, number][]) =>
                line.map(([lng, lat]: [number, number, number]) => ({
                  lat,
                  lng,
                }))
            );
            return {
              name: roadName,
              coordinates,
              strokeColor: stroke,
              strokeOpacity: strokeOpacity,
              strokeWeight: strokeWeight,
            };
          }
          return null;
        })
        .filter(Boolean) as LineFeature[]) || [];

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

  useEffect(() => {
    const handleScroll = () => {
      setSelectedLine(null);
      setPopupPosition(null);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <>
        {selectedLine && popupPosition && selectedLine.name && (
          <div
            style={{
              position: "fixed",
              left: popupPosition.x,
              top: popupPosition.y,
              zIndex: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              borderRadius: "10px",
              maxWidth: "300px",
              backgroundColor: "white",
            }}
          >
            <div style={{ padding: "8px" }}>
              <strong>{selectedLine.name}</strong>

              {roadData?.features.length > 1 && (
                <div style={{ marginBottom: "8px", marginTop: "8px" }}>
                  {roadData.features?.map((feature: any, index: number) => (
                    <Tag
                      color="blue"
                      key={index}
                      style={{
                        marginRight: "4px",
                        marginBottom: "4px",
                      }}
                    >
                      {feature?.properties?.name}
                    </Tag>
                  ))}
                </div>
              )}

              <p>{roadData?.description}</p>
            </div>
          </div>
        )}
      </>
    </>
  );
};
