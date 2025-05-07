import { Flex, Select, Tag, Typography } from "antd";
import { Loader } from "../components/common/loader";
import { useUser } from "../hooks/use-user";
import { useNavigate } from "react-router-dom";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { getCategoryScore, rupeeAmountFormat } from "../libs/lvnzy-helper";
import { useEffect, useState } from "react";
import { useDevice } from "../hooks/use-device";
import { useFetchCorridors } from "../hooks/use-corridors";
import { BRICK360_CATEGORY, Brick360CategoryInfo } from "../libs/constants";
import GradientBar from "../components/common/grading-bar";
const { Paragraph } = Typography;

export function UserProjects() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { data: corridors, isLoading: isCorridorsDataLoading } =
    useFetchCorridors();
  const [corridorWiseProjects, setCorridorWiseProjects] = useState<any>();
  const [collectionNames, setCollectionNames] = useState<string[]>();
  const [selectedCollection, setSelectedCollection] = useState<any>();
  const { isMobile } = useDevice();

  useEffect(() => {
    if (user?.savedLvnzyProjects && user.savedLvnzyProjects.length) {
      const collections = user.savedLvnzyProjects.map((c) => c.collectionName);
      setCollectionNames(collections);
      setSelectedCollection(
        user.savedLvnzyProjects.find(
          (c) => c.collectionName == collections[collections.length - 1]
        )
      );
    }
  }, [user]);

  useEffect(() => {
    if (!selectedCollection) {
      return;
    }
    const corrProjects: any = {};
    selectedCollection.projects.forEach((p: any) => {
      corrProjects[p.meta.projectCorridor] =
        corrProjects[p.meta.projectCorridor] || [];
      corrProjects[p.meta.projectCorridor].push(p);
    });
    setCorridorWiseProjects(corrProjects);
  }, [selectedCollection]);

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
          minWidth: isMobile ? "100%" : 320,
          maxWidth: isMobile ? "100%" : 320,
        }}
        onClick={() => {
          navigate(`/brick360/${itemInfo._id}`);
        }}
      >
        <Flex vertical style={{ width: "100%" }}>
          <div
            style={{
              width: "100%",
              height: 175,
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
              fontSize: FONT_SIZE.HEADING_2,
              fontWeight: 600,
              lineHeight: "120%",
              width: "100%",
              padding: "8px",
              textWrap: "wrap",
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
                    fontSize: FONT_SIZE.PARA,
                    color: COLORS.textColorLight,
                  }}
                >
                  {oneLinerBreakup.slice(0, 3).join(" · ")}
                </Typography.Text>
              )}
              {oneLinerBreakup.length > 3 && (
                <Tag style={{ fontSize: FONT_SIZE.PARA }} color="blue">
                  {oneLinerBreakup
                    .slice(3, 4)
                    .join("")
                    .replace("(", "")
                    .replace(")", "")}
                </Tag>
              )}
            </Flex>
            <Flex gap={4}>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.PARA,
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
                <Tag
                  style={{
                    fontSize: FONT_SIZE.SUB_TEXT,
                    marginLeft: "auto",
                  }}
                  color={COLORS.primaryColor}
                >
                  Payment Plan
                </Tag>
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
                    fontSize: FONT_SIZE.PARA,
                  }}
                >
                  <Flex vertical style={{ width: "100%" }}>
                    <Typography.Text
                      style={{
                        fontSize: FONT_SIZE.PARA,
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

  if (!user || !corridorWiseProjects) {
    return <Loader></Loader>;
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
      {collectionNames && collectionNames.length > 1 ? (
        <Select
          placeholder="Select project list"
          defaultValue={
            collectionNames ? collectionNames[collectionNames.length - 1] : ""
          }
          optionFilterProp="label"
          onChange={(value: string) => {
            setSelectedCollection(
              user.savedLvnzyProjects.find((c) => c.collectionName == value)
            );
          }}
          options={collectionNames?.map((c) => {
            return {
              value: c,
              label: c,
            };
          })}
        />
      ) : null}

      {Object.keys(corridorWiseProjects).map((corridor: string) => {
        return (
          <Flex vertical>
            <Flex vertical style={{ marginTop: 24 }}>
              <Flex style={{ marginBottom: 8 }}>
                <Tag
                  color={COLORS.bgColorDark}
                  style={{ fontSize: FONT_SIZE.HEADING_4, padding: 4 }}
                >
                  {corridor}
                </Tag>
              </Flex>
            </Flex>

            <Flex
              style={{
                width: "100%",
                overflowX: "scroll",
                whiteSpace: "nowrap",
              }}
              vertical={isMobile}
              gap={16}
            >
              {corridorWiseProjects[corridor].map((p: any) => {
                return renderLvnzyProject(p);
              })}
            </Flex>
          </Flex>
        );
      })}
    </Flex>
  );
}
