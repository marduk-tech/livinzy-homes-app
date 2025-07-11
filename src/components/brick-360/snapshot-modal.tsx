import { Flex, Modal, Typography } from "antd";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";

interface SnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  pt: string;
}

export const SnapshotModal = ({ isOpen, onClose, pt }: SnapshotModalProps) => {
  if (!pt) {
    return null;
  }

  return (
    <Modal
      footer={null}
      open={isOpen}
      closable={true}
      style={{ top: 150 }}
      onCancel={onClose}
      onClose={onClose}
    >
      <Flex vertical>
        <div
          dangerouslySetInnerHTML={{ __html: pt }}
          className="reasoning"
          style={{ fontSize: FONT_SIZE.HEADING_4, margin: 0 }}
        ></div>
        <Typography.Text
          style={{ marginTop: 24, color: COLORS.textColorLight }}
        >
          See full report for details.
        </Typography.Text>
      </Flex>
    </Modal>
  );
};
