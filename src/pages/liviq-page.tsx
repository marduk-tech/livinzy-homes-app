import { Flex } from "antd";
import { useState } from "react";
import HomePage from "./home-page";
import { COLORS } from "../theme/style-constants";
import { useNavigate } from "react-router-dom";
import ProjectPage from "./project-page";
import Liv from "../components/liv";

export function LivIQPage() {
  const [projectsList, setProjectsList] = useState<any>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const navigate = useNavigate();

  return (
    <Flex vertical>
      {/* <Button
        style={{ marginBottom: 8 }}
        type="link"
        onClick={() => {
          setSelectedProjectId(undefined);
        }}
        icon={
          <DynamicReactIcon
            iconName="IoChevronBackCircleSharp"
            iconSet="io5"
            size={40}
            color={COLORS.borderColorDark}
          ></DynamicReactIcon>
        }
      ></Button> */}
      <Flex gap={8} style={{ width: "100%" }}>
        <Flex
          style={{
            width: "36%",
            marginRight: "0.5%",
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
            width: "63.5%",
            height: "85vh",
            overflowY: "scroll",
            scrollbarWidth: "none",
            backgroundColor: "white",
            padding: "16px 8px",
            border: "1px solid",
            borderColor: COLORS.borderColor,
            borderRadius: 8,
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
    </Flex>
  );
}
