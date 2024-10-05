import { HeartOutlined, SendOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Flex,
  Image,
  Modal,
  Row,
  Typography,
} from "antd";
import { useState } from "react";
import { useParams } from "react-router-dom";
import AskLiv from "../components/ask-liv";
import { Loader } from "../components/common/loader";
import { useFetchProjectById } from "../hooks/use-project";
import {
  AmenityGenIcon,
  ClubhouseIcon,
  KidsIcon,
  LandIcon,
  OutdoorsIcon,
  ParkingIcon,
  RupeeIcon,
  ServicesIcon,
  SwimmingIcon,
} from "../libs/icons";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { IAmenities, IMedia, IMetadata, IUI, Project } from "../types/Project";

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
}) => (
  <Flex vertical gap={8}>
    <Typography.Title style={{ margin: 0 }}>{metadata.name}</Typography.Title>
    <Typography.Text style={{ margin: 0, fontSize: FONT_SIZE.subHeading }}>
      {ui.oneLiner}
    </Typography.Text>
  </Flex>
);

const CostSummery: React.FC<{ project: Project }> = ({ project }) => {
  const constSummery = JSON.parse(project.ui.costSummary);

  return (
    <Flex align="center" justify="space-between">
      <Flex gap={8} align="center">
        <Typography.Text
          style={{
            margin: 0,
            fontSize: FONT_SIZE.subHeading + 5,
            fontWeight: "bold",
          }}
        >
          {constSummery.cost}
        </Typography.Text>

        <Typography.Text
          style={{ margin: 0, fontSize: FONT_SIZE.subHeading + 5 }}
        >
          /
        </Typography.Text>

        <Typography.Text style={{ margin: 0, fontSize: FONT_SIZE.subHeading }}>
          {constSummery.size}
        </Typography.Text>
      </Flex>

      <Flex gap={10}>
        <Button size="small" icon={<SendOutlined />}>
          Follow Up
        </Button>
        <Button size="small" icon={<HeartOutlined />}>
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
  return (
    <>
      <Row
        gutter={[16, 36]}
        style={{
          padding: "20px 30px",
          backgroundColor: "#F7F7F7",
          borderRadius: 10,
        }}
        align="middle"
      >
        {highlights.map((highlight: any, i: number) => (
          <Col span={8} key={i}>
            <Flex
              align="center"
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
              <Image
                src={`/images/highlights-icons/${highlight.icon}`}
                width={34}
                height={34}
                preview={false}
              />
              <Typography.Text
                style={{
                  margin: 0,
                  fontSize: FONT_SIZE.default,
                  fontWeight: "bold",
                }}
              >
                {highlight.title}
              </Typography.Text>
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
  return (
    <Flex vertical gap={30}>
      <Flex gap={20}>
        <LandIcon></LandIcon>
        <Typography.Title level={3} style={{ margin: 0 }}>
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
            <LandIcon></LandIcon>
            <Flex vertical>
              <Typography.Text
                style={{ fontSize: 18, color: COLORS.textColorLight }}
              >
                Plots
              </Typography.Text>
              <Typography.Text
                style={{ margin: 0, fontSize: FONT_SIZE.subHeading }}
              >
                {summary.plots}
              </Typography.Text>
            </Flex>
          </Flex>
          <Flex align="center" gap={8}>
            <RupeeIcon></RupeeIcon>
            <Flex vertical>
              <Typography.Text
                style={{ fontSize: 18, color: COLORS.textColorLight }}
              >
                Costing
              </Typography.Text>
              <Typography.Text
                style={{ margin: 0, fontSize: FONT_SIZE.subHeading }}
              >
                {summary.costing}
              </Typography.Text>
            </Flex>
          </Flex>
          <Flex align="center" gap={8}>
            <ServicesIcon></ServicesIcon>
            <Flex vertical>
              <Typography.Text
                style={{ fontSize: 18, color: COLORS.textColorLight }}
              >
                Services
              </Typography.Text>
              <Typography.Text
                style={{ margin: 0, fontSize: FONT_SIZE.subHeading }}
              >
                {summary.services}
              </Typography.Text>
            </Flex>
          </Flex>
        </Flex>
      </Row>
    </Flex>
  );
};

const ProjectDescription: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <Typography.Text style={{ fontSize: 18 }}>
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
}) => (
  <Flex vertical align="center" gap={10}>
    <Image src={iconSrc} width={34} height={34} preview={false} />
    <Typography.Text
      style={{
        margin: 0,
        fontSize: FONT_SIZE.subHeading,
        fontWeight: "bold",
      }}
    >
      {title}
    </Typography.Text>
    <Typography.Paragraph
      ellipsis={{
        rows: 3,
      }}
      style={{
        margin: 0,
        fontSize: FONT_SIZE.default,
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      {description}
    </Typography.Paragraph>
  </Flex>
);

const ProjectAmenities: React.FC<{ project: Project }> = ({ project }) => {
  const amenities = project.amenities;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<any>();

  const handleCancel = () => {
    setSelectedHighlight(undefined);
    setIsModalOpen(false);
  };
  return (
    <Flex vertical gap={30}>
      <Flex gap={20}>
        <LandIcon></LandIcon>
        <Typography.Title level={3} style={{ margin: 0 }}>
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
              <Col span={8}>
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

const ProjectPage: React.FC = () => {
  const { projectId } = useParams();

  const { data: projectData, isLoading: projectDataLoading } =
    useFetchProjectById(projectId!);

  if (!projectData) {
    return <Loader></Loader>;
  }

  return (
    <Flex vertical>
      <Gallery media={projectData.media} />
      <Flex style={{ marginTop: 24 }}>
        <Flex style={{ width: "66%", marginRight: "4%" }} vertical gap={50}>
          <Header metadata={projectData.metadata} ui={projectData.ui} />
          <CostSummery project={projectData} />

          <ProjectHighlights project={projectData} />

          <ProjectDescription project={projectData} />

          <ProjectSummary ui={projectData.ui} />

          <ProjectAmenities project={projectData} />
          {/* <Divider style={{ margin: 0 }}></Divider>
          <ProjectInfra />
          <Divider style={{ margin: 0 }}></Divider>
          <ProjectPlots /> */}
        </Flex>
        <Flex
          style={{
            width: "30%",
            height: 800,
            border: "1px solid",
            borderRadius: 16,
            borderColor: COLORS.borderColorDark,
            overflow: "hidden",
          }}
        >
          <AskLiv projectName={projectData.metadata.name} />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ProjectPage;
