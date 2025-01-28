import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  AdvancedMarkerProps,
  APIProvider,
  Map,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import React, { useCallback, useState } from "react";
import { useDevice } from "../../hooks/use-device";
import { useFetchAllLivindexPlaces } from "../../hooks/use-livindex-places";
import { captureAnalyticsEvent } from "../../libs/lvnzy-helper";
import { Project } from "../../types/Project";
import { ConnectivityInfra } from "./connectivity-infra";
import { LivIndexMarker } from "./liv-index-marker";
import { getProjectsMapData } from "./map-util";
import { Polygon } from "./polygon";
import { ProjectMarker } from "./project-marker";

export type AnchorPointName = keyof typeof AdvancedMarkerAnchorPoint;

const API_KEY = "AIzaSyADagII4pmkrk8R1VVsEzbz0qws3evTYfQ";

// Bright map style
const mapStyles = [
  {
    featureType: "all",
    elementType: "all",
    stylers: [
      { saturation: "32" },
      { lightness: "-3" },
      { visibility: "on" },
      { weight: "1.18" },
    ],
  },
  {
    featureType: "administrative",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "landscape",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "landscape.man_made",
    elementType: "all",
    stylers: [{ saturation: "-70" }, { lightness: "14" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [{ saturation: "100" }, { lightness: "-14" }],
  },
  {
    featureType: "water",
    elementType: "labels",
    stylers: [{ visibility: "off" }, { lightness: "12" }],
  },
];

export const ProjectsMapView = ({
  projects,
  drivers,
  onProjectClick,
}: {
  projects: Project[];
  drivers: string[];
  onProjectClick?: any;
}) => {
  const { data: livIndexPlaces } = useFetchAllLivindexPlaces();
  const projectsData = getProjectsMapData({ projects: projects })
    .sort((a, b) => b.position!.lat - a.position!.lat)
    .map((dataItem, index) => ({ ...dataItem, zIndex: index }));

  const Z_INDEX_SELECTED = projectsData.length;
  const Z_INDEX_HOVER = projectsData.length + 1;

  const [markers] = useState(projectsData);
  const [anchorPoint] = useState<AnchorPointName>("BOTTOM");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedLivIndexId, setExpandedLivIndexId] = useState<string | null>(
    null
  );

  const onMouseEnter = useCallback((id: string | null) => setHoverId(id), []);
  const onMouseLeave = useCallback(() => setHoverId(null), []);
  const { isMobile } = useDevice();

  const onMapClick = useCallback(() => {
    setSelectedId(null);
    setExpandedId(null);
    setExpandedLivIndexId(null);
  }, []);

  const handleCardExpand = useCallback((id: string) => {
    setExpandedId((prevId) => (prevId === id ? null : id));
  }, []);

  const handleLivIndexExpand = useCallback((id: string) => {
    setExpandedLivIndexId((prevId) => (prevId === id ? null : id));
  }, []);

  if (projectsData && projects && livIndexPlaces) {
    const connectivityData = livIndexPlaces
      .filter(
        (place) => place.driver === "highway" || place.driver === "transit"
      )
      .filter(
        (place) =>
          (drivers && drivers.includes(place._id)) ||
          (place.parameters && place.parameters.growthLever === true)
      );

    return (
      <APIProvider
        apiKey={API_KEY}
        libraries={["marker"]}
        onLoad={() => {
          captureAnalyticsEvent("projects-map-view-loaded", {});
        }}
      >
        <Map
          styles={mapStyles}
          mapTypeId={"roadmap"}
          mapId={"bf51a910020fa25a"}
          style={{
            width: "100%",
          }}
          defaultZoom={11}
          minZoom={10}
          defaultCenter={
            projects && projects.length == 1
              ? {
                  lat: projects[0].metadata.location.lat,
                  lng: projects[0].metadata.location.lng,
                }
              : { lat: 13.201304, lng: 77.602374 }
          }
          gestureHandling={"greedy"}
          onClick={onMapClick}
          clickableIcons={false}
          disableDefaultUI
        >
          {/* Sub Area Polygons */}
          {livIndexPlaces
            ?.filter((place) => place.driver == "sub-area")
            .map((area) => {
              return (
                <Polygon
                  key={area.name}
                  paths={[
                    area.features.coordinates[0].map((coord: number[]) => ({
                      lat: coord[1],
                      lng: coord[0],
                    })),
                  ]}
                  fillColor="#808080"
                  fillOpacity={0.1}
                  strokeColor="#808080"
                  strokeWeight={1}
                />
              );
            })}

          {/* Project Markers */}
          {markers.map(({ id, zIndex: zIndexDefault, position, project }) => {
            let zIndex = zIndexDefault;

            if (hoverId === id) {
              zIndex = Z_INDEX_HOVER;
            }

            if (selectedId === id) {
              zIndex = Z_INDEX_SELECTED;
            }

            return (
              <React.Fragment key={id}>
                <AdvancedMarkerWithRef
                  anchorPoint={AdvancedMarkerAnchorPoint[anchorPoint]}
                  className="custom-marker"
                  position={position}
                  zIndex={zIndex}
                  onMarkerClick={(
                    marker: google.maps.marker.AdvancedMarkerElement
                  ) => {
                    console.log(id, marker);
                  }}
                  onMouseEnter={() => onMouseEnter(id)}
                  onMouseLeave={onMouseLeave}
                  style={{
                    transform: `scale(${
                      [hoverId, selectedId].includes(id) ? 1.05 : 1
                    })`,
                  }}
                >
                  <ProjectMarker
                    project={project}
                    isExpanded={expandedId === id}
                    onExpand={() => {
                      handleCardExpand(id);
                      captureAnalyticsEvent("click-project-marker-mapview", {
                        projectId: project._id,
                      });
                    }}
                    showClick={projects && projects.length > 1}
                    onProjectClick={() => {
                      onProjectClick(project._id);
                    }}
                  />
                </AdvancedMarkerWithRef>
              </React.Fragment>
            );
          })}

          {/* LivIndex Markers */}
          {livIndexPlaces
            ?.filter(
              (place) =>
                place.driver !== "highway" &&
                place.driver !== "transit" &&
                ((drivers && drivers.includes(place._id)) ||
                  (place.parameters && place.parameters.growthLever === true))
            )
            .map((place) => (
              <React.Fragment key={place._id}>
                <AdvancedMarkerWithRef
                  anchorPoint={AdvancedMarkerAnchorPoint.BOTTOM}
                  className="custom-marker"
                  position={place.location}
                  zIndex={1}
                  onMarkerClick={() => {}}
                  onMouseEnter={() => onMouseEnter(place._id)}
                  onMouseLeave={onMouseLeave}
                  style={{
                    transform: `scale(${hoverId === place._id ? 1.05 : 1})`,
                  }}
                >
                  <LivIndexMarker place={place} />
                </AdvancedMarkerWithRef>
              </React.Fragment>
            ))}

          {connectivityData &&
            connectivityData.map((road) => {
              return (
                <ConnectivityInfra connectivityData={road}></ConnectivityInfra>
              );
            })}
        </Map>
      </APIProvider>
    );
  }
};

export const AdvancedMarkerWithRef = (
  props: AdvancedMarkerProps & {
    onMarkerClick: (marker: google.maps.marker.AdvancedMarkerElement) => void;
  }
) => {
  const { children, onMarkerClick, ...advancedMarkerProps } = props;
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <AdvancedMarker
      onClick={() => {
        if (marker) {
          onMarkerClick(marker);
        }
      }}
      ref={markerRef}
      {...advancedMarkerProps}
    >
      {children}
    </AdvancedMarker>
  );
};
