import { Button, Divider, Drawer, Flex, Space, Tag } from "antd";
import { MutableRefObject, useEffect, useState } from "react";
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
  dataPoint: any;
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
  dataPoint,
  lvnzyProjectId,
  chatRef,
  renderDrawerCloseBtn,
}: DetailsDrawerProps) => {
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const [dataPointSelected, setDataPointSelected] = useState<any>();

  useEffect(() => {
    setIsDrawerExpanded(isOpen);
  }, [isOpen]);

  useEffect(() => {
    setDataPointSelected(dataPoint);
  }, [dataPoint]);

  return (
    <Drawer
      title={null}
      placement="bottom"
      styles={{
        body: {
          padding: 0,
          borderTop: isDrawerExpanded
            ? `1px solid ${COLORS.borderColor}`
            : "none",
          borderLeft: isDrawerExpanded
            ? `1px solid ${COLORS.borderColor}`
            : "none",
          borderRight: isDrawerExpanded
            ? `1px solid ${COLORS.borderColor}`
            : "none",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          scrollbarWidth: "none",
        },
        header: {
          padding: 16,
        },
        content: {
          backgroundColor: isDrawerExpanded ? "white" : "transparent",
          borderTop: isDrawerExpanded
            ? `1px solid ${COLORS.borderColor}`
            : "none",
          borderLeft: isDrawerExpanded
            ? `1px solid ${COLORS.borderColor}`
            : "none",
          borderRight: isDrawerExpanded
            ? `1px solid ${COLORS.borderColor}`
            : "none",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        },
        wrapper: {
          boxShadow: isDrawerExpanded ? "initial" : "none",
        },
        mask: {
          backgroundColor: "rgba(0,0,0,0.1)",
        },
      }}
      rootStyle={{
        maxWidth: 885,
        marginLeft: isMobile ? 0 : "calc(50% - 447px)",
      }}
      extra={
        <Space>
          <Button onClick={onClose}>Close</Button>
        </Space>
      }
      closable={false}
      height={isDrawerExpanded ? Math.min(700, window.innerHeight * 0.8) : 100}
      onClose={() => {
        setDataPointSelected(undefined);
        onClose();
      }}
      open={true}
      mask={isDrawerExpanded ? true : false}
      maskClosable={true}
    >
      <Flex
        vertical
        style={{
          position: "relative",
          overflowY: "scroll",
          paddingBottom: 64,
          scrollbarWidth: "none",
          paddingTop: 16,
        }}
      >
        {isDrawerExpanded ? renderDrawerCloseBtn() : null}
        {/* Map view including expand button and drawer close icon button */}
        {mapVisible && isDrawerExpanded ? (
          <Flex
            vertical
            style={{
              position: "relative",
              margin: 8,
              border: "2px solid",
              borderColor: COLORS.borderColor,
              borderRadius: 16,
            }}
          >
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
              }}
            >
              <MapViewV2
                projectId={lvnzyProject?.originalProjectId._id}
                defaultSelectedDriverTypes={selectedDriverTypes || []}
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

        {/* Rest of the content including title, markdown content and chatbox */}
        <Flex vertical style={{ padding: 8 }}>
          {isDrawerExpanded ? (
            <Flex vertical>
              <Flex vertical gap={16}>
                {dataPointSelected?.selectedDataPoint
                  ? dataPointSelected?.selectedDataPoint.reasoning.map(
                      (r: string) => {
                        return (
                          <Flex
                            style={{
                              maxWidth: 850,
                            }}
                          >
                            <div
                              dangerouslySetInnerHTML={{ __html: r }}
                              className="reasoning"
                              style={{
                                fontSize: FONT_SIZE.HEADING_4,
                                margin: 0,
                              }}
                            ></div>
                          </Flex>
                        );
                      }
                    )
                  : ""}
              </Flex>

              <Divider></Divider>
              <Flex
                gap={8}
                style={{ width: "100%", flexWrap: "wrap", marginBottom: 16 }}
              >
                <Tag
                  onClick={() => {
                    chatRef.current.handleQuestion("find preschools nearby");
                  }}
                >
                  Find preschools nearby
                </Tag>
                <Tag>Show nearest schools</Tag>
                <Tag>Schools in walking distance</Tag>
              </Flex>
            </Flex>
          ) : null}

          <Flex style={{ width: "100%" }}>
            <Brick360Chat
              ref={chatRef}
              dataPointCategory={dataPointSelected?.selectedDataPointCategory}
              dataPoint={dataPointSelected?.selectedDataPointTitle}
              lvnzyProjectId={lvnzyProjectId!}
              onNewChat={() => {
                setIsDrawerExpanded(true);
              }}
            ></Brick360Chat>
          </Flex>
        </Flex>
      </Flex>
    </Drawer>
  );
};
