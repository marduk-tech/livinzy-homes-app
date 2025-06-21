import { Flex } from "antd";
import React, { ReactNode, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Brick360 } from "./brick360";
import { Loader } from "../components/common/loader";
import { useUser } from "../hooks/use-user";
import { UserProjects } from "./user-projects";
import { ProjectSearch } from "../components/project-search";
import { RequestedProjectsList } from "../components/requested-projects-list";

interface SavedLvnzyProject {
  _id: string;
  collectionName: string;
  projects: any[];
}

const BrickfiHome: React.FC = () => {
  const { user, isLoading: userLoading } = useUser();
  const { lvnzyProjectId, collectionId } = useParams();

  const [reportContent, setReportContent] = useState<ReactNode>(null);
  const [drawerFixedContent, setDrawerFixedContent] = useState<ReactNode>(null);
  const [drawerVisibility, setDrawerVisibility] = useState<boolean>(false);
  const [selectedCollection, setSelectedCollection] =
    useState<SavedLvnzyProject | null>(null);
  const [isLoadingCollection, setIsLoadingCollection] = useState(true);

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
          user.savedLvnzyProjects.find((c: any) => c._id == collectionId)
        );
      } else {
        setSelectedCollection(user.savedLvnzyProjects[0]);
      }
    } else {
      setSelectedCollection(null);
      return;
    }

    if (collectionId) {
      setSelectedCollection(
        user.savedLvnzyProjects.find(
          (c: SavedLvnzyProject) => c._id === collectionId
        ) || null
      );
    } else {
      setSelectedCollection(user.savedLvnzyProjects[0]);
    }

    setIsLoadingCollection(false);
  }, [collectionId, user]);

  if (userLoading || isLoadingCollection) {
    return <Loader></Loader>;
  }

  const handleProjectSelect = (
    projectId: string,
    projectName: string,
    lvnzyProjectId: string | null
  ) => {
    // Handle project selection
    console.log("Selected project:", {
      projectId,
      projectName,
      lvnzyProjectId,
    });
    // You can add navigation or other logic here
  };

  return (
    <Flex vertical style={{ paddingBottom: 100 }}>
      <Flex style={{ padding: "16px 16px 8px 16px" }}>
        <ProjectSearch
          onSelect={handleProjectSelect}
          placeholder="Search for projects..."
        />
      </Flex>
      {lvnzyProjectId ? (
        <Brick360 setFixedContent={null} />
      ) : (
        <>
          {user && <RequestedProjectsList user={user} />}
          {selectedCollection?.projects ? (
            <UserProjects
              lvnzyProjects={selectedCollection.projects}
              collectionId=""
            />
          ) : (
            <Flex justify="center" align="center" style={{ height: "50vh" }}>
              No projects found. Add some projects to get started.
            </Flex>
          )}
        </>
      )}
    </Flex>
  );
};

export default BrickfiHome;
