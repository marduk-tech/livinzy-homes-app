import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Locality } from "../types/Locality";
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

export interface OSMResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
  importance: number;
}

// OpenStreetMap Nominatim API search for Bangalore region
const searchNominatim = async (query: string): Promise<OSMResult[]> => {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query + " Bangalore")}&` +
        `format=json&limit=5&` +
        `viewbox=77.4126,12.7905,77.8129,13.1439&bounded=1&` +
        `addressdetails=1`
    );

    if (!response.ok) {
      throw new Error("Nominatim API error");
    }

    return await response.json();
  } catch (error) {
    console.error("Nominatim search error:", error);
    return [];
  }
};

export const usePlaceSearch = (
  query: string,
  transitDrivers: IDriverPlace[] = []
) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Fetch internal data sources
  const { projects: projectsData } = useProjectSearch();
  const { data: localitiesData } = useFetchLocalities();
  const { data: livindexPlaces } = useFetchAllLivindexPlaces();

  // External OSM search
  const { data: osmResults, isLoading: osmLoading } = useQuery<OSMResult[]>({
    queryKey: ["osm-search", query],
    queryFn: () => searchNominatim(query),
    enabled: query.length >= 3,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Combined search processing
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
      osmResults,
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
              place.driver !== "transit" // Exclude transit as we handle it separately
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

      // OSM Results
      if (osmResults && osmResults.length > 0) {
        const osmMatches = osmResults.slice(0, 5).map((osmResult) => ({
          id: `osm-${osmResult.place_id}`,
          name: osmResult.display_name.split(",")[0], // Get the main name
          type: "osm" as const,
          coordinates: [
            parseFloat(osmResult.lat),
            parseFloat(osmResult.lon),
          ] as [number, number],
          description: osmResult.type || "Place",
          address: osmResult.display_name,
          icon: getOSMIcon(osmResult.class, osmResult.type),
        }));
        results.push(...osmMatches);
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
    isLoading: osmLoading || processingResults,
    isEmpty: !combinedResults || combinedResults.length === 0,
  };
};

// helper function to get appropriate icon for OSM results
const getOSMIcon = (osmClass: string, osmType: string): string => {
  switch (osmClass) {
    case "amenity":
      switch (osmType) {
        case "school":
        case "university":
        case "college":
          return "IoMdSchool";
        case "hospital":
        case "clinic":
          return "FaRegHospital";
        case "restaurant":
        case "cafe":
        case "food_court":
          return "MdRestaurant";
        case "bank":
          return "FaUniversity";
        case "fuel":
          return "MdLocalGasStation";
        default:
          return "IoLocationOutline";
      }
    case "shop":
      return "FaStore";
    case "leisure":
      return "GiMountainRoad";
    case "tourism":
      return "MdAttractions";
    case "office":
      return "MdBusiness";
    case "highway":
    case "road":
      return "FaRoad";
    default:
      return "IoLocationOutline";
  }
};
