import { COLUMN_ORDER_LIST } from "../constant/kd-report-response-key";

export const filterKDOfflineByDim = (currentDrillingLevel: number, data: any[]) => {
  let filterData: any[] = data;
  switch (currentDrillingLevel) {
    case 3:
      filterData = data.filter((item) => {
        return (
          !item.key.includes("OF.DT.FB.02") &&
          !item.key.includes("OF.LN.") &&
          !item.key.includes("OF.NS.") &&
          !item.key.includes("OF.HS.")
        );
      });
      break;
    case 2:
      const storePerformanceKeys: string[] = [];
      for (let i = 0; i <= 60; ++i) {
        storePerformanceKeys.push(`OF.HS.01.${i.toString().padStart(2, "0")}`);
      }
      filterData = data.filter((item) => {
        return !storePerformanceKeys.includes(item.key);
      });
      break;
  }
  return filterData;
};

export const filterKDOfflineHorizontalByDim = (currentDrillingLevel: number, data: any[]) => {
  const keyDriverIndex = COLUMN_ORDER_LIST.indexOf("key_driver");
  let filterData: any[] = data;
  switch (currentDrillingLevel) {
    case 3:
      filterData = data.filter((item) => {
        return (
          !item[keyDriverIndex].includes("OF.DT.FB.02") &&
          !item[keyDriverIndex].includes("OF.LN.") &&
          !item[keyDriverIndex].includes("OF.NS.") &&
          !item[keyDriverIndex].includes("OF.HS.")
        );
      });
      break;
    case 2:
      const storePerformanceKeys: string[] = [];
      for (let i = 0; i <= 60; ++i) {
        storePerformanceKeys.push(`OF.HS.01.${i.toString().padStart(2, "0")}`);
      }
      filterData = data.filter((item) => {
        return !storePerformanceKeys.includes(item[keyDriverIndex]);
      });
      return filterData;
    default:
      break;
  }
  return filterData;
};
