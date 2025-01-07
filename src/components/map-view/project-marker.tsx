import { ArrowRightOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import { FONT_SIZE } from "../../theme/style-constants";
import { Project } from "../../types/Project";
import { ProjectCard } from "../common/project-card";

export const ProjectMarker = ({
  project,
  isExpanded,
  onExpand,
}: {
  project: Project;
  isExpanded: boolean;
  onExpand: () => void;
}) => {
  const handleClick = () => {
    onExpand();
  };

  return (
    <div
      onClick={handleClick}
      style={{
        backgroundColor: "white",
        borderRadius: 10,
        padding: "10px",
        whiteSpace: "nowrap",
        border: "1px solid #ccc",
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {isExpanded ? (
        <Flex style={{ width: 250, height: 300 }}>
          <CloseButton onClick={() => onExpand()} />
          <ProjectCard project={project} />
        </Flex>
      ) : (
        <div style={{ marginTop: isExpanded ? "24px" : "0px" }}>
          <Flex justify="space-between" align="center">
            <Typography.Text
              style={{
                fontSize: isExpanded ? FONT_SIZE.HEADING_3 : "16px",
                fontWeight: "medium",
              }}
            >
              {project.metadata.name}
            </Typography.Text>
            {isExpanded && (
              <Link to={`/project/${project._id}`}>
                <Button
                  variant="outlined"
                  icon={<ArrowRightOutlined />}
                  size="small"
                />
              </Link>
            )}
          </Flex>
        </div>
      )}
    </div>
  );
};

export const CloseButton: React.FC<{ onClick: (e: any) => void }> = ({
  onClick,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "18px",
        right: "18px",
        fontSize: "14px",
        cursor: "pointer",
        zIndex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClick}
    >
      <CloseOutlined />
    </div>
  );
};
