import { Project } from "../../types/Project";
import { axiosApiInstance } from "../axios-api-Instance";

// Create a new project
export const createProject = async (projectData: Partial<Project>) => {
  const endpoint = `/projects`;
  return axiosApiInstance.post(endpoint, projectData).then((response) => {
    return response.data as Project;
  });
};

// Get all projects
export const getAllProjects = async () => {
  const endpoint = `/projects`;

  return axiosApiInstance.get(endpoint).then((response) => {
    return response.data as Project[];
  });
};

// Get a project by ID
export const getProjectById = async (id: string) => {
  const endpoint = `/projects/${id}`;
  return axiosApiInstance.get(endpoint).then((response) => {
    return response.data as Project;
  });
};

// Update a project by ID
export const updateProject = async (
  id: string,
  projectData: Partial<Project>
) => {
  const endpoint = `/projects/${id}`;
  return axiosApiInstance.put(endpoint, projectData).then((response) => {
    return response.data as Project;
  });
};

// Delete a project by ID
export const deleteProject = async (id: string) => {
  const endpoint = `/projects/${id}`;
  return axiosApiInstance.delete(endpoint).then((response) => {
    return response.data as Project;
  });
};
