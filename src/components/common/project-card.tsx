import { Flex, Tag, Typography } from "antd";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { IMedia, Project } from "../../types/Project";
import { capitalize, rupeeAmountFormat } from "../../libs/lvnzy-helper";

interface ProjectCardProps {
  project: Project;
  fromMap: boolean;
  onProjectClick?: any;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  fromMap,
  onProjectClick,
}) => {
  if (!project || !project.metadata || !project.metadata.name) {
    return;
  }
  let costingDetails;

  let previewImage;
  if (project.media) {
    previewImage = project.media.find((m: IMedia) => m.isPreview);
    previewImage = previewImage || project.media[0];
    previewImage = previewImage?.image?.url;
  }

  return (
    <Flex
      className="fade-in-style"
      vertical
      style={{
        cursor: "pointer",
        borderRadius: 16,
        width: 200,
      }}
    >
      <div
        style={{
          borderRadius: 8,
          height: 125,
          width: "100%",
          border: "1px solid",
          borderColor: COLORS.borderColor,
          backgroundImage: `url(${previewImage || "/images/img-plchlder.png"})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      <Flex
        style={{ width: "100%", marginTop: 8, padding: "0px 4px" }}
        vertical
      >
        <Typography.Text
          style={{
            margin: 0,
            fontSize: FONT_SIZE.HEADING_4,
            lineHeight: "100%",
            fontWeight: 500,
            wordWrap: "break-word",
            whiteSpace: "wrap",
          }}
        >
          {project.metadata.name}
        </Typography.Text>
        <Flex>
          <Tag
            style={{
              fontSize: FONT_SIZE.SUB_TEXT,
              padding: "2px 4px",
              lineHeight: "100%",
              marginTop: 4,
              border: "1px solid",
              color: "white",
              backgroundColor: COLORS.textColorDark,
            }}
          >
            {capitalize(project.metadata.homeType)}
          </Tag>
        </Flex>
        {project.ui && project.ui.costingDetails ? (
          <Flex>
            <Typography.Text
              style={{
                display: "inline",
                fontSize: FONT_SIZE.PARA,
                marginTop: 4,
              }}
            >
              {rupeeAmountFormat(project.ui.costingDetails.singleUnitCost)} /{" "}
              {project.ui.costingDetails.singleUnitSize} sqft
            </Typography.Text>
          </Flex>
        ) : null}

        {project.ui && project.ui.oneLiner ? (
          <Typography.Text
            style={{
              whiteSpace: "wrap",
              lineHeight: "110%",
              marginTop: 4,
              fontSize: FONT_SIZE.SUB_TEXT,
              color: COLORS.textColorLight,
            }}
          >
            {project.relevantDetails ||
              project.ui.oneLiner.split(" · ").slice(1).join(" · ")}
          </Typography.Text>
        ) : null}
        {/* {project.relevantDetails ? (
          <Typography.Text
            style={{
              backgroundColor: COLORS.bgColor,
              borderRadius: 8,
              border: "1px solid",
              borderColor: COLORS.borderColorMedium,
              whiteSpace: "wrap",
              lineHeight: "110%",
              marginTop: 4,
              padding: 4,
              fontSize: FONT_SIZE.SUB_TEXT,
              fontStyle: "italic",
            }}
          >
            {project.relevantDetails || project.ui.oneLiner.split(" · ").slice(1).join(" · ")}
          </Typography.Text>
        ) : null} */}

        {/* <Flex gap={7} color={COLORS.textColorLight} align="center">
     

          <SeparatorDot />
          <DescText text={`₹${randomPrice}Lacs`} />
        </Flex> */}
      </Flex>
      {fromMap && (
        <Flex
          style={{ marginTop: 8 }}
          onClick={() => {
            onProjectClick();
          }}
        >
          <Tag>More Details</Tag>
        </Flex>
      )}
    </Flex>
  );
};

function DescText({ text }: { text: string }) {
  return (
    <Typography.Text
      style={{
        fontSize: "14px",
      }}
      color={COLORS.textColorLight}
    >
      {text}
    </Typography.Text>
  );
}

function SeparatorDot() {
  return (
    <span
      style={{
        width: 3,
        height: 3,
        backgroundColor: COLORS.textColorLight,
      }}
    ></span>
  );
}
