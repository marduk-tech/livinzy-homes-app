import { Flex } from "antd";
import { LivIndexFull } from "../components/map-view/liv-index-all/livindex-full";

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
      <LivIndexFull></LivIndexFull>
    </Flex>
  );
}
