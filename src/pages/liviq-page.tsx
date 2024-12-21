import { Flex, Typography } from "antd";
import AskLiv from "../components/ask-liv";
import { useState } from "react";
import { FONT_SIZE } from "../theme/style-constants";

export function LivIQPage() {
  const [projectsList, setProjectsList] = useState<any>([]);

  return (
    <Flex gap={8} style={{ width: "100%" }}>
      <Flex style={{ width: "29%" }}>
        <AskLiv
          onNewProjectContent={(projects: any[]) => {
            setProjectsList(projects);
          }}
        />
      </Flex>
      <Flex style={{ width: "70%" }} justify="center">
        {projectsList.map((project: any) => (
          <Flex vertical style={{ width: 200 }}>
            <div style={{ height: 150 }}></div>
            <Flex vertical style={{ padding: 8 }}>
              <Typography.Text style={{ fontSize: FONT_SIZE.subHeading }}>
                {project.projectName}
              </Typography.Text>
              <Typography.Text style={{ fontSize: FONT_SIZE.default }}>
                {project.relevantDetails}
              </Typography.Text>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
}
