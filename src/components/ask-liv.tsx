import { ProChat } from "@ant-design/pro-chat";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosApiInstance } from "../libs/axios-api-Instance";

export default function AskLiv({ projectName }: { projectName?: string }) {
  const [sessionIdIsLoading, setSessionIdIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>();
  const [initialChats, setInitialChats] = useState<any[] | undefined>();

  const { projectId } = useParams();

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
      if (!sessionId) return;

      try {
        setSessionIdIsLoading(true);
        const response = await axiosApiInstance.post("/ai/message-history", {
          sessionId,
        });

        if (response.data && response.data.data) {
          const formattedChats = response.data.data.map(
            (message: any, index: number) => ({
              id: `chat-${index}`,
              content: message.kwargs.content,
              role: message.id.includes("HumanMessage") ? "user" : "assistant",
              updateAt: Date.now(),
              createAt: Date.now(),
            })
          );

          setInitialChats(formattedChats);
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
      <ProChat
        onResetMessage={clearSession}
        style={{ height: "100%" }}
        request={handleRequest}
        locale="en-US"
        userMeta={{
          avatar:
            "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_640.png",
          title: "You",
        }}
        assistantMeta={{
          avatar: "https://livinzy.com/d9811e2e2ee94a81eb99c3c985fddcc8.png",
          title: "Liv",
          backgroundColor: "#67dedd",
        }}
        helloMessage="Hello! I am Liv, I can answer any question you might have about this project?"
        placeholder="Type your question here..."
        initialChats={initialChats}
      />
    );
  }
}
