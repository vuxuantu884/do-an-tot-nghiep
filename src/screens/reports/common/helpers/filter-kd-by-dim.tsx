import { COLUMN_ORDER_LIST } from "../constant/kd-report-response-key";

const filterKDOffline = (currentDrillingLevel: number, data: any[], kdKey: string | number) => {
  let filterData: any[] = data;
  switch (currentDrillingLevel) {
    case 3:
      filterData = data.filter((item) => {
        return (
          !item[kdKey].includes("OF.DT.FB.02") &&
          !item[kdKey].includes("OF.LN.") &&
          !item[kdKey].includes("OF.NS.") &&
          !item[kdKey].includes("OF.HS.") &&
          !item[kdKey].includes("OF.DT.KH.")
        );
      });
      break;
    case 2:
      const storePerformanceKeys: string[] = [];
      for (let i = 0; i <= 60; ++i) {
        storePerformanceKeys.push(`OF.HS.01.${i.toString().padStart(2, "0")}`);
      }
      for (let i = 4; i <= 12; ++i) {
        storePerformanceKeys.push(`OF.DT.KH.M${i.toString().padStart(2, "0")}`);
      }
      filterData = data.filter((item) => {
        return !storePerformanceKeys.includes(item[kdKey]);
      });
      return filterData;
    default:
      break;
  }
  return filterData;
};

export const filterKDOfflineByDim = (currentDrillingLevel: number, data: any[]) => {
  return filterKDOffline(currentDrillingLevel, data, "key");
};

export const filterKDOfflineHorizontalByDim = (currentDrillingLevel: number, data: any[]) => {
  const keyDriverIndex = COLUMN_ORDER_LIST.indexOf("key_driver");
  return filterKDOffline(currentDrillingLevel, data, keyDriverIndex);
};
