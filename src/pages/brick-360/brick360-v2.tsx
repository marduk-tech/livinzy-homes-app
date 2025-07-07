import { Flex, Tabs, Typography } from "antd";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import DynamicReactIcon from "../../components/common/dynamic-react-icon";
import { Loader } from "../../components/common/loader";
import { useDevice } from "../../hooks/use-device";
import { useFetchLvnzyProjectById } from "../../hooks/use-lvnzy-project";

import { Brick360Tab } from "../../components/brick-360/brick-360-tab";
import { ConfigurationsModal } from "../../components/brick-360/configurations-modal";
import { DetailsDrawer } from "../../components/brick-360/details-drawer";
import { FakeProgress } from "../../components/brick-360/fake-progress";
import { FullMapModal } from "../../components/brick-360/full-map-modal";
import { MapTab } from "../../components/brick-360/map-tab";
import { MediaTab } from "../../components/brick-360/media-tab";
import { PricePointModal } from "../../components/brick-360/price-point-modal";
import { ProjectHeader } from "../../components/brick-360/project-header";
import { SnapshotModal } from "../../components/brick-360/snapshot-modal";
import { UnitsTab } from "../../components/brick-360/units-tab";
import {
  BRICK360_CATEGORY,
  Brick360CategoryInfo,
  Brick360DataPoints,
} from "../../libs/constants";
import { COLORS } from "../../theme/style-constants";
import { ISurroundingElement } from "../../types/Project";

const FAKE_TIMER_SECS = 1000;

export function Brick360v2() {
  const { lvnzyProjectId } = useParams();

  const { isMobile } = useDevice();

  const { data: lvnzyProject, isLoading: lvnzyProjectIsLoading } =
    useFetchLvnzyProjectById(lvnzyProjectId!);

  const chatRef = useRef<{ clearChatData: () => void } | null>(null);

  const [scoreParams, setScoreParams] = useState<any[]>([]);
  const [quickSnapshotDialogOpen, setQuickSnapshotDialogOpen] = useState(false);

  const [pmtDetailsModalContent, setPmtDetailsModalContent] = useState<
    ReactNode | undefined
  >();

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDataPointCategory, setSelectedDataPointCategory] =
    useState<any>();
  const [selectedDataPointSubCategory, setSelectedDataPointSubCategory] =
    useState<any>();

  const [selectedDriverTypes, setSelectedDriverTypes] = useState<any>();

  const [mapVisible, setMapVisible] = useState<boolean>(false);

  const [mapDrivers, setMapDrivers] = useState<any[]>([]);
  const [surroundingElements, setSurroundingElements] =
    useState<ISurroundingElement[]>();
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>();
  const [fakeTimeoutProgress, setFakeTimeoutProgress] = useState<any>(10);
  const [selectedDataPointTitle, setSelectedDataPointTitle] = useState("");

  const [isConfigurationsModalOpen, setIsConfigurationsModalOpen] =
    useState(false);

  const [isMapFullScreen, setIsMapFullScreen] = useState(false);

  // Renders the drawer close button
  const renderDrawerCloseBtn = () => {
    return (
      <Flex
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 99999,
        }}
        onClick={() => {
          setDetailsModalOpen(false);
          if (!isMapFullScreen) {
            chatRef.current?.clearChatData();
          }
        }}
      >
        <DynamicReactIcon
          iconName="IoCloseCircle"
          iconSet="io5"
          size={32}
        ></DynamicReactIcon>
      </Flex>
    );
  };

  // Get data category icon
  const getDataCategoryIcon = (iconName: string, iconSet: any) => {
    return (
      <DynamicReactIcon
        iconName={iconName}
        iconSet={iconSet}
        color="white"
        size={16}
      ></DynamicReactIcon>
    );
  };

  // Fake timeout and progress
  useEffect(() => {
    const interval = setInterval(() => {
      setFakeTimeoutProgress((prevFakeTimeoutProgress: any) => {
        if (prevFakeTimeoutProgress >= 130) {
          // Stop at 10
          clearInterval(interval);
          return prevFakeTimeoutProgress;
        }
        return prevFakeTimeoutProgress + 10;
      });
    }, FAKE_TIMER_SECS);
  });

  useEffect(() => {
    if (!lvnzyProject) {
      return;
    }
    setMapDrivers(
      [
        ...(lvnzyProject as any)["neighborhood"].drivers,
        ...(lvnzyProject as any)["connectivity"].drivers,
      ].filter((d) => !!d.driverId && !!d.driverId._id)
    );
  }, [lvnzyProject]);

  // Setting map drivers based on selected data point
  useEffect(() => {
    if (
      lvnzyProject &&
      selectedDataPointSubCategory &&
      selectedDataPointCategory
    ) {
      let surrElements;

      const updateMapState = () => {
        // reset states first
        setSelectedDriverTypes([]);
        setSurroundingElements([]);
        setMapVisible(false);

        if (selectedDataPointCategory === "areaConnectivity") {
          setMapVisible(true);

          switch (selectedDataPointSubCategory) {
            case "schoolsOffices":
              setSelectedDriverTypes([
                "school",
                "industrial-hitech",
                "industrial-general",
              ]);
              break;
            case "conveniences":
              setSelectedDriverTypes(["food", "hospital"]);
              break;
            case "transport":
              setSelectedDriverTypes(["transit", "highway"]);
              break;
          }
        } else if (selectedDataPointCategory === "financials") {
          setMapVisible(true);
          setSelectedDriverTypes([
            "industrial-hitech",
            "industrial-general",
            "highway",
          ]);
        } else if (
          selectedDataPointCategory === "property" &&
          selectedDataPointSubCategory === "surroundings"
        ) {
          surrElements = (lvnzyProject as any)["property"].surroundings;
          if (
            surrElements?.length &&
            surrElements.filter((e: any) => !!e.geometry).length
          ) {
            setSurroundingElements(surrElements);
            setMapVisible(true);
          }
        }
      };

      setTimeout(updateMapState, 0);
    }
  }, [selectedDataPointCategory, selectedDataPointSubCategory, lvnzyProject]);

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
              ? Object.entries(lvnzyProject.score[cat])
              : [],
          });
        }
      }
      setScoreParams(params);
    }
  }, [lvnzyProject]);

  if (lvnzyProjectIsLoading) {
    return <Loader></Loader>;
  }

  // Fake progress bar
  if (fakeTimeoutProgress < 130) {
    return (
      <FakeProgress
        progress={fakeTimeoutProgress}
        projectName={lvnzyProject?.meta.projectName}
      />
    );
  }

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
        tabBarStyle={{
          borderBottom: "1px solid",
          borderBottomColor: COLORS.borderColor,
        }}
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
                onSnapshotClick={() => setQuickSnapshotDialogOpen(true)}
                onDataPointClick={(sc, item) => {
                  setDetailsModalOpen(true);
                  setSelectedDataPointCategory(sc.key);
                  setSelectedDataPointSubCategory((item as any)[0]);
                  setSelectedDataPoint((item as any)[1]);
                  setSelectedDataPointTitle(
                    `${sc.title} > ${
                      (Brick360DataPoints as any)[sc.key][(item as any)[0]]
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
                  Units
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
            children: (
              <MapTab
                lvnzyProject={lvnzyProject}
                mapDrivers={mapDrivers}
                surroundingElements={surroundingElements}
                selectedDriverTypes={selectedDriverTypes}
              />
            ),
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

      <FullMapModal
        isOpen={isMapFullScreen}
        onClose={() => {
          setIsMapFullScreen(false);
          setDetailsModalOpen(true);
        }}
        isMobile={isMobile}
        lvnzyProject={lvnzyProject}
        surroundingElements={surroundingElements!}
        selectedDriverTypes={selectedDriverTypes}
        mapDrivers={mapDrivers}
      />

      <SnapshotModal
        isOpen={quickSnapshotDialogOpen}
        onClose={() => setQuickSnapshotDialogOpen(false)}
        lvnzyProject={lvnzyProject}
      />

      <PricePointModal
        content={pmtDetailsModalContent}
        onClose={() => setPmtDetailsModalContent(undefined)}
      />

      <DetailsDrawer
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          if (!isMapFullScreen) {
            chatRef.current?.clearChatData();
          }
        }}
        onExpandMap={() => {
          setDetailsModalOpen(false);
          setIsMapFullScreen(true);
        }}
        mapVisible={mapVisible}
        isMobile={isMobile}
        lvnzyProject={lvnzyProject}
        selectedDriverTypes={selectedDriverTypes}
        surroundingElements={surroundingElements!}
        mapDrivers={mapDrivers}
        dataPoint={{
          selectedDataPointTitle,
          selectedDataPointCategory,
          selectedDataPoint,
        }}
        lvnzyProjectId={lvnzyProjectId!}
        chatRef={chatRef}
        renderDrawerCloseBtn={renderDrawerCloseBtn}
      />

      <ConfigurationsModal
        isOpen={isConfigurationsModalOpen}
        onClose={() => setIsConfigurationsModalOpen(false)}
        lvnzyProject={lvnzyProject}
      />
    </Flex>
  );
}
