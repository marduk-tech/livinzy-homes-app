import { Button, Col, Flex, Row } from "antd";
import { Loader } from "../components/common/loader";
import { ProjectCard } from "../components/common/project-card";
import { useDevice } from "../hooks/use-device";
import { useFetchProjects } from "../hooks/use-project";
import { Project } from "../types/Project";

import { useState } from "react";
import { ProjectsMapView } from "../components/map-view/projects-map-view";

export function HomePage() {
  const { isMobile } = useDevice();

  const [toggleMapView, setToggleMapView] = useState(false);

  const { data: projects, isLoading: projectIsLoading } = useFetchProjects();

  if (projectIsLoading) {
    return <Loader />;
  }

  if (projects) {
    return (
      <>
        <Flex
          justify="center"
          vertical
          style={{
            width: "100%",
            marginTop: 16,
            padding: `16px ${isMobile ? "20px" : "40px"}`,
          }}
          gap={40}
        >
          <Flex justify="end">
            <Button
              onClick={() => setToggleMapView(!toggleMapView)}
              size="small"
            >
              {toggleMapView ? "Show List" : "Show Map"}
            </Button>
          </Flex>

          {toggleMapView ? (
            <Row>
              <ProjectsMapView projects={projects} />
            </Row>
          ) : (
            <Row gutter={[35, 30]} style={{ width: "100%" }}>
              {projects.map((project) => (
                <Col key={project._id} xs={24} md={12} lg={6}>
                  <ProjectCard project={project} key={project._id} />
                </Col>
              ))}
            </Row>
          )}
        </Flex>
      </>
    );
  }

  return null;
}
