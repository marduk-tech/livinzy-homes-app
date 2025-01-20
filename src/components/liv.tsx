import { Button, Flex, Form, Input, Tag, Typography } from "antd";
import Markdown from "react-markdown";
import DynamicReactIcon from "./common/dynamic-react-icon";
import { useEffect, useState } from "react";
import { captureAnalyticsEvent } from "../libs/lvnzy-helper";
import { useUser } from "../hooks/use-user";
import { COLORS } from "../theme/style-constants";
import { useDevice } from "../hooks/use-device";
import { makeStreamingJsonRequest } from "http-streaming-request";
import { baseApiUrl } from "../libs/constants";

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
const DUMMY_RESPONSE = {
  generalInfo: {
    summary:
      "Here are the matching farmland projects in North Bengaluru based on your query.",
    details:
      "Several farmland and agricultural-themed projects are available in North Bengaluru, offering a mix of residential plots and agricultural land. These projects are situated near key drivers like the KIADB Aerospace SEZ, University of Agricultural Sciences, and various tech parks, providing good connectivity and potential for growth.",
  },
  projectsList: [
    {
      projectId: "67176fde82dd14792342e80f",
      projectName: "Sylvan Retreat",
      relevantDetails:
        "58 acre project with 25 acres dedicated to farmland. Features existing 10-year-old mango plantation, fruit trees, and plans for beekeeping and cattle farming.",
    },
    {
      projectId: "66f645413696885ef13d55ce",
      projectName: "Aranyam Phase 1",
      relevantDetails:
        "Large 113 acre project suitable for farmland development.",
    },
    {
      projectId: "6721a597990ab34103aeb9d9",
      projectName: "Orchard Valley",
      relevantDetails:
        "30 acre project with well-planted trees and landscaping, suitable for orchard or farmland development.",
    },
    {
      projectId: "676e91a6dccff80d381d0270",
      projectName: "The Midsummer Rain",
      relevantDetails:
        "Features regenerative agriculture with butterfly garden, aromatic garden, and fruit orchards. Adjacent to a 200-acre natural lake.",
    },
  ],
  tool_calls: [],
  invalid_tool_calls: [],
  additional_kwargs: {},
  response_metadata: {},
};

export default function Liv({
  projectId,
  onNewProjectContent,
  onDriversContent,
}: {
  projectId?: string;
  onNewProjectContent?: any;
  onDriversContent: any;
}) {
  const [sessionId, setSessionId] = useState<string>();
  const [queryProcessing, setQueryProcessing] = useState<boolean>(false);

  const { user } = useUser();
  const [projectAnswer, setProjectAnswer] = useState<string>();

  const [question, setQuestion] = useState<string>();
  const [minimized, setMinimized] = useState(false);
  const { isMobile } = useDevice();
  const [query, setQuery] = useState<string>();
  const [form] = Form.useForm();

  const [details, setDetails] = useState<string>();
  const [summary, setSummary] = useState<string>();

  const [drivers, setDrivers] = useState<string[]>([]);

  useEffect(() => {
    if (user && user?._id) {
      setSessionId(user._id);
    }
  }, [user]);
  useEffect(() => {
    if (!projectId) {
      setProjectAnswer(undefined);
      setQuestion(undefined);
    }
  }, [projectId]);

  const handleRequest = async (question: string) => {
    try {
      captureAnalyticsEvent("question-asked", {
        projectId: projectId,
        question: question,
      });
      setQueryProcessing(true);
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
      for await (const data of stream) {
        const answerObj = data;

        if (projectId && answerObj.projectInfo.details) {
          setSummary(answerObj.projectInfo.summary);
          setDetails(answerObj.projectInfo.details);
        } else {
          let details = "",
            summary = "";
          if (answerObj.areaInfo && answerObj.areaInfo.details) {
            summary = answerObj.areaInfo.summary;
            details = answerObj.areaInfo.details;
            setQueryProcessing(false);

            if (answerObj.areaInfo.drivers) {
              setDrivers(answerObj.areaInfo.drivers);
              onDriversContent(answerObj.areaInfo.drivers);
            }
          }
          if (
            answerObj &&
            !!answerObj.projectsList &&
            !!answerObj.projectsList.projects &&
            !!answerObj.projectsList.projects.length &&
            onNewProjectContent
          ) {
            isStreaming = true;
            if (streamingTimer) {
              clearTimeout(streamingTimer);
            }
            streamingTimer = setTimeout(() => {
              isStreaming = false;
              onNewProjectContent(answerObj.projectsList.projects, isStreaming);
            }, 2000);

            summary = summary || answerObj.projectsList.summary;
            details += details
              ? `\n\n${answerObj.projectsList.summary}`
              : answerObj.projectsList.details;
            setQueryProcessing(false);

            if (answerObj.projectsList.projects) {
              onNewProjectContent(answerObj.projectsList.projects, isStreaming);
            }
          }
          setSummary(summary);
          setDetails(details);
        }
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
        height: isMobile ? (minimized ? "auto" : 400) : "calc(100vh - 150px)",
      }}
    >
      <Flex>
        <Flex align="flex-start" gap={8}>
          <DynamicReactIcon
            iconName="GiOilySpiral"
            iconSet="gi"
            size={32}
          ></DynamicReactIcon>
          {question ? (
            <Typography.Text
              style={{
                backgroundColor: COLORS.bgColor,
                padding: "4px 12px",
                borderRadius: 16,
                border: "1px solid",
                borderColor: COLORS.borderColorMedium,
                display: "inline",
              }}
            >
              {question}
            </Typography.Text>
          ) : (
            <Flex vertical gap={8}>
              <Flex>
                <Typography.Text
                  style={{
                    backgroundColor: COLORS.textColorDark,
                    padding: "4px 12px",
                    borderRadius: 16,
                    border: "1px solid",
                    borderColor: COLORS.borderColorMedium,
                    color: "white",
                    display: "flex",
                  }}
                >
                  {"I am your AI Expert for North Bengaluru Real Estate"}
                </Typography.Text>
              </Flex>
              <Flex>
                <Typography.Text
                  style={{
                    backgroundColor: COLORS.textColorDark,
                    padding: "4px 12px",
                    borderRadius: 16,
                    display: "flex",
                    border: "1px solid",
                    color: "white",
                    borderColor: COLORS.borderColorMedium,
                  }}
                >
                  I can assist you with insights about the area including
                  schools, infra etc. as well as with finding your dream home.
                  How can I help you today ?
                </Typography.Text>
              </Flex>
            </Flex>
          )}
        </Flex>
        {isMobile && (
          <Button
            size="small"
            type="default"
            onClick={() => {
              setMinimized(!minimized);
            }}
            style={{
              padding: 0,
              height: 32,
              width: 32,
              marginLeft: "auto",
              border: "1px solid",
              borderColor: COLORS.borderColorMedium,
            }}
            icon={
              <DynamicReactIcon
                iconName={minimized ? "IoExpand" : "FiMinimize2"}
                iconSet={minimized ? "io5" : "fi"}
                size={16}
              ></DynamicReactIcon>
            }
          ></Button>
        )}
      </Flex>
      {!minimized && (
        <Flex vertical style={{ position: "relative", height: "100%" }}>
          <Flex vertical style={{ maxHeight: 550, overflowY: "scroll" }}>
            <Typography.Title
              level={5}
              style={{ opacity: queryProcessing ? 0.8 : 1, marginTop: 16 }}
            >
              {summary}
            </Typography.Title>
            <Typography.Text style={{ opacity: queryProcessing ? 0.8 : 1 }}>
              <Markdown className="liviq-content">{details}</Markdown>
              {drivers && drivers.length ? (
                <Tag onClick={() => {}}>See these places on a map</Tag>
              ) : null}
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
              style={{ width: "100%" }}
              onFinish={async (value) => {
                form.resetFields();
                const { question } = value;
                setQuestion(question);
                handleRequest(question);
              }}
            >
              <Form.Item label="" name="question" style={{ marginBottom: 0 }}>
                <Input
                  style={{
                    height: 50,
                    paddingRight: 0,
                    backgroundColor: "white",
                    border: "1px solid",
                    borderColor: COLORS.borderColorMedium,
                    borderRadius: 16,
                  }}
                  name="query"
                  onChange={(event: any) => {
                    setQuery(event.currentTarget.value);
                  }}
                  placeholder="Ask here"
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
      )}
    </Flex>
  );
}
