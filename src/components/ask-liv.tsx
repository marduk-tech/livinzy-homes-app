import { ChatItemProps, ProChat, ProChatInstance } from "@ant-design/pro-chat";
import { Button, Flex, Typography } from "antd";
import { ReactNode, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import { useParams } from "react-router-dom";
import { useDevice } from "../hooks/use-device";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { LivIQPredefinedQuestions } from "../libs/constants";
import { captureAnalyticsEvent } from "../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import DynamicReactIcon from "./common/dynamic-react-icon";

export default function AskLiv({ projectName }: { projectName?: string }) {
  const [sessionIdIsLoading, setSessionIdIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>();
  const [initialChats, setInitialChats] = useState<any[] | undefined>();

  const { projectId } = useParams();

  const { isMobile } = useDevice();
  const proChatRef = useRef<ProChatInstance>();

  useEffect(() => {
    const fetchSessionId = async () => {
      if (!projectId) return;

      const sessionKey = `sessionId-${projectId}`;
      const storedSessionId = localStorage.getItem(sessionKey);

      if (storedSessionId) {
        setSessionId(storedSessionId);
        setSessionIdIsLoading(false);
        return;
      } else {
        try {
          setSessionIdIsLoading(true);
          const response = await axiosApiInstance.post("/ai/create-session");
          if (response.data && response.data.data.sessionId) {
            const newSessionId = response.data.data.sessionId;
            localStorage.setItem(sessionKey, newSessionId);
            setSessionId(newSessionId);
          }
        } catch (error) {
          console.error("Error fetching session ID:", error);
        } finally {
          setSessionIdIsLoading(false);
        }
      }
    };

    fetchSessionId();
  }, [projectId]);

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
              content: message.kwargs.content,
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
              content:
                "LivIQ has the full upto date knowledge about this project and other insights about the location, team etc. See questions people are already asking about this project",
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

      const response = await axiosApiInstance.post("/ai/ask", {
        question: latestMessage.content,
        sessionId: sessionId,
        project: {
          name: projectName || "",
        },
      });

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
          border: "1px solid",
          padding: 0,
          borderRadius: 8,
          borderColor: COLORS.borderColor,
        }}
      >
        <Flex
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
        </Flex>
        <ProChat
          onResetMessage={clearSession}
          style={{ height: isMobile ? "80vh" : 500 }}
          request={handleRequest}
          locale="en-US"
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
                <Flex style={{ alignSelf: "flex-start" }}>
                  {props.originData && props.originData.role == "user" ? (
                    <DynamicReactIcon
                      iconSet="fa"
                      size={20}
                      iconName="FaRegUserCircle"
                    ></DynamicReactIcon>
                  ) : (
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
              return (
                <Flex vertical>
                  <Typography.Text
                    style={{
                      fontSize: FONT_SIZE.subText,
                    }}
                  >
                    <Markdown className="liviq-content">
                      {props.message?.toString()}
                    </Markdown>
                  </Typography.Text>
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
                              fontSize: FONT_SIZE.default,
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
                </Flex>
              );
            },
          }}
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
