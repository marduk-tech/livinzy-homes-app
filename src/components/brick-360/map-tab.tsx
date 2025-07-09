import { Flex } from "antd";
import MapViewV2 from "../map-view/map-view-v2";
import { ScrollableContainer } from "../scrollable-container";
import { useDevice } from "../../hooks/use-device";

interface MapTabProps {
  lvnzyProject: any;
}

export const MapTab = ({ lvnzyProject }: MapTabProps) => {
  const { isMobile } = useDevice();
  return (
    <ScrollableContainer>
      <Flex style={{ height: window.innerHeight - 300 }} vertical gap={8}>
        <MapViewV2
          fullSize={false}
          projectId={lvnzyProject?.originalProjectId._id}
          drivers={[
            ...lvnzyProject.connectivity.drivers,
            ...lvnzyProject.neighborhood.drivers,
          ].map((d) => {
            return {
              ...d.driverId,
              duration: d.durationMins
                ? d.durationMins
                : Math.round(d.mapsDurationSeconds / 60),
            };
          })}
        />
      </Flex>
    </ScrollableContainer>
  );
};
