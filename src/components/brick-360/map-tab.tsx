import { Button, Flex, Modal } from "antd";
import { useEffect, useState } from "react";
import { useDevice } from "../../hooks/use-device";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import DynamicReactIcon from "../common/dynamic-react-icon";
import MapViewV2 from "../map-view/map-view-v2";
import { ScrollableContainer } from "../scrollable-container";

interface MapTabProps {
  lvnzyProject: any;
}

export const MapTab = ({ lvnzyProject }: MapTabProps) => {
  const { isMobile } = useDevice();
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [surroundingElements, setSurroundingElements] = useState<any[]>([]);

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
          distance: d.distanceKms,
          duration: d.durationMins
            ? d.durationMins
            : Math.round(d.mapsDurationSeconds / 60),
        };
      })
    );

    if (lvnzyProject.property?.surroundings) {
      setSurroundingElements(lvnzyProject.property.surroundings);
    }
  }, [lvnzyProject]);

  return (
    <ScrollableContainer>
      <Flex
        style={{
          position: "relative",
          height: window.innerHeight - 300,
          paddingBottom: 40,
        }}
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

        {!isMapFullScreen && (
          <MapViewV2
            fullSize={false}
            projectId={lvnzyProject?.originalProjectId._id}
            drivers={drivers}
            surroundingElements={surroundingElements}
            isFromTab={true}
          />
        )}

        <Modal
          title={null}
          open={isMapFullScreen}
          onCancel={() => {
            setIsMapFullScreen(false);
          }}
          mask={true}
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
              surroundingElements={surroundingElements}
              fullSize={true}
              isFromTab={true}
            />
          </Flex>
        </Modal>
      </Flex>
    </ScrollableContainer>
  );
};
