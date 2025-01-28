import { Divider, Flex, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import Liv, { LivRef } from "../components/liv";
import { useFetchProjects } from "../hooks/use-project";
import ProjectViewV2 from "../components/project-view-v2";
import ProjectsViewV2 from "../components/projects-view-v2";
import DynamicReactIcon from "../components/common/dynamic-react-icon";

export function HomePageV2() {
  const [projectsList, setProjectsList] = useState<any>([]);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<string>("");

  const livRef = useRef<LivRef>(null);

  const { data: projects, isLoading: projectIsLoading } = useFetchProjects();

  useEffect(() => {
    setProjectsList(projects);
  }, [projects]);

  return (
    <Flex gap={8} vertical style={{ width: "100%", position: "relative" }}>
      <Flex style={{ minHeight: 325, width: "100%" }}>
        {projectId ? (
          <Flex vertical style={{ width: "100%" }}>
            <Flex
              align="center"
              gap={4}
              style={{ padding: 4, marginBottom: 8 }}
              onClick={() => {
                setProjectId("");
              }}
            >
              <DynamicReactIcon
                iconName="IoChevronBackCircle"
                iconSet="io5"
              ></DynamicReactIcon>
              <Typography.Text>Back to projects</Typography.Text>
            </Flex>
            <ProjectViewV2 projectId={projectId}></ProjectViewV2>
          </Flex>
        ) : (
          <Flex style={{ width: "100%" }}>
            {" "}
            <ProjectsViewV2
              projectClick={(projectId: string) => {
                setProjectId(projectId);
                // livRef.current?.summarizeProject(projectId);
                // Current URL: https://my-website.com/page_a
              }}
              drivers={drivers}
              projects={projectsList}
            ></ProjectsViewV2>
          </Flex>
        )}
      </Flex>
      <Divider style={{ height: 12, margin: 0 }}></Divider>
      <Flex>
        <Liv
          ref={livRef}
          onNewProjectContent={(aiProjects: any[]) => {
            setProjectId("");
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
            setProjectId("");
            setDrivers(drivers);
          }}
          projectId={projectId}
        ></Liv>
      </Flex>
    </Flex>
  );
}
