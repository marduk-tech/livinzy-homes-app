import { Flex, Modal } from "antd";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";

import { renderToString } from "react-dom/server";
import { dynamicImportMap } from "../common/dynamic-react-icon";
import { useFetchAllLivindexPlaces } from "../../hooks/use-livindex-places";
import { IDriverPlace } from "../../types/Project";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LivIndexDriversConfig } from "../../libs/constants";
// reuse your dynamic import map

// Need a different way to get the react icon
async function getIcon(iconName: string, iconSet: any) {
  let IconComp = null;
  if (!dynamicImportMap[iconSet]) {
    console.warn(`Icon set ${iconSet} not found.`);
    return null;
  }

  try {
    const iconSetModule = await dynamicImportMap[iconSet]();
    IconComp = (iconSetModule as any)[iconName] || null;
  } catch (error) {
    console.error(`Error loading icon ${iconName} from ${iconSet}`, error);
  }
  const iconMarkup = renderToString(
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "50%",
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 6px rgba(0,0,0,0.3)",
      }}
    >
      <IconComp size={20} color="black" />
    </div>
  );
  const leafletIcon = L.divIcon({
    html: iconMarkup,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
  return leafletIcon!;
}

const MapViewV2 = ({ drivers }: { drivers?: string[] }) => {
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  /**
   * Modal content which opens on click of any rendered map element
   */
  const [modalContent, setModalContent] = useState<{
    title: string;
    tags?: [{ label: string; color: string }];
    content: string;
  }>();

  /**
   * Fetching driver data for selected drivers
   */
  const { data: driversData } = useFetchAllLivindexPlaces(
    drivers || [
      "674058ba3bf3e819be852d0c",
      "674058ba3bf3e819be852d1b",
      "676e4e06d23c140473c2cc80",
    ]
  );

  /**
   * Icons for simple drivermarkers
   */
  const [simpleDriverMarkerIcons, setSimpleDriverMarkerIcons] = useState<any[]>(
    []
  );

  // Setting icons for simple drivermarkers
  useEffect(() => {
    async function fetchDriverIcons() {
      if (driversData && driversData.length > 0) {
        const icons = await Promise.all(
          driversData.map(async (driver) => {
            const iconConfig = (LivIndexDriversConfig as any)[driver.driver];

            const icon = await getIcon(
              iconConfig ? iconConfig.icon.name : "BiSolidFactory",
              iconConfig ? iconConfig.icon.set : "bi"
            );
            return icon ? { icon, driverId: driver._id } : null;
          })
        );
        setSimpleDriverMarkerIcons(icons.filter(Boolean));
      }
    }
    fetchDriverIcons();
  }, [driversData]);

  // Rendering simple drivermarkers
  const renderSimpleDriverMarkers = () => {
    return driversData?.map((driver: IDriverPlace) => {
      const icon = simpleDriverMarkerIcons.find(
        (icon: any) => icon.driverId === driver._id
      )?.icon;
      return icon ? (
        <Marker
          key={driver._id}
          position={[driver.location!.lat, driver.location!.lng]}
          icon={icon}
          eventHandlers={{
            click: () => {
              setModalContent({
                title: driver.name,
                content: driver.details?.description || "",
              });
              setInfoModalOpen(true);
            },
          }}
        ></Marker>
      ) : null;
    });
  };

  return (
    <>
      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={13}
        minZoom={12}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Simple point based drivers */}
        {renderSimpleDriverMarkers()}
      </MapContainer>

      {/* Modal to show any marker details */}
      <Modal
        title={modalContent?.title}
        closable={true}
        open={infoModalOpen}
        footer={null}
        onCancel={() => {
          setInfoModalOpen(false);
        }}
        onClose={() => {
          setInfoModalOpen(false);
        }}
      >
        <Flex
          vertical
          style={{
            maxHeight: 500,
            overflowY: "scroll",
            scrollbarWidth: "none",
          }}
        >
          <Markdown remarkPlugins={[remarkGfm]} className="liviq-content">
            {modalContent?.content}
          </Markdown>
        </Flex>
      </Modal>
    </>
  );
};

export default MapViewV2;
