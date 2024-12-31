import { ChatItemProps, ProChat, ProChatInstance } from "@ant-design/pro-chat";
import { Button, Flex, Form, Input, Typography } from "antd";
import { ReactNode, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import { useDevice } from "../hooks/use-device";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { LivIQPredefinedQuestions } from "../libs/constants";
import { captureAnalyticsEvent } from "../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import DynamicReactIcon from "./common/dynamic-react-icon";
import { useUser } from "../hooks/use-user";

export default function AskLiv({
  projectId,
  onNewProjectContent,
}: {
  projectId?: string;
  onNewProjectContent?: any;
}) {
  const [sessionIdIsLoading, setSessionIdIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>();
  const [initialChats, setInitialChats] = useState<any[] | undefined>();

  const { user } = useUser();

  const { isMobile } = useDevice();
  const proChatRef = useRef<ProChatInstance>();

  const inputAreaRender = (
    _: ReactNode,
    onMessageSend: (message: string) => void | Promise<any>,
    onClear: () => void
  ) => {
    const [form] = Form.useForm();
    const [query, setQuery] = useState<string>();

    return (
      <Form
        form={form}
        onFinish={async (value) => {
          form.resetFields();
          const { question } = value;
          await onMessageSend(question);
        }}
      >
        <Form.Item label="" name="question">
          <Input
            style={{
              height: 50,
              paddingRight: 0,
              border: 0,
              backgroundColor: COLORS.bgColorMedium,
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
                disabled={!query}
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
    );
  };

  useEffect(() => {
    if (user && user?._id) {
      setSessionId(user._id);
    }
  }, [user]);

  useEffect(() => {
    // Fetch chat history once sessionId is available
    const fetchChatHistory = async () => {
      if (!sessionId) {
        return;
      }

      try {
        setSessionIdIsLoading(true);
        const response = await axiosApiInstance.post("/ai/message-history", {
          sessionId,
        });

        if (response.data && response.data.data && response.data.data.length) {
          const formattedChats = response.data.data.map(
            (message: any, index: number) => ({
              id: `i-chat-${index}`,
              content: message.kwargs.content || message.kwargs.general_info,
              role: message.id.includes("HumanMessage") ? "user" : "assistant",
              updateAt: Date.now(),
              createAt: Date.now(),
            })
          );

          setInitialChats(formattedChats);
        } else {
          setInitialChats([
            {
              id: `p-chat-1`,
              content: projectId
                ? "LivIQ has the full upto date knowledge about this project and other insights about the location, team etc. See questions people are already asking about this project"
                : "How can I help you today ?",
              role: "assistant",
              updateAt: Date.now(),
              createAt: Date.now(),
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      } finally {
        setSessionIdIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [sessionId]);

  const handleRequest = async (messages: any[]) => {
    const latestMessage = messages[messages.length - 1];

    try {
      captureAnalyticsEvent("question-asked", {
        projectId: projectId,
        question: latestMessage.content,
      });

      const response = await axiosApiInstance.post(
        projectId ? "/ai/ask" : "/ai/ask-global",
        {
          question: latestMessage.content,
          sessionId: sessionId,
          project: {
            id: projectId || "",
          },
        }
      );

      if (response.data && response.data.data) {
        return {
          content: new Response(response.data.data.answer),
          success: true,
        };
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

  const clearSession = async () => {
    const response = await axiosApiInstance.post("/ai/message-history/clear", {
      sessionId: sessionId,
    });

    console.log(response.data.data);
  };

  if (!sessionIdIsLoading && sessionId && initialChats) {
    return (
      <Flex
        vertical
        style={{
          padding: 12,
          borderRadius: 8,
          backgroundColor: "white",
          border: "1px solid",
          borderColor: COLORS.borderColor,
          width: "100%",
          height: isMobile ? "85vh" : projectId ? 500 : "85vh",
        }}
      >
        {/* <Flex
          align="center"
          gap={8}
          justify="center"
          style={{
            padding: "16px 0",
            borderBottom: "1px solid",
            borderColor: COLORS.borderColorDark,
          }}
        >
          <DynamicReactIcon
            iconSet="gi"
            color={COLORS.primaryColor}
            size={20}
            iconName="GiOilySpiral"
          ></DynamicReactIcon>
          <Typography.Text
            style={{ fontSize: FONT_SIZE.subHeading, fontWeight: "bold" }}
          >
            LivIQ
          </Typography.Text>
        </Flex> */}
        <ProChat
          onResetMessage={clearSession}
          style={{ height: isMobile ? "85vh" : projectId ? 500 : "85vh" }}
          request={handleRequest}
          locale="en-US"
          actions={{
            render: (doms: any) => [],
          }}
          chatRef={proChatRef}
          userMeta={{
            avatar:
              "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_640.png",
            title: "You",
          }}
          chatItemRenderConfig={{
            actionsRender: false,
            avatarRender: (props: ChatItemProps, node: ReactNode) => {
              return (
                <Flex style={{ alignSelf: "center" }}>
                  {props.originData &&
                  props.originData.role == "user" ? null : (
                    <DynamicReactIcon
                      iconSet="gi"
                      color={COLORS.primaryColor}
                      size={20}
                      iconName="GiOilySpiral"
                    ></DynamicReactIcon>
                  )}
                </Flex>
              );
            },
            contentRender: (props: ChatItemProps, node: ReactNode) => {
              let msgContent;
              try {
                msgContent = JSON.parse(props.message!.toString());
              } catch (err) {
                msgContent = props.message ? props.message!.toString() : "";
              }
              if (
                msgContent &&
                msgContent.projectsList &&
                onNewProjectContent
              ) {
                onNewProjectContent(msgContent.projectsList);
              }
              return (
                <Flex vertical>
                  {props.originData && props.originData.role == "user" ? (
                    <Typography.Text
                      style={{
                        fontSize: FONT_SIZE.SUB_TEXT,
                        backgroundColor: COLORS.primaryColor,
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: 16,
                      }}
                    >
                      {msgContent}
                    </Typography.Text>
                  ) : (
                    <Typography.Text
                      style={{
                        fontSize: FONT_SIZE.SUB_TEXT,
                        backgroundColor: COLORS.bgColorMedium,
                        padding: "4px 8px",
                        borderRadius: 16,
                      }}
                    >
                      <Markdown className="liviq-content">
                        {msgContent.generalInfo
                          ? msgContent.generalInfo
                          : msgContent}
                      </Markdown>
                    </Typography.Text>
                  )}

                  {projectId ? (
                    <>
                      {(props as any)["data-id"] == "p-chat-1" ? (
                        <Flex vertical gap={8} style={{ marginTop: 16 }}>
                          {LivIQPredefinedQuestions.map((q: string) => {
                            return (
                              <Button
                                type="primary"
                                style={{
                                  backgroundColor: COLORS.bgColorDark,
                                  color: "white",
                                  cursor: "pointer",
                                  borderRadius: 12,
                                  border: "0px",
                                  height: 32,
                                  fontSize: FONT_SIZE.SUB_TEXT,
                                  width: "max-content",
                                }}
                                onClick={() => {
                                  if (!proChatRef) {
                                    return;
                                  }
                                  proChatRef.current?.sendMessage(q);
                                }}
                              >
                                {q}
                              </Button>
                            );
                          })}
                        </Flex>
                      ) : null}
                    </>
                  ) : (
                    <></>
                  )}
                </Flex>
              );
            },
          }}
          inputAreaRender={inputAreaRender}
          inputAreaProps={{
            style: {
              border: "1px solid",
              borderColor: COLORS.primaryColor,
              boxShadow: "none",
            },
          }}
          assistantMeta={{
            avatar: "https://livinzy.com/d9811e2e2ee94a81eb99c3c985fddcc8.png",
            title: "Liv",
          }}
          placeholder="Type your question here..."
          initialChats={initialChats}
        />
      </Flex>
    );
  }
}
