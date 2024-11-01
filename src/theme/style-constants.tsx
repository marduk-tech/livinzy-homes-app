export const COLORS = {
  primaryColor: "#2BCBF2",
  redIdentifier: "#FF8080",
  greenIdentifier: "#A6CF98",
  yellowIdentifier: "#f1b24b",
  orangeIdentifier: "#d68438",
  bgColor: "#fafbfb",
  bgColorDark: "#2D3F4E",
  borderColor: "#eee",
  borderColorDark: "#ddd",
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
  default: 12,
  subText: 14,
  title: isMobile ? 32 : 38,
  heading: isMobile ? 22 : 28,
  subHeading: 18,
};
