import { Empty, Flex, Input, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { SearchResult, usePlaceSearch } from "../../hooks/use-place-search";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { IDriverPlace } from "../../types/Project";
import DynamicReactIcon from "../common/dynamic-react-icon";

import { NearestTransitStationsDisplay } from "./nearest-transit-stations-display";
import { SearchResultItem } from "./search-result-item";

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

  const renderSearchContent = () => {
    if (selectedResult) {
      return null;
    }

    // if (debouncedSearchQuery.length < 2) {
    //   return (
    //     <Flex
    //       vertical
    //       align="center"
    //       justify="center"
    //       style={{
    //         padding: "40px 20px",
    //         textAlign: "center",
    //         color: COLORS.textColorLight,
    //       }}
    //     >
    //       <DynamicReactIcon
    //         iconName="IoSearch"
    //         iconSet="io5"
    //         size={48}
    //         color={COLORS.textColorLight}
    //       />
    //       <Typography.Text
    //         style={{
    //           fontSize: FONT_SIZE.SUB_TEXT,
    //           color: COLORS.textColorLight,
    //           marginTop: 8,
    //         }}
    //       >
    //         Search a place to see if a metro is coming near you !
    //       </Typography.Text>
    //     </Flex>
    //   );
    // }

    if (isLoading) {
      return (
        <Flex align="center" justify="center" style={{ padding: "40px 20px" }}>
          <Spin size="large" />
        </Flex>
      );
    }

    if (isEmpty) {
      return (
        <Flex align="center" justify="center" style={{ padding: "40px 20px" }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Typography.Text style={{ color: COLORS.textColorLight }}>
                No results found for "{debouncedSearchQuery}"
              </Typography.Text>
            }
          />
        </Flex>
      );
    }

    return (
      <Flex vertical>
        {/* Results Header */}
        {/* <Flex
          style={{
            padding: "12px 16px",
            backgroundColor: COLORS.bgColorMedium,
            borderBottom: `1px solid ${COLORS.borderColor}`,
          }}
        >
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.SUB_TEXT,
              color: COLORS.textColorDark,
              fontWeight: 500,
            }}
          >
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </Typography.Text>
        </Flex> */}

        {/* Results List */}
        <Flex
          vertical
          style={{
            maxHeight: "calc(100vh - 300px)",
            overflowY: "auto",
            scrollbarWidth: "thin",
          }}
        >
          {results.map((result) => (
            <SearchResultItem
              key={result.id}
              result={result}
              onClick={handleResultClick}
            />
          ))}
        </Flex>
      </Flex>
    );
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
        <Input
          size="large"
          placeholder="Search your place"
          value={searchQuery}
          onChange={handleSearchChange}
          prefix={
            <DynamicReactIcon
              iconName="IoSearch"
              iconSet="io5"
              size={FONT_SIZE.HEADING_3}
              color={COLORS.textColorLight}
            />
          }
          allowClear
          style={{
            borderRadius: 8,
          }}
        />
      </Flex>

      {/* Nearest Transit Stations - Show below search input when result is selected */}
      {selectedResult ? (
        <NearestTransitStationsDisplay selectedResult={selectedResult} />
      ) : (
        /* Search Content */
        <Flex vertical style={{ flex: 1, minHeight: 0 }}>
          {renderSearchContent()}
        </Flex>
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
