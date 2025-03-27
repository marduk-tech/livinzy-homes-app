import { Flex, List } from "antd";
import { Loader } from "../components/common/loader";
import { useUser } from "../hooks/use-user";
import { useNavigate } from "react-router-dom";

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
        {itemInfo.meta.projectName}
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
