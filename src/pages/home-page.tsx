import { Button, Col, Flex, Row } from "antd";
import { Loader } from "../components/common/loader";
import { ProjectCard } from "../components/common/project-card";
import { useDevice } from "../hooks/use-device";
import { useFetchProjects } from "../hooks/use-project";

import { useState } from "react";
import { ProjectsMapView } from "../components/map-view/projects-map-view";
import DynamicReactIcon from "../components/common/dynamic-react-icon";

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
              icon={
                !toggleMapView ? (
                  <DynamicReactIcon
                    iconName="FaMap"
                    color="primary"
                    iconSet="fa"
                  ></DynamicReactIcon>
                ) : (
                  <DynamicReactIcon
                    iconName="FaRegListAlt"
                    iconSet="fa"
                    color="primary"
                  ></DynamicReactIcon>
                )
              }
              style={{ padding: 16, borderRadius: 12, cursor: "pointer" }}
              onClick={() => setToggleMapView(!toggleMapView)}
              size="small"
            >
              {toggleMapView ? "List View" : "Map View"}
            </Button>
          </Flex>

          {toggleMapView ? (
            <Row>
              <ProjectsMapView
                projects={projects.filter((p) => p.ui && p.ui.oneLiner)}
              />
            </Row>
          ) : (
            <Row gutter={[35, 30]} style={{ width: "100%" }}>
              {projects
                .filter((p) => p.ui && p.ui.oneLiner)
                .map((project) => (
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
