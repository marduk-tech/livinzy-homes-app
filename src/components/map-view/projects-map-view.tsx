import { ArrowRightOutlined, CloseOutlined } from "@ant-design/icons";
import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  AdvancedMarkerProps,
  APIProvider,
  Map,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { Button, Flex, Typography } from "antd";
import React, { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { FONT_SIZE } from "../../theme/style-constants";
import { Project } from "../../types/Project";
import { getData } from "./map-util";
import { ProjectCard } from "../common/project-card";

export type AnchorPointName = keyof typeof AdvancedMarkerAnchorPoint;

const API_KEY = "AIzaSyADagII4pmkrk8R1VVsEzbz0qws3evTYfQ";

export const ProjectsMapView = ({ projects }: { projects: Project[] }) => {
  console.log(projects);

  const data = getData({ projects: projects })
    .sort((a, b) => b.position!.lat - a.position!.lat)
    .map((dataItem, index) => ({ ...dataItem, zIndex: index }));

  const Z_INDEX_SELECTED = data.length;
  const Z_INDEX_HOVER = data.length + 1;

  const [markers] = useState(data);

  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const onMouseEnter = useCallback((id: string | null) => setHoverId(id), []);
  const onMouseLeave = useCallback(() => setHoverId(null), []);

  const onMapClick = useCallback(() => {
    setSelectedId(null);
  }, []);

  const [anchorPoint, setAnchorPoint] = useState("BOTTOM" as AnchorPointName);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCardExpand = useCallback((id: string) => {
    setExpandedId((prevId) => (prevId === id ? null : id));
  }, []);

  if (data && projects) {
    return (
      <APIProvider apiKey={API_KEY} libraries={["marker"]}>
        <Map
          style={{
            width: "100%",
            height: "100vh",
          }}
          mapId={"bf51a910020fa25a"}
          defaultZoom={8.8}
          defaultCenter={data[0].position}
          gestureHandling={"greedy"}
          onClick={onMapClick}
          clickableIcons={false}
          disableDefaultUI
        >
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
                  ) => console.log(id, marker)}
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
                    onExpand={() => handleCardExpand(id)}
                  />
                </AdvancedMarkerWithRef>

                <AdvancedMarkerWithRef
                  onMarkerClick={(
                    marker: google.maps.marker.AdvancedMarkerElement
                  ) => console.log(id, marker)}
                  zIndex={zIndex}
                  onMouseEnter={() => onMouseEnter(id)}
                  onMouseLeave={onMouseLeave}
                  anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
                  position={position}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      background: "#ccc",
                      borderRadius: "50%",
                    }}
                  ></div>
                </AdvancedMarkerWithRef>
              </React.Fragment>
            );
          })}
        </Map>
      </APIProvider>
    );
  }
};

export const ProjectMarker = ({
  project,
  isExpanded,
  onExpand,
}: {
  project: Project;
  isExpanded: boolean;
  onExpand: () => void;
}) => {
  const handleClick = () => {
    onExpand();
  };

  const imageSrc = project.media.find((m) => m.isPreview)?.image?.url;

  return (
    <div
      onClick={handleClick}
      style={{
        backgroundColor: "white",
        borderRadius: 10,
        padding: "10px",
        whiteSpace: "nowrap",
        border: "1px solid #ccc",
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {isExpanded ? (
        <Flex style={{ width: 250, height: 300 }}>
          <ProjectCard project={project}></ProjectCard>
        </Flex>
      ) : (
        <div style={{ marginTop: isExpanded ? "24px" : "0px" }}>
          <Flex justify="space-between" align="center">
            <Typography.Text
              style={{
                fontSize: isExpanded ? FONT_SIZE.subHeading : "16px",
                fontWeight: "medium",
              }}
            >
              {project.metadata.name}
            </Typography.Text>
            {isExpanded && (
              <Link to={`/project/${project._id}`}>
                <Button
                  variant="outlined"
                  icon={<ArrowRightOutlined />}
                  size="small"
                ></Button>
              </Link>
            )}
          </Flex>
        </div>
      )}
    </div>
  );
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

export const CloseButton: React.FC<{ onClick: (e: any) => void }> = ({
  onClick,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "18px",
        right: "18px",
        fontSize: "14px",
        cursor: "pointer",
        zIndex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClick}
    >
      <CloseOutlined />
    </div>
  );
};
