import { Flex, Typography } from "antd";
import { LvnzyProject } from "../../types/LvnzyProject";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { rupeeAmountFormat } from "../../libs/lvnzy-helper";
import moment from "moment";

type MetaInfoProps = {
  lvnzyProject: LvnzyProject;
};

const MetaInfo: React.FC<MetaInfoProps> = ({ lvnzyProject }) => {
  const renderText = (text: string) => {
    return (
      <Typography.Text
        style={{
          fontSize: FONT_SIZE.HEADING_4,
          margin: 0,
          color: COLORS.textColorLight,
        }}
      >
        {text}
      </Typography.Text>
    );
  };
  return (
    <Flex vertical>
      {renderText(lvnzyProject?.meta.oneLiner)}
      {renderText(`Starts: 
            ${rupeeAmountFormat(
              lvnzyProject?.meta.costingDetails.configurations[0].cost
            )} / ${
        lvnzyProject?.meta.costingDetails.configurations[0].config
      }`)}
      {lvnzyProject?.meta.projectTimelines &&
      lvnzyProject?.meta.projectTimelines.length ? (
        <Flex>
          {renderText(
            `Launched: 
              ${moment(
                lvnzyProject?.meta.projectTimelines[0].startDate,
                "DD-MM-YYYY"
              ).format("MMM YYYY")},  Completion:
              ${moment(
                lvnzyProject?.meta.projectTimelines[0].completionDate,
                "DD-MM-YYYY"
              ).format("MMM YYYY")}`
          )}
        </Flex>
      ) : null}
    </Flex>
  );
};

export default MetaInfo;
