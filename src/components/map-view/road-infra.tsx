import { useMap } from "@vis.gl/react-google-maps";
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

    const polylineObjects = lines.flatMap((line) =>
      line.coordinates.map(
        (coords) =>
          new google.maps.Polyline({
            path: coords as any,
            strokeColor: line.strokeColor,
            strokeOpacity: line.strokeOpacity,
            strokeWeight: line.strokeWeight,
            map: map,
          })
      )
    );

    // Cleanup when unmounting
    return () => {
      polylineObjects.forEach((polyline) => polyline.setMap(null));
    };
  }, [map, lines]);

  return null;
};
