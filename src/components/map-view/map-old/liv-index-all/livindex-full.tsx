import { Flex, Select, Typography } from "antd";
import { useEffect, useState } from "react";
import { useFetchAllLivindexPlaces } from "../../../../hooks/use-livindex-places";
import { useFetchProjects } from "../../../../hooks/use-project";
import {
  LivIndexDriversConfig,
  ProjectHomeType,
} from "../../../../libs/constants";
import { capitalize } from "../../../../libs/lvnzy-helper";
import { COLORS } from "../../../../theme/style-constants";
import { IDriverPlace } from "../../../../types/Project";
import { Loader } from "../../../common/loader";
import { getProjectTypeIcon } from "../../map-old/project-type-icon";
import MapViewV2 from "../../map-view-v2";

export function LivIndexFull() {
  const { data: livindexPlaces, isLoading: livindexPlacesLoading } =
    useFetchAllLivindexPlaces();

  const { data: projects, isLoading: projectIsLoading } = useFetchProjects();

  const [homeTypeFilter, setHomeTypeFilter] = useState("apartment");
  const [driverFilters, setDriverFilters] = useState<string[]>([
    "industrial-hitech",
    "airport",
  ]);

  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<IDriverPlace[]>([]);
  const [selectedDriverTypes, setSelectedDriverTypes] = useState<string[]>([
    "industrial-hitech",
    "airport",
  ]);
  const [selectedProject, setSelectedProject] = useState<string>();

  useEffect(() => {
    if (projects && projects.length) {
      const validProjects = projects.filter((p) => {
        return (
          p.metadata &&
          p.metadata.homeType &&
          p.metadata.location &&
          typeof p.metadata.location.lat === "number" &&
          typeof p.metadata.location.lng === "number"
        );
      });
      console.log("Total projects:", projects.length);
      console.log("Valid projects with coordinates:", validProjects.length);

      // Log any projects with invalid coordinates for debugging
      const invalidProjects = projects.filter(
        (p) =>
          p.metadata &&
          p.metadata.location &&
          (typeof p.metadata.location.lat !== "number" ||
            typeof p.metadata.location.lng !== "number")
      );
      if (invalidProjects.length > 0) {
        console.warn(
          "Projects with invalid coordinates:",
          invalidProjects.map((p) => ({
            id: p._id,
            name: p.metadata?.name,
            location: p.metadata?.location,
          }))
        );
      }

      const filtered = validProjects.filter((p) =>
        p.metadata.homeType.includes(homeTypeFilter)
      );
      console.log(
        "Filtered by homeType:",
        filtered.length,
        "homeType:",
        homeTypeFilter
      );

      setFilteredProjects(filtered);
    }
  }, [projects, homeTypeFilter]);

  // validate selected project when filtered projects change
  useEffect(() => {
    if (selectedProject && filteredProjects.length > 0) {
      if (!filteredProjects.some((p) => p._id === selectedProject)) {
        console.log("Selected project no longer in filtered list, resetting");
        setSelectedProject(undefined);
      }
    }
  }, [filteredProjects, selectedProject]);

  // update filtered drivers when places or filters change
  useEffect(() => {
    if (livindexPlaces && livindexPlaces.length) {
      console.log("Updating filtered drivers with filters:", driverFilters);
      const drivers = livindexPlaces.filter((p) =>
        driverFilters.includes(p.driver)
      );
      console.log("Filtered drivers count:", drivers.length);
      setFilteredDrivers(drivers);
      setSelectedDriverTypes(driverFilters);
    }
  }, [livindexPlaces, driverFilters]);

  // log when filtered drivers change
  useEffect(() => {
    console.log("FilteredDrivers updated:", filteredDrivers?.length);
  }, [filteredDrivers]);

  const handleHomeTypeSelect = (value: string) => {
    setHomeTypeFilter(value);
    setSelectedProject(undefined);
  };
  const handleDriverSelect = (value: string[]) => {
    setDriverFilters(value);
    setSelectedDriverTypes(value);
  };

  if (livindexPlacesLoading) {
    return <Loader />;
  }

  if (livindexPlaces) {
    return (
      <Flex vertical style={{ height: "calc(100vh - 64px)" }}>
        <Flex
          gap={16}
          style={{ padding: 8, backgroundColor: "white", zIndex: 1 }}
        >
          <Select
            defaultValue="apartment"
            style={{ width: 200 }}
            onChange={handleHomeTypeSelect}
            options={Object.keys(ProjectHomeType).map((k: string) => {
              return {
                value: (ProjectHomeType as any)[k],
                label: (
                  <Flex gap={4}>
                    {getProjectTypeIcon(
                      (ProjectHomeType as any)[k],
                      COLORS.primaryColor
                    )}
                    <Typography.Text>
                      {capitalize((ProjectHomeType as any)[k])}
                    </Typography.Text>
                  </Flex>
                ),
              };
            })}
          />
          <Select
            style={{ width: 350 }}
            mode="multiple"
            defaultValue={["industrial-hitech", "airport"]}
            showSearch
            maxTagCount="responsive"
            onChange={handleDriverSelect}
            options={Object.keys(LivIndexDriversConfig).map((k: string) => {
              return {
                value: k,
                label: capitalize((LivIndexDriversConfig as any)[k].label),
              };
            })}
          />
        </Flex>
        <Flex style={{ flex: 1, position: "relative", minHeight: "600px" }}>
          {filteredProjects && (
            <>
              <Flex
                gap={8}
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: 8,
                  right: 8,
                  zIndex: 1000,
                  padding: "0 8px",
                }}
              >
                <Typography.Text
                  style={{
                    backgroundColor: "white",
                    padding: "4px 8px",
                    borderRadius: 4,
                    marginLeft: "auto",
                  }}
                >
                  {filteredProjects.length} projects
                </Typography.Text>
                {/* <Select
                  style={{ minWidth: 250, backgroundColor: "white" }}
                  placeholder="Navigate to project"
                  value={selectedProject}
                  onChange={(value) => {
                    console.log("Selected project changed to:", value);
                    
                    if (
                      !value ||
                      filteredProjects.some((p) => p._id === value)
                    ) {
                      setSelectedProject(value);
                    } else {
                      console.warn(
                        "Selected project not in filtered list:",
                        value
                      );
                      setSelectedProject(undefined);
                    }
                  }}
                  options={filteredProjects.map((p) => ({
                    label:
                      p.metadata?.name ||
                      p.metadata?.projectName ||
                      "Unnamed Project",
                    value: p._id,
                  }))}
                /> */}
              </Flex>
              <MapViewV2
                key={`map-${selectedProject || "all"}`}
                drivers={filteredDrivers.map((p) => ({
                  id: p._id,
                  duration: p.distance ? Math.round(p.distance / 60) : 0,
                }))}
                projects={filteredProjects}
                fullSize={false}
                defaultSelectedDriverTypes={selectedDriverTypes}
                selectedProjectId={selectedProject}
              />
            </>
          )}
        </Flex>
      </Flex>
    );
  }
}
