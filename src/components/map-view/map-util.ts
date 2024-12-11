import {
  IDriverPlace,
  IMegaDriverScore,
  IPlace,
  Project,
} from "../../types/Project";

type MarkerData = Array<{
  id: string;
  position?: google.maps.LatLngLiteral;
  zIndex?: number;
  project: Project;
}>;

type LivestmentMarkerData = Array<{
  id: string;
  position?: google.maps.LatLngLiteral;
  zIndex: number;
  place: IPlace;
}>;

function extractLatLong(url: string) {
  const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  const match = url.match(regex);

  if (match) {
    const latitude = parseFloat(match[1]);
    const longitude = parseFloat(match[2]);
    return { latitude, longitude };
  }
}

export function getProjectLivestmentDataV2(
  project: Project | undefined
): IPlace[] {
  if (!project) {
    return [];
  }

  const data: IPlace[] = [];

  let indexOffset = 1;

  // data.push({
  //   id: project._id,
  //   position: {
  //     lat: project.metadata.location.lat,
  //     lng: project.metadata.location.lng,
  //   },
  //   zIndex: indexOffset,
  //   place: {
  //     _id: project._id,
  //     driver: "project",
  //     name: project.metadata.name,
  //     icon: {
  //       name: "FaMapMarkerAlt",
  //       set: "fa",
  //     },
  //   },
  // });

  project.livIndexScore.megaDriverScores.forEach(
    (megaDriverScore: IMegaDriverScore, index: number) => {
      megaDriverScore.places.forEach((place: IPlace, index2: number) => {
        data.push(place);
      });
    }
  );

  return data;
}

export function getAllLivestmentData(livIndexPlaces: IDriverPlace[]) {
  // const data: LivestmentMarkerData = [];
  // let indexOffset = 1;
  // const subLivestments = LivestIndexConfig;
  // subLivestments.forEach((sl: any) => {
  //   if (sl.type == "road") {
  //     const subLiv = livIndexPlaces.filter((place) => place.driver === sl.type);
  //     subLiv.forEach((p: any, index: number) => {
  //       data.push({
  //         id: `r-${Math.round(Math.random() * 1000)}`,
  //         zIndex: indexOffset + index,
  //         place: {
  //           ...sl,
  //           ...p,
  //           placeId: p.placeId,
  //         },
  //       });
  //     });
  //   } else {
  //     const subLiv = livIndexPlaces.filter((place) => place.driver === sl.type);
  //     subLiv.forEach((p: any, index: number) => {
  //       data.push({
  //         id: `${sl.key}-${String(index)}`,
  //         position: p.latLng,
  //         zIndex: index + indexOffset,
  //         place: {
  //           ...p,
  //           ...sl,
  //           placeId: p.placeId,
  //         },
  //       });
  //       indexOffset += 1;
  //     });
  //   }
  // });
  // return data;
  return [];
}

export function getData({ projects }: { projects: Project[] }) {
  const data: MarkerData = [];

  projects.forEach((project, index) => {
    if (project.metadata?.location?.lat && project.metadata?.location?.lng) {
      data.push({
        id: String(index),
        position: {
          lat: project.metadata.location.lat,
          lng: project.metadata.location.lng,
        },
        zIndex: index,
        project: project,
      });
    }
  });

  return data;
}
