import { FeatureCollection, Point } from "geojson";
import { useFetchAllLivindexPlaces } from "../../../../hooks/use-livindex-places";
import { Loader } from "../../../common/loader";
import brightColorsStyles from "../map-styles/bright-colors";
import { useFetchProjects } from "../../../../hooks/use-project";
import { MapView } from "../../map-old/map-view";
import { Flex, Select, Typography } from "antd";
import {
  LivIndexDriversConfig,
  ProjectHomeType,
} from "../../../../libs/constants";
import { capitalize } from "../../../../libs/lvnzy-helper";
import { getProjectTypeIcon } from "../../map-old/project-type-icon";
import { COLORS } from "../../../../theme/style-constants";
import { useEffect, useState } from "react";
import { IDriverPlace } from "../../../../types/Project";

export type CastleFeatureProps = {
  name?: string;
  heading?: string;
  description?: string;
  placeId?: string;
  type?: string;
};

const MAP_STYLE_BRIGHT = {
  id: "styled1",
  label: 'Raster / "Bright Colors" (no mapId)',
  mapTypeId: "roadmap",
  styles: brightColorsStyles,
};

export type LivIndexPlacesGeoJson = FeatureCollection<
  Point,
  CastleFeatureProps
>;

export function LivIndexFull() {
  const { data: livindexPlaces, isLoading: livindexPlacesLoading } =
    useFetchAllLivindexPlaces();

  let { data: projects, isLoading: projectIsLoading } = useFetchProjects();

  let [homeTypeFilter, setHomeTypeFilter] = useState("apartment");
  let [driverFilters, setDriverFilters] = useState<string[]>([
    "industrial-hitech",
    "airport",
    "commercial",
  ]);

  let [filteredProjects, setFilteredProjects] = useState(projects);
  let [filteredDrivers, setFilteredDrivers] = useState<IDriverPlace[]>([]);

  useEffect(() => {
    if (projects && projects.length) {
      setFilteredProjects(
        projects.filter((p) => p.metadata.homeType.includes(homeTypeFilter))
      );
    }
  }, [projects, homeTypeFilter]);
  useEffect(() => {
    if (livindexPlaces && livindexPlaces.length) {
      setFilteredDrivers(
        livindexPlaces.filter((p) => driverFilters.includes(p.driver))
      );
    }
  }, [livindexPlaces, driverFilters]);

  const handleHomeTypeSelect = (value: string) => {
    setHomeTypeFilter(value);
  };
  const handleDriverSelect = (value: string[]) => {
    setDriverFilters(value);
  };

  if (livindexPlacesLoading) {
    return <Loader />;
  }

  if (livindexPlaces && projects) {
    projects = projects.filter(
      (p) => p.metadata.corridors && p.metadata.corridors.length
    );
    return (
      <Flex vertical>
        <Flex gap={16} style={{ marginBottom: 8 }}>
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

          {}
        </Flex>
        <Flex style={{ height: 800 }}>
          <MapView
            drivers={filteredDrivers.map((p) => p._id)}
            projects={filteredProjects!}
          ></MapView>
        </Flex>
      </Flex>
    );
  }
}
