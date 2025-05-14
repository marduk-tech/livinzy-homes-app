import React, { useEffect, useState } from "react";
import { Flex } from "antd";
import { UserProjects } from "./user-projects";
import { useUser } from "../hooks/use-user";
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
        user.savedLvnzyProjects.find((c) => c.collectionName == collections[0])
          .projects
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
      {lvnzyProjectId ? (
        <Brick360></Brick360>
      ) : (
        <UserProjects lvnzyProjects={projects}></UserProjects>
      )}
      {/* <Drawer
        open={true}
        mask={false}
        title={null}
        placement="bottom"
        height={175}
        closeIcon={null}
        style={{
          borderTopRightRadius: 24,
          borderTopLeftRadius: 24,
          boxShadow: "0 0 8px #888",
        }}
        styles={{
          body: {
            padding: "8px 16px",
            position: "relative",
          },
        }}
        rootClassName="brickfi-drawer"
      >
        <Flex
          vertical
          gap={8}
          style={{
            position: "absolute",
            bottom: 8,
            width: "calc(100% - 24px)",
          }}
        >
          <Flex
            style={{
              width: "100%",
              overflowX: "scroll",
              whiteSpace: "nowrap",
              scrollbarWidth: "none",
            }}
            gap={8}
          >
            {[
              "Expected Investment Return",
              "More about the area ?",
              "Compare across density",
            ].map((p) => {
              return (
                <div
                  style={{
                    border: "1px solid",
                    borderRadius: 8,
                    minWidth: 140,
                    padding: 8,
                    textWrap: "wrap",
                    borderColor: COLORS.borderColor,
                    fontSize: FONT_SIZE.HEADING_4,
                  }}
                >
                  {p}
                </div>
              );
            })}
          </Flex>

          <BrickfiAssist
            lvnzyProjectsCollection={selectedCollection}
          ></BrickfiAssist>
        </Flex>
      </Drawer> */}
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
