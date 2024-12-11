import { Flex } from "antd";
import { LivIndexMapView } from "../components/map-view/livindex-map-view";

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
      <LivIndexMapView></LivIndexMapView>
    </Flex>
  );
}
