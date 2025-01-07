import { Flex } from "antd";
import { useState } from "react";
import HomePage from "./home-page";
import { useNavigate } from "react-router-dom";
import ProjectPage from "./project-page";
import Liv from "../components/liv";
import { useDevice } from "../hooks/use-device";

export function LivIQPage() {
  const [projectsList, setProjectsList] = useState<any>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const navigate = useNavigate();
  const { isMobile } = useDevice();

  return (
    <Flex
      gap={8}
      style={{ width: "100%", position: "relative", height: "85vh" }}
    >
      <Flex
        style={{
          ...{
            width: "36%",
            marginRight: "0.5%",
          },
          ...(isMobile
            ? {
                width: "100%",
                position: "absolute",
                bottom: 0,
                borderRadius: 8,
                boxShadow: "0 0 4px #999",
                zIndex: 99,
                backgroundColor: "white",
                padding: 16,
              }
            : {}),
        }}
      >
        <Liv
          onNewProjectContent={(projects: any[]) => {
            setProjectsList(projects);
          }}
          projectId={selectedProjectId}
        ></Liv>
      </Flex>
      <Flex
        style={{
          ...{
            width: "63.5%",
            marginLeft: "auto",
          },
          ...(isMobile ? { width: "100%" } : {}),
        }}
      >
        {selectedProjectId ? (
          <ProjectPage projectId={selectedProjectId}></ProjectPage>
        ) : (
          <HomePage
            projectClick={(projectId: string) => {
              setSelectedProjectId(projectId);
            }}
            filteredProjectsIdList={projectsList}
          ></HomePage>
        )}
      </Flex>
    </Flex>
  );
}
