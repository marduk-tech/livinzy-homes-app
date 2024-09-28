import { useQuery } from "@tanstack/react-query";
import { Col, Flex, Row } from "antd";
import { Loader } from "../components/common/loader";
import { ProjectCard } from "../components/common/project-card";
import { useDevice } from "../hooks/use-device";
import { queries } from "../libs/queries";

export function HomePage() {
  const { isMobile } = useDevice();

  const { data: projects, isLoading: projectIsLoading } = useQuery({
    ...queries.getAllProjects(),
    throwOnError: true,
  });

  if (projectIsLoading) {
    return <Loader />;
  }

  if (projects) {
    return (
      <Flex
        justify="center"
        style={{
          width: "100%",
          marginTop: 16,
          padding: `16px ${isMobile ? "20px" : "40px"}`,
        }}
      >
        <Row gutter={[35, 30]} style={{ width: "100%" }}>
          {projects.map((project) => (
            <Col key={project._id} xs={24} md={12} lg={6}>
              <ProjectCard project={project} key={project._id} />
            </Col>
          ))}
        </Row>
      </Flex>
    );
  }

  return null;
}
