//color
export const primaryColor = "#2a2a86";
export const primaryColorHover = "#0F0F6D";
export const siderColor = "#222247";
export const menuColor = "rgba(0, 0, 0, 1)";
export const secondaryColor = "#fcaf17";
export const backgroundColor = "#f3f3f7";
export const backgroundColorSecondary = "#f4f4f7";
export const greenColor = "#27ae60";
export const borderColor = "#ddd";
export const successColor = "#27AE60";
export const pendingColor = "#FCAF17";
export const textBodyColor = "#222222";
export const dangerColor = "#E24343";
export const textMutedColor = "#666666";
export const textLinkColor = "#5656A2";
export const grayF5Color = "#F5F5F5";
export const grayE5Color = "#E5E5E5";
export const defaultBgTag = "#F4F4F7";
export const focusBorderColor = primaryColor;
export const sortActionColor = "#BFBFBF";
export const bluePlus = "#3d3d3d";
export const yellowColor = "#FCAF17";
export const labelColor = "#737373";

//
export const borderRadius = "2px";

//font
export const headingFontWeight = 600;
export const bodyFontSize = "14px";

/**
 * darken hoặc lighten màu: darken -0.2, lighten +
 * https://www.sitepoint.com/javascript-generate-lighter-darker-color/
 */
export const colorLuminance = (hex: string, lum: number): string => {
  // validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, "");
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  lum = lum || 0;

  // convert to decimal and change luminosity
  let rgb = "#";
  let c;
  let i;
  for (i = 0; i < 3; i += 1) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
    rgb += `00${c}`.substr(c.length);
  }

  return rgb;
};
