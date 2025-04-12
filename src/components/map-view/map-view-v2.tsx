import { Flex, Modal } from "antd";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
} from "react-leaflet";

import { renderToString } from "react-dom/server";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useFetchAllLivindexPlaces } from "../../hooks/use-livindex-places";
import { useFetchProjectById, useFetchProjects } from "../../hooks/use-project";
import { LivIndexDriversConfig, PLACE_TIMELINE } from "../../libs/constants";
import { COLORS } from "../../theme/style-constants";
import { IDriverPlace } from "../../types/Project";
import DynamicReactIcon, {
  dynamicImportMap,
} from "../common/dynamic-react-icon";

type Coordinate = [number, number];
type LineString = Coordinate[];

interface GeoJSONFeature {
  type: "LineString" | "MultiLineString";
  properties?: {
    strokeColor?: string;
    name?: string;
    status?: string;
  };
  coordinates: number[][];
  geometry?: {
    type: string;
    coordinates: number[][] | number[][][];
  };
}

type RoadDriverPlace = IDriverPlace & {
  features: GeoJSONFeature[];
  status: PLACE_TIMELINE;
};
// reuse your dynamic import map

// Need a different way to get the react icon
async function getIcon(iconName: string, iconSet: any) {
  let IconComp = null;
  if (!dynamicImportMap[iconSet]) {
    console.warn(`Icon set ${iconSet} not found.`);
    return null;
  }

  try {
    const iconSetModule = await dynamicImportMap[iconSet]();
    IconComp = (iconSetModule as any)[iconName] || null;
  } catch (error) {
    console.error(`Error loading icon ${iconName} from ${iconSet}`, error);
  }
  const iconMarkup = renderToString(
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "50%",
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 6px rgba(0,0,0,0.3)",
      }}
    >
      <IconComp size={20} color="black" />
    </div>
  );
  const leafletIcon = L.divIcon({
    html: iconMarkup,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
  return leafletIcon!;
}

const DEFAULT_DRIVER_IDS = [
  "674058ba3bf3e819be852d0c",
  "674058ba3bf3e819be852d1b",
  "676e4e06d23c140473c2cc80",
];

const DEFAULT_PROJECT = "66f6442e3696885ef13d55ca";

const MapViewV2 = ({
  drivers,
  projectId = DEFAULT_PROJECT,
}: {
  drivers?: string[];
  projectId?: string;
}) => {
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  /**
   * Modal content which opens on click of any rendered map element
   */
  const [modalContent, setModalContent] = useState<{
    title: string;
    tags?: [{ label: string; color: string }];
    content: string;
  }>();

  /**
   * Fetching driver data for selected drivers
   */
  const { data: driversData } = useFetchAllLivindexPlaces(drivers);
  // Always fetch data, use conditionally in render
  const { data: projectData } = useFetchProjectById(projectId || "");

  /**
   * Icons for simple drivermarkers
   */
  const [simpleDriverMarkerIcons, setSimpleDriverMarkerIcons] = useState<any[]>(
    []
  );
  const [projectMarkerIcon, setProjectMarkerIcon] = useState<L.DivIcon | null>(
    null
  );

  // Setting icons for simple drivermarkers
  useEffect(() => {
    async function fetchDriverIcons() {
      if (driversData && driversData.length > 0) {
        const icons = await Promise.all(
          driversData.map(async (driver) => {
            const iconConfig = (LivIndexDriversConfig as any)[driver.driver];

            const icon = await getIcon(
              iconConfig ? iconConfig.icon.name : "BiSolidFactory",
              iconConfig ? iconConfig.icon.set : "bi"
            );
            return icon ? { icon, driverId: driver._id } : null;
          })
        );
        setSimpleDriverMarkerIcons(icons.filter(Boolean));
      }
    }
    fetchDriverIcons();
  }, [driversData]);

  // Setting icon for project marker
  useEffect(() => {
    async function fetchProjectIcon() {
      const icon = await getIcon("IoLocation", "io5");
      setProjectMarkerIcon(icon);
    }
    fetchProjectIcon();
  }, []);

  // Rendering  drivermarkers
  /**
   * Render road infrastructure using polylines
   */
  /**
   * Processes road features and returns array of coordinate pairs with properties
   */
  const processRoadFeatures = (features: GeoJSONFeature[]) => {
    return features.flatMap((feature) => {
      // Handle geometry if present
      if (feature.geometry) {
        if (feature.geometry.type === "LineString") {
          return [
            {
              coordinates: feature.geometry.coordinates as [number, number][],
              properties: feature.properties,
            },
          ];
        } else if (feature.geometry.type === "MultiLineString") {
          return (feature.geometry.coordinates as [number, number][][]).map(
            (line) => ({
              coordinates: line,
              properties: feature.properties,
            })
          );
        }
      }

      // Fallback to feature coordinates
      if (feature.type === "LineString") {
        return [
          {
            coordinates: feature.coordinates as [number, number][],
            properties: feature.properties,
          },
        ];
      }

      return [];
    });
  };

  /**
   * Render road infrastructure using polylines
   */
  const renderRoadDrivers = () => {
    return driversData
      ?.filter(
        (driver): driver is RoadDriverPlace =>
          driver.driver === "highway" &&
          !!driver.features &&
          typeof driver.status === "string"
      )
      .flatMap((driver) => {
        const processedFeatures = processRoadFeatures(driver.features);

        return processedFeatures.map((feature, lineIndex) => {
          // Convert [lng, lat] to [lat, lng] for Leaflet
          const positions = feature.coordinates.map(
            ([lng, lat]) => [lat, lng] as [number, number]
          );

          // Determine line style based on status
          const featureStatus = feature.properties?.status || driver.status;

          const isDashed = ![
            PLACE_TIMELINE.LAUNCHED,
            PLACE_TIMELINE.POST_LAUNCH,
            PLACE_TIMELINE.PARTIAL_LAUNCH,
          ].includes(featureStatus as PLACE_TIMELINE);

          return (
            <Polyline
              key={`${driver._id}-${lineIndex}`}
              positions={positions}
              pathOptions={{
                color: feature.properties?.strokeColor || COLORS.textColorDark,
                weight: 4,
                opacity: 0.8,
                dashArray: isDashed ? "10, 10" : undefined,
              }}
              eventHandlers={{
                click: () => {
                  setModalContent({
                    title: feature.properties?.name || driver.name,
                    content: driver.details?.description || "",
                    tags: [
                      {
                        label: isDashed ? "Under Construction" : "Operational",
                        color: isDashed ? "warning" : "success",
                      },
                    ],
                  });
                  setInfoModalOpen(true);
                },
              }}
            />
          );
        });
      });
  };

  /**
   * Render transit infrastructure using polylines and circle markers for stations
   */
  const renderTransitDrivers = () => {
    return driversData
      ?.filter(
        (driver): driver is RoadDriverPlace =>
          driver.driver === "transit" &&
          !!driver.features &&
          typeof driver.status === "string"
      )
      .flatMap((driver) => {
        const processedFeatures = processRoadFeatures(driver.features);

        return [
          // Render transit lines
          ...processedFeatures.map((feature, lineIndex) => {
            // Convert [lng, lat] to [lat, lng] for Leaflet
            const positions = feature.coordinates.map(
              ([lng, lat]) => [lat, lng] as [number, number]
            );

            // Determine line style based on status
            const featureStatus = feature.properties?.status || driver.status;
            const isDashed = ![
              PLACE_TIMELINE.LAUNCHED,
              PLACE_TIMELINE.POST_LAUNCH,
              PLACE_TIMELINE.PARTIAL_LAUNCH,
            ].includes(featureStatus as PLACE_TIMELINE);

            return (
              <Polyline
                key={`${driver._id}-line-${lineIndex}`}
                positions={positions}
                pathOptions={{
                  color:
                    feature.properties?.strokeColor || COLORS.textColorDark,
                  weight: 4,
                  opacity: 0.8,
                  dashArray: isDashed ? "10, 10" : undefined,
                }}
                eventHandlers={{
                  click: () => {
                    setModalContent({
                      title: feature.properties?.name || driver.name,
                      content: driver.details?.description || "",
                      tags: [
                        {
                          label: isDashed
                            ? "Under Construction"
                            : "Operational",
                          color: isDashed ? "warning" : "success",
                        },
                      ],
                    });
                    setInfoModalOpen(true);
                  },
                }}
              />
            );
          }),
          // Render station points
          ...processedFeatures.flatMap((feature) =>
            feature.coordinates.map((coord, stationIndex) => (
              <CircleMarker
                key={`${driver._id}-station-${stationIndex}`}
                center={[coord[1], coord[0]]}
                radius={6}
                pathOptions={{
                  fillColor:
                    feature.properties?.strokeColor || COLORS.textColorDark,
                  fillOpacity: 1,
                  color: "#fff",
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => {
                    setModalContent({
                      title: `${driver.name} Station`,
                      content: driver.details?.description || "",
                    });
                    setInfoModalOpen(true);
                  },
                }}
              />
            ))
          ),
        ];
      });
  };

  /**
   * Render simple point-based drivers
   */
  const renderSimpleDriverMarkers = () => {
    return driversData?.map((driver: IDriverPlace) => {
      // Skip if no location data
      if (!driver.location?.lat || !driver.location?.lng) {
        return null;
      }

      const icon = simpleDriverMarkerIcons.find(
        (icon: any) => icon.driverId === driver._id
      )?.icon;

      // Skip if no icon
      if (!icon) {
        return null;
      }

      return (
        <Marker
          key={driver._id}
          position={[driver.location.lat, driver.location.lng]}
          icon={icon}
          eventHandlers={{
            click: () => {
              setModalContent({
                title: driver.name,
                content: driver.details?.description || "",
              });
              setInfoModalOpen(true);
            },
          }}
        />
      );
    });
  };

  /**
   * Render project markers - single project
   */
  const renderProjectMarkers = () => {
    if (projectId) {
      return (
        projectData?.info?.location &&
        projectMarkerIcon && (
          <Marker
            key={projectData._id}
            position={[
              projectData.info.location.lat,
              projectData.info.location.lng,
            ]}
            icon={projectMarkerIcon}
            eventHandlers={{
              click: () => {
                setModalContent({
                  title: projectData.info.name,
                  content: projectData.info.description || "",
                });
                setInfoModalOpen(true);
              },
            }}
          />
        )
      );
    }
  };

  return (
    <>
      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={80}
        minZoom={12}
        style={{ height: "1100px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Simple point based drivers */}
        {/* Infrastructure layers */}
        {renderRoadDrivers()}
        {renderTransitDrivers()}
        {/* Point based drivers */}
        {renderSimpleDriverMarkers()}

        {/* Project Markers */}
        {renderProjectMarkers()}
      </MapContainer>

      {/* Modal to show any marker details */}
      <Modal
        title={modalContent?.title}
        closable={true}
        open={infoModalOpen}
        footer={null}
        onCancel={() => {
          setInfoModalOpen(false);
        }}
        onClose={() => {
          setInfoModalOpen(false);
        }}
      >
        <Flex
          vertical
          style={{
            maxHeight: 500,
            overflowY: "scroll",
            scrollbarWidth: "none",
          }}
        >
          <Markdown remarkPlugins={[remarkGfm]} className="liviq-content">
            {modalContent?.content}
          </Markdown>
        </Flex>
      </Modal>
    </>
  );
};

export default MapViewV2;
