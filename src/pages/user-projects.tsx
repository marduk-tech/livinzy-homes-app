import { Flex, List, Select, Tag, Typography } from "antd";
import { Loader } from "../components/common/loader";
import { useUser } from "../hooks/use-user";
import { useNavigate } from "react-router-dom";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { capitalize, rupeeAmountFormat } from "../libs/lvnzy-helper";
import { useEffect, useState } from "react";
import GradientBar from "../components/common/grading-bar";

export function UserProjects() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [corridorWiseProjects, setCorridorWiseProjects] = useState<any>();
  const [collectionNames, setCollectionNames] = useState<string[]>();
  const [selectedCollection, setSelectedCollection] = useState<any>();

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
        onClick={() => {
          navigate(`/brick360/${itemInfo._id}`);
        }}
      >
        <Flex vertical>
          <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_2 }}>
            {itemInfo.meta.projectName}
          </Typography.Text>
          <Flex gap={4} align="center">
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
          <Flex gap={4} style={{ flexWrap: "wrap" }}>
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
        padding: 16,
        paddingBottom: 100,
      }}
      vertical
    >
      {collectionNames && collectionNames.length > 1 ? (
        <Select
          placeholder="Select a person"
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
          <Flex vertical>
            <Typography.Title level={4}>{corridor}</Typography.Title>
            <List
              size="large"
              style={{
                width: "100%",
              }}
              bordered
              dataSource={corridorWiseProjects[corridor]}
              renderItem={renderLvnzyProject}
            />
          </Flex>
        );
      })}
    </Flex>
  );
}
