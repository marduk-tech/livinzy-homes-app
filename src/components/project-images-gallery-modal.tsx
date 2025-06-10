import { Flex, Image, Modal, Typography } from "antd";
import { useMemo } from "react";
import { useDevice } from "../hooks/use-device";
import { getVideoEmbedUrl } from "../libs/video-utils";
import "../theme/gallery.css";
import { COLORS } from "../theme/style-constants";
import { IMedia } from "../types/Project";

export const ProjectImagesGalleryModal = ({
  isOpen,
  onClose,
  media,
  selectedImageId,
}: {
  isOpen: boolean;
  onClose: () => void;
  media: IMedia[];
  selectedImageId: string | null;
}) => {
  const { isMobile } = useDevice();

  const groupedMedia = useMemo(() => {
    const filteredMedia = media.filter(
      (item) =>
        (item.type === "image" && item.image) ||
        (item.type === "video" && item.video)
    );
    const result: Record<string, IMedia[]> = {};

    filteredMedia.forEach((item) => {
      const tags = item.type === "image" ? item.image?.tags : item.video?.tags;
      if (tags && tags.length > 0) {
        tags.forEach((tag) => {
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

    // move selected item to front in its sections
    if (selectedImageId) {
      Object.keys(result).forEach((tag) => {
        const selectedIndex = result[tag].findIndex(
          (item) => item._id === selectedImageId
        );
        if (selectedIndex > -1) {
          const [selected] = result[tag].splice(selectedIndex, 1);
          result[tag].unshift(selected);
        }
      });
    }

    return result;
  }, [media, selectedImageId]);

  return (
    <Modal
      key={selectedImageId}
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
        {Object.entries(groupedMedia)
          .sort(([a], [b]) => {
            if (selectedImageId) {
              const aHasSelected = groupedMedia[a].some(
                (item) => item._id === selectedImageId
              );
              const bHasSelected = groupedMedia[b].some(
                (item) => item._id === selectedImageId
              );
              if (aHasSelected && !bHasSelected) return -1;
              if (!aHasSelected && bHasSelected) return 1;
            }
            return a.localeCompare(b);
          })
          .map(([tag, items]) => (
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
                {items.map((item, index) => {
                  const isFirstInSection = index === 0;
                  return (
                    <div
                      key={`${tag}-${item._id}`}
                      className={`gallery-item ${
                        isFirstInSection ? "gallery-item-large" : ""
                      }`}
                    >
                      {item.type === "image" ? (
                        <Image
                          src={item.image!.url}
                          alt={
                            item.image!.caption || `${tag} image ${index + 1}`
                          }
                          preview={{
                            mask: true ? null : (
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
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            position: "relative",
                            overflow: "hidden",
                            borderRadius: 4,
                          }}
                        >
                          <iframe
                            src={getVideoEmbedUrl(item.video || {})}
                            loading="lazy"
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "88%",
                              border: "1px solid",
                              borderColor: COLORS.borderColorMedium,
                            }}
                            allow="accelerometer;gyroscope;encrypted-media;picture-in-picture;autoplay;"
                            title={item.video?.caption || "Video"}
                          />
                          {/* {item.video!.caption || item.video?.tags?.length ? (
                            <div className="gallery-caption-video">
                              {item.video!.caption ||
                                item.video!.tags.join(", ")}
                            </div>
                          ) : null} */}
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
