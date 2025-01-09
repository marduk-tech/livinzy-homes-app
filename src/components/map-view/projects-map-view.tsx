import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  AdvancedMarkerProps,
  APIProvider,
  Map,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import React, { useCallback, useState } from "react";
import { useFetchAllLivindexPlaces } from "../../hooks/use-livindex-places";
import { captureAnalyticsEvent } from "../../libs/lvnzy-helper";
import { Project } from "../../types/Project";
import { LivIndexMarker } from "./liv-index-marker";
import { getProjectsMapData } from "./map-util";
import { ProjectMarker } from "./project-marker";
import { RoadInfra } from "./road-infra";
import { useDevice } from "../../hooks/use-device";

export type AnchorPointName = keyof typeof AdvancedMarkerAnchorPoint;

const API_KEY = "AIzaSyADagII4pmkrk8R1VVsEzbz0qws3evTYfQ";

export const ProjectsMapView = ({
  projects,
  onProjectClick,
}: {
  projects: Project[];
  onProjectClick: any;
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
    const roadsData = livIndexPlaces
      .filter(
        (place) => place.driver === "highway" || place.driver === "transit"
      )
      .filter((place) => place.parameters?.growthLever === true);

    return (
      <APIProvider
        apiKey={API_KEY}
        libraries={["marker"]}
        onLoad={() => {
          captureAnalyticsEvent("projects-map-view-loaded", {});
        }}
      >
        <Map
          style={{
            width: "100%",
            height: isMobile ? "calc(100vh - 290px)" : "calc(100vh - 200px)",
          }}
          mapId={"bf51a910020fa25a"}
          defaultZoom={11}
          minZoom={10}
          defaultCenter={{ lat: 13.201304, lng: 77.602374 }}
          gestureHandling={"greedy"}
          onClick={onMapClick}
          clickableIcons={false}
          disableDefaultUI
        >
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
                    onProjectClick={onProjectClick}
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
                place.parameters.growthLever
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

          {roadsData &&
            roadsData.map((road) => {
              return <RoadInfra roadData={road}></RoadInfra>;
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
