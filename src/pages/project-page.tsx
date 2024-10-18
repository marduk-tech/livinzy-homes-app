import {
  ArrowUpOutlined,
  CloseOutlined,
  HeartOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Button, Col, Drawer, Flex, Image, Modal, Row, Typography } from "antd";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useParams } from "react-router-dom";
import AskLiv from "../components/ask-liv";
import { Loader } from "../components/common/loader";
import { useFetchProjectById } from "../hooks/use-project";
import { LandIcon, RupeeIcon, ServicesIcon } from "../libs/icons";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { IMedia, IMetadata, IUI, Project } from "../types/Project";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
import { rupeeAmountFormat } from "../libs/lvnzy-helper";

const dummyProjectData: any = {
  metadata: {
    name: "Oasis Delight",
  },
  ui: {
    one_liner: "Farmland · Coffee Plantation · Sakleshpur",
    summary: {
      plots: "5000 to 20000 sq ft plots with coffee/pepper plantation & villa",
      costing:
        "₹1000-1500 per sq  depending on the location and plot configuration",
      services:
        "Clubhouse with amenities along with property management services",
    },
    description:
      "Nestled across 112 acres, this farmland project offers a unique blend of natural beauty and modern amenities, featuring mango, timber, and ashok trees, with custom planting options based on soil. The land is equipped with drip irrigation, a lake with a scenic boulevard, and electric and water supply to each plot. Situated next to the protected Jawalgiri forest, the project ensures security with electric fencing, CCTV, and guards. Recreational amenities include a 10,000 sq.ft. clubhouse, sports facilities, zen gardens, picnic spots, and a 22-room resort, making it an ideal escape with ample parking for each plot.",
  },
  media: [
    {
      url: "https://cdn.pixabay.com/photo/2016/11/18/17/46/house-1836070_1280.jpg",
    },
    {
      url: "https://cdn.pixabay.com/photo/2013/08/28/00/54/field-176602_1280.jpg",
    },
    {
      url: "https://cdn.pixabay.com/photo/2018/09/17/21/35/clubhouse-3684847_1280.jpg",
    },
  ],
  amenities: {
    external_sports: "Football, volleyball",
    clubhouse:
      "overlooking a 50,000 sq ft man-made lake, the club house has state-of-the-art facilities, managed by fully trained staff & completely backed by solar power.",
    swimming_pool:
      "Temperature controlled infinity pool facing the lake with Jaccuzi and 15 seater spa",
    kids: "Table tennis, PS-5, kayaking in the lake, seperate kids zone in the property",
  },
};

const Gallery: React.FC<{ media: IMedia[] }> = ({ media }) => (
  <div
    style={{
      height: 500,
      width: "100%",
      overflowX: "scroll",
      whiteSpace: "nowrap",
      scrollbarWidth: "none",
    }}
  >
    {(media ? media : dummyProjectData.media).map((img: any, index: number) => (
      <img
        key={index}
        src={img.url}
        height="100%"
        width="auto"
        style={{ borderRadius: 8, marginRight: 8 }}
        alt={`Project image ${index + 1}`}
      />
    ))}
  </div>
);

const Header: React.FC<{ metadata: IMetadata; ui: IUI }> = ({
  metadata,
  ui,
}) => {
  const isMobile = useMediaQuery({
    query: "(max-width: 576px)",
  });

  return (
    <Flex vertical gap={8}>
      <Typography.Title level={isMobile ? 2 : 1} style={{ margin: 0 }}>
        {metadata.name}
      </Typography.Title>

      <Typography.Text
        style={{ margin: 0, fontSize: isMobile ? 16 : FONT_SIZE.subHeading }}
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
    <Row gutter={[16, 16]} align="middle" justify="space-between">
      <Col xs={24} md={12}>
        <Row align="middle">
          <Typography.Text
            style={{
              margin: 0,
              fontSize: isMobile ? 22 : 25,
              fontWeight: "bold",
            }}
          >
            {rupeeAmountFormat(costSummary.cost)}
          </Typography.Text>

          <Typography.Text
            style={{
              margin: "0 8px",
              fontSize: isMobile ? FONT_SIZE.subHeading * 0.7 : 25,
            }}
          >
            /
          </Typography.Text>

          <Typography.Text
            style={{
              margin: 0,
              fontSize: isMobile ? 16 : FONT_SIZE.subHeading,
            }}
          >
            {costSummary.size}
          </Typography.Text>
        </Row>
      </Col>

      {/* Buttons: Follow Up and Save */}
      <Col xs={24} md={12}>
        <Row justify={isMobile ? "start" : "end"} gutter={10}>
          <Col>
            <Button
              size={isMobile ? "small" : "middle"}
              icon={<SendOutlined />}
            >
              Follow Up
            </Button>
          </Col>
          <Col>
            <Button
              size={isMobile ? "small" : "middle"}
              icon={<HeartOutlined />}
            >
              Save
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
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
      <Row
        gutter={[16, isMobile ? 28 : 16]}
        style={{
          padding: "20px 30px",
          backgroundColor: "#F7F7F7",
          borderRadius: 10,
        }}
      >
        {highlights.map((highlight: any, i: number) => (
          <Col xs={24} sm={12} md={8} key={i}>
            <Flex
              align="flex-start"
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
                  iconName={highlight.icon}
                  iconSet={highlight.iconSet}
                ></DynamicReactIcon>
              ) : (
                <Image
                  src={`/images/highlights-icons/${highlight.icon}`}
                  width={isMobile ? 24 : 34}
                  height={isMobile ? 24 : 34}
                  preview={false}
                />
              )}

              <Typography.Title style={{ margin: 0 }} level={4}>
                {highlight.title}
              </Typography.Title>
            </Flex>
          </Col>
        ))}
      </Row>

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

const ProjectSummary: React.FC<{ ui: IUI }> = ({ ui }) => {
  const summary = ui.summary
    ? JSON.parse(ui.summary)
    : dummyProjectData.ui.summary;

  const isMobile = useMediaQuery({
    query: "(max-width: 576px)",
  });

  return (
    <Flex vertical gap={30}>
      <Flex gap={isMobile ? 10 : 20}>
        <LandIcon
          width={isMobile ? 30 : 40}
          height={isMobile ? 30 : 40}
        ></LandIcon>

        <Typography.Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
          What are you Buying ?
        </Typography.Title>
      </Flex>

      <Row
        style={{
          padding: "20px 30px",
          backgroundColor: "#F7F7F7",
          borderRadius: 10,
        }}
        align="middle"
      >
        <Flex vertical gap={40}>
          <Flex align="center" gap={8}>
            <div style={{ flexShrink: 0 }}>
              <LandIcon
                width={isMobile ? 20 : 40}
                height={isMobile ? 20 : 40}
              ></LandIcon>
            </div>
            <Flex vertical>
              <Typography.Text
                style={{
                  fontSize: isMobile ? 14 : 18,
                  color: COLORS.textColorLight,
                }}
              >
                Plots
              </Typography.Text>
              <Typography.Text
                style={{
                  margin: 0,
                  fontSize: isMobile ? 16 : FONT_SIZE.subHeading,
                }}
              >
                {summary.plots}
              </Typography.Text>
            </Flex>
          </Flex>
          <Flex align="center" gap={8}>
            <div style={{ flexShrink: 0 }}>
              <RupeeIcon
                width={isMobile ? 20 : 40}
                height={isMobile ? 20 : 40}
              ></RupeeIcon>
            </div>
            <Flex vertical>
              <Typography.Text
                style={{
                  fontSize: isMobile ? 14 : 18,
                  color: COLORS.textColorLight,
                }}
              >
                Costing
              </Typography.Text>
              <Typography.Text
                style={{
                  margin: 0,
                  fontSize: isMobile ? 16 : FONT_SIZE.subHeading,
                }}
              >
                {summary.costing}
              </Typography.Text>
            </Flex>
          </Flex>
          <Flex align="center" gap={8}>
            <div style={{ flexShrink: 0 }}>
              <ServicesIcon
                width={isMobile ? 20 : 40}
                height={isMobile ? 20 : 40}
              ></ServicesIcon>
            </div>

            <Flex vertical>
              <Typography.Text
                style={{
                  fontSize: isMobile ? 14 : 18,
                  color: COLORS.textColorLight,
                }}
              >
                Income
              </Typography.Text>
              <Typography.Text
                style={{
                  margin: 0,
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
  );
};

const ProjectDescription: React.FC<{ project: Project }> = ({ project }) => {
  const isMobile = useMediaQuery({
    query: "(max-width: 576px)",
  });

  return (
    <Typography.Text style={{ fontSize: isMobile ? 16 : 18 }}>
      {project.ui.description}
    </Typography.Text>
  );
};

const getAmenityIconAndLabel = (amenity: string) => {
  switch (amenity) {
    case "sports_external":
      return {
        label: "Outdoor Sports",
        iconSrc: "/images/amenities-icons/others.png",
      };
    case "clubhouse":
      return {
        label: "Clubhouse",
        iconSrc: "/images/amenities-icons/clubhouse.png",
      };
    case "kids":
      return {
        label: "Kids Activity",
        iconSrc: "/images/amenities-icons/kids.png",
      };
    case "parking":
      return {
        label: "Parking",
        iconSrc: "/images/amenities-icons/parks.png",
      };
    case "parks":
      return {
        label: "Parking",
        iconSrc: "/images/amenities-icons/parks.png",
      };
    case "swimming_pool":
      return {
        label: "Swimming",
        iconSrc: "/images/amenities-icons/swimming-pool.png",
      };
    default:
      return {
        label: "Others",
        iconSrc: "/images/amenities-icons/others.png",
      };
  }
};

interface AmenityCardProps {
  iconSrc: string;
  title: string;
  description: string;
}
const AmenityCard: React.FC<AmenityCardProps> = ({
  iconSrc,
  title,
  description,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const isMobile = useMediaQuery({
    query: "(max-width: 576px)",
  });

  return (
    <>
      <Flex vertical align="center" gap={10}>
        <Image
          src={iconSrc}
          width={isMobile ? 25 : 34}
          height={isMobile ? 25 : 34}
          preview={false}
        />

        <Flex vertical justify="center">
          <Typography.Text
            style={{
              margin: 0,
              fontSize: isMobile ? 16 : FONT_SIZE.subHeading,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {title}
          </Typography.Text>
          <Typography.Paragraph
            onClick={() => setIsModalOpen(true)}
            ellipsis={{
              rows: 3,
              expandable: false,
            }}
            style={{
              margin: 0,
              fontSize: isMobile ? 14 : FONT_SIZE.default,
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            {description}
          </Typography.Paragraph>{" "}
        </Flex>
      </Flex>

      <Modal
        title={title || ""}
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
          {description}
        </Typography.Text>
      </Modal>
    </>
  );
};

const ProjectAmenities: React.FC<{ project: Project }> = ({ project }) => {
  const amenities = project.amenities;

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
    <Flex vertical gap={30}>
      <Flex gap={isMobile ? 10 : 20}>
        <LandIcon
          width={isMobile ? 30 : 40}
          height={isMobile ? 30 : 40}
        ></LandIcon>
        <Typography.Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
          Amenities Offered
        </Typography.Title>
      </Flex>
      <Row
        gutter={[16, 36]}
        style={{
          padding: "20px 30px",
          backgroundColor: "#F7F7F7",
          borderRadius: 10,
        }}
        align="middle"
      >
        {Object.entries(amenities)
          .filter((am: any) => am[0] !== "_id")
          .map(([amenity, description]) => {
            console.log(amenity);
            console.log(description);

            const labelAndIcon = getAmenityIconAndLabel(amenity);
            return (
              <Col xs={12} md={8} key={amenity}>
                <AmenityCard
                  description={description}
                  iconSrc={labelAndIcon.iconSrc}
                  title={labelAndIcon.label}
                />
              </Col>
            );
          })}
      </Row>

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

  return (
    <Flex vertical>
      <Gallery media={projectData.media} />
      <Row gutter={30} style={{ marginTop: isMobile ? 24 : 40 }}>
        <Col xs={24} md={hideAskLiv ? 24 : 16} style={{ marginBottom: 24 }}>
          <Flex vertical gap={isMobile ? 35 : 50}>
            <Header metadata={projectData.metadata} ui={projectData.ui} />

            <CostSummery project={projectData} />

            <ProjectHighlights project={projectData} />

            <ProjectDescription project={projectData} />

            <ProjectSummary ui={projectData.ui} />

            <ProjectAmenities project={projectData} />
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
                border: "1px solid",
                borderRadius: 16,
                borderColor: COLORS.borderColorDark,
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
