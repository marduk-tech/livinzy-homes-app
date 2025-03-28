import { Flex, List, Typography } from "antd";
import { Loader } from "../components/common/loader";
import { useUser } from "../hooks/use-user";
import { useNavigate } from "react-router-dom";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { rupeeAmountFormat } from "../libs/lvnzy-helper";
import { useEffect, useState } from "react";

export function UserProjects() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [corridorWiseProjects, setCorridorWiseProjects] = useState<any>();

  useEffect(() => {
    const corrProjects: any = {};
    if (user?.savedLvnzyProjects && user.savedLvnzyProjects.length) {
      user.savedLvnzyProjects.forEach((p) => {
        corrProjects[p.meta.projectCorridor] =
          corrProjects[p.meta.projectCorridor] || [];
        corrProjects[p.meta.projectCorridor].push(p);
      });
      setCorridorWiseProjects(corrProjects);
    }
  }, [user]);

  const renderLvnzyProject = (itemInfo: any) => {
    return (
      <List.Item
        onClick={() => {
          navigate(`/brick360/${itemInfo._id}`);
        }}
      >
        <Flex vertical>
          <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_2 }}>
            {itemInfo.meta.projectName}
          </Typography.Text>
          <Typography.Text style={{ fontSize: FONT_SIZE.PARA }}>
            {itemInfo.meta.oneLiner}
          </Typography.Text>
          <Typography.Text
            style={{ fontSize: FONT_SIZE.PARA, color: COLORS.textColorLight }}
          >
            {rupeeAmountFormat(itemInfo.meta.costingDetails.singleUnitCost)} /{" "}
            {itemInfo.meta.costingDetails.singleUnitSize} sqft
          </Typography.Text>
        </Flex>
      </List.Item>
    );
  };

  if (!user || !corridorWiseProjects) {
    return <Loader></Loader>;
  }

  return (
    <Flex
      style={{
        width: "100%",
        padding: 16,
      }}
      vertical
    >
      {Object.keys(corridorWiseProjects).map((corridor: string) => {
        return (
          <Flex vertical>
            <Typography.Title level={4}>{corridor}</Typography.Title>
            <List
              size="large"
              style={{
                width: "100%",
              }}
              bordered
              dataSource={corridorWiseProjects[corridor]}
              renderItem={renderLvnzyProject}
            />
          </Flex>
        );
      })}
    </Flex>
  );
}
