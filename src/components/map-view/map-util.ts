import { Project } from "../../types/Project";

type MarkerData = Array<{
  id: string;
  position: google.maps.LatLngLiteral;
  zIndex: number;
  project: Project;
}>;

const googleMapsUrlRegex = /^https?:\/\/(www\.)?google\.com\/maps\/place\/.+/;

function extractLatLong(url: string) {
  const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  const match = url.match(regex);

  if (match) {
    const latitude = parseFloat(match[1]);
    const longitude = parseFloat(match[2]);
    return { latitude, longitude };
  }
}

export function getData({ projects }: { projects: Project[] }) {
  const data: MarkerData = [];

  projects.forEach((project, index) => {
    if (googleMapsUrlRegex.test(project.metadata.location)) {
      const latlng = extractLatLong(project.metadata.location);

      if (latlng && latlng.latitude && latlng.longitude) {
        data.push({
          id: String(index),
          position: { lat: latlng.latitude, lng: latlng.longitude },
          zIndex: index,
          project: project,
        });
      }
    }
  });

  return data;
}
