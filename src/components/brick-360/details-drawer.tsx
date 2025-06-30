import { Button, Divider, Drawer, Flex, Space, Typography } from "antd";
import { MutableRefObject } from "react";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import DynamicReactIcon from "../common/dynamic-react-icon";
import Brick360Chat from "../liv/brick360-chat";
import MapViewV2 from "../map-view/map-view-v2";

interface DetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onExpandMap: () => void;
  mapVisible: boolean;
  isMobile: boolean;
  lvnzyProject: any;
  selectedDriverTypes: any[];
  surroundingElements: any[];
  mapDrivers: any[];
  selectedDataPointTitle: string;
  selectedDataPointCategory: string;
  selectedDataPoint: any;
  lvnzyProjectId: string;
  chatRef: MutableRefObject<any>;
  renderDrawerCloseBtn: () => React.ReactNode;
}

export const DetailsDrawer = ({
  isOpen,
  onClose,
  onExpandMap,
  mapVisible,
  isMobile,
  lvnzyProject,
  selectedDriverTypes,
  surroundingElements,
  mapDrivers,
  selectedDataPointTitle,
  selectedDataPointCategory,
  selectedDataPoint,
  lvnzyProjectId,
  chatRef,
  renderDrawerCloseBtn,
}: DetailsDrawerProps) => {
  return (
    <Drawer
      title={null}
      placement="bottom"
      styles={{
        body: {
          padding: 0,
        },
        header: {
          padding: 16,
        },
      }}
      rootStyle={{
        maxWidth: 900,
        marginLeft: isMobile ? 0 : "calc(50% - 450px)",
      }}
      extra={
        <Space>
          <Button onClick={onClose}>Close</Button>
        </Space>
      }
      closable={false}
      height={Math.min(700, window.innerHeight * 0.8)}
      onClose={onClose}
      open={isOpen}
    >
      <Flex
        vertical
        style={{
          position: "relative",
          overflowY: "scroll",
          paddingBottom: 64,
        }}
      >
        {/* Map view including expand button and drawer close icon button */}
        {mapVisible ? (
          <Flex vertical style={{ position: "relative" }}>
            {renderDrawerCloseBtn()}
            <Flex
              style={{
                position: "absolute",
                bottom: 16,
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
                  fontSize: FONT_SIZE.SUB_TEXT,
                  height: 28,
                }}
                onClick={onExpandMap}
              >
                Expand
              </Button>
            </Flex>
            <Flex
              style={{
                height: isMobile ? 200 : 300,
                width: "100%",
                borderRadius: 16,
              }}
            >
              <MapViewV2
                projectId={lvnzyProject?.originalProjectId._id}
                defaultSelectedDriverTypes={selectedDriverTypes}
                surroundingElements={surroundingElements}
                drivers={mapDrivers.map((d) => {
                  return {
                    id: d.driverId._id,
                    duration: d.durationMins
                      ? d.durationMins
                      : Math.round(d.mapsDurationSeconds / 60),
                  };
                })}
                fullSize={false}
              />
            </Flex>
          </Flex>
        ) : null}

        {/* Close button when map view is absent */}
        {!mapDrivers || !mapDrivers.length ? renderDrawerCloseBtn() : null}

        {/* Rest of the content including title, markdown content and chatbox */}
        <Flex vertical style={{ padding: 16 }}>
          <Typography.Title level={4} style={{ margin: "8px 0" }}>
            {selectedDataPointTitle}
          </Typography.Title>
          {selectedDataPointCategory == "developer" && (
            <Typography.Title level={5} style={{ margin: "8px 0" }}>
              {lvnzyProject?.originalProjectId.info.developerId.name}
            </Typography.Title>
          )}
          <Flex vertical gap={16}>
            {selectedDataPoint
              ? selectedDataPoint.reasoning.map((r: string) => {
                  return (
                    <Flex
                      style={{
                        maxWidth: 500,
                        backgroundColor: COLORS.bgColorMedium,
                        borderRadius: 8,
                        borderColor: COLORS.borderColorMedium,
                        padding: 8,
                      }}
                    >
                      <div
                        dangerouslySetInnerHTML={{ __html: r }}
                        className="reasoning"
                        style={{ fontSize: FONT_SIZE.HEADING_4, margin: 0 }}
                      ></div>
                    </Flex>
                  );
                })
              : ""}
          </Flex>

          <Divider></Divider>

          <Flex style={{ width: "100%" }}>
            <Brick360Chat
              ref={chatRef}
              dataPointCategory={selectedDataPointCategory}
              dataPoint={selectedDataPointTitle}
              lvnzyProjectId={lvnzyProjectId!}
            ></Brick360Chat>
          </Flex>
        </Flex>
      </Flex>
    </Drawer>
  );
};
