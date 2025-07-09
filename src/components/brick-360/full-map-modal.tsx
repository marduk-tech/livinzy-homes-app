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
    
  );
};
