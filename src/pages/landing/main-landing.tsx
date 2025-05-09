import { Flex, Typography } from "antd";
import { useDevice } from "../../hooks/use-device";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import Link from "antd/es/typography/Link";

interface SectionProps {
  heading?: string;
  subHeading?: string;
  mainImgUrl?: string;
  bgColor?: string;
  textColor?: string;
  verticalPadding?: number;
  fullHeight?: boolean;
  primaryImageSize?: string;
  mediaUrl?: string;
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
          width: isMobile ? "calc(100% - 32px)" : "calc(50% - 64px)",
          minHeight: isMobile
            ? "auto"
            : sectionData.fullHeight
            ? window.innerHeight
            : "auto",
          marginLeft: isMobile ? 32 : 64,
        }}
        align={isMobile ? "center" : "flex-end"}
        justify="center"
      >
        <h1
          style={{
            ...styles.h1,
            fontSize: isMobile ? 50 : 60,
            fontWeight: 1000,
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
            {sectionData.subHeading}
          </h2>
        )}
      </Flex>
      <Flex
        style={{
          width: isMobile ? "calc(100% - 32px)" : "calc(50% - 64px)",
          minHeight: isMobile
            ? "auto"
            : sectionData.fullHeight
            ? window.innerHeight
            : "auto",
          padding: isMobile ? "0 16px" : "0 32px",
        }}
        align="center"
        justify={isMobile ? "center" : "flex-start"}
      >
        <img
          src={sectionData.mainImgUrl}
          style={{ width: "100%", maxWidth: 1000 }}
        ></img>
        {/* <div
          style={{
            width: "100%",
            height: isMobile ? 450 : 600,
            backgroundImage: `url(${sectionData.mainImgUrl})`,
            backgroundPosition: isMobile ? "top center" : "center",
            backgroundSize: sectionData.primaryImageSize
              ? sectionData.primaryImageSize
              : "contain",
            backgroundRepeat: "no-repeat",
          }}
        ></div> */}
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
          width: isMobile ? "calc(100% - 32px)" : "calc(40% - 64px)",
          minHeight: isMobile
            ? "auto"
            : sectionData.fullHeight
            ? window.innerHeight
            : "auto",
          padding: isMobile ? "0 16px" : "0 32px",
        }}
        align="center"
        justify={isMobile ? "center" : "flex-start"}
      >
        <img
          src={sectionData.mainImgUrl}
          style={{ width: "100%", maxWidth: 1000 }}
        ></img>
      </Flex>
      <Flex
        vertical
        style={{
          width: isMobile ? "calc(100% - 32px)" : "calc(60% - 64px)",
          minHeight: isMobile
            ? "auto"
            : sectionData.fullHeight
            ? window.innerHeight
            : "auto",
          marginLeft: isMobile ? 32 : 64,
        }}
        align={isMobile ? "center" : "flex-end"}
        justify="center"
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
            }}
          >
            {sectionData.subHeading}
          </h2>
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
          marginLeft: isMobile ? 32 : 0,
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
            {sectionData.subHeading}
          </h2>
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
            src={sectionData.mainImgUrl}
            style={{ width: "100%", maxWidth: 900, margin: "auto" }}
          ></img>
        ) : sectionData.mediaUrl ? (
          <video
            autoPlay
            muted
            loop
            height={isMobile ? 400 : 800}
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

export function MainLanding() {
  const { isMobile } = useDevice();
  return (
    <Flex
      vertical
      style={{
        height: window.innerHeight,
        overflowY: "scroll",
        position: "relative",
        paddingTop: isMobile ? 60 : 0,
        overflowX: "hidden",
      }}
    >
      <Flex
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          padding: 16,
          backgroundColor: "white",
        }}
        align="center"
      >
        <img src="/images/brickfi-logo.png" height="20"></img>
        <Flex style={{ marginLeft: "auto", marginRight: 48 }} gap={16}>
          <Link
            href="https://app.brickfi.in"
            style={{ color: COLORS.textColorDark }}
          >
            Brickfi App
          </Link>
          <Link
            href="https://app.brickfi.in"
            style={{ color: COLORS.textColorDark }}
          >
            Consult Us
          </Link>
        </Flex>
      </Flex>
      <SectionLeft
        sectionData={{
          heading: "Don’t Leave Your Next Property Purchase to Guesswork",
          mainImgUrl: "/images/landing/slide-1.png",
          fullHeight: true,
        }}
      ></SectionLeft>
      <SectionCenter
        sectionData={{
          heading: "The Intelligent Real Estate Advisory",
          mainImgUrl: "/images/landing/slide-2.png",
          bgColor: "#2c4356",
          textColor: "white",
          verticalPadding: 60,
        }}
      ></SectionCenter>
      <SectionCenter
        sectionData={{
          heading: "",
          mediaUrl: "/images/landing/demo-landing-small.mp4",
          bgColor: "#2c4356",
          textColor: "white",
          verticalPadding: 60,
        }}
      ></SectionCenter>
      <SectionLeft
        sectionData={{
          heading: "The BrickFi Difference",
          fullHeight: true,
          subHeading:
            "A combination of technology driven, data backed and personalized experience. ",
          mainImgUrl: "/images/landing/slide-4.png",
        }}
      ></SectionLeft>
      <SectionCenter
        sectionData={{
          heading: "Data to Give a Full Picture",
          fullHeight: true,
          subHeading:
            "Our technology collects data points across different legitimate sources.",
          mainImgUrl: "/images/landing/slide-5.png",
        }}
      ></SectionCenter>
      <SectionLeft
        sectionData={{
          heading: "Insights that Lead to Clarity",
          subHeading:
            "Our AI analyses every data point so that you don’t have to. Get a clear understanding of what to look at, what’s important and why its important.",
          mainImgUrl: "/images/landing/slide-6.png",
        }}
      ></SectionLeft>
      <SectionCenter
        sectionData={{
          heading: "Nuanced Location Intelligence",
          subHeading: "",
          mainImgUrl: "/images/landing/slide-7.png",
        }}
      ></SectionCenter>
      <SectionCenter
        sectionData={{
          verticalPadding: 100,
          heading: "Our Happy Home Buyers",
          subHeading: "",
          bgColor: isMobile ? "#2c4356" : COLORS.textColorDark,
          textColor: "white",
          mainImgUrl: isMobile
            ? "/images/landing/slide-9-mobile.png"
            : "/images/landing/slide-9.png",
        }}
      ></SectionCenter>
      <SectionCenter
        sectionData={{
          verticalPadding: 100,
          heading: "",
          subHeading: "",
          mainImgUrl: isMobile
            ? "/images/landing/slide-10-mobile.png"
            : "/images/landing/slide-10.png",
        }}
      ></SectionCenter>
      <SectionRight
        sectionData={{
          verticalPadding: 100,
          heading: "Choose Real Estate To Diversify & Leverage",
          subHeading:
            "Diversify your portfolio with real estate — a stable, physical asset that grows in value over time. Take advantage of leverage to secure high-value investments with lower upfront costs.",
          mainImgUrl: "/images/landing/slide-11.png",
          primaryImageSize: "80%",
        }}
      ></SectionRight>
      <Flex
        align="center"
        vertical
        style={{
          padding: isMobile ? "64px 16px" : "64px 0",
          marginBottom: 50,
          textAlign: "center",
        }}
      >
        <img
          src="/images/landing/divider.png"
          width={isMobile ? "80%" : "30%"}
        ></img>
        <Typography.Text
          style={{
            color: COLORS.textColorLight,
            fontSize: FONT_SIZE.PARA,
            marginTop: 32,
          }}
        >
          Brickfi is a real estate platform, committed to transparency and
          trust. {isMobile ? null : <br></br>}We offer verified properties and
          reliable guidance to help you make confident decisions.
        </Typography.Text>
        <Flex style={{ marginTop: 40 }} gap={isMobile ? 16 : 32}>
          <Link
            href="https://app.brickfi.in"
            style={{ color: COLORS.textColorLight }}
          >
            Brickfi App
          </Link>
          <Link
            href="https://app.brickfi.in"
            style={{ color: COLORS.textColorLight }}
          >
            Consult With Us
          </Link>
          <Link
            href="https://app.brickfi.in"
            style={{ color: COLORS.textColorLight }}
          >
            About Us
          </Link>
          <Link
            href="https://app.brickfi.in"
            style={{ color: COLORS.textColorLight }}
          >
            Help
          </Link>
        </Flex>
      </Flex>
    </Flex>
  );
}
