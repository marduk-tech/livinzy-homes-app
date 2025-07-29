import { Card, Flex, Spin, Typography } from "antd";
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
    <Card
      style={{
        marginTop: 16,
        borderRadius: 8,
      }}
      title={
        <Flex align="center" gap={8}>
          <DynamicReactIcon
            iconName="MdOutlineDirectionsTransit"
            iconSet="md"
            size={16}
            color={COLORS.textColorDark}
          />
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_4,
              color: COLORS.textColorDark,
              fontWeight: 600,
              margin: 0,
            }}
          >
            Nearest Transit Stations
          </Typography.Text>
        </Flex>
      }
      bodyStyle={{ padding: 0 }}
    >
      {/* Transit Stations List */}
      <Flex
        vertical
        style={{
          maxHeight: 400,
          overflowY: "auto",
        }}
      >
        {[...transitStationsData.nearestStations]
          .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
          .map((station, index) => (
            <Flex
              key={station.stationId}
              style={{
                padding: "16px 20px",
                borderBottom:
                  index < transitStationsData.nearestStations.length - 1
                    ? `1px solid ${COLORS.borderColor}`
                    : "none",
                transition: "background-color 0.2s ease",
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
              <Flex
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
              </Flex>

              {/* Station Details */}
              <Flex vertical style={{ flex: 1, minWidth: 0 }}>
                {/* Metro Line Name */}
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.SUB_TEXT,
                    color: COLORS.primaryColor,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                  ellipsis={{ tooltip: station.metroLineName }}
                >
                  {station.metroLineName}
                </Typography.Text>

                {/* Station Name */}
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_4,
                    fontWeight: 600,
                    color: COLORS.textColorDark,
                    marginBottom: 8,
                  }}
                  ellipsis={{ tooltip: station.stationName }}
                >
                  {station.stationName}
                </Typography.Text>

                <Flex gap={16}>
                  <Flex align="center" gap={6}>
                    <DynamicReactIcon
                      iconName="IoLocation"
                      iconSet="io5"
                      size={14}
                      color={COLORS.textColorLight}
                    />
                    <Typography.Text
                      style={{
                        fontSize: FONT_SIZE.SUB_TEXT,
                        color: COLORS.textColorLight,
                        fontWeight: 500,
                      }}
                    >
                      {station.distance} km
                    </Typography.Text>
                  </Flex>

                  <Flex align="center" gap={6}>
                    <DynamicReactIcon
                      iconName="IoTime"
                      iconSet="io5"
                      size={14}
                      color={COLORS.textColorLight}
                    />
                    <Typography.Text
                      style={{
                        fontSize: FONT_SIZE.SUB_TEXT,
                        color: COLORS.textColorLight,
                        fontWeight: 500,
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
    </Card>
  );
};
