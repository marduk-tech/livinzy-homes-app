import { Flex } from "antd";
import { MapFull } from "../components/map-view/map-full";

export function MapView() {
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
      <MapFull></MapFull>
    </Flex>
  );
}
