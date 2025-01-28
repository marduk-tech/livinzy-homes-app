import { Button, Flex, Form, Input, message, Spin, Typography } from "antd";
import Markdown from "react-markdown";
import DynamicReactIcon from "./common/dynamic-react-icon";
import { forwardRef, useEffect, useState } from "react";
import { captureAnalyticsEvent } from "../libs/lvnzy-helper";
import { useUser } from "../hooks/use-user";
import { COLORS, FONT_SIZE, MAX_WIDTH } from "../theme/style-constants";
import { useDevice } from "../hooks/use-device";
import { makeStreamingJsonRequest } from "http-streaming-request";
import { baseApiUrl, PlaceholderContent } from "../libs/constants";
import { useFetchProjects } from "../hooks/use-project";
import ProjectsViewV2 from "./projects-view-v2";
import { ProjectCard } from "./common/project-card";
import { LoadingOutlined } from "@ant-design/icons";
import { MapView } from "./map-view/map-view";
import { axiosApiInstance } from "../libs/axios-api-Instance";
const { Paragraph } = Typography;

interface AICuratedProject {
  projectId: string;
  relevancyScore: number;
  relevantDetails: string;
}

export interface LivRef {
  summarizeProject: (projectId: string) => void;
}

const LivV2 = forwardRef(() => {
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

  const [details, setDetails] = useState<string>();

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

  const handleRequest = async (question: string) => {
    try {
      captureAnalyticsEvent("question-asked", {
        projectId: projectId,
        question: question,
      });
      setProjectsList([]);
      setDrivers([]);
      setDetails("...");
      const stream = makeStreamingJsonRequest({
        url: `${baseApiUrl}ai/ask-stream`,
        method: "POST",
        payload: {
          question: question,
          sessionId: sessionId,
          projectId,
        },
      });
      let isStreaming = false,
        streamingTimer;
      try {
        for await (const data of stream) {
          console.log("received stream response: ", JSON.stringify(data));
          const answerObj = data;

          setDetails(answerObj.details);
          setFollowUp(answerObj.followUp || []);

          isStreaming = true;
          if (streamingTimer) {
            clearTimeout(streamingTimer);
          }
          streamingTimer = setTimeout(() => {
            isStreaming = false;
            setQueryProcessing(false);
          }, 2000);

          if (answerObj.projectId) {
            if (!projectId) {
              setProjectId(answerObj.projectId);
            }
          } else if (answerObj.drivers && answerObj.details) {
            if (answerObj.drivers) {
              setProjectId("");
              setDrivers(answerObj.drivers);
            }
          } else if (
            answerObj &&
            !!answerObj.projects &&
            !!answerObj.projects.length
          ) {
            if (answerObj.projects) {
              setProjectId("");
              // When projects are filtered by AI, use the new list to filter existing projects.
              const newProjects: any = [];
              const aiProjects = answerObj.projects || [];
              console.log(`Total projects curated: ${aiProjects.length}`);
              aiProjects.forEach((p: AICuratedProject) => {
                if (p.relevancyScore >= 3) {
                  newProjects.push({
                    ...projects!.find((op: any) => op._id == p.projectId),
                    ...p,
                  });
                }
              });
              console.log(`Total projects filtered: ${newProjects.length}`);
              newProjects.sort((a: any, b: any) => {
                return (b.relevancyScore || 0) - (a.relevancyScore || 0);
              });
              setProjectsList(newProjects);
              setDrivers([]);
            }
          }
        }
      } catch (err) {
        if (selectedProjectPredefinedQuestion) {
          setSelectedProjectPredefinedQuestion(undefined);
        }
        messageApi.open({
          type: "error",
          content: "Oops. Can you please try again ?",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      return {
        content: new Response(
          "Sorry, there was an error processing your request."
        ),
        success: false,
      };
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
        <Flex
          vertical
          style={{
            height: window.innerHeight - 60,
            overflowY: "scroll",
            scrollbarWidth: "none",
            paddingBottom: 150,
          }}
        >
          {/* Question Asked **/}
          <Flex
            align="flex-end"
            gap={8}
            style={{ marginTop: 8, padding: isMobile ? "0 16px" : 0 }}
          >
            {queryProcessing ? (
              <Flex
                align="center"
                gap={8}
                style={{
                  backgroundColor: COLORS.bgColor,
                  padding: "4px 12px",
                  borderRadius: 16,
                  border: "1px solid",
                  borderColor: COLORS.borderColorMedium,
                  marginTop: 8,
                  marginBottom: 8,
                }}
              >
                <img
                  src="/images/liv-streaming.gif"
                  style={{
                    height: 28,
                    width: 28,
                  }}
                />
                <Paragraph
                  style={{ margin: 0, color: COLORS.textColorLight }}
                  ellipsis={{ rows: 1, expandable: false }}
                >
                  {question}
                </Paragraph>
              </Flex>
            ) : question ? (
              <Typography.Text
                style={{
                  backgroundColor: COLORS.textColorDark,
                  padding: "4px 12px",
                  borderRadius: 16,
                  border: "1px solid",
                  color: "white",
                  borderColor: COLORS.borderColorMedium,
                  display: "inline",
                  alignSelf: "flex-end",
                  marginTop: 8,
                  marginBottom: 8,
                }}
              >
                {question}
              </Typography.Text>
            ) : null}
          </Flex>

          {/* Main AI Reply */}
          <Flex style={{ padding: isMobile ? "0 16px" : 0 }}>
            <Markdown className="liviq-content">
              {projectId ? details || "" : details || PlaceholderContent}
            </Markdown>
          </Flex>

          {/* Dynamic Content */}
          <Flex
            vertical
            style={{
              marginBottom: 16,
              borderRadius: isMobile ? 0 : 4,
              marginTop: 16,
              padding: "24px 8px",
              backgroundColor: COLORS.bgColorMedium,
              boxShadow:
                "inset 0 10px 10px -10px #ccc, inset 0 -10px 10px -10px #ccc",
            }}
          >
            {projectId || (projectsList && projectsList.length) ? (
              <Flex
                align="flex-start"
                gap={8}
                style={{ alignItems: "center", marginBottom: 16 }}
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
                <ProjectCard
                  project={projects!.find((p: any) => p._id == projectId)!}
                  showClick={false}
                  fullWidth={true}
                ></ProjectCard>
              ) : (
                <Flex
                  style={{
                    width: (isMobile ? window.innerWidth : MAX_WIDTH) - 16,
                    minHeight: 300,
                  }}
                >
                  <MapView
                    projectId={projectId}
                    projects={[projects!.find((p: any) => p._id == projectId)!]}
                    drivers={drivers}
                    onProjectClick={() => {}}
                  />
                </Flex>
              )
            ) : projectsList && projectsList.length ? (
              !toggleMapView ? (
                <ProjectsViewV2
                  projects={projectsList.slice(0, 20)}
                  projectClick={(projectId: string, projectName: string) => {
                    setQuestion(`more about ${projectName}`);
                    setQueryProcessing(true);
                    handleRequest(`summarize this project - ${projectId}`);
                  }}
                ></ProjectsViewV2>
              ) : (
                <Flex
                  style={{
                    width: (isMobile ? window.innerWidth : MAX_WIDTH) - 16,
                    minHeight: 300,
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
                  width: (isMobile ? window.innerWidth : MAX_WIDTH) - 16,
                  minHeight: 300,
                }}
              >
                <MapView projects={[]} drivers={drivers} />{" "}
              </Flex>
            ) : null}
          </Flex>
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
                : [
                    "Show me villa projects",
                    "Find homes near Nandi Hills",
                    "Properties with rental income ? ",
                  ]
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
                placeholder="How can I help ?"
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
        {/* {queryProcessing ? (
          <img
            src={
              !queryProcessing
                ? "/images/liv-icon-dark.png"
                : "/images/liv-icon-gif.gif"
            }
            style={{
              height: 56,
              width: 56,
              position: "absolute",
              top: "calc(50% - 28px)",
              left: "calc(50% - 28px)",
            }}
          />
        ) : null} */}
      </Flex>
    </Flex>
  );
});

export default LivV2;
