export interface IMedia {
  _id: string;
  url: string;
  tags: string[];
}

export interface IMetadata {
  _id: string;
  name: string;
  location: string;
  website: string;
  oneLiner?: string;
  description: string;
}

export interface ILand {
  _id: string;
  total_area: string;
  plantation: string;
  irrigation: string;
  water_bodies: string;
  others: string;
}

export interface IPlots {
  _id: string;
  size_mix: string;
  facing_mix: string;
  shape_mix: string;
  plots_list: string;
  villa: string;
  cost_range: string;
  others: string;
}

export interface IConnectivity {
  _id: string;
  roads: string;
  towns: string;
  schools: string;
  hospital: string;
  airport: string;
  others: string;
}

export interface IClimate {
  _id: string;
  rainfall: string;
  temperature: string;
  humidity: string;
  others: string;
}

export interface IBasicInfra {
  _id: string;
  electricity: string;
  water_supply: string;
  pathways: string;
  security: string;
  others: string;
}

export interface IAmenities {
  _id: string;
  sports_external: string;
  swimming_pool: string;
  clubhouse: string;
  kids: string;
  parks: string;
  parking: string;
  others: string;
}

export interface ITeam {
  _id: string;
  partners: string;
  experience: string;
  others: string;
}

export interface Project {
  _id: string;
  metadata: IMetadata;
  land: ILand;
  plots: IPlots;
  media: IMedia[];
  connectivity: IConnectivity;
  climate: IClimate;
  basic_infra: IBasicInfra;
  amenities: IAmenities;
  team: ITeam;
  createdAt: string;
  updatedAt: string;
}
