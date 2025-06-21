import { Flex, Image, Typography } from "antd";
import { useMemo } from "react";
import { useDevice } from "../hooks/use-device";
import "../theme/gallery.css";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { IMedia } from "../types/Project";

export const ProjectImagesGalleryV2 = ({
  media,
  selectedImageId,
}: {
  media: IMedia[];
  selectedImageId: string | null;
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

    // move selected image to front in its sections
    if (selectedImageId) {
      Object.keys(result).forEach((tag) => {
        const selectedIndex = result[tag].findIndex(
          (img) => img._id === selectedImageId
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
    <Flex vertical gap={32}>
      {Object.entries(groupedImages)
        .sort(([a], [b]) => {
          if (selectedImageId) {
            const aHasSelected = groupedImages[a].some(
              (img) => img._id === selectedImageId
            );
            const bHasSelected = groupedImages[b].some(
              (img) => img._id === selectedImageId
            );
            if (aHasSelected && !bHasSelected) return -1;
            if (!aHasSelected && bHasSelected) return 1;
          }
          return a.localeCompare(b);
        })
        .map(([tag, images]) => (
          <Flex key={tag} vertical>
            <Typography.Text
              style={{
                margin: 0,
                fontSize: FONT_SIZE.HEADING_3,
                textTransform: "capitalize",
              }}
            >
              {tag}
            </Typography.Text>

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
                        mask: true ? null : (
                          <div className="gallery-caption">
                            {item.image!.caption || item.image!.tags.join(", ")}
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
  );
};
