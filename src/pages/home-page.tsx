import { Button, Col, Flex, Row, Typography } from "antd";
import { Loader } from "../components/common/loader";
import { ProjectCard } from "../components/common/project-card";
import { useDevice } from "../hooks/use-device";
import { useFetchProjects } from "../hooks/use-project";

import { useState } from "react";
import { ProjectsMapView } from "../components/map-view/projects-map-view";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
import { ProjectCategories } from "../libs/constants";
import { COLORS, FONT_SIZE } from "../theme/style-constants";

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
          <Flex
            align="center"
            style={{
              width: "calc(100% - 60px)",
              padding: "24px",
              margin: "0 30px",
              borderRadius: 24,
              backgroundColor: "white",
              border: "1px solid",
              borderColor: COLORS.borderColor,
            }}
          >
            <Flex gap={42}>
              {ProjectCategories.map((cat: any) => {
                return (
                  <Flex vertical align="center">
                    <DynamicReactIcon
                      size={28}
                      color={COLORS.bgColorDark}
                      iconName={cat.icon.name}
                      iconSet={cat.icon.set}
                    ></DynamicReactIcon>
                    <Typography.Text style={{ fontSize: FONT_SIZE.subText }}>
                      {cat.label}
                    </Typography.Text>
                  </Flex>
                );
              })}
            </Flex>
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
              style={{
                padding: 16,
                borderRadius: 12,
                cursor: "pointer",
                marginLeft: "auto",
              }}
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
            <Row gutter={[60, 60]} style={{ width: "100%", margin: 0 }}>
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
