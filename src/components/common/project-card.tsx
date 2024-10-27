import { Flex, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { rupeeAmountFormat } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { IMedia, Project } from "../../types/Project";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();

  const randomPrice = (Math.random() * (15 - 8) + 8).toFixed(1);

  const costSummary =
    project.ui && project.ui.costSummary
      ? JSON.parse(project.ui.costSummary)
      : undefined;

  let previewImage: any = project.media.find((m: IMedia) => m.isPreview);
  previewImage = previewImage?.image?.url;
  return (
    <Flex
      vertical
      style={{
        width: "100%",
        cursor: "pointer",
        borderRadius: 16,
      }}
      onClick={() => {
        navigate(`/project/${project._id}`);
      }}
    >
      <div
        style={{
          width: "100%",
          borderRadius: 16,
          height: 300,
          border: "1px solid",
          borderColor: COLORS.borderColor,
          backgroundImage: `url(${previewImage || "/images/img-plchlder.png"})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      <Flex
        style={{ width: "100%", marginTop: 8, padding: "0px 10px" }}
        vertical
      >
        <Typography.Text
          style={{
            margin: 0,
            fontSize: FONT_SIZE.subHeading,
            fontWeight: "bold",
          }}
        >
          {project.metadata.name}
        </Typography.Text>
        {project.ui && project.ui.oneLiner ? (
          <Typography.Text style={{ color: COLORS.textColorLight }}>
            {project.ui.oneLiner}
          </Typography.Text>
        ) : null}
        {costSummary ? (
          <Flex>
            <Typography.Text
              style={{
                display: "inline",
                fontSize: FONT_SIZE.subText,
              }}
            >
              {rupeeAmountFormat(costSummary.cost)} / {costSummary.size}
            </Typography.Text>
          </Flex>
        ) : null}

        {/* <Flex gap={7} color={COLORS.textColorLight} align="center">
     

          <SeparatorDot />
          <DescText text={`₹${randomPrice}Lacs`} />
        </Flex> */}
      </Flex>
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
