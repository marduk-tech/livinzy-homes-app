import { Flex, Image, Modal, Typography } from "antd";
import { useMemo } from "react";
import { useDevice } from "../hooks/use-device";
import "../theme/gallery.css";
import { IMedia } from "../types/Project";
import { COLORS } from "../theme/style-constants";

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
        {Object.entries(groupedImages)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([tag, images]) => (
            <Flex key={tag} vertical>
              <Typography.Title
                level={4}
                style={{
                  margin: 0,
                  textTransform: "capitalize",
                }}
              >
                {tag}
              </Typography.Title>

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
                      <Image
                        src={item.image!.url}
                        alt={item.image!.caption || `${tag} image ${index + 1}`}
                        preview={{
                          mask: (
                            <div className="gallery-caption">
                              {item.image!.caption ||
                                item.image!.tags.join(", ")}
                            </div>
                          ),
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          border: "1px solid",
                          borderColor: COLORS.borderColorMedium,
                        }}
                      />
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
