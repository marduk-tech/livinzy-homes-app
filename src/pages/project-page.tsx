import { Divider, Flex, Image, Typography } from "antd";
import { COLORS, FONT_SIZE } from "../theme/style-constants";

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

const Header: React.FC = () => (
  <Flex vertical gap={8}>
    <Typography.Title style={{ margin: 0 }}>
      {dummyProjectData.metadata.name}
    </Typography.Title>
    <Typography.Text style={{ margin: 0, fontSize: FONT_SIZE.subHeading }}>
      {dummyProjectData.metadata.one_liner}
    </Typography.Text>
  </Flex>
);

const ProjectSummary: React.FC = () => (
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
      {dummyProjectData.metadata.description}
    </Typography.Text>
  </Flex>
);

const ProjectAmenities: React.FC = () => (
  <Flex vertical>
    <Typography.Title level={3}>Amenities Offered</Typography.Title>
    {Object.entries(dummyProjectData.amenities).map(
      ([amenity, description]) => (
        <Flex key={amenity}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-bike"
          >
            <circle cx="18.5" cy="17.5" r="3.5" />
            <circle cx="5.5" cy="17.5" r="3.5" />
            <circle cx="15" cy="5" r="1" />
            <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
          </svg>
          <Flex vertical>
            <Typography.Text>{amenity.replace("_", " ")}</Typography.Text>
            <Typography.Text>{description as string}</Typography.Text>
          </Flex>
        </Flex>
      )
    )}
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
  return (
    <Flex vertical>
      <Gallery />
      <Flex style={{ width: "70%", marginTop: 16 }} vertical gap={24}>
        <Header />
        <ProjectSummary />
        <Divider style={{ margin: 0 }}></Divider>
        <ProjectAmenities />
        <Divider style={{ margin: 0 }}></Divider>
        <ProjectInfra />
        <Divider style={{ margin: 0 }}></Divider>
        <ProjectPlots />
      </Flex>
    </Flex>
  );
};

export default ProjectPage;
