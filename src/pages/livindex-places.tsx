import { Flex } from "antd";
import { LivestmentView } from "../components/map-view/livestment-view";

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
      <LivestmentView></LivestmentView>
    </Flex>
  );
}
