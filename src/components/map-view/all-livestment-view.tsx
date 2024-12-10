import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { FeatureCollection, Point } from "geojson";
import { useEffect, useState } from "react";
import { useFetchLivindexPlaces } from "../../hooks/use-livindex-places";
import { PlaceType } from "../../types/Common";
import { Loader } from "../common/loader";
import { ClusteredMarkers } from "./clustered-markers";

export type CastleFeatureProps = {
  name?: string;
  heading?: string;
  description?: string;
  placeId?: string;
  type?: PlaceType;
};

export type LivIndexPlacesGeoJson = FeatureCollection<
  Point,
  CastleFeatureProps
>;

export function AllLivestmentView() {
  const { data: livindexPlaces, isLoading: livindexPlacesLoading } =
    useFetchLivindexPlaces({});

  const [geojson, setGeojson] = useState<LivIndexPlacesGeoJson | null>(null);
  const [numClusters, setNumClusters] = useState(4);

  useEffect(() => {
    if (livindexPlaces) {
      const formattedPlaces = livindexPlaces
        .filter((place) => place.type !== "road")
        .filter((place) => place.location?.lat && place.location?.lng);

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
              placeId: place.placeId || "",
              type: place.type,
            },
          };
        }),
      };

      console.log(formattedGeoJson);

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
        </Map>
      </APIProvider>
    );
  }
}
