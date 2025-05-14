import React, { ReactNode, useEffect, useState } from "react";
import { Drawer, Flex } from "antd";
import { UserProjects } from "./user-projects";
import { useUser } from "../hooks/use-user";
import { useParams } from "react-router-dom";
import { Brick360 } from "./brick360";
import BrickfiAssist from "../components/liv/brickfi-assist";
import { Loader } from "../components/common/loader";

const BrickfiHome: React.FC = () => {
  const { user } = useUser();
  const [projects, setProjects] = useState<any[]>([]);
  const { lvnzyProjectId, collectionId } = useParams();

  const [drawerFixedContent, setDrawerFixedContent] = useState<ReactNode>(null);
  const [drawerVisibility, setDrawerVisibility] = useState<boolean>(false);
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
          user!.savedLvnzyProjects.find((c) => c._id == collectionId)
        );
      } else {
        setSelectedCollection(user!.savedLvnzyProjects[0]);
      }
    }
  }, [collectionId, user]);

  if (!user || !selectedCollection) {
    return <Loader></Loader>;
  }

  return (
    <Flex vertical style={{ paddingBottom: 100 }}>
      {lvnzyProjectId ? (
        <Brick360></Brick360>
      ) : (
        <UserProjects
          lvnzyProjects={selectedCollection.projects}
        ></UserProjects>
      )}
      <Drawer
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
      </Drawer>
      {/* <Tabs
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
      /> */}
    </Flex>
  );
};

export default BrickfiHome;
