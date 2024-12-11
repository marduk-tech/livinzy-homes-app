import { CloseOutlined } from "@ant-design/icons";
import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  AdvancedMarkerProps,
  APIProvider,
  Map,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { Flex, Typography } from "antd";
import React, { useCallback, useState } from "react";
import { capitalize, captureAnalyticsEvent } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { IDriverPlace, IExtrinsicDriver, Project } from "../../types/Project";
import DynamicReactIcon from "../common/dynamic-react-icon";
import { RoadInfra } from "./road-infra";
import { LivIndexDriversConfig } from "../../libs/constants";

export type AnchorPointName = keyof typeof AdvancedMarkerAnchorPoint;

const API_KEY = "AIzaSyADagII4pmkrk8R1VVsEzbz0qws3evTYfQ";

export const ProjectLivIndexMapView = ({
  project,
  livIndexPlaces,
}: {
  project?: Project;
  livIndexPlaces: IDriverPlace[];
}) => {
  const LivIndexMarker: React.FC<any> = ({
    coordinates,
    zIndex,
    markerId,
    icon,
    label,
    isProject,
  }) => {
    return (
      <React.Fragment key={markerId}>
        <AdvancedMarkerWithRef
          anchorPoint={AdvancedMarkerAnchorPoint[anchorPoint]}
          className="custom-marker"
          position={coordinates}
          zIndex={expandedId === markerId ? 1000 : zIndex}
          onMarkerClick={(marker: google.maps.marker.AdvancedMarkerElement) =>
            console.log(markerId, marker)
          }
        >
          <PlaceCard
            icon={icon}
            label={label}
            isProject={isProject}
            isExpanded={expandedId === markerId}
            onExpand={() => {
              handleCardExpand(markerId);
              if (project) {
                captureAnalyticsEvent("click-livindex-marker", {
                  projectId: project._id,
                  placeName: label,
                });
              }
            }}
          />
        </AdvancedMarkerWithRef>
      </React.Fragment>
    );
  };

  const [anchorPoint, setAnchorPoint] = useState("BOTTOM" as AnchorPointName);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCardExpand = useCallback((id: string) => {
    setExpandedId((prevId) => (prevId === id ? null : id));
  }, []);

  if (project && project.livIndexScore && project.livIndexScore.score > 0) {
    return (
      <APIProvider apiKey={API_KEY} libraries={["marker"]}>
        <Map
          style={{
            width: "100%",
            height: "100%",
          }}
          mapId={"bf51a910020fa25a"}
          defaultZoom={project ? 8.8 : 7}
          defaultCenter={
            project
              ? project.metadata.location
              : { lat: 14.5638117, lng: 77.8884163 }
          }
          gestureHandling={"greedy"}
          clickableIcons={false}
          disableDefaultUI
        >
          {project.livIndexScore.extrinsicDrivers.map(
            (extrinsicDriver: IExtrinsicDriver, index: number) => {
              const originalLivIndexPlace = livIndexPlaces.find(
                (p: IDriverPlace) => p._id == extrinsicDriver.placeId
              );
              const driverConfig = (LivIndexDriversConfig as any)[
                originalLivIndexPlace!.driver
              ];

              if (originalLivIndexPlace!.driver == "road") {
                return <RoadInfra roadData={originalLivIndexPlace}></RoadInfra>;
              } else {
                let zIndex = index + 1;
                const coordinates = originalLivIndexPlace!.location!;
                if (!coordinates.lat || !coordinates.lng) {
                  return null;
                }

                return (
                  <LivIndexMarker
                    coordinates={originalLivIndexPlace!.location}
                    icon={driverConfig.icon}
                    zIndex={project.livIndexScore.extrinsicDrivers.length + 1}
                    label={originalLivIndexPlace!.name}
                    markerId={extrinsicDriver._id}
                    isProject={false}
                  ></LivIndexMarker>
                );
              }
            }
          )}
        </Map>
        <LivIndexMarker
          coordinates={project?.metadata!.location}
          icon={{
            name: "FaMapMarkerAlt",
            set: "fa",
          }}
          zIndex={1}
          label={project?.metadata.name}
          markerId={project!._id}
          isProject={true}
        ></LivIndexMarker>
      </APIProvider>
    );
  }
};

export const PlaceCard = ({
  label,
  icon,
  isExpanded,
  onExpand,
  isProject,
}: {
  label: string;
  icon: {
    name: string;
    set: any;
  };
  isExpanded: boolean;
  onExpand: () => void;
  isProject: boolean;
}) => {
  const handleClick = () => {
    onExpand();
  };

  return (
    <Flex
      onClick={handleClick}
      align="center"
      justify={isExpanded ? "flex-start" : "center"}
      style={{
        backgroundColor: isProject ? COLORS.primaryColor : "white",
        borderRadius: isExpanded ? 10 : "50%",
        whiteSpace: "wrap",
        padding: isExpanded ? 8 : 0,
        boxShadow: "0 0 4px",
        width: isExpanded ? 200 : 50,
        height: isExpanded ? "auto" : 50,
        cursor: "pointer",
        zIndex: 99,
      }}
    >
      {isExpanded ? (
        <Flex style={{ width: "100%" }}>
          <Flex gap={8} align="flex-start">
            <Flex style={{ width: 32 }}>
              <DynamicReactIcon
                iconName={icon.name}
                iconSet={icon.set}
                size={18}
                color={isProject ? "white" : COLORS.textColorDark}
              ></DynamicReactIcon>
            </Flex>
            <Flex vertical align="flex-start" gap={4}>
              <Typography.Text
                style={{
                  color: isProject ? "white" : COLORS.textColorDark,
                  fontSize: FONT_SIZE.subText,
                }}
              >
                {capitalize(label || "")}
              </Typography.Text>
            </Flex>
          </Flex>
          <CloseButton
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
          />
        </Flex>
      ) : (
        <DynamicReactIcon
          iconName={icon.name}
          iconSet={icon.set}
          color={isProject ? "white" : COLORS.textColorDark}
        ></DynamicReactIcon>
      )}
    </Flex>
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
        fontSize: "14px",
        cursor: "pointer",
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        display: "flex",
        marginLeft: "auto",
      }}
      onClick={onClick}
    >
      <CloseOutlined />
    </div>
  );
};
