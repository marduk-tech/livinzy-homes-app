import { Card, Flex, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { useDevice } from "../../hooks/use-device";
import {
  NearestTransitStation,
  useNearestTransitStations,
} from "../../hooks/use-nearest-transit-stations";
import { SearchResult } from "../../hooks/use-place-search";
import { PLACE_TIMELINE } from "../../libs/constants";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { IDriverPlace } from "../../types/Project";
import DynamicReactIcon from "../common/dynamic-react-icon";

interface NearestTransitStationsDisplayProps {
  selectedResult?: SearchResult | null;
  transitDrivers: IDriverPlace[];
  onFetchedTransitDrivers: (transitDrivers: NearestTransitStation[]) => void;
}

export const NearestTransitStationsDisplay: React.FC<
  NearestTransitStationsDisplayProps
> = ({ selectedResult, transitDrivers, onFetchedTransitDrivers }) => {
  const { isMobile } = useDevice();

  const {
    data: transitStationsData,
    isLoading,
    error,
  } = useNearestTransitStations(
    selectedResult?.coordinates[0],
    selectedResult?.coordinates[1]
  );

  const [nearestUniqueStations, setNearestUniqueStations] = useState<
    NearestTransitStation[]
  >([]);

  useEffect(() => {
    if (
      transitStationsData &&
      transitStationsData.nearestStations &&
      Array.isArray(transitStationsData.nearestStations) &&
      transitStationsData.nearestStations.length > 0
    ) {
      try {
        const nearestStationsSortedByDuration =
          transitStationsData.nearestStations
            .filter((station) => {
              return (
                station &&
                (station as any).stationId &&
                station.travelTime != null
              );
            })
            .sort((a, b) => a.travelTime - b.travelTime);

        const driverForWhichStationsAdded: string[] = [];
        const uniqueStations: NearestTransitStation[] = [];

        nearestStationsSortedByDuration.forEach((station) => {
          // Extract driverId from stationId (format: driverId_stationNumber)
          const stationId = (station as any).stationId;
          const stationDriverId = stationId ? stationId.split("_")[0] : null;

          if (
            stationDriverId &&
            !driverForWhichStationsAdded.includes(stationDriverId)
          ) {
            driverForWhichStationsAdded.push(stationDriverId);
            uniqueStations.push({
              driverId: stationDriverId, // Use extracted driverId
              stationName: (station as any).stationName,
              distance: (station as any).distance,
              travelTime: station.travelTime,
            });
          }
        });

        setNearestUniqueStations(uniqueStations);
        onFetchedTransitDrivers(uniqueStations);
      } catch (error) {
        console.error("Error processing nearest transit stations:", error);
        setNearestUniqueStations([]);
        onFetchedTransitDrivers([]);
      }
    } else {
      setNearestUniqueStations([]);
      onFetchedTransitDrivers([]);
    }
  }, [transitStationsData, onFetchedTransitDrivers, transitDrivers]);

  if (!selectedResult) return null;

  if (isLoading) {
    return (
      <Card
        style={{
          marginTop: 16,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <Flex
          align="center"
          justify="center"
          gap={8}
          style={{ padding: "24px" }}
        >
          <Spin size="small" />
          <Typography.Text style={{ color: COLORS.textColorLight }}>
            Finding nearest transit stations...
          </Typography.Text>
        </Flex>
      </Card>
    );
  }

  if (
    error ||
    !transitStationsData ||
    !transitStationsData.nearestStations ||
    transitStationsData.nearestStations.length === 0
  ) {
    return (
      <Card
        style={{
          marginTop: 16,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <Flex align="center" justify="center" style={{ padding: "24px" }}>
          <Typography.Text style={{ color: COLORS.textColorLight }}>
            No nearby transit stations found
          </Typography.Text>
        </Flex>
      </Card>
    );
  }

  return (
    <Flex
      vertical={!isMobile}
      style={{
        overflowY: "auto",
        margin: "0 16px",
        maxHeight: 500,
        msOverflowY: "scroll",
        scrollbarWidth: "none",
      }}
      gap={8}
    >
      {nearestUniqueStations.map((station, index) => {
        const transitDriver = transitDrivers.find(
          (t) => t._id === station.driverId
        );
        if (!transitDriver) {
          return null;
        }
        return (
          <Flex
            key={`${station.driverId}-${index}`}
            vertical
            style={{
              padding: "12px 16px",
              border: `1px solid ${COLORS.borderColor}`,
              borderRadius: 8,
              width: "100%",
            }}
            gap={16}
            align="start"
            className="station-item"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.bgColorMedium;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {/* Metro Icon */}
            {/* <Flex
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: COLORS.primaryColor,
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 2px 4px rgba(24, 144, 255, 0.2)",
                }}
              >
                <DynamicReactIcon
                  iconName="MdOutlineDirectionsTransit"
                  iconSet="md"
                  size={20}
                  color="white"
                />
              </Flex> */}

            {/* Station Details */}
            {/* Metro Line Name */}
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.SUB_TEXT,
                color: COLORS.primaryColor,
                textTransform: "uppercase",
              }}
              ellipsis={{ tooltip: station.stationName }}
            >
              {station.stationName}
            </Typography.Text>

            {/* Station Name */}
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_3,
                color: COLORS.textColorDark,
                fontWeight: 500,
              }}
              ellipsis={{ tooltip: transitDriver.name }}
            >
              {transitDriver.name}
            </Typography.Text>

            <Flex gap={16}>
              <Flex align="center" gap={2}>
                <DynamicReactIcon
                  iconName={
                    transitDriver.status == PLACE_TIMELINE.POST_LAUNCH
                      ? "BiSolidBoltCircle"
                      : "TbProgressBolt"
                  }
                  iconSet={
                    transitDriver.status == PLACE_TIMELINE.POST_LAUNCH
                      ? "bi"
                      : "tb"
                  }
                  size={18}
                  color={
                    transitDriver.status == PLACE_TIMELINE.POST_LAUNCH
                      ? COLORS.greenIdentifier
                      : COLORS.yellowIdentifier
                  }
                />
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.PARA,
                    color: COLORS.textColorDark,
                    fontWeight: 500,
                  }}
                >
                  {transitDriver.status == PLACE_TIMELINE.POST_LAUNCH
                    ? "Operational"
                    : "Under Construction"}
                </Typography.Text>
              </Flex>

              <Flex align="center" gap={2}>
                <DynamicReactIcon
                  iconName="IoTime"
                  iconSet="io5"
                  size={14}
                  color={COLORS.textColorDark}
                />
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.PARA,
                    color: COLORS.textColorDark,
                    fontWeight: 500,
                  }}
                >
                  {station.travelTime} mins ({station.distance} km)
                </Typography.Text>
              </Flex>
            </Flex>
            <Flex vertical gap={8} style={{ marginTop: 8 }}>
              <Typography.Text style={{ fontSize: FONT_SIZE.SUB_TEXT }}>
                {transitDriver.details?.info?.intro ||
                  "No description available"}
              </Typography.Text>
              <Typography.Text style={{ fontSize: FONT_SIZE.SUB_TEXT }}>
                {transitDriver.details?.info?.timeline ||
                  "Timeline information not available"}
              </Typography.Text>
            </Flex>
          </Flex>
        );
      })}
    </Flex>
  );
};
