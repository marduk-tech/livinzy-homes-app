import { CloseOutlined } from "@ant-design/icons";
import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  AdvancedMarkerProps,
  APIProvider,
  Map,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { Flex, Tag, Typography } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { useFetchLivindexPlaces } from "../../hooks/use-livindex-places";
import { capitalize, captureAnalyticsEvent } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { IPlace, Project } from "../../types/Project";
import DynamicReactIcon from "../common/dynamic-react-icon";
import { Loader } from "../common/loader";
import { getAllLivestmentData, getProjectLivestmentData } from "./map-util";
import { RoadInfra } from "./road-infra";

export type AnchorPointName = keyof typeof AdvancedMarkerAnchorPoint;

const API_KEY = "AIzaSyADagII4pmkrk8R1VVsEzbz0qws3evTYfQ";

export const LivestmentView = ({ project }: { project?: Project }) => {
  const { data: livindexPlaces, isLoading: livindexPlacesLoading } =
    useFetchLivindexPlaces({});

  const [livestmentData, setLivestmentData] = useState<Array<any>>([]);

  useEffect(() => {
    if (livindexPlaces) {
      const data = project
        ? getProjectLivestmentData(project)
        : getAllLivestmentData(livindexPlaces);

      setLivestmentData(
        data.map((item, index) => ({
          ...item,
          zIndex: index,
        }))
      );
    }
  }, [project, livindexPlaces]);

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

  if (livindexPlacesLoading) {
    return <Loader />;
  }

  if (livestmentData.length < 0) {
    return <p>No Places</p>;
  }

  if (livestmentData.length > 0 && livindexPlaces) {
    const livindexRoads = livindexPlaces.filter(
      (place: any) => place.type === "road"
    );

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
              ? livestmentData[0].position
              : { lat: 14.5638117, lng: 77.8884163 }
          }
          gestureHandling={"greedy"}
          onClick={onMapClick}
          clickableIcons={false}
          disableDefaultUI
        >
          {livestmentData.map(
            ({ id, zIndex: zIndexDefault, position, place }) => {
              if (place.type == "road") {
                const roadData: any = project
                  ? livindexRoads.find(
                      (road: any) => road._id === place.placeId
                    )
                  : place;

                return <RoadInfra roadData={roadData}></RoadInfra>;
              } else {
                let zIndex = zIndexDefault;

                if (hoverId === id) {
                  zIndex = Z_INDEX_HOVER;
                }

                if (selectedId === id) {
                  zIndex = Z_INDEX_SELECTED;
                }

                const coordinates = {
                  lat: project ? position?.lat : place?.location?.lat,
                  lng: project ? position?.lng : place?.location?.lng,
                };

                if (!coordinates.lat || !coordinates.lng) {
                  return null;
                }

                return (
                  <React.Fragment key={id}>
                    <AdvancedMarkerWithRef
                      anchorPoint={AdvancedMarkerAnchorPoint[anchorPoint]}
                      className="custom-marker"
                      position={coordinates}
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
                        onExpand={() => {
                          handleCardExpand(id);

                          if (project) {
                            captureAnalyticsEvent("click-livindex-marker", {
                              projectId: project._id,
                              placeName: place.heading,
                            });
                          }
                        }}
                      />
                    </AdvancedMarkerWithRef>
                  </React.Fragment>
                );
              }
            }
          )}
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
      justify={isExpanded ? "flex-start" : "center"}
      style={{
        backgroundColor:
          place.type == "project" ? COLORS.primaryColor : "white",
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
          <Flex gap={8}>
            <Flex vertical align="flex-start" gap={4}>
              {place.heading ? (
                <Tag style={{ fontSize: FONT_SIZE.default }}>
                  {place.heading}
                </Tag>
              ) : null}
              <Typography.Text
                style={{
                  color:
                    place.type == "project" ? "white" : COLORS.textColorDark,
                  fontSize: FONT_SIZE.subText,
                }}
              >
                {capitalize(place.name || "")}
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
          iconName={place.icon.name}
          iconSet={place.icon.set}
          color={place.type == "project" ? "white" : COLORS.textColorDark}
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
