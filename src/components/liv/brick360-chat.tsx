import {
  Button,
  Divider,
  Drawer,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Tag,
  Typography,
} from "antd";
import { makeStreamingJsonRequest } from "http-streaming-request";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "../../hooks/use-user";
import { axiosApiInstance } from "../../libs/axios-api-Instance";
import { baseApiUrl, Brick360DataPoints } from "../../libs/constants";
import { captureAnalyticsEvent } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import DynamicReactIcon from "../common/dynamic-react-icon";
import { sha256 } from "js-sha256";
import { LvnzyProject } from "../../types/LvnzyProject";
import { useDevice } from "../../hooks/use-device";
import MapViewV2 from "../map-view/map-view-v2";
import { ISurroundingElement } from "../../types/Project";

const { Paragraph } = Typography;

export interface AICuratedProject {
  projectId: string;
  relevancyScore: number;
  relevantDetails: string;
}

export interface Brick360Props {
  lvnzyProject: LvnzyProject;
  dataPoint: any;
}
interface Brick360ChatRef {
  expandChat: () => void;
}

export interface Brick360Answer {
  answer: string;
}

export const Brick360Chat = forwardRef<Brick360ChatRef, Brick360Props>(
  ({ dataPoint, lvnzyProject }, ref) => {
    const [currentQuestion, setCurrentQuestion] = useState<string>();
    const [currentAnswer, setCurrentAnswer] = useState<
      Brick360Answer | undefined
    >();

    const [dataPointSelected, setDataPointSelected] = useState<any>();
    const [followUpPrompts, setFollowupPrompts] = useState<string[]>();
    const [mapDrivers, setMapDrivers] = useState<any[]>([]);
    const [surroundingElements, setSurroundingElements] =
      useState<ISurroundingElement[]>();

    const [projectsNearby, setProjectsNearby] = useState<any[]>();

    const [mapVisible, setMapVisible] = useState<boolean>(false);
    const [selectedDriverTypes, setSelectedDriverTypes] = useState<any>();

    const [currentSessionId, setCurrentSessionId] = useState<string>(() =>
      uuidv4()
    );
    const [queryStreaming, setQueryStreaming] = useState<boolean>(false);
    const [queryStreamingText, setQueryStreaminText] = useState<string>();

    const [loadingLivThread, setLoadingLivThread] = useState(false);

    const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
    const [isMapFullScreen, setIsMapFullScreen] = useState(false);

    const { user } = useUser();

    const [form] = Form.useForm();
    const [previousChat, setPreviousChat] = useState<
      Array<{ question: string; answer: any }>
    >([]);

    const [currentChat, setCurrentChat] = useState<
      Array<{ question: string; answer: any }>
    >([]);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    const [messageApi, contextHolder] = message.useMessage();

    const { isMobile } = useDevice();

    const [
      selectedProjectPredefinedQuestion,
      setSelectedProjectPredefinedQuestion,
    ] = useState<string>();

    // Example method to expose to parent
    useImperativeHandle(ref, () => ({
      expandChat: () => {
        setIsDrawerExpanded(true);
      },
    }));

    // Setting map drivers based on selected data point
    useEffect(() => {
      setMapVisible(false);
      setMapDrivers([]);
      setFollowupPrompts([]);
      setSurroundingElements([]);
      setProjectsNearby([]);
      if (
        dataPointSelected &&
        dataPointSelected.selectedDataPointCategory &&
        dataPointSelected.selectedDataPointSubCategory
      ) {
        const prompts = (Brick360DataPoints as any)[
          dataPointSelected.selectedDataPointCategory
        ][dataPointSelected.selectedDataPointSubCategory]["prompts"];

        setFollowupPrompts(prompts);
        let surrElements;

        const updateMapState = () => {
          // reset states first
          setSelectedDriverTypes([]);
          setMapVisible(false);

          if (
            dataPointSelected.selectedDataPointCategory === "areaConnectivity"
          ) {
            setMapVisible(true);
            let driverTypes: string[] = [];
            switch (dataPointSelected.selectedDataPointSubCategory) {
              case "schoolsOffices":
                driverTypes = [
                  "school",
                  "industrial-hitech",
                  "industrial-general",
                ];
                setMapDrivers(
                  lvnzyProject.neighborhood.drivers.filter(
                    (d: any) =>
                      !!d &&
                      !!d.driverId &&
                      driverTypes.includes(d.driverId.driver)
                  )
                );
                break;
              case "conveniences":
                driverTypes = ["food", "hospital", "commercial"];
                setMapDrivers(
                  lvnzyProject.neighborhood.drivers.filter(
                    (d: any) =>
                      !!d &&
                      !!d.driverId &&
                      driverTypes.includes(d.driverId.driver)
                  )
                );
                break;
              case "transport":
                driverTypes = ["transit", "highway"];
                setMapDrivers(
                  lvnzyProject.connectivity.drivers.filter(
                    (d: any) => !!d && !!d.driverId
                  )
                );
                break;
            }
            setSelectedDriverTypes(driverTypes);
          } else if (
            dataPointSelected.selectedDataPointCategory === "financials"
          ) {
            if (
              dataPointSelected.selectedDataPointSubCategory ===
              "growthPotential"
            ) {
              setMapVisible(true);
              let driverTypes = [
                "industrial-hitech",
                "industrial-general",
                "highway",
                "transit",
              ];
              setSelectedDriverTypes(driverTypes);
              setMapDrivers([
                ...lvnzyProject.connectivity.drivers,
                ...lvnzyProject.neighborhood.drivers.filter(
                  (d: any) =>
                    d && d.driverId && driverTypes.includes(d.driverId.driver)
                ),
              ]);
            } else if (
              dataPointSelected.selectedDataPointSubCategory === "pricePoint"
            ) {
              setMapVisible(true);
              setProjectsNearby(
                lvnzyProject?.investment.corridorPricing.filter(
                  (p: any) => !!p.sqftCost
                )
              );
            }
          } else if (
            dataPointSelected.selectedDataPointCategory === "property" &&
            dataPointSelected.selectedDataPointSubCategory === "surroundings"
          ) {
            setMapVisible(true);
            surrElements = (lvnzyProject as any)["property"].surroundings;
            if (
              surrElements?.length &&
              surrElements.filter((e: any) => !!e.geometry).length
            ) {
              setSurroundingElements(surrElements);
              setMapVisible(true);
            }
          }
        };

        setTimeout(updateMapState, 0);
      } else {
        setFollowupPrompts([]);
        setSurroundingElements([]);
        setMapDrivers([]);
        setMapVisible(false);
      }
    }, [dataPointSelected]);

    useEffect(() => {
      setDataPointSelected(dataPoint);
    }, [dataPoint]);

    useEffect(() => {
      if (user && lvnzyProject && dataPoint) {
        const sessionId = sha256(`${user._id}:${lvnzyProject._id}`);
        setCurrentSessionId(sessionId);
        fetchHistory(sessionId);
      }
    }, [user, lvnzyProject, dataPoint]);

    const fetchHistory = async (historySessionId: string) => {
      try {
        setLoadingLivThread(true);
        const response = await axiosApiInstance.post("/ai/history", {
          sessionId: historySessionId,
        });

        if (response.data?.data) {
          const history = response.data.data;
          const threads: Array<{ question: string; answer: Brick360Answer }> =
            [];

          //  (human question + ai answer)
          for (let i = 0; i < history.length; i += 2) {
            const question = history[i];
            const answer = history[i + 1];

            if (question?.role === "human" && answer?.role === "ai") {
              try {
                // parse the ai response which is a json string
                const aiResponse = JSON.parse(answer.content);
                threads.push({
                  question: question.content,
                  answer: aiResponse,
                });
              } catch (e) {
                console.error("Error parsing AI response:", e);
              }
            }
          }

          // update livThread with historical messages
          setPreviousChat(threads);
        }
        setLoadingLivThread(false);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    const [isFirstQuestion, setIsFirstQuestion] = useState<boolean>(true);

    const handleRequest = async (question: string) => {
      try {
        if (!question || question.length < 3) {
          return;
        }

        setIsDrawerExpanded(true);
        captureAnalyticsEvent("question-asked", { question });
        setQueryStreaming(true);

        if (currentQuestion) {
          setCurrentChat((prev) => [
            ...prev,
            { question: currentQuestion!, answer: currentAnswer || {} },
          ]);
        }
        setCurrentQuestion(question);
        setCurrentAnswer({ answer: "" });

        setQueryStreaminText(
          "<span class='progress-text'>Sending query. Hold on !</span>"
        );
        setTimeout(() => {
          setQueryStreaminText(
            "<span class='progress-text'>Finding relevant data...</span>"
          );
          setTimeout(() => {
            setQueryStreaminText(
              "<span class='progress-text'>Preparing the answer...</span>"
            );
          }, 3000);
        }, 2000);

        // if this is first question store session info
        if (isFirstQuestion && user?._id) {
          try {
            await axiosApiInstance.put(`/user/${user._id}/chat-session`, {
              userId: user._id,
              sessionId: currentSessionId,
              startingQuestion: question,
            });
            setIsFirstQuestion(false);
          } catch (error) {
            console.log("Error saving chat session:", error);
          }
        }

        const stream = makeStreamingJsonRequest({
          url: `${baseApiUrl}ai/ask-stream-brick360`,
          method: "POST",
          payload: {
            question,
            sessionId: currentSessionId,
            userId: user?._id,
            dataPointCategory: dataPoint.dataPointCategory,
            lvnzyProjectId: lvnzyProject._id,
          },
        });

        for await (const data of stream) {
          console.log("received stream response: ", JSON.stringify(data));
          setCurrentAnswer(data);
        }
        console.log("Streaming completed");
        setQueryStreaming(false);
      } catch (error) {
        console.error("Error sending message:", error);
        messageApi.open({
          type: "error",
          content: "Oops. Can you please try again?",
        });
      } finally {
        setQueryStreaming(false);
        setSelectedProjectPredefinedQuestion(undefined);
      }
    };

    const renderQABlock = (q: string, a: string, currentQuestion: boolean) => {
      return (
        <Flex vertical>
          <Flex>
            <Flex>
              <Typography.Text
                style={{
                  backgroundColor: COLORS.textColorDark,
                  color: "white",
                  borderRadius: 8,
                  padding: "4px 8px",
                  marginBottom: 8,
                }}
              >
                {q}
              </Typography.Text>
            </Flex>
          </Flex>

          <Flex
            style={{
              maxWidth: 850,
              marginTop: 8,
            }}
            gap={4}
            vertical
          >
            {currentQuestion && queryStreaming ? (
              <Flex align="center">
                <img
                  src="/images/liv-streaming.gif"
                  style={{
                    height: 24,
                    width: 24,
                  }}
                />
                <div
                  dangerouslySetInnerHTML={{ __html: queryStreamingText || "" }}
                  className="reasoning"
                  style={{ fontSize: FONT_SIZE.PARA, margin: 0 }}
                ></div>
              </Flex>
            ) : null}

            <div
              dangerouslySetInnerHTML={{ __html: a }}
              className="reasoning"
              style={{ fontSize: FONT_SIZE.PARA, margin: 0 }}
            ></div>
          </Flex>
        </Flex>
      );
    };

    const renderQuestionAnswerSection = () => {
      return (
        <Flex
          ref={chatContainerRef}
          vertical
          gap={40}
          style={{
            overflowY: "auto",
            scrollbarWidth: "none",
            scrollBehavior: "smooth",
            marginBottom: 24,
          }}
        >
          {(currentChat && currentChat.length) || currentQuestion ? (
            <>
              {" "}
              {/* Past Interactions */}
              {currentChat.map((thread, index) =>
                renderQABlock(thread.question, thread.answer.answer, false)
              )}
              {/* Current Question & Answer (Only show while processing) */}
              {currentQuestion &&
                renderQABlock(currentQuestion, currentAnswer?.answer!, true)}
            </>
          ) : null}
        </Flex>
      );
    };

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
          onClick={closeDrawer}
        >
          <DynamicReactIcon
            iconName="IoCloseCircle"
            iconSet="io5"
            size={32}
            color={COLORS.borderColorDark}
          ></DynamicReactIcon>
        </Flex>
      );
    };
    function closeDrawer() {
      setIsDrawerExpanded(false);
      setPreviousChat([]);
      setCurrentChat([]);
      setCurrentQuestion(undefined);
      setCurrentAnswer(undefined);
    }

    return (
      <Drawer
        title={null}
        placement="bottom"
        styles={{
          body: {
            padding: 0,
            borderTop: isDrawerExpanded
              ? `1px solid ${COLORS.borderColorMedium}`
              : "none",
            borderLeft: isDrawerExpanded
              ? `1px solid ${COLORS.borderColorMedium}`
              : "none",
            borderRight: isDrawerExpanded
              ? `1px solid ${COLORS.borderColorMedium}`
              : "none",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            scrollbarWidth: "none",
            position: "relative",
            overflowY: "scroll",
          },
          header: {
            padding: 16,
          },
          content: {
            backgroundColor: isDrawerExpanded ? "white" : "transparent",
            borderTop: isDrawerExpanded
              ? `1px solid ${COLORS.borderColor}`
              : "none",
            borderLeft: isDrawerExpanded
              ? `1px solid ${COLORS.borderColor}`
              : "none",
            borderRight: isDrawerExpanded
              ? `1px solid ${COLORS.borderColor}`
              : "none",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          },
          wrapper: {
            boxShadow: isDrawerExpanded ? "initial" : "none",
          },
          mask: {
            backgroundColor: "rgba(0,0,0,0.3)",
          },
        }}
        rootStyle={{
          maxWidth: 885,
          marginLeft: isMobile ? 0 : "calc(50% - 447px)",
        }}
        closable={false}
        height={
          isDrawerExpanded ? Math.min(700, window.innerHeight * 0.8) : 100
        }
        onClose={closeDrawer}
        open={true}
        mask={isDrawerExpanded ? true : false}
        maskClosable={true}
      >
        <Flex
          vertical
          style={{
            paddingBottom: 64,
            paddingTop: 16,
          }}
        >
          {isDrawerExpanded ? renderDrawerCloseBtn() : null}

          {/* Rest of the content including title, markdown content and chatbot */}
          <Flex
            vertical
            style={{
              padding: 8,
            }}
          >
            {isDrawerExpanded && (
              <Flex vertical>
                <Flex>
                  <Typography.Text
                    style={{
                      backgroundColor: COLORS.textColorDark,
                      color: "white",
                      borderRadius: 8,
                      padding: "4px 8px",
                      marginBottom: 8,
                    }}
                  >
                    {dataPointSelected.selectedDataPointTitle}
                  </Typography.Text>
                </Flex>
                {/* Map view including expand button and drawer close icon button */}
                {mapVisible ? (
                  <Flex
                    vertical
                    style={{
                      position: "relative",
                      border: "2px solid",
                      borderColor: COLORS.borderColor,
                      borderRadius: 16,
                    }}
                  >
                    <Flex
                      style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        zIndex: 9999,
                      }}
                    >
                      <Button
                        size="small"
                        icon={
                          <DynamicReactIcon
                            iconName="FaExpand"
                            color="white"
                            iconSet="fa"
                            size={16}
                          />
                        }
                        style={{
                          marginLeft: "auto",
                          marginBottom: 8,
                          borderRadius: 8,
                          cursor: "pointer",
                          backgroundColor: COLORS.textColorDark,
                          color: "white",
                          fontSize: FONT_SIZE.SUB_TEXT,
                          height: 28,
                        }}
                        onClick={() => {
                          setIsDrawerExpanded(false);
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
                      }}
                    >
                      <MapViewV2
                        projectId={lvnzyProject?.originalProjectId._id}
                        surroundingElements={surroundingElements}
                        projectSqftPricing={Math.round(
                          lvnzyProject?.meta.costingDetails.minimumUnitCost /
                            lvnzyProject?.meta.costingDetails.minimumUnitSize
                        )}
                        projectsNearby={projectsNearby}
                        drivers={mapDrivers.map((d) => {
                          return {
                            ...d.driverId,
                            duration: d.durationMins
                              ? d.durationMins
                              : Math.round(d.mapsDurationSeconds / 60),
                          };
                        })}
                        fullSize={false}
                      />
                    </Flex>
                  </Flex>
                ) : null}

                {/* Data point selected */}
                <Flex vertical style={{ paddingTop: 8 }}>
                  <Flex vertical gap={16} style={{ marginBottom: 24 }}>
                    {dataPointSelected?.selectedDataPoint
                      ? dataPointSelected?.selectedDataPoint.reasoning.map(
                          (r: string) => {
                            return (
                              <Flex
                                style={{
                                  maxWidth: 850,
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
                          }
                        )
                      : ""}
                  </Flex>

                  {/* Followup Prompts */}
                  {followUpPrompts &&
                  followUpPrompts.length &&
                  !currentQuestion ? (
                    <Flex
                      gap={4}
                      style={{
                        width: "100%",
                        flexWrap: "wrap",
                        marginBottom: 16,
                      }}
                    >
                      <Divider
                        style={{
                          fontSize: FONT_SIZE.HEADING_4,
                          color: COLORS.textColorLight,
                          margin: 0,
                          marginBottom: 24,
                        }}
                        orientation="left"
                      >
                        Ask next
                      </Divider>
                      {followUpPrompts.map((p: string) => {
                        return (
                          <Tag
                            style={{
                              backgroundColor: COLORS.bgColorBlue,
                              fontSize: FONT_SIZE.HEADING_4,
                              padding: "4px",
                              borderRadius: 8,
                              marginBottom: 4,
                              fontWeight: 500,
                              borderColor: COLORS.borderColorMedium,
                            }}
                            onClick={() => {
                              handleRequest(p);
                            }}
                          >
                            {p}
                          </Tag>
                        );
                      })}
                    </Flex>
                  ) : null}
                </Flex>

                {/* Single session of question / answer */}
                {renderQuestionAnswerSection()}
              </Flex>
            )}
            {/* Input */}
            <Flex
              vertical
              style={{
                position: "fixed",
                bottom: 16,
                width: "95%",
                maxWidth: 850,
              }}
            >
              <Form
                form={form}
                onFinish={async (value) => {
                  form.resetFields();
                  const { question } = value;
                  if (!isDrawerExpanded) {
                    setDataPointSelected(undefined);
                  }
                  handleRequest(question);
                }}
              >
                <Form.Item label="" name="question" style={{ marginBottom: 0 }}>
                  <Input
                    disabled={queryStreaming}
                    style={{
                      boxShadow: "0 0 8px rgba(41, 181, 232, 0.9)",
                      height: 50,
                      paddingRight: 0,
                      backgroundColor: "white",
                      border: "1px solid",
                      borderColor: COLORS.borderColorMedium,
                      borderRadius: 16,
                      width: "100%",
                      fontSize: FONT_SIZE.HEADING_3,
                    }}
                    name="query"
                    placeholder="Have a question? Ask away!"
                    prefix={
                      <Flex style={{ marginRight: 8 }}>
                        <DynamicReactIcon
                          iconName="GiOilySpiral"
                          iconSet="gi"
                          size={24}
                        ></DynamicReactIcon>
                      </Flex>
                    }
                    suffix={
                      <Button
                        htmlType="submit"
                        type="link"
                        disabled={queryStreaming}
                        style={{
                          opacity: !queryStreaming ? 1 : 0.3,
                          padding: 0,
                          paddingRight: 8,
                        }}
                      >
                        <DynamicReactIcon
                          iconName="BiSolidSend"
                          iconSet="bi"
                        ></DynamicReactIcon>
                      </Button>
                    }
                  />
                </Form.Item>
              </Form>
            </Flex>
          </Flex>
        </Flex>
        <Modal
          title={null}
          open={isMapFullScreen}
          onCancel={() => {
            setIsMapFullScreen(false);
            setIsDrawerExpanded(true);
          }}
          forceRender
          footer={null}
          width={isMobile ? "100%" : 900}
          style={{ top: 10 }}
          styles={{
            content: {
              backgroundColor: COLORS.bgColorMedium,
              borderRadius: 8,
              padding: 0,
              overflowY: "hidden",
            },
          }}
        >
          <Flex
            style={{ height: Math.min(window.innerHeight - 20, 800) }}
            vertical
            gap={8}
          >
            <MapViewV2
              projectId={lvnzyProject?.originalProjectId._id}
              surroundingElements={surroundingElements}
              projectSqftPricing={Math.round(
                lvnzyProject?.meta.costingDetails.minimumUnitCost /
                  lvnzyProject?.meta.costingDetails.minimumUnitSize
              )}
              projectsNearby={projectsNearby}
              drivers={mapDrivers.map((d) => {
                return {
                  ...d.driverId,
                  duration: d.durationMins
                    ? d.durationMins
                    : Math.round(d.mapsDurationSeconds / 60),
                };
              })}
              fullSize={true}
            />
          </Flex>
        </Modal>
      </Drawer>
    );
  }
);

export default Brick360Chat;
