import { useQuery } from "@tanstack/react-query";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { IDriverPlace } from "../types/Project";
import { useFetchAllLivindexPlaces } from "./use-livindex-places";
import { useFetchLocalities } from "./use-localities";
import { useProjectSearch } from "./use-project-search";

export interface SearchResult {
  id: string;
  name: string;
  type: "project" | "locality" | "transit" | "place" | "osm";
  coordinates: [number, number];
  description?: string;
  icon?: string;
  address?: string;
}

export interface GooglePlacesResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  business_status?: string;
  rating?: number;
}

const searchGooglePlaces = async (
  query: string
): Promise<GooglePlacesResult[]> => {
  if (!query.trim()) return [];

  try {
    const response = await axiosApiInstance.get(`/places/search`, {
      params: {
        q: query,
        location: "12.9716,77.5946",
        radius: 50000,
      },
    });

    if (response.data && response.data.results) {
      return response.data.results.slice(0, 5).map((place: any) => ({
        place_id: place.place_id || `custom-${Date.now()}-${Math.random()}`,
        name: place.name,
        formatted_address: place.formatted_address || place.vicinity || "",
        geometry: {
          location: {
            lat: place.geometry?.location?.lat || 12.9716,
            lng: place.geometry?.location?.lng || 77.5946,
          },
        },
        types: place.types || ["establishment"],
        business_status: place.business_status,
        rating: place.rating,
      }));
    }
  } catch (error) {
    console.error("Backend Google Places search error:", error);
  }

  return [];
};

export const usePlaceSearch = (
  query: string,
  transitDrivers: IDriverPlace[] = []
) => {
  // internal data sources
  const { projects: projectsData } = useProjectSearch();
  const { data: localitiesData } = useFetchLocalities();
  const { data: livindexPlaces } = useFetchAllLivindexPlaces();

  // Google Places search
  const { data: googlePlacesResults, isLoading: googlePlacesLoading } =
    useQuery<GooglePlacesResult[]>({
      queryKey: ["google-places-search", query],
      queryFn: () => searchGooglePlaces(query),
      enabled: query.length >= 3,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

  const { data: combinedResults, isLoading: processingResults } = useQuery<
    SearchResult[]
  >({
    queryKey: [
      "combined-search",
      query,
      projectsData,
      localitiesData,
      transitDrivers,
      livindexPlaces,
      googlePlacesResults,
    ],
    queryFn: async () => {
      if (!query.trim() || query.length < 2) return [];

      const results: SearchResult[] = [];
      const searchTerm = query.toLowerCase();

      // Search Projects
      if (projectsData) {
        const projectMatches = projectsData
          .filter((project) =>
            project.projectName.toLowerCase().includes(searchTerm)
          )
          .slice(0, 3)
          .map((project) => ({
            id: `project-${project.projectId}`,
            name: project.projectName,
            type: "project" as const,
            // Bangalore coords
            coordinates: [12.9716, 77.5946] as [number, number],
            description: "Real Estate Project",
            icon: "MdHomeWork",
          }));
        results.push(...projectMatches);
      }

      // search Localities
      if (localitiesData) {
        const localityMatches = localitiesData
          .filter(
            (locality) =>
              locality.name.toLowerCase().includes(searchTerm) ||
              locality.aliases?.some((alias) =>
                alias.toLowerCase().includes(searchTerm)
              )
          )
          .slice(0, 3)
          .map((locality) => ({
            id: `locality-${locality._id}`,
            name: locality.name,
            type: "locality" as const,
            coordinates: [locality.location.lat, locality.location.lng] as [
              number,
              number
            ],
            description: "Locality/Area",
            icon: "IoLocationOutline",
          }));
        results.push(...localityMatches);
      }

      // search Transit Stations
      const transitMatches = transitDrivers
        .filter((driver) => driver.name.toLowerCase().includes(searchTerm))
        .slice(0, 3)
        .map((driver) => ({
          id: `transit-${driver._id}`,
          name: driver.name,
          type: "transit" as const,
          coordinates: driver.location
            ? ([driver.location.lat, driver.location.lng] as [number, number])
            : ([12.9716, 77.5946] as [number, number]),
          description: "Metro Station",
          icon: "MdOutlineDirectionsTransit",
        }));
      results.push(...transitMatches);

      // search LivIndex Places (schools, hospitals, etc.)
      if (livindexPlaces) {
        const placeMatches = livindexPlaces
          .filter(
            (place) =>
              place.name.toLowerCase().includes(searchTerm) &&
              place.driver !== "transit" // we handle it separately
          )
          .slice(0, 3)
          .map((place) => ({
            id: `place-${place._id}`,
            name: place.name,
            type: "place" as const,
            coordinates: place.location
              ? ([place.location.lat, place.location.lng] as [number, number])
              : ([12.9716, 77.5946] as [number, number]),
            description:
              place.driver === "school"
                ? "Educational Institution"
                : place.driver === "hospital"
                ? "Healthcare Facility"
                : place.driver === "commercial"
                ? "Commercial Area"
                : "Place of Interest",
            icon:
              place.driver === "school"
                ? "IoMdSchool"
                : place.driver === "hospital"
                ? "FaRegHospital"
                : place.driver === "commercial"
                ? "FaStore"
                : "IoLocationOutline",
          }));
        results.push(...placeMatches);
      }

      // Google Places Results
      if (googlePlacesResults && googlePlacesResults.length > 0) {
        const googlePlacesMatches = googlePlacesResults
          .slice(0, 5)
          .map((placeResult) => ({
            id: `google-places-${placeResult.place_id}`,
            name: placeResult.name,
            type: "osm" as const, // Keep as "osm" for compatibility with existing UI
            coordinates: [
              placeResult.geometry.location.lat,
              placeResult.geometry.location.lng,
            ] as [number, number],
            description: getGooglePlacesDescription(placeResult.types),
            address: placeResult.formatted_address,
            icon: getGooglePlacesIcon(placeResult.types),
          }));
        results.push(...googlePlacesMatches);
      }

      // remove duplicates and sort by relevance
      const uniqueResults = results.filter(
        (result, index, self) =>
          index ===
          self.findIndex(
            (r) => r.name.toLowerCase() === result.name.toLowerCase()
          )
      );

      // sort by type priority and name relevance
      return uniqueResults
        .sort((a, b) => {
          const typePriority = {
            transit: 1,
            locality: 2,
            project: 3,
            place: 4,
            osm: 5,
          };
          const aPriority = typePriority[a.type] || 6;
          const bPriority = typePriority[b.type] || 6;

          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }

          // if same type sort alphabetically
          return a.name.localeCompare(b.name);
        })
        .slice(0, 10);
    },
    enabled: query.length >= 2,
    refetchOnWindowFocus: false,
    // cache for 2 minutes
    staleTime: 2 * 60 * 1000,
  });

  return {
    results: combinedResults || [],
    isLoading: googlePlacesLoading || processingResults,
    isEmpty: !combinedResults || combinedResults.length === 0,
  };
};

const getGooglePlacesIcon = (types: string[]): string => {
  if (
    types.includes("school") ||
    types.includes("university") ||
    types.includes("secondary_school")
  ) {
    return "IoMdSchool";
  }
  if (
    types.includes("hospital") ||
    types.includes("doctor") ||
    types.includes("pharmacy")
  ) {
    return "FaRegHospital";
  }
  if (
    types.includes("restaurant") ||
    types.includes("meal_takeaway") ||
    types.includes("food")
  ) {
    return "MdRestaurant";
  }
  if (
    types.includes("bank") ||
    types.includes("atm") ||
    types.includes("finance")
  ) {
    return "FaUniversity";
  }
  if (types.includes("gas_station") || types.includes("fuel")) {
    return "MdLocalGasStation";
  }
  if (
    types.includes("shopping_mall") ||
    types.includes("store") ||
    types.includes("clothing_store")
  ) {
    return "FaStore";
  }
  if (
    types.includes("park") ||
    types.includes("amusement_park") ||
    types.includes("zoo")
  ) {
    return "GiMountainRoad";
  }
  if (
    types.includes("tourist_attraction") ||
    types.includes("museum") ||
    types.includes("art_gallery")
  ) {
    return "MdAttractions";
  }
  if (types.includes("subway_station") || types.includes("transit_station")) {
    return "MdOutlineDirectionsTransit";
  }
  if (
    types.includes("locality") ||
    types.includes("sublocality") ||
    types.includes("neighborhood")
  ) {
    return "IoLocationOutline";
  }

  return "IoLocationOutline";
};

const getGooglePlacesDescription = (types: string[]): string => {
  if (
    types.includes("school") ||
    types.includes("university") ||
    types.includes("secondary_school")
  ) {
    return "Educational Institution";
  }
  if (
    types.includes("hospital") ||
    types.includes("doctor") ||
    types.includes("pharmacy")
  ) {
    return "Healthcare Facility";
  }
  if (
    types.includes("restaurant") ||
    types.includes("meal_takeaway") ||
    types.includes("food")
  ) {
    return "Restaurant/Food";
  }
  if (
    types.includes("bank") ||
    types.includes("atm") ||
    types.includes("finance")
  ) {
    return "Banking/Finance";
  }
  if (types.includes("gas_station") || types.includes("fuel")) {
    return "Gas Station";
  }
  if (
    types.includes("shopping_mall") ||
    types.includes("store") ||
    types.includes("clothing_store")
  ) {
    return "Shopping";
  }
  if (
    types.includes("park") ||
    types.includes("amusement_park") ||
    types.includes("zoo")
  ) {
    return "Recreation/Park";
  }
  if (
    types.includes("tourist_attraction") ||
    types.includes("museum") ||
    types.includes("art_gallery")
  ) {
    return "Tourist Attraction";
  }
  if (types.includes("subway_station") || types.includes("transit_station")) {
    return "Transit Station";
  }
  if (
    types.includes("locality") ||
    types.includes("sublocality") ||
    types.includes("neighborhood")
  ) {
    return "Locality/Area";
  }

  return "Place";
};
