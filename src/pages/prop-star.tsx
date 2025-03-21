import { Flex, List, Modal, Progress, Tag, Typography } from "antd";
import { useFetchLvnzyProjectById } from "../hooks/use-lvnzy-project";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { capitalize, rupeeAmountFormat } from "../libs/lvnzy-helper";
import { POP_STAR_DATA_POINTS } from "../libs/constants";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import GradientBar from "../components/common/grading-bar";
import { useDevice } from "../hooks/use-device";

export function PropStar() {
  const { lvnzyProjectId } = useParams();

  const { isMobile } = useDevice();

  let { data: lvnzyProject, isLoading: lvnzyProjectIsLoading } =
    useFetchLvnzyProjectById(lvnzyProjectId!);

  const dataSets = [
    "RERA",
    "Open Street",
    "BBMP",
    "BIAPPA",
    "Google Maps",
    "Open City",
    "Online Listings",
  ];

  const [scoreParams, setScoreParams] = useState<any[]>([]);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>();
  const [fakeTimeoutProgress, setFakeTimeoutProgress] = useState<any>(10);
  const [selectedDataPointTitle, setSelectedDataPointTitle] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setFakeTimeoutProgress((prevFakeTimeoutProgress: any) => {
        if (prevFakeTimeoutProgress >= 130) {
          // Stop at 10
          clearInterval(interval);
          return prevFakeTimeoutProgress;
        }
        return prevFakeTimeoutProgress + 10;
      });
    }, 3000);
  });

  useEffect(() => {
    if (lvnzyProject) {
      const params = [];
      params.push({
        title: "Property",
        key: "property",
        dataPoints: Object.entries(lvnzyProject.score.property),
      });
      params.push({
        title: "Developer",
        key: "developer",
        dataPoints: Object.entries(lvnzyProject.score.developer),
      });
      params.push({
        title: "Neighborhood",
        key: "neighborhood",
        dataPoints: Object.entries(lvnzyProject.score.neighborhood),
      });
      params.push({
        title: "Connectivity",
        key: "connectivity",
        dataPoints: Object.entries(lvnzyProject.score.connectivity),
      });
      params.push({
        title: "Investment",
        key: "investment",
        dataPoints: Object.entries(lvnzyProject.score.investment),
      });
      setScoreParams(params);
    }
  }, [lvnzyProject]);

  const progressWidth = isMobile ? 300 : 500;

  if (lvnzyProjectIsLoading) {
    return "";
  }

  if (fakeTimeoutProgress < 130) {
    return (
      <Flex
        vertical
        style={{
          width: progressWidth,
          position: "fixed",
          top: "20%",
          left: `calc(50% - ${progressWidth / 2}px)`,
        }}
      >
        <Typography.Title
          style={{ margin: 0, marginBottom: 32, textAlign: "center" }}
        >
          {lvnzyProject?.originalProjectId.metadata.name}
        </Typography.Title>
        <Progress percent={fakeTimeoutProgress} />
        <Flex vertical>
          <Typography.Text style={{ textAlign: "center" }}>
            {fakeTimeoutProgress < 20
              ? "Starting up"
              : fakeTimeoutProgress < 80
              ? "Collecting Data"
              : "Finishing up"}
          </Typography.Text>

          <Flex
            vertical
            style={{
              border: "1px solid",
              borderColor: COLORS.borderColor,
              backgroundColor: COLORS.bgColor,
              padding: 16,
              borderRadius: 16,
              marginTop: 32,
            }}
          >
            <Typography.Title
              level={4}
              style={{ textAlign: "center", margin: 0 }}
            >
              Data Sources
            </Typography.Title>
            <Flex
              justify="center"
              style={{ flexWrap: "wrap", marginTop: 32 }}
              gap={12}
            >
              {dataSets.map((d) => (
                <Flex>
                  <Tag style={{ fontSize: FONT_SIZE.HEADING_4 }}>{d}</Tag>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex
      vertical
      style={{
        padding: 16,
        borderRadius: 16,
        height: "90vh",
        width: "100%",
        margin: "auto",
        maxWidth: 700,
        scrollbarWidth: "none",
        overflowY: "auto",
      }}
    >
      <Typography.Title level={2} style={{ margin: 0 }}>
        {lvnzyProject?.originalProjectId.metadata.name}
      </Typography.Title>
      <Typography.Text
        style={{
          fontSize: FONT_SIZE.HEADING_4,
          margin: "8px 0",
          color: COLORS.textColorLight,
        }}
      >
        {lvnzyProject?.meta.oneLiner}
      </Typography.Text>
      <Typography.Text
        style={{ fontSize: FONT_SIZE.HEADING_2, margin: "8px 0" }}
      >
        {rupeeAmountFormat(lvnzyProject?.meta.costingDetails.minimumUnitCost)}
        &nbsp;(
        {Math.round(
          lvnzyProject?.meta.costingDetails.minimumUnitCost /
            lvnzyProject?.meta.costingDetails.singleUnitSize
        )}{" "}
        /sqft )
      </Typography.Text>
      <Flex
        style={{
          marginBottom: 24,
          marginTop: 24,
          width: "100%",
          flexWrap: "wrap",
        }}
        gap={4}
      >
        {dataSets.map((d) => (
          <Tag>{d}</Tag>
        ))}
      </Flex>
      <Flex vertical style={{ height: 600, overflowY: "scroll" }}>
        {scoreParams &&
          scoreParams.map((sc) => {
            return (
              <Flex vertical>
                <Typography.Title level={4}>{sc.title}</Typography.Title>

                <List
                  size="large"
                  bordered
                  dataSource={sc.dataPoints.filter(
                    (dp: any[]) => dp[0] !== "_id"
                  )}
                  renderItem={(item) => (
                    <List.Item
                      onClick={() => {
                        setDetailsModalOpen(true);
                        setSelectedDataPoint((item as any)[1]);
                        setSelectedDataPointTitle(
                          `${sc.title} > ${
                            (POP_STAR_DATA_POINTS as any)[sc.key.toLowerCase()][
                              (item as any)[0]
                            ]
                          }`
                        );
                      }}
                    >
                      <Flex align="center" style={{ width: "100%" }}>
                        <Typography.Text
                          style={{
                            fontSize: FONT_SIZE.HEADING_3,
                            width: "50%",
                          }}
                        >
                          {capitalize(
                            (POP_STAR_DATA_POINTS as any)[sc.key.toLowerCase()][
                              (item as any)[0]
                            ]
                          )}
                        </Typography.Text>
                        {/* <Rate
                          style={{ marginLeft: "auto", fontSize: 20 }}
                          disabled
                          allowHalf
                          defaultValue={
                            Math.round(
                              ((item as any)[1].rating / 100) * 5 * 2
                            ) / 2
                          }
                        /> */}
                        <Flex
                          style={{
                            width: "50%",
                            height: 24,
                            marginLeft: "auto",
                          }}
                        >
                          <GradientBar
                            value={(item as any)[1].rating}
                          ></GradientBar>
                        </Flex>
                      </Flex>
                    </List.Item>
                  )}
                />
              </Flex>
            );
          })}
      </Flex>
      <Modal
        title={selectedDataPointTitle}
        open={detailsModalOpen}
        onCancel={() => {
          setDetailsModalOpen(false);
        }}
        footer={null}
      >
        <Markdown remarkPlugins={[remarkGfm]} className="liviq-content">
          {selectedDataPoint ? selectedDataPoint.reasoning : ""}
        </Markdown>
      </Modal>
    </Flex>
  );
}
