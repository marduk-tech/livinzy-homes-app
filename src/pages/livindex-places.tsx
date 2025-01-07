import { Flex } from "antd";
import { LivIndexAllMapView } from "../components/map-view/liv-index-all/livindex-all-map-view";

export function LivindexPlaces() {
  return (
    <Flex
      vertical
      style={{
        borderRadius: 16,
        height: "80vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <LivIndexAllMapView></LivIndexAllMapView>
    </Flex>
  );
}
