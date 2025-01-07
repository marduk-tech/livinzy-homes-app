import { useQuery } from "@tanstack/react-query";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { queryKeys } from "../libs/constants";
import { ILivIndexPlaces } from "../types/Common";

export const getAllLivIndexPlaces = async () => {
  const endpoint = `/livindex-places`;
  return axiosApiInstance.get(endpoint).then((response) => {
    const places = response.data.map((place: any) => {
      const { lat, lng } = place.location || {};
      return {
        ...place,
        createdAt: new Date(place.createdAt),
        updatedAt: new Date(place.updatedAt),
        features: place.features || {},
        location:
          lat != null && lng != null
            ? { lat: Number(lat), lng: Number(lng) }
            : undefined,
      };
    });
    return places as ILivIndexPlaces[];
  });
};

export function useFetchAllLivindexPlaces() {
  return useQuery<ILivIndexPlaces[]>({
    queryKey: [queryKeys.getAllPlaces],
    queryFn: () => getAllLivIndexPlaces(),
  });
}
