import { Alert, Flex, List, Tag, Typography } from "antd";
import {
  BRICK360_CATEGORY,
  Brick360CategoryInfo,
  Brick360DataPoints,
} from "../../libs/constants";
import { capitalize, getCategoryScore } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import DynamicReactIcon from "../common/dynamic-react-icon";
import GradientBar from "../common/grading-bar";
import RatingBar from "../common/rating-bar";
import { ScrollableContainer } from "../scrollable-container";

interface Brick360TabProps {
  lvnzyProject: any;
  scoreParams: any[];
  onSnapshotClick: () => void;
  onDataPointClick: (category: any, item: any) => void;
}

export const Brick360Tab = ({
  lvnzyProject,
  scoreParams,
  onSnapshotClick,
  onDataPointClick,
}: Brick360TabProps) => {
  return (
    <ScrollableContainer>
      <Flex vertical>
        {lvnzyProject?.score.summary && (
          <Flex
            style={{
              borderRadius: 8,
              cursor: "pointer",
              padding: "8px 0",
              backgroundColor: "white",
            }}
            onClick={onSnapshotClick}
          >
            <Flex
              style={{
                width: "100%",
                marginLeft: 0,
                marginTop: 8,
                marginBottom: 8,
              }}
            >
              <Flex align="center" gap={4}>
                <DynamicReactIcon
                  iconName="IoMdListBox"
                  iconSet="io"
                  size={22}
                  color={COLORS.textColorDark}
                ></DynamicReactIcon>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_4,
                  }}
                >
                  360 Snapshot
                </Typography.Text>
              </Flex>
              <Flex
                style={{
                  height: 24,
                  marginLeft: "auto",
                }}
              >
                {lvnzyProject?.score.summary.pros.length ? (
                  <Tag
                    color={COLORS.greenIdentifier}
                    style={{
                      fontSize: FONT_SIZE.SUB_TEXT,
                      marginRight: 0,
                    }}
                  >
                    {lvnzyProject?.score.summary.pros.length} pros
                  </Tag>
                ) : null}
                {lvnzyProject?.score.summary.cons.length ? (
                  <Tag
                    color={COLORS.redIdentifier}
                    style={{
                      fontSize: FONT_SIZE.SUB_TEXT,
                      marginLeft: 4,
                      marginRight: 0,
                    }}
                  >
                    {lvnzyProject?.score.summary.cons.length} cons
                  </Tag>
                ) : null}
              </Flex>
            </Flex>
          </Flex>
        )}
        {/*  data points */}
        <Flex vertical gap={32} style={{ padding: "16px 0" }}>
          {scoreParams &&
            scoreParams.map((sc) => {
              return (
                <Flex vertical>
                  <Flex gap={8} align="center" style={{ marginBottom: 8 }}>
                    {sc.icon ? sc.icon : null}
                    <Typography.Title
                      level={4}
                      style={{ margin: 0, marginBottom: 0 }}
                    >
                      {sc.title}
                    </Typography.Title>
                    {lvnzyProject!.score[sc.key] ? (
                      <GradientBar
                        value={getCategoryScore(lvnzyProject!.score[sc.key])}
                        showBadgeOnly={true}
                      ></GradientBar>
                    ) : null}
                  </Flex>

                  {sc.dataPoints &&
                  sc.dataPoints.filter(
                    (dp: any[]) => !["_id", "openAreaRating"].includes(dp[0])
                  ).length ? (
                    <List
                      size="large"
                      style={{ borderRadius: 16, cursor: "pointer" }}
                      dataSource={Object.keys(
                        (Brick360DataPoints as any)[sc.key]
                      )
                        .map((d) => {
                          return sc.dataPoints.find((dp: any) => dp[0] == d);
                        })
                        .filter((d) => !!d)}
                      renderItem={(item, index) => (
                        <List.Item
                          key={`p-${index}`}
                          style={{
                            padding: "8px",
                            borderBottom: "1px solid",
                            borderBottomColor: COLORS.borderColor,
                            backgroundColor: "white",
                            borderTopLeftRadius: index == 0 ? 8 : 0,
                            borderTopRightRadius: index == 0 ? 8 : 0,
                            borderBottomLeftRadius:
                              index ==
                              Object.keys((Brick360DataPoints as any)[sc.key])
                                .length -
                                1
                                ? 8
                                : 0,
                            borderBottomRightRadius:
                              index ==
                              Object.keys((Brick360DataPoints as any)[sc.key])
                                .length -
                                1
                                ? 8
                                : 0,
                          }}
                          onClick={() => onDataPointClick(sc, item)}
                        >
                          <Flex align="center" style={{ width: "100%" }}>
                            <Typography.Text
                              style={{
                                fontSize: FONT_SIZE.HEADING_4,
                                width: "60%",
                                color:
                                  (item as any)[1].rating > 0
                                    ? COLORS.textColorDark
                                    : COLORS.textColorLight,
                              }}
                            >
                              {capitalize(
                                (Brick360DataPoints as any)[sc.key][
                                  (item as any)[0]
                                ]
                              )}
                            </Typography.Text>
                            <Flex
                              style={{
                                width: "40%",
                                height: 24,
                                justifyContent: "flex-end",
                              }}
                            >
                              <RatingBar
                                value={(item as any)[1].rating}
                              ></RatingBar>
                            </Flex>
                          </Flex>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Alert
                      message="There are no other projects by the developer in the state of Karnataka yet. Please make sure to check track record in other states.   "
                      type="warning"
                    />
                  )}
                </Flex>
              );
            })}
        </Flex>
      </Flex>
    </ScrollableContainer>
  );
};
