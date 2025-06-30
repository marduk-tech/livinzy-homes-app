import { Flex } from "antd";
import { ISurroundingElement } from "../../types/Project";
import MapViewV2 from "../map-view/map-view-v2";
import { ScrollableContainer } from "../scrollable-container";

interface MapTabProps {
  lvnzyProject: any;
  mapDrivers: any[];
  surroundingElements?: ISurroundingElement[];
  selectedDriverTypes: any;
}

export const MapTab = ({
  lvnzyProject,
  mapDrivers,
  surroundingElements,
  selectedDriverTypes,
}: MapTabProps) => {
  return (
    <ScrollableContainer>
      <Flex style={{ height: 650 }} vertical gap={8}>
        <MapViewV2
          fullSize={true}
          surroundingElements={surroundingElements}
          defaultSelectedDriverTypes={selectedDriverTypes}
          projectId={lvnzyProject?.originalProjectId._id}
          drivers={mapDrivers.map((d) => {
            return {
              id: d.driverId._id,
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
