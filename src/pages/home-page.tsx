import { Flex } from "antd";
import { useEffect, useState } from "react";
import ProjectsView from "../components/projects-view";
import { useNavigate } from "react-router-dom";
import Liv from "../components/liv";
import { useDevice } from "../hooks/use-device";
import { useFetchProjects } from "../hooks/use-project";
import { Loader } from "../components/common/loader";
import ProjectView from "../components/project-view";

export function HomePage() {
  const [projectsList, setProjectsList] = useState<any>([]);
  const [catsList, setCatsList] = useState<string[]>([]);
  const [drivers, setDrivers] = useState<string[]>([]);

  const navigate = useNavigate();
  const { isMobile } = useDevice();

  const { data: projects, isLoading: projectIsLoading } = useFetchProjects();

  useEffect(() => {
    setProjectsList(projects);
  }, [projects]);

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
            marginRight: "1%",
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
          onNewProjectContent={(aiProjects: any[]) => {
            // When projects are filtered by AI, use the new list to filter existing projects.
            const newProjects: any = [];
            aiProjects = aiProjects || [];
            console.log(`Total projects generated: ${aiProjects.length}`);
            aiProjects.forEach((p) => {
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
          }}
          onDriversContent={(drivers: string[]) => {
            setDrivers(drivers);
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
            width: "62.5%",
            marginLeft: "auto",
          },
          ...(isMobile ? { width: "100%" } : {}),
        }}
      >
        {location.search &&
        new URLSearchParams(location.search).get("projectId") ? (
          <ProjectView
            projectId={
              new URLSearchParams(location.search).get("projectId") as string
            }
          ></ProjectView>
        ) : projectIsLoading ? (
          <Flex style={{ width: "100%" }} align="center" justify="center">
            <Loader></Loader>
          </Flex>
        ) : (
          <ProjectsView
            projectClick={(projectId: string) => {
              setSelectedProjectId(projectId);
            }}
            drivers={drivers}
            projects={projectsList}
          ></ProjectsView>
        )}
      </Flex>
    </Flex>
  );
}
