import { HeartOutlined } from "@ant-design/icons";
import { Col, Flex, Row, Typography } from "antd";
import { Loader } from "../components/common/loader";
import { ProjectCard } from "../components/common/project-card";
import { useDevice } from "../hooks/use-device";
import { useFetchProjects } from "../hooks/use-project";
import { useUser } from "../hooks/use-user";
import { COLORS } from "../theme/style-constants";

export function ProfilePage() {
  const { isMobile } = useDevice();
  const { user, isLoading } = useUser();

  const { data: projects, isLoading: projectIsLoading } = useFetchProjects();

  if (isLoading || projectIsLoading) {
    return <Loader />;
  }

  if (user && projects) {
    const userSavedProjects = user?.savedProjects || [];
    const savedProjects = projects?.filter((project) =>
      userSavedProjects.includes(project._id)
    );

    return (
      <Flex vertical gap={40}>
        <Flex vertical>
          <Typography.Title level={4}>Your Phone Number</Typography.Title>
          <Typography.Text
            style={{
              fontSize: 18,
              color: COLORS.textColorLight,
            }}
          >
            {user?.mobile}
          </Typography.Text>

          <Typography.Text
            style={{ marginTop: 20, color: COLORS.textColorLight }}
          >
            * Login with different mobile number to update your number
          </Typography.Text>
        </Flex>

        <Flex vertical>
          <Typography.Title level={4}>Saved Projects</Typography.Title>

          {user?.savedProjects.length === 0 ? (
            <Typography.Text
              style={{
                fontSize: 18,
                color: COLORS.textColorLight,
              }}
            >
              Click on <HeartOutlined /> icon to save a project in your profile
            </Typography.Text>
          ) : (
            <>
              <Row gutter={[32, 32]} style={{ width: "100%", margin: 0 }}>
                {savedProjects.map((project) => (
                  <Col
                    key={project._id}
                    xs={24}
                    md={12}
                    lg={6}
                    style={{ padding: isMobile ? 0 : 16 }}
                  >
                    <ProjectCard project={project} key={project._id} />
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Flex>
      </Flex>
    );
  }
}
