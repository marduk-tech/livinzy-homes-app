import { Flex, List, Modal, Progress, Select, Tag, Typography } from "antd";
import { useFetchLvnzyProjectById } from "../hooks/use-lvnzy-project";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { capitalize, rupeeAmountFormat } from "../libs/lvnzy-helper";
import { LivIndexDriversConfig, Brick360DataPoints } from "../libs/constants";
import GradientBar from "../components/common/grading-bar";
import { useDevice } from "../hooks/use-device";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
import ProjectGallery from "../components/project-gallery";
import { Loader } from "../components/common/loader";
const FAKE_TIMER_SECS = 1000;
const { Paragraph, Text } = Typography;

export function Brick360Full() {
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

  const [mapDrivers, setMapDrivers] = useState<any[]>([]);
  const [uniqueDriverTypes, setUniqueDriverTypes] = useState<any[]>([]);
  const [selectedDriverTypes, setSelectedDriverTypes] = useState<string[]>([]);

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
                        marginBottom: 16,
                      }}
                      onClick={() => {
                        setDetailsModalOpen(true);
                      }}
                    >
                      <Flex vertical>
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
                              (Brick360DataPoints as any)[sc.key][
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
                        <Flex vertical style={{ marginTop: 8 }}>
                          {(item as any)[0] == "developer" && (
                            <Typography.Title
                              level={5}
                              style={{ margin: "8px 0" }}
                            >
                              {
                                lvnzyProject?.originalProjectId.info.developerId
                                  .name
                              }
                            </Typography.Title>
                          )}
                          <Flex vertical gap={16}>
                            {(item as any)[1]
                              ? (item as any)[1].reasoning.map((r: string) => {
                                  return (
                                    <Flex
                                      style={{
                                        maxWidth: 800,
                                        backgroundColor: COLORS.bgColorMedium,
                                        borderRadius: 8,
                                        borderColor: COLORS.borderColorMedium,
                                        padding: 8,
                                      }}
                                    >
                                      <div
                                        dangerouslySetInnerHTML={{ __html: r }}
                                        className="reasoning"
                                        style={{
                                          fontSize: FONT_SIZE.HEADING_4,
                                          margin: 0,
                                        }}
                                      ></div>
                                    </Flex>
                                  );
                                })
                              : ""}
                          </Flex>

                          {/* <Flex style={{ width: "100%" }}>
                            <Brick360Chat
                              ref={chatRef}
                              lvnzyProjectId={lvnzyProjectId!}
                              dataPointCategory={sc.title.toLowerCase()}
                              dataPoint={selectedDataPointTitle}
                            ></Brick360Chat>
                          </Flex> */}
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
        </Flex>
      </Modal>
    </Flex>
  );
}
