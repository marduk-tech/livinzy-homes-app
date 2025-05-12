import { Flex } from "antd";
import { COLORS } from "../../theme/style-constants";
import Link from "antd/es/typography/Link";
import { useDevice } from "../../hooks/use-device";
import { LandingConstants } from "../../libs/constants";

export function LandingHeader() {
  const { isMobile } = useDevice();

  return (
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
        <Link href="/app" style={{ color: COLORS.textColorDark }}>
          Brickfi App
        </Link>
        <Link
          href={LandingConstants.consultUsLink}
          style={{ color: COLORS.textColorDark }}
        >
          Consult Us
        </Link>
      </Flex>
    </Flex>
  );
}
