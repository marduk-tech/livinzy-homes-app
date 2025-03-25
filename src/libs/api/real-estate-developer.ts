import { RealEstateDeveloper } from "../../types/real-estate-developer";
import { axiosApiInstance } from "../axios-api-Instance";

export const getAllDevelopers = async () => {
  const response = await axiosApiInstance.get("/developers");
  return response.data;
};

export const getDeveloperById = async (id: string) => {
  const response = await axiosApiInstance.get(`/developers/${id}`);
  return response.data;
};

export const createDeveloper = async (data: Partial<RealEstateDeveloper>) => {
  const response = await axiosApiInstance.post("/developers", data);
  return response.data;
};

export const updateDeveloper = async (
  id: string,
  data: Partial<RealEstateDeveloper>
) => {
  const response = await axiosApiInstance.put(`/developers/${id}`, data);
  return response.data;
};

export const deleteDeveloper = async (id: string) => {
  const response = await axiosApiInstance.delete(`/developers/${id}`);
  return response.data;
};
