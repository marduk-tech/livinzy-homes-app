export interface IMedia {
  _id: string;
  type: "image" | "video";
  image?: {
    url: string;
    tags: string[];
    caption?: string;
  };
  isPreview: boolean;
  video?: {
    url: string;
    tags: string[];
    caption?: string;
    bunnyVideoId?: string;
    bunnyTitle?: string;
    status?: string;
    directPlayUrl?: string;
    hlsUrl?: string;
    thumbnailUrl?: string;
    previewUrl?: string;
  };
}

export interface ILocation {
  mapLink: string;
  lat: number;
  lng: number;
}

export interface IMetadata {
  _id: string;
  name: string;
  location: ILocation;
  website: string;
  oneLiner?: string;
  description: string;
  summary: string;
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

export interface IUI {
  summary: string;
  description: string;
  oneLiner: string;
  highlights: string;
  costSummary: string;
  amenitiesSummary: string;
  categories: string[];
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
  ui: IUI;
  createdAt: string;
  updatedAt: string;
  livestment: ILivestment;
}

export interface ProjectField {
  dbField: string;
  fieldDisplayName: string;
  fieldDescription: string;
  mustHave?: boolean;
  hide?: boolean;
}

export interface IPlace {
  name?: string;
  totalReviews?: number;
  latLng?: string;
  heading?: string;
  type:
    | "hospital"
    | "school"
    | "project"
    | "metro"
    | "tier2"
    | "tourist"
    | "road";
  icon: { name: string; set: any };
  placeId?: string;
}

export interface ISubLivestment {
  score: number;
  placesList: [IPlace];
}

export interface ILivestment {
  livestmentScore: number;
  schools: ISubLivestment;
  hospitals: ISubLivestment;
}

export interface ProjectStructure {
  metadata: ProjectField[];
  ui: ProjectField[];
  land: ProjectField[];
  plots: ProjectField[];
  connectivity: ProjectField[];
  status: ProjectField[];
  basic_infra: ProjectField[];
  amenities: ProjectField[];
  clickToAction: ProjectField[];
  team: ProjectField[];
}
