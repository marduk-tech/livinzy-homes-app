import { Col, Flex, List, Row, Select, Tag, Typography } from "antd";
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
          (c) => c.collectionName == collections[collections.length > 1 ? 1 : 0]
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

    const previewImage =
      itemInfo && itemInfo.originalProjectId && itemInfo.originalProjectId.media
        ? itemInfo.originalProjectId.media[0].image.url!
        : "";
    return (
      <List.Item
        style={{
          padding: 4,
          marginBottom: 16,
          borderBottom: "1px solid",
          borderBottomColor: COLORS.borderColor,
          borderRadius: 8,
          paddingBottom: 16,
        }}
        onClick={() => {
          navigate(`/brick360/${itemInfo._id}`);
        }}
      >
        <Flex vertical align="flex-start" gap={8} style={{ width: "100%" }}>
          {/* <div
            style={{
              width: "100%",
              height: 150,
              backgroundImage: `url(${previewImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: 8,
              backgroundRepeat: "no-repeat",
              marginTop: 4,
            }}
          ></div> */}
          {/* <ProjectGallery
            media={itemInfo.originalProjectId.media}
          ></ProjectGallery> */}

          <Flex vertical>
            <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_2 }}>
              {itemInfo.meta.projectName}
            </Typography.Text>
            <Flex
              vertical={isMobile}
              gap={4}
              align={isMobile ? "flex-start" : "center"}
            >
              {oneLinerBreakup.length && (
                <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_4 }}>
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
            <Typography.Text
              style={{ fontSize: FONT_SIZE.PARA, color: COLORS.textColorLight }}
            >
              Starts:{" "}
              {rupeeAmountFormat(itemInfo.meta.costingDetails.minimumUnitCost)}{" "}
              / {itemInfo.meta.costingDetails.minimumUnitSize} sqft
            </Typography.Text>
            {/* <Flex gap={4} style={{ flexWrap: "wrap" }}>
              {["property", "developer", "investment", "areaConnectivity"].map(
                (d: string) => {
                  return (
                    <Flex style={{ width: 120, height: 24 }}>
                      <GradientBar
                        text={capitalize(d)}
                        value={getDataPtOverallRating(itemInfo.score[d])}
                      ></GradientBar>
                    </Flex>
                  );
                }
              )}
            </Flex> */}
            <Row
              style={{
                marginTop: 8,
                backgroundColor: COLORS.bgColor,
                padding: 4,
              }}
              gutter={[4, 4]}
            >
              {Object.values(BRICK360_CATEGORY).map((item, index) => (
                <Col span={12} key={index}>
                  <Flex
                    style={{
                      borderColor: COLORS.borderColor,
                      borderRadius: 8,
                      padding: 4,
                      fontSize: FONT_SIZE.SUB_TEXT,
                    }}
                  >
                    <Flex style={{ width: "100%" }}>
                      <Typography.Text style={{ fontSize: FONT_SIZE.SUB_TEXT }}>
                        {Brick360CategoryInfo[item].title}
                      </Typography.Text>
                      <Flex style={{ marginLeft: "auto" }}>
                        <GradientBar
                          value={getCategoryScore(itemInfo.score[item])}
                          showBadgeOnly={true}
                        ></GradientBar>
                      </Flex>
                    </Flex>
                  </Flex>
                </Col>
              ))}
            </Row>
          </Flex>
        </Flex>
      </List.Item>
    );
  };

  if (!user || !corridorWiseProjects) {
    return <Loader></Loader>;
  }

  return (
    <Flex
      style={{
        width: "100%",
        padding: 8,
        paddingBottom: 100,
        border: 0,
      }}
      vertical
    >
      {collectionNames && collectionNames.length > 1 ? (
        <Select
          placeholder="Select project list"
          defaultValue={collectionNames ? collectionNames[1] : ""}
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
          <Flex vertical style={{}}>
            <Flex vertical style={{ marginTop: 24 }}>
              <Flex style={{ marginBottom: 8 }}>
                <Tag
                  color={COLORS.bgColorDark}
                  style={{ fontSize: FONT_SIZE.HEADING_4, padding: 4 }}
                >
                  {corridor}
                </Tag>
              </Flex>
              {/* {corridor && corridors && corridors.length ? (
                <Paragraph
                  ellipsis={{ rows: 2, expandable: true }}
                  style={{ color: COLORS.textColorLight }}
                >
                  {corridors.find((c) => c.name == corridor)!.description}
                </Paragraph>
              ) : null} */}
            </Flex>
            <List
              size="large"
              style={{
                width: "100%",
              }}
              dataSource={corridorWiseProjects[corridor]}
              renderItem={renderLvnzyProject}
            />
          </Flex>
        );
      })}
    </Flex>
  );
}
