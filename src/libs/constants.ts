export const envMode = import.meta.env.VITE_ENV;

export const baseApiUrl = import.meta.env.VITE_API_URL;

export const queryKeys = {
  projects: "projects",
  getProjectById: "getProjectById",
  getAllPlaces: "getAllPlaces",
  user: "user",
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
    label: "Leisure Activity",
    icon: { name: "FaRegHospital", set: "fa" },
  },
  commercial: {
    label: "Commercial Infra",
    icon: { name: "RiStore3Fill", set: "ri" },
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
  "tier-1-city": {
    label: "Tier 1 City",
    icon: { name: "PiCityBold", set: "pi" },
  },
  "tier-2-city": {
    label: "Tier 2 City",
    icon: { name: "FaMountainCity", set: "fa" },
  },
  "tourist-city": {
    label: "Tourist Destination",
    icon: { name: "MdModeOfTravel", set: "md" },
  },
  "satellite-city": {
    label: "Satellite Towns",
    icon: { name: "PiCityBold", set: "pi" },
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

export const PlaceholderContent = `North Bengaluru is emerging as a prime real estate destination bolstered by several significant infrastructural developments. Key commercial projects, such as **Prestige Tech Cloud and Bengaluru Signature Business Park**, are on the rise, offering vast office spaces. The area benefits from excellent connectivity through Bellary Road and Satellite Town Ring Road which handle substantial vehicular traffic. `;

export const subAreas = [
  {
    name: "sub-area-1",
    aliases: ["Near Yelahanka"],
    type: "sub-area",
    features: {
      type: "Polygon",
      coordinates: [
        [
          [77.5339813, 13.164118],
          [77.531578, 13.1594377],
          [77.5298614, 13.1484053],
          [77.5332946, 13.1447277],
          [77.5374145, 13.1336947],
          [77.5405044, 13.1196519],
          [77.5449676, 13.1119615],
          [77.5466842, 13.0932359],
          [77.5566406, 13.091564],
          [77.5593871, 13.0788564],
          [77.5611038, 13.0684893],
          [77.5665969, 13.0648105],
          [77.5768966, 13.0611317],
          [77.5865096, 13.0614662],
          [77.5998992, 13.062135],
          [77.607109, 13.0634728],
          [77.6122588, 13.0731713],
          [77.6201553, 13.0852103],
          [77.6263351, 13.0942391],
          [77.6349182, 13.1049396],
          [77.6311416, 13.1179801],
          [77.6251335, 13.1316887],
          [77.6211852, 13.1413844],
          [77.6168937, 13.1530858],
          [77.6126022, 13.1661238],
          [77.6059075, 13.1794113],
          [77.6016159, 13.1950389],
          [77.5924319, 13.1943705],
          [77.5825615, 13.1903591],
          [77.5736351, 13.1861808],
          [77.5648803, 13.1840081],
          [77.5542373, 13.1788268],
          [77.543251, 13.1751496],
          [77.5339813, 13.164118],
        ],
      ],
    },
  },
  {
    name: "sub-area-3",
    aliases: ["Near Dodaballapura"],
    type: "sub-area",
    features: {
      type: "Polygon",
      coordinates: [
        [
          [77.4782499, 13.3146771],
          [77.4713835, 13.3033179],
          [77.4720702, 13.2892851],
          [77.4748167, 13.2725783],
          [77.4748167, 13.2555362],
          [77.4765332, 13.2401639],
          [77.4823697, 13.230138],
          [77.4844296, 13.2221169],
          [77.4858029, 13.2181063],
          [77.4947291, 13.207411],
          [77.5009085, 13.1970487],
          [77.5153281, 13.1850161],
          [77.5659104, 13.1861836],
          [77.5990975, 13.1990549],
          [77.6107702, 13.2244564],
          [77.6210698, 13.2638903],
          [77.6155768, 13.2866121],
          [77.6073371, 13.3240314],
          [77.5936044, 13.3400666],
          [77.5754108, 13.3718004],
          [77.5407336, 13.3781456],
          [77.5146415, 13.3627811],
          [77.5029687, 13.3387303],
          [77.4782499, 13.3146771],
        ],
      ],
    },
  },
  {
    name: "sub-area-2",
    aliases: ["Near Devanahalli"],
    type: "sub-area",
    features: {
      type: "Polygon",
      coordinates: [
        [
          [77.6376081, 13.3141874],
          [77.6303983, 13.3141874],
          [77.6286817, 13.303162],
          [77.6231886, 13.2854535],
          [77.6287681, 13.2675762],
          [77.6255492, 13.2620208],
          [77.6229313, 13.2527894],
          [77.6313425, 13.251453],
          [77.653401, 13.2473592],
          [77.6623273, 13.2460224],
          [77.6803947, 13.2372499],
          [77.6907588, 13.2351195],
          [77.7040411, 13.2308164],
          [77.7232674, 13.2287283],
          [77.7347684, 13.2288111],
          [77.7494453, 13.2434312],
          [77.7435232, 13.268078],
          [77.7316786, 13.3034961],
          [77.7176023, 13.3088418],
          [77.6992344, 13.3043322],
          [77.6767469, 13.3065031],
          [77.6376081, 13.3141874],
        ],
      ],
    },
  },
  {
    name: "sub-area-5",
    aliases: ["Near Nandi Hills"],
    type: "sub-area",
    features: {
      type: "Polygon",
      coordinates: [
        [
          [77.6031393, 13.3889988],
          [77.5990195, 13.3733007],
          [77.6041693, 13.3545953],
          [77.6282019, 13.3352202],
          [77.646398, 13.3121686],
          [77.700643, 13.3064889],
          [77.719869, 13.351923],
          [77.7233023, 13.3819849],
          [77.7590079, 13.4087035],
          [77.7449316, 13.4237314],
          [77.7346319, 13.4420976],
          [77.6934332, 13.4424315],
          [77.680387, 13.4267369],
          [77.647428, 13.4187222],
          [77.6168722, 13.4097054],
          [77.6031393, 13.3889988],
        ],
      ],
    },
  },
  {
    name: "sub-area-4",
    aliases: ["Near Airport"],
    type: "sub-area",
    features: {
      type: "Polygon",
      coordinates: [
        [
          [77.6032743, 13.1949012],
          [77.6067075, 13.1811962],
          [77.6146039, 13.1674904],
          [77.6283369, 13.1262014],
          [77.6362333, 13.1103191],
          [77.6674756, 13.119347],
          [77.7110776, 13.1210188],
          [77.7272138, 13.1320525],
          [77.7533063, 13.1484348],
          [77.7569112, 13.2102766],
          [77.7545512, 13.2215149],
          [77.7482427, 13.2320848],
          [77.7291021, 13.2261524],
          [77.7026671, 13.2296625],
          [77.676402, 13.2383509],
          [77.6458463, 13.2477083],
          [77.6225003, 13.2517185],
          [77.6170072, 13.2293274],
          [77.6032743, 13.1949012],
        ],
      ],
    },
  },
];
