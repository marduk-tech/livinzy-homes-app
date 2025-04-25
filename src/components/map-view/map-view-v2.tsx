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
import { useFetchCorridors } from "../../hooks/use-corridors";
import { useFetchAllLivindexPlaces } from "../../hooks/use-livindex-places";
import {
  LivIndexDriversConfig,
  PLACE_TIMELINE,
  SurroundingElementLabels,
} from "../../libs/constants";
import { capitalize } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { IDriverPlace, ISurroundingElement } from "../../types/Project";
import DynamicReactIcon, {
  dynamicImportMap,
} from "../common/dynamic-react-icon";
import { MapPolygons } from "./map-polygons";
import { useFetchProjectById } from "../../hooks/use-project";

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
  toBounce?: boolean,
  text?: string,
  driver?: IDriverPlace,
  style?: { iconColor: string; iconBgColor: string; iconSize?: number }
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
    } else {
      map.setView([12.976017, 77.613912], 13);
      console.warn("Project data missing location:", projectData);
    }
  }, [projectData, map, projects]);

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
  projectId,
  projects,
  fullSize,
  defaultSelectedDriverTypes,
  surroundingElements,
  projectsNearby,
  selectedProjectId,
}: {
  drivers?: any[];
  projectId?: string;
  projects?: any[];
  fullSize: boolean;
  defaultSelectedDriverTypes?: string[];
  surroundingElements?: ISurroundingElement[];
  projectsNearby?: {
    projectName: string;
    sqftCost: number;
    projectLocation: [number, number];
  }[];
  selectedProjectId?: string;
}) => {
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [uniqueDriverTypes, setUniqueDriverTypes] = useState<any[]>([]);
  const { data: corridors, isLoading: isCorridorsDataLoading } =
    useFetchCorridors();
  const [selectedDriverTypes, setSelectedDriverTypes] = useState<string[]>([]);

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

  /**
   * Fetching driver data for selected drivers
   */
  const { data: driversData } = useFetchAllLivindexPlaces(
    drivers?.map((d) => d.id)
  );

  // Get primary project from projects array instead of fetching
  const { data: primaryProject } = useFetchProjectById(projectId || "");

  /**
   * Icons for simple drivermarkers
   */
  const [simpleDriverMarkerIcons, setSimpleDriverMarkerIcons] = useState<any[]>(
    []
  );

  const [projectsNearbyIcons, setProjectsNearbyIcons] = useState<any[]>([]);
  const [currentProjectMarkerIcon, setCurrentProjectMarkerIcon] =
    useState<L.DivIcon | null>(null);
  const [projectMarkerIcon, setProjectMarkerIcon] = useState<L.DivIcon | null>(
    null
  );

  // Setting icons for simple drivermarkers
  useEffect(() => {
    async function fetchDriverIcons() {
      if (!drivers?.length || !driversData?.length) {
        console.log("No drivers data to fetch icons for");
        setSimpleDriverMarkerIcons([]);
        return;
      }

      console.log("Fetching icons for drivers:", driversData.length);
      const icons = await Promise.all(
        driversData.map(async (driver) => {
          const iconConfig = (LivIndexDriversConfig as any)[driver.driver];
          const projectSpecificDetails = drivers?.find(
            (d) => d.id === driver._id
          );

          if (!iconConfig) {
            console.warn(
              `No icon config found for driver type: ${driver.driver}`
            );
            return null;
          }

          const icon = await getIcon(
            iconConfig.icon.name,
            iconConfig.icon.set,
            false,
            projectSpecificDetails && projectSpecificDetails.duration
              ? `${projectSpecificDetails.duration} mins`
              : undefined,
            driver
          );
          return icon ? { icon, driverId: driver._id } : null;
        })
      );

      const validIcons = icons.filter(Boolean);
      console.log("Loaded icons count:", validIcons.length);
      setSimpleDriverMarkerIcons(validIcons);
    }

    fetchDriverIcons();

    // Update unique driver types
    if (driversData?.length) {
      const uniqTypes = Array.from(new Set(driversData.map((d) => d.driver)));
      setUniqueDriverTypes(uniqTypes);
      setSelectedDriverTypes(
        defaultSelectedDriverTypes || uniqTypes.slice(0, 1)
      );
    }
  }, [drivers, driversData, defaultSelectedDriverTypes]); // Added drivers to dependencies

  // Setting the unique surrounding elements for filters
  useEffect(() => {
    const uniqueElements: string[] = [];
    if (surroundingElements && surroundingElements.length) {
      surroundingElements.forEach((e: ISurroundingElement) => {
        if (!uniqueElements.includes(e.type)) {
          uniqueElements.push(e.type);
        }
      });
      setUniqueSurroundingElements(uniqueElements);
    }
  }, [surroundingElements]);

  // Setting icon for project marker
  useEffect(() => {
    async function fetchProjectIcon() {
      const currentProjectIcon = await getIcon(
        "IoLocation",
        "io5",
        true,
        undefined,
        undefined,
        {
          iconBgColor: COLORS.primaryColor,
          iconColor: "white",
          iconSize: 24,
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
          iconBgColor: COLORS.textColorDark,
          iconColor: "white",
          iconSize: 24,
        }
      );
      setProjectMarkerIcon(projectIcon);
    }
    fetchProjectIcon();
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

  const renderCorridors = () => {
    const RippleSVG = () => (
      <div style={{ width: "100px", height: "150px" }}>
        <svg width="150" height="150" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="10"
            fill="none"
            stroke={COLORS.textColorDark}
            stroke-width="2"
          >
            <animate
              attributeName="r"
              from="10"
              to="90"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              from="1"
              to="0"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx="100"
            cy="100"
            r="10"
            fill="none"
            stroke={COLORS.textColorDark}
            stroke-width="2"
          >
            <animate
              attributeName="r"
              from="10"
              to="90"
              begin="0.5s"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              from="1"
              to="0"
              begin="0.5s"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx="100"
            cy="100"
            r="10"
            fill="none"
            stroke={COLORS.textColorDark}
            stroke-width="2"
          >
            <animate
              attributeName="r"
              from="10"
              to="90"
              begin="1s"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              from="1"
              to="0"
              begin="1s"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx="100"
            cy="100"
            r="10"
            fill="none"
            stroke={COLORS.textColorDark}
            stroke-width="2"
          >
            <animate
              attributeName="r"
              from="10"
              to="90"
              begin="1.5s"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              from="1"
              to="0"
              begin="1.5s"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>
    );
    const RippleIcon = L.divIcon({
      className: "", // prevent default icon styles
      html: renderToString(<RippleSVG />),
      iconSize: [100, 100],
      iconAnchor: [50, 50],
    });
    return corridors!.map(async (c) => {
      return (
        <Marker
          key={c._id}
          icon={RippleIcon}
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
      );
    });
  };

  const renderSurroundings = () => {
    if (!surroundingElements || !surroundingElements.length) {
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

        // let isMulti = false;
        // const plgynCoordinates = element.geometry.map((g: any) => {
        //   if (Array.isArray(g)) {
        //     isMulti = true;
        //     return g.map((subG) => {
        //       return [subG.lon, subG.lat];
        //     });
        //   } else {
        //     return [g.lon, g.lat];
        //   }
        // });

        // let feature, center, cc, icon;
        // try {
        //   feature = isMulti
        //     ? turf.multiLineString(plgynCoordinates)
        //     : turf.lineString(plgynCoordinates);
        //   center = turf.pointOnFeature(feature!);
        //   cc = center!.geometry.coordinates;
        //   icon = (SurroundingElementLabels as any)[element.type].icon;
        // } catch (Err) {
        //   console.log("here");
        // }

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
                color: COLORS.textColorDark,
                weight: 8,
                opacity: 0.8,
              }}
              eventHandlers={{
                click: handleElementClick,
              }}
            />
            {/* <Marker
              key={`m-${index}`}
              position={[cc![1], cc![0]]}
              icon={icon}
              eventHandlers={{
                click: handleElementClick,
              }}
            /> */}
          </>
        );
      });
  };

  const renderRoadDrivers = () => {
    if (!drivers || !drivers.length) {
      return;
    }
    return driversData
      ?.filter(
        (driver): driver is RoadDriverPlace =>
          driver.driver === "highway" &&
          !!driver.features &&
          typeof driver.status === "string" &&
          selectedDriverTypes.includes(driver.driver)
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
                weight: 5,
                opacity: 0.5,
                dashArray: isDashed ? "10, 10" : undefined,
              }}
              eventHandlers={{
                click: () => {
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
                },
              }}
            />
          );
        });
      });
  };

  const renderTransitDrivers = () => {
    if (!drivers || !drivers.length) {
      return;
    }
    return driversData
      ?.filter(
        (driver): driver is RoadDriverPlace =>
          driver.driver === "transit" &&
          !!driver.features &&
          typeof driver.status === "string" &&
          selectedDriverTypes.includes(driver.driver)
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

        return [
          // Render transit lines
          ...lineFeatures.map((feature, lineIndex) => {
            const positions = feature.coordinates.map(
              ([lng, lat]) => [lat, lng] as [number, number]
            );

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
                      title: driver.name,
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
                    title: `${driver.name}${
                      feature.properties?.name
                        ? ", Station: " + feature.properties?.name
                        : ""
                    }`,
                    content: driver.details?.description || "",
                    tags: [
                      {
                        label:
                          driver.name.toLowerCase().indexOf("suburban") > -1
                            ? "Suburban Rail"
                            : "Namma Metro",
                        color: COLORS.primaryColor,
                      },
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
          )),
        ];
      });
  };

  /** Renders driver markers */
  const renderSimpleDriverMarkers = () => {
    if (!drivers?.length || !driversData?.length) {
      console.log("No drivers data to render markers for");
      return null;
    }

    console.log(
      "Rendering markers for drivers:",
      driversData.length,
      "Selected types:",
      selectedDriverTypes
    );

    return driversData
      ?.filter((driver) => {
        const included = selectedDriverTypes.includes(driver.driver);

        return included;
      })
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
                const projectSpecificDetails = drivers?.find(
                  (d) => d.id == driver._id
                );
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
                    {
                      label: `${projectSpecificDetails.duration} mins`,
                      color: COLORS.textColorDark,
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
    if (projectsNearby?.length && projectsNearbyIcons?.length) {
      return projectsNearby.map((project) => {
        if (!project.projectLocation?.[0] || !project.projectLocation?.[1]) {
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
            position={project.projectLocation}
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
    }
    return null;
  };

  /** Filter for driver types */
  const renderDriverTypesTag = (k: string, selected: boolean) => {
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
          padding: "4px 8px",
          backgroundColor: selected ? COLORS.primaryColor : "initial",
          color: selected ? "white" : "initial",
          marginLeft: 4,
          fontSize: FONT_SIZE.HEADING_3,
          cursor: "pointer",
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
        <DynamicReactIcon
          iconName={icon.name}
          iconSet={icon.set}
          size={20}
          color={selected ? "white" : COLORS.textColorDark}
        ></DynamicReactIcon>
        <Typography.Text
          style={{
            color: selected ? "white" : COLORS.textColorDark,
            marginLeft: 8,
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
            k == selectedSurroundingElement ? COLORS.primaryColor : "initial",
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

  const [corridorElements, setCorridorElements] = useState<React.ReactNode[]>(
    []
  );

  useEffect(() => {
    async function fetchCorridorElements() {
      if (corridors && corridors.length) {
        const elements = await Promise.all(renderCorridors());
        setCorridorElements(elements);
      }
    }
    fetchCorridorElements();
  }, [corridors]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflowY: "hidden",
      }}
    >
      {/* Drivers filters */}
      {drivers && drivers.length && fullSize ? (
        <Flex vertical style={{ paddingBottom: "8px", marginBottom: 16 }}>
          <Flex
            style={{
              width: "100%",
              overflowX: "scroll",
              backgroundColor: COLORS.bgColorMedium,
              scrollbarWidth: "none",
              height: 32,
            }}
          >
            {uniqueDriverTypes
              .filter((d) => !!d)
              .map((k: string) => {
                return renderDriverTypesTag(k, selectedDriverTypes.includes(k));
              })}
          </Flex>
        </Flex>
      ) : null}

      {/* Surrounding Elements Filters */}
      {surroundingElements && surroundingElements.length && fullSize ? (
        <Flex vertical style={{ paddingBottom: "8px", marginBottom: 16 }}>
          <Flex
            style={{
              width: "100%",
              overflowX: "scroll",
              backgroundColor: COLORS.bgColorMedium,
              scrollbarWidth: "none",
              height: 32,
            }}
          >
            {uniqueSurroundingElements.map((k: string) => {
              return renderSurroundingElementTypes(k);
            })}
          </Flex>
        </Flex>
      ) : null}
      <Flex
        style={{
          height: fullSize ? "calc(100% - 70px)" : "100%",
          width: "100%",
        }}
      >
        <MapContainer
          center={[13.110274, 77.6009443]}
          zoom={12}
          minZoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <MapResizeHandler />
          <MapCenterHandler projectData={primaryProject} projects={projects} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {renderRoadDrivers()}
          {renderTransitDrivers()}
          {renderSimpleDriverMarkers()}
          {renderProjectMarkers()}
          {corridorElements}
          {renderSurroundings()}
          {renderProjectsNearby()}
          {drivers && drivers.length ? (
            <MapPolygons
              driversData={driversData || []}
              selectedDriverTypes={selectedDriverTypes}
              setModalContent={setModalContent}
              setInfoModalOpen={setInfoModalOpen}
            />
          ) : null}
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

          {/* {modalContent && modalContent.content ? (
            <Markdown remarkPlugins={[remarkGfm]} className="liviq-content">
              {modalContent?.content}
            </Markdown>
          ) : null} */}
        </Flex>
      </Modal>
    </div>
  );
};

export default MapViewV2;
