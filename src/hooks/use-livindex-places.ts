import { useQuery } from "@tanstack/react-query";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { queryKeys } from "../libs/constants";
import { IDriverPlace } from "../types/Project";

export const getAllLivIndexPlaces = async (driversIds?: string[]) => {
  const endpoint = `/livindex-places`;
  return axiosApiInstance
    .post("/livindex-places", {
      driverIds: driversIds || [],
    })
    .then((response) => {
      return response.data as IDriverPlace[];
    });
};

export function useFetchAllLivindexPlaces(
  driverIds?: string[],
  mapTitle?: string
) {
  return useQuery<IDriverPlace[]>({
    queryKey: [queryKeys.getAllPlaces, mapTitle],
    queryFn: () => getAllLivIndexPlaces(driverIds),
    refetchOnWindowFocus: false,
  });
}
