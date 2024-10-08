// useFetchProjects.ts

import { useQuery } from "@tanstack/react-query";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { queryKeys } from "../libs/constants";
import { Project } from "../types/Project";

/**
 * Custom hook to fetch all projects
 * @returns {UseQueryResult<Project[], Error>} The result of the useQuery hook containing an array of projects
 */
export const useFetchProjects = () => {
  return useQuery<Project[], Error>({
    queryKey: [queryKeys.projects],
    queryFn: async () => {
      const { data } = await axiosApiInstance.get("/projects");
      return data;
    },
  });
};

/**
 * Custom hook to fetch a single project by its ID
 * @param {string} id - The ID of the project to fetch
 * @returns {UseQueryResult<Project, Error>} The result of the useQuery hook containing a single project
 */
export const useFetchProjectById = (id: string) => {
  return useQuery<Project, Error>({
    queryKey: [queryKeys.getProjectById, id],
    queryFn: async () => {
      const { data } = await axiosApiInstance.get(`/projects/${id}`);
      return data as Project;
    },
  });
};
