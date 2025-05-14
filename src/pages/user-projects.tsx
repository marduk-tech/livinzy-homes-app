import { Flex, Select, Tag, Typography } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GradientBar from "../components/common/grading-bar";
import { Loader } from "../components/common/loader";
import { useDevice } from "../hooks/use-device";
import { useUser } from "../hooks/use-user";
import { BRICK360_CATEGORY, Brick360CategoryInfo } from "../libs/constants";
import { getCategoryScore, rupeeAmountFormat } from "../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { LvnzyProject } from "../types/LvnzyProject";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
const { Paragraph } = Typography;

export function UserProjects({
  lvnzyProjects,
}: {
  lvnzyProjects: LvnzyProject[];
}) {
  const { user } = useUser();

  const navigate = useNavigate();
  const [selectedCorridor, setSelectedCorridor] = useState<string>("All");
  const { isMobile } = useDevice();

  const filteredProjects = lvnzyProjects.filter(
    (p: any) =>
      selectedCorridor === "All" || p.meta.projectCorridor === selectedCorridor
  );

  const uniqueCorridors = [
    ...new Set(lvnzyProjects.map((p: any) => p.meta.projectCorridor)),
  ];

  const renderLvnzyProject = (itemInfo: any) => {
    const oneLinerBreakup = itemInfo.meta.oneLiner
      ? itemInfo.meta.oneLiner.split(" · ")
      : [];

    const imgs =
      itemInfo && itemInfo.originalProjectId && itemInfo.originalProjectId.media
        ? itemInfo.originalProjectId.media.filter((m: any) => m.type == "image")
        : [];
    const previewImage =
      imgs && imgs.length
        ? (imgs.find((i: any) => i.isPreview) || imgs[0]).image.url!
        : "";
    return (
      <Flex
        style={{
          marginBottom: 8,
          border: "2px solid",
          cursor: "pointer",
          backgroundColor: "white",
          borderColor: COLORS.borderColorMedium,
          borderRadius: 12,
          width: isMobile ? "100%" : 250,
        }}
        onClick={() => {
          navigate(`/app/brick360/${itemInfo._id}`);
        }}
      >
        <Flex vertical style={{ width: "100%" }}>
          <div
            style={{
              width: "100%",
              height: isMobile ? 200 : 125,
              borderTopRightRadius: 12,
              borderTopLeftRadius: 12,
              backgroundImage: `url(${previewImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          ></div>
          {/* <ProjectGallery
            media={itemInfo.originalProjectId.media}
          ></ProjectGallery> */}

          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_3,
              fontWeight: 600,
              width: "100%",
              lineHeight: "120%",
              padding: "8px",
              textWrap: "wrap",
              paddingBottom: 0,
            }}
          >
            {itemInfo.meta.projectName}
          </Typography.Text>
          <Flex vertical style={{ marginTop: "auto", padding: 8 }}>
            <Flex
              vertical={isMobile}
              gap={4}
              align={isMobile ? "flex-start" : "center"}
              style={{ width: "100%", textWrap: "wrap" }}
            >
              {oneLinerBreakup.length && (
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.SUB_TEXT,
                    color: COLORS.textColorLight,
                  }}
                >
                  {oneLinerBreakup.slice(0, 3).join(" · ")}
                </Typography.Text>
              )}
              {oneLinerBreakup.length > 3 && (
                <Tag style={{ fontSize: FONT_SIZE.SUB_TEXT }} color="blue">
                  {oneLinerBreakup
                    .slice(3, 4)
                    .join("")
                    .replace("(", "")
                    .replace(")", "")}
                </Tag>
              )}
            </Flex>
            <Flex gap={4} align="center">
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.SUB_TEXT,
                  color: COLORS.textColorLight,
                }}
              >
                Starts:{" "}
                {rupeeAmountFormat(
                  itemInfo.meta.costingDetails.minimumUnitCost
                )}{" "}
                / {itemInfo.meta.costingDetails.minimumUnitSize} sqft
              </Typography.Text>
              {itemInfo.investment && itemInfo.investment.paymentPlan ? (
                <DynamicReactIcon
                  iconName="BiSolidOffer"
                  iconSet="bi"
                  size={18}
                  color={COLORS.primaryColor}
                ></DynamicReactIcon>
              ) : null}
            </Flex>

            <Flex
              style={{
                paddingTop: 8,
                marginTop: 8,
                borderTop: "1px solid",
                borderTopColor: COLORS.borderColor,
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              {Object.keys(BRICK360_CATEGORY).map((item, index) => (
                <Flex
                  style={{
                    borderColor: COLORS.borderColor,
                    borderRadius: 8,
                    fontSize: FONT_SIZE.SUB_TEXT,
                  }}
                >
                  <Flex vertical style={{ width: "100%" }}>
                    <Typography.Text
                      style={{
                        fontSize: FONT_SIZE.SUB_TEXT,
                        color: COLORS.textColorLight,
                      }}
                    >
                      {(Brick360CategoryInfo as any)[item].title}
                    </Typography.Text>
                    <Flex>
                      <GradientBar
                        value={getCategoryScore(itemInfo.score[item])}
                        showBadgeOnly={true}
                      ></GradientBar>
                    </Flex>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    );
  };

  if (!user) {
    return <Loader></Loader>;
  }

  if (!lvnzyProjects || !lvnzyProjects.length) {
    return (
      <Flex
        style={{ width: "100%", padding: 16 }}
        justify="center"
        align="center"
      >
        <Typography.Text>No saved projects found</Typography.Text>
      </Flex>
    );
  }

  return (
    <Flex
      style={{
        width: "100%",
        padding: 16,
        paddingBottom: 100,
        border: 0,
      }}
      vertical
    >
      <Flex gap={8} style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 225, height: 42 }}
          placeholder="Select corridor"
          value={selectedCorridor}
          onChange={(value: string) => setSelectedCorridor(value)}
          options={[
            { value: "All", label: "All Corridors" },
            ...uniqueCorridors.map((c) => ({
              value: c,
              label: c,
            })),
          ]}
        />
      </Flex>

      <Flex vertical>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {lvnzyProjects.length} projects
        </Typography.Title>
      </Flex>
      <Flex
        style={{
          width: "100%",
          flexWrap: "wrap",
          marginTop: 16,
        }}
        gap={16}
      >
        {filteredProjects.map((p: any) => renderLvnzyProject(p))}
      </Flex>
      {/* <BrickfiAssist
        ref={chatRef}
        lvnzyProjectsCollection={selectedCollection.name}
      ></BrickfiAssist> */}
    </Flex>
  );
}
