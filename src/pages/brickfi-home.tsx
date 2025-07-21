import { Button, Flex, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader } from "../components/common/loader";
import { RequestedProjectsList } from "../components/requested-projects-list";
import { useUser } from "../hooks/use-user";
import { Brick360v2 } from "../components/brick-360/brick360-v2";
import { UserProjects } from "./user-projects";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { LandingConstants } from "../libs/constants";

interface SavedLvnzyProject {
  _id: string;
  collectionName: string;
  projects: any[];
}

const BrickfiHome: React.FC = () => {
  const { user, isLoading: userLoading } = useUser();
  const { lvnzyProjectId, collectionId } = useParams();

  const [lvnzyProjects, setLvnzyProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoadng] = useState(true);

  const fetchLvnzyProjectsByIds = async (ids: string) => {
    const { data } = await axiosApiInstance.post(`/lvnzy-projects/${ids}`, {
      ids,
    });
    setLvnzyProjects(data);
    setProjectsLoadng(false);
  };

  useEffect(() => {
    if (userLoading) {
      return;
    }
    if (!user) {
      setProjectsLoadng(false);
      return;
    }

    if (!user.savedLvnzyProjects || user.savedLvnzyProjects.length === 0) {
      setLvnzyProjects([]);
      setProjectsLoadng(false);
      return;
    }

    if (collectionId === "inv-friendly") {
      fetchLvnzyProjectsByIds(
        "687b4d291541e1a0ecb321ca,687b401e8a68a0900797180b,67f0046ca58ac2b37e530f2b,6870af1904ec49de98b9b1fa,680736af3ff1a71676450fbb,68073ba59f670b1afc3f03f4"
      );
    } else {
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

        setLvnzyProjects(allProjects);
      } else if (collectionId) {
        const collection =
          user.savedLvnzyProjects.find(
            (c: SavedLvnzyProject) => c._id === collectionId
          ) || null;
        if (collection && collection.projects) {
          setLvnzyProjects(collection.projects);
        }
      } else {
        setLvnzyProjects(user.savedLvnzyProjects[0].projects);
      }
      setProjectsLoadng(false);
    }
  }, [collectionId, user]);

  if (userLoading || projectsLoading) {
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
          {lvnzyProjects && lvnzyProjects.length ? (
            <UserProjects lvnzyProjects={lvnzyProjects} />
          ) : (
            <Flex
              vertical
              style={{ margin: 16, marginTop: 100 }}
              align="center"
            >
              <DynamicReactIcon
                size={60}
                iconName="TbHomeSearch"
                iconSet="tb"
                color={COLORS.textColorLight}
              ></DynamicReactIcon>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_2,
                  fontWeight: 500,
                  marginTop: 24,
                }}
              >
                No Projects Found
              </Typography.Text>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                  textAlign: "center",
                  color: COLORS.textColorLight,
                }}
              >
                There are no projects added to your account. Please request a
                report by clicking button below or shoot an email at
                support@brickfi.in for help.
              </Typography.Text>
              <Button
                style={{ marginTop: 48, fontSize: FONT_SIZE.HEADING_2 }}
                onClick={() => {
                  window.location.assign(LandingConstants.genReportFormLink);
                }}
              >
                Request New Report
              </Button>
            </Flex>
          )}
        </>
      )}
    </Flex>
  );
};

export default BrickfiHome;
