import { Flex, Tag, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { IMedia, Project } from "../../types/Project";
import { rupeeAmountFormat } from "../../libs/lvnzy-helper";

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
  const navigate = useNavigate();

  const randomPrice = (Math.random() * (15 - 8) + 8).toFixed(1);

  let costSummary;
  if (project.ui && project.ui.costSummary) {
    try {
      costSummary = JSON.parse(project.ui.costSummary);
    } catch (err) {
      // ignore
    }
  }

  let previewImage;
  if (project.media) {
    previewImage = project.media.find((m: IMedia) => m.isPreview);
    previewImage = previewImage || project.media[0];
    previewImage = previewImage?.image?.url;
  }
  return (
    <Flex
      vertical
      style={{
        width: "100%",
        cursor: "pointer",
        borderRadius: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          borderRadius: 8,
          height: 200,
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
            fontSize: FONT_SIZE.HEADING_3,
            lineHeight: "100%",
            fontWeight: 500,
            wordWrap: "break-word",
          }}
        >
          {project.metadata.name}
        </Typography.Text>
        {costSummary ? (
          <Flex>
            <Typography.Text
              style={{
                display: "inline",
                fontSize: FONT_SIZE.PARA,
                marginTop: 4,
              }}
            >
              {rupeeAmountFormat(costSummary.cost)} / {costSummary.size}
            </Typography.Text>
          </Flex>
        ) : null}
        {project.ui && project.ui.oneLiner ? (
          <Typography.Text
            style={{
              color: COLORS.textColorLight,
              whiteSpace: "wrap",
              lineHeight: "110%",
              marginTop: 4,
              fontSize: FONT_SIZE.SUB_TEXT,
            }}
          >
            {project.ui.oneLiner}
          </Typography.Text>
        ) : null}
        {project.relevantDetails ? (
          <Typography.Text
            style={{
              color: COLORS.textColorLight,
              backgroundColor: "white",
              whiteSpace: "wrap",
              lineHeight: "110%",
              marginTop: 4,
              fontSize: FONT_SIZE.SUB_TEXT,
            }}
          >
            {project.relevantDetails}
          </Typography.Text>
        ) : null}

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
