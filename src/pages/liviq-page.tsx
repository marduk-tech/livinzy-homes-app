import { Flex } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Liv from "../components/liv";
import { useDevice } from "../hooks/use-device";
import HomePage from "./home-page";
import ProjectPage from "./project-page";

export function LivIQPage() {
  const [projectsList, setProjectsList] = useState<any>([]);
  const [catsList, setCatsList] = useState<string[]>([]);

  const navigate = useNavigate();
  const { isMobile } = useDevice();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get("projectId");
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, [location.search]);

  const setSelectedProjectId = (projectId: string) => {
    navigate(`?projectId=${projectId}`);
  };

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
          onNewProjectContent={(projects: any[], projectsCat: string[]) => {
            setProjectsList(projects);
            if (projectsCat) {
              setCatsList(projectsCat);
            }
          }}
          projectId={
            location.search
              ? (new URLSearchParams(location.search).get(
                  "projectId"
                ) as string)
              : undefined
          }
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
        {location.search &&
        new URLSearchParams(location.search).get("projectId") ? (
          <ProjectPage
            projectId={
              new URLSearchParams(location.search).get("projectId") as string
            }
          ></ProjectPage>
        ) : (
          <HomePage
            projectClick={(projectId: string) => {
              setSelectedProjectId(projectId);
            }}
            aiProjectsList={projectsList}
            aiProjectsCategories={catsList}
          ></HomePage>
        )}
      </Flex>
    </Flex>
  );
}
