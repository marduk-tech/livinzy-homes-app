export const COLORS = {
  primaryColor: "#38b6ff",
  redIdentifier: "#FF8080",
  greenIdentifier: "#A6CF98",
  yellowIdentifier: "#f1b24b",
  orangeIdentifier: "#d68438",
  bgColor: "#fafbfb",
  bgColorMedium: "#f2f4f5",
  bgColorDark: "#2D3F4E",
  borderColor: "#eee",
  borderColorMedium: "#ddd",
  borderColorDark: "#666",
  textColorDark: "#2D3F4E",
  textColorLight: "#999",
  textColorVeryLight: "#e1e1e1",
};

export const FONTS = {
  primary: "DM Sans",
  regular: "DM Sans",
  bold: "DM Sans",
};

const isMobile = !!window.matchMedia("((max-width: 576px))").matches;
export const FONT_SIZE = {
  SUB_TEXT: 14,
  PARA: 16,
  HEADING_1: isMobile ? 32 : 32,
  HEADING_2: isMobile ? 26 : 28,
  HEADING_3: 20,
  HEADING_4: 18,
};

export const MOBILE_MARGIN = 16;
export const MAX_WIDTH = 1000;
