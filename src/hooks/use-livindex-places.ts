import { useQuery } from "@tanstack/react-query";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { queryKeys } from "../libs/constants";
import { IDriverPlace } from "../types/Project";

export const getAllLivIndexPlaces = async () => {
  const endpoint = `/livindex-places`;
  return axiosApiInstance.get(endpoint).then((response) => {
    return response.data as IDriverPlace[];
  });
};

export function useFetchAllLivindexPlaces() {
  return useQuery({
    queryKey: [queryKeys.getAllPlaces],
    queryFn: () => getAllLivIndexPlaces(),
  });
}
