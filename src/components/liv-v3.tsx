import { LoadingOutlined } from "@ant-design/icons";
import { Button, Flex, Form, Input, message, Spin, Typography } from "antd";
import { makeStreamingJsonRequest } from "http-streaming-request";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";
import { useDevice } from "../hooks/use-device";
import { useFetchProjects } from "../hooks/use-project";
import { useUser } from "../hooks/use-user";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { baseApiUrl, PlaceholderContent } from "../libs/constants";
import { captureAnalyticsEvent } from "../libs/lvnzy-helper";
import { COLORS, FONT_SIZE, MAX_WIDTH } from "../theme/style-constants";
import { Project } from "../types/Project";
import DynamicReactIcon from "./common/dynamic-react-icon";
import { ProjectCard } from "./common/project-card";
import { MapView } from "./map-view/map-view";
import ProjectsViewV2 from "./projects-view-v2";

const { Paragraph } = Typography;

interface AICuratedProject {
  projectId: string;
  relevancyScore: number;
  relevantDetails: string;
}

export interface LivRef {
  summarizeProject: (projectId: string) => void;
}

export const LivV3 = forwardRef<LivRef, {}>((props, ref) => {
  const [projectsList, setProjectsList] = useState<any>([]);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>();
  const [projectId, setProjectId] = useState<string>("");

  const { data: projects, isLoading: projectIsLoading } = useFetchProjects();

  const [sessionId, setSessionId] = useState<string>(() => uuidv4());
  const [queryProcessing, setQueryProcessing] = useState<boolean>(false);

  const { user } = useUser();

  const { isMobile } = useDevice();
  const [query, setQuery] = useState<string>();
  const [form] = Form.useForm();
  const [followUp, setFollowUp] = useState<string[]>([]);
  const [livThread, setLivThread] = useState<
    Array<{ question: string; answer: any }>
  >([]);

  const [details, setDetails] = useState<string>();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Implement ref methods
  useEffect(() => {
    if (ref) {
      (ref as any).current = {
        summarizeProject: (projectId: string) => {
          setCurrentQuestion("");
          setProjectId(projectId);
          handleRequest(`summarize this project - ${projectId}`);
        },
      };
    }
  }, [ref]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [livThread, details]);

  const [messageApi, contextHolder] = message.useMessage();
  const [toggleMapView, setToggleMapView] = useState(false);

  const [
    selectedProjectPredefinedQuestion,
    setSelectedProjectPredefinedQuestion,
  ] = useState<string>();

  useEffect(() => {
    if (projects) {
      setProjectsList(projects.sort((a, b) => 0.5 - Math.random()));
    }
  }, [projects]);

  useEffect(() => {
    if (user && user?._id) {
      fetchHistory(user._id);
    }
  }, [user]);

  const fetchHistory = async (historySessionId: string) => {
    try {
      const response = await axiosApiInstance.post("/ai/history", {
        sessionId: historySessionId,
      });

      if (response.data?.data) {
        const history = response.data.data;
        const threads: Array<{ question: string; answer: string }> = [];

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
                answer: aiResponse.details || "",
              });
            } catch (e) {
              console.error("Error parsing AI response:", e);
            }
          }
        }

        // update livThread with historical messages
        setLivThread(threads);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const refineProjectList = (
    curatedProjects: (AICuratedProject | Project)[]
  ) => {
    if (
      curatedProjects &&
      curatedProjects.length &&
      curatedProjects[0].relevantDetails
    ) {
      const formattedProjects: any = [];
      (curatedProjects as AICuratedProject[]).forEach((p: AICuratedProject) => {
        if (p.relevancyScore >= 3) {
          formattedProjects.push({
            ...projects!.find((op: any) => op._id == p.projectId),
            ...p,
          });
        }
      });
      formattedProjects.sort((a: any, b: any) => {
        return (b.relevancyScore || 0) - (a.relevancyScore || 0);
      });
      return formattedProjects;
    }
    return curatedProjects;
  };

  // Track if first question in session
  const [isFirstQuestion, setIsFirstQuestion] = useState<boolean>(true);

  const handleRequest = async (question: string) => {
    try {
      captureAnalyticsEvent("question-asked", { projectId, question });
      setQueryProcessing(true);
      setDetails("...");

      // If this is first question, store session info
      if (isFirstQuestion && user?._id) {
        try {
          await axiosApiInstance.put(`/user/${user._id}/chat-session`, {
            userId: user._id,
            sessionId,
            startingQuestion: question,
          });
          setIsFirstQuestion(false);
        } catch (error) {
          console.log("Error saving chat session:", error);
        }
      }

      const stream = makeStreamingJsonRequest({
        url: `${baseApiUrl}ai/ask-stream`,
        method: "POST",
        payload: { question, sessionId, projectId },
      });

      await processStream(stream, question);
    } catch (error) {
      console.error("Error sending message:", error);
      messageApi.open({
        type: "error",
        content: "Oops. Can you please try again?",
      });
    } finally {
      setQueryProcessing(false);
      setSelectedProjectPredefinedQuestion(undefined);
    }
  };

  const processStream = async (
    stream: AsyncIterableIterator<any>,
    question: string
  ) => {
    let finalAnswer = "";
    let newFollowUp: string[] = [];

    for await (const data of stream) {
      console.log("received stream response: ", JSON.stringify(data));
      const answerObj = data;

      if (answerObj.details) {
        setDetails(answerObj.details);
        finalAnswer = answerObj.details;
      }

      if (answerObj.followUp) {
        newFollowUp = answerObj.followUp;
      }

      if (answerObj.projectId && !projectId) {
        setProjectId(answerObj.projectId);
      } else if (answerObj.drivers?.length) {
        setProjectId("");
        setDrivers(answerObj.drivers);
      } else if (answerObj.projects?.length) {
        setProjectId("");
        // Only update projects if we have valid data
        const validProjects = answerObj.projects.filter((p: Project) => p); // Filter out any null/undefined entries
        if (validProjects.length > 0) {
          setProjectsList(validProjects);
        }
      }
    }

    console.log("Streaming completed");

    if (newFollowUp.length) {
      setFollowUp(newFollowUp);
    }
    setLivThread((prev) => [...prev, { question, answer: finalAnswer }]);
  };

  const renderMessageThread = (
    question: string,
    answer: string,
    isStreaming?: boolean
  ) => (
    <Flex
      vertical
      style={{ marginBottom: 16, padding: isMobile ? "0 16px" : 0 }}
    >
      <Flex align="center" gap={8} style={{ padding: isMobile ? "0 16px" : 0 }}>
        {isStreaming && (
          <img
            src="/images/liv-streaming.gif"
            style={{
              height: 28,
              width: 28,
            }}
          />
        )}
        <Typography.Text
          style={{
            backgroundColor: isStreaming
              ? COLORS.bgColor
              : COLORS.textColorDark,
            padding: "4px 12px",
            borderRadius: 16,
            border: "1px solid",
            color: isStreaming ? COLORS.textColorLight : "white",
            borderColor: COLORS.borderColorMedium,
            display: "inline",
            alignSelf: "flex-start",
            marginTop: 8,
            marginBottom: 8,
          }}
        >
          {question}
        </Typography.Text>
      </Flex>
      {answer && (
        <Flex style={{ padding: isMobile ? "0 16px" : 0 }} vertical>
          <Markdown className="liviq-content">{answer}</Markdown>
        </Flex>
      )}
    </Flex>
  );

  const renderQuestionAnswerSection = () => {
    return (
      <Flex
        ref={chatContainerRef}
        vertical
        style={{
          height: window.innerHeight - 60,
          overflowY: "auto",
          scrollbarWidth: "none",
          paddingBottom: 150,
          scrollBehavior: "smooth",
        }}
      >
        <div>
          <Markdown className="liviq-content">{PlaceholderContent}</Markdown>
        </div>

        <Flex
          style={{ flexWrap: "wrap", marginTop: 0, marginBottom: 16 }}
          gap={16}
        >
          {!projectId && !details
            ? [
                "Show me farmlands near Nandi Hills",
                "How are the schools in the area ?",
                "Properties with rental income ? ",
              ].map((q) => {
                return (
                  <Flex>
                    <Typography.Text
                      onClick={() => {
                        if (selectedProjectPredefinedQuestion == q) {
                          return;
                        }
                        setCurrentQuestion(q);
                        setSelectedProjectPredefinedQuestion(q);
                        setQueryProcessing(true);
                        handleRequest(q);
                      }}
                      style={{
                        cursor: "pointer",
                        backgroundColor: "white",
                        padding: "4px 12px",
                        color: COLORS.textColorDark,
                        borderRadius: 16,
                        border: "1px solid",
                        borderColor: COLORS.textColorDark,
                        display: "flex",
                        fontSize: FONT_SIZE.HEADING_4,
                      }}
                    >
                      {q}
                    </Typography.Text>
                  </Flex>
                );
              })
            : null}
        </Flex>

        {/* Past Interactions */}
        {livThread.map((thread, index) =>
          renderMessageThread(thread.question, thread.answer)
        )}
        {/* {livThread.length > 0 &&
          renderMessageThread(
            livThread[livThread.length - 1].question,
            livThread[livThread.length - 1].answer
          )} */}

        {/* Current Question & Answer (Only show while processing) */}
        {queryProcessing &&
          currentQuestion &&
          renderMessageThread(currentQuestion, details || "", true)}

        {/* Dynamic Content */}
        {projectId ||
        (projectsList && projectsList.length) ||
        (drivers && drivers.length) ? (
          <Flex
            vertical
            style={{
              marginBottom: 16,
              borderRadius: isMobile ? 0 : 4,
              marginTop: 16,
              padding: "24px 0",
              backgroundColor: COLORS.bgColorMedium,
              border: "1px solid",
              borderColor: COLORS.borderColorMedium,
              boxShadow:
                "inset 0 10px 10px -10px #ccc, inset 0 -10px 10px -10px #ccc",
            }}
          >
            {projectId || (projectsList && projectsList.length) ? (
              <Flex
                align="flex-start"
                gap={8}
                style={{
                  alignItems: "center",
                  marginBottom: 16,
                  padding: "0 8px",
                }}
              >
                {!projectId ? (
                  queryProcessing ? (
                    <Spin indicator={<LoadingOutlined spin />} size="small" />
                  ) : projectsList && projectsList.length ? (
                    <Typography.Text style={{ color: COLORS.textColorLight }}>
                      Showing {Math.min(projectsList.length, 20)} projects
                    </Typography.Text>
                  ) : null
                ) : null}
                <Button
                  size="small"
                  icon={
                    !toggleMapView ? (
                      <DynamicReactIcon
                        iconName="FaMap"
                        color="primary"
                        iconSet="fa"
                        size={16}
                      ></DynamicReactIcon>
                    ) : (
                      <DynamicReactIcon
                        iconName="FaRegListAlt"
                        iconSet="fa"
                        size={16}
                        color="primary"
                      ></DynamicReactIcon>
                    )
                  }
                  style={{
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: FONT_SIZE.SUB_TEXT,
                    marginLeft: "auto",
                    height: 28,
                  }}
                  onClick={() => {
                    setToggleMapView(!toggleMapView);
                  }}
                >
                  {toggleMapView ? (projectId ? "Gallery" : "List") : "Map"}{" "}
                  View
                </Button>
              </Flex>
            ) : null}
            {projectId ? (
              !toggleMapView ? (
                <Flex style={{ padding: "0 8px" }}>
                  <ProjectCard
                    project={projects!.find((p: any) => p._id == projectId)!}
                    showClick={false}
                    fullWidth={true}
                  ></ProjectCard>
                </Flex>
              ) : (
                <Flex
                  style={{
                    width: (isMobile ? window.innerWidth : MAX_WIDTH) - 16,
                    minHeight: 600,
                  }}
                >
                  <MapView
                    projectId={projectId}
                    projects={[projects!.find((p: any) => p._id == projectId)!]}
                    drivers={drivers}
                    onProjectClick={(clickedProjectId: string) => {
                      setProjectId(clickedProjectId);
                      setCurrentQuestion("");
                      handleRequest(
                        `summarize this project - ${clickedProjectId}`
                      );
                    }}
                  />
                </Flex>
              )
            ) : projectsList && projectsList.length ? (
              !toggleMapView ? (
                <Flex style={{ padding: "0 8px" }}>
                  <ProjectsViewV2
                    projects={refineProjectList(projectsList).slice(0, 20)}
                    projectClick={(projectId: string, projectName: string) => {
                      setCurrentQuestion(`more about ${projectName}`);
                      setQueryProcessing(true);
                      handleRequest(`summarize this project - ${projectId}`);
                    }}
                  ></ProjectsViewV2>
                </Flex>
              ) : (
                <Flex
                  style={{
                    width: isMobile ? window.innerWidth : MAX_WIDTH,
                    minHeight: 600,
                  }}
                >
                  <MapView
                    projects={projectsList}
                    drivers={drivers}
                    onProjectClick={(clickedProjectId: string) => {
                      setProjectId(clickedProjectId);
                      setCurrentQuestion("");
                      handleRequest(
                        `summarize this project - ${clickedProjectId}`
                      );
                    }}
                  />
                </Flex>
              )
            ) : drivers && drivers.length ? (
              <Flex
                style={{
                  width: isMobile ? window.innerWidth : MAX_WIDTH,
                  minHeight: 300,
                }}
              >
                <MapView projects={[]} drivers={drivers} />
              </Flex>
            ) : null}
          </Flex>
        ) : null}
      </Flex>
    );
  };

  return (
    <Flex
      vertical
      style={{
        width: "100%",
      }}
    >
      <Flex vertical style={{ position: "relative", height: "100%" }}>
        {/* Single session of question / answer */}
        {renderQuestionAnswerSection()}

        {/* Prompts & Input */}
        <Flex
          style={{
            justifySelf: "flex-end",
            marginTop: "auto",
            width: "100%",
            position: "fixed",
            bottom: 0,
            paddingBottom: 24,
            maxWidth: 1000,
            paddingTop: 24,
            backgroundColor: "white",
          }}
          vertical
        >
          {!queryProcessing && (projectId || !currentQuestion) ? (
            <Flex
              style={{
                overflowX: "scroll",
                whiteSpace: "nowrap",
                marginBottom: 16,
                scrollbarWidth: "none",
                padding: isMobile ? "0 16px" : 0,
              }}
              gap={8}
              align={isMobile ? "flex-start" : "center"}
            >
              {(projectId
                ? [
                    "Project amenities",
                    "Explain cost structure",
                    "How is the location ?",
                  ]
                : []
              ).map((q) => {
                return (
                  <Typography.Text
                    onClick={() => {
                      if (selectedProjectPredefinedQuestion == q) {
                        return;
                      }
                      setCurrentQuestion(q);
                      setSelectedProjectPredefinedQuestion(q);
                      setQueryProcessing(true);
                      handleRequest(q);
                    }}
                    style={{
                      cursor: "pointer",
                      backgroundColor: "white",
                      padding: "4px 12px",
                      color: COLORS.textColorDark,
                      borderRadius: 16,
                      border: "1px solid",
                      borderColor: COLORS.textColorDark,
                      display: "flex",
                      fontSize: FONT_SIZE.PARA,
                    }}
                  >
                    {q}
                  </Typography.Text>
                );
              })}
            </Flex>
          ) : null}

          <Form
            form={form}
            onFinish={async (value) => {
              form.resetFields();
              const { question } = value;
              setCurrentQuestion(question);
              setQueryProcessing(true);
              handleRequest(question);
            }}
          >
            <Form.Item label="" name="question" style={{ marginBottom: 0 }}>
              <Input
                disabled={queryProcessing}
                style={{
                  height: 50,
                  paddingRight: 0,
                  backgroundColor: "white",
                  border: "1px solid",
                  borderColor: COLORS.borderColorMedium,
                  borderRadius: 16,
                  width: isMobile ? "95%" : "100%",
                  marginLeft: isMobile ? "2.5%" : 0,
                  fontSize: FONT_SIZE.HEADING_3,
                }}
                name="query"
                onChange={(event: any) => {
                  setQuery(event.currentTarget.value);
                }}
                placeholder="I am Liv. How can I help ?"
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
                    disabled={!query || queryProcessing}
                    style={{
                      opacity: query ? 1 : 0.3,
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
  );
});

export default LivV3;
