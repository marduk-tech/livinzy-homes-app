import { Flex, Typography } from "antd";
import { useDevice } from "../../hooks/use-device";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import Link from "antd/es/typography/Link";
import { LandingConstants } from "../../libs/constants";

export function LandingFooter() {
  const { isMobile } = useDevice();

  return (
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
        Brickfi is a real estate platform, committed to transparency and trust.{" "}
        {isMobile ? null : <br></br>}We offer verified properties and reliable
        guidance to help you make confident decisions.
      </Typography.Text>
      <Flex style={{ marginTop: 40 }} gap={isMobile ? 16 : 32}>
        <Link href="/app" style={{ color: COLORS.textColorLight }}>
          Brickfi App
        </Link>
        <Link
          href={LandingConstants.brickAssistLink}
          style={{ color: COLORS.textColorLight }}
        >
          Consult With Us
        </Link>
        <Link href="/aboutus" style={{ color: COLORS.textColorLight }}>
          About Us
        </Link>
        <Link href="/aboutus" style={{ color: COLORS.textColorLight }}>
          Help
        </Link>
      </Flex>
    </Flex>
  );
}
