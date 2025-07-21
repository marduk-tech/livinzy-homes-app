import { Flex, Tabs, Typography } from "antd";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import DynamicReactIcon from "../common/dynamic-react-icon";
import { useFetchLvnzyProjectById } from "../../hooks/use-lvnzy-project";

import { Brick360Tab } from "./brick-360-tab";
import { ConfigurationsModal } from "./configurations-modal";
import { FakeProgress } from "./fake-progress";
import { MapTab } from "./map-tab";
import { MediaTab } from "./media-tab";
import { PricePointModal } from "./price-point-modal";
import { ProjectHeader } from "./project-header";
import { UnitsTab } from "./units-tab";
import {
  BRICK360_CATEGORY,
  Brick360CategoryInfo,
  Brick360DataPoints,
} from "../../libs/constants";
import { COLORS } from "../../theme/style-constants";
import Brick360Chat from "../liv/brick360-chat";

const FAKE_TIMER_SECS = 100;

export function Brick360v2() {
  const { lvnzyProjectId } = useParams();

  const brick360ChatRef = useRef<{
    expandChat: () => void;
  } | null>(null);

  const { data: lvnzyProject, isLoading: lvnzyProjectIsLoading } =
    useFetchLvnzyProjectById(lvnzyProjectId!);

  const [scoreParams, setScoreParams] = useState<any[]>([]);

  const [pmtDetailsModalContent, setPmtDetailsModalContent] = useState<
    ReactNode | undefined
  >();

  const [selectedDataPointCategory, setSelectedDataPointCategory] =
    useState<any>();
  const [selectedDataPointSubCategory, setSelectedDataPointSubCategory] =
    useState<any>();

  const [selectedDataPoint, setSelectedDataPoint] = useState<any>();
  const [fakeTimeoutProgress, setFakeTimeoutProgress] = useState<any>(10);
  const [selectedDataPointTitle, setSelectedDataPointTitle] = useState("");

  const [isConfigurationsModalOpen, setIsConfigurationsModalOpen] =
    useState(false);

  // Get data category icon
  const getDataCategoryIcon = (iconName: string, iconSet: any) => {
    return (
      <DynamicReactIcon
        iconName={iconName}
        iconSet={iconSet}
        color={COLORS.textColorDark}
        size={20}
      ></DynamicReactIcon>
    );
  };

  // Fake timeout and progress
  useEffect(() => {
    const interval = setInterval(() => {
      setFakeTimeoutProgress((prevFakeTimeoutProgress: any) => {
        if (!lvnzyProjectIsLoading) {
          // Stop at 10
          clearInterval(interval);
          return prevFakeTimeoutProgress;
        }
        return prevFakeTimeoutProgress + 10;
      });
    }, FAKE_TIMER_SECS);
  });

  // Setting main data points category
  useEffect(() => {
    if (lvnzyProject) {
      const params = [];

      for (const key in BRICK360_CATEGORY) {
        const cat = BRICK360_CATEGORY[key as keyof typeof BRICK360_CATEGORY];
        const catInfo = Brick360CategoryInfo[cat];
        if (!catInfo.disabled) {
          params.push({
            title: catInfo.title,
            key: key,
            icon: getDataCategoryIcon(catInfo.iconName, catInfo.iconSet),
            dataPoints: lvnzyProject.score[cat]
              ? Object.entries(lvnzyProject.score[cat]).filter(
                  (e) => e && e.length && (e as any)[1].rating
                )
              : [],
          });
        }
      }
      setScoreParams(params);
    }
  }, [lvnzyProject]);

  if (lvnzyProjectIsLoading) {
    return <FakeProgress progress={fakeTimeoutProgress} projectName={""} />;
  }

  // // Fake progress bar
  // if (fakeTimeoutProgress < 130) {
  //   return (
  //     <FakeProgress
  //       progress={fakeTimeoutProgress}
  //       projectName={lvnzyProject?.meta.projectName}
  //     />
  //   );
  // }

  return (
    <Flex
      vertical
      style={{
        width: "100%",
        margin: "auto",
        maxWidth: 900,
        overflowX: "hidden",
      }}
    >
      <ProjectHeader lvnzyProject={lvnzyProject} />

      <Tabs
        tabBarGutter={24}
        defaultActiveKey="brick-360"
        tabBarStyle={{}}
        style={{ padding: "0 8px" }}
        items={[
          {
            key: "brick-360",
            label: (
              <Flex gap={4} align="center">
                <DynamicReactIcon
                  iconName="LiaGgCircle"
                  iconSet="lia"
                  color={COLORS.textColorDark}
                  size={20}
                ></DynamicReactIcon>
                <Typography.Text color={COLORS.textColorDark}>
                  Brick 360
                </Typography.Text>
              </Flex>
            ),
            children: (
              <Brick360Tab
                lvnzyProject={lvnzyProject}
                scoreParams={scoreParams}
                onDataPointClick={(sc, item) => {
                  brick360ChatRef.current?.expandChat();
                  setSelectedDataPointCategory(sc.key);
                  setSelectedDataPointSubCategory((item as any)[0]);
                  setSelectedDataPoint((item as any)[1]);
                  setSelectedDataPointTitle(
                    `${sc.title} > ${
                      (Brick360DataPoints as any)[sc.key][(item as any)[0]][
                        "label"
                      ]
                    }`
                  );
                }}
              />
            ),
          },
          {
            key: "units",
            label: (
              <Flex gap={4} align="center">
                <DynamicReactIcon
                  iconName="RiLayout2Fill"
                  iconSet="ri"
                  color={COLORS.textColorDark}
                  size={20}
                ></DynamicReactIcon>
                <Typography.Text color={COLORS.textColorDark}>
                  Price/Units
                </Typography.Text>
              </Flex>
            ),
            children: <UnitsTab lvnzyProject={lvnzyProject} />,
          },
          {
            key: "map",
            label: (
              <Flex gap={4} align="center">
                <DynamicReactIcon
                  iconName="LiaMapMarkedAltSolid"
                  iconSet="lia"
                  color={COLORS.textColorDark}
                  size={20}
                ></DynamicReactIcon>
                <Typography.Text color={COLORS.textColorDark}>
                  Map
                </Typography.Text>
              </Flex>
            ),
            children: <MapTab lvnzyProject={lvnzyProject} />,
          },
          {
            key: "media",
            label: (
              <Flex gap={4} align="center">
                <DynamicReactIcon
                  iconName="PiImagesDuotone"
                  iconSet="pi"
                  color={COLORS.textColorDark}
                  size={20}
                ></DynamicReactIcon>
                <Typography.Text color={COLORS.textColorDark}>
                  Media
                </Typography.Text>
              </Flex>
            ),
            children: <MediaTab lvnzyProject={lvnzyProject} />,
          },
        ]}
      ></Tabs>

      <PricePointModal
        content={pmtDetailsModalContent}
        onClose={() => setPmtDetailsModalContent(undefined)}
      />

      <Brick360Chat
        ref={brick360ChatRef}
        lvnzyProject={lvnzyProject!}
        dataPoint={{
          selectedDataPointTitle,
          selectedDataPointCategory,
          selectedDataPoint,
          selectedDataPointSubCategory,
        }}
      />

      <ConfigurationsModal
        isOpen={isConfigurationsModalOpen}
        onClose={() => setIsConfigurationsModalOpen(false)}
        lvnzyProject={lvnzyProject}
      />
    </Flex>
  );
}
