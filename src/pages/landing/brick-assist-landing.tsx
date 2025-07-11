import { Flex, Modal, Typography } from "antd";
import { useDevice } from "../../hooks/use-device";
import { LandingFooter } from "./footer";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { SectionLeft, SectionRight } from "./section";
import { useState } from "react";
import { BrickAssistCallback } from "../../components/common/brickassist-callback";
import LandingHeader from "./header";

export function BrickAssistLanding() {
  const { isMobile } = useDevice();

  const [requestCallbackDialogOpen, setRequestCallbackDialogOpen] =
    useState(false);

  const whoAreWeText = (
    <Typography.Text
      style={{ fontSize: FONT_SIZE.HEADING_2, display: "block" }}
    >
      Consult with Brickfi to get an expert advice on your next home purchase.
      We provide unbiased, data backed and technology driven real estate
      advisory.
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
        backgroundColor: "#fdf7f6",
        backgroundRepeat: "no-repeat",
        width: "100%",
      }}
    >
      <LandingHeader bgColor="white"></LandingHeader>
      <SectionRight
        sectionData={{
          heading: "Buyer Focused, Unbiased and Data backed.",
          mainImgAltText: "About Brickfi",
          subHeading: whoAreWeText as any,
          primaryImageSize: "100%",
          bgColor: "#fff",
          mainImgUrl: "/images/landing/aboutus-1.png",
          btn: {
            link: "",
            txt: "Schedule Callback",
            btnAction: () => {
              setRequestCallbackDialogOpen(true);
            },
          },
          imageContainerWidth: 50,
          fullHeight: true,
          verticalPadding: 32,
        }}
      ></SectionRight>
      <SectionLeft
        sectionData={{
          heading: "We are there with you, every step of the way.",
          mainImgAltText: "About Brickfi",
          primaryImageSize: "100%",
          bgColor: COLORS.textColorDark,
          textColor: "#fff",
          mainImgUrl: "/images/landing/brick-assist-landing-2.png",
          imageContainerWidth: 50,
          verticalPadding: 100,
        }}
      ></SectionLeft>
      <LandingFooter></LandingFooter>
      <Modal
        open={requestCallbackDialogOpen}
        closable={true}
        onClose={() => {
          setRequestCallbackDialogOpen(false);
        }}
        onCancel={() => {
          setRequestCallbackDialogOpen(false);
        }}
        footer={null}
      >
        <BrickAssistCallback></BrickAssistCallback>
      </Modal>
    </Flex>
  );
}
