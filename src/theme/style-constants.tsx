export const COLORS = {
  primaryColor: "#38b6ff",
  redIdentifier: "#FF8080",
  greenIdentifier: "#A6CF98",
  yellowIdentifier: "#f1b24b",
  orangeIdentifier: "#d68438",
  bgColor: "#fafbfb",
  bgColorMedium: "#f2f4f5",
  bgColorDark: "#2D3F4E",
  borderColor: "#EEE",
  borderColorMedium: "#ddd",
  borderColorDark: "#666",
  textColorDark: "#2D3F4E",
  textColorMedium: "#4e6d86",
  textColorLight: "#999",
  textColorVeryLight: "#e1e1e1",
  bgColorBlue: "#e7f6ff",
};

export const FONTS = {
  primary: "DM Sans",
  regular: "DM Sans",
  bold: "DM Sans",
};

const isMobile = !!window.matchMedia("((max-width: 576px))").matches;
export const FONT_SIZE = {
  SUB_TEXT: 12,
  PARA: 14,
  HEADING_1: isMobile ? 30 : 32,
  HEADING_2: isMobile ? 24 : 26,
  HEADING_3: 18,
  HEADING_4: 16,
};

export const MOBILE_MARGIN = 16;
export const MAX_WIDTH = 1200;
