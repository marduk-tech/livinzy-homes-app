import { GoogleMap, MarkerF } from "@react-google-maps/api";
import { useCallback, useState } from "react";
import { mapStylesAirbnb } from "../libs/map-style";
import { Project } from "../types/Project";

const containerStyle = {
  width: "100%",
  height: "800px",
};

const center = {
  lat: 12.8767065,
  lng: 75.8351101,
};

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

export function ProjectsMapView({ projects }: { projects: Project[] }) {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        styles: mapStylesAirbnb,
        scrollwheel: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false,
      }}
    >
      <>
        {projects
          .filter((project) =>
            googleMapsUrlRegex.test(project.metadata.location)
          )
          .map((project) => {
            const latlng = extractLatLong(project.metadata.location);

            if (latlng && latlng.latitude && latlng.longitude) {
              return (
                <MarkerF
                  key={project._id}
                  position={{
                    lat: latlng.latitude,
                    lng: latlng.longitude,
                  }}
                ></MarkerF>
              );
            }
          })}
      </>
    </GoogleMap>
  );
}
