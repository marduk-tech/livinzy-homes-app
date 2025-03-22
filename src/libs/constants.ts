export const envMode = import.meta.env.VITE_ENV;

export const baseApiUrl = import.meta.env.VITE_API_URL;

export const queryKeys = {
  projects: "projects",
  getProjectById: "getProjectById",
  getLvnzyProjectById: "getLvnzyProjectById",
  getAllPlaces: "getAllPlaces",
  getAllCorridors: "getAllCorridors",
  user: "user",
  paymentById: "paymentById",
};

export const LocalStorageKeys = {
  authToken: "authToken",
  user: "user",
};

export const env = import.meta.env.VITE_ENV;
export const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
export const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
export const auth0CallbackUrl = import.meta.env.VITE_AUTH0_CALLBACK_URL;
export const posthogkey = import.meta.env.VITE_POSTHOG_KEY;

export const LivIndexMegaDriverConfig = {
  macro: { label: "Macro Infra" },
  connectivity: { label: "Connectivity" },
  livability: { label: "Livability" },
};

export const enum PLACE_TIMELINE {
  ANNOUNCED = "announced",
  PRE_CONSTRUCTION = "pre-construction",
  CONSTRUCTION = "construction",
  PARTIAL_LAUNCH = "partial-launch",
  LAUNCHED = "launched",
  POST_LAUNCH = "post-launch",
}

export const LivIndexDriversConfig = {
  highway: { label: "Road Network", icon: { name: "FaRoad", set: "fa" } },
  school: { label: "Schools", icon: { name: "IoMdSchool", set: "io" } },
  university: {
    label: "Universities",
    icon: { name: "IoMdSchool", set: "io" },
  },
  hospital: { label: "Hospitals", icon: { name: "FaRegHospital", set: "fa" } },
  leisure: {
    label: "Leisure/Tourism",
    icon: { name: "GiMountainRoad", set: "gi" },
  },
  commercial: {
    label: "Commercial Infra",
    icon: { name: "FaStore", set: "fa" },
  },
  "industrial-hitech": {
    label: "Hitech Industrial Parks",
    icon: { name: "BiSolidFactory", set: "bi" },
  },
  "industrial-general": {
    label: "Industrial Parks",
    icon: { name: "RiStore3Fill", set: "ri" },
  },
  airport: {
    label: "International Airport",
    icon: { name: "MdLocalAirport", set: "md" },
  },
  transit: {
    label: "Transit Network",
    icon: { name: "MdOutlineDirectionsTransit", set: "md" },
  },
};

export const LivestIndexConfig = [
  {
    key: "metroCityScore",
    type: "metro",
    heading: "Metro",
    icon: { name: "PiCityBold", set: "fa" },
  },
  {
    key: "tier2CityScore",
    type: "tier2",
    heading: "Town",
    icon: { name: "FaMountainCity", set: "fa" },
  },
  {
    key: "touristCityScore",
    type: "tourist",
    heading: "Tourist Spot",
    icon: { name: "MdModeOfTravel", set: "md" },
  },
  {
    key: "schoolsScore",
    type: "school",
    heading: "School",
    icon: { name: "IoMdSchool", set: "io" },
  },
  {
    key: "hospitalsScore",
    type: "hospital",
    heading: "Hospital",
    icon: { name: "FaRegHospital", set: "fa" },
  },
  {
    key: "airportScore",
    type: "airport",
    heading: "Airport",
    icon: { name: "MdLocalAirport", set: "md" },
  },
  {
    key: "roadsScore",
    heading: "Highway",
    type: "road",
    icon: { name: "FaRoad", set: "fa" },
  },
  {
    key: "futureInfraScore",
    heading: "Future Infra",
    type: "futureInfra",
    icon: { name: "BsBuildingCheck", set: "bs" },
  },
];

export const ProjectCategories = [
  {
    key: "bo",
    label: "Bangalore Outskirts",
    icon: {
      name: "FaMountainCity",
      set: "fa6",
    },
  },
  {
    key: "hh",
    label: "Holiday Homes",
    icon: {
      name: "FaPersonWalkingLuggage",
      set: "fa6",
    },
  },
  {
    key: "lf",
    label: "Luxury Farmhouses",
    icon: {
      name: "RiMoneyCnyCircleFill",
      set: "ri",
    },
  },
  {
    key: "he",
    label: "Harvest & Earn",
    icon: {
      name: "GiPlantSeed",
      set: "gi",
    },
  },
  {
    key: "tp",
    label: "Themed Projects",
    icon: {
      name: "GiLockedFortress",
      set: "gi",
    },
  },
  {
    key: "bl",
    label: "Bigger Lands",
    icon: {
      name: "PiFarm",
      set: "pi",
    },
  },
  {
    key: "pf",
    label: "Pocket Friendly",
    icon: {
      name: "GiTakeMyMoney",
      set: "gi",
    },
  },
];

export const LocationFilters = [
  {
    value: "chikkaballapur",
    label: "Chikkaballapur",
  },
  {
    value: "doddaballapura",
    label: "Doddaballapura",
  },
  {
    value: "sakleshpur",
    label: "Sakleshpur",
  },
  {
    value: "kanakpura",
    label: "Kanakpura",
  },
  {
    value: "mysuru",
    label: "Mysuru",
  },
];

export const LivIQPredefinedQuestions = [
  "Tell me about the team behind this project",
  "Any idea about the plot availability?",
  "What about the water supply?",
];

export enum ProjectHomeType {
  FARMLAND = "farmland",
  PLOT = "plot",
  VILLA = "villa",
  ROWHOUSE = "rowhouse",
  VILLAMENT = "villament",
  APARTMENT = "apartment",
  PENTHOUSE = "penthouse",
}

export const PlaceholderContent = `# Liv is the AI Agent for Real Estate.

**Liv** is here to make your property search effortless for North Bengaluru which is rapidly emerging as a real estate hotspot, fueled by its proximity to the **Airport, KIADB Hi-Tech Park, Metro, Highways, the upcoming Foxconn Factory** and more.  


### 💡 Ask Liv anything
`;

export const POP_STAR_DATA_POINTS = {
  property: {
    amenities: "Amenities",
    densityRating: "Density",
    openAreaRating: "Open Area",
    surroundings: "Surroundings",
  },
  developer: {
    experience: "Past Experience",
    timeCommitment: "Time Committment",
  },
  neighborhood: {
    schools: "Schools",
    hospitals: "Hospitals",
    food: "Dining",
    commercial: "Commercial",
    industrial: "Industrial",
  },
  connectivity: {
    connectingRoads: "Immediate Connectivity",
    transit: "Transit",
    drive: "Drive",
  },
  investment: {
    priceAppreciation: "Price Appreciation",
    rentalIncome: "Rental Income",
    corridorPricePoint: "Corridor Price Point",
    cityPricePoint: "City Level Price Point",
  },
};
