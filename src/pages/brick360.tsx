import {
  Button,
  Divider,
  Drawer,
  Flex,
  List,
  Modal,
  Progress,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import { useFetchLvnzyProjectById } from "../hooks/use-lvnzy-project";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { capitalize, rupeeAmountFormat } from "../libs/lvnzy-helper";
import { LivIndexDriversConfig, POP_STAR_DATA_POINTS } from "../libs/constants";
import GradientBar from "../components/common/grading-bar";
import { useDevice } from "../hooks/use-device";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Brick360Chat from "../components/liv/brick360-chat";
import { MapView } from "../components/map-view/map-view";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
const FAKE_TIMER_SECS = 1000;
const { Paragraph, Text } = Typography;

export function Brick360() {
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

  const chatRef = useRef<{ clearChatData: () => void } | null>(null);

  const [scoreParams, setScoreParams] = useState<any[]>([]);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDataPointCategory, setSelectedDataPointCategory] =
    useState<any>();
  const [selectedDataPointSubCategory, setSelectedDataPointSubCategory] =
    useState<any>();

  const [mapDrivers, setMapDrivers] = useState<any[]>([]);
  const [uniqueDriverTypes, setUniqueDriverTypes] = useState<any[]>([]);
  const [selectedDriverTypes, setSelectedDriverTypes] = useState<string[]>([]);

  const [selectedDataPoint, setSelectedDataPoint] = useState<any>();
  const [fakeTimeoutProgress, setFakeTimeoutProgress] = useState<any>(10);
  const [selectedDataPointTitle, setSelectedDataPointTitle] = useState("");

  const [isMapFullScreen, setIsMapFullScreen] = useState(false);

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
    }, FAKE_TIMER_SECS);
  });

  useEffect(() => {
    if (
      lvnzyProject &&
      selectedDataPointSubCategory &&
      selectedDataPointCategory
    ) {
      const catData = (lvnzyProject as any)[selectedDataPointCategory];
      if (catData && (catData.drivers || catData.growthLevers)) {
        const drivers = catData.drivers || catData.growthLevers;
        if (drivers && drivers.length) {
          setMapDrivers(drivers);
          let uniqTypes: string[] = [];
          drivers.forEach((d: any) => {
            if (!uniqTypes.includes(d.driverId.driver)) {
              uniqTypes.push(d.driverId.driver);
            }
          });
          setUniqueDriverTypes(uniqTypes);
        }
      }
    }
  }, [lvnzyProject, selectedDataPointCategory, selectedDataPointSubCategory]);

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
        borderRadius: 16,
        width: "100%",
        margin: "auto",
        maxWidth: 900,
        overflowX: "hidden",
      }}
    >
      <Flex vertical style={{ padding: 16 }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          {lvnzyProject?.originalProjectId.metadata.name}
        </Typography.Title>
        <Flex>
          <Tag style={{ color: COLORS.textColorLight }}>
            Brick<i>360</i>
          </Tag>
        </Flex>

        <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_2, marginTop: 16 }}
        >
          {rupeeAmountFormat(lvnzyProject?.meta.costingDetails.singleUnitCost)}
          &nbsp;(
          {Math.round(
            lvnzyProject?.meta.costingDetails.singleUnitCost /
              lvnzyProject?.meta.costingDetails.singleUnitSize
          )}{" "}
          /sqft )
        </Typography.Text>
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.HEADING_4,
          }}
        >
          {lvnzyProject?.meta.oneLiner}
        </Typography.Text>
        {lvnzyProject?.meta.projectTimelines &&
        lvnzyProject?.meta.projectTimelines.length ? (
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.PARA,
              color: COLORS.textColorLight,
            }}
          >
            Completion: {lvnzyProject?.meta.projectTimelines[0].completionDate}
          </Typography.Text>
        ) : null}
        <Flex
          style={{
            flexWrap: "wrap",
            width: "100%",
            backgroundColor: COLORS.bgColor,
            padding: 8,
            borderRadius: 8,
            border: "1px solid",
            borderColor: COLORS.borderColor,
            marginTop: 4,
          }}
        >
          <Paragraph ellipsis={{ rows: 2, expandable: true }}>
            {lvnzyProject!.meta.costingDetails.configurations}
          </Paragraph>
        </Flex>
      </Flex>
      <Flex
        style={{
          marginBottom: 16,
          borderRadius: isMobile ? 0 : 8,
          marginTop: 8,
          width: "100%",
          flexWrap: "wrap",
          backgroundColor: COLORS.textColorDark,
          padding: "16px",
        }}
        gap={8}
      >
        {dataSets.map((d) => (
          <Tag style={{ fontSize: FONT_SIZE.PARA }}>{d}</Tag>
        ))}
      </Flex>
      <Flex vertical gap={32} style={{ padding: 16 }}>
        {scoreParams &&
          scoreParams.map((sc) => {
            return (
              <Flex vertical>
                <Typography.Title
                  level={4}
                  style={{ margin: 0, marginBottom: 8 }}
                >
                  {sc.title}
                </Typography.Title>

                <List
                  size="large"
                  dataSource={sc.dataPoints.filter(
                    (dp: any[]) => dp[0] !== "_id"
                  )}
                  renderItem={(item) => (
                    <List.Item
                      style={{ padding: "8px 0" }}
                      onClick={() => {
                        setDetailsModalOpen(true);
                        setSelectedDataPointCategory(sc.title.toLowerCase());
                        setSelectedDataPointSubCategory((item as any)[0]);
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
                            width: "65%",
                          }}
                        >
                          {capitalize(
                            (POP_STAR_DATA_POINTS as any)[sc.key.toLowerCase()][
                              (item as any)[0]
                            ]
                          )}
                        </Typography.Text>
                        <Flex
                          style={{
                            width: "35%",
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
        title={null}
        open={isMapFullScreen}
        onCancel={() => {
          setDetailsModalOpen(false);
        }}
        closeIcon={null}
        footer={null}
        width={isMobile ? "100%" : 900}
      >
        <Flex style={{ height: 600 }} vertical gap={8}>
          <Flex>
            {uniqueDriverTypes && (
              <Select
                style={{ width: "80%" }}
                mode="multiple"
                showSearch
                placeholder="Filter place"
                maxTagCount="responsive"
                onChange={(driverTypes: string[]) => {
                  setSelectedDriverTypes(driverTypes);
                }}
                options={uniqueDriverTypes.map((k: string) => {
                  return {
                    value: k,
                    label: (LivIndexDriversConfig as any)[k]
                      ? capitalize((LivIndexDriversConfig as any)[k].label)
                      : "",
                  };
                })}
              />
            )}

            <Flex
              onClick={() => {
                setIsMapFullScreen(false);
                setDetailsModalOpen(true);
              }}
              style={{ marginLeft: "auto" }}
            >
              <DynamicReactIcon
                iconName="IoMdCloseCircle"
                iconSet="io"
              ></DynamicReactIcon>
            </Flex>
          </Flex>
          <MapView
            projectId={lvnzyProject?.originalProjectId._id}
            projects={[]}
            drivers={mapDrivers
              .filter(
                (d) =>
                  !selectedDriverTypes?.length ||
                  selectedDriverTypes?.includes(d.driverId.driver)
              )
              .map((d) => d.driverId._id)}
          ></MapView>
        </Flex>
      </Modal>
      <Drawer
        title={selectedDataPointTitle}
        placement="bottom"
        rootStyle={{
          maxWidth: 900,
          marginLeft: isMobile ? 0 : "calc(50% - 450px)",
        }}
        extra={
          <Space>
            <Button
              onClick={() => {
                setDetailsModalOpen(false);
                if (!isMapFullScreen) {
                  chatRef.current?.clearChatData();
                  setMapDrivers([]);
                }
              }}
            >
              Close
            </Button>
          </Space>
        }
        closable={false}
        height={Math.min(700, window.innerHeight * 0.8)}
        onClose={() => {
          setDetailsModalOpen(false);
          if (!isMapFullScreen) {
            chatRef.current?.clearChatData();
            setMapDrivers([]);
          }
        }}
        open={detailsModalOpen}
      >
        <Flex
          vertical
          style={{
            position: "relative",
            overflowY: "scroll",
            paddingBottom: 64,
          }}
        >
          {selectedDataPointCategory == "developer" && (
            <Typography.Title level={4}>
              {lvnzyProject?.originalProjectId.metadata.developerId.name}
            </Typography.Title>
          )}
          <Markdown remarkPlugins={[remarkGfm]} className="liviq-content">
            {selectedDataPoint ? selectedDataPoint.reasoning : ""}
          </Markdown>

          {mapDrivers && mapDrivers.length ? (
            <Flex vertical>
              <Flex>
                <Button
                  size="small"
                  icon={
                    <DynamicReactIcon
                      iconName="FaExpand"
                      color="primary"
                      iconSet="fa"
                      size={16}
                    />
                  }
                  style={{
                    marginLeft: "auto",
                    marginBottom: 8,
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: FONT_SIZE.SUB_TEXT,
                    height: 28,
                  }}
                  onClick={() => {
                    setDetailsModalOpen(false);
                    setIsMapFullScreen(true);
                  }}
                >
                  Expand
                </Button>
              </Flex>
              <Flex
                style={{
                  height: isMobile ? 200 : 300,
                  width: "100%",
                  borderRadius: 16,
                }}
              >
                <MapView
                  projectId={lvnzyProject?.originalProjectId._id}
                  projects={[]}
                  drivers={mapDrivers.map((d) => d.driverId._id)}
                ></MapView>
              </Flex>
            </Flex>
          ) : null}
          <Divider></Divider>

          <Flex style={{ width: "100%" }}>
            <Brick360Chat
              ref={chatRef}
              lvnzyProjectId={lvnzyProjectId!}
              dataPointCategory={selectedDataPointCategory}
              dataPoint={selectedDataPointTitle}
            ></Brick360Chat>
          </Flex>
        </Flex>
      </Drawer>
    </Flex>
  );
}
