import * as turf from "@turf/turf";
import { Flex, Modal, Tag, Typography } from "antd";
import L, { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { renderToString } from "react-dom/server";
const { Paragraph } = Typography;

import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useFetchCorridors } from "../../hooks/use-corridors";
import { useFetchProjectById } from "../../hooks/use-project";
import {
  LivIndexDriversConfig,
  PLACE_TIMELINE,
  SurroundingElementLabels,
} from "../../libs/constants";
import { capitalize, rupeeAmountFormat } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { IDriverPlace, ISurroundingElement } from "../../types/Project";
import DynamicReactIcon, {
  dynamicImportMap,
} from "../common/dynamic-react-icon";
import { MapPolygons } from "./map-polygons";
import { useFetchLocalities } from "../../hooks/use-localities";
import { CorridorMarkerIcon } from "./corridor-marker-icon";
import { LocalityMarkerIcon } from "./locality-marker-icon";

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
    Name?: string;
    status?: string;
  };
  geometry: GeoJSONGeometry;
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

/**
 * Gets the icon for map.
 * @param iconName - React Icons -  icon name
 * @param iconSet - React Icons - icon set
 * @param toBounce - Whether icon should bounce.
 * @param text - Text to display alongside icon (optional)
 * @param driver - Driver object.
 * @param style - style of the icon including color, bg color, size
 * @returns
 */
async function getIcon(
  iconName?: string,
  iconSet?: any,
  toBounce?: boolean,
  text?: string,
  driver?: IDriverPlace,
  style?: { iconColor?: string; iconBgColor?: string; iconSize?: number }
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
    const iconSetModule = iconName ? await dynamicImportMap[iconSet]() : null;
    IconComp = iconName ? (iconSetModule as any)[iconName] || null : null;
  } catch (error) {
    console.error(`Error loading icon ${iconName} from ${iconSet}`, error);
  }
  const iconMarkup = renderToString(
    <div
      style={{
        backgroundColor: style?.iconBgColor || "white",
        borderRadius: text ? "24px" : "50%",
        padding: text ? 2 : 0,
        height: text ? "auto" : (style?.iconSize || 20) * 1.6,
        width: text ? 85 : (style?.iconSize || 20) * 1.6,
        display: "flex",
        alignItems: "center",
        borderColor: isUnderConstruction
          ? COLORS.yellowIdentifier
          : COLORS.borderColorDark,
        borderStyle: isUnderConstruction ? "dotted" : "solid",
        justifyContent: "center",
        animation: toBounce ? "bounceAnimation 1s infinite" : "none",
        boxShadow: "0 0 6px rgba(0,0,0,0.3)",
        textWrap: "nowrap",
      }}
    >
      <IconComp
        size={style?.iconSize || 16}
        color={
          style?.iconColor
            ? style.iconColor
            : isUnderConstruction
            ? COLORS.yellowIdentifier
            : COLORS.textColorDark
        }
      />
      {text ? (
        <Flex style={{ marginLeft: 2 }}>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.SUB_TEXT,
              fontWeight: 500,
              color: style?.iconColor || COLORS.textColorDark,
            }}
          >
            {text}
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

//  handle map resizing
const MapCenterHandler = ({
  projectData,
  projects,
}: {
  projectData: any;
  projects?: any[];
}) => {
  const map = useMap();
  useEffect(() => {
    if (
      projectData &&
      projectData?.info?.location?.lat &&
      projectData?.info?.location?.lng
    ) {
      map.setView(
        [projectData.info.location.lat, projectData.info.location.lng],
        13
      );
    } else if (projects && projects.length && projects.length < 10) {
      const projectsLoc = turf.points(
        projects
          .filter((p) => !!p.info.location && !!p.info.location.lat)
          .map((p) => {
            return [p.info.location.lng, p.info.location.lat];
          })
      );

      const center = turf.center(projectsLoc);
      map.setView(center.geometry.coordinates.reverse() as LatLngTuple, 12);
      console.warn("Project data missing location:", projectData);
    }
  }, [projectData, map, projects]);

  return null;
};

/**
 * Only renders drivers when they are in the view window.
 * @param param
 * @returns
 */
const BoundsAwareDrivers = ({
  renderRoadDrivers,
  renderTransitDrivers,
  renderSimpleDrivers,
}: {
  renderRoadDrivers: (bounds: L.LatLngBounds) => React.ReactNode;
  renderTransitDrivers: (bounds: L.LatLngBounds) => React.ReactNode;
  renderSimpleDrivers: (bounds: L.LatLngBounds) => React.ReactNode;
}) => {
  const map = useMap();
  const [bounds, setBounds] = useState(map.getBounds());

  useEffect(() => {
    const updateBounds = () => {
      setBounds(map.getBounds());
    };

    // Update
    map.on("moveend", updateBounds);
    map.on("zoomend", updateBounds);

    return () => {
      map.off("moveend", updateBounds);
      map.off("zoomend", updateBounds);
    };
  }, [map]);

  return (
    <>
      {renderRoadDrivers(bounds)}
      {renderTransitDrivers(bounds)}
      {renderSimpleDrivers(bounds)}
    </>
  );
};

// TODO: Why do we need this?
const MapResizeHandler = () => {
  const map = useMap();
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // handle map refresh
  const handleMapRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = setTimeout(() => {
      map.invalidateSize();
      map.setView(map.getCenter(), map.getZoom());
    }, 100);
  }, [map]);

  useEffect(() => {
    map.on("layeradd layerremove", handleMapRefresh);
    return () => {
      map.off("layeradd layerremove", handleMapRefresh);
    };
  }, [map, handleMapRefresh]);

  useEffect(() => {
    containerRef.current = map.getContainer();
    if (containerRef.current) {
      resizeObserverRef.current = new ResizeObserver(handleMapRefresh);
      resizeObserverRef.current.observe(containerRef.current);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      if (resizeObserverRef.current && containerRef.current) {
        resizeObserverRef.current.unobserve(containerRef.current);
      }
    };
  }, [map, handleMapRefresh]);

  return null;
};

/**
 * Process driver data into polygon format
 */
const processDriversToPolygons = (
  data: any[],
  filterByDriverTypes = true,
  selectedDriverTypes: string[] = []
) => {
  return data
    .filter((driver) => {
      const hasGeojson = driver.details?.osm?.geojson;
      const matchesType =
        !filterByDriverTypes ||
        selectedDriverTypes.length === 0 ||
        selectedDriverTypes.includes(driver.driver);
      return hasGeojson && matchesType;
    })
    .map((driver) => {
      try {
        const geojson =
          typeof driver.details.osm.geojson === "string"
            ? JSON.parse(driver.details.osm.geojson)
            : driver.details.osm.geojson;

        if (!geojson || geojson.type !== "Polygon") {
          return null;
        }

        return {
          id: driver._id,
          positions: geojson.coordinates[0].map(
            ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
          ),
          name: driver.name,
          description: driver.details?.description || "",
        };
      } catch (error) {
        console.error("Error processing polygon data:", error);
        return null;
      }
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);
};

const MapViewV2 = ({
  drivers,
  projectId,
  projects,
  fullSize,
  surroundingElements,
  projectsNearby,
  projectSqftPricing,
  showLocalities,
}: {
  drivers?: any[];
  projectId?: string;
  projects?: any[];
  fullSize: boolean;
  surroundingElements?: ISurroundingElement[];
  projectsNearby?: {
    projectName: string;
    sqftCost: number;
    projectLocation: { lat: number; lng: number };
  }[];
  projectSqftPricing?: number;
  showLocalities?: boolean;
}) => {
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [uniqueDriverTypes, setUniqueDriverTypes] = useState<any[]>([]);
  const { data: corridors, isLoading: isCorridorsDataLoading } =
    useFetchCorridors();
  const { data: localities, isLoading: isLocalitiesDataLoading } =
    useFetchLocalities();
  const [selectedDriverType, setSelectedDriverType] = useState<string>();

  const [uniqueSurroundingElements, setUniqueSurroundingElements] = useState<
    string[]
  >([]);
  const [selectedSurroundingElement, setSelectedSurroundingElement] =
    useState<string>();

  const [modalContent, setModalContent] = useState<{
    title: string;
    tags?: { label: string; color: string }[];
    content: string;
  }>();

  // Get primary project from projects array instead of fetching
  const { data: primaryProject } = useFetchProjectById(projectId || "");

  /**
   * Icons for simple drivermarkers
   */
  const [simpleDriverMarkerIcons, setSimpleDriverMarkerIcons] = useState<any[]>(
    []
  );

  /**
   * Icons for simple drivermarkers
   */
  const [surroundingElementIcons, setSurroundingElementIcons] = useState<any[]>(
    []
  );

  const [projectsNearbyIcons, setProjectsNearbyIcons] = useState<any[]>([]);
  const [currentProjectMarkerIcon, setCurrentProjectMarkerIcon] =
    useState<L.DivIcon | null>(null);
  const [projectMarkerIcon, setProjectMarkerIcon] = useState<L.DivIcon | null>(
    null
  );
  const [transitStationIcon, setTransitStationIcon] =
    useState<L.DivIcon | null>(null);

  useEffect(() => {}, [drivers]);

  const [roadIcon, setRoadIcon] = useState<L.DivIcon | null>(null);

  // Setting icons for simple drivermarkers
  useEffect(() => {
    async function fetchDriverIcons() {
      console.log("Fetching icons for drivers:", drivers!.length);
      const icons = await Promise.all(
        drivers!.map(async (driver) => {
          const iconConfig = (LivIndexDriversConfig as any)[driver.driver];

          if (!iconConfig) {
            console.warn(
              `No icon config found for driver type: ${driver.driver}`
            );
            return null;
          }

          const baseIcon = await getIcon(
            iconConfig.icon.name,
            iconConfig.icon.set,
            false,
            undefined,
            driver
          );

          return baseIcon
            ? {
                icon: baseIcon,
                driverId: driver._id,
                duration: driver?.duration,
              }
            : null;
        })
      );

      const validIcons = icons.filter(Boolean);
      console.log("Loaded icons count:", validIcons.length);
      setSimpleDriverMarkerIcons(validIcons);
    }

    // Fetch icons, set unique driver types
    if (drivers && drivers?.length) {
      fetchDriverIcons();
      const uniqTypes = Array.from(new Set(drivers.map((d) => d.driver)));
      setUniqueDriverTypes(uniqTypes);
    }
  }, [drivers]); // Added selectedDriverTypes to ensure marker icons update

  // Setting the unique surrounding elements for filters
  useEffect(() => {
    const uniqueElements: string[] = [];

    async function setElementIcons(elements: string[]) {
      const elementIcons = [];
      for (const element of elements) {
        const icon = (SurroundingElementLabels as any)[element].icon;
        const elementIcon = await getIcon(
          icon.name,
          icon.set,
          false,
          undefined,
          undefined,
          {
            iconSize: 16,
            iconBgColor: "white",
            iconColor: COLORS.primaryColor,
          }
        );
        elementIcons.push({ type: element, icon: elementIcon });
      }
      setSurroundingElementIcons(elementIcons);
    }

    if (surroundingElements && surroundingElements.length) {
      surroundingElements.forEach((e: ISurroundingElement) => {
        if (!uniqueElements.includes(e.type)) {
          uniqueElements.push(e.type);
        }
      });
      setUniqueSurroundingElements(uniqueElements);
      if (uniqueElements.length == 1) {
        setSelectedSurroundingElement(uniqueElements[0]);
      }
      setElementIcons(uniqueElements);
    }
  }, [surroundingElements]);

  // Setting icon for project marker
  useEffect(() => {
    async function updateProjectIcons() {
      const currentProjectIcon = await getIcon(
        "IoLocation",
        "io5",
        true,
        projectsNearby && projectsNearby.length
          ? `₹${rupeeAmountFormat(`${projectSqftPricing}`)} /sqft`
          : undefined,
        undefined,
        {
          iconBgColor: COLORS.textColorDark,
          iconColor: "white",
          iconSize: projectsNearby && projectsNearby.length ? 18 : 24,
        }
      );
      setCurrentProjectMarkerIcon(currentProjectIcon);
      const projectIcon = await getIcon(
        "IoLocation",
        "io5",
        false,
        undefined,
        undefined,
        {
          iconBgColor: "white",
          iconColor: COLORS.textColorDark,
          iconSize: 24,
        }
      );
      setProjectMarkerIcon(projectIcon);

      const transitStationIcon = await getIcon(
        "FaTrainSubway",
        "fa6",
        false,
        undefined,
        undefined,
        {
          iconBgColor: COLORS.textColorDark,
          iconColor: "white",
          iconSize: 14,
        }
      );
      setTransitStationIcon(transitStationIcon);

      const roadIcon = await getIcon(
        "FaRoad",
        "fa",
        false,
        undefined,
        undefined,
        {
          iconBgColor: COLORS.textColorDark,
          iconColor: "white",
          iconSize: 14,
        }
      );
      setRoadIcon(roadIcon);
    }
    updateProjectIcons();
  }, []);

  // Settings icons for nearby projects
  useEffect(() => {
    async function setIcons() {
      const icons = [];
      for (const project of projectsNearby!) {
        const icon = await getIcon(
          "MdHomeWork",
          "md",
          false,
          `${project.sqftCost} /sqft`
        );
        icons.push({
          name: project.projectName,
          icon,
        });
      }
      setProjectsNearbyIcons(icons);
    }
    if (projectsNearby && projectsNearby.length) {
      setIcons();
    }
  }, [projectsNearby]);

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

  const renderLocalities = () => {
    if (!localities) {
      return null;
    }

    const LocalityIcon = L.divIcon({
      className: "", // prevent default icon styles
      html: renderToString(<LocalityMarkerIcon />),
      iconSize: [100, 100],
      iconAnchor: [50, 50],
    });
    return localities!
      .filter((l) => !!l.location && !!l.location.lat)
      .map((c) => {
        return (
          <>
            <Marker
              key={`rpple-${c._id}`}
              icon={LocalityIcon}
              position={[c.location.lat, c.location.lng]}
              eventHandlers={{
                click: () => {
                  setModalContent({
                    title: c.name,
                    content: "",
                    tags: [
                      { label: "Growth corridor", color: COLORS.textColorDark },
                    ],
                  });
                  setInfoModalOpen(true);
                },
              }}
            />
          </>
        );
      });
  };

  const renderCorridors = () => {
    if (!corridors) {
      return null;
    }
    const CorridorIcon = L.divIcon({
      className: "", // prevent default icon styles
      html: renderToString(<CorridorMarkerIcon />),
      iconSize: [100, 100],
      iconAnchor: [50, 50],
    });
    return corridors!.map((c) => {
      return (
        <React.Fragment key={`corridor-${c._id}`}>
          <Marker
            key={`rpple-${c._id}`}
            icon={CorridorIcon}
            position={[c.location.lat, c.location.lng]}
            eventHandlers={{
              click: () => {
                setModalContent({
                  title: c.name,
                  content: c.description || "",
                  tags: [
                    { label: "Growth corridor", color: COLORS.textColorDark },
                  ],
                });
                setInfoModalOpen(true);
              },
            }}
          />
        </React.Fragment>
      );
    });
  };

  /**
   * Renders the surrounding elements
   * @returns
   */
  const renderSurroundings = () => {
    if (
      !surroundingElements ||
      !surroundingElements.length ||
      !surroundingElementIcons ||
      !surroundingElementIcons.length
    ) {
      return null;
    }
    return surroundingElements
      ?.filter(
        (e: ISurroundingElement) =>
          !selectedSurroundingElement || e.type == selectedSurroundingElement
      )
      .map((element: ISurroundingElement, index: number) => {
        let plygn;
        const positions = element.geometry.map((g: any) => {
          if (Array.isArray(g)) {
            return g.map((subG) => {
              return [subG.lat, subG.lon];
            });
          } else {
            return [g.lat, g.lon];
          }
        });

        let isMulti = false;
        const plgynCoordinates = element.geometry.map((g: any) => {
          if (Array.isArray(g)) {
            isMulti = true;
            return g.map((subG) => {
              return [subG.lon, subG.lat];
            });
          } else {
            return [g.lon, g.lat];
          }
        });

        // Finding the center of the surrounding element to render a symbol icon
        let feature, center, cc, icon;
        try {
          feature = isMulti
            ? turf.multiLineString(plgynCoordinates)
            : turf.lineString(plgynCoordinates);
          center = turf.pointOnFeature(feature!);
          cc = center!.geometry.coordinates;
          icon = surroundingElementIcons.find(
            (i) => i.type == element.type
          ).icon;
        } catch (Err) {
          console.log(Err);
        }

        const handleElementClick = () => {
          const typeLabel = (SurroundingElementLabels as any)[element.type]
            ? (SurroundingElementLabels as any)[element.type].label
            : "";
          setModalContent({
            title: element.description || typeLabel || "",
            content: "",
            tags: [
              {
                label: typeLabel || "",
                color: COLORS.primaryColor,
              },
            ],
          });
          setInfoModalOpen(true);
        };
        return (
          <>
            <Polyline
              key={index}
              positions={positions}
              pathOptions={{
                color: COLORS.primaryColor,
                weight: 8,
                opacity: 0.8,
              }}
              eventHandlers={{
                click: handleElementClick,
              }}
            />
            <Marker
              key={`srr-m-${index}`}
              position={[cc![1], cc![0]]}
              icon={icon}
              eventHandlers={{
                click: handleElementClick,
              }}
            />
          </>
        );
      });
  };

  /**
   * Renders the road drivers
   */
  const RoadDriversComponent = ({ bounds }: { bounds: L.LatLngBounds }) => {
    const map = useMap();

    if (
      !drivers ||
      !drivers.length ||
      !!surroundingElements?.length ||
      !roadIcon
    ) {
      return null;
    }

    return drivers
      ?.filter(
        (driver): driver is RoadDriverPlace =>
          driver.driver === "highway" &&
          !!driver.features &&
          typeof driver.status === "string" &&
          (!selectedDriverType || selectedDriverType == driver.driver)
      )
      .flatMap((driver) => {
        const processedFeatures = processRoadFeatures(driver.features);

        const isDashed = ![
          PLACE_TIMELINE.LAUNCHED,
          PLACE_TIMELINE.POST_LAUNCH,
          PLACE_TIMELINE.PARTIAL_LAUNCH,
        ].includes(driver.status as PLACE_TIMELINE);

        const handleRoadDriverClick = () => {
          setModalContent({
            title: driver.name,
            content: driver.details?.description || "",
            tags: [
              {
                label: "Road",
                color: COLORS.primaryColor,
              },
              {
                label: isDashed ? "Under Construction" : "Operational",
                color: isDashed ? "warning" : "success",
              },
            ],
          });
          setInfoModalOpen(true);
        };

        const RoadLine = processedFeatures
          .filter((feature) => {
            return feature.coordinates.some(([lng, lat]) =>
              bounds.contains([lat, lng])
            );
          })
          .map((feature, lineIndex) => {
            const positions = feature.coordinates.map(
              ([lng, lat]) => [lat, lng] as [number, number]
            );

            const line = turf.lineString(feature.coordinates);
            const totalLength = turf.length(line, { units: "kilometers" });

            const numPoints =
              totalLength >= 4 ? Math.floor(totalLength / 4) : 0; // including start and end

            if (!numPoints) {
              return null;
            }

            const points = [];
            for (let i = 0; i < numPoints; i++) {
              const distance = (i * totalLength) / numPoints;
              const point = turf.along(line, distance, { units: "kilometers" });
              points.push(point.geometry.coordinates);
            }
            return (
              <>
                {map.getZoom() > 12.5
                  ? points.map((p) => (
                      <Marker
                        key={`road-${Math.round(Math.random() * 1000)}`}
                        position={[p![1], p![0]]}
                        icon={roadIcon}
                        eventHandlers={{
                          click: handleRoadDriverClick,
                        }}
                      />
                    ))
                  : null}
                <Polyline
                  key={`${driver._id}-${lineIndex}`}
                  positions={positions}
                  pathOptions={{
                    color:
                      feature.properties?.strokeColor || COLORS.textColorDark,
                    weight: 5,
                    opacity: 0.5,
                    dashArray: isDashed ? "10, 10" : undefined,
                  }}
                  eventHandlers={{
                    click: handleRoadDriverClick,
                  }}
                />
              </>
            );
          });

        return (
          <React.Fragment key={`road-group-${Math.random()}`}>
            {RoadLine}
          </React.Fragment>
        );
      });
  };

  const TransitDriversComponent = ({ bounds }: { bounds: L.LatLngBounds }) => {
    const map = useMap();

    if (
      !drivers ||
      !drivers.length ||
      !!surroundingElements?.length ||
      !transitStationIcon
    ) {
      return null;
    }

    return drivers
      ?.filter(
        (driver): driver is RoadDriverPlace =>
          driver.driver === "transit" &&
          !!driver.features &&
          typeof driver.status === "string" &&
          (!selectedDriverType || selectedDriverType == driver.driver)
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

        const isDashed = ![
          PLACE_TIMELINE.LAUNCHED,
          PLACE_TIMELINE.POST_LAUNCH,
          PLACE_TIMELINE.PARTIAL_LAUNCH,
        ].includes(driver.status as PLACE_TIMELINE);

        const transitLines = lineFeatures.map((feature, lineIndex) => {
          const positions = feature.coordinates.map(
            ([lng, lat]) => [lat, lng] as [number, number]
          );

          // if at least one point of the line is within bounds
          const hasPointInBounds = positions.some(([lat, lng]) =>
            bounds.contains([lat, lng])
          );

          if (!hasPointInBounds) {
            return null;
          }

          return (
            <Polyline
              key={`${driver._id}-line-${lineIndex}`}
              positions={positions}
              pathOptions={{
                color: feature.properties?.strokeColor || COLORS.textColorDark,
                weight: 6,
                opacity: 0.8,
                dashArray: isDashed ? "10, 10" : undefined,
              }}
            />
          );
        });
        let stations = null;
        if (map.getZoom() > 12.5) {
          stations = pointFeatures
            .filter((feature) => {
              // render stations within bounds
              const [lng, lat] = feature.geometry.coordinates;
              return bounds.contains([lat, lng]);
            })
            .map((feature, pointIndex) => (
              <Marker
                key={`${driver._id}-point-${pointIndex}`}
                position={[
                  feature.geometry.coordinates[1],
                  feature.geometry.coordinates[0],
                ]}
                icon={transitStationIcon!}
                eventHandlers={{
                  click: () => {
                    setModalContent({
                      title: driver.name,
                      content: driver.details?.description || "",
                      tags: [
                        {
                          label:
                            "Station: " +
                            (feature.properties?.name ||
                              feature.properties?.Name),
                          color: COLORS.primaryColor,
                        },
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
            ));
        }
        return (
          <React.Fragment key={`transit-${driver._id}`}>
            {transitLines}
            {stations}
          </React.Fragment>
        );
      });
  };

  /**
   * Component to render simple drivers with zoom-dependent duration display
   */
  const SimpleDriversRenderer = ({
    bounds,
  }: {
    bounds: L.LatLngBounds;
  }): JSX.Element | null => {
    const map = useMap();
    const showDuration = map.getZoom() > 12;
    const [markerIcons, setMarkerIcons] = useState<{
      [key: string]: L.DivIcon;
    }>({});

    useEffect(() => {
      if (
        !drivers?.length ||
        !drivers?.length ||
        !!surroundingElements?.length
      ) {
        return;
      }

      const updateIcons = async () => {
        const newIcons: { [key: string]: L.DivIcon } = {};

        for (const driver of drivers) {
          if (!driver.location?.lat || !driver.location?.lng) continue;

          const driverIcon = simpleDriverMarkerIcons.find(
            (icon) => icon.driverId === driver._id
          );

          if (driverIcon?.icon) {
            if (showDuration && driverIcon.duration) {
              const iconConfig = (LivIndexDriversConfig as any)[driver.driver]
                ?.icon;
              if (iconConfig) {
                const icon = await getIcon(
                  iconConfig.name,
                  iconConfig.set,
                  false,
                  `${driverIcon.duration} mins`,
                  driver
                );
                if (icon) {
                  newIcons[driver._id] = icon;
                }
              }
            } else {
              newIcons[driver._id] = driverIcon.icon;
            }
          }
        }

        setMarkerIcons(newIcons);
      };

      updateIcons();
    }, [drivers, showDuration, simpleDriverMarkerIcons, drivers]);

    if (!drivers?.length || !drivers?.length || !!surroundingElements?.length) {
      return null;
    }

    const filteredDrivers = drivers.filter((driver) => {
      if (!driver.location?.lat || !driver.location?.lng) return false;
      return (
        (!selectedDriverType || selectedDriverType == driver.driver) &&
        bounds.contains([driver.location.lat, driver.location.lng])
      );
    });

    return (
      <>
        {filteredDrivers.map((driver) => {
          if (!driver.location?.lat || !driver.location?.lng) return null;
          const markerIcon = markerIcons[driver._id];
          if (!markerIcon) return null;

          const statusText =
            driver.status === PLACE_TIMELINE.CONSTRUCTION
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

          const projectSpecificDetails = drivers?.find(
            (d) => d.id === driver._id
          );

          return (
            <Marker
              key={driver._id}
              position={[driver.location.lat, driver.location.lng]}
              icon={markerIcon}
              eventHandlers={{
                click: () => {
                  setModalContent({
                    title: driver.name,
                    content: driver.details?.description || "",
                    tags: [
                      {
                        label: (LivIndexDriversConfig as any)[driver.driver]
                          .label,
                        color: COLORS.primaryColor,
                      },
                      {
                        label: statusText,
                        color: isDashed
                          ? COLORS.yellowIdentifier
                          : COLORS.greenIdentifier,
                      },
                      ...(projectSpecificDetails?.duration
                        ? [
                            {
                              label: `${projectSpecificDetails.duration} mins`,
                              color: COLORS.textColorDark,
                            },
                          ]
                        : []),
                    ],
                  });
                  setInfoModalOpen(true);
                },
              }}
            />
          );
        })}
      </>
    );
  };

  /**Renders marker for all projects */
  const renderProjectMarkers = () => {
    const markers: JSX.Element[] = [];

    // Wait for icon to be loaded and verify coordinates
    if (!currentProjectMarkerIcon) {
      return markers;
    }

    if (
      primaryProject &&
      primaryProject?.info?.location?.lat &&
      primaryProject?.info?.location?.lng
    ) {
      markers.push(
        <Marker
          key={primaryProject._id}
          position={[
            primaryProject.info.location.lat,
            primaryProject.info.location.lng,
          ]}
          icon={currentProjectMarkerIcon}
          eventHandlers={{
            click: () => {
              setModalContent({
                title: primaryProject.info.name,
                content: primaryProject.info.description || "",
                tags: [
                  ...primaryProject.info.homeType.map((h: string) => {
                    return {
                      label: capitalize(h),
                      color: COLORS.textColorDark,
                    };
                  }),
                ],
              });
              setInfoModalOpen(true);
            },
          }}
        />
      );
    }

    if (projects && projects.length > 0 && projectMarkerIcon) {
      projects.forEach((project) => {
        if (
          project?.info?.location?.lat &&
          project?.info?.location?.lng &&
          currentProjectMarkerIcon
        ) {
          markers.push(
            <Marker
              key={project._id}
              position={[project.info.location.lat, project.info.location.lng]}
              icon={projectMarkerIcon}
              eventHandlers={{
                click: () => {
                  setModalContent({
                    title: project.info?.name || "Unnamed Project",
                    content: project.info?.description || "",
                  });
                  setInfoModalOpen(true);
                },
              }}
            />
          );
        }
      });
    }

    return markers;
  };

  /**Renders marker for the nearby projects */
  const renderProjectsNearby = () => {
    return projectsNearby!
      .filter(
        (p) =>
          Math.abs(p.sqftCost - projectSqftPricing!) / projectSqftPricing! <=
          0.35
      )
      .map((project) => {
        if (!project.projectLocation?.lat || !project.projectLocation?.lng) {
          return null;
        }

        const projectIcon = projectsNearbyIcons.find(
          (p) => p.name === project.projectName && p.icon
        );

        if (!projectIcon?.icon) {
          return null;
        }

        return (
          <Marker
            key={project.projectName.toLowerCase()}
            position={[
              project.projectLocation.lat,
              project.projectLocation.lng,
            ]}
            icon={projectIcon.icon}
            eventHandlers={{
              click: () => {
                setModalContent({
                  title: project.projectName,
                  content: "",
                  tags: [
                    {
                      label: `${capitalize(
                        primaryProject
                          ? primaryProject?.info?.homeType?.[0] || ""
                          : ""
                      )}`,
                      color: COLORS.primaryColor,
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

  /** Filter for driver types */
  const renderDriverTypesTag = (k: string) => {
    if (!(LivIndexDriversConfig as any)[k]) {
      return null;
    }
    const icon = (LivIndexDriversConfig as any)[k].icon;
    return (
      <Tag
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: 16,
          border: "1px solid",
          borderColor: COLORS.borderColorDark,
          padding: "8px 12px",
          backgroundColor:
            k == selectedDriverType ? COLORS.primaryColor : "white",
          color: k == selectedDriverType ? "white" : "initial",
          marginLeft: 4,
          cursor: "pointer",
        }}
        onClick={() => {
          if (k == selectedDriverType) {
            setSelectedDriverType(undefined);
          } else {
            setSelectedDriverType(k);
          }
        }}
      >
        <DynamicReactIcon
          iconName={icon.name}
          iconSet={icon.set}
          size={20}
          color={k == selectedDriverType ? "white" : COLORS.textColorDark}
        ></DynamicReactIcon>
        <Typography.Text
          style={{
            color: k == selectedDriverType ? "white" : COLORS.textColorDark,
            marginLeft: 8,
            fontSize: FONT_SIZE.HEADING_4,
          }}
        >
          {(LivIndexDriversConfig as any)[k]
            ? capitalize((LivIndexDriversConfig as any)[k].label)
            : ""}
        </Typography.Text>
      </Tag>
    );
  };

  /** Filter for surrounding element types */
  const renderSurroundingElementTypes = (k: string) => {
    if (!(SurroundingElementLabels as any)[k]) {
      return null;
    }
    const icon = (SurroundingElementLabels as any)[k].icon;
    return (
      <Tag
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: 16,
          padding: "4px 8px",
          backgroundColor:
            k == selectedSurroundingElement ? COLORS.primaryColor : "white",
          color: k == selectedSurroundingElement ? "white" : "initial",
          marginLeft: 4,
          fontSize: FONT_SIZE.HEADING_3,
          cursor: "pointer",
        }}
        onClick={() => {
          setSelectedSurroundingElement(k);
        }}
      >
        <DynamicReactIcon
          iconName={icon.name}
          iconSet={icon.set}
          size={20}
          color={
            k == selectedSurroundingElement ? "white" : COLORS.textColorDark
          }
        ></DynamicReactIcon>
        <Typography.Text
          style={{
            color:
              k == selectedSurroundingElement ? "white" : COLORS.textColorDark,
            marginLeft: 8,
          }}
        >
          {(SurroundingElementLabels as any)[k]
            ? capitalize((SurroundingElementLabels as any)[k].label)
            : ""}
        </Typography.Text>
      </Tag>
    );
  };

  // Process primary project polygon if available
  const primaryProjectBounds = primaryProject?.info?.location?.osm?.geojson
    ? [
        {
          _id: "primary-project",
          driver: "project-bounds",
          name: primaryProject.info.name,
          details: {
            description: primaryProject.info.description || "",
            osm: {
              geojson: {
                type: "Polygon",
                coordinates: [
                  primaryProject.info.location.osm.geojson.coordinates[0],
                ],
              },
            },
          },
        },
      ]
    : [];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflowY: "hidden",
        borderRadius: 14,
        position: "relative",
      }}
    >
      {/* Drivers filters */}
      {drivers && drivers.length && !surroundingElements?.length ? (
        <Flex
          style={{
            width: "100%",
            overflowX: "scroll",
            scrollbarWidth: "none",
            height: 32,
            position: "absolute",
            zIndex: 9999,
            bottom: 32,
            paddingLeft: 8,
          }}
        >
          {(uniqueDriverTypes || [])
            .filter((d) => !!d)
            .map((k: string) => {
              return renderDriverTypesTag(k);
            })}
        </Flex>
      ) : null}

      {/* Surrounding Elements Filters */}
      {surroundingElements && surroundingElements.length ? (
        <Flex
          style={{
            width: "100%",
            overflowX: "scroll",
            scrollbarWidth: "none",
            height: 32,
            position: "absolute",
            zIndex: 9999,
            bottom: 32,
            paddingLeft: 8,
          }}
        >
          {uniqueSurroundingElements.map((k: string) => {
            return renderSurroundingElementTypes(k);
          })}
        </Flex>
      ) : null}

      {/* Map container */}
      <Flex
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <MapContainer
          key={`map-v2`}
          center={[13.110274, 77.6009443]}
          zoom={14}
          minZoom={12}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <MapResizeHandler />
          <MapCenterHandler projectData={primaryProject} projects={projects} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {/* Process and render polygon data */}
          {(() => {
            // Process primary project bounds
            const projectPolygons = processDriversToPolygons(
              primaryProjectBounds,
              false,
              uniqueDriverTypes
            );

            // Render all components
            return (
              <>
                <MapPolygons polygons={projectPolygons} />

                {renderProjectMarkers()}
                {renderCorridors()}
                {showLocalities && localities ? renderLocalities() : null}
                {renderSurroundings()}
                {projectsNearby?.length && projectsNearbyIcons?.length
                  ? renderProjectsNearby()
                  : null}
                {drivers && drivers.length && !surroundingElements?.length ? (
                  <>
                    <BoundsAwareDrivers
                      renderRoadDrivers={(bounds) => (
                        <RoadDriversComponent bounds={bounds} />
                      )}
                      renderTransitDrivers={(bounds) => (
                        <TransitDriversComponent bounds={bounds} />
                      )}
                      renderSimpleDrivers={(bounds) => (
                        <SimpleDriversRenderer bounds={bounds} />
                      )}
                    />
                    <MapPolygons
                      polygons={processDriversToPolygons(
                        drivers || [],
                        true,
                        uniqueDriverTypes
                      )}
                    />
                  </>
                ) : null}
              </>
            );
          })()}
        </MapContainer>
      </Flex>

      {/* Dynamic modal to show map click content */}
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
          {modalContent?.tags ? (
            <Flex
              style={{ marginTop: 32, width: "100%", flexWrap: "wrap" }}
              gap={8}
            >
              {modalContent?.tags.map((t) => (
                <Tag style={{ margin: 0 }} color={t.color}>
                  {t.label}
                </Tag>
              ))}
            </Flex>
          ) : null}
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_1,
              fontWeight: 500,
              lineHeight: "120%",
              marginBottom: 16,
              marginTop: 16,
            }}
          >
            {modalContent?.title}
          </Typography.Text>

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
