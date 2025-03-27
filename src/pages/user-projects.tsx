import { Flex, List, Typography } from "antd";
import { Loader } from "../components/common/loader";
import { useUser } from "../hooks/use-user";
import { useNavigate } from "react-router-dom";
import { COLORS, FONT_SIZE } from "../theme/style-constants";

export function UserProjects() {
  const { user } = useUser();
  const navigate = useNavigate();

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
          <Typography.Text
            style={{ fontSize: FONT_SIZE.PARA, color: COLORS.textColorLight }}
          >
            {itemInfo.meta.oneLiner}
          </Typography.Text>
        </Flex>
      </List.Item>
    );
  };

  if (!user) {
    return <Loader></Loader>;
  }

  return (
    <Flex style={{ width: "100%", padding: 16 }}>
      <List
        size="large"
        style={{ width: "100%" }}
        bordered
        dataSource={user.savedLvnzyProjects}
        renderItem={renderLvnzyProject}
      />
    </Flex>
  );
}
