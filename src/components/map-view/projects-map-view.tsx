import { ArrowRightOutlined } from "@ant-design/icons";
import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  AdvancedMarkerProps,
  APIProvider,
  Map,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { Button, Flex, Image, Typography } from "antd";
import React, { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { FONT_SIZE } from "../../theme/style-constants";
import { Project } from "../../types/Project";
import { getData } from "./map-util";

export type AnchorPointName = keyof typeof AdvancedMarkerAnchorPoint;

const API_KEY = "AIzaSyADagII4pmkrk8R1VVsEzbz0qws3evTYfQ";

export const ProjectsMapView = ({ projects }: { projects: Project[] }) => {
  console.log(projects);

  const data = getData({ projects: projects })
    .sort((a, b) => b.position.lat - a.position.lat)
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
                  <ProjectCard project={project} />
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

export const ProjectCard = ({ project }: { project: Project }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        backgroundColor: "white",
        borderRadius: 10,
        padding: "10px",
        whiteSpace: "nowrap",
        minWidth: isExpanded ? "300px" : "max-content",
        width: isExpanded ? "300px" : "auto",
        height: isExpanded ? "auto" : "auto",
        border: "1px solid #ccc",
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {isExpanded && (
        <div>
          <Image
            style={{
              borderRadius: "10px",
            }}
            preview={false}
            src={project.media[0].url}
            alt={project.metadata.name}
          />
        </div>
      )}
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
