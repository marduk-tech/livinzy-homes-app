import { Button, Flex, Form, Input, message, Typography } from "antd";
import Markdown from "react-markdown";
import DynamicReactIcon from "./common/dynamic-react-icon";
import {
  forwardRef,
  Ref,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { captureAnalyticsEvent } from "../libs/lvnzy-helper";
import { useUser } from "../hooks/use-user";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { useDevice } from "../hooks/use-device";
import { makeStreamingJsonRequest } from "http-streaming-request";
import { baseApiUrl, PlaceholderContent } from "../libs/constants";

interface Answer {
  directAnswer?: string;
  areaInfo: {
    summary: string;
    details: string;
  };
  projectsList: {
    projects: any[];
    summary: string;
  };
  projectInfo: {
    summary: string;
    details: string;
  };
}
interface LivProps {
  projectId?: string;
  onNewProjectContent?: any;
  onDriversContent: any;
}

export interface LivRef {
  summarizeProject: (projectId: string) => void;
}

const Liv = forwardRef((livProps: LivProps, ref: Ref<LivRef>) => {
  const { projectId, onNewProjectContent, onDriversContent } = livProps;
  const [sessionId, setSessionId] = useState<string>();
  const [queryProcessing, setQueryProcessing] = useState<boolean>(false);

  const { user } = useUser();

  const [question, setQuestion] = useState<string>();
  const { isMobile } = useDevice();
  const [query, setQuery] = useState<string>();
  const [form] = Form.useForm();
  const [followUp, setFollowUp] = useState<string[]>([]);

  const [currentProjectId, setCurrentProjectId] = useState("");
  const [details, setDetails] = useState<string>();
  const [drivers, setDrivers] = useState<string[]>([]);

  const [messageApi, contextHolder] = message.useMessage();

  const [
    selectedProjectPredefinedQuestion,
    setSelectedProjectPredefinedQuestion,
  ] = useState<string>();

  useEffect(() => {
    if (user && user?._id) {
      setSessionId(user._id);
    }
  }, [user]);

  useImperativeHandle(ref, () => ({
    summarizeProject(projectId: string) {
      summarize(projectId);
    },
  }));

  const summarize = (projectId: string) => {
    setQueryProcessing(true);
    setQuestion("");
    setDetails("");
    handleRequest(`summarize this project - ${projectId}`);
  };

  useEffect(() => {
    setCurrentProjectId(projectId || "");
  }, [projectId]);

  const handleRequest = async (question: string) => {
    try {
      captureAnalyticsEvent("question-asked", {
        projectId: projectId,
        question: question,
      });
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
            console.log(answerObj.projectId);
            if (!currentProjectId) {
              setCurrentProjectId(answerObj.projectId);
            }
          } else if (answerObj.drivers && answerObj.details) {
            setQueryProcessing(false);
            if (answerObj.drivers) {
              setDrivers(answerObj.drivers);
              onDriversContent(answerObj.drivers);
            }
          } else if (
            answerObj &&
            !!answerObj.projects &&
            !!answerObj.projects.length &&
            onNewProjectContent
          ) {
            if (answerObj.projects) {
              onNewProjectContent(answerObj.projects);
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

      /**
       * WITHOUT STREAM
      const response = await axiosApiInstance.post("/ai/ask-global", {
        question: question,
        sessionId: sessionId,
        projectId,
      });

      if (response.data && response.data.data) {
        setQueryProcessing(false);
        let answerObj = JSON.parse(response.data.data.answer);

        if (projectId && answerObj.projectInfo.details) {
          setSummary(answerObj.projectInfo.summary);
          setDetails(answerObj.projectInfo.details);
        } else {
          let details = "",
            summary = "";
          if (answerObj.areaInfo && answerObj.areaInfo.details) {
            summary = answerObj.areaInfo.summary;
            details = answerObj.areaInfo.details;
            setDrivers(answerObj.areaInfo.drivers);
            onDriversContent(answerObj.areaInfo.drivers);
          }
          if (
            answerObj &&
            !!answerObj.projectsList &&
            !!answerObj.projectsList.projects &&
            !!answerObj.projectsList.projects.length &&
            onNewProjectContent
          ) {
            summary = summary || answerObj.projectsList.summary;
            details += details
              ? `\n\n${answerObj.projectsList.summary}`
              : answerObj.projectsList.details;
            onNewProjectContent(
              answerObj.projectsList.projects,
              answerObj.projectsList.categories
            );
          }
          setSummary(summary);
          setDetails(details);
        }
      }
         */
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
            maxHeight: window.innerHeight - 550,
            overflowY: "scroll",
            scrollbarWidth: "none",
          }}
        >
          {currentProjectId || !question ? (
            <Flex
              style={{ flexWrap: "wrap", marginBottom: 8 }}
              vertical={isMobile}
              gap={8}
              align={isMobile ? "flex-start" : "center"}
            >
              <Typography.Text style={{ color: COLORS.textColorLight }}>
                How can I help ?
              </Typography.Text>
              <Flex style={{ flexWrap: "wrap" }} gap={8}>
                {(currentProjectId
                  ? ["Amenities", "Cost Structure", "Location"]
                  : [
                      "Show villa Projects",
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
                        setSelectedProjectPredefinedQuestion(q);
                        setQueryProcessing(true);
                        handleRequest(
                          currentProjectId
                            ? `more about ${q} for this project`
                            : q
                        );
                      }}
                      style={{
                        cursor: "pointer",
                        backgroundColor:
                          selectedProjectPredefinedQuestion == q
                            ? COLORS.primaryColor
                            : "white",
                        padding: "4px 12px",
                        color:
                          selectedProjectPredefinedQuestion == q
                            ? "white"
                            : COLORS.textColorDark,
                        borderRadius: 16,
                        border: "1px solid",
                        borderColor: COLORS.primaryColor,
                        display: "flex",
                      }}
                    >
                      {q}
                    </Typography.Text>
                  );
                })}
              </Flex>
            </Flex>
          ) : null}

          <Flex align="flex-end" gap={8} style={{ marginTop: 8 }}>
            {question ? (
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

          <Typography.Text
            style={{ opacity: queryProcessing ? 0.8 : 1, marginTop: 8 }}
          >
            <Markdown className="liviq-content">
              {currentProjectId ? details || "" : details || PlaceholderContent}
            </Markdown>
            {currentProjectId && currentProjectId !== projectId ? (
              <Button>See Project Details</Button>
            ) : null}
            {/* {drivers && drivers.length ? (
              <Tag onClick={() => {}}>See these places on a map</Tag>
            ) : null} */}
          </Typography.Text>
        </Flex>
        <Flex
          style={{
            width: "100%",
            justifySelf: "flex-end",
            marginTop: "auto",
          }}
        >
          <Form
            form={form}
            style={{
              width: isMobile ? "95%" : "100%",
              position: "fixed",
              bottom: 24,
              maxWidth: 1000,
            }}
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
                  fontSize: FONT_SIZE.HEADING_3,
                }}
                name="query"
                onChange={(event: any) => {
                  setQuery(event.currentTarget.value);
                }}
                placeholder="Ask here"
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
        {queryProcessing ? (
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
        ) : null}
      </Flex>
    </Flex>
  );
});

export default Liv;
