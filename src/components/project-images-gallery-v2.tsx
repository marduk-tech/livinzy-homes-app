import { Flex, Image, Tag, Typography } from "antd";
import { useMemo, useState } from "react";
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
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    media.forEach((item) => {
      if (item.type === "image" && item.image?.tags) {
        item.image.tags.forEach((tag) => {
          if (tag !== "na") {
            tags.add(tag);
          }
        });
      }
    });
    return ["all", ...Array.from(tags)];
  }, [media]);

  const groupedImages = useMemo(() => {
    const imageMedia = media.filter(
      (item) =>
        item.type === "image" && item.image && !item.image.tags.includes("na")
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

  const filteredImages = useMemo((): [string, IMedia[]][] => {
    if (selectedTag === "all") {
      return Object.entries(groupedImages);
    }
    if (groupedImages[selectedTag]) {
      return [[selectedTag, groupedImages[selectedTag]]];
    }
    return [];
  }, [selectedTag, groupedImages]);

  return (
    <Flex vertical gap={16}>
      <Flex wrap="wrap" gap={8}>
        {allTags.map((tag) => (
          <Tag.CheckableTag
            key={tag}
            checked={selectedTag === tag}
            onChange={(checked) => {
              if (checked) {
                setSelectedTag(tag);
              }
            }}
            style={{
              textTransform: "capitalize",
              border: `1px solid ${
                selectedTag === tag ? COLORS.primaryColor : COLORS.borderColor
              }`,
              padding: "4px 12px",
              borderRadius: 16,
              backgroundColor:
                selectedTag === tag ? COLORS.primaryColor : "white",
              color: selectedTag === tag ? "white" : COLORS.textColorMedium,
            }}
          >
            {tag}
          </Tag.CheckableTag>
        ))}
      </Flex>

      {filteredImages.length > 0 ? (
        <Flex vertical gap={32}>
          {filteredImages
            .sort(([aTag, aImages], [bTag, bImages]) => {
              if (selectedImageId) {
                const aHasSelected = aImages.some(
                  (img) => img._id === selectedImageId
                );
                const bHasSelected = bImages.some(
                  (img) => img._id === selectedImageId
                );
                if (aHasSelected && !bHasSelected) return -1;
                if (!aHasSelected && bHasSelected) return 1;
              }
              return aTag.localeCompare(bTag);
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
                          alt={
                            item.image!.caption || `${tag} image ${index + 1}`
                          }
                          preview={{
                            mask: null,
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
      ) : (
        <Typography.Text>
          No images available for the selected tag.
        </Typography.Text>
      )}
    </Flex>
  );
};
