export const envMode = import.meta.env.VITE_ENV;

export const baseApiUrl = import.meta.env.VITE_API_URL;

export const queryKeys = {
  projects: "projects",
  getProjectById: "getProjectById",
  getLvnzyProjectById: "getLvnzyProjectById",
  getAllPlaces: "getAllPlaces",
  getAllCorridors: "getAllCorridors",
  getAllLocalities: "getAllLocalities",
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
  highway: { label: "Roads", icon: { name: "FaRoad", set: "fa" } },
  school: { label: "School", icon: { name: "IoMdSchool", set: "io" } },
  university: {
    label: "University",
    icon: { name: "IoMdSchool", set: "io" },
  },
  hospital: { label: "Hospital", icon: { name: "FaRegHospital", set: "fa" } },
  leisure: {
    label: "Leisure/Tourism",
    icon: { name: "GiMountainRoad", set: "gi" },
  },
  commercial: {
    label: "Commercial",
    icon: { name: "FaStore", set: "fa" },
  },
  "industrial-hitech": {
    label: "Business Tech Park",
    icon: { name: "BiSolidFactory", set: "bi" },
  },
  "industrial-general": {
    label: "Industrial Area",
    icon: { name: "RiStore3Fill", set: "ri" },
  },
  airport: {
    label: "International Airport",
    icon: { name: "MdLocalAirport", set: "md" },
  },
  transit: {
    label: "Transit",
    icon: { name: "MdOutlineDirectionsTransit", set: "md" },
  },
  food: {
    label: "Dining",
    icon: { name: "IoFastFood", set: "io5" },
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

export enum BRICK360_CATEGORY {
  property = "property",
  areaConnectivity = "areaConnectivity",
  developer = "developer",
  financials = "financials",
}

export const Brick360CategoryInfo: Record<
  BRICK360_CATEGORY,
  { title: string; iconName: string; iconSet: string; disabled?: boolean }
> = {
  property: {
    title: "Property",
    iconName: "MdOutlineMapsHomeWork",
    iconSet: "md",
  },
  areaConnectivity: {
    title: "Location",
    iconName: "GiPathDistance",
    iconSet: "gi",
  },
  developer: {
    title: "Developer",
    iconName: "FaPeopleGroup",
    iconSet: "fa6",
  },
  financials: {
    title: "Financials",
    iconName: "TbPigMoney",
    iconSet: "tb",
  },
};

export const Brick360DataPoints = {
  property: {
    amenities: "Amenities",
    density: "Density",
    surroundings: "Surroundings",
    designAndBuildQuality: "Design/Build Quality",
  },
  areaConnectivity: {
    schoolsOffices: "Schools/Offices",
    conveniences: "Conveniences",
    transport: "Connectivity",
  },
  developer: {
    experience: "Experience",
    timeCommitment: "Time Committment",
    customerSatisfaction: "Customer Satisfaction",
  },
  financials: {
    pricePoint: "Price Point",
    rentalIncome: "Rental Income",
    growthPotential: "Growth Potential",
  },
};

export const SurroundingElementLabels = {
  runway_strip: {
    label: "Airport/Runwway Strip",
    icon: { name: "MdLocalAirport", set: "md" },
  },
  lake: { label: "Lake/Waterbody", icon: { name: "FaWater", set: "fa" } },
  railway: { label: "Railway Line", icon: { name: "MdTrain", set: "md" } },
  power: {
    label: "High Tension Line",
    icon: { name: "MdElectricBolt", set: "md" },
  },
  highway: { label: "Highway/Expressway", icon: { name: "GiRoad", set: "gi" } },
  forest: { label: "Forest Area", icon: { name: "GiPalmTree", set: "gi" } },
  cemetery: {
    label: "Cemetery/Graveyard",
    icon: { name: "TbGrave", set: "tb" },
  },
  sewageDrainage: {
    label: "Sewage/Drainage",
    icon: { name: "FaHouseFloodWater", set: "fa6" },
  },
};

export const LandingConstants = {
  consultUsLink: "https://xcaklnxh.formester.com/f/NSwf98IzN",
};
