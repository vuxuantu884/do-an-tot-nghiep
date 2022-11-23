export const numberOfStoreStaffKD = [
  "OF.HS.01.03",
  "OF.HS.01.06",
  "OF.HS.01.09",
  "OF.HS.01.12",
  "OF.HS.01.15",
  "OF.HS.01.18",
  "OF.HS.01.21",
  "OF.HS.01.24",
  "OF.HS.01.27",
  "OF.HS.01.30",
  "OF.HS.01.33",
  "OF.HS.01.36",
  "OF.HS.01.39",
  "OF.HS.01.42",
  "OF.HS.01.45",
  "OF.HS.01.48",
  "OF.HS.01.51",
  "OF.HS.01.54",
  "OF.HS.01.57",
  "OF.HS.01.60",
  "OF.HS.01.63",
  "OF.HS.01.66",
  "OF.HS.01.69",
  "OF.HS.01.72",
  "OF.HS.01.75",
  "OF.HS.01.78",
];

export const npsKD = ["OF.NS.01.01", "OF.NS.01.02", "OF.NS.01.03", "OF.NS.01.04"];

const followFanpageKD = "OF.DT.FB.02";

export const showDashOnMonthlyTargetKD = [...numberOfStoreStaffKD];
export const showDashOnDailyTargetKD = [
  followFanpageKD,
  ...numberOfStoreStaffKD,
  ...npsKD,
  "OF.DT.S1.04",
  "OF.DT.S1.05",
  "OF.DT.BL.04",
  "OF.DT.BL.05",
  "OF.DT.BL.07",
];
export const showDashOnMonthlyForecastedKD = [followFanpageKD, ...npsKD];
export const showDashOnMonthlyForecastedProgressKD = [followFanpageKD, ...npsKD];
export const showDashOnDailyActualKD = [followFanpageKD, ...npsKD];
