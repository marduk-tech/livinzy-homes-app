import { Flex, Image, Typography } from "antd";
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
    return null;
  }

  const minFloors = Math.min(...floorCounts);
  const maxFloors = Math.max(...floorCounts);

  let totalFloors = "";
  if (minFloors == maxFloors) {
    totalFloors = `${minFloors}`;
  } else {
    totalFloors = `${minFloors} - ${maxFloors}`;
  }
  return (
    <Typography.Text
      style={{
        fontSize: FONT_SIZE.HEADING_4,
        marginLeft: 4,
        color: COLORS.textColorMedium,
      }}
    >
      {totalFloors} Floors
    </Typography.Text>
  );
};

const getMinMaxSize = (configs: any[]) => {
  let sizes: number[] = [];
  configs.forEach((c: any) => {
    const split = c.config.split("-");
    if (split.length > 1) {
      sizes.push(parseInt(split[1]));
    }
  });
  if (sizes.length) {
    sizes = sizes.sort((a, b) => a - b);
    return (
      <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_2 }}>
        {sizes[0] == sizes[sizes.length - 1]
          ? sizes[0]
          : `${sizes[0]} - ${sizes[sizes.length - 1]}`}{" "}
        sq.ft
      </Typography.Text>
    );
  }
  return null;
};

export const UnitsTab = ({ lvnzyProject }: UnitsTabProps) => {
  return (
    <ScrollableContainer>
      <Flex
        vertical
        style={{
          margin: "8px",
          marginBottom: 8,
        }}
      >
        <Flex vertical style={{ marginBottom: 8, paddingBottom: 80 }}>
          {/* Sqft & Configs */}

          <Flex align="center" gap={8}>
            {lvnzyProject?.meta.costingDetails && (
              <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_2 }}>
                ₹
                {rupeeAmountFormat(
                  `${Math.round(
                    lvnzyProject?.meta.costingDetails.minimumUnitCost /
                      lvnzyProject?.meta.costingDetails.minimumUnitSize
                  )}`
                )}{" "}
                per sq.ft ·
              </Typography.Text>
            )}{" "}
            {getMinMaxSize(lvnzyProject?.meta.costingDetails.configurations)}
          </Flex>
          <Flex>
            {lvnzyProject?.property.layout.totalUnits && (
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                  marginRight: 4,
                  color: COLORS.textColorMedium,
                }}
              >
                {lvnzyProject?.property.layout.totalUnits} Units (
                {Math.round(
                  lvnzyProject?.property.layout.totalLandArea / 4046.8564
                )}{" "}
                Acre)
              </Typography.Text>
            )}{" "}
            ·
            {lvnzyProject?.meta.projectConfigurations &&
            lvnzyProject!.meta.projectConfigurations.unitsBreakup
              ? getTotalFloors(lvnzyProject)
              : null}
          </Flex>

          <Flex vertical gap={8}>
            {lvnzyProject!.meta.costingDetails.configurations.map(
              (c: any, index: number) => {
                return (
                  <Flex
                    key={`config-${index}`}
                    vertical
                    style={{
                      marginTop: 16,
                      backgroundColor: COLORS.bgColor,
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid",
                      borderColor: COLORS.borderColor,
                    }}
                  >
                    <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_3 }}>
                      {c.config}
                    </Typography.Text>
                    <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_2 }}>
                      ₹{rupeeAmountFormat(c.cost)}
                    </Typography.Text>
                    {c.floorplans && c.floorplans.length > 0 && (
                      <Flex
                        style={{
                          overflowX: "auto",
                          marginTop: 16,
                          scrollbarWidth: "none",
                        }}
                        gap={32}
                      >
                        {c.floorplans.map((fp: any, i: number) => {
                          console.log(fp);

                          return (
                            <Image
                              key={`fp-${i}`}
                              src={fp}
                              style={{
                                height: 100,
                                width: "auto",
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
        </Flex>
      </Flex>
    </ScrollableContainer>
  );
};
