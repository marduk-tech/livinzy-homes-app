import { Button, Drawer, Flex, Form, Input, message, Typography } from "antd";
import { makeStreamingJsonRequest } from "http-streaming-request";
import {
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "../../hooks/use-user";
import { axiosApiInstance } from "../../libs/axios-api-Instance";
import { baseApiUrl } from "../../libs/constants";
import { captureAnalyticsEvent } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE, MAX_WIDTH } from "../../theme/style-constants";
import DynamicReactIcon from "../common/dynamic-react-icon";
import { Loader } from "../common/loader";
import { sha256 } from "js-sha256";
import LLMText from "../common/llm-answer";
import { useDevice } from "../../hooks/use-device";

const { Paragraph } = Typography;

export interface AICuratedProject {
  projectId: string;
  relevancyScore: number;
  relevantDetails: string;
}

export interface Brick360Props {
  lvnzyProjectId?: string;
  lvnzyProjectsCollection?: string;
  reportContent?: ReactNode;
}
interface BrickfiAssistRef {
  clearChatData: () => void;
}

export interface Brick360Answer {
  answer: string;
}

export interface Brick360Prompts {
  prompts: string[];
}

export const BrickfiAssist = forwardRef<BrickfiAssistRef, Brick360Props>(
  ({ lvnzyProjectId, lvnzyProjectsCollection, reportContent }, ref) => {
    const assistDrawerRef = useRef(null);

    const [currentQuestion, setCurrentQuestion] = useState<string>();
    const [currentAnswer, setCurrentAnswer] = useState<
      Brick360Answer | undefined
    >();

    const [currentSessionId, setCurrentSessionId] = useState<string>(() =>
      uuidv4()
    );
    const [queryStreaming, setQueryStreaming] = useState<boolean>(false);
    const streamingRef = useRef(false); // <-- ref instead of state

    const [drawerFixedContent, setDrawerFixedContent] =
      useState<ReactNode>(reportContent);

    const [loadingLivThread, setLoadingLivThread] = useState(false);
    const [drawerVisibility, setDrawerVisibility] = useState<boolean>(false);

    const { user } = useUser();

    const [form] = Form.useForm();
    const [livThread, setLivThread] = useState<
      Array<{ question: string; answer: any }>
    >([]);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    const [messageApi, contextHolder] = message.useMessage();
    const [followupPrompts, setFollowupPrompts] = useState<Brick360Prompts>({
      prompts: [],
    });
    const { isMobile } = useDevice();

    const [
      selectedProjectPredefinedQuestion,
      setSelectedProjectPredefinedQuestion,
    ] = useState<string>();

    const resetScroll = () => {
      const el = assistDrawerRef.current;
      if (el) {
        setTimeout(() => {
          (el as any).scrollTop = (el as any).scrollHeight;
        }, 100);
      }
    };

    // Expose functions to the parent
    useImperativeHandle(ref, () => ({
      clearChatData: () => {
        setLivThread([]);
        setCurrentQuestion(undefined);
        setCurrentAnswer(undefined);
      },
    }));

    useEffect(() => {
      if (user && lvnzyProjectsCollection) {
        const sessionId = sha256(`${user._id}:${lvnzyProjectsCollection}`);
        setCurrentSessionId(sessionId);
        fetchHistory(sessionId);
      }
    }, [user, lvnzyProjectId, lvnzyProjectsCollection]);

    useEffect(() => {
      if (drawerVisibility) {
        resetScroll();
      } else {
        setDrawerFixedContent(undefined);
      }
    }, [drawerVisibility]);

    useEffect(() => {
      if (reportContent) {
        setDrawerFixedContent(reportContent);
        setDrawerVisibility(true);
      }
    }, [reportContent]);

    // Fetching history for current session
    const fetchHistory = async (historySessionId: string) => {
      try {
        setLoadingLivThread(true);
        const response = await axiosApiInstance.post("/ai/history", {
          sessionId: historySessionId,
        });

        if (response.data?.data && response.data.data.length) {
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
          setLivThread(threads);
        } else {
          if (!followupPrompts.prompts || !followupPrompts.prompts.length) {
            handleLLMRequest(
              lvnzyProjectId
                ? "suggest followup prompts for this single project"
                : "suggest followup prompts for these list of projects",
              true
            );
          }
        }
        setLoadingLivThread(false);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    // Handle LLM stream request
    const handleLLMRequest = async (
      question: string,
      suggestFollowup?: boolean
    ) => {
      if (!question || question.length < 3 || streamingRef.current) {
        return;
      }

      try {
        streamingRef.current = true;

        captureAnalyticsEvent("question-asked", { question });
        setQueryStreaming(true);

        if (currentQuestion) {
          setLivThread((prev) => [
            ...prev,
            { question: currentQuestion!, answer: currentAnswer || {} },
          ]);
        }
        if (!suggestFollowup) {
          setFollowupPrompts({ prompts: [] });
          setDrawerVisibility(true);
          setCurrentQuestion(question);
          setCurrentAnswer({ answer: "..." });
        } else {
          resetScroll();
        }

        const stream = makeStreamingJsonRequest({
          url: `${baseApiUrl}ai/ask-stream-v2`,
          method: "POST",
          payload: {
            question,
            sessionId: currentSessionId,
            userId: user?._id,
            lvnzyProjectsCollection,
            lvnzyProjectId,
            suggestPrompts: !!suggestFollowup,
          },
        });

        if (suggestFollowup) {
          for await (const data of stream) {
            console.log("received stream response: ", JSON.stringify(data));
            setFollowupPrompts(data);
          }
        } else {
          for await (const data of stream) {
            console.log("received stream response: ", JSON.stringify(data));
            setCurrentAnswer(data);
          }
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
        streamingRef.current = false;
        setSelectedProjectPredefinedQuestion(undefined);
      }
    };

    // Render single QA block
    const renderQABlock = (
      q: string,
      a: string,
      currentQuestion: boolean,
      disableClip: boolean
    ) => {
      return (
        <Flex vertical>
          <Flex>
            {queryStreaming && currentQuestion ? (
              <img
                src="/images/liv-streaming.gif"
                style={{
                  height: 28,
                  width: 28,
                }}
              />
            ) : null}
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
          {/* <Markdown remarkPlugins={[remarkGfm]} className="liviq-content">
            {a}
          </Markdown> */}
          <Flex
            style={{
              borderRadius: 8,
              borderColor: COLORS.borderColorMedium,
              padding: 8,
            }}
          >
            {/* <div
              dangerouslySetInnerHTML={{ __html: a }}
              className="reasoning"
              style={{ fontSize: FONT_SIZE.HEADING_4, margin: 0 }}
            ></div> */}
            <LLMText
              html={a}
              maxLines={5}
              disableClip={currentQuestion || disableClip}
            ></LLMText>
          </Flex>
        </Flex>
      );
    };

    const renderQuestionAnswerSection = () => {
      return (
        <Flex
          vertical
          gap={24}
          style={{
            padding: 8,
            paddingTop: 16,
          }}
        >
          {livThread && livThread.length ? (
            <>
              {" "}
              {/* Past Interactions */}
              {livThread.map((thread, index) =>
                renderQABlock(
                  thread.question,
                  thread.answer.answer,
                  false,
                  index == livThread.length - 1
                )
              )}
            </>
          ) : null}
        </Flex>
      );
    };

    if (loadingLivThread) {
      return <Loader></Loader>;
    }

    return (
      <Drawer
        open={true}
        mask={false}
        title={null}
        placement="bottom"
        closeIcon={null}
        height={drawerVisibility ? 700 : 140}
        style={{
          borderTopRightRadius: 16,
          borderTopLeftRadius: 16,
          boxShadow: "0 0 8px #888",
          position: "relative",
          overflowY: "hidden",
          maxWidth: MAX_WIDTH,
          marginLeft: isMobile ? 0 : window.innerWidth / 2 - MAX_WIDTH / 2,
        }}
        styles={{ body: { padding: 0, overflowY: "hidden" } }}
        rootClassName="brickfi-drawer"
      >
        {drawerVisibility && (
          <Flex
            justify="flex-end"
            style={{ margin: 8 }}
            onClick={() => {
              setDrawerVisibility(false);
            }}
          >
            <DynamicReactIcon
              iconName="IoIosCloseCircleOutline"
              iconSet="io"
            ></DynamicReactIcon>
          </Flex>
        )}
        <Flex
          vertical
          ref={assistDrawerRef}
          style={{
            height: drawerVisibility ? 600 : 140,
            overflowY: "auto",
            scrollbarWidth: "none",
            scrollBehavior: "smooth",
          }}
        >
          {/* Single session of question / answer */}
          {drawerVisibility ? renderQuestionAnswerSection() : null}

          {drawerFixedContent && <Flex>{drawerFixedContent}</Flex>}

          {/* Current Question & Answer (Only show while processing) */}
          <Flex
            vertical
            gap={24}
            style={{
              padding: 8,
              paddingTop: 16,
            }}
          >
            {currentQuestion &&
              renderQABlock(
                currentQuestion,
                currentAnswer?.answer!,
                true,
                false
              )}
          </Flex>

          {/* Prompts & Input */}
          <Flex
            vertical
            style={{
              width: "calc(100% - 24px)",
              position: "absolute",
              bottom: 0,
              left: 0,
              backgroundColor: "white",
              padding: 12,
            }}
          >
            <Flex
              style={{
                width: "100%",
                overflowX: "scroll",
                whiteSpace: "nowrap",
                scrollbarWidth: "none",
              }}
              gap={8}
            >
              {followupPrompts &&
              followupPrompts.prompts &&
              followupPrompts.prompts.length ? (
                followupPrompts.prompts.map((p) => {
                  return (
                    <div
                      style={{
                        borderRadius: 8,
                        minWidth: 125,
                        padding: "4px 8px",
                        textWrap: "wrap",
                        backgroundColor: COLORS.bgColorMedium,
                        fontSize: FONT_SIZE.PARA,
                        fontWeight: 500,
                        height: "50px",
                      }}
                      onClick={() => {
                        handleLLMRequest(
                          `${p}${lvnzyProjectId ? "" : " across projects"}`,
                          false
                        );
                      }}
                    >
                      {p}
                    </div>
                  );
                })
              ) : drawerVisibility ? null : (
                <Flex
                  vertical
                  onClick={() => {
                    setDrawerVisibility(true);
                  }}
                >
                  <Typography.Text style={{ color: COLORS.textColorLight }}>
                    See your previous questions
                  </Typography.Text>
                  <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_3 }}>
                    Continue your search. Ask Anything!
                  </Typography.Text>
                </Flex>
              )}
            </Flex>

            <Form
              form={form}
              onFinish={async (value) => {
                form.resetFields();
                const { question } = value;
                handleLLMRequest(question);
              }}
            >
              <Form.Item label="" name="question" style={{ marginBottom: 0 }}>
                <Input
                  disabled={queryStreaming}
                  style={{
                    height: 50,
                    marginTop: 8,
                    paddingRight: 0,
                    backgroundColor: "white",
                    border: "1px solid",
                    borderColor: COLORS.borderColorMedium,
                    borderRadius: 16,
                    width: "100%",
                    fontSize: FONT_SIZE.HEADING_3,
                  }}
                  name="query"
                  placeholder="Compare, discover or analyse!"
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
      </Drawer>
    );
  }
);

export default BrickfiAssist;
