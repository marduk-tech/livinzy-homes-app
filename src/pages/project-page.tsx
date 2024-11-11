import {
  ArrowUpOutlined,
  CloseOutlined,
  HeartFilled,
  HeartOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  Button,
  Drawer,
  Flex,
  FloatButton,
  Image,
  Modal,
  notification,
  Row,
  Typography,
} from "antd";
import React, { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useParams } from "react-router-dom";
import AskLiv from "../components/ask-liv";
import { CalendlyPopup } from "../components/calendly-popup";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
import LivestIndexRange from "../components/common/livest-index-range";
import { Loader } from "../components/common/loader";
import { LivestmentView } from "../components/map-view/livestment-view";
import { useDevice } from "../hooks/use-device";
import { useFetchProjectById } from "../hooks/use-project";
import { useUser } from "../hooks/use-user";
import { useUpdateUserMutation } from "../hooks/user-hooks";
import { LivestIndexConfig } from "../libs/constants";
import { capitalize, rupeeAmountFormat } from "../libs/lvnzy-helper";
import { sortedMedia } from "../libs/utils";
import "../theme/scroll-bar.css";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { IMedia, IMetadata, IUI, Project } from "../types/Project";

const Gallery: React.FC<{ media: IMedia[] }> = ({ media }) => {
  const { isMobile } = useDevice();
  return (
    <div className="scrollbar-wrapper">
      <Flex
        className="custom-scrollbar"
        style={{
          height: isMobile ? 320 : 520,
          width: "100%",
          overflowX: "scroll",
          whiteSpace: "nowrap",
        }}
      >
        {media
          .filter((item: IMedia) => item.type === "image" && item.image)
          .map((img: IMedia, index: number) => (
            <div style={{ position: "relative" }}>
              <img
                key={index}
                src={img.image!.url}
                height="100%"
                width="auto"
                style={{
                  overflow: "hidden",
                  borderRadius: 8,
                  minWidth: 200,
                  marginRight: 8,
                  position: "relative",
                  filter:
                    "brightness(1.1) contrast(1.1) saturate(1.1)  sepia(0.3)",
                }}
                alt={img.image!.caption || `Project image ${index + 1}`}
              />
              {img.image!.caption ||
              (img.image?.tags && img.image.tags.length) ? (
                <Typography.Text
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    color: "white",
                    textTransform: "capitalize",
                    borderTopRightRadius: 8,
                    borderBottomLeftRadius: 8,

                    padding: "8px 16px",
                    backgroundColor: "rgba(0,0,0,0.3)",
                  }}
                >
                  {img.image!.caption || img.image!.tags}
                </Typography.Text>
              ) : null}
            </div>
          ))}

        {media
          .filter((item: IMedia) => item.type === "video" && item.video)
          .map((media: IMedia, index: number) => (
            <div
              style={{
                height: "100%",
                width: isMobile ? "100%" : "49%",
                borderRadius: 8,
                overflow: "hidden",
                flexShrink: 0,
                marginRight: 8,
                position: "relative",
              }}
            >
              <iframe
                src={`https://iframe.mediadelivery.net/embed/330257/${media.video?.bunnyVideoId}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`}
                loading="lazy"
                style={{
                  height: "100%",
                  width: "100%",
                  border: "none",
                }}
                allow="accelerometer;gyroscope;encrypted-media;picture-in-picture;"
              ></iframe>
              //{" "}
              {media.video!.caption ||
              (media.video?.tags && media.video.tags.length) ? (
                <Typography.Text
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    color: "white",
                    textTransform: "capitalize",
                    borderBottomLeftRadius: 8,
                    padding: "8px 16px",
                    backgroundColor: "rgba(0,0,0,0.3)",
                  }}
                >
                  {media.video!.caption || media.video!.tags}
                </Typography.Text>
              ) : null}
            </div>
          ))}
      </Flex>
    </div>
  );
};

const Header: React.FC<{ metadata: IMetadata; ui: IUI }> = ({
  metadata,
  ui,
}) => {
  return (
    <Flex vertical>
      <Typography.Text style={{ margin: 0, fontSize: FONT_SIZE.title }}>
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
  const { isMobile } = useDevice();
  const { projectId } = useParams();

  const { user } = useUser();
  const updateUser = useUpdateUserMutation({
    userId: user?._id as string,
    enableToasts: false,
  });

  const handleSave = () => {
    if (user) {
      const updatedProjects = user.savedProjects || [];

      // Toggle projectId: remove if exists, add if not
      const projectExists = updatedProjects.includes(projectId as string);
      console.log(projectExists);

      const newProjects = projectExists
        ? updatedProjects.filter((id) => id !== projectId)
        : [...updatedProjects, projectId];

      const uniqueProjects = Array.from(new Set(newProjects));

      updateUser.mutate({
        userData: {
          savedProjects: uniqueProjects as string[],
        },
      });
    } else {
      notification.error({
        message: "Please login first",
      });
    }
  };

  const isSaved = user?.savedProjects.includes(projectId as string);

  const [showCalendlyPopup, setShowCalendlyPopup] = useState(false);

  return (
    <Flex vertical={isMobile} style={{ marginRight: isMobile ? 16 : 0 }}>
      <Flex vertical>
        <Flex align="flex-end">
          <Typography.Text
            style={{
              margin: 0,
              fontSize: FONT_SIZE.heading,
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
            Priced at ₹{costSummary.sqftRate} per sqft.{" "}
            {costSummary.details ? costSummary.details : ""}
          </Typography.Text>
        ) : null}
      </Flex>

      {/* Buttons: Follow Up and Save */}
      <Flex
        style={{
          marginLeft: isMobile ? 0 : "auto",
          marginTop: isMobile ? 24 : 0,
        }}
        gap={8}
      >
        <CalendlyPopup
          open={showCalendlyPopup}
          onCancel={() => setShowCalendlyPopup(false)}
        />
        <Button
          type="default"
          onClick={() => setShowCalendlyPopup(true)}
          size={isMobile ? "small" : "middle"}
          icon={<SendOutlined />}
        >
          Schedule Callback
        </Button>
        <Button
          loading={updateUser.isPending}
          onClick={handleSave}
          size={isMobile ? "small" : "middle"}
          icon={isSaved ? <HeartFilled /> : <HeartOutlined />}
          type={isSaved ? "primary" : "default"}
        >
          {isMobile ? "" : `${isSaved ? "Saved" : "Save"}`}
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
            fontSize: FONT_SIZE.subText,
          }}
        >
          {selectedHighlight?.details || selectedHighlight?.description}
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

  const layoutImages = media.filter(
    (m: IMedia) => m.type == "image" && m.image!.tags.includes("layout")
  );

  return (
    <Flex
      vertical
      gap={24}
      style={{
        paddingBottom: 48,
        borderBottom: "1px solid",
        borderBottomColor: COLORS.borderColor,
      }}
    >
      <Flex>
        <Typography.Text style={{ margin: 0, fontSize: FONT_SIZE.heading }}>
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
        gap={8}
      >
        <Flex
          style={{
            padding: 24,
            backgroundColor: COLORS.bgColorDark,
            borderRadius: 8,
            width: "100%",
          }}
        >
          <Row
            style={{
              borderRadius: 10,
              width: isMobile
                ? layoutImages && layoutImages.length
                  ? "calc(100vw - 100px)"
                  : "100vw"
                : 700,
              textWrap: "wrap",
            }}
            align="middle"
          >
            <Flex vertical gap={40}>
              <Flex align="flex-start" gap={8}>
                <DynamicReactIcon
                  iconName="GiIsland"
                  iconSet="gi"
                  color="white"
                  size={32}
                ></DynamicReactIcon>
                <Flex vertical gap={4}>
                  <Typography.Text
                    style={{
                      fontSize: FONT_SIZE.subText,
                      color: COLORS.textColorVeryLight,
                      lineHeight: "100%",
                      textTransform: "uppercase",
                    }}
                  >
                    Plots
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      margin: 0,
                      color: "white",
                      fontSize: FONT_SIZE.subHeading,
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
                  color="white"
                  size={32}
                ></DynamicReactIcon>
                <Flex vertical gap={4}>
                  <Typography.Text
                    style={{
                      lineHeight: "100%",
                      fontSize: FONT_SIZE.subText,
                      textTransform: "uppercase",
                      color: COLORS.textColorVeryLight,
                    }}
                  >
                    Costing
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      margin: 0,
                      lineHeight: "100%",
                      fontSize: isMobile ? 16 : FONT_SIZE.subHeading,
                      color: "white",
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
                  color="white"
                  size={32}
                ></DynamicReactIcon>

                <Flex vertical gap={4}>
                  <Typography.Text
                    style={{
                      lineHeight: "100%",
                      fontSize: FONT_SIZE.subText,
                      textTransform: "uppercase",
                      color: COLORS.textColorVeryLight,
                    }}
                  >
                    Income
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      margin: 0,
                      lineHeight: "100%",
                      fontSize: isMobile ? 16 : FONT_SIZE.subHeading,
                      color: "white",
                    }}
                  >
                    {summary.income}
                  </Typography.Text>
                </Flex>
              </Flex>
            </Flex>
          </Row>
        </Flex>
        {layoutImages.map((m: IMedia) => {
          return (
            <Image
              src={m.image?.url}
              style={{
                height: 300,
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

  const { isMobile } = useDevice();

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
        <Typography.Text style={{ fontSize: FONT_SIZE.heading }}>
          Amenities Offered
        </Typography.Text>
      </Flex>
      <Flex
        gap={isMobile ? 0 : 100}
        vertical={isMobile}
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
      <Flex align="center" gap={8}>
        <DynamicReactIcon
          iconName="PiRanking"
          iconSet="pi"
          size={36}
          color={COLORS.primaryColor}
        ></DynamicReactIcon>
        <Typography.Text style={{ fontSize: FONT_SIZE.heading }}>
          LivIndex
        </Typography.Text>
      </Flex>
      <Flex
        vertical={isMobile ? true : false}
        gap={16}
        style={{ height: isMobile ? "auto" : 400, marginTop: 16 }}
      >
        <Flex
          gap={16}
          vertical
          style={{
            width: isMobile ? "100%" : "30%",
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
                  padding: 8,
                  backgroundColor: "white",
                  borderRadius: 8,
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
        <Flex
          vertical
          style={{
            borderRadius: 32,
            height: 400,
            width: isMobile ? "100%" : "70%",
          }}
        >
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
          borderColor: COLORS.borderColor,
          cursor: "pointer",
        }}
      >
        <Flex justify="space-between" align="center">
          <Flex
            align="center"
            justify="flex-end"
            gap={8}
            style={{
              padding: "16px 0",
              paddingLeft: 16,
              width: "100%",
            }}
          >
            <DynamicReactIcon
              iconSet="gi"
              color={COLORS.primaryColor}
              size={20}
              iconName="GiOilySpiral"
            ></DynamicReactIcon>
            <Typography.Text
              style={{ fontSize: FONT_SIZE.subHeading, fontWeight: "bold" }}
            >
              LivIQ
            </Typography.Text>
          </Flex>

          <ArrowUpOutlined
            style={{
              color: COLORS.textColorDark,
            }}
          />
        </Flex>
      </button>
    </>
  );
};

const ProjectPage: React.FC = () => {
  const { projectId } = useParams();

  const { data: projectData, isLoading: projectDataLoading } =
    useFetchProjectById(projectId!);

  const [livIQOpen, setLivIQOpen] = useState(false);

  const { isMobile } = useDevice();

  if (!projectData) {
    return <Loader></Loader>;
  }

  const sortedMediaArray = sortedMedia({
    media: projectData.media.filter((m) => m.type == "image"),
    setPreviewInFirstPlace: false,
  });

  const videoMedia = projectData.media.filter(
    (media) => media.type === "video"
  );

  console.log(videoMedia);

  return (
    <>
      {!livIQOpen && (
        <FloatButton
          icon={
            <DynamicReactIcon
              iconName="GiOilySpiral"
              iconSet="gi"
              color={COLORS.primaryColor}
            ></DynamicReactIcon>
          }
          onClick={() => {
            setLivIQOpen(true);
          }}
        ></FloatButton>
      )}
      <Flex vertical>
        <Gallery media={[...sortedMediaArray, ...videoMedia]} />
        <Flex
          gap={40}
          style={{ marginTop: isMobile ? 24 : 40, position: "relative" }}
          align="flex-start"
          vertical={isMobile}
        >
          <Flex
            vertical
            gap={32}
            style={{ width: isMobile ? "100%" : "calc(100% - 415px)" }}
          >
            <Header metadata={projectData.metadata} ui={projectData.ui} />

            <CostSummery project={projectData} />

            <ProjectHighlights project={projectData} />

            <ProjectDescription project={projectData} />

            <ProjectSummary ui={projectData.ui} media={projectData.media} />

            <ProjectAmenities project={projectData} />

            <Livestment project={projectData} />
          </Flex>

          {isMobile ? (
            <Drawer
              title={
                <Flex align="center" justify="space-between">
                  <Button
                    type="text"
                    style={{ marginLeft: "auto" }}
                    icon={<CloseOutlined />}
                    onClick={() => {
                      setLivIQOpen(false);
                    }}
                  />
                </Flex>
              }
              styles={{
                header: {
                  padding: 0,
                },
              }}
              placement="bottom"
              closable={false}
              onClose={() => {
                setLivIQOpen(false);
              }}
              open={livIQOpen}
              height="100%"
            >
              <AskLiv projectName={projectData.metadata.name} />
            </Drawer>
          ) : (
            <Flex style={{ width: 375, backgroundColor: "white" }}>
              <Flex
                style={{
                  overflow: "hidden",
                }}
              >
                <AskLiv projectName={projectData.metadata.name} />
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
    </>
  );
};

export default ProjectPage;
