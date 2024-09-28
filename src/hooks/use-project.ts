// useFetchProjects.ts

import { useQuery } from "@tanstack/react-query";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { queryKeys } from "../libs/constants";

/**
 * Custom hook to fetch project by id
 * @param {string} id - The ID of the project
 * @returns {UseQueryResult<Project, Error>} The result of the useQuery hook
 */
export const useFetchProject = (id?: string) => {
  return useQuery<any, Error>({
    queryKey: id ? [queryKeys.getProjectById, id] : [queryKeys.projects],
    queryFn: async () => {
      const endpoint = id ? `/projects/${id}` : "/projects";
      const { data } = await axiosApiInstance.get(endpoint);
      return data;
    },
  });
};
