import { useMap } from "@vis.gl/react-google-maps";
import { Flex, Tag } from "antd";
import { useEffect, useState } from "react";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { Typography } from "antd";
import { PLACE_TIMELINE } from "../../libs/constants";

const { Paragraph } = Typography;

interface LatLng {
  lat: number;
  lng: number;
}

interface LineFeature {
  name: string;
  coordinates: LatLng[];
  strokeColor: string;
  strokeOpacity: number;
  strokeWeight: number;
  dashConfig?: {
    spacing: number;
  };
}

export const ConnectivityInfra: React.FC<any> = ({ connectivityData }) => {
  const map = useMap();
  const [lines, setLines] = useState<LineFeature[]>([]);

  const [selectedLine, setSelectedLine] = useState<LineFeature | null>(null);
  const [popupPosition, setPopupPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const extractedLines: LineFeature[] =
      (connectivityData?.features
        .map((feature: any) => {
          const roadName =
            connectivityData.features.length > 1
              ? feature.properties.name || connectivityData.name
              : connectivityData.name;

          let customProps = {};

          const status =
            connectivityData.features.length == 1
              ? connectivityData.status
              : feature.properties.status || connectivityData.status;
          if (
            status &&
            ![
              PLACE_TIMELINE.LAUNCHED,
              PLACE_TIMELINE.POST_LAUNCH,
              PLACE_TIMELINE.PARTIAL_LAUNCH,
            ].includes(status)
          ) {
            customProps = {
              dashConfig: {
                spacing: 20,
              },
            };
          }

          if (feature.geometry.type === "LineString") {
            const coordinates: LatLng[] = feature.geometry.coordinates.map(
              ([lng, lat]: [number, number]) => ({ lat, lng })
            );

            return {
              name: roadName,
              coordinates: [coordinates],
              strokeColor:
                feature.properties.strokeColor || COLORS.textColorLight,
              strokeWeight: 4,
              ...customProps,
            };
          } else if (feature.geometry.type === "MultiLineString") {
            const coordinates: LatLng[][] = feature.geometry.coordinates.map(
              (line: [number, number, number][]) =>
                line.map(([lng, lat]: [number, number, number]) => ({
                  lat,
                  lng,
                }))
            );
            return {
              name: roadName,
              coordinates,
              strokeColor:
                feature.properties.strokeColor || COLORS.textColorLight,
              strokeWeight: 4,
              ...customProps,
            };
          }
          return null;
        })
        .filter(Boolean) as LineFeature[]) || [];

    setLines(extractedLines);
  }, []);

  useEffect(() => {
    if (!map) return;

    const mapListeners = [
      map.addListener("click", () => {
        setSelectedLine(null);
        setPopupPosition(null);
      }),
      map.addListener("dragstart", () => {
        setSelectedLine(null);
        setPopupPosition(null);
      }),
      map.addListener("zoom_changed", () => {
        setSelectedLine(null);
        setPopupPosition(null);
      }),
    ];

    const polylineObjects = lines.flatMap((line) =>
      line.coordinates.map((coords) => {
        let polyline;
        if (line.dashConfig) {
          polyline = new google.maps.Polyline({
            path: coords as any,
            strokeOpacity: 0,
            map: map,
            icons: [
              {
                icon: {
                  path: "M 0,-1 0,1",
                  strokeOpacity: 1,
                  strokeColor: line.strokeColor,
                  scale: 4,
                },
                offset: "0",
                repeat: `${line.dashConfig.spacing}px`, // Length of dashes
              },
            ],
          });
        } else {
          polyline = new google.maps.Polyline({
            path: coords as any,
            strokeColor: line.strokeColor,
            strokeOpacity: line.strokeOpacity,
            strokeWeight: line.strokeWeight,
            map: map,
          });
        }

        polyline.addListener("click", (e: any) => {
          e.stop();
          setSelectedLine(line);

          setPopupPosition({
            x: e.domEvent.clientX,
            y: e.domEvent.clientY,
          });
        });

        return polyline;
      })
    );

    // Cleanup when unmounting
    return () => {
      polylineObjects.forEach((polyline) => {
        google.maps.event.clearListeners(polyline, "click");
        polyline.setMap(null);
      });
      mapListeners.forEach((listener) =>
        google.maps.event.removeListener(listener)
      );
    };
  }, [map, lines]);

  useEffect(() => {
    const handleScroll = () => {
      setSelectedLine(null);
      setPopupPosition(null);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <>
        {selectedLine && popupPosition && selectedLine.name && (
          <div
            style={{
              position: "fixed",
              left: popupPosition.x,
              top: popupPosition.y,
              zIndex: 10,
              borderRadius: "10px",
              maxWidth: "300px",
              backgroundColor: "#4c5b68",
            }}
          >
            <div style={{ padding: "8px" }}>
              <Typography.Text
                style={{ color: "white", fontSize: FONT_SIZE.HEADING_3 }}
              >
                {connectivityData.name}
              </Typography.Text>
              <Flex
                style={{ marginBottom: "8px", marginTop: "8px" }}
                wrap="wrap"
              >
                {connectivityData?.features.length > 1 ? (
                  <Tag
                    color="blue"
                    key={selectedLine.name}
                    style={{
                      marginRight: "4px",
                      marginBottom: "4px",
                      fontSize: FONT_SIZE.SUB_TEXT,
                    }}
                  >
                    {selectedLine.name}
                  </Tag>
                ) : null}
                <Tag
                  color={
                    selectedLine.dashConfig
                      ? COLORS.yellowIdentifier
                      : COLORS.greenIdentifier
                  }
                  style={{
                    marginRight: "4px",
                    marginBottom: "4px",
                    fontSize: FONT_SIZE.SUB_TEXT,
                  }}
                >
                  {selectedLine.dashConfig
                    ? "Under Construction"
                    : "Operational"}
                </Tag>
              </Flex>
              <Paragraph
                style={{
                  height: 90,
                  overflowY: "scroll",
                  fontSize: FONT_SIZE.SUB_TEXT,
                  color: "white",
                }}
                ellipsis={{ rows: 2, expandable: true, symbol: "more" }}
              >
                {connectivityData?.description}
              </Paragraph>
            </div>
          </div>
        )}
      </>
    </>
  );
};
