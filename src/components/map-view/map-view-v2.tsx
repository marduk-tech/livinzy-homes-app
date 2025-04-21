import { Flex, Modal, Tag, Typography } from "antd";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { renderToString } from "react-dom/server";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useFetchAllLivindexPlaces } from "../../hooks/use-livindex-places";
import { useFetchProjectById } from "../../hooks/use-project";
import { LivIndexDriversConfig, PLACE_TIMELINE } from "../../libs/constants";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { IDriverPlace } from "../../types/Project";
import { dynamicImportMap } from "../common/dynamic-react-icon";
import { capitalize } from "../../libs/lvnzy-helper";
import { MapPolygons } from "./map-polygons";

type Coordinate = [number, number];
type LineString = Coordinate[];

type GeoJSONCoordinate = [number, number];
type GeoJSONLineString = GeoJSONCoordinate[];
type GeoJSONMultiLineString = GeoJSONLineString[];

interface GeoJSONGeometry {
  type: "Point" | "LineString" | "MultiLineString";
  coordinates: GeoJSONCoordinate | GeoJSONLineString | GeoJSONMultiLineString;
}

interface GeoJSONFeature {
  type: "Feature";
  properties?: {
    strokeColor?: string;
    name?: string;
    status?: string;
  };
  geometry: GeoJSONGeometry;
}

interface GeoJSONLineFeature extends GeoJSONFeature {
  geometry: {
    type: "LineString" | "MultiLineString";
    coordinates: GeoJSONLineString | GeoJSONMultiLineString;
  };
}

interface GeoJSONPointFeature extends GeoJSONFeature {
  geometry: {
    type: "Point";
    coordinates: GeoJSONCoordinate;
  };
}

type RoadDriverPlace = IDriverPlace & {
  features: GeoJSONFeature[];
  status: PLACE_TIMELINE;
};

async function getIcon(
  iconName: string,
  iconSet: any,
  isProjectIcon?: boolean,
  duration?: number,
  driver?: IDriverPlace
) {
  let IconComp = null;
  if (!dynamicImportMap[iconSet]) {
    console.warn(`Icon set ${iconSet} not found.`);
    return null;
  }
  let isUnderConstruction = false;
  if (driver) {
    isUnderConstruction = ![
      PLACE_TIMELINE.LAUNCHED,
      PLACE_TIMELINE.PARTIAL_LAUNCH,
      PLACE_TIMELINE.POST_LAUNCH,
    ].includes(driver.status as any);
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
        borderRadius: duration ? "24px" : "50%",
        padding: duration ? 4 : 0,
        height: duration ? "auto" : 32,
        width: duration ? 80 : 32,
        display: "flex",
        alignItems: "center",
        borderColor: isUnderConstruction
          ? COLORS.yellowIdentifier
          : COLORS.borderColorDark,
        borderStyle: isUnderConstruction ? "dotted" : "solid",
        justifyContent: "center",
        animation: isProjectIcon ? "bounceAnimation 1s infinite" : "none",
        boxShadow: "0 0 6px rgba(0,0,0,0.3)",
      }}
    >
      <IconComp
        size={20}
        color={
          isUnderConstruction
            ? COLORS.yellowIdentifier
            : isProjectIcon
            ? COLORS.primaryColor
            : COLORS.textColorDark
        }
      />
      {duration ? (
        <Flex style={{ marginLeft: 4 }}>
          <Typography.Text
            style={{ fontSize: FONT_SIZE.PARA, fontWeight: 500 }}
          >
            {duration} mins
          </Typography.Text>
        </Flex>
      ) : null}
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

const DEFAULT_PROJECT = "66f6442e3696885ef13d55ca";

//  handle map resizing
const MapCenterHandler = ({ projectData }: { projectData: any }) => {
  const map = useMap();

  useEffect(() => {
    if (projectData?.info?.location) {
      map.setView(
        [projectData.info.location.lat, projectData.info.location.lng],
        15
      );
    }
  }, [projectData, map]);

  return null;
};

const MapResizeHandler = () => {
  const map = useMap();
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // map container
    containerRef.current = map.getContainer();

    if (containerRef.current) {
      // resize observer
      resizeObserverRef.current = new ResizeObserver(() => {
        // need to use a larger delay to ensre modal animation completes
        setTimeout(() => {
          map.invalidateSize();
        }, 300);
      });

      // Start observing
      resizeObserverRef.current.observe(containerRef.current);
    }

    return () => {
      if (resizeObserverRef.current && containerRef.current) {
        resizeObserverRef.current.unobserve(containerRef.current);
      }
    };
  }, [map]);

  return null;
};

const MapViewV2 = ({
  drivers,
  projectId = DEFAULT_PROJECT,
  fullSize,
}: {
  drivers?: any[];
  projectId?: string;
  fullSize: boolean;
}) => {
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [uniqueDriverTypes, setUniqueDriverTypes] = useState<any[]>([]);
  const [selectedDriverTypes, setSelectedDriverTypes] = useState<string[]>([]);

  const [modalContent, setModalContent] = useState<{
    title: string;
    tags?: [{ label: string; color: string }];
    content: string;
  }>();
  /**
   * Fetching driver data for selected drivers
   */
  const { data: driversData } = useFetchAllLivindexPlaces(
    drivers?.map((d) => d.id)
  );
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
            const projectSpecificDetails = drivers?.find(
              (d) => d.id == driver._id
            );

            const icon = await getIcon(
              iconConfig ? iconConfig.icon.name : "BiSolidFactory",
              iconConfig ? iconConfig.icon.set : "bi",
              false,
              projectSpecificDetails.duration,
              driver
            );
            return icon ? { icon, driverId: driver._id } : null;
          })
        );
        setSimpleDriverMarkerIcons(icons.filter(Boolean));
      }
    }
    fetchDriverIcons();
    if (driversData && driversData.length) {
      const uniqTypes: string[] = [];
      driversData.forEach((d: any) => {
        if (!uniqTypes.includes(d.driver)) {
          uniqTypes.push(d.driver);
        }
      });
      setUniqueDriverTypes(uniqTypes);
    }
  }, [driversData]);

  // Setting icon for project marker
  useEffect(() => {
    async function fetchProjectIcon() {
      const icon = await getIcon("IoLocation", "io5", true);
      setProjectMarkerIcon(icon);
    }
    fetchProjectIcon();
  }, []);

  const processRoadFeatures = (features: GeoJSONFeature[]) => {
    return features.flatMap((feature) => {
      if (feature.type === "Feature" && feature.geometry) {
        if (feature.geometry.type === "LineString") {
          const coords = feature.geometry.coordinates as [number, number][];
          return [
            {
              coordinates: coords,
              properties: feature.properties,
            },
          ];
        } else if (feature.geometry.type === "MultiLineString") {
          const coords = feature.geometry.coordinates as [number, number][][];
          return coords.map((line) => ({
            coordinates: line,
            properties: feature.properties,
          }));
        }
      }
      return [];
    });
  };

  const renderRoadDrivers = () => {
    return driversData
      ?.filter(
        (driver): driver is RoadDriverPlace =>
          driver.driver === "highway" &&
          !!driver.features &&
          typeof driver.status === "string" &&
          (selectedDriverTypes.length === 0 ||
            selectedDriverTypes.includes(driver.driver))
      )
      .flatMap((driver) => {
        const processedFeatures = processRoadFeatures(driver.features);

        return processedFeatures.map((feature, lineIndex) => {
          const positions = feature.coordinates.map(
            ([lng, lat]) => [lat, lng] as [number, number]
          );

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
              interactive={false}
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

  const renderTransitDrivers = () => {
    return driversData
      ?.filter(
        (driver): driver is RoadDriverPlace =>
          driver.driver === "transit" &&
          !!driver.features &&
          typeof driver.status === "string" &&
          (selectedDriverTypes.length === 0 ||
            selectedDriverTypes.includes(driver.driver))
      )
      .flatMap((driver) => {
        //  points from lines
        const pointFeatures = driver.features.filter(
          (f): f is GeoJSONPointFeature =>
            f.type === "Feature" && f.geometry.type === "Point"
        );

        const lineFeatures = processRoadFeatures(
          driver.features.filter(
            (f) => f.type === "Feature" && f.geometry?.type !== "Point"
          )
        );

        return [
          // Render transit lines
          ...lineFeatures.map((feature, lineIndex) => {
            const positions = feature.coordinates.map(
              ([lng, lat]) => [lat, lng] as [number, number]
            );

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
          // Render point stations
          ...pointFeatures.map((feature, pointIndex) => (
            <CircleMarker
              key={`${driver._id}-point-${pointIndex}`}
              center={
                [
                  feature.geometry.coordinates[1] as number,
                  feature.geometry.coordinates[0] as number,
                ] as [number, number]
              }
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
                    title: feature.properties?.name || driver.name,
                    content: driver.details?.description || "",
                  });
                  setInfoModalOpen(true);
                },
              }}
            />
          )),
        ];
      });
  };

  /** Renders driver markers */
  const renderSimpleDriverMarkers = () => {
    return driversData
      ?.filter(
        (driver) =>
          selectedDriverTypes.length === 0 ||
          selectedDriverTypes.includes(driver.driver)
      )
      .map((driver: IDriverPlace) => {
        if (!driver.location?.lat || !driver.location?.lng) {
          return null;
        }

        const icon = simpleDriverMarkerIcons.find(
          (icon: any) => icon.driverId === driver._id
        )?.icon;

        if (!icon) {
          return null;
        }
        const statusText =
          driver.status == PLACE_TIMELINE.CONSTRUCTION
            ? "Under Construction"
            : [
                PLACE_TIMELINE.LAUNCHED,
                PLACE_TIMELINE.POST_LAUNCH,
                PLACE_TIMELINE.PARTIAL_LAUNCH,
              ].includes(driver.status as PLACE_TIMELINE)
            ? "Operational"
            : "Planning Stage";

        const isDashed = ![
          PLACE_TIMELINE.LAUNCHED,
          PLACE_TIMELINE.POST_LAUNCH,
          PLACE_TIMELINE.PARTIAL_LAUNCH,
        ].includes(driver.status as PLACE_TIMELINE);

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
                  tags: [
                    {
                      label: statusText,
                      color: isDashed
                        ? COLORS.yellowIdentifier
                        : COLORS.primaryColor,
                    },
                  ],
                });
                setInfoModalOpen(true);
              },
            }}
          />
        );
      });
  };

  /**Renders marker for a particular project */
  const renderProjectMarkers = () => {
    if (projectId && projectData?.info?.location && projectMarkerIcon) {
      return (
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
      );
    }
    return null;
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {fullSize && uniqueDriverTypes && (
        <Flex
          style={{
            width: "100%",
            overflowX: "scroll",
            marginBottom: 16,
            scrollbarWidth: "none",
          }}
        >
          {uniqueDriverTypes.map((k: string) => {
            const itemIndex = selectedDriverTypes.indexOf(k);
            return (
              <Tag
                style={{
                  borderRadius: 16,
                  padding: 4,
                  backgroundColor:
                    itemIndex > -1 ? COLORS.primaryColor : "initial",
                  color: itemIndex > -1 ? "white" : "initial",
                }}
                onClick={() => {
                  const selDriverTypes = [...selectedDriverTypes];
                  const indexOfItem = selDriverTypes.indexOf(k);
                  if (indexOfItem > -1) {
                    selDriverTypes.splice(indexOfItem, 1);
                  } else {
                    selDriverTypes.push(k);
                  }
                  setSelectedDriverTypes(selDriverTypes);
                }}
              >
                {(LivIndexDriversConfig as any)[k]
                  ? capitalize((LivIndexDriversConfig as any)[k].label)
                  : ""}
              </Tag>
            );
          })}
        </Flex>
      )}
      <Flex style={{ height: "100%", width: "100%" }}>
        <MapContainer
          center={[13.110274, 77.6009443]}
          zoom={15}
          minZoom={12}
          style={{ height: "90%", width: "100%" }}
        >
          <MapResizeHandler />
          <MapCenterHandler projectData={projectData} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {renderRoadDrivers()}
          {renderTransitDrivers()}
          {renderSimpleDriverMarkers()}
          {renderProjectMarkers()}
          <MapPolygons
            driversData={driversData || []}
            selectedDriverTypes={selectedDriverTypes}
            setModalContent={setModalContent}
            setInfoModalOpen={setInfoModalOpen}
          />
        </MapContainer>
      </Flex>
      <Modal
        title={null}
        closable={true}
        open={infoModalOpen}
        footer={null}
        onCancel={() => setInfoModalOpen(false)}
      >
        <Flex
          vertical
          style={{
            maxHeight: 500,
            minHeight: 50,
            overflowY: "scroll",
            scrollbarWidth: "none",
          }}
        >
          <Typography.Text
            style={{ fontSize: FONT_SIZE.HEADING_3, fontWeight: 500 }}
          >
            {modalContent?.title}
          </Typography.Text>
          {modalContent?.tags ? (
            <Flex>
              {modalContent?.tags.map((t) => (
                <Tag color={t.color}>{t.label}</Tag>
              ))}
            </Flex>
          ) : null}
          {modalContent && modalContent.content ? (
            <Markdown remarkPlugins={[remarkGfm]} className="liviq-content">
              {modalContent?.content}
            </Markdown>
          ) : null}
        </Flex>
      </Modal>
    </div>
  );
};

export default MapViewV2;
