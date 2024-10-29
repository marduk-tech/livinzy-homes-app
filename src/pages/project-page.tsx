import {
  ArrowUpOutlined,
  CloseOutlined,
  HeartOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Button, Col, Drawer, Flex, Image, Modal, Row, Typography } from "antd";
import React, { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useParams } from "react-router-dom";
import AskLiv from "../components/ask-liv";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
import LivestIndexRange from "../components/common/livest-index-range";
import { Loader } from "../components/common/loader";
import { LivestmentView } from "../components/map-view/livestment-view";
import { useDevice } from "../hooks/use-device";
import { useFetchProjectById } from "../hooks/use-project";
import { LivestIndexConfig } from "../libs/constants";
import { capitalize, rupeeAmountFormat } from "../libs/lvnzy-helper";
import { sortedMedia } from "../libs/utils";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { IMedia, IMetadata, IUI, Project } from "../types/Project";

const Gallery: React.FC<{ media: IMedia[] }> = ({ media }) => (
  <Flex
    style={{
      height: 500,
      width: "100%",
      overflowX: "scroll",
      whiteSpace: "nowrap",
      scrollbarWidth: "none",
    }}
  >
    {media
      .filter((item: IMedia) => item.type === "image" && item.image)
      .map((img: IMedia, index: number) => (
        <div style={{ width: "100%", position: "relative" }}>
          <img
            key={index}
            src={img.image!.url}
            height="100%"
            width="auto"
            style={{
              borderRadius: 8,
              minWidth: 200,
              marginRight: 8,
              filter: "brightness(1.1) contrast(1.1) saturate(1.1)  sepia(0.3)",
            }}
            alt={img.image!.caption || `Project image ${index + 1}`}
          />
          {img.image!.caption || (img.image?.tags && img.image.tags.length) ? (
            <Typography.Text
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                color: "white",
                textTransform: "capitalize",
                borderTopRightRadius: 8,
                padding: "8px 16px",
                backgroundColor: "rgba(0,0,0,0.3)",
              }}
            >
              {img.image!.caption || img.image!.tags}
            </Typography.Text>
          ) : null}
        </div>
      ))}
  </Flex>
);

const Header: React.FC<{ metadata: IMetadata; ui: IUI }> = ({
  metadata,
  ui,
}) => {
  return (
    <Flex vertical>
      <Typography.Text style={{ margin: 0, fontSize: FONT_SIZE.heading }}>
        {metadata.name}
      </Typography.Text>

      <Typography.Text
        style={{
          margin: 0,
          fontSize: FONT_SIZE.subHeading,
          color: COLORS.textColorLight,
        }}
      >
        {ui.oneLiner}
      </Typography.Text>
    </Flex>
  );
};

const CostSummery: React.FC<{ project: Project }> = ({ project }) => {
  const costSummary = JSON.parse(project.ui.costSummary);

  const isMobile = useMediaQuery({
    query: "(max-width: 576px)",
  });

  return (
    <Flex>
      <Flex vertical>
        <Typography.Text
          style={{ color: COLORS.textColorLight }}
        ></Typography.Text>
        <Flex align="flex-end">
          <Typography.Text
            style={{
              margin: 0,
              fontSize: FONT_SIZE.title,
              lineHeight: "100%",
            }}
          >
            ₹{rupeeAmountFormat(costSummary.cost)}
          </Typography.Text>

          <Typography.Text
            style={{
              margin: "0 8px",
              lineHeight: "100%",
              fontSize: FONT_SIZE.subHeading,
            }}
          >
            /
          </Typography.Text>

          <Typography.Text
            style={{
              margin: 0,
              lineHeight: "100%",
              fontSize: FONT_SIZE.subHeading,
            }}
          >
            {costSummary.size}
          </Typography.Text>
        </Flex>
        {costSummary.sqftRate ? (
          <Typography.Text style={{ color: COLORS.textColorLight }}>
            ₹{costSummary.sqftRate} per sqft
          </Typography.Text>
        ) : null}
      </Flex>

      {/* Buttons: Follow Up and Save */}
      <Flex style={{ marginLeft: "auto" }} gap={8}>
        <Button size={isMobile ? "small" : "middle"} icon={<SendOutlined />}>
          Follow Up
        </Button>
        <Button size={isMobile ? "small" : "middle"} icon={<HeartOutlined />}>
          Save
        </Button>
      </Flex>
    </Flex>
  );
};

const ProjectHighlights: React.FC<{ project: Project }> = ({ project }) => {
  const highlights = JSON.parse(project.ui.highlights);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<any>();

  const handleCancel = () => {
    setSelectedHighlight(undefined);
    setIsModalOpen(false);
  };

  const isMobile = useMediaQuery({
    query: "(max-width: 576px)",
  });

  return (
    <>
      <Flex
        vertical
        gap={32}
        style={{
          padding: "32px 0",
          borderTop: "2px solid",
          borderBottom: "2px solid",
          borderColor: COLORS.borderColor,
        }}
      >
        {highlights.map((highlight: any, i: number) => (
          <Flex
            gap={10}
            style={{
              cursor: "pointer",
            }}
            onClick={() => {
              if (highlight.description) {
                setSelectedHighlight(highlight);
                setIsModalOpen(true);
              }
            }}
          >
            {highlight.iconSet ? (
              <DynamicReactIcon
                size={24}
                iconName={highlight.icon}
                iconSet={highlight.iconSet}
              ></DynamicReactIcon>
            ) : (
              <Image
                src={`/images/highlights-icons/${highlight.icon}`}
                width={24}
                height={24}
                preview={false}
              />
            )}
            <Flex vertical>
              <Typography.Text
                style={{ fontSize: FONT_SIZE.subHeading, lineHeight: "100%" }}
              >
                {highlight.title}
              </Typography.Text>
              <Typography.Text>{highlight.description}</Typography.Text>
            </Flex>
          </Flex>
        ))}
      </Flex>

      <Modal
        title={selectedHighlight?.title || ""}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button size="small" key="back" onClick={handleCancel}>
            Okay
          </Button>,
        ]}
      >
        <Typography.Text
          style={{
            margin: 0,
            fontSize: FONT_SIZE.default,
          }}
        >
          {selectedHighlight?.description}
        </Typography.Text>
      </Modal>
    </>
  );
};

const ProjectSummary: React.FC<{ ui: IUI; media: IMedia[] }> = ({
  ui,
  media,
}) => {
  const summary = JSON.parse(ui.summary);

  const isMobile = useMediaQuery({
    query: "(max-width: 576px)",
  });

  return (
    <Flex
      vertical
      gap={24}
      style={{
        marginTop: 24,
        paddingBottom: 64,
        borderBottom: "1px solid",
        borderBottomColor: COLORS.borderColor,
      }}
    >
      <Flex>
        <Typography.Text style={{ margin: 0, fontSize: FONT_SIZE.title }}>
          What are you Buying ?
        </Typography.Text>
      </Flex>

      <Flex
        style={{
          overflowX: "scroll",
          whiteSpace: "nowrap",
          width: "100%",
          scrollbarWidth: "none",
        }}
      >
        <Flex style={{}}>
          <Row
            style={{
              borderRadius: 10,
              width: 700,
              textWrap: "wrap",
            }}
            align="middle"
          >
            <Flex vertical gap={40}>
              <Flex align="flex-start" gap={8}>
                <DynamicReactIcon
                  iconName="GiIsland"
                  iconSet="gi"
                ></DynamicReactIcon>
                <Flex vertical gap={4}>
                  <Typography.Text
                    style={{
                      fontSize: isMobile ? 14 : 18,
                      color: COLORS.textColorLight,
                      lineHeight: "100%",
                    }}
                  >
                    Plots
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      margin: 0,
                      fontSize: isMobile ? 16 : FONT_SIZE.subHeading,
                      lineHeight: "100%",
                    }}
                  >
                    {summary.plots}
                  </Typography.Text>
                </Flex>
              </Flex>
              <Flex align="flex-start" gap={8}>
                <DynamicReactIcon
                  iconName="HiCurrencyRupee"
                  iconSet="hi"
                ></DynamicReactIcon>
                <Flex vertical gap={4}>
                  <Typography.Text
                    style={{
                      lineHeight: "100%",
                      fontSize: isMobile ? 14 : 18,
                      color: COLORS.textColorLight,
                    }}
                  >
                    Costing
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      margin: 0,
                      lineHeight: "100%",
                      fontSize: isMobile ? 16 : FONT_SIZE.subHeading,
                    }}
                  >
                    {summary.costing}
                  </Typography.Text>
                </Flex>
              </Flex>
              <Flex align="flex-start" gap={8}>
                <DynamicReactIcon
                  iconName="GiReceiveMoney"
                  iconSet="gi"
                ></DynamicReactIcon>

                <Flex vertical gap={4}>
                  <Typography.Text
                    style={{
                      lineHeight: "100%",
                      fontSize: isMobile ? 14 : 18,
                      color: COLORS.textColorLight,
                    }}
                  >
                    Income
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      margin: 0,
                      lineHeight: "100%",
                      fontSize: isMobile ? 16 : FONT_SIZE.subHeading,
                    }}
                  >
                    {summary.income}
                  </Typography.Text>
                </Flex>
              </Flex>
            </Flex>
          </Row>
        </Flex>
        {media
          .filter(
            (m: IMedia) => m.type == "image" && m.image!.tags.includes("layout")
          )
          .map((m: IMedia) => {
            return (
              <Image
                src={m.image?.url}
                style={{
                  maxHeight: 250,
                  width: "auto",
                  border: "4px solid",
                  borderRadius: 8,
                  borderColor: COLORS.primaryColor,
                }}
              ></Image>
            );
          })}
      </Flex>
    </Flex>
  );
};

const ProjectDescription: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <Typography.Text style={{ fontSize: FONT_SIZE.subText }}>
      {project.ui.description}
    </Typography.Text>
  );
};

const AmenityCard: React.FC<any> = ({ amenity }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  if (!amenity) {
    return;
  }

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Flex align="center" gap={10} style={{ padding: 8 }}>
        <DynamicReactIcon
          iconName={amenity.icon}
          iconSet={amenity.iconSet}
        ></DynamicReactIcon>

        <Flex vertical justify="center">
          <Typography.Text
            style={{
              margin: 0,
              fontSize: FONT_SIZE.subHeading,
              textAlign: "center",
            }}
          >
            {amenity.title}
          </Typography.Text>
          {/* <Typography.Paragraph
            onClick={() => setIsModalOpen(true)}
            ellipsis={{
              rows: 3,
              expandable: false,
            }}
            style={{
              margin: 0,
              whiteSpace: "wrap",
              fontSize: isMobile ? 14 : FONT_SIZE.default,
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            {amenity.description}
          </Typography.Paragraph>{" "} */}
        </Flex>
      </Flex>

      <Modal
        title={amenity.title || ""}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button size="small" key="back" onClick={handleCancel}>
            Okay
          </Button>,
        ]}
      >
        <Typography.Text
          style={{
            margin: 0,
            fontSize: FONT_SIZE.default,
          }}
        >
          {amenity.description}
        </Typography.Text>
      </Modal>
    </>
  );
};

const ProjectAmenities: React.FC<{ project: Project }> = ({ project }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<any>();

  let amenities;
  try {
    amenities = JSON.parse(project.ui.amenitiesSummary);
  } catch (err) {
    console.log("amenities not rightly structuered");
  }
  if (!amenities) {
    return;
  }

  const handleCancel = () => {
    setSelectedHighlight(undefined);
    setIsModalOpen(false);
  };

  return (
    <Flex vertical gap={24}>
      <Flex>
        <Typography.Text style={{ fontSize: FONT_SIZE.title }}>
          Amenities Offered
        </Typography.Text>
      </Flex>
      <Flex
        gap={100}
        style={{ backgroundColor: "white", padding: 16, borderRadius: 16 }}
      >
        <Flex vertical>
          {amenities.slice(0, 5).map((amenity: any) => {
            return <AmenityCard amenity={amenity} />;
          })}
        </Flex>
        {amenities.length > 5 ? (
          <Flex vertical>
            {amenities.slice(5, 10).map((amenity: any) => {
              return <AmenityCard amenity={amenity} />;
            })}
          </Flex>
        ) : null}
      </Flex>

      <Modal
        title={selectedHighlight?.title || ""}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button size="small" key="back" onClick={handleCancel}>
            Okay
          </Button>,
        ]}
      >
        <Typography.Text
          style={{
            margin: 0,
            fontSize: FONT_SIZE.default,
          }}
        >
          {selectedHighlight?.description}
        </Typography.Text>
      </Modal>
    </Flex>
  );
};

const Livestment: React.FC<{ project: Project }> = ({ project }) => {
  const { isMobile } = useDevice();
  const livestIndexConfig = LivestIndexConfig;

  return (
    <Flex vertical style={{ marginTop: 32 }}>
      <Flex gap={isMobile ? 10 : 20}>
        <Typography.Text style={{ fontSize: FONT_SIZE.title }}>
          LivIndex
        </Typography.Text>
      </Flex>
      <Flex gap={16} style={{ height: 400, marginTop: 16 }}>
        <Flex
          gap={16}
          vertical
          style={{
            width: "30%",
            height: "100%",
            overflowY: "scroll",
            scrollbarWidth: "none",
          }}
        >
          <LivestIndexRange
            value={project.livestment.livestmentScore}
          ></LivestIndexRange>
          {livestIndexConfig.map((config: any) => {
            const subLiv = (project.livestment as any)[config.key];
            return subLiv && subLiv.score && config.key !== "roads" ? (
              <Flex
                vertical
                style={{
                  padding: 16,
                  backgroundColor: "white",
                  borderRadius: 16,
                  border: "1px solid",
                  borderColor: COLORS.borderColor,
                }}
              >
                <Typography.Text style={{ color: COLORS.textColorLight }}>
                  {config.heading}
                </Typography.Text>
                <Typography.Paragraph
                  ellipsis={{ rows: 3, expandable: true, symbol: "more" }}
                  style={{ margin: 0 }}
                >
                  Proximity to {config.heading.toLowerCase()} like{" "}
                  {subLiv.placesList
                    .map((p: any) => capitalize(p.name))
                    .join(", ")}
                  .
                </Typography.Paragraph>
              </Flex>
            ) : null;
          })}
        </Flex>
        <Flex vertical style={{ borderRadius: 32, height: 400, width: "70%" }}>
          <LivestmentView project={project}></LivestmentView>
        </Flex>
      </Flex>
    </Flex>
  );
};

const ProjectInfra: React.FC = () => (
  <Flex vertical>
    <Typography.Title level={3}>More about Farmland & Infra</Typography.Title>
  </Flex>
);

const ProjectPlots: React.FC = () => (
  <Flex vertical>
    <Typography.Title level={3}>More about the plots</Typography.Title>
  </Flex>
);

const MobileAskLiv: React.FC<{ projectName: string }> = ({ projectName }) => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={showDrawer}
        style={{
          width: "100%",
          border: "none",
          backgroundColor: "white",
          borderTop: "1px solid",
          padding: "15px 20px",
          borderColor: COLORS.borderColor,
          cursor: "pointer",
        }}
      >
        <Flex justify="space-between" align="center">
          <Flex gap={10} align="center">
            <Image
              src="/images/img-plchlder.png"
              width={25}
              height={25}
              style={{ borderRadius: 100 }}
            />

            <Typography.Text>Got questions? Ask away!</Typography.Text>
          </Flex>

          <ArrowUpOutlined
            style={{
              color: COLORS.textColorDark,
            }}
          />
        </Flex>
      </button>

      <Drawer
        title={
          <Flex align="center" justify="space-between">
            <Typography.Text>Ask Liv</Typography.Text>
            <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
          </Flex>
        }
        styles={{
          header: {
            paddingTop: "5px",
            paddingBottom: "5px",
          },
        }}
        placement="bottom"
        closable={false}
        onClose={onClose}
        open={open}
        height="100%"
      >
        <AskLiv projectName={projectName} />
      </Drawer>
    </>
  );
};

const ProjectPage: React.FC = () => {
  const { projectId } = useParams();

  const { data: projectData, isLoading: projectDataLoading } =
    useFetchProjectById(projectId!);

  const isMobile = useMediaQuery({
    query: "(max-width: 576px)",
  });

  const hideAskLiv = useMediaQuery({
    query: "(max-width: 1118px)",
  });

  if (!projectData) {
    return <Loader></Loader>;
  }

  const sortedMediaArray = sortedMedia({
    media: projectData.media,
    setPreviewInFirstPlace: true,
  });

  return (
    <Flex vertical>
      <Gallery media={sortedMediaArray} />
      <Row gutter={30} style={{ marginTop: isMobile ? 24 : 40 }}>
        <Col xs={24} md={hideAskLiv ? 24 : 16} style={{ marginBottom: 24 }}>
          <Flex vertical gap={32}>
            <Header metadata={projectData.metadata} ui={projectData.ui} />

            <CostSummery project={projectData} />

            <ProjectHighlights project={projectData} />

            <ProjectDescription project={projectData} />

            <ProjectSummary ui={projectData.ui} media={projectData.media} />

            <ProjectAmenities project={projectData} />

            <Livestment project={projectData} />
          </Flex>
        </Col>

        {hideAskLiv ? (
          <div
            style={{ width: "100%", position: "sticky", bottom: 0, left: 0 }}
          >
            <MobileAskLiv projectName={projectData.metadata.name} />
          </div>
        ) : (
          <Col xs={0} md={8}>
            <Flex
              style={{
                height: 800,
                overflow: "hidden",
              }}
            >
              <AskLiv projectName={projectData.metadata.name} />
            </Flex>
          </Col>
        )}
      </Row>
    </Flex>
  );
};

export default ProjectPage;
