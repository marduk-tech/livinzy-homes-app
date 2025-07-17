import { Alert, Flex } from "antd";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader } from "../components/common/loader";
import { RequestedProjectsList } from "../components/requested-projects-list";
import { useUser } from "../hooks/use-user";
import { Brick360v2 } from "../components/brick-360/brick360-v2";
import { UserProjects } from "./user-projects";

interface SavedLvnzyProject {
  _id: string;
  collectionName: string;
  projects: any[];
}

const BrickfiHome: React.FC = () => {
  const { user, isLoading: userLoading } = useUser();
  const { lvnzyProjectId, collectionId } = useParams();

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
    setIsLoadingCollection(true);

    if (!user) {
      setIsLoadingCollection(false);
      return;
    }

    if (!user.savedLvnzyProjects || user.savedLvnzyProjects.length === 0) {
      setSelectedCollection(null);
      setIsLoadingCollection(false);
      return;
    }

    if (collectionId === "all") {
      // Combine projects from all collections
      const allProjects = user.savedLvnzyProjects.reduce(
        (acc: any[], curr: SavedLvnzyProject) => {
          // Only add unique projects based on _id
          const uniqueProjects = curr.projects.filter(
            (project: any) => !acc.some((p: any) => p._id === project._id)
          );
          return [...acc, ...uniqueProjects];
        },
        []
      );

      setSelectedCollection({
        _id: "all",
        collectionName: "All Collections",
        projects: allProjects,
      });
    } else if (collectionId) {
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
    <Flex vertical>
      {lvnzyProjectId ? (
        <Brick360v2 />
      ) : (
        <>
          {/* <Flex style={{ padding: "16px 16px 8px 16px" }}>
            <ProjectSearch
              onSelect={handleProjectSelect}
              placeholder="Search for a project"
            />
          </Flex> */}
          {user && <RequestedProjectsList user={user} />}
          {selectedCollection?.projects ? (
            <UserProjects lvnzyProjects={selectedCollection.projects} />
          ) : (
            <Flex style={{ margin: 16, marginTop: 100 }}>
              <Alert
                message="No projects found. Please reach out to Brickfi Team."
                type="info"
              ></Alert>
            </Flex>
          )}
        </>
      )}
    </Flex>
  );
};

export default BrickfiHome;
