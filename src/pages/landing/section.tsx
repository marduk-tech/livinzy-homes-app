import { Button, Flex } from "antd";
import { useDevice } from "../../hooks/use-device";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { useNavigate } from "react-router-dom";

interface SectionProps {
  heading?: string;
  subHeading?: string | Element;
  mainImgUrl?: string;
  mainImgAltText?: string;
  bgColor?: string;
  textColor?: string;
  verticalPadding?: number;
  fullHeight?: boolean;
  primaryImageSize?: string;
  mediaUrl?: string;
  btn?: {
    link?: string;
    txt: string;
    btnAction?: any;
  };
  imageContainerWidth?: number;
}
const styles = {
  h1: {
    lineHeight: "100%",
    textOverflow: "wrap",
    width: "100%",
    margin: 0,
  },
  h2: {
    lineHeight: "120%",
    textOverflow: "wrap",
    marginTop: 16,
    width: "100%",
    margin: 0,
    fontWeight: "normal",
  },
};

const SectionLeft: React.FC<{ sectionData: SectionProps }> = ({
  sectionData,
}) => {
  const { isMobile } = useDevice();

  const navigate = useNavigate();

  return (
    <Flex
      vertical={isMobile}
      gap={isMobile ? 16 : 0}
      style={{
        width: "100%",
        backgroundColor: sectionData.bgColor || "white",
        padding: sectionData.verticalPadding
          ? `${sectionData.verticalPadding}px 0`
          : sectionData.fullHeight && !isMobile
          ? 0
          : "72px 0",
      }}
    >
      <Flex
        vertical
        style={{
          width: isMobile
            ? "calc(100% - 32px)"
            : `calc(${sectionData.imageContainerWidth || 40}% - 64px)`,
          minHeight: isMobile
            ? "auto"
            : sectionData.fullHeight
            ? window.innerHeight
            : "auto",
          marginLeft: isMobile ? 16 : 64,
        }}
        align={isMobile ? "center" : "flex-end"}
        justify="center"
      >
        <h1
          style={{
            ...styles.h1,
            fontSize: isMobile ? 50 : 60,
          }}
        >
          {sectionData.heading}
        </h1>
        {sectionData.subHeading && (
          <h2
            style={{
              ...styles.h2,
              fontSize: isMobile ? 20 : 24,
              color: sectionData.textColor || COLORS.textColorDark,
            }}
          >
            {sectionData.subHeading as any}
          </h2>
        )}
        {sectionData.btn && (
          <Button
            type="primary"
            onClick={() => {
              if (sectionData.btn?.btnAction) {
                sectionData.btn?.btnAction();
              } else {
                window.location.href = sectionData.btn!.link!;
              }
            }}
            style={{
              alignSelf: "flex-start",
              marginTop: 16,
              fontWeight: 800,
              fontSize: FONT_SIZE.HEADING_3,
            }}
          >
            {sectionData.btn.txt}
          </Button>
        )}
      </Flex>
      <Flex
        style={{
          width: isMobile
            ? "calc(100% - 32px)"
            : `calc(${100 - (sectionData.imageContainerWidth || 40)}% - 64px)`,
          minHeight: isMobile
            ? "auto"
            : sectionData.fullHeight
            ? window.innerHeight
            : "auto",
          padding: isMobile ? "0 16px" : "0 32px",
        }}
        align="center"
        justify="center"
      >
        <img
          src={sectionData.mainImgUrl}
          alt={sectionData.mainImgAltText || ""}
          style={{
            width: sectionData.primaryImageSize
              ? sectionData.primaryImageSize
              : "100%",
            maxWidth: 1000,
          }}
        ></img>
      </Flex>
    </Flex>
  );
};

const SectionRight: React.FC<{ sectionData: SectionProps }> = ({
  sectionData,
}) => {
  const { isMobile } = useDevice();

  return (
    <Flex
      vertical={isMobile}
      gap={isMobile ? 16 : 0}
      style={{
        width: "100%",
        backgroundColor: sectionData.bgColor || "white",
        padding: sectionData.verticalPadding
          ? `${sectionData.verticalPadding}px 0`
          : sectionData.fullHeight
          ? 0
          : "72px 0",
      }}
    >
      <Flex
        style={{
          width: isMobile
            ? "calc(100% - 32px)"
            : `calc(${sectionData.imageContainerWidth || 40}% - 64px)`,
          minHeight: isMobile
            ? "auto"
            : sectionData.fullHeight
            ? window.innerHeight
            : "auto",
          padding: isMobile ? "0 16px" : "0 32px",
        }}
        align="center"
        justify={isMobile ? "center" : "flex-end"}
      >
        <img
          src={sectionData.mainImgUrl}
          alt={sectionData.mainImgAltText || ""}
          style={{
            width: sectionData.primaryImageSize || "100%",
            maxWidth: 1000,
          }}
        ></img>
      </Flex>
      <Flex
        vertical
        style={{
          width: isMobile
            ? "calc(100% - 32px)"
            : `calc(${100 - (sectionData.imageContainerWidth || 40)}% - 64px)`,
          minHeight: isMobile
            ? "auto"
            : sectionData.fullHeight
            ? window.innerHeight
            : "auto",
          marginLeft: isMobile ? 16 : 64,
        }}
        align={isMobile ? "center" : "flex-end"}
        justify="center"
        gap={16}
      >
        <h1 style={{ ...styles.h1, fontSize: isMobile ? 50 : 60 }}>
          {sectionData.heading}
        </h1>
        {sectionData.subHeading && (
          <h2
            style={{
              ...styles.h2,
              fontSize: isMobile ? 20 : 24,
              color: sectionData.textColor || COLORS.textColorDark,
              maxWidth: 600,
              alignSelf: "flex-start",
            }}
          >
            {sectionData.subHeading as any}
          </h2>
        )}
        {sectionData.btn && (
          <Button
            type="primary"
            onClick={() => {
              if (sectionData.btn?.btnAction) {
                sectionData.btn?.btnAction();
              } else {
                window.location.href = sectionData.btn!.link!;
              }
            }}
            style={{
              alignSelf: "flex-start",
              marginTop: 16,
              fontSize: FONT_SIZE.HEADING_3,
            }}
          >
            {sectionData.btn.txt}
          </Button>
        )}
      </Flex>
    </Flex>
  );
};
const SectionCenter: React.FC<{ sectionData: SectionProps }> = ({
  sectionData,
}) => {
  const { isMobile } = useDevice();

  return (
    <Flex
      vertical
      style={{
        width: "100%",
        backgroundColor: sectionData.bgColor || "white",
        minHeight: "auto",
        padding: sectionData.verticalPadding
          ? `${sectionData.verticalPadding}px 0`
          : "72px 0",
      }}
      gap={16}
    >
      <Flex
        vertical
        style={{
          width: isMobile ? "calc(100% - 32px)" : "100%",
          textAlign: isMobile ? "left" : "center",
          marginLeft: isMobile ? 24 : 0,
        }}
        align="center"
        justify="center"
      >
        <h1
          style={{
            ...styles.h1,
            fontSize: isMobile ? 50 : 60,
            color: sectionData.textColor || COLORS.textColorDark,
          }}
        >
          {sectionData.heading}
        </h1>
        {sectionData.subHeading && (
          <h2
            style={{
              ...styles.h2,
              fontSize: isMobile ? 20 : 24,
              color: sectionData.textColor || COLORS.textColorDark,
            }}
          >
            {sectionData.subHeading as any}
          </h2>
        )}
        {sectionData.btn && (
          <Button
            type="primary"
            onClick={() => {
              if (sectionData.btn?.btnAction) {
                sectionData.btn?.btnAction();
              } else {
                window.location.href = sectionData.btn!.link!;
              }
            }}
            style={{
              alignSelf: "flex-start",
              marginTop: 16,
              fontWeight: 800,
              fontSize: FONT_SIZE.HEADING_3,
            }}
          >
            {sectionData.btn.txt}
          </Button>
        )}
      </Flex>
      <Flex
        style={{
          width: isMobile ? "calc(100% - 32px)" : "100%",
          padding: isMobile ? "0 16px" : "0",
        }}
        align="center"
        justify={isMobile ? "center" : "flex-start"}
      >
        {sectionData.mainImgUrl ? (
          <img
            alt={sectionData.mainImgAltText || ""}
            src={sectionData.mainImgUrl}
            style={{
              width: sectionData.primaryImageSize
                ? sectionData.primaryImageSize
                : "100%",
              maxWidth: 900,
              margin: "auto",
            }}
          ></img>
        ) : sectionData.mediaUrl ? (
          <video
            autoPlay
            muted
            loop
            height={isMobile ? 400 : 700}
            style={{ margin: "auto" }}
          >
            <source src={sectionData.mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : null}
      </Flex>
    </Flex>
  );
};

export { SectionCenter, SectionLeft, SectionRight };
