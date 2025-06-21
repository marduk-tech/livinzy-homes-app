import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { axiosApiInstance } from "../libs/axios-api-Instance";

export interface WITHLVNZYRESPONSE {
  projectName: string;
  projectId: string;
  lvnzyProjectId: string | null;
}

export const useProjectSearch = () => {
  const { data: projects = [], isLoading } = useQuery<WITHLVNZYRESPONSE[]>({
    queryKey: ["projects-with-lvnzy"],
    queryFn: async () => {
      const { data } = await axiosApiInstance.get(`/projects/with-lvnzy`);
      return data;
    },
  });

  return {
    projects,
    isLoading,
  };
};
