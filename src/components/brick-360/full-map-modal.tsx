import { Flex, Modal } from "antd";
import { COLORS } from "../../theme/style-constants";
import MapViewV2 from "../map-view/map-view-v2";

interface FullMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  lvnzyProject: any;
  surroundingElements: any[];
  selectedDriverTypes: any[];
  mapDrivers: any[];
}

export const FullMapModal = ({
  isOpen,
  onClose,
  isMobile,
  lvnzyProject,
  surroundingElements,
  selectedDriverTypes,
  mapDrivers,
}: FullMapModalProps) => {
  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={onClose}
      forceRender
      footer={null}
      width={isMobile ? "100%" : 900}
      style={{ top: 30 }}
      styles={{
        content: {
          backgroundColor: COLORS.bgColorMedium,
          borderRadius: 8,
          padding: 16,
          overflowY: "hidden",
        },
      }}
    >
      <Flex style={{ height: 650, paddingTop: 40 }} vertical gap={8}>
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
    </Modal>
  );
};
