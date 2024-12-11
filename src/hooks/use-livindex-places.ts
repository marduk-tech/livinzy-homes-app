import { useQuery } from "@tanstack/react-query";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { queryKeys } from "../libs/constants";
import { PlaceType } from "../types/Common";
import { IDriverPlace } from "../types/Project";

export const getAllLivIndexPlaces = async ({
  type,
}: {
  type?: "road" | "hospital" | "school" | "futureInfra";
}) => {
  const endpoint = `/livindex-places${type ? `?type=${type}` : ""}`;
  return axiosApiInstance.get(endpoint).then((response) => {
    return response.data as IDriverPlace[];
  });
};

export function useFetchAllLivindexPlaces({ type }: { type?: PlaceType }) {
  return useQuery({
    queryKey: [queryKeys.getAllPlaces, type],
    queryFn: () => getAllLivIndexPlaces({ type }),
  });
}
