import { Flex, Typography } from "antd";
import MetaInfo from "./meta-info";
import { FONT_SIZE } from "../../theme/style-constants";

interface ProjectHeaderProps {
  lvnzyProject: any;
}

export const ProjectHeader = ({ lvnzyProject }: ProjectHeaderProps) => {
  return (
    <>
      {/* Main project upfront score card including metadata */}
      <Flex vertical style={{ padding: 0 }}>
        <Flex
          vertical
          style={{
            alignItems: "flex-start",
            margin: "8px 0",
            padding: "0 8px",
          }}
          gap={8}
        >
          <Typography.Text
            style={{
              margin: "0",
              lineHeight: "100%",
              fontSize: FONT_SIZE.HEADING_1,
            }}
          >
            {lvnzyProject?.meta.projectName}
          </Typography.Text>
        </Flex>
      </Flex>

      {/* One liner & timeline */}
      <Flex vertical style={{ padding: "0 8px", marginBottom: 16 }}>
        <MetaInfo lvnzyProject={lvnzyProject!}></MetaInfo>
      </Flex>
    </>
  );
};
