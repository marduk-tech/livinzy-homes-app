import {
  Alert,
  Button,
  Divider,
  Drawer,
  Flex,
  List,
  Modal,
  Progress,
  Space,
  Tag,
  Typography,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
import GradientBar from "../components/common/grading-bar";
import { Loader } from "../components/common/loader";
import RatingBar from "../components/common/rating-bar";
import Brick360Chat from "../components/liv/brick360-chat";
import MapViewV2 from "../components/map-view/map-view-v2";
import ProjectGallery from "../components/project-gallery";
import { useDevice } from "../hooks/use-device";
import { useFetchLvnzyProjectById } from "../hooks/use-lvnzy-project";
import {
  BRICK360_CATEGORY,
  Brick360CategoryInfo,
  Brick360DataPoints,
} from "../libs/constants";
import {
  capitalize,
  getCategoryScore,
  rupeeAmountFormat,
} from "../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
const FAKE_TIMER_SECS = 1000;
const { Paragraph, Text } = Typography;

export function Brick360() {
  const { lvnzyProjectId } = useParams();

  const { isMobile } = useDevice();

  const { data: lvnzyProject, isLoading: lvnzyProjectIsLoading } =
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

  const [selectedDriverTypes, setSelectedDriverTypes] = useState<any>();

  const [mapDrivers, setMapDrivers] = useState<any[]>([]);

  const [selectedDataPoint, setSelectedDataPoint] = useState<any>();
  const [fakeTimeoutProgress, setFakeTimeoutProgress] = useState<any>(10);
  const [selectedDataPointTitle, setSelectedDataPointTitle] = useState("");

  const [isMapFullScreen, setIsMapFullScreen] = useState(false);

  // Renders the drawer close button
  const renderDrawerCloseBtn = () => {
    return (
      <Flex
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 99999,
        }}
        onClick={() => {
          setDetailsModalOpen(false);
          if (!isMapFullScreen) {
            chatRef.current?.clearChatData();
            setMapDrivers([]);
          }
        }}
      >
        <DynamicReactIcon
          iconName="IoCloseCircle"
          iconSet="io5"
          size={32}
        ></DynamicReactIcon>
      </Flex>
    );
  };

  // Get data category icon
  const getDataCategoryIcon = (iconName: string, iconSet: any) => {
    return (
      <DynamicReactIcon
        iconName={iconName}
        iconSet={iconSet}
        color={COLORS.textColorDark}
      ></DynamicReactIcon>
    );
  };
  // Fake timeout and progress
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

  // Setting map drivers based on selected data point
  useEffect(() => {
    if (
      lvnzyProject &&
      selectedDataPointSubCategory &&
      selectedDataPointCategory
    ) {
      let drivers;
      if (selectedDataPointCategory == "areaConnectivity") {
        drivers = [
          ...(lvnzyProject as any)["neighborhood"].drivers,
          ...(lvnzyProject as any)["connectivity"].drivers,
        ];
        if (selectedDataPointSubCategory == "schoolsOffices") {
          setSelectedDriverTypes([
            "school",
            "industrial-hitech",
            "industrial-general",
          ]);
        } else if (selectedDataPointSubCategory == "conveniences") {
          setSelectedDriverTypes(["food", "hospital"]);
        } else if (selectedDataPointSubCategory == "transport") {
          setSelectedDriverTypes(["transit", "highway"]);
        }
      } else if (selectedDataPointCategory == "investment") {
        drivers = (lvnzyProject as any)["investment"].growthLevers;
        setSelectedDriverTypes([
          "school",
          "industrial-hitech",
          "industrial-general",
        ]);
      }
      if (drivers && drivers.length) {
        setMapDrivers(drivers);
      }
    }
  }, [lvnzyProject, selectedDataPointCategory, selectedDataPointSubCategory]);

  // Setting main data points category
  useEffect(() => {
    if (lvnzyProject) {
      const params = [];

      for (const key in BRICK360_CATEGORY) {
        const cat = BRICK360_CATEGORY[key as keyof typeof BRICK360_CATEGORY];
        const catInfo = Brick360CategoryInfo[cat];
        params.push({
          title: catInfo.title,
          key: key,
          icon: getDataCategoryIcon(catInfo.iconName, catInfo.iconSet),
          dataPoints: Object.entries(lvnzyProject.score[cat]),
        });
      }
      setScoreParams(params);
    }
  }, [lvnzyProject]);

  const progressWidth = isMobile ? 300 : 500;

  if (lvnzyProjectIsLoading) {
    return <Loader></Loader>;
  }

  // Fake progress bar
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
        {/* <ProjectGallery ></ProjectGallery> */}
        <Typography.Title
          style={{ margin: 0, marginBottom: 32, textAlign: "center" }}
        >
          {lvnzyProject?.meta.projectName}
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
        width: "100%",
        paddingBottom: 75,
        margin: "auto",
        maxWidth: 900,
        overflowX: "hidden",
        backgroundColor: isMobile ? COLORS.bgColor : "white",
      }}
    >
      {/* Main project upfront score card including metadata */}
      <Flex vertical style={{ padding: "16px 16px 0 16px" }}>
        {/* Project Gallery */}
        <ProjectGallery
          media={lvnzyProject?.originalProjectId.media}
        ></ProjectGallery>
        {/* Name */}{" "}
        <Flex style={{ alignItems: "flex-end", margin: "16px 0" }} gap={8}>
          <Typography.Title
            level={2}
            style={{ margin: "0", lineHeight: "100%" }}
          >
            {lvnzyProject?.meta.projectName}
          </Typography.Title>
        </Flex>
      </Flex>
      <Flex
        vertical
        style={{
          marginBottom: 16,
          borderRadius: isMobile ? 0 : 8,
          marginTop: 8,
          width: isMobile ? "100%" : "96%",
          margin: isMobile ? 0 : "0 2%",
          backgroundColor: COLORS.textColorDark,
          padding: "8px 16px",
        }}
        gap={4}
      >
        <Typography.Text
          style={{
            color: "white",
            fontSize: FONT_SIZE.HEADING_4,
          }}
        >
          Brick<i>360</i> Report
        </Typography.Text>
        <Flex style={{ flexWrap: "wrap" }} gap={8}>
          {dataSets.map((d) => (
            <Tag style={{ fontSize: FONT_SIZE.SUB_TEXT }}>{d}</Tag>
          ))}
        </Flex>
      </Flex>
      <Flex vertical style={{ padding: 16 }}>
        {/* Sqft cost */}
        <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_2 }}>
          {rupeeAmountFormat(lvnzyProject?.meta.costingDetails.minimumUnitCost)}
          &nbsp;(
          {Math.round(
            lvnzyProject?.meta.costingDetails.minimumUnitCost /
              lvnzyProject?.meta.costingDetails.minimumUnitSize
          )}{" "}
          /sqft )
        </Typography.Text>
        {/* One Liner */}
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.HEADING_4,
          }}
        >
          {lvnzyProject?.meta.oneLiner.split(" · ").slice(0, 3).join(" · ")}
        </Typography.Text>
        {/* Completion timeline */}
        {lvnzyProject?.meta.projectTimelines &&
        lvnzyProject?.meta.projectTimelines.length ? (
          <Flex>
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.SUB_TEXT,
                color: COLORS.textColorLight,
              }}
            >
              Launched: {lvnzyProject?.meta.projectTimelines[0].startDate} |
            </Typography.Text>

            <Typography.Text
              style={{
                fontSize: FONT_SIZE.SUB_TEXT,
                color: COLORS.textColorLight,
                marginLeft: 4,
              }}
            >
              Completion:{" "}
              {lvnzyProject?.meta.projectTimelines[0].completionDate}
            </Typography.Text>
          </Flex>
        ) : null}
        <Flex>
          <Flex
            style={{
              backgroundColor: COLORS.bgColor,
              marginTop: 4,
              padding: 8,
              border: "1px solid",
              borderColor: COLORS.borderColorMedium,
              borderRadius: 8,
              width: "100%",
            }}
          >
            <Paragraph
              ellipsis={{ rows: 1, expandable: true }}
              style={{
                whiteSpace: "pre-line",
                marginBottom: 0,
                fontSize: FONT_SIZE.PARA,
              }}
            >
              {lvnzyProject!.meta.costingDetails.configurations
                .map((c: any) => `₹${rupeeAmountFormat(c.cost)} / ${c.config}`)
                .join("\n")}
            </Paragraph>
          </Flex>
        </Flex>
      </Flex>

      {/* All the data points */}
      <Flex vertical gap={32} style={{ padding: 16 }}>
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
                  <GradientBar
                    value={getCategoryScore(lvnzyProject!.score[sc.key])}
                    showBadgeOnly={true}
                  ></GradientBar>
                </Flex>

                {sc.dataPoints &&
                sc.dataPoints.filter(
                  (dp: any[]) => !["_id", "openAreaRating"].includes(dp[0])
                ).length ? (
                  <List
                    size="large"
                    dataSource={Object.keys(
                      (Brick360DataPoints as any)[sc.key]
                    ).map((d) => {
                      return sc.dataPoints.find((dp: any) => dp[0] == d);
                    })}
                    renderItem={(item) => (
                      <List.Item
                        style={{
                          padding: "8px",
                          border: "1.5px solid",
                          borderColor: COLORS.borderColorMedium,
                          backgroundColor: "white",

                          borderRadius: 8,
                          marginBottom: 8,
                        }}
                        onClick={() => {
                          setDetailsModalOpen(true);
                          setSelectedDataPointCategory(sc.key);
                          setSelectedDataPointSubCategory((item as any)[0]);
                          setSelectedDataPoint((item as any)[1]);
                          setSelectedDataPointTitle(
                            `${sc.title} > ${
                              (Brick360DataPoints as any)[sc.key][
                                (item as any)[0]
                              ]
                            }`
                          );
                        }}
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

      {/* Full map view modal */}
      <Modal
        title={null}
        open={isMapFullScreen}
        onCancel={() => {
          setIsMapFullScreen(false);
          setDetailsModalOpen(true);
        }}
        forceRender
        closeIcon={null}
        footer={null}
        width={isMobile ? "100%" : 900}
        style={{ padding: 0 }}
        styles={{ content: { padding: 0 } }}
      >
        <Flex style={{ height: 600 }} vertical gap={8}>
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
          <MapViewV2
            fullSize={true}
            defaultSelectedDriverTypes={selectedDriverTypes}
            projectId={lvnzyProject?.originalProjectId._id}
            drivers={mapDrivers.map((d) => {
              return {
                id: d.driverId._id,
                duration: Math.round(d.mapsDurationSeconds / 60),
              };
            })}
          />
        </Flex>
      </Modal>

      {/* Bottom drawer to show a selected data point */}
      <Drawer
        title={null}
        placement="bottom"
        styles={{
          body: {
            padding: 0,
          },
          header: {
            padding: 16,
          },
        }}
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
          {/* Map view including expand button and drawer close icon button */}
          {mapDrivers && mapDrivers.length ? (
            <Flex vertical style={{ position: "relative" }}>
              {renderDrawerCloseBtn()}
              <Flex
                style={{
                  position: "absolute",
                  bottom: 16,
                  right: 16,
                  zIndex: 9999,
                }}
              >
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
                <MapViewV2
                  projectId={lvnzyProject?.originalProjectId._id}
                  defaultSelectedDriverTypes={selectedDriverTypes}
                  drivers={mapDrivers.map((d) => {
                    return {
                      id: d.driverId._id,
                      duration: Math.round(d.mapsDurationSeconds / 60),
                    };
                  })}
                  fullSize={false}
                />
              </Flex>
            </Flex>
          ) : null}

          {/* Close button when map view is absent */}
          {!mapDrivers || !mapDrivers.length ? renderDrawerCloseBtn() : null}

          {/* Rest of the content including title, markdown content and chatbox */}
          <Flex vertical style={{ padding: 16 }}>
            <Typography.Title level={4} style={{ margin: "8px 0" }}>
              {selectedDataPointTitle}
            </Typography.Title>
            {selectedDataPointCategory == "developer" && (
              <Typography.Title level={5} style={{ margin: "8px 0" }}>
                {lvnzyProject?.originalProjectId.info.developerId.name}
              </Typography.Title>
            )}
            <Flex vertical gap={16}>
              {selectedDataPoint
                ? selectedDataPoint.reasoning.map((r: string) => {
                    return (
                      <Flex
                        style={{
                          maxWidth: 500,
                          backgroundColor: COLORS.bgColorMedium,
                          borderRadius: 8,
                          borderColor: COLORS.borderColorMedium,
                          padding: 8,
                        }}
                      >
                        <div
                          dangerouslySetInnerHTML={{ __html: r }}
                          className="reasoning"
                          style={{ fontSize: FONT_SIZE.HEADING_4, margin: 0 }}
                        ></div>
                      </Flex>
                    );
                  })
                : ""}
            </Flex>

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
        </Flex>
      </Drawer>
    </Flex>
  );
}
