import { CaretRightOutlined } from "@ant-design/icons";
import { Collapse, CollapseProps, Flex, Modal, Typography } from "antd";
import { useState } from "react";
import { BrickAssistCallback } from "../../components/common/brickassist-callback";
import { useDevice } from "../../hooks/use-device";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { LandingFooter } from "./footer";
import LandingHeader from "./header";
import { SectionCenter, SectionLeft, SectionRight } from "./section";

export function BrickAssistLanding() {
  const { isMobile } = useDevice();

  const [requestCallbackDialogOpen, setRequestCallbackDialogOpen] =
    useState(false);

  const getFaqHeading = (text: string) => {
    return (
      <Typography.Text
        style={{
          fontSize: FONT_SIZE.HEADING_2,
          textAlign: "left",
          color: "white",
        }}
      >
        {text}
      </Typography.Text>
    );
  };

  const getFaqText = (text: string) => {
    return (
      <p style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_3 }}>{text}</p>
    );
  };
  const faqPanelStyle = {
    marginBottom: 24,
    background: COLORS.textColorDark,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    color: "white",
    border: "none",
  };
  const faqs: CollapseProps["items"] = [
    {
      key: "1",
      label: getFaqHeading("What is Brickfi Assist ?"),
      style: faqPanelStyle,
      children: getFaqText(`
          With BrickfiAssist you get expert property buying advise on new and
          under construction properties including apartments, villas and plots
          in Bengaluru. We provide data backed and verified list of curated
          properties personalized for your requirements. Besides, we also
          provide end to end support when it comes to visits, negotiation, post
          purchase documentation assistance and more.`),
    },
    {
      key: "2",
      label: getFaqHeading("Is this a paid service ?"),
      style: faqPanelStyle,
      children: getFaqText(`
          The service is completely free for our buyers. We usually charge
          commission from the developer. However, that does not mean, that we
          prefer or have any bias with any particular developer. Most of the
          developers have a set commisssion for partners/advisors which is
          separate from the final cost quoted to the buyer. That means, the
          buyer does not have to accomodate any part of their cost when it comes
          to commissions.
        `),
    },
    {
      key: "3",
      label: getFaqHeading("What all to expect during consultation?"),
      style: faqPanelStyle,
      children: getFaqText(`
          We initially do a intro call to discuss in detail your set of
          requirements, provide overview of the Bangalore market in terms of
          different micro markets,
        `),
    },
    {
      key: "4",
      label: getFaqHeading("How do you curate projects?"),
      style: faqPanelStyle,
      children: getFaqText(`
          We initially do a intro call to discuss in detail your set of
          requirements, provide overview of the Bangalore market in terms of
          different micro markets,
        `),
    },
  ];

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
      <LandingHeader
        bgColor={COLORS.textColorDark}
        color={"white"}
        logo="/images/brickfi-logo-white.png"
      ></LandingHeader>
      <SectionRight
        sectionData={{
          heading: (
            <Flex vertical>
              <img style={{ width: 150 }} src="/images/brickfi-assist.png" />
              <h1
                style={{
                  lineHeight: "100%",
                  width: "100%",
                  margin: 0,
                  fontSize: isMobile ? 50 : 60,
                  color: "white",
                }}
              >
                Buyer First, Unbiased & Data Backed.
              </h1>
            </Flex>
          ),
          mainImgAltText: "Consult with Brickfi",
          subHeading:
            "Consult with Brickfi to get an expert advice on your next home purchase. We provide unbiased, data backed and technology driven real estate advisory.",
          primaryImageSize: isMobile ? "100%" : "80%",
          bgColor: COLORS.textColorDark,
          textColor: "white",
          mainImgAlign: "center",
          mainImgUrl: "/images/landing/brick-assist-landing-3.png",
          btn: {
            link: "",
            txt: "Schedule Callback",
            btnAction: () => {
              setRequestCallbackDialogOpen(true);
            },
          },
          imageContainerWidth: 50,
          verticalPadding: 100,
        }}
      ></SectionRight>
      <SectionLeft
        sectionData={{
          heading: "We are there with you, every step of the way.",
          subHeading: (
            <Typography.Text
              style={{
                marginTop: 16,
                fontSize: FONT_SIZE.HEADING_2,
                color: "white",
              }}
            >
              We provide end to end services, pre and post purchase with our
              data backed research to help you make confident decisions.
            </Typography.Text>
          ),
          mainImgAltText: "About Brickfi",
          primaryImageSize: "100%",
          mainImgUrl: "/images/landing/brick-assist-landing-2.png",
          imageContainerWidth: 50,
          bgColor: COLORS.textColorDark,
          textColor: "white",
          verticalPadding: isMobile ? 32 : 32,
        }}
      ></SectionLeft>
      <SectionCenter
        sectionData={{
          heading: "FAQ",
          bgColor: "#fdf7f6",
          verticalPadding: isMobile ? 24 : 100,
          subHeading: (
            <Flex>
              <Collapse
                expandIcon={({ isActive }) => (
                  <CaretRightOutlined
                    style={{
                      color: "white",
                      fontSize: FONT_SIZE.HEADING_3,
                      marginTop: 8,
                    }}
                    rotate={isActive ? 90 : 0}
                  />
                )}
                style={{ width: isMobile ? "100%" : 900, border: "none" }}
                items={faqs}
                defaultActiveKey={["1"]}
              />
            </Flex>
          ),
        }}
      ></SectionCenter>
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
