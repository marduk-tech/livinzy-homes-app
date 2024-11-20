import { Col, Flex, FloatButton, Row, Typography } from "antd";
import { Loader } from "../components/common/loader";
import { ProjectCard } from "../components/common/project-card";
import { useDevice } from "../hooks/use-device";
import { useFetchProjects } from "../hooks/use-project";

import { useEffect, useState } from "react";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
import { ProjectsMapView } from "../components/map-view/projects-map-view";
import { ProjectCategories } from "../libs/constants";
import { captureAnalyticsEvent } from "../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { Project } from "../types/Project";

export function HomePage() {
  const { isMobile } = useDevice();
  const [categoryFilter, setCategoryFilter] = useState();

  const [toggleMapView, setToggleMapView] = useState(false);

  const { data: projects, isLoading: projectIsLoading } = useFetchProjects();

  const [filteredProjects, setFilteredProjects] = useState<Project[]>();

  useEffect(() => {
    if (!projects) {
      return;
    }
    captureAnalyticsEvent("app-homepage-open", {});

    if (!categoryFilter) {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(
        projects?.filter(
          (p: Project) =>
            p.ui &&
            p.ui.categories &&
            p.ui.categories.find((c) => c == categoryFilter)
        )
      );
    }
  }, [categoryFilter, projects]);

  if (projectIsLoading) {
    return <Loader />;
  }

  if (filteredProjects) {
    return (
      <>
        <FloatButton
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
            marginTop: 16,
            borderRadius: 12,
            cursor: "pointer",
            marginLeft: "auto",
          }}
          onClick={() => setToggleMapView(!toggleMapView)}
        >
          {isMobile ? null : toggleMapView ? "List View" : "Map View"}
        </FloatButton>
        <Flex
          justify="center"
          vertical
          style={{
            width: "100%",
            marginTop: 16,
          }}
          gap={16}
        >
          <Flex
            align={isMobile ? "flex-start" : "center"}
            vertical
            style={{
              marginLeft: 8,
              padding: 0,
            }}
          >
            <Flex
              gap={32}
              justify={isMobile ? "flex-start" : "center"}
              style={{
                overflowX: "scroll",
                whiteSpace: "nowrap",
                width: "100%",
                scrollbarWidth: "none",
              }}
            >
              {ProjectCategories.map((cat: any) => {
                return (
                  <Flex
                    vertical
                    align="center"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setCategoryFilter(cat.key);
                      captureAnalyticsEvent("click-homepage-category", {
                        categoryName: cat.label,
                      });
                    }}
                  >
                    <DynamicReactIcon
                      size={28}
                      color={
                        categoryFilter && categoryFilter == cat.key
                          ? COLORS.primaryColor
                          : COLORS.bgColorDark
                      }
                      iconName={cat.icon.name}
                      iconSet={cat.icon.set}
                    ></DynamicReactIcon>
                    <Typography.Text
                      style={{
                        fontSize: FONT_SIZE.subText,
                        fontWeight:
                          categoryFilter && categoryFilter == cat.key
                            ? "bold"
                            : "normal",
                        color:
                          categoryFilter && categoryFilter == cat.key
                            ? COLORS.primaryColor
                            : COLORS.textColorDark,
                      }}
                    >
                      {cat.label}
                    </Typography.Text>
                  </Flex>
                );
              })}
            </Flex>
          </Flex>

          {toggleMapView ? (
            <Row>
              <ProjectsMapView
                projects={filteredProjects.filter((p) => p.ui && p.ui.oneLiner)}
              />
            </Row>
          ) : (
            <Row gutter={[32, 32]} style={{ width: "100%", margin: 0 }}>
              {filteredProjects
                .filter((p) => p.ui && p.ui.oneLiner)
                .map((project) => (
                  <Col
                    key={project._id}
                    xs={24}
                    md={12}
                    lg={6}
                    style={{ padding: isMobile ? 0 : 16 }}
                  >
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
