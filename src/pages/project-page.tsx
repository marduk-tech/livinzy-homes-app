import { Divider, Flex, Image, Typography } from "antd";
import { useParams } from "react-router-dom";
import AskLiv from "../components/ask-liv";
import { Loader } from "../components/common/loader";
import { useFetchProjectById } from "../hooks/use-project";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { IAmenities, IMetadata } from "../types/Project";
import {
  AmenityGenIcon,
  ClubhouseIcon,
  KidsIcon,
  OutdoorsIcon,
  ParkingIcon,
  renderAmenityIcon,
  SwimmingIcon,
} from "../libs/icons";

const dummyProjectData: any = {
  metadata: {
    name: "Oasis Delight",
    one_liner: "Farmland · Coffee Plantation · Sakleshpur",
    plots_summary:
      "5000 to 20000 sq ft plots with coffee/pepper plantation & villa",
    cost_summary:
      "₹1000-1500 per sq  depending on the location and plot configuration",
    services_summary:
      "Clubhouse with amenities along with property management services",
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

const Gallery: React.FC = () => (
  <div
    style={{
      height: 500,
      width: "100%",
      overflowX: "scroll",
      whiteSpace: "nowrap",
      scrollbarWidth: "none",
    }}
  >
    {dummyProjectData.media.map((img: any, index: number) => (
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

const Header: React.FC<{ metadata: IMetadata }> = ({ metadata }) => (
  <Flex vertical gap={8}>
    <Typography.Title style={{ margin: 0 }}>{metadata.name}</Typography.Title>
    <Typography.Text style={{ margin: 0, fontSize: FONT_SIZE.subHeading }}>
      {metadata.oneLiner}
    </Typography.Text>
  </Flex>
);

const ProjectSummary: React.FC<{ metadata: IMetadata }> = ({ metadata }) => (
  <Flex vertical gap={16}>
    <Typography.Title level={3}>What are you Buying ?</Typography.Title>
    <Flex align="center" gap={16}>
      <Image height={40} width={40} src="../../images/plot.png"></Image>
      <Flex vertical>
        <Typography.Text style={{ fontSize: 18, color: COLORS.textColorLight }}>
          Plots
        </Typography.Text>
        <Typography.Text style={{ margin: 0, fontSize: FONT_SIZE.subHeading }}>
          {dummyProjectData.metadata.plots_summary}
        </Typography.Text>
      </Flex>
    </Flex>
    <Flex align="center" gap={16}>
      <Image height={40} width={40} src="../../images/rupee.png"></Image>
      <Flex vertical>
        <Typography.Text style={{ fontSize: 18, color: COLORS.textColorLight }}>
          Costing
        </Typography.Text>
        <Typography.Text style={{ margin: 0, fontSize: FONT_SIZE.subHeading }}>
          {dummyProjectData.metadata.cost_summary}
        </Typography.Text>
      </Flex>
    </Flex>
    <Flex align="center" gap={16}>
      <Image height={40} width={40} src="../../images/rupee.png"></Image>
      <Flex vertical>
        <Typography.Text style={{ fontSize: 18, color: COLORS.textColorLight }}>
          Services
        </Typography.Text>
        <Typography.Text style={{ margin: 0, fontSize: FONT_SIZE.subHeading }}>
          {dummyProjectData.metadata.services_summary}
        </Typography.Text>
      </Flex>
    </Flex>
    <Typography.Text style={{ marginTop: 16, fontSize: 18 }}>
      {metadata.description}
    </Typography.Text>
  </Flex>
);

const getAmenityIconAndLabel = (amenity: string) => {
  switch (amenity) {
    case "sports_external":
      return {
        label: "Outdoor Sports",
        icon: <OutdoorsIcon></OutdoorsIcon>,
      };
    case "clubhouse":
      return {
        label: "Clubhouse",
        icon: <ClubhouseIcon></ClubhouseIcon>,
      };
    case "kids":
      return {
        label: "Kids Activity",
        icon: <KidsIcon></KidsIcon>,
      };
    case "parking":
      return {
        label: "Parking",
        icon: <ParkingIcon></ParkingIcon>,
      };
    case "swimming_pool":
      return {
        label: "Swimming",
        icon: <SwimmingIcon></SwimmingIcon>,
      };
    default:
      return {
        label: "Also",
        icon: <AmenityGenIcon></AmenityGenIcon>,
      };
  }
};

const ProjectAmenities: React.FC<{ amenities: IAmenities }> = ({
  amenities,
}) => (
  <Flex vertical gap={16}>
    <Typography.Title level={3}>Amenities Offered</Typography.Title>
    {Object.entries(amenities)
      .filter((am: any) => am[0] !== "_id")
      .map(([amenity, description]) => {
        const labelAndIcon = getAmenityIconAndLabel(amenity);
        return (
          <Flex key={amenity} align="center" gap={8}>
            {labelAndIcon.icon}
            <Flex vertical>
              <Typography.Text style={{color: COLORS.textColorLight}}>{labelAndIcon.label}</Typography.Text>
              <Typography.Text>{description as string}</Typography.Text>
            </Flex>
          </Flex>
        );
      })}
  </Flex>
);

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
      <Gallery />
      <Flex>
        <Flex
          style={{ width: "66%", marginTop: 16, marginRight: "4%" }}
          vertical
          gap={24}
        >
          <Header metadata={projectData.metadata} />
          <ProjectSummary metadata={projectData.metadata} />
          <Divider style={{ margin: 0 }}></Divider>
          <ProjectAmenities amenities={projectData.amenities} />
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
