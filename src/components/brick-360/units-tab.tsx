import { Flex, Image, Tag, Typography } from "antd";
import { rupeeAmountFormat } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { ScrollableContainer } from "../scrollable-container";

interface UnitsTabProps {
  lvnzyProject: any;
}

const getTotalFloors = (lvnzyProject: any) => {
  const towers = lvnzyProject?.meta?.projectConfigurations?.towers;
  if (!towers || !Array.isArray(towers) || towers.length === 0) {
    return "";
  }

  const floorCounts = towers
    .map((t: any) => t.totalFloors)
    .filter((floors: any) => typeof floors === "number");
  if (floorCounts.length === 0) {
    return "";
  }

  const minFloors = Math.min(...floorCounts);
  const maxFloors = Math.max(...floorCounts);

  if (minFloors == maxFloors) {
    return `${minFloors}`;
  } else {
    return `${minFloors} -
                ${maxFloors}`;
  }
};

export const UnitsTab = ({ lvnzyProject }: UnitsTabProps) => {
  return (
    <ScrollableContainer>
      <Flex
        vertical
        style={{
          margin: "16px 8px",
          marginBottom: 8,
        }}
      >
        <Flex vertical style={{ marginBottom: 8 }}>
          {/* Sqft & Configs */}
          <Typography.Text
            style={{
              borderRadius: 8,
              color: "white",
            }}
          >
            {lvnzyProject?.meta.projectConfigurations && (
              <Flex>
                {lvnzyProject?.meta.projectConfigurations.unitsBreakup && (
                  <Tag> {getTotalFloors(lvnzyProject)} Floors</Tag>
                )}
                {lvnzyProject?.meta.projectConfigurations.unitsBreakup && (
                  <Tag>{lvnzyProject?.property.layout.totalUnits} Units</Tag>
                )}
                {lvnzyProject?.property.layout.totalLandArea && (
                  <Tag>
                    {Math.round(
                      lvnzyProject?.property.layout.totalLandArea / 4046.8564
                    )}{" "}
                    Acre
                  </Tag>
                )}
              </Flex>
            )}
            <Flex
              vertical
              style={{
                marginTop: 16,
                maxHeight: 400,
                overflowY: "scroll",
                scrollbarWidth: "none",
              }}
              gap={16}
            >
              {lvnzyProject!.meta.costingDetails.configurations.map(
                (c: any, index: number) => {
                  return (
                    <Flex
                      key={`config-${index}`}
                      vertical
                      style={{
                        borderLeft: "1px solid",
                        paddingLeft: 8,
                        borderLeftColor: COLORS.borderColorMedium,
                        marginTop: 20,
                      }}
                    >
                      <Typography.Text
                        style={{ fontSize: FONT_SIZE.HEADING_4 }}
                      >
                        ₹{rupeeAmountFormat(c.cost)}
                      </Typography.Text>
                      <Typography.Text
                        style={{ fontSize: FONT_SIZE.HEADING_3 }}
                      >
                        {c.config}
                      </Typography.Text>
                      {c.floorplans && c.floorplans.length > 0 && (
                        <Flex
                          style={{
                            overflowX: "auto",
                            marginTop: 8,
                          }}
                          gap={8}
                        >
                          {c.floorplans.map((fp: any, i: number) => {
                            console.log(fp);

                            return (
                              <Image
                                key={`fp-${i}`}
                                src={fp}
                                style={{
                                  height: 100,
                                }}
                              />
                            );
                          })}
                        </Flex>
                      )}
                    </Flex>
                  );
                }
              )}
            </Flex>
          </Typography.Text>
        </Flex>
      </Flex>
    </ScrollableContainer>
  );
};
