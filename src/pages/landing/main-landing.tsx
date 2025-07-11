import { Flex, Modal, Typography } from "antd";
import { useDevice } from "../../hooks/use-device";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { SectionCenter, SectionLeft, SectionRight } from "./section";
import { LandingFooter } from "./footer";
import { useState } from "react";
import { Brick360RequestForm } from "../../components/common/brick360-request";
import LandingHeader from "./header";

export function MainLanding() {
  const { isMobile } = useDevice();
  const [requestReportDialogOpen, setRequestReportDialogOpen] = useState(false);

  const whoAreWeText = (
    <Typography.Text
      style={{ fontSize: FONT_SIZE.HEADING_2, display: "block" }}
    >
      Get the exclusive Brick360 Report on new & under construction properties
      across Bangalore. Verified, unbiased, marketing free insights you won’t
      find anywhere else.
    </Typography.Text>
  );
  return (
    <Flex
      vertical
      style={{
        height: window.innerHeight,
        overflowY: "scroll",
        position: "relative",
        paddingTop: isMobile ? 60 : 0,
        overflowX: "hidden",
        scrollbarWidth: "none",
      }}
    >
      <LandingHeader></LandingHeader>
      {/* <SectionLeft
        sectionData={{
          heading: "Don’t Leave Your Next Property Purchase to Guesswork",
          mainImgUrl: "/images/landing/slide-1.png",
          mainImgAltText:
            "Buy your next property with confidence. Consult Brickfi.",
          fullHeight: true,
        }}
      ></SectionLeft> */}
      <SectionRight
        sectionData={{
          heading: "The Only Report That Safeguards Your Home Investment",
          mainImgAltText: "About Brickfi",
          subHeading: whoAreWeText as any,
          primaryImageSize: "100%",
          bgColor: "#fdf7f6",
          mainImgUrl: "/images/landing/brick360-landing-2.png",
          btn: {
            link: "",
            txt: "Launching Soon",
            btnAction: () => {
              // setRequestReportDialogOpen(true);
            },
          },
          imageContainerWidth: 50,
          fullHeight: true,
          verticalPadding: 32,
        }}
      ></SectionRight>

      <SectionCenter
        sectionData={{
          heading: "",
          mediaUrl: "/images/landing/demo-landing-small.mp4",
          bgColor: COLORS.textColorDark,
          textColor: "white",
          verticalPadding: 60,
          primaryImageSize: "80%",
        }}
      ></SectionCenter>
      <Flex
        style={{ backgroundColor: COLORS.textColorDark, paddingTop: 100 }}
        justify="center"
      >
        <img
          src="/images/landing/divider.png"
          width={isMobile ? "80%" : "30%"}
        ></img>
      </Flex>
      <SectionCenter
        sectionData={{
          heading: "The Intelligent Real Estate",
          mainImgAltText:
            "Brickfi is a customer focused real estate platform & advisory in Bangalore. Our difference lies in being buyer focused & our technology driven research",
          mainImgUrl: isMobile
            ? "/images/landing/slide-2-mobile.png"
            : "/images/landing/slide-2.png",
          bgColor: COLORS.textColorDark,
          textColor: "white",
          verticalPadding: 60,
          primaryImageSize: isMobile ? "100%" : "50%",
        }}
      ></SectionCenter>
      <SectionLeft
        sectionData={{
          heading: "The BrickFi Difference",
          fullHeight: true,

          subHeading:
            "A combination of technology driven, data backed and personalized experience. ",
          mainImgUrl: "/images/landing/slide-4.png",
          mainImgAltText:
            "Brickfi offers personalized curation vs biased marketing, 360 reports vs lack of transparency, end to end strategic assistance vs limited guidance.",
        }}
      ></SectionLeft>
      <SectionCenter
        sectionData={{
          heading: "Data to Give a Full Picture",
          fullHeight: true,
          bgColor: "#fdf7f6",

          subHeading:
            "Our technology collects data points across different legitimate sources.",
          mainImgUrl: "/images/landing/slide-5.png",
          mainImgAltText:
            "Brickfi collects multiple data points from sources like RERA, Open City, BBMP, Open Street etc.",
        }}
      ></SectionCenter>
      <SectionLeft
        sectionData={{
          heading: "Insights that Lead to Clarity",
          bgColor: "#fdf7f6",
          btn: {
            link: "",
            txt: "Launching Soon",
            btnAction: () => {
              // setRequestReportDialogOpen(true);
            },
          },
          subHeading:
            "Our AI analyses every data point so that you don’t have to. Get a clear understanding of what to look at, what’s important and why its important.",
          mainImgUrl: "/images/landing/slide-6.png",
          mainImgAltText:
            "Brickfi uses AI to make sense of data points and provide you more clarity.",
        }}
      ></SectionLeft>
      <SectionCenter
        sectionData={{
          heading: "Nuanced Location Intelligence",
          subHeading: "",
          bgColor: "#fdf7f6",
          mainImgUrl: "/images/landing/slide-7.png",
          mainImgAltText:
            "See location insights visually on a map with Brickfi.",
        }}
      ></SectionCenter>
      <SectionCenter
        sectionData={{
          verticalPadding: 100,
          heading: "Our Happy Home Buyers",
          subHeading: "",
          bgColor: COLORS.textColorDark,
          textColor: "white",
          mainImgUrl: isMobile
            ? "/images/landing/slide-9-mobile.png"
            : "/images/landing/slide-9.png",
          mainImgAltText: "List of happy home buyers at Brickfi.",
        }}
      ></SectionCenter>
      <SectionCenter
        sectionData={{
          verticalPadding: 100,
          heading: "",
          primaryImageSize: "75%",
          subHeading: "",
          mainImgUrl: isMobile
            ? "/images/landing/slide-10-mobile.png"
            : "/images/landing/slide-10.png",
          mainImgAltText:
            "Brickfi covers 6 micro markets, 100+ developers and 400+ projects across Bengaluru",
        }}
      ></SectionCenter>
      <SectionRight
        sectionData={{
          verticalPadding: 100,
          heading: "Choose Real Estate To Diversify & Leverage",
          // btn: {
          //   link: LandingConstants.brickAssistLink,
          //   txt: "Explore BrickfiAssist",
          // },
          subHeading:
            "Diversify your portfolio with real estate — a stable, physical asset that grows in value over time. Take advantage of leverage to secure high-value investments with lower upfront costs. With BrickfiAssist, you get unbiased, data backed advice to help you make superior investments.",
          mainImgUrl: "/images/landing/slide-11.png",
          mainImgAltText: "Diversify with real estate",
          primaryImageSize: "80%",
        }}
      ></SectionRight>
      <LandingFooter></LandingFooter>
      <Modal
        open={requestReportDialogOpen}
        closable={true}
        onClose={() => {
          setRequestReportDialogOpen(false);
        }}
        onCancel={() => {
          setRequestReportDialogOpen(false);
        }}
        footer={null}
      >
        <Brick360RequestForm></Brick360RequestForm>
      </Modal>
    </Flex>
  );
}
