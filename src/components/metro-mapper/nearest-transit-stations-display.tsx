import { Flex, Spin, Typography } from "antd";
import { useNearestTransitStations } from "../../hooks/use-nearest-transit-stations";
import { SearchResult } from "../../hooks/use-place-search";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import DynamicReactIcon from "../common/dynamic-react-icon";

interface NearestTransitStationsDisplayProps {
  selectedResult?: SearchResult | null;
}

export const NearestTransitStationsDisplay: React.FC<
  NearestTransitStationsDisplayProps
> = ({ selectedResult }) => {
  const {
    data: transitStationsData,
    isLoading,
    error,
  } = useNearestTransitStations(
    selectedResult?.coordinates[0],
    selectedResult?.coordinates[1]
  );

  if (!selectedResult) return null;

  if (isLoading) {
    return (
      <Flex
        style={{
          padding: "16px",
          borderTop: `1px solid ${COLORS.borderColor}`,
          backgroundColor: COLORS.bgColorMedium,
          flex: 1,
        }}
        align="center"
        justify="center"
        gap={8}
      >
        <Spin size="small" />
        <Typography.Text style={{ color: COLORS.textColorLight }}>
          Finding nearest transit stations...
        </Typography.Text>
      </Flex>
    );
  }

  if (
    error ||
    !transitStationsData ||
    transitStationsData.nearestStations.length === 0
  ) {
    return (
      <Flex
        style={{
          padding: "16px",
          borderTop: `1px solid ${COLORS.borderColor}`,
          backgroundColor: COLORS.bgColorMedium,
          flex: 1,
        }}
        align="center"
        justify="center"
      >
        <Typography.Text style={{ color: COLORS.textColorLight }}>
          No nearby transit stations found
        </Typography.Text>
      </Flex>
    );
  }

  return (
    <Flex
      vertical
      style={{
        borderTop: `1px solid ${COLORS.borderColor}`,
        backgroundColor: "white",
        flex: 1,
        minHeight: 0,
      }}
    >
      <Flex
        style={{
          padding: "12px 16px",
          backgroundColor: COLORS.bgColorMedium,
          borderBottom: `1px solid ${COLORS.borderColor}`,
        }}
        align="center"
        gap={8}
      >
        <DynamicReactIcon
          iconName="MdOutlineDirectionsTransit"
          iconSet="md"
          size={16}
          color={COLORS.textColorDark}
        />
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.SUB_TEXT,
            color: COLORS.textColorDark,
            fontWeight: 500,
          }}
        >
          Nearest Transit Stations
        </Typography.Text>
      </Flex>

      {/* Transit Stations List */}
      <Flex
        vertical
        style={{
          flex: 1,
          maxHeight: "calc(95vh - 200px)",
          overflowY: "auto",
          minHeight: 0,
        }}
      >
        {[...transitStationsData.nearestStations]
          .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
          .map((station) => (
            <Flex
              key={station.stationId}
              style={{
                padding: "12px 16px",
                borderBottom: `1px solid ${COLORS.borderColor}`,
              }}
              gap={12}
              align="start"
            >
              {/* Metro Icon */}
              <Flex
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: "#1890ff",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <DynamicReactIcon
                  iconName="MdOutlineDirectionsTransit"
                  iconSet="md"
                  size={16}
                  color="white"
                />
              </Flex>

              {/* Station Details */}
              <Flex vertical style={{ flex: 1, minWidth: 0 }}>
                {/* Metro Line Name */}
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.SUB_TEXT,
                    color: "#1890ff",
                    fontWeight: 600,
                    marginBottom: 2,
                  }}
                  ellipsis={{ tooltip: station.metroLineName }}
                >
                  {station.metroLineName}
                </Typography.Text>

                {/* Station Name */}
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_4,
                    fontWeight: 500,
                    color: COLORS.textColorDark,
                    marginBottom: 4,
                  }}
                  ellipsis={{ tooltip: station.stationName }}
                >
                  {station.stationName}
                </Typography.Text>

                <Flex gap={12}>
                  <Flex align="center" gap={4}>
                    <DynamicReactIcon
                      iconName="IoLocation"
                      iconSet="io5"
                      size={12}
                      color={COLORS.textColorLight}
                    />
                    <Typography.Text
                      style={{
                        fontSize: FONT_SIZE.SUB_TEXT,
                        color: COLORS.textColorLight,
                      }}
                    >
                      {station.distance} km
                    </Typography.Text>
                  </Flex>

                  <Flex align="center" gap={4}>
                    <DynamicReactIcon
                      iconName="IoTime"
                      iconSet="io5"
                      size={12}
                      color={COLORS.textColorLight}
                    />
                    <Typography.Text
                      style={{
                        fontSize: FONT_SIZE.SUB_TEXT,
                        color: COLORS.textColorLight,
                      }}
                    >
                      {station.travelTime} mins
                    </Typography.Text>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          ))}
      </Flex>
    </Flex>
  );
};
