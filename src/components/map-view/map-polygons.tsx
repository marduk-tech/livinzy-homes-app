import { useEffect, useState } from "react";
import { Polygon, useMap } from "react-leaflet";
import { COLORS } from "../../theme/style-constants";

export const MapPolygons = ({
  driversData,
  selectedDriverTypes,
  setModalContent,
  setInfoModalOpen,
}: {
  driversData: any[];
  selectedDriverTypes: string[];
  setModalContent: (content: any) => void;
  setInfoModalOpen: (open: boolean) => void;
}) => {
  const map = useMap();
  const [visiblePolygons, setVisiblePolygons] = useState<
    Array<{
      id: string;
      positions: [number, number][];
      name: string;
      description: string;
    }>
  >([]);

  const updateVisiblePolygons = () => {
    const zoom = map.getZoom();
    const bounds = map.getBounds();

    if (zoom >= 14) {
      const polygons = driversData
        ?.filter(
          (driver) =>
            driver.details?.osm?.geojson &&
            (selectedDriverTypes.length === 0 ||
              selectedDriverTypes.includes(driver.driver))
        )
        .map((driver) => {
          try {
            console.log("GeoJSON data:", driver.details.osm.geojson);

            // Handle case where geojson might be string or object
            const geojson =
              typeof driver.details.osm.geojson === "string"
                ? JSON.parse(driver.details.osm.geojson)
                : driver.details.osm.geojson;

            if (!geojson || geojson.type !== "Polygon") {
              console.log("Invalid polygon data:", geojson);
              return null;
            }

            const positions = geojson.coordinates[0].map(
              ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
            );

            // Check if any point is within bounds
            if (
              positions.some((pos: [number, number]) => bounds.contains(pos))
            ) {
              return {
                id: driver._id,
                positions,
                name: driver.name,
                description: driver.details?.description || "",
              };
            }
          } catch (error) {
            console.error("Error parsing GeoJSON:", error);
          }
          return null;
        })
        .filter(
          (
            p
          ): p is {
            id: string;
            positions: [number, number][];
            name: string;
            description: string;
          } => p !== null
        );

      setVisiblePolygons(polygons || []);
    } else {
      setVisiblePolygons([]);
    }
  };

  useEffect(() => {
    updateVisiblePolygons(); // Initial update

    map.on("zoomend", updateVisiblePolygons);
    map.on("moveend", updateVisiblePolygons);

    return () => {
      map.off("zoomend", updateVisiblePolygons);
      map.off("moveend", updateVisiblePolygons);
    };
  }, [map, driversData, selectedDriverTypes]);

  return (
    <>
      {visiblePolygons.map((poly) => (
        <Polygon
          key={`polygon-${poly.id}`}
          positions={poly.positions}
          pathOptions={{
            color: COLORS.redIdentifier,
            weight: 3,
            fillOpacity: 0.4,
            fillColor: COLORS.redIdentifier,
          }}
          eventHandlers={{
            click: () => {
              setModalContent({
                title: poly.name,
                content: poly.description,
              });
              setInfoModalOpen(true);
            },
          }}
        />
      ))}
    </>
  );
};
