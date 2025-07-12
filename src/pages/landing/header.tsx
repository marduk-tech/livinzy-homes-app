import { Flex } from "antd";
import { COLORS } from "../../theme/style-constants";
import Link from "antd/es/typography/Link";
import { useDevice } from "../../hooks/use-device";
import { LandingConstants } from "../../libs/constants";

const LandingHeader: React.FC<{
  bgColor?: string;
  color?: string;
  logo?: string;
}> = ({ bgColor, color, logo }) => {
  const { isMobile } = useDevice();

  return (
    <Flex
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        padding: 16,
        backgroundColor: bgColor || "#fdf7f6",
      }}
      align="center"
    >
      <Flex
        onClick={() => {
          window.location.assign("/");
        }}
        style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <img src={logo || "/images/brickfi-logo.png"} height="20"></img>
      </Flex>
      <Flex
        style={{
          marginLeft: "auto",
          marginRight: 48,
          color: color || COLORS.textColorMedium,
        }}
        gap={16}
      >
        <Link href="/app" style={{ color: color || COLORS.textColorDark }}>
          Go to App
        </Link>
        <Link
          href={LandingConstants.brickAssistLink}
          style={{ color: color || COLORS.textColorDark }}
        >
          Brickfi Assist
        </Link>
      </Flex>
    </Flex>
  );
};

export default LandingHeader;
