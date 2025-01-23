import { Button, Flex, Typography } from "antd";
import { useEffect, useState } from "react";
import { ProjectCard } from "./common/project-card";
import { ProjectsMapView } from "./map-view/projects-map-view";
import { captureAnalyticsEvent } from "../libs/lvnzy-helper";
import { Project } from "../types/Project";
import DynamicReactIcon from "./common/dynamic-react-icon";
import { FONT_SIZE, MAX_WIDTH, MOBILE_MARGIN } from "../theme/style-constants";

const ProjectsViewV2: React.FC<{
  projects?: any[];
  projectClick: any;
  drivers: string[];
  streaming: boolean;
}> = ({ projects, projectClick, drivers, streaming }) => {
  const [categoryFilter, setCategoryFilter] = useState();
  const [priceRange, setPriceRange] = useState([300, 1000]);
  const [locationFilter, setLocationFilter] = useState<string[] | undefined>();
  const [isFiltersModalVisible, setIsFiltersModalVisible] = useState(false);

  const [toggleMapView, setToggleMapView] = useState(false);

  const [filteredProjects, setFilteredProjects] = useState<Project[]>();

  useEffect(() => {
    if (!projects) {
      return;
    }
    captureAnalyticsEvent("app-homepage-open", {});
    let filtered = projects;

    setFilteredProjects(filtered);
  }, [categoryFilter, locationFilter, priceRange, projects]);

  if (filteredProjects) {
    return (
      <>
        <Flex
          vertical
          style={{
            width: "100%",
            marginTop: 16,
          }}
          gap={16}
        >
          <Flex
            align="center"
            gap={8}
            justify="center"
            style={{
              overflowX: "scroll",
              overflowY: "hidden",
              whiteSpace: "nowrap",
              width: "100%",
              scrollbarWidth: "none",
            }}
          >
            {/* {aiProjectsCategories.map((cat: any) => {
                return (
                  <Flex
                    vertical
                    align="center"
                    style={{
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: 8,
                      backgroundColor:
                        categoryFilter == cat
                          ? COLORS.primaryColor
                          : COLORS.bgColor,
                      border: "1px solid",
                      borderColor: COLORS.borderColorMedium,
                    }}
                    onClick={() => {
                      if (cat == categoryFilter) {
                        setCategoryFilter(undefined);
                      } else {
                        setCategoryFilter(cat);
                        captureAnalyticsEvent("click-homepage-category", {
                          categoryName: cat,
                        });
                      }
                    }}
                  >
                    <Typography.Text
                      style={{
                        fontSize: FONT_SIZE.PARA,
                        fontWeight:
                          categoryFilter && categoryFilter == cat.key
                            ? "bold"
                            : "normal",
                        color:
                          categoryFilter && categoryFilter == cat
                            ? "white"
                            : COLORS.textColorDark,
                      }}
                    >
                      {cat}
                    </Typography.Text>
                  </Flex>
                );
              })} */}
            {/* <Button
                onClick={() => setIsFiltersModalVisible(true)}
                type="default"
                size="small"
                icon={<RiListSettingsLine />}
              >
                Filters
              </Button> */}

            <Typography.Text
              style={{ fontSize: FONT_SIZE.HEADING_3, fontWeight: "bold" }}
            >
              {streaming
                ? "Loading..."
                : drivers && drivers.length
                ? "See location insights on the map"
                : projects && projects.length < 30
                ? `${projects.length} projects matching your query`
                : "Projects in North Bangalore"}
            </Typography.Text>
            <Button
              size="small"
              icon={
                !toggleMapView ? (
                  <DynamicReactIcon
                    iconName="FaMap"
                    color="primary"
                    iconSet="fa"
                    size={16}
                  ></DynamicReactIcon>
                ) : (
                  <DynamicReactIcon
                    iconName="FaRegListAlt"
                    iconSet="fa"
                    size={16}
                    color="primary"
                  ></DynamicReactIcon>
                )
              }
              style={{
                borderRadius: 8,
                cursor: "pointer",
                marginLeft: "auto",
                fontSize: FONT_SIZE.SUB_TEXT,
              }}
              onClick={() => {
                setToggleMapView(!toggleMapView);
              }}
            ></Button>
          </Flex>
          {toggleMapView ? (
            <Flex
              style={{
                width: Math.min(
                  window.innerWidth - MOBILE_MARGIN * 2,
                  MAX_WIDTH
                ),
                height: 300,
              }}
            >
              <ProjectsMapView
                projects={filteredProjects}
                drivers={drivers}
                onProjectClick={(projectId: string) => {
                  projectClick(projectId);
                }}
              />
            </Flex>
          ) : (
            <Flex
              style={{
                overflowX: "scroll",
                width: "100%",
                whiteSpace: "nowrap",
                scrollbarWidth: "none",
              }}
            >
              {filteredProjects.length > 0 ? (
                <Flex gap={16}>
                  {filteredProjects.map((project) => (
                    <Flex
                      style={{ width: 175, overflowX: "hidden" }}
                      onClick={() => {
                        projectClick(project._id);
                      }}
                    >
                      <ProjectCard
                        project={project}
                        key={project._id}
                        fromMap={false}
                      />
                    </Flex>
                  ))}
                </Flex>
              ) : (
                <>
                  <Typography.Text>No Projects Found</Typography.Text>
                </>
              )}
            </Flex>
          )}
        </Flex>
      </>
    );
  }

  return null;
};

export default ProjectsViewV2;
