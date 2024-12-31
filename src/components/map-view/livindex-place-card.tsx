import { Flex, Tag, Tooltip, Typography } from "antd";
import { IDriverPlace } from "../../types/Project";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { LivIndexDriversConfig, PLACE_TIMELINE } from "../../libs/constants";
import DynamicReactIcon from "../common/dynamic-react-icon";
const { Paragraph } = Typography;

interface LivIndexPlaceCardProps {
  place: IDriverPlace;
}
export const LivIndexPlaceCard: React.FC<LivIndexPlaceCardProps> = ({
  place,
}) => {
  const isUnderConstruction = ![
    PLACE_TIMELINE.LAUNCHED,
    PLACE_TIMELINE.POST_LAUNCH,
  ].includes(place.status as any);

  const icon = (LivIndexDriversConfig as any)[place!.driver].icon;

  return (
    <Tooltip
      style={{ width: 300 }}
      title={
        <Flex vertical style={{ padding: 2 }}>
          <Flex gap={4} style={{ marginTop: 4 }} align="flex-start">
            <Typography.Text
              style={{
                color: "white",
                fontSize: FONT_SIZE.HEADING_3,
                lineHeight: "100%",
              }}
            >
              {place.name}
            </Typography.Text>
          </Flex>
          <Flex style={{ marginTop: 8 }}>
            {place.distance && (
              <Tag
                style={{
                  fontSize: FONT_SIZE.SUB_TEXT,
                }}
              >
                {Math.round(place.distance)} kms away
              </Tag>
            )}
            {isUnderConstruction ? (
              <Tag
                color={COLORS.yellowIdentifier}
                style={{
                  fontSize: FONT_SIZE.SUB_TEXT,
                }}
              >
                Under Construction
              </Tag>
            ) : null}
          </Flex>

          {place.details && place.details.oneLiner ? (
            <Paragraph
              style={{
                color: "white",
                height: 130,
                overflowY: "scroll",
                marginTop: 8,
              }}
              ellipsis={{
                rows: 4,
                expandable: true,
              }}
            >
              {place.details.oneLiner}
            </Paragraph>
          ) : null}
        </Flex>
      }
      trigger="click"
    >
      <Flex
        style={{
          backgroundColor: "white",
          borderRadius: "50%",
          padding: 8,
          borderWidth: "2px",
          borderColor: isUnderConstruction
            ? COLORS.borderColorDark
            : COLORS.borderColor,
          borderStyle: isUnderConstruction ? "dotted" : "solid",
        }}
      >
        <DynamicReactIcon
          iconName={icon.name}
          iconSet={icon.set}
          size={18}
          color={"black"}
        ></DynamicReactIcon>
      </Flex>
    </Tooltip>
  );
};
