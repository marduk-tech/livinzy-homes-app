import { Flex, List, Select, Tag, Typography } from "antd";
import { Loader } from "../components/common/loader";
import { useUser } from "../hooks/use-user";
import { useNavigate } from "react-router-dom";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { rupeeAmountFormat } from "../libs/lvnzy-helper";
import { useEffect, useState } from "react";
import { useDevice } from "../hooks/use-device";
import { useFetchCorridors } from "../hooks/use-corridors";
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

  const getDataPtOverallRating = (dataPt: any) => {
    let totRating = 0,
      ct = 0;
    Object.keys(dataPt).forEach((subPt) => {
      if (dataPt[subPt].rating) {
        totRating += dataPt[subPt].rating;
        ct++;
      }
    });
    return totRating / ct;
  };
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

    return (
      <List.Item
        style={{ padding: 4, marginBottom: 16, border: 0 }}
        onClick={() => {
          navigate(`/brick360/${itemInfo._id}`);
        }}
      >
        <Flex vertical>
          <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_2 }}>
            {itemInfo.meta.projectName}
          </Typography.Text>
          <Flex
            vertical={isMobile}
            gap={4}
            style={{ marginBottom: isMobile ? 8 : 0 }}
            align={isMobile ? "flex-start" : "center"}
          >
            {oneLinerBreakup.length && (
              <Typography.Text style={{ fontSize: FONT_SIZE.PARA }}>
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
            {rupeeAmountFormat(itemInfo.meta.costingDetails.minimumUnitCost)} /{" "}
            {itemInfo.meta.costingDetails.minimumUnitSize} sqft
          </Typography.Text>
          {/* <Flex gap={4} style={{ flexWrap: "wrap" }}>
            {[
              "property",
              "developer",
              "investment",
              "connectivity",
              "neighborhood",
            ].map((d: string) => {
              return (
                <Flex style={{ width: 100, height: 24 }}>
                  <GradientBar
                    text={capitalize(d)}
                    value={getDataPtOverallRating(itemInfo.score[d])}
                  ></GradientBar>
                </Flex>
              );
            })}
          </Flex> */}
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
        padding: 16,
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
              <Typography.Title level={3} style={{ margin: 0 }}>
                {corridor}
              </Typography.Title>
              {corridor && corridors && corridors.length ? (
                <Paragraph
                  ellipsis={{ rows: 2, expandable: true }}
                  style={{ color: COLORS.textColorLight }}
                >
                  {corridors.find((c) => c.name == corridor)!.description}
                </Paragraph>
              ) : null}
            </Flex>
            <List
              size="large"
              style={{
                width: "100%",
                border: "1px solid",
                padding: 8,
                borderRadius: 8,
                borderColor: COLORS.borderColorMedium,
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
