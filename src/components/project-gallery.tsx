import { Flex, Typography } from "antd";
import { useDevice } from "../hooks/use-device";
import { IMedia } from "../types/Project";

const ProjectGallery: React.FC<{ media: IMedia[] }> = ({ media }) => {
  const { isMobile } = useDevice();
  return (
    <Flex
      className="custom-scrollbar"
      style={{
        width: "100%",
        overflowX: "scroll",
        whiteSpace: "nowrap",
        height: 165,
        scrollbarWidth: "none",
      }}
    >
      {media
        .filter((item: IMedia) => item.type === "image" && item.image)
        .map((img: IMedia, index: number) => (
          <div style={{ position: "relative" }}>
            <img
              key={index}
              src={img.image!.url}
              height="100%"
              width="auto"
              style={{
                overflow: "hidden",
                borderRadius: 8,
                width: 200,
                height: 165,
                marginRight: 8,
                position: "relative",
                filter:
                  "brightness(1.1) contrast(1.1) saturate(1.1)  sepia(0.3)",
              }}
              alt={img.image!.caption || `Project image ${index + 1}`}
            />
            {/* {img.image!.caption ||
            (img.image?.tags && img.image.tags.length) ? (
              <Typography.Text
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  color: "white",
                  textTransform: "capitalize",
                  borderTopRightRadius: 8,
                  borderBottomLeftRadius: 8,
                  padding: "8px 16px",
                  width: 200,
                  backgroundColor: "rgba(0,0,0,0.3)",
                }}
              >
                {img.image!.caption || img.image!.tags}
              </Typography.Text>
            ) : null} */}
          </div>
        ))}

      {media
        .filter((item: IMedia) => item.type === "video" && item.video)
        .map((media: IMedia, index: number) => (
          <div
            style={{
              height: "100%",
              width: isMobile ? "100%" : "49%",
              borderRadius: 8,
              overflow: "hidden",
              flexShrink: 0,
              marginRight: 8,
              position: "relative",
            }}
          >
            <iframe
              src={`https://iframe.mediadelivery.net/embed/330257/${media.video?.bunnyVideoId}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`}
              loading="lazy"
              style={{
                height: "100%",
                width: "100%",
                border: "none",
              }}
              allow="accelerometer;gyroscope;encrypted-media;picture-in-picture;"
            ></iframe>
            //{" "}
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
  );
};

export default ProjectGallery;
