import { Alert, Flex, List, Typography } from "antd";
import { Brick360DataPoints } from "../../libs/constants";
import { capitalize, getCategoryScore } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import GradientBar from "../common/grading-bar";
import RatingBar from "../common/rating-bar";
import { ScrollableContainer } from "../scrollable-container";
import DynamicReactIcon from "../common/dynamic-react-icon";
import { SnapshotModal } from "./snapshot-modal";
import { useState } from "react";

interface Brick360TabProps {
  lvnzyProject: any;
  scoreParams: any[];
  onDataPointClick: (category: any, item: any) => void;
}

export const Brick360Tab = ({
  lvnzyProject,
  scoreParams,
  onDataPointClick,
}: Brick360TabProps) => {
  const [quickSnapshotDialogOpen, setQuickSnapshotDialogOpen] = useState(false);
  const [quickSnapshotDialogContent, setQuickSnapshotDialogContent] =
    useState<string>("");

  function renderSummaryPoint(pt: string, isPro: boolean) {
    const match = pt.match(/<b>(.*?)<\/b>/);
    const title = match ? match[1] : null;
    return (
      <Flex
        align="center"
        style={{
          padding: "8px",
          backgroundColor: "white",
          borderRadius: 8,
          borderWidth: "1px",
          borderColor: COLORS.borderColor,
          borderStyle: "solid",
        }}
        onClick={() => {
          setQuickSnapshotDialogOpen(true);
          setQuickSnapshotDialogContent(pt);
        }}
        gap={4}
      >
        <DynamicReactIcon
          size={isPro ? 16 : 20}
          iconName={isPro ? "FaRegLaugh" : "PiSmileySadBold"}
          iconSet={isPro ? "fa" : "pi"}
          color={isPro ? COLORS.primaryColor : COLORS.redIdentifier}
        ></DynamicReactIcon>
        <Typography.Text>{title}</Typography.Text>
      </Flex>
    );
  }

  return (
    <ScrollableContainer>
      <Flex vertical>
        {/* Summary point */}
        {lvnzyProject?.score.summary && (
          <Flex vertical style={{ marginBottom: 16 }}>
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_4,
                marginBottom: 4,
                color: COLORS.textColorLight,
              }}
            >
              QUICK SNAPSHOT
            </Typography.Text>
            <Flex
              gap={16}
              style={{
                width: "100%",
                overflowX: "scroll",
                whiteSpace: "nowrap",
                scrollbarWidth: "none",
              }}
            >
              {lvnzyProject?.score.summary.pros.map((p: any) => {
                return renderSummaryPoint(p, true);
              })}
              {lvnzyProject?.score.summary.cons.map((p: any) => {
                return renderSummaryPoint(p, false);
              })}
            </Flex>
          </Flex>
        )}
        {/*  data points */}
        <Flex vertical gap={32} style={{ paddingBottom: 40, paddingTop: 16 }}>
          {scoreParams &&
            scoreParams.map((sc) => {
              return (
                <Flex vertical>
                  <Flex
                    gap={4}
                    align="center"
                    style={{
                      marginBottom: 8,
                      borderBottom: "1px solid",
                      paddingBottom: 8,
                      borderBottomColor: COLORS.borderColor,
                    }}
                  >
                    <Flex
                      style={{
                        width: 24,
                        height: 24,
                        backgroundColor: COLORS.textColorDark,
                        borderRadius: "50%",
                      }}
                      align="center"
                      justify="center"
                    >
                      {sc.icon ? sc.icon : null}
                    </Flex>
                    <Typography.Text
                      style={{
                        margin: 0,
                        marginBottom: 0,
                        fontWeight: 500,
                        fontSize: FONT_SIZE.HEADING_3,
                      }}
                    >
                      {sc.title}
                    </Typography.Text>
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
                            padding: "8px 0",
                            borderBottom:
                              index ==
                              Object.keys((Brick360DataPoints as any)[sc.key])
                                .map((d) => {
                                  return sc.dataPoints.find(
                                    (dp: any) => dp[0] == d
                                  );
                                })
                                .filter((d) => !!d).length -
                                1
                                ? "none"
                                : "1px solid",
                            borderBottomColor: COLORS.borderColor,
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
                              <span>
                                {capitalize(
                                  (Brick360DataPoints as any)[sc.key][
                                    (item as any)[0]
                                  ]["label"]
                                )}{" "}
                              </span>
                              <span style={{ fontSize: FONT_SIZE.HEADING_3 }}>
                                +
                              </span>
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

      <SnapshotModal
        isOpen={quickSnapshotDialogOpen}
        onClose={() => setQuickSnapshotDialogOpen(false)}
        pt={quickSnapshotDialogContent}
      />
    </ScrollableContainer>
  );
};
