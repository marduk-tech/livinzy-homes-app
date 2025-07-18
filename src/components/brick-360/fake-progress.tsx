import { Flex, Progress, Typography } from "antd";
import { DataSources } from "../common/data-sources";

interface FakeProgressProps {
  progress: number;
  projectName: string;
}

export const FakeProgress = ({ progress, projectName }: FakeProgressProps) => {
  const progressWidth = window.innerWidth < 800 ? window.innerWidth : 800;

  return (
    <Flex
      vertical
      style={{
        padding: 16,
        width: progressWidth,
        position: "fixed",
        top: "20%",
        left: `calc(50% - ${progressWidth / 2}px)`,
      }}
    >
      <Flex vertical>
        <DataSources disableDetailsDialog={true}></DataSources>
      </Flex>
      <Typography.Title
        level={2}
        style={{
          margin: 0,
          padding: 8,
        }}
      >
        {projectName}
      </Typography.Title>
      <Flex vertical style={{ marginTop: 16 }}>
        {" "}
        <Typography.Text style={{ padding: "0 8px" }}>
          {progress < 20
            ? "Starting up"
            : progress < 80
            ? "Collecting Data"
            : "Finishing up"}
        </Typography.Text>
        <Progress percent={progress} style={{ padding: 8 }} />
      </Flex>
    </Flex>
  );
};
