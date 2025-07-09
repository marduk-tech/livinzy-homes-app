import { Flex, Modal, Typography } from "antd";
import { useDevice } from "../../hooks/use-device";
import { LandingHeader } from "./header";
import { LandingFooter } from "./footer";
import { FONT_SIZE } from "../../theme/style-constants";
import { SectionRight } from "./section";
import { useState } from "react";
import { Brick360RequestForm } from "../../components/common/brick360-request";

export function Brick360Landing() {
  const { isMobile } = useDevice();

  const [requestReportDialogOpen, setRequestReportDialogOpen] = useState(false);

  const whoAreWeText = (
    <Typography.Text
      style={{ fontSize: FONT_SIZE.HEADING_2, display: "block" }}
    >
      Get the exclusive Brick360 Report — verified, unbiased, marketing free
      data you won’t find anywhere else.
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
      }}
    >
      <LandingHeader></LandingHeader>
      <SectionRight
        sectionData={{
          heading: "The Only Report That Safeguards Your Investment",
          mainImgAltText: "About Brickfi",
          subHeading: whoAreWeText as any,
          primaryImageSize: "100%",
          bgColor: "#fdf7f6",
          mainImgUrl: "/images/landing/brick360-landing-1.png",
          btn: {
            link: "",
            txt: "Generate Free Report",
            btnAction: () => {
              setRequestReportDialogOpen(true);
            },
          },
          imageContainerWidth: 50,
          fullHeight: true,
          verticalPadding: 32,
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
