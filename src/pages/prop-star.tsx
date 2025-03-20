import { Flex, List, Modal, Rate, Tag, Typography } from "antd";
import { useFetchLvnzyProjectById } from "../hooks/use-lvnzy-project";
import { useParams } from "react-router-dom";
import { Loader } from "../components/common/loader";
import { useEffect, useState } from "react";
import { FONT_SIZE } from "../theme/style-constants";
import { capitalize } from "../libs/lvnzy-helper";
import { POP_STAR_DATA_POINTS } from "../libs/constants";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function PropStar() {
  const { lvnzyProjectId } = useParams();

  let { data: lvnzyProject, isLoading: lvnzyProjectIsLoading } =
    useFetchLvnzyProjectById(lvnzyProjectId!);

  const [scoreParams, setScoreParams] = useState<any[]>([]);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>();
  const [selectedDataPointTitle, setSelectedDataPointTitle] = useState("");

  useEffect(() => {
    if (lvnzyProject) {
      const params = [];
      params.push({
        title: "Property",
        key: "property",
        dataPoints: Object.entries(lvnzyProject.score.property),
      });
      params.push({
        title: "Developer",
        key: "developer",
        dataPoints: Object.entries(lvnzyProject.score.developer),
      });
      params.push({
        title: "Neighborhood",
        key: "neighborhood",
        dataPoints: Object.entries(lvnzyProject.score.neighborhood),
      });
      params.push({
        title: "Connectivity",
        key: "connectivity",
        dataPoints: Object.entries(lvnzyProject.score.connectivity),
      });
      params.push({
        title: "Investment",
        key: "investment",
        dataPoints: Object.entries(lvnzyProject.score.investment),
      });
      setScoreParams(params);
    }
  }, [lvnzyProject]);

  if (lvnzyProjectIsLoading) {
    return <Loader></Loader>;
  }
  return (
    <Flex
      vertical
      style={{
        borderRadius: 16,
        height: "80vh",
        width: "100%",
        margin: "auto",
        maxWidth: 700,
        scrollbarWidth: "none",
        overflowY: "auto",
      }}
    >
      <Typography.Title level={2}>
        {lvnzyProject?.originalProjectId.metadata.name}
      </Typography.Title>
      <Flex style={{ marginBottom: 24 }}>
        <Tag>RERA</Tag>
        <Tag>Open Street</Tag>
        <Tag>Google Maps</Tag>
        <Tag>BBMP/BIAPPA</Tag>
        <Tag>Open City</Tag>
      </Flex>
      <Flex vertical style={{ height: 600, overflowY: "scroll" }}>
        {scoreParams &&
          scoreParams.map((sc) => {
            return (
              <Flex vertical>
                <Typography.Title level={4}>{sc.title}</Typography.Title>

                <List
                  size="large"
                  bordered
                  dataSource={sc.dataPoints.filter(
                    (dp: any[]) => dp[0] !== "_id"
                  )}
                  renderItem={(item) => (
                    <List.Item
                      onClick={() => {
                        setDetailsModalOpen(true);
                        setSelectedDataPoint((item as any)[1]);
                        setSelectedDataPointTitle(
                          `${sc.title} > ${
                            (POP_STAR_DATA_POINTS as any)[sc.key.toLowerCase()][
                              (item as any)[0]
                            ]
                          }`
                        );
                      }}
                    >
                      <Flex align="center" style={{ width: "100%" }}>
                        <Typography.Text
                          style={{ fontSize: FONT_SIZE.HEADING_4 }}
                        >
                          {capitalize(
                            (POP_STAR_DATA_POINTS as any)[sc.key.toLowerCase()][
                              (item as any)[0]
                            ]
                          )}
                        </Typography.Text>
                        <Rate
                          style={{ marginLeft: "auto" }}
                          disabled
                          allowHalf
                          defaultValue={
                            Math.round(
                              ((item as any)[1].rating / 100) * 5 * 2
                            ) / 2
                          }
                        />
                      </Flex>
                    </List.Item>
                  )}
                />
              </Flex>
            );
          })}
      </Flex>
      <Modal
        title={selectedDataPointTitle}
        open={detailsModalOpen}
        onCancel={() => {
          setDetailsModalOpen(false);
        }}
        footer={null}
      >
        <Markdown remarkPlugins={[remarkGfm]} className="liviq-content">
          {selectedDataPoint ? selectedDataPoint.reasoning : ""}
        </Markdown>
      </Modal>
    </Flex>
  );
}
