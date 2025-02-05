import { LoadingOutlined } from "@ant-design/icons";
import { Button, Flex, Form, Input, message, Spin, Typography } from "antd";
import { makeStreamingJsonRequest } from "http-streaming-request";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
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
  // Implement ref methods
  useEffect(() => {
    if (ref) {
      (ref as any).current = {
        summarizeProject: (projectId: string) => {
          setQuestion("");
          setProjectId(projectId);
          handleRequest(`summarize this project - ${projectId}`);
        },
      };
    }
  }, [ref]);
  const [projectsList, setProjectsList] = useState<any>([]);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<string>("");

  const { data: projects, isLoading: projectIsLoading } = useFetchProjects();

  const [sessionId, setSessionId] = useState<string>();
  const [queryProcessing, setQueryProcessing] = useState<boolean>(false);

  const { user } = useUser();

  const [question, setQuestion] = useState<string>();
  const { isMobile } = useDevice();
  const [query, setQuery] = useState<string>();
  const [form] = Form.useForm();
  const [followUp, setFollowUp] = useState<string[]>([]);
  const [livThread, setLivThread] = useState<
    Array<{ question: string; answer: any }>
  >([]);

  const [details, setDetails] = useState<string>();
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
      setSessionId(user._id);
      fetchHistory(user._id);
    }
  }, [user]);

  const fetchHistory = async (historySessionId: string) => {
    const response = await axiosApiInstance.post("/ai/history", {
      sessionId: historySessionId,
    });
    console.log(response);
  };

  /**
   * Filters ai curated projects and adds original project info.
   * @param curatedProjects
   */
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

  const handleRequest = async (question: string) => {
    try {
      captureAnalyticsEvent("question-asked", { projectId, question });
      setQueryProcessing(true);
      setProjectsList([]);
      setDrivers([]);
      setDetails("...");

      const stream = makeStreamingJsonRequest({
        url: `${baseApiUrl}ai/ask-stream`,
        method: "POST",
        payload: { question, sessionId, projectId },
      });

      let finalAnswer = "";
      for await (const data of stream) {
        console.log("received stream response: ", JSON.stringify(data));
        const answerObj = data;

        if (answerObj.details) {
          setDetails(answerObj.details);
          finalAnswer = answerObj.details;
        }
        if (answerObj.followUp) setFollowUp(answerObj.followUp);

        if (answerObj.projectId && !projectId) {
          setProjectId(answerObj.projectId);
        } else if (answerObj.drivers?.length) {
          setProjectId("");
          setDrivers(answerObj.drivers);
        } else if (answerObj.projects?.length) {
          setProjectId("");
          setProjectsList(answerObj.projects);
        }
      }

      console.log("Streaming completed");
      setLivThread((prev) => [...prev, { question, answer: finalAnswer }]);
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

  return (
    <Flex
      vertical
      style={{
        width: "100%",
      }}
    >
      <Flex vertical style={{ position: "relative", height: "100%" }}>
        {livThread.length === 0 && !queryProcessing && (
          <Markdown className="liviq-content">{PlaceholderContent}</Markdown>
        )}

        {/* Single session of question / answer */}
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
          {/* Past Interactions */}
          {livThread.map((thread, index) => (
            <Flex
              key={index}
              vertical
              style={{ marginBottom: 16, padding: isMobile ? "0 16px" : 0 }}
            >
              <Typography.Text
                style={{
                  backgroundColor: COLORS.textColorDark,
                  padding: "4px 12px",
                  borderRadius: 16,
                  border: "1px solid",
                  color: "white",
                  borderColor: COLORS.borderColorMedium,
                  display: "inline",
                  alignSelf: "flex-start",
                  marginTop: 8,
                  marginBottom: 8,
                }}
              >
                {thread.question}
              </Typography.Text>
              <Flex style={{ padding: isMobile ? "0 16px" : 0 }} vertical>
                <Markdown className="liviq-content">
                  {thread.answer || ""}
                </Markdown>
              </Flex>
            </Flex>
          ))}

          {/* Current Question & Answer (Only show while processing) */}
          {queryProcessing && question && (
            <Flex vertical style={{ marginBottom: 16 }}>
              {/* Question */}
              <Flex
                align="center"
                gap={8}
                style={{ padding: isMobile ? "0 16px" : 0 }}
              >
                <img
                  src="/images/liv-streaming.gif"
                  style={{
                    height: 28,
                    width: 28,
                  }}
                />
                <Typography.Text
                  style={{
                    backgroundColor: COLORS.bgColor,
                    padding: "4px 12px",
                    borderRadius: 16,
                    border: "1px solid",
                    color: COLORS.textColorLight,
                    borderColor: COLORS.borderColorMedium,
                    display: "inline",
                    marginTop: 8,
                    marginBottom: 8,
                  }}
                >
                  {question}
                </Typography.Text>
              </Flex>
              {/* Answer */}
              {details && (
                <Flex style={{ padding: isMobile ? "0 16px" : 0 }} vertical>
                  <Markdown className="liviq-content">{details}</Markdown>
                </Flex>
              )}
            </Flex>
          )}

          <Flex
            style={{ flexWrap: "wrap", marginTop: 0, marginBottom: 16 }}
            gap={16}
          >
            {!projectId && !details
              ? [
                  "Show me farmlands near Nandi Hills",
                  "How are the schools in the area ?",
                  "Properties with rental income ? ",
                ].map((q, index) => {
                  return (
                    <Flex key={index}>
                      <Typography.Text
                        onClick={() => {
                          if (selectedProjectPredefinedQuestion == q) {
                            return;
                          }
                          setQuestion(q);
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
                      projects={[
                        projects!.find((p: any) => p._id == projectId)!,
                      ]}
                      drivers={drivers}
                      onProjectClick={() => {}}
                    />
                  </Flex>
                )
              ) : projectsList && projectsList.length ? (
                !toggleMapView ? (
                  <Flex style={{ padding: "0 8px" }}>
                    <ProjectsViewV2
                      projects={refineProjectList(projectsList).slice(0, 20)}
                      projectClick={(
                        projectId: string,
                        projectName: string
                      ) => {
                        setQuestion(`more about ${projectName}`);
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
                      onProjectClick={() => {
                        setQuestion("");
                        handleRequest(`summarize this project - ${projectId}`);
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
                  <MapView projects={[]} drivers={drivers} />{" "}
                </Flex>
              ) : null}
            </Flex>
          ) : null}
        </Flex>

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
          {!queryProcessing && (projectId || !question) ? (
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
                      setQuestion(q);
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
              setQuestion(question);
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
