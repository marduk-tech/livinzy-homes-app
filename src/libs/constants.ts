export const envMode = import.meta.env.MODE;

export const baseApiUrl = import.meta.env.VITE_API_URL;

export const queryKeys = {
  projects: "projects",
  getProjectById: "getProjectById",

  user: "user",
};

export const LocalStorageKeys = {
  authToken: "authToken",
  user: "user",
};

export const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
export const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
export const auth0CallbackUrl = import.meta.env.VITE_AUTH0_CALLBACK_URL;

export const LivestIndexConfig = [
  {
    key: "metroCityScore",
    type: "metro",
    heading: "Metro City",
    icon: { name: "FaCity", set: "fa" },
  },
  {
    key: "tier2CityScore",
    type: "tier2",
    heading: "Tier 2 Cities",
    icon: { name: "FaMountainCity", set: "fa" },
  },
  {
    key: "touristCityScore",
    type: "tourist",
    heading: "Travel Destinations",
    icon: { name: "MdModeOfTravel", set: "md" },
  },
  {
    key: "schoolsScore",
    type: "school",
    heading: "Schools",
    icon: { name: "IoMdSchool", set: "io" },
  },
  {
    key: "hospitalsScore",
    type: "hospital",
    heading: "Hospitals",
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
    heading: "Highways",
    type: "roads",
    icon: { name: "FaRoad", set: "fa" },
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

export const LivIQPredefinedQuestions = [
  "Tell me about the team behind this project",
  "Any idea about the plot availability?",
  "What about the water supply?",
];
