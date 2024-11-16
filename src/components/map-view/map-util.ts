import { LivestIndexConfig } from "../../libs/constants";
import { IPlace, Project } from "../../types/Project";

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

export function getLivestmentData(project: Project) {
  const data: LivestmentMarkerData = [];

  let indexOffset = 1;

  data.push({
    id: `p-${String(indexOffset)}`,
    position: {
      lat: project.metadata.location.lat,
      lng: project.metadata.location.lng,
    },
    zIndex: indexOffset,
    place: {
      type: "project",
      name: project.metadata.name,
      icon: {
        name: "FaMapMarkerAlt",
        set: "fa",
      },
    },
  });

  const subLivestments = LivestIndexConfig;
  subLivestments.forEach((sl: any) => {
    if (sl.type == "roads") {
      const subLiv = (project.livestment as any)[sl.key];
      subLiv.placesList.forEach((p: any, index: number) => {
        data.push({
          id: `r-${Math.round(Math.random() * 1000)}`,
          zIndex: indexOffset + index,
          place: {
            ...sl,
            ...p,
          },
        });
      });
    } else {
      const subLiv = (project.livestment as any)[sl.key];
      subLiv.placesList.forEach((p: any, index: number) => {
        data.push({
          id: `${sl.key}-${String(index)}`,
          position: p.latLng,
          zIndex: index + indexOffset,
          place: {
            ...p,
            ...sl,
          },
        });
        indexOffset += 1;
      });
    }
  });

  return data;
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
