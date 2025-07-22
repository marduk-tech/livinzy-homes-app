import { Button, Flex, Modal } from "antd";
import MapViewV2 from "../map-view/map-view-v2";
import { ScrollableContainer } from "../scrollable-container";
import { useDevice } from "../../hooks/use-device";
import DynamicReactIcon from "../common/dynamic-react-icon";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { useEffect, useState } from "react";

interface MapTabProps {
  lvnzyProject: any;
}

export const MapTab = ({ lvnzyProject }: MapTabProps) => {
  const { isMobile } = useDevice();
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  useEffect(() => {
    if (!lvnzyProject) {
      return;
    }
    setDrivers(
      [
        ...lvnzyProject.connectivity.drivers,
        ...lvnzyProject.neighborhood.drivers,
      ].map((d) => {
        return {
          ...d.driverId,
          duration: d.durationMins
            ? d.durationMins
            : Math.round(d.mapsDurationSeconds / 60),
        };
      })
    );
  }, [lvnzyProject]);

  return (
    <ScrollableContainer>
      <Flex
        style={{ position: "relative", height: window.innerHeight - 300 }}
        vertical
        gap={8}
      >
        {!isMapFullScreen && (
          <Flex
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 9999,
            }}
          >
            <Button
              size="small"
              icon={
                <DynamicReactIcon
                  iconName="FaExpand"
                  color="white"
                  iconSet="fa"
                  size={16}
                />
              }
              style={{
                marginLeft: "auto",
                marginBottom: 8,
                borderRadius: 8,
                cursor: "pointer",
                backgroundColor: COLORS.textColorDark,
                color: "white",
                fontSize: FONT_SIZE.HEADING_4,
                height: 28,
              }}
              onClick={() => {
                setIsMapFullScreen(true);
              }}
            >
              Expand
            </Button>
          </Flex>
        )}

        <MapViewV2
          fullSize={false}
          projectId={lvnzyProject?.originalProjectId._id}
          drivers={drivers}
          isFromTab={true}
        />
        <Modal
          title={null}
          open={isMapFullScreen}
          onCancel={() => {
            setIsMapFullScreen(false);
          }}
          forceRender
          footer={null}
          width={isMobile ? "100%" : 900}
          style={{ top: 10 }}
          styles={{
            content: {
              backgroundColor: COLORS.bgColorMedium,
              borderRadius: 8,
              padding: 0,
              overflowY: "hidden",
            },
          }}
        >
          <Flex
            style={{ height: Math.min(window.innerHeight - 20, 800) }}
            vertical
            gap={8}
          >
            <MapViewV2
              projectId={lvnzyProject?.originalProjectId._id}
              drivers={drivers}
              fullSize={true}
              isFromTab={true}
            />
          </Flex>
        </Modal>
      </Flex>
    </ScrollableContainer>
  );
};
