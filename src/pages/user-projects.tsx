import { Flex, Tooltip, Typography } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GradientBar from "../components/common/grading-bar";
import { Loader } from "../components/common/loader";
import { useDevice } from "../hooks/use-device";
import { useUser } from "../hooks/use-user";
import { BRICK360_CATEGORY, Brick360CategoryInfo } from "../libs/constants";
import {
  capitalize,
  getCategoryScore,
  rupeeAmountFormat,
} from "../libs/lvnzy-helper";
import { COLORS, FONT_SIZE, MAX_WIDTH } from "../theme/style-constants";
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
  const [selectedCorridor, setSelectedCorridor] = useState<string>("all");
  const { isMobile } = useDevice();

  const filteredProjects = lvnzyProjects.filter(
    (p: any) =>
      !selectedCorridor ||
      selectedCorridor == "all" ||
      p.meta.projectCorridors.split(",").includes(selectedCorridor)
  );

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

    const primaryCorridor = itemInfo.meta.projectCorridors.sort(
      (a: any, b: any) => a.approxDistanceInKms - b.approxDistanceInKms
    )[0].corridorName;
    let pmtPlan;
    try {
      pmtPlan = itemInfo.originalProjectId.info.financialPlan
        .split("\n")[0]
        .replaceAll("#", "");
    } catch (err) {
      console.log("could not find pmt plan");
    }
    return (
      <Flex
        style={{
          marginBottom: 8,
          cursor: "pointer",
          backgroundColor: "white",
          borderColor: COLORS.borderColorMedium,
          borderRadius: 12,
          width: isMobile ? "100%" : (MAX_WIDTH - 150) / 4,
        }}
        onClick={() => {
          navigate(`/app/brick360/${itemInfo._id}`);
        }}
      >
        <Flex vertical style={{ width: "100%" }}>
          <div
            style={{
              width: "100%",
              height: isMobile ? 200 : 175,
              borderRadius: 12,
              backgroundImage: `url(${previewImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          ></div>
          {/* <ProjectGallery
            media={itemInfo.originalProjectId.media}
          ></ProjectGallery> */}

          <Tooltip title={itemInfo.meta.projectName}>
            <Paragraph
              style={{
                fontSize: FONT_SIZE.HEADING_2,
                fontWeight: 600,
                width: "100%",
                padding: "4px",
                paddingBottom: 0,
                marginBottom: 0,
              }}
              ellipsis={{
                rows: 1,
                expandable: false,
                symbol: "..",
              }}
            >
              {itemInfo.meta.projectName}
            </Paragraph>
          </Tooltip>
          <Flex vertical style={{ marginTop: "auto", padding: "0 4px" }}>
            <Paragraph
              style={{
                fontSize: FONT_SIZE.PARA,
                color: COLORS.textColorMedium,
                marginBottom: 0,
              }}
              ellipsis={{
                rows: 1,
                expandable: false,
                symbol: "..",
              }}
            >
              {capitalize(itemInfo.meta.projectUnitTypes.split(",")[0])} · ₹
              {rupeeAmountFormat(itemInfo.meta.costingDetails.minimumUnitCost)}-
              {itemInfo.meta.costingDetails.minimumUnitSize}sq.ft ·{" "}
              {primaryCorridor}
            </Paragraph>

            {pmtPlan ? (
              <Flex
                style={{
                  border: `1px solid ${COLORS.textColorDark}`,
                  width: "fit-content",
                  padding: "0 4px",
                  borderRadius: 4,
                  marginTop: 8,
                }}
                align="center"
                gap={4}
              >
                <DynamicReactIcon
                  iconName="RiDiscountPercentFill"
                  iconSet="ri"
                  size={18}
                  color={COLORS.textColorDark}
                ></DynamicReactIcon>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_4,
                    color: COLORS.textColorDark,
                    fontWeight: 600,
                  }}
                >
                  {pmtPlan}
                </Typography.Text>{" "}
              </Flex>
            ) : null}
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
                  }}
                >
                  <Flex vertical style={{ width: "100%" }} justify="flex-start">
                    <Typography.Text
                      style={{
                        fontSize: isMobile
                          ? FONT_SIZE.PARA
                          : FONT_SIZE.SUB_TEXT,
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
        padding: "0 16px",
        paddingBottom: 100,
        border: 0,
      }}
      vertical
    >
      {/* {uniqueCorridors &&
      uniqueCorridors.length > 0 &&
      lvnzyProjects.length > 5 ? (
        <>
          <Flex gap={8} style={{ marginBottom: 16 }}>
            <Select
              style={{ width: 225, height: 42 }}
              placeholder="Select corridor"
              value={selectedCorridor}
              onChange={(value: string) => setSelectedCorridor(value)}
              options={[
                { value: "all", label: "All Corridors" },
                ...uniqueCorridors.map((c) => ({
                  value: c,
                  label: c,
                })),
              ]}
            />
          </Flex>
          <Flex vertical>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {filteredProjects.length} projects
            </Typography.Title>
          </Flex>
        </>
      ) : null} */}

      <Flex
        style={{
          width: "100%",
          flexWrap: "wrap",
          marginTop: 16,
        }}
        gap={32}
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
