import { Flex, Modal, Typography } from "antd";
import React, { useMemo } from "react";
import { useDevice } from "../hooks/use-device";
import "../theme/gallery.css";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { IMedia } from "../types/Project";

export const ProjectImagesGalleryModal = ({
  isOpen,
  onClose,
  media,
}: {
  isOpen: boolean;
  onClose: () => void;
  media: IMedia[];
}) => {
  const { isMobile } = useDevice();

  const groupedImages = useMemo(() => {
    const imageMedia = media.filter(
      (item) => item.type === "image" && item.image
    );
    const result: Record<string, IMedia[]> = {};

    imageMedia.forEach((item) => {
      if (item.image?.tags && item.image.tags.length > 0) {
        item.image.tags.forEach((tag) => {
          if (!result[tag]) {
            result[tag] = [];
          }
          result[tag].push(item);
        });
      } else {
        if (!result["Other"]) {
          result["Other"] = [];
        }
        result["Other"].push(item);
      }
    });

    return result;
  }, [media]);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      width={isMobile ? "100%" : 600}
      style={
        isMobile
          ? {
              top: 0,
              margin: 0,
              padding: 0,
              maxWidth: "100%",
              height: "100vh",
            }
          : {
              top: 20,
            }
      }
      footer={null}
      className="gallery-modal"
      closable
      centered={!isMobile}
    >
      <Flex vertical gap={32}>
        {/* each tag sectin */}
        {Object.entries(groupedImages)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([tag, images]) => (
            <Flex key={tag} vertical gap={16}>
              <Typography.Title
                level={3}
                style={{
                  margin: 0,
                  fontSize: FONT_SIZE.HEADING_3,
                  textTransform: "capitalize",
                }}
              >
                {tag}
              </Typography.Title>

              {/* grid */}
              <div className="gallery-grid">
                {images.map((item, index) => {
                  const isFirstInSection = index === 0;
                  return (
                    <div
                      key={`${tag}-${item._id}`}
                      className={`gallery-item ${
                        isFirstInSection ? "gallery-item-large" : ""
                      }`}
                    >
                      <img
                        src={item.image!.url}
                        alt={item.image!.caption || `${tag} image ${index + 1}`}
                        className="gallery-image"
                      />
                      {(item.image!.caption || item.image!.tags.length > 0) && (
                        <div className="gallery-caption">
                          {item.image!.caption || item.image!.tags.join(", ")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Flex>
          ))}
      </Flex>
    </Modal>
  );
};
