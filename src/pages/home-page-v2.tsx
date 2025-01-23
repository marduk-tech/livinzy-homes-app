import { Flex } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Liv from "../components/liv";
import { useFetchProjects } from "../hooks/use-project";
import { Loader } from "../components/common/loader";
import ProjectViewV2 from "../components/project-view-v2";
import ProjectsViewV2 from "../components/projects-view-v2";

export function HomePageV2() {
  const [projectsList, setProjectsList] = useState<any>([]);
  const [catsList, setCatsList] = useState<string[]>([]);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [streaming, setStreaming] = useState<boolean>(false);

  const navigate = useNavigate();

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
    <Flex gap={8} vertical style={{ width: "100%", position: "relative" }}>
      <Flex>
        {location.search &&
        new URLSearchParams(location.search).get("projectId") ? (
          <ProjectViewV2
            projectId={
              new URLSearchParams(location.search).get("projectId") as string
            }
          ></ProjectViewV2>
        ) : projectIsLoading ? (
          <Flex style={{ width: "100%" }} align="center" justify="center">
            <Loader></Loader>
          </Flex>
        ) : (
          <ProjectsViewV2
            projectClick={(projectId: string) => {
              setSelectedProjectId(projectId);
            }}
            drivers={drivers}
            projects={projectsList}
            streaming={streaming}
          ></ProjectsViewV2>
        )}
      </Flex>
      <Flex>
        <Liv
          onNewProjectContent={(aiProjects: any[], isStreaming: boolean) => {
            // When projects are filtered by AI, use the new list to filter existing projects.
            setStreaming(isStreaming);
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
    </Flex>
  );
}
