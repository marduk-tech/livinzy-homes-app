import { Flex, Modal, Tag, Typography } from "antd";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";

interface SnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  lvnzyProject: any;
}

export const SnapshotModal = ({
  isOpen,
  onClose,
  lvnzyProject,
}: SnapshotModalProps) => {
  if (!lvnzyProject?.score.summary) {
    return null;
  }

  return (
    <Modal
      footer={null}
      height={600}
      open={isOpen}
      closable={true}
      style={{ top: 40 }}
      onCancel={onClose}
      onClose={onClose}
    >
      <Flex
        vertical
        style={{ overflowY: "scroll", height: 600, scrollbarWidth: "none" }}
      >
        <Typography.Title level={3} style={{ margin: 0, marginBottom: 0 }}>
          360 Snapshot
        </Typography.Title>
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.PARA,
            marginBottom: 16,
            color: COLORS.textColorLight,
            lineHeight: "120%",
          }}
        >
          Brief summary including highlights for this project.
        </Typography.Text>
        <Flex gap={8} vertical>
          <Flex>
            <Tag color={COLORS.greenIdentifier}>PROS</Tag>
          </Flex>
          {lvnzyProject?.score.summary.pros.map((pro: string) => {
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
                  dangerouslySetInnerHTML={{ __html: pro }}
                  className="reasoning"
                  style={{ fontSize: FONT_SIZE.HEADING_4, margin: 0 }}
                ></div>
              </Flex>
            );
          })}
          <Flex style={{ marginTop: 24 }}>
            <Tag color={COLORS.redIdentifier}>CONS</Tag>
          </Flex>
          {lvnzyProject?.score.summary.cons.map((pro: string) => {
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
                  dangerouslySetInnerHTML={{ __html: pro }}
                  className="reasoning"
                  style={{ fontSize: FONT_SIZE.HEADING_4, margin: 0 }}
                ></div>
              </Flex>
            );
          })}
        </Flex>
      </Flex>
    </Modal>
  );
};
