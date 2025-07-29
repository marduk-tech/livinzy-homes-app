import { Button, Flex, Modal, Typography } from "antd";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { useDevice } from "../../hooks/use-device";
import { useFetchAllLivindexPlaces } from "../../hooks/use-livindex-places";
import { SearchResult } from "../../hooks/use-place-search";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { IDriverPlace } from "../../types/Project";
import DynamicReactIcon from "../common/dynamic-react-icon";
import { Loader } from "../common/loader";
import MapViewV2 from "../map-view/map-view-v2";
import { SearchSidebar } from "./search-sidebar";

export function MetroMapper() {
  const { data: livindexPlaces, isLoading: livindexPlacesLoading } =
    useFetchAllLivindexPlaces(undefined, ["transit"]);

  const [transitDrivers, setTransitDrivers] = useState<IDriverPlace[]>([]);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const temporaryMarkerRef = useRef<L.Marker | null>(null);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);

  const { isMobile } = useDevice();

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
          background-color: ${COLORS.primaryColor};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(56, 182, 255, 0.6);
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

  const SearchContainer = () => {
    return (
      <Flex
        style={{
          width: isMobile ? "100%" : "30%",
        }}
      >
        <SearchSidebar
          onResultSelect={handleSearchResultSelect}
          transitDrivers={transitDrivers}
        />
      </Flex>
    );
  };

  return (
    <Flex
      vertical
      style={{ height: "calc(100vh - 104px)", marginTop: 24, marginBottom: 16 }}
    >
      <Flex
        vertical
        style={{ marginBottom: 0, padding: isMobile ? "0 16px" : 0 }}
      >
        <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_1, lineHeight: "120%" }}
        >
          Find if a metro is coming near you!
        </Typography.Text>
        <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_3, marginBottom: 24 }}
        >
          This tool helps you find any nearest operational or upcoming metro or
          suburban railway stations.
        </Typography.Text>
      </Flex>
      <Flex style={{ flex: 1 }} vertical={isMobile}>
        {isMobile && <SearchContainer></SearchContainer>}
        <Flex
          style={{
            width: isMobile ? "100%" : "70%",
            position: "relative",
            height: isMobile ? 400 : "100%",
          }}
        >
          {!isMapFullScreen && (
            <Flex
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 9999,
              }}
            >
              <Button
                size="small"
                icon={
                  <DynamicReactIcon
                    iconName="FaExpand"
                    color="white"
                    iconSet="fa"
                    size={16}
                  />
                }
                style={{
                  marginLeft: "auto",
                  marginBottom: 8,
                  borderRadius: 8,
                  cursor: "pointer",
                  backgroundColor: COLORS.textColorDark,
                  color: "white",
                  fontSize: FONT_SIZE.HEADING_4,
                  height: 28,
                }}
                onClick={() => {
                  setIsMapFullScreen(true);
                }}
              >
                Expand
              </Button>
            </Flex>
          )}

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
            showCorridors={false}
          />
        </Flex>

        {!isMobile && <SearchContainer></SearchContainer>}
      </Flex>

      {/* Full map view modal */}
      <Modal
        title={null}
        open={isMapFullScreen}
        onCancel={() => {
          setIsMapFullScreen(false);
        }}
        mask={true}
        forceRender
        footer={null}
        width={isMobile ? "100%" : 900}
        style={{ top: 10 }}
        styles={{
          content: {
            backgroundColor: COLORS.bgColorMedium,
            borderRadius: 8,
            padding: 0,
            overflowY: "hidden",
          },
        }}
      >
        <Flex
          style={{ height: Math.min(window.innerHeight - 20, 800) }}
          vertical
          gap={8}
        >
          <MapViewV2
            key="metro-mapper-fullscreen"
            drivers={transitDrivers.map((driver) => ({
              ...driver,
            }))}
            fullSize={true}
            isFromTab={false}
            showLocalities={false}
            showCorridors={false}
          />
        </Flex>
      </Modal>
    </Flex>
  );
}
