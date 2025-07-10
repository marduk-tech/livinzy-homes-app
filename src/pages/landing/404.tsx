import { Flex } from "antd";
import { useDevice } from "../../hooks/use-device";
import { SectionCenter } from "./section";
import { LandingFooter } from "./footer";
import LandingHeader from "./header";

export function FourOFour() {
  const { isMobile } = useDevice();
  const aboutusText = (
    <>
      Brickfi is a Bangalore-based real estate advisory helping buyers navigate
      the city’s property landscape with clarity and confidence.
      <br />
      We offer research-backed guidance for apartments, villas, and plots,
      tailored to your personal or investment goals. Our strength lies in using
      technology to combine local insights with data-driven analysis to help you
      make decisions more confidently.
      <br />
      <br />
      You can reach us out at <b>hello@brickfi.in</b>
    </>
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
      <SectionCenter
        sectionData={{
          mainImgUrl: "/images/landing/404.png",
          primaryImageSize: "50%",
          verticalPadding: 125,
        }}
      ></SectionCenter>
      <LandingFooter></LandingFooter>
    </Flex>
  );
}
