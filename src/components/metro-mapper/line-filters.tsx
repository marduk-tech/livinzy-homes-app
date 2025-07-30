import { Button, Flex, Typography } from "antd";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { IDriverPlace } from "../../types/Project";
import DynamicReactIcon from "../common/dynamic-react-icon";

interface LineFiltersProps {
  transitDrivers: IDriverPlace[];
  selectedLines: string[];
  onLineToggle: (lineName: string) => void;
  onClearFilters: () => void;
}

export const LineFilters: React.FC<LineFiltersProps> = ({
  transitDrivers,
  selectedLines,
  onLineToggle,
  onClearFilters,
}) => {
  // unique line names from transit drivers
  const getUniqueLines = () => {
    const lineNames = transitDrivers
      .map((driver) => driver.name)
      .filter((name) => name && name.trim() !== "");

    // remove duplicates using Set
    return Array.from(new Set(lineNames));
  };

  const uniqueLines = getUniqueLines();

  if (uniqueLines.length === 0) {
    return null;
  }

  return (
    <Flex
      vertical
      style={{
        padding: "16px 0",
        borderBottom: `1px solid ${COLORS.borderColor}`,
        marginBottom: 16,
      }}
    >
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.HEADING_4,
            fontWeight: 600,
            color: COLORS.textColorDark,
          }}
        >
          Filter by Metro Lines
        </Typography.Text>

        {selectedLines.length > 0 && (
          <Button
            type="text"
            size="small"
            onClick={onClearFilters}
            style={{
              color: COLORS.primaryColor,
              fontSize: FONT_SIZE.SUB_TEXT,
              padding: "4px 8px",
              height: "auto",
            }}
          >
            Clear All
          </Button>
        )}
      </Flex>

      <Flex wrap="wrap" gap={8}>
        {uniqueLines.map((lineName) => {
          const isSelected = selectedLines.includes(lineName);

          return (
            <Button
              key={lineName}
              size="small"
              onClick={() => onLineToggle(lineName)}
              style={{
                borderRadius: 20,
                height: 32,
                paddingLeft: 12,
                paddingRight: 12,
                backgroundColor: isSelected
                  ? COLORS.primaryColor
                  : COLORS.bgColorMedium,
                borderColor: isSelected
                  ? COLORS.primaryColor
                  : COLORS.borderColor,
                color: isSelected ? "white" : COLORS.textColorDark,
                fontSize: FONT_SIZE.SUB_TEXT,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              icon={
                <DynamicReactIcon
                  iconName="MdOutlineDirectionsTransit"
                  iconSet="md"
                  size={14}
                  color={isSelected ? "white" : COLORS.primaryColor}
                />
              }
            >
              {lineName}
            </Button>
          );
        })}
      </Flex>

      {selectedLines.length > 0 && (
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.SUB_TEXT,
            color: COLORS.textColorLight,
            marginTop: 8,
          }}
        >
          Showing {selectedLines.length} selected line
          {selectedLines.length !== 1 ? "s" : ""}
        </Typography.Text>
      )}
    </Flex>
  );
};
