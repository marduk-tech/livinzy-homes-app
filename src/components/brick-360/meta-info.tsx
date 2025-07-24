import { Flex, Modal, Typography } from "antd";
import { LvnzyProject } from "../../types/LvnzyProject";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { capitalize, rupeeAmountFormat } from "../../libs/lvnzy-helper";
import moment from "moment";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DynamicReactIcon from "../common/dynamic-react-icon";
import { useDevice } from "../../hooks/use-device";

type MetaInfoProps = {
  lvnzyProject: LvnzyProject;
};

const MetaInfo: React.FC<MetaInfoProps> = ({ lvnzyProject }) => {
  const [isPmtPlanModalOpen, setIsPmtPlanModalOpen] = useState(false);
  const { isMobile } = useDevice();
  const renderText = (text: string, color?: string) => {
    return (
      <Typography.Text
        style={{
          fontSize: FONT_SIZE.HEADING_4,
          margin: 0,
          color: color || COLORS.textColorMedium,
        }}
      >
        {text}
      </Typography.Text>
    );
  };
  return (
    <>
      <Flex vertical style={{ marginTop: 4 }}>
        <Flex align="center" gap={8}>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_3,
              margin: 0,
              color: COLORS.textColorDark,
            }}
          >
            {lvnzyProject?.meta.costingDetails.configurations[0].config
              .replace("Apartments", "")
              .replace("Apartment", "")}{" "}
            ·{" "}
            {rupeeAmountFormat(
              lvnzyProject?.meta.costingDetails.configurations[0].cost
            )}{" "}
          </Typography.Text>
          {lvnzyProject.originalProjectId.info &&
          lvnzyProject.originalProjectId.info.financialPlan ? (
            <Flex
              align="center"
              style={{
                padding: "0 8px",
                borderRadius: 8,
                backgroundColor: COLORS.primaryColor,
              }}
              gap={2}
            >
              <DynamicReactIcon
                iconName="RiMoneyRupeeCircleLine"
                iconSet="ri"
                size={20}
                color="white"
              ></DynamicReactIcon>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_4,

                  color: "white",
                }}
                onClick={() => {
                  setIsPmtPlanModalOpen(true);
                }}
              >
                Payment Plan
              </Typography.Text>
            </Flex>
          ) : null}
        </Flex>
        {renderText(`
            ${capitalize(
              lvnzyProject?.meta.projectUnitTypes.split(",")[0]
            )} · ${
          lvnzyProject.meta.projectCorridors.sort(
            (a: any, b: any) => a.approxDistanceInKms - b.approxDistanceInKms
          )[0].corridorName
        } · ${moment(
          lvnzyProject?.meta.projectTimelines[0].completionDate,
          "DD-MM-YYYY"
        ).format("MMM YYYY")}`)}
      </Flex>
      <Modal
        open={isPmtPlanModalOpen}
        footer={null}
        closable={true}
        onClose={() => {
          setIsPmtPlanModalOpen(false);
        }}
        onCancel={() => {
          setIsPmtPlanModalOpen(false);
        }}
      >
        <Flex
          style={{
            height: isMobile ? 400 : 600,
            overflowY: "scroll",
            scrollbarWidth: "none",
            paddingTop: 32,
          }}
        >
          <Markdown remarkPlugins={[remarkGfm]} className="liviq-content">
            {lvnzyProject.originalProjectId.info.financialPlan}
          </Markdown>
        </Flex>
      </Modal>
    </>
  );
};

export default MetaInfo;
