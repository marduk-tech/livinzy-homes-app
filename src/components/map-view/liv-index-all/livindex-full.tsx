import { FeatureCollection, Point } from "geojson";
import { useFetchAllLivindexPlaces } from "../../../hooks/use-livindex-places";
import { Loader } from "../../common/loader";
import brightColorsStyles from "../map-styles/bright-colors";
import { useFetchProjects } from "../../../hooks/use-project";
import { MapView } from "../map-view";
import { Flex, Typography } from "antd";
import { ProjectHomeType } from "../../../libs/constants";
import { capitalize } from "../../../libs/lvnzy-helper";
import { getProjectTypeIcon } from "../project-type-icon";
import { COLORS } from "../../../theme/style-constants";

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

  const { data: projects, isLoading: projectIsLoading } = useFetchProjects();

  if (livindexPlacesLoading) {
    return <Loader />;
  }

  if (livindexPlaces && projects) {
    return (
      <Flex vertical>
        <Flex gap={16} style={{ marginBottom: 8 }}>
          {Object.keys(ProjectHomeType).map((k: string) => {
            return (
              <Flex gap={4}>
                {getProjectTypeIcon(
                  (ProjectHomeType as any)[k],
                  COLORS.primaryColor
                )}
                <Typography.Text>
                  {capitalize((ProjectHomeType as any)[k])}
                </Typography.Text>
              </Flex>
            );
          })}
        </Flex>
        <Flex style={{ height: 800 }}>
          <MapView
            drivers={livindexPlaces
              .filter((p) => p.driver !== "hospital")
              .map((p) => p._id)}
            projects={projects!}
          ></MapView>
        </Flex>
      </Flex>
    );
  }
}
