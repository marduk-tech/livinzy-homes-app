import { CloseOutlined } from "@ant-design/icons";
import { Flex, Modal } from "antd";
import React, { useState } from "react";
import { Project } from "../../types/Project";
import { ProjectCard } from "../common/project-card";
import { getProjectTypeIcon } from "./project-type-icon";
import { COLORS } from "../../theme/style-constants";

export const ProjectMarker = ({
  project,
  isExpanded,
  onProjectClick,
  showClick,
  disableModal,
}: {
  project: Project;
  isExpanded: boolean;
  onProjectClick: any;
  showClick: boolean;
  disableModal: boolean;
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <Flex>
      <Modal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
        }}
      >
        <ProjectCard
          fullWidth={true}
          project={project}
          showClick={showClick}
          onProjectClick={onProjectClick}
        />
      </Modal>
      <div
        onClick={() => {
          if (!disableModal) {
            setModalOpen(true);
          }
        }}
        style={{
          backgroundColor: isExpanded ? "white" : COLORS.primaryColor,
          borderRadius: 10,
          padding: 4,
          whiteSpace: "nowrap",
          cursor: "pointer",
          overflow: "hidden",
          position: "relative",
          transform: isExpanded ? "scale(0.6)" : "none",
        }}
      >
        <div style={{ marginTop: isExpanded ? "24px" : "0px" }}>
          <Flex justify="space-between" align="center">
            {getProjectTypeIcon(project.metadata.homeType)}
          </Flex>
        </div>
      </div>
    </Flex>
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
