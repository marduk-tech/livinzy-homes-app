export interface NavLink {
  title: string;
  link?: string;
  icon: {
    name?: string;
    set?: string;
    src?: string;
  };
  alignBottom?: boolean;
}

export interface ILivIndexPlaces {
  _id: string;
  name: string;
  description?: string;
  type?: PlaceType;
  placeId?: string;
  pincode?: string;
  location?: {
    lat?: number;
    lng?: number;
  };
  status?: string;
  features?: any;
  driver: string;
  megaDriver: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PlaceType = "road" | "hospital" | "school" | "futureInfra";
