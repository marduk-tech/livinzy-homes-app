import { Flex, Modal } from "antd";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";
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

  const [selectedDriver, setSelectedDriver] = useState<IDriverPlace | null>(
    null
  );

  const { data: driversData } = useFetchAllLivindexPlaces(
    drivers || [
      "674058ba3bf3e819be852d0c",
      "674058ba3bf3e819be852d1b",
      "676e4e06d23c140473c2cc80",
    ]
  );

  const [driverMarkersIcons, setDriverMarkersIcons] = useState<any[]>([]);

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
        setDriverMarkersIcons(icons.filter(Boolean));
      }
    }
    fetchDriverIcons();
  }, [driversData]);

  return (
    <>
      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={13}
        minZoom={12}
        style={{ height: "500px", width: "100%" }}
      >
        {/* OpenStreetMap Tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Marker Example */}
        {driversData?.map((driver: IDriverPlace) => {
          const icon = driverMarkersIcons.find(
            (icon: any) => icon.driverId === driver._id
          )?.icon;
          return icon ? (
            <Marker
              key={driver._id}
              position={[driver.location!.lat, driver.location!.lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  setSelectedDriver(driver);
                  setInfoModalOpen(true);
                },
              }}
            ></Marker>
          ) : null;
        })}
        <Polyline
          eventHandlers={{
            click: () => {
              setInfoDialogOpen(true);
            },
          }}
          pathOptions={{ fillColor: "blue" }}
          positions={[
            [12.929406, 77.7187604],
            [12.9280279, 77.7181055],
            [12.9279415, 77.7180612],
            [12.9274208, 77.7175952],
            [12.9267947, 77.7169546],
            [12.9266102, 77.7167986],
            [12.9265114, 77.7167399],
            [12.926234, 77.7165972],
            [12.9256832, 77.7163253],
          ]}
        ></Polyline>
      </MapContainer>
      <Modal
        title={selectedDriver?.name}
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
            {selectedDriver?.details?.description}
          </Markdown>
        </Flex>
      </Modal>
    </>
  );
};

export default MapViewV2;
