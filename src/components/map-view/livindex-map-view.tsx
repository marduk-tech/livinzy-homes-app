import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { FeatureCollection, Point } from "geojson";
import { useEffect, useState } from "react";
import { useFetchAllLivindexPlaces } from "../../hooks/use-livindex-places";
import { Loader } from "../common/loader";
import { ClusteredMarkers } from "./clustered-markers";
import { RoadInfra } from "./road-infra";

export type CastleFeatureProps = {
  name?: string;
  heading?: string;
  description?: string;
  placeId?: string;
  type?: string;
};

export type LivIndexPlacesGeoJson = FeatureCollection<
  Point,
  CastleFeatureProps
>;

export function LivIndexMapView() {
  const { data: livindexPlaces, isLoading: livindexPlacesLoading } =
    useFetchAllLivindexPlaces({});

  const [geojson, setGeojson] = useState<LivIndexPlacesGeoJson | null>(null);
  const [numClusters, setNumClusters] = useState(4);
  const [roadsData, setRoadsData] = useState<any[]>();

  useEffect(() => {
    if (livindexPlaces) {
      const formattedPlaces = livindexPlaces
        .filter((place) => place.driver !== "road")
        .filter((place) => place.location?.lat && place.location?.lng);

      const roads = livindexPlaces.filter(
        (place) => place.driver === "road" || place.driver === "transit"
      );
      setRoadsData(roads);

      const formattedGeoJson: LivIndexPlacesGeoJson = {
        type: "FeatureCollection",
        features: formattedPlaces.map((place) => {
          const { lat, lng } = place.location!;

          // coordinates expects lng first then lat
          const cords = [lng, lat];

          return {
            type: "Feature",
            id: place._id,
            geometry: {
              type: "Point",
              coordinates: cords as any,
            },
            properties: {
              name: place.name || "",
              description: place.description || "",
              placeId: place._id || "",
              type: place.driver,
            },
          };
        }),
      };

      setGeojson(formattedGeoJson);
    }
  }, [livindexPlaces]);

  if (livindexPlacesLoading) {
    return <Loader />;
  }

  if (livindexPlaces && geojson) {
    return (
      <APIProvider apiKey={"AIzaSyADagII4pmkrk8R1VVsEzbz0qws3evTYfQ"}>
        <Map
          mapId={"bf51a910020fa25a"}
          defaultCenter={{ lat: 14.5638117, lng: 77.8884163 }}
          defaultZoom={7}
          gestureHandling={"greedy"}
          disableDefaultUI
        >
          {geojson && (
            <ClusteredMarkers
              geojson={geojson}
              setNumClusters={setNumClusters}
            />
          )}
          {roadsData &&
            roadsData.map((road) => {
              return <RoadInfra roadData={road}></RoadInfra>;
            })}
        </Map>
      </APIProvider>
    );
  }
}
