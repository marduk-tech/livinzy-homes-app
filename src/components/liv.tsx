import { Button, Flex, Form, Input, Typography } from "antd";
import Markdown from "react-markdown";
import DynamicReactIcon from "./common/dynamic-react-icon";
import { useEffect, useState } from "react";
import { captureAnalyticsEvent } from "../libs/lvnzy-helper";
import { useUser } from "../hooks/use-user";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { COLORS } from "../theme/style-constants";
import { useDevice } from "../hooks/use-device";

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
}: {
  projectId?: string;
  onNewProjectContent?: any;
}) {
  const [sessionId, setSessionId] = useState<string>();
  const [queryProcessing, setQueryProcessing] = useState<boolean>(false);
  const { user } = useUser();
  const [answer, setAnswer] = useState<Answer>();
  const [projectAnswer, setProjectAnswer] = useState<string>();

  const [question, setQuestion] = useState<string>();
  const [minimized, setMinimized] = useState(false);
  const { isMobile } = useDevice();
  const [query, setQuery] = useState<string>();
  const [form] = Form.useForm();

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

      const response = await axiosApiInstance.post(
        projectId ? "/ai/ask" : "/ai/ask-global",
        {
          question: question,
          sessionId: sessionId,
          project: {
            id: projectId || "",
          },
        }
      );

      if (response.data && response.data.data) {
        setQueryProcessing(false);
        if (projectId) {
          setProjectAnswer(response.data.data.answer);
        } else {
          let answerObj = JSON.parse(response.data.data.answer);
          setAnswer(answerObj);
          if (
            answerObj &&
            !!answerObj.projectsList &&
            !!answerObj.projectsList.projects &&
            !!answerObj.projectsList.projects.length &&
            onNewProjectContent
          ) {
            onNewProjectContent(answerObj.projectsList.projects);
          }
        }
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
        height: isMobile ? (minimized ? "auto" : 400) : "calc(100vh - 150px)",
      }}
    >
      <Flex>
        <Flex align="center" gap={8}>
          <DynamicReactIcon
            iconName="GiOilySpiral"
            iconSet="gi"
          ></DynamicReactIcon>
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
            {question || "How can I help ?"}
          </Typography.Text>
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
        <Flex style={{ position: "relative", height: "100%" }}>
          <Flex vertical style={{ maxHeight: 550, overflowY: "scroll" }}>
            <Typography.Title
              level={5}
              style={{ opacity: queryProcessing ? 0.8 : 1, marginTop: 16 }}
            >
              {projectAnswer || answer
                ? projectAnswer && projectId
                  ? "Project - XXX "
                  : answer?.directAnswer
                  ? "Sure"
                  : answer?.areaInfo
                  ? answer?.areaInfo.summary
                  : "Uh Ho!"
                : ""}
            </Typography.Title>
            <Typography.Text style={{ opacity: queryProcessing ? 0.8 : 1 }}>
              <Markdown className="liviq-content">
                {projectAnswer || answer
                  ? projectAnswer && projectId
                    ? projectAnswer
                    : answer?.directAnswer
                    ? answer.directAnswer
                    : answer?.areaInfo
                    ? answer?.areaInfo.details
                    : "I completely blank on this! Try again ?"
                  : ""}
              </Markdown>
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
