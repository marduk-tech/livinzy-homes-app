import React, { useEffect, useState } from "react";
import { Flex, Tabs, Typography } from "antd";
import { UserProjects } from "./user-projects";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
import { COLORS } from "../theme/style-constants";
import { useUser } from "../hooks/use-user";
import MapViewV2 from "../components/map-view/map-view-v2";
import BrickfiAssist from "../components/liv/brickfi-assist";
import { useParams } from "react-router-dom";
import { Brick360 } from "./brick360";

const BrickfiHome: React.FC = () => {
  const { user } = useUser();
  const [selectedCollection, setSelectedCollection] = useState<any>();
  const [projects, setProjects] = useState<any[]>([]);
  const { lvnzyProjectId } = useParams();

  useEffect(() => {
    if (user?.savedLvnzyProjects && user.savedLvnzyProjects.length) {
      const collections = user.savedLvnzyProjects.map((c) => c.collectionName);
      setSelectedCollection(collections[0]);
      setProjects(
        user.savedLvnzyProjects.find(
          (c) => c.collectionName == collections[collections.length - 1]
        ).projects
      );
    }
  }, [user]);

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

  return (
    <Flex vertical>
      <Tabs
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
      />
    </Flex>
  );
};

export default BrickfiHome;
