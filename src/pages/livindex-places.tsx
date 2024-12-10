import { Flex } from "antd";
import { AllLivestmentView } from "../components/map-view/all-livestment-view";
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
      <AllLivestmentView></AllLivestmentView>
    </Flex>
  );
}
