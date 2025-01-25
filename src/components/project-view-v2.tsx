import { Button, Flex, Image, Modal, Row, Typography } from "antd";
import React, { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useParams } from "react-router-dom";
import DynamicReactIcon from "./common/dynamic-react-icon";
import { Loader } from "./common/loader";
import { useDevice } from "../hooks/use-device";
import { useFetchAllLivindexPlaces } from "../hooks/use-livindex-places";
import { useFetchProjectById } from "../hooks/use-project";
import { captureAnalyticsEvent, rupeeAmountFormat } from "../libs/lvnzy-helper";
import { sortedMedia } from "../libs/utils";
import "../theme/scroll-bar.css";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { IMedia, IUI, Project } from "../types/Project";
import { ProjectsMapView } from "./map-view/projects-map-view";

const Gallery: React.FC<{ media: IMedia[] }> = ({ media }) => {
  const { isMobile } = useDevice();
  return (
    <Flex
      className="custom-scrollbar"
      style={{
        width: "100%",
        overflowX: "scroll",
        whiteSpace: "nowrap",
        minHeight: 225,
        height: 225,
        scrollbarWidth: "none",
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
                height: 225,
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
  );
};

const CostSnapshot: React.FC<{ project: Project }> = ({ project }) => {
  const costingDetails = project.ui.costingDetails;
  const { isMobile } = useDevice();
  const { projectId } = useParams();

  return (
    <Flex vertical>
      <Flex align="flex-end">
        <Typography.Text
          style={{
            margin: 0,
            fontSize: FONT_SIZE.HEADING_2,
            lineHeight: "100%",
          }}
        >
          ₹{rupeeAmountFormat(costingDetails.singleUnitCost)}
        </Typography.Text>

        <Typography.Text
          style={{
            margin: "0 8px",
            lineHeight: "100%",
            fontSize: FONT_SIZE.HEADING_3,
          }}
        >
          /
        </Typography.Text>

        <Typography.Text
          style={{
            margin: 0,
            lineHeight: "100%",
            fontSize: FONT_SIZE.HEADING_3,
          }}
        >
          {costingDetails.singleUnitSize} sqft
        </Typography.Text>
      </Flex>
      {costingDetails.sqftRate ? (
        <Typography.Text style={{ color: COLORS.textColorLight }}>
          Priced at ₹{costingDetails.sqftRate} per sqft.{" "}
          {costingDetails.details ? costingDetails.details : ""}
        </Typography.Text>
      ) : null}
    </Flex>
  );
};

const ProjectHighlights: React.FC<{ project: Project }> = ({ project }) => {
  const highlights = project.ui.projectHighlights;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<any>();

  const handleCancel = () => {
    setSelectedHighlight(undefined);
    setIsModalOpen(false);
  };

  return (
    <>
      <Flex
        vertical
        gap={32}
        style={{
          padding: "32px 0",
          width: "100%",
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
                captureAnalyticsEvent("click-highlight-title", {
                  projectId: project._id,
                  highlightTitle: highlight.title,
                });
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
                style={{ fontSize: FONT_SIZE.HEADING_3, lineHeight: "100%" }}
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
            fontSize: FONT_SIZE.PARA,
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
  const costingDetails = ui.costingDetails;

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
      {/* <Flex>
        <Typography.Text style={{ margin: 0, fontSize: FONT_SIZE.HEADING_2 }}>
          What can you buy ?
        </Typography.Text>
      </Flex> */}

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
                      fontSize: FONT_SIZE.PARA,
                      color: COLORS.textColorVeryLight,
                      lineHeight: "100%",
                      textTransform: "uppercase",
                    }}
                  >
                    Configuration
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      margin: 0,
                      color: "white",
                      fontSize: FONT_SIZE.HEADING_3,
                      lineHeight: "100%",
                    }}
                  >
                    {costingDetails.configurations}
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
                      fontSize: FONT_SIZE.PARA,
                      textTransform: "uppercase",
                      color: COLORS.textColorVeryLight,
                    }}
                  >
                    Other Charges
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      margin: 0,
                      lineHeight: "100%",
                      fontSize: isMobile ? 16 : FONT_SIZE.HEADING_3,
                      color: "white",
                    }}
                  >
                    {`${costingDetails.plcCharges}${
                      costingDetails.maintenanceCharges
                        ? ", " + costingDetails.maintenanceCharges
                        : ""
                    }`}
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
                      fontSize: FONT_SIZE.PARA,
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
                      fontSize: isMobile ? 16 : FONT_SIZE.HEADING_3,
                      color: "white",
                    }}
                  >
                    {costingDetails.income}
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
    <Flex vertical style={{ width: "100%" }}>
      <Typography.Text style={{ fontSize: FONT_SIZE.PARA }}>
        {project.ui.description}
      </Typography.Text>
      {/* <Link href={project.metadata.website}>See Website</Link> */}
    </Flex>
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
              fontSize: FONT_SIZE.HEADING_3,
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
            fontSize: FONT_SIZE.SUB_TEXT,
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

  let amenities = project.ui.amenitiesSummary;
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
        <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_2 }}>
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
            fontSize: FONT_SIZE.SUB_TEXT,
          }}
        >
          {selectedHighlight?.description}
        </Typography.Text>
      </Modal>
    </Flex>
  );
};

const ProjectViewV2: React.FC<{
  projectId: string;
}> = ({ projectId }) => {
  const { data: projectData, isLoading: projectDataLoading } =
    useFetchProjectById(projectId!);

  const { data: allLivIndexPlaces, isLoading: allLivIndexPlacesLoading } =
    useFetchAllLivindexPlaces();
  const [toggleMapView, setToggleMapView] = useState(false);

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

  captureAnalyticsEvent("app-projectpage-open", { projectId: projectData._id });

  let projectDrivers: string[] = [];
  if (projectData.livIndexScore && projectData.livIndexScore.score) {
    projectData.livIndexScore.scoreBreakup.forEach((scoreBreakup) => {
      projectDrivers = [
        ...projectDrivers,
        ...scoreBreakup.drivers.map((driver) => driver.place._id),
      ];
    });
  }
  return (
    <>
      <Flex
        vertical
        style={{
          width: "100%",
          minHeight: 275,
        }}
      >
        {toggleMapView ? (
          <ProjectsMapView
            projects={[projectData]}
            drivers={projectDrivers}
            onProjectClick={() => {}}
          />
        ) : (
          <Gallery media={[...sortedMediaArray, ...videoMedia]} />
        )}
        <Flex align="flex-start" style={{ marginTop: 16 }}>
          <Flex vertical>
            <Flex>
              <Typography.Text
                style={{ margin: 0, fontSize: FONT_SIZE.HEADING_1 }}
              >
                {projectData.metadata.name}
              </Typography.Text>
            </Flex>

            <Typography.Text
              style={{
                margin: 0,
                fontSize: FONT_SIZE.HEADING_4,
                color: COLORS.textColorLight,
              }}
            >
              {projectData.ui.oneLiner}
            </Typography.Text>
          </Flex>
          <Flex
            style={{
              marginLeft: "auto",
            }}
            gap={8}
          >
            <Button
              size="small"
              icon={
                !toggleMapView ? (
                  <DynamicReactIcon
                    iconName="FaMap"
                    color="primary"
                    iconSet="fa"
                    size={16}
                  ></DynamicReactIcon>
                ) : (
                  <DynamicReactIcon
                    iconName="FaRegListAlt"
                    iconSet="fa"
                    size={16}
                    color="primary"
                  ></DynamicReactIcon>
                )
              }
              style={{
                borderRadius: 8,
                cursor: "pointer",
                marginLeft: "auto",
                fontSize: FONT_SIZE.SUB_TEXT,
              }}
              onClick={() => {
                setToggleMapView(!toggleMapView);
              }}
            ></Button>
          </Flex>
        </Flex>

        <CostSnapshot project={projectData} />
        {/* <Flex
          gap={40}
          style={{ marginTop: isMobile ? 24 : 40, position: "relative" }}
          align="flex-start"
          vertical={isMobile}
        >
          <Flex
            vertical
            gap={32}
            style={{ width: isMobile ? "100%" : "calc(100%)" }}
          >
            <ProjectHighlights project={projectData} />

            <ProjectDescription project={projectData} />

            <ProjectSummary ui={projectData.ui} media={projectData.media} />

            <ProjectAmenities project={projectData} />

            {allLivIndexPlacesLoading ? (
              <Loader></Loader>
            ) : projectData.livIndexScore &&
              projectData.livIndexScore.scoreBreakup &&
              projectData.livIndexScore.scoreBreakup.length &&
              allLivIndexPlaces ? (
              <Livestment
                project={projectData}
                livIndexPlaces={allLivIndexPlaces}
              />
            ) : null}
          </Flex>
        </Flex> */}
      </Flex>
    </>
  );
};

export default ProjectViewV2;
