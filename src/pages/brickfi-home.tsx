import { Flex } from "antd";
import React, { ReactNode, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader } from "../components/common/loader";
import { ProjectSearch } from "../components/project-search";
import { RequestedProjectsList } from "../components/requested-projects-list";
import { useUser } from "../hooks/use-user";
import { User } from "../types/User";
import { Brick360 } from "./brick360";
import { UserProjects } from "./user-projects";

interface SavedLvnzyProject {
  _id: string;
  collectionName: string;
  projects: any[];
}

const BrickfiHome: React.FC = () => {
  const { user, isLoading: userLoading } = useUser();
  const { lvnzyProjectId, collectionId } = useParams();

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
    <Flex vertical style={{ paddingBottom: 100 }}>
      <Flex style={{ padding: "16px 16px 8px 16px" }}>
        <ProjectSearch
          onSelect={handleProjectSelect}
          placeholder="Search for projects..."
        />
      </Flex>
      {lvnzyProjectId ? (
        <Brick360 />
      ) : (
        <>
          {user && <RequestedProjectsList user={user} />}
          {selectedCollection?.projects ? (
            <UserProjects lvnzyProjects={selectedCollection.projects} />
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

{
  /* <Drawer
        open={true}
        mask={false}
        title={null}
        placement="bottom"
        height={drawerFixedContent || drawerVisibility ? 700 : 175}
        closeIcon={null}
        style={{
          borderTopRightRadius: 16,
          borderTopLeftRadius: 16,
          boxShadow: "0 0 8px #888",
          overflowY:
            drawerFixedContent || drawerVisibility ? "scroll" : "hidden",
          position: "relative",
        }}
        styles={{
          body: {
            padding: 0,
            overflowY:
              drawerFixedContent || drawerVisibility ? "scroll" : "hidden",
          },
        }}
        rootClassName="brickfi-drawer"
      >
        {drawerFixedContent && (
          <Flex style={{ paddingBottom: 100 }}>{drawerFixedContent}</Flex>
        )}
        <Flex
          vertical
          gap={8}
          style={{
            width: "calc(100% - 24px)",
            backgroundColor: "white",
            padding: 12,
          }}
        >
          <BrickfiAssist
            lvnzyProjectsCollection={selectedCollection.name}
            lvnzyProjectId={lvnzyProjectId}
          ></BrickfiAssist>
        </Flex>
      </Drawer> */
}
{
  /* <Tabs
        onChange={(key: string) => {
          setSelectedTabKey(key);
        }}
        tabPosition="top"
        tabBarStyle={{
          marginLeft: 16,
          marginBottom: 0,
        }}
        items={tabs.map((tab, i) => {
          return {
            label: (
              <Flex gap={4} style={{ height: 32 }} align="center">
                <Typography.Text
                  style={{
                    color:
                      tab.key == selectedTabKey
                        ? COLORS.primaryColor
                        : COLORS.textColorLight,
                    fontWeight: tab.key == selectedTabKey ? 600 : "normal",
                  }}
                >
                  {tab.label}
                </Typography.Text>
                <DynamicReactIcon
                  iconName={tab.iconName}
                  color={
                    tab.key == selectedTabKey
                      ? COLORS.primaryColor
                      : COLORS.textColorLight
                  }
                  iconSet={tab.iconSet as any}
                  size={18}
                ></DynamicReactIcon>
              </Flex>
            ),
            key: tab.key,
            children: (
              <Flex
                style={{
                  height: "calc(100vh - 125px)",
                  overflowY: "scroll",
                  scrollbarWidth: "none",
                  backgroundColor: "white",
                  borderRadius: 8,
                  margin: "0 16px",
                }}
              >
                {tab.key == "list" ? (
                  lvnzyProjectId ? (
                    <Brick360></Brick360>
                  ) : (
                    <UserProjects lvnzyProjects={projects}></UserProjects>
                  )
                ) : tab.key == "map" ? (
                  <MapViewV2
                    fullSize
                    projects={projects.map((p) => p.originalProjectId)}
                  ></MapViewV2>
                ) : (
                  <BrickfiAssist
                    lvnzyProjectsCollection={selectedCollection}
                  ></BrickfiAssist>
                )}
              </Flex>
            ),
          };
        })}
      /> */
}
