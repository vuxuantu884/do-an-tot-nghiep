export const shiftCustomColor = {
  darkCharcoal: "#262626",
  darkGrey: "#595959",
  blueViolet: "#8080DA",
  yellowGold: "#FAAD14",
  deepPurple: "#5858b6",
  darkBlue: "#2A2A86",
  limeGreen: "#52C41A",
  lavenderMist: "#F0F0FE",
};

export enum EnumSelectedFilter {
  calendar = "calendar",
  user = "user",
}

export const WORK_SHIFT_LIST = () => {
  let workShiftList = [];
  for (let i = 1; i <= 14; i++) {
    workShiftList.push({
      name: `Ca ${i}`,
      value: i,
    });
  }
};
