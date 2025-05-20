import { PlayCircleFilled } from "@ant-design/icons";
import { Flex, Typography } from "antd";
import { useState } from "react";
import { useDevice } from "../hooks/use-device";
import { getVideoEmbedUrl } from "../libs/video-utils";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { IMedia } from "../types/Project";
import { ProjectImagesGalleryModal } from "./project-images-gallery-modal";

const ProjectGallery: React.FC<{ media: IMedia[] }> = ({ media }) => {
  const { isMobile } = useDevice();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  return (
    <>
      <Flex
        className="custom-scrollbar"
        style={{
          width: "100%",
          overflowX: "scroll",
          whiteSpace: "nowrap",
          height: 125,
          scrollbarWidth: "none",
        }}
      >
        {media
          .filter((item: IMedia) => item.type === "image" && item.image)
          .map((img: IMedia, index: number) => (
            <div
              key={index}
              style={{ position: "relative" }}
              onClick={() => {
                setSelectedImageId(img._id || "");
                setIsModalOpen(true);
              }}
            >
              <img
                src={img.image!.url}
                height="100%"
                width="auto"
                style={{
                  overflow: "hidden",
                  borderRadius: 8,
                  border: "1px solid",
                  borderColor: COLORS.borderColor,
                  width: 200,
                  height: 125,
                  marginRight: 8,
                  position: "relative",
                  filter:
                    "brightness(1.1) contrast(1.1) saturate(1.1) sepia(0.3)",
                  cursor: "pointer",
                }}
                alt={img.image!.caption || `Project image ${index + 1}`}
              />
              {img.image!.caption ||
              (img.image?.tags && img.image.tags.length) ? (
                <Typography.Text
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    color: COLORS.textColorVeryLight,
                    textTransform: "capitalize",
                    borderTopRightRadius: 8,
                    fontSize: FONT_SIZE.SUB_TEXT,
                    borderBottomLeftRadius: 8,
                    padding: "4px 8px",
                    backgroundColor: "rgba(0,0,0,0.3)",
                  }}
                >
                  {img.image!.caption || img.image!.tags}
                </Typography.Text>
              ) : null}
            </div>
          ))}

        {media
          .filter((item: IMedia) => item.type === "video" && item.video)
          .map((media: IMedia, index: number) => (
            <div
              key={index}
              style={{
                height: "100%",
                width: "200px",
                borderRadius: 8,
                overflow: "hidden",
                flexShrink: 0,
                marginRight: 8,
                position: "relative",
                cursor: "pointer",
              }}
              onClick={() => {
                setSelectedImageId(media._id || "");
                setIsModalOpen(true);
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                }}
              >
                {media.video?.thumbnailUrl ? (
                  <img
                    src={media.video.thumbnailUrl}
                    alt={media.video?.caption || "Video thumbnail"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: 32,
                      background: "#000",
                    }}
                  >
                    <PlayCircleFilled />
                  </div>
                )}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "white",
                    fontSize: 32,
                    textShadow: "0 0 10px rgba(0,0,0,0.5)",
                    opacity: 0.8,
                  }}
                >
                  <PlayCircleFilled />
                </div>
              </div>
              {media.video!.caption ||
              (media.video?.tags && media.video.tags.length) ? (
                <Typography.Text
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    color: "white",
                    textTransform: "capitalize",
                    borderBottomLeftRadius: 8,
                    padding: "8px 16px",
                    backgroundColor: "rgba(0,0,0,0.3)",
                  }}
                >
                  {media.video!.caption || media.video!.tags}
                </Typography.Text>
              ) : null}
            </div>
          ))}
      </Flex>

      <ProjectImagesGalleryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedImageId(null);
        }}
        media={media}
        selectedImageId={selectedImageId}
      />
    </>
  );
};

export default ProjectGallery;
