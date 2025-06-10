import { Flex } from "antd";
import React, { ReactNode, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Brick360 } from "./brick360";
import BrickfiAssist from "../components/liv/brickfi-assist";
import { Loader } from "../components/common/loader";
import { useUser } from "../hooks/use-user";
import { UserProjects } from "./user-projects";

const BrickfiHome: React.FC = () => {
  const { user } = useUser();
  const [projects, setProjects] = useState<any[]>([]);
  const { lvnzyProjectId, collectionId } = useParams();

  const [reportContent, setReportContent] = useState<ReactNode>(null);
  const [selectedCollection, setSelectedCollection] = useState<any>();

  const tabs = [
    {
      label: "List",
      iconName: "MdOutlineMapsHomeWork",
      iconSet: "md",
      key: "list",
    },
    { label: "Map", iconName: "FaMapMarked", iconSet: "fa", key: "map" },
    { label: "Assist", iconName: "GiOilySpiral", iconSet: "gi", key: "assist" },
  ];
  const [selectedTabKey, setSelectedTabKey] = React.useState<string>(
    tabs[0].key
  );

  useEffect(() => {
    if (user && user.savedLvnzyProjects) {
      if (collectionId) {
        setSelectedCollection(
          user.savedLvnzyProjects.find((c) => c._id == collectionId)
        );
      } else {
        setSelectedCollection(user.savedLvnzyProjects[0]);
      }
    }
  }, [collectionId, user]);

  if (!user) {
    return <Loader></Loader>;
  }

  return (
    <Flex vertical style={{ paddingBottom: 100 }}>
      {lvnzyProjectId ? (
        <Brick360
          setFixedContent={(node: ReactNode) => {
            setReportContent(node);
          }}
        ></Brick360>
      ) : (
        <UserProjects
          collectionId={selectedCollection ? selectedCollection._id : ""}
          lvnzyProjects={selectedCollection ? selectedCollection.projects : []}
        ></UserProjects>
      )}
      <BrickfiAssist
        lvnzyProjectsCollection={
          selectedCollection ? selectedCollection.collectionName : ""
        }
        lvnzyProjectId={lvnzyProjectId || ""}
        reportContent={reportContent}
      ></BrickfiAssist>
    </Flex>
  );
};

export default BrickfiHome;
