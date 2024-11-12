import { ThemeConfig } from "antd";
import { COLORS, FONTS } from "./style-constants";

export const antTheme: ThemeConfig = {
  token: {
    colorPrimary: COLORS.primaryColor,
    colorSuccess: COLORS.greenIdentifier,
    colorTextBase: COLORS.textColorDark,
    controlHeight: 50,
    fontFamily: FONTS.primary,
    fontSize: 16,
  },
  components: {
    Button: {
      defaultBorderColor: COLORS.primaryColor,
      defaultColor: COLORS.primaryColor,
    },
  },
};
