import { Flex, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../../theme/style-constants";
import { Project } from "../../types/Project";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();

  const randomPrice = (Math.random() * (15 - 8) + 8).toFixed(1);

  return (
    <Flex
      vertical
      style={{
        width: "100%",
        cursor: "pointer",
        backgroundColor: "white",
        boxShadow: "0 0 4px #ddd",
        borderRadius: 16,
        padding: 8,
      }}
      onClick={() => {
        navigate(`/project/${project._id}`);
      }}
    >
      <div
        style={{
          width: "100%",
          borderRadius: 16,
          height: 225,
          border: "1px solid",
          borderColor: COLORS.borderColor,

          backgroundImage: `url(${
            project?.media[0]?.url || "/images/img-plchlder.png"
          })`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      <Flex
        style={{ width: "100%", marginTop: 15, padding: "0px 10px" }}
        vertical
      >
        <Typography.Title level={5} style={{ margin: 0 }}>
          {project.metadata.name}
        </Typography.Title>

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
