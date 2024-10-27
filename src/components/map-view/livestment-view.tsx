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
import { IPlace, Project } from "../../types/Project";
import { getLivestmentData } from "./map-util";
import DynamicReactIcon from "../common/dynamic-react-icon";
import { RoadInfra } from "./road-infra";
import RoadsData from "../../libs/map-data/road-data.json";
import { COLORS } from "../../theme/style-constants";

export type AnchorPointName = keyof typeof AdvancedMarkerAnchorPoint;

const API_KEY = "AIzaSyADagII4pmkrk8R1VVsEzbz0qws3evTYfQ";

export const LivestmentView = ({ project }: { project: Project }) => {
  const livestmentData = getLivestmentData(project).map((dataItem, index) => ({
    ...dataItem,
    zIndex: index,
  }));

  const Z_INDEX_SELECTED = livestmentData.length;
  const Z_INDEX_HOVER = livestmentData.length + 1;

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

  if (livestmentData && project) {
    return (
      <APIProvider apiKey={API_KEY} libraries={["marker"]}>
        <Map
          style={{
            width: "100%",
            height: "100%",
          }}
          mapId={"bf51a910020fa25a"}
          defaultZoom={8.8}
          defaultCenter={livestmentData[0].position}
          gestureHandling={"greedy"}
          onClick={onMapClick}
          clickableIcons={false}
          disableDefaultUI
        >
          {livestmentData.map(
            ({ id, zIndex: zIndexDefault, position, place }) => {
              if (place.type == "roads") {
                return (
                  <RoadInfra
                    roadData={(RoadsData as any)[place.name!]}
                  ></RoadInfra>
                );
              } else {
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
                      <PlaceCard
                        place={place}
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
              }
            }
          )}
          {/* {Object.keys(RoadsData as any).map((roadName: string) => {
            return (
              <RoadInfra roadData={(RoadsData as any)[roadName]}></RoadInfra>
            );
          })} */}
        </Map>
      </APIProvider>
    );
  }
};

export const PlaceCard = ({
  place,
  isExpanded,
  onExpand,
}: {
  place: IPlace;
  isExpanded: boolean;
  onExpand: () => void;
}) => {
  const handleClick = () => {
    onExpand();
  };

  return (
    <Flex
      onClick={handleClick}
      align="center"
      justify="center"
      style={{
        backgroundColor:
          place.type == "project" ? COLORS.primaryColor : "white",
        borderRadius: isExpanded ? 10 : "50%",
        whiteSpace: "nowrap",
        padding: isExpanded ? 8 : 0,
        width: isExpanded ? "auto" : 50,
        height: 50,
        cursor: "pointer",
        zIndex: 99,
      }}
    >
      {isExpanded ? (
        <>
          {/* <CloseButton
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
          /> */}
          <Flex align="center" gap={8}>
            <DynamicReactIcon
              color={COLORS.primaryColor}
              iconName={place.icon.name}
              iconSet={place.icon.set}
            ></DynamicReactIcon>
            <Typography.Text style={{ color: COLORS.primaryColor }}>
              {place.name}
            </Typography.Text>
          </Flex>
        </>
      ) : (
        <DynamicReactIcon
          iconName={place.icon.name}
          iconSet={place.icon.set}
          color={place.type == "project" ? "white" : COLORS.primaryColor}
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
