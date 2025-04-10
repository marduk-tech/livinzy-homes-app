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
import Brick360Chat from "../components/liv/brick360-chat";
import { MapView } from "../components/map-view/map-view";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
import ProjectGallery from "../components/project-gallery";
import { Loader } from "../components/common/loader";
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

  // Setting main data points category
  useEffect(() => {
    if (lvnzyProject) {
      const params = [];
      params.push({
        title: "Property",
        key: "property",
        icon: getDataCategoryIcon("MdOutlineMapsHomeWork", "md"),
        dataPoints: Object.entries(lvnzyProject.score.property),
      });
      params.push({
        title: "Developer",
        key: "developer",
        icon: getDataCategoryIcon("FaPeopleGroup", "fa6"),
        dataPoints: Object.entries(lvnzyProject.score.developer),
      });
      params.push({
        title: "Investment",
        key: "investment",
        icon: getDataCategoryIcon("GiTakeMyMoney", "gi"),
        dataPoints: Object.entries(lvnzyProject.score.investment),
      });
      params.push({
        title: "Area & Connectivity",
        key: "areaConnectivity",
        icon: getDataCategoryIcon("GiPathDistance", "gi"),
        dataPoints: Object.entries(lvnzyProject.score.areaConnectivity),
      });

      setScoreParams(params);
    }
  }, [lvnzyProject]);

  const progressWidth = isMobile ? 300 : 500;

  if (lvnzyProjectIsLoading) {
    return <Loader></Loader>;
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
        borderRadius: 16,
        width: "100%",
        paddingBottom: 75,
        margin: "auto",
        maxWidth: 900,
        overflowX: "hidden",
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
        gap={8}
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
                fontSize: FONT_SIZE.PARA,
                color: COLORS.textColorLight,
              }}
            >
              Launched: {lvnzyProject?.meta.projectTimelines[0].startDate} |
            </Typography.Text>

            <Typography.Text
              style={{
                fontSize: FONT_SIZE.PARA,
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
            }}
          >
            <Paragraph
              ellipsis={{ rows: 1, expandable: true }}
              style={{ whiteSpace: "pre-line", marginBottom: 0 }}
            >
              {lvnzyProject!.meta.costingDetails.configurations
                .map((c: any) => `₹${rupeeAmountFormat(c.cost)} / ${c.config}`)
                .join("\n")}
            </Paragraph>
          </Flex>
        </Flex>
      </Flex>

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
                </Flex>

                <List
                  size="large"
                  dataSource={sc.dataPoints.filter(
                    (dp: any[]) => !["_id", "openAreaRating"].includes(dp[0])
                  )}
                  renderItem={(item) => (
                    <List.Item
                      style={{
                        padding: "8px",
                        border: "1px solid",
                        borderRadius: 8,
                        borderColor: COLORS.borderColorMedium,
                        marginBottom: 16,
                      }}
                      onClick={() => {
                        setDetailsModalOpen(true);
                        setSelectedDataPointCategory(sc.title.toLowerCase());
                        setSelectedDataPointSubCategory((item as any)[0]);
                        setSelectedDataPoint((item as any)[1]);
                        setSelectedDataPointTitle(
                          `${sc.title} > ${
                            (POP_STAR_DATA_POINTS as any)[sc.key][
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
                            color:
                              (item as any)[1].rating > 0
                                ? COLORS.textColorDark
                                : COLORS.textColorLight,
                          }}
                        >
                          {capitalize(
                            (POP_STAR_DATA_POINTS as any)[sc.key][
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

      {/* Full map view modal */}
      <Modal
        title={null}
        open={isMapFullScreen}
        onCancel={() => {
          setDetailsModalOpen(false);
          setSelectedDriverTypes([]);
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
                setSelectedDriverTypes([]);
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
            mapTitle={`${lvnzyProject?.meta.projectName}: ${selectedDataPointCategory}`}
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
                <MapView
                  projectId={lvnzyProject?.originalProjectId._id}
                  projects={[]}
                  mapTitle={`${lvnzyProject?.meta.projectName}: ${selectedDataPointCategory}`}
                  drivers={mapDrivers.map((d) => d.driverId._id)}
                ></MapView>
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
