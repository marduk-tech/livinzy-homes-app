import { AutoComplete, Empty, Flex, Input, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { SearchResult, usePlaceSearch } from "../../hooks/use-place-search";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { IDriverPlace } from "../../types/Project";
import DynamicReactIcon from "../common/dynamic-react-icon";

import { NearestTransitStationsDisplay } from "./nearest-transit-stations-display";

interface SearchSidebarProps {
  onResultSelect: (result: SearchResult) => void;
  transitDrivers: IDriverPlace[];
}

export const SearchSidebar: React.FC<SearchSidebarProps> = ({
  onResultSelect,
  transitDrivers,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(
    null
  );

  // Debounce search query to reduce API wait times
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { results, isLoading, isEmpty } = usePlaceSearch(
    debouncedSearchQuery,
    transitDrivers
  );

  const handleResultClick = (result: SearchResult) => {
    onResultSelect(result);
    setSelectedResult(result);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);

    if (selectedResult) {
      setSelectedResult(null);
    }
  };

  // Transform search results to AutoComplete options
  const getAutoCompleteOptions = () => {
    if (isLoading) {
      return [
        {
          value: "loading",
          label: (
            <Flex align="center" justify="center" style={{ padding: "8px" }}>
              <Spin size="small" style={{ marginRight: 8 }} />
              <Typography.Text style={{ color: COLORS.textColorLight }}>
                Searching...
              </Typography.Text>
            </Flex>
          ),
          disabled: true,
        },
      ];
    }

    if (isEmpty && debouncedSearchQuery.length >= 2) {
      return [
        {
          value: "no-results",
          label: (
            <Flex align="center" justify="center" style={{ padding: "16px" }}>
              <Typography.Text style={{ color: COLORS.textColorLight }}>
                No results found for "{debouncedSearchQuery}"
              </Typography.Text>
            </Flex>
          ),
          disabled: true,
        },
      ];
    }

    return results.map((result) => ({
      value: result.name,
      label: (
        <Flex gap={12} align="center" style={{ padding: "8px 4px" }}>
          {/* Icon */}
          <Flex
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              backgroundColor: COLORS.bgColorMedium,
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <DynamicReactIcon
              iconName={result.icon || "IoLocationOutline"}
              iconSet={getIconSet(result.icon || "IoLocationOutline")}
              size={16}
              color={getTypeColor(result.type)}
            />
          </Flex>

          {/* Content */}
          <Flex vertical style={{ flex: 1, minWidth: 0 }}>
            <Flex align="center" justify="space-between">
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                  fontWeight: 500,
                  color: COLORS.textColorDark,
                }}
                ellipsis={{ tooltip: result.name }}
              >
                {result.name}
              </Typography.Text>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.SUB_TEXT,
                  color: getTypeColor(result.type),
                  fontWeight: 500,
                  marginLeft: 8,
                }}
              >
                {getTypeLabel(result.type)}
              </Typography.Text>
            </Flex>
            {(result.description || result.address) && (
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.SUB_TEXT,
                  color: COLORS.textColorLight,
                  marginTop: 2,
                }}
                ellipsis={{ tooltip: result.address || result.description }}
              >
                {result.address || result.description}
              </Typography.Text>
            )}
          </Flex>
        </Flex>
      ),
      result,
    }));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "transit":
        return COLORS.primaryColor;
      case "project":
        return COLORS.greenIdentifier;
      case "locality":
        return COLORS.orangeIdentifier;
      case "place":
        return COLORS.yellowIdentifier;
      case "osm":
        return COLORS.textColorDark;
      default:
        return COLORS.textColorDark;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "transit":
        return "Metro";
      case "project":
        return "Project";
      case "locality":
        return "Area";
      case "place":
        return "Place";
      case "osm":
        return "Location";
      default:
        return "Place";
    }
  };

  const getIconSet = (iconName: string) => {
    if (iconName.startsWith("Io")) return "io5";
    if (iconName.startsWith("Fa")) return "fa";
    if (iconName.startsWith("Md")) return "md";
    if (iconName.startsWith("Gi")) return "gi";
    if (iconName.startsWith("Bi")) return "bi";
    return "io5";
  };

  const handleAutoCompleteSelect = (value: string, option: any) => {
    if (option.result) {
      handleResultClick(option.result);
    }
  };

  return (
    <Flex
      vertical
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      {/* Search Header */}
      <Flex
        vertical
        style={{
          padding: "0 16px",
        }}
      >
        <AutoComplete
          size="large"
          onSelect={handleAutoCompleteSelect}
          options={
            debouncedSearchQuery.length >= 2 ? getAutoCompleteOptions() : []
          }
          style={{
            width: "100%",
          }}
          dropdownStyle={{
            maxHeight: 400,
            overflowY: "auto",
          }}
          notFoundContent={null}
          allowClear
        >
          <Input
            placeholder="Search your place"
            value={searchQuery}
            onChange={handleSearchChange}
            prefix={
              <DynamicReactIcon
                iconName="IoSearch"
                iconSet="io5"
                size={16}
                color={COLORS.textColorLight}
              />
            }
            style={{
              borderRadius: 8,
            }}
          />
        </AutoComplete>
      </Flex>

      {/* Nearest Transit Stations - Show below search input when result is selected */}
      {selectedResult && (
        <NearestTransitStationsDisplay selectedResult={selectedResult} />
      )}

      {/* Footer */}
      {/* <Flex
        style={{
          padding: "12px 16px",
          borderTop: `1px solid ${COLORS.borderColor}`,
          backgroundColor: COLORS.bgColorMedium,
        }}
      >
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.SUB_TEXT,
            color: COLORS.textColorLight,
            textAlign: "center",
            width: "100%",
          }}
        >
          Powered by Brickfi 
        </Typography.Text>
      </Flex> */}
    </Flex>
  );
};
