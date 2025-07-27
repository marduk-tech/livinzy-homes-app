import { Flex, Typography } from "antd";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { useFetchAllLivindexPlaces } from "../../hooks/use-livindex-places";
import { SearchResult } from "../../hooks/use-place-search";
import { COLORS } from "../../theme/style-constants";
import { IDriverPlace } from "../../types/Project";
import { Loader } from "../common/loader";
import MapViewV2 from "../map-view/map-view-v2";
import { SearchSidebar } from "./search-sidebar";

export function MetroMapper() {
  const { data: livindexPlaces, isLoading: livindexPlacesLoading } =
    useFetchAllLivindexPlaces();

  const [transitDrivers, setTransitDrivers] = useState<IDriverPlace[]>([]);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const temporaryMarkerRef = useRef<L.Marker | null>(null);

  // Filter only transit drivers from all places
  useEffect(() => {
    if (livindexPlaces && livindexPlaces.length) {
      const transitOnly = livindexPlaces.filter(
        (place) => place.driver === "transit"
      );
      setTransitDrivers(transitOnly);
    }
  }, [livindexPlaces]);

  if (livindexPlacesLoading) {
    return <Loader />;
  }

  const addPersistentMarker = (result: SearchResult) => {
    if (!mapInstance) return;

    // Remove existing marker (replace previous marker)
    if (temporaryMarkerRef.current) {
      mapInstance.removeLayer(temporaryMarkerRef.current);
    }

    const markerIcon = L.divIcon({
      html: `
        <div style="
          width: 30px;
          height: 30px;
          background-color: #ff4444;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(255, 68, 68, 0.6);
          animation: pulse 1.5s infinite;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>
      `,
      className: "persistent-marker",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    // persistent marker with popup
    const marker = L.marker(result.coordinates, { icon: markerIcon })
      .bindPopup(
        `
        <div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <strong style="color: #333; font-size: 14px;">${
            result.name
          }</strong><br/>
          <span style="color: #666; font-size: 12px;">${
            result.description || ""
          }</span>
        </div>
      `,
        {
          closeButton: false,
          className: "persistent-popup",
        }
      )
      .addTo(mapInstance);

    marker.openPopup();

    temporaryMarkerRef.current = marker;
  };

  const handleSearchResultSelect = (result: SearchResult) => {
    if (!mapInstance) return;

    const zoomLevels = {
      transit: 19,
      locality: 16,
      project: 18,
      place: 18,
      osm: 17,
    };

    const targetZoom = zoomLevels[result.type] || 15;

    mapInstance.flyTo(result.coordinates, targetZoom, {
      duration: 1.5,
      easeLinearity: 0.25,
    });

    // Add persistent highlight marker
    setTimeout(() => {
      addPersistentMarker(result);
    }, 800);
  };

  return (
    <Flex vertical style={{ height: "calc(100vh - 64px)" }}>
      <Flex
        style={{
          padding: "16px 24px",
          backgroundColor: "white",
          zIndex: 1,
          borderBottom: `1px solid ${COLORS.borderColor}`,
        }}
      >
        <Typography.Title level={3} style={{ margin: 0 }}>
          Metro Lines & Transit Network
        </Typography.Title>
      </Flex>

      <Flex style={{ flex: 1 }}>
        <Flex
          style={{ width: "75%", position: "relative", minHeight: "600px" }}
        >
          <Flex
            style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              zIndex: 1000,
              backgroundColor: "white",
              padding: "8px 12px",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            <Typography.Text
              style={{ fontSize: 14, color: COLORS.textColorDark }}
            >
              {transitDrivers.length} metro lines displayed
            </Typography.Text>
          </Flex>

          <MapViewV2
            key="metro-mapper-view"
            drivers={transitDrivers.map((driver) => ({
              ...driver,
              // Add duration calculation for consistency with other map usages
              duration: driver.distance ? Math.round(driver.distance / 60) : 0,
            }))}
            fullSize={true}
            isFromTab={false}
            showLocalities={false}
            onMapReady={setMapInstance}
          />
        </Flex>

        <SearchSidebar
          onResultSelect={handleSearchResultSelect}
          transitDrivers={transitDrivers}
        />
      </Flex>
    </Flex>
  );
}
