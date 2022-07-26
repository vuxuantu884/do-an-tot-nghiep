import { uniq, uniqBy } from "lodash";
import {
  AnalyticDataQuery,
  AnalyticResult,
  ArrayAny,
  KeyDriverOnlineDataSourceType,
  MonthlyCounterParams,
} from "model/report";
import moment from "moment";
import { Dispatch } from "redux";
import {
  executeAnalyticsQueryService,
  onlineCounterService,
} from "service/report/analytics.service";
import { callApiNative } from "utils/ApiUtils";
import { nonAccentVietnamese } from "utils/PromotionUtils";
import { showError, showSuccess } from "utils/ToastUtils";

export const DRILLING_LEVEL = {
  COMPANY: 1,
  DEPARTMENT: 2,
  SHOP: 3,
  ACCOUNT: 4,
};

export const LEVEL_1_2_TEMPLATE_QUERY = `
SHOW monthly_target, monthly_actual, monthly_progress, monthly_forecasted, daily_target, daily_actual, daily_progress BY key_driver_position,key_driver, key_driver_title, key_driver_description, key_driver_group_lv2, key_driver_group_lv3, key_driver_group_lv4, drilling_level, department_lv1, department_lv2 
FROM key_drivers 
WHERE key_driver_group_lv1 == "Kinh doanh Online"  AND drilling_level IN (1,2) SINCE today UNTIL today ORDER BY key_driver_position ASC
`;
export const getTemplateQueryLevel2and3 = (department: string) => {
  return `SHOW monthly_target, monthly_actual, monthly_progress, monthly_forecasted, daily_target, daily_actual, daily_progress 
  BY key_driver_position, key_driver, key_driver_title, key_driver_description, key_driver_group_lv2, key_driver_group_lv3, key_driver_group_lv4, drilling_level, department_lv1, department_lv2, department_lv3 
  FROM key_drivers WHERE key_driver_group_lv1 == "Kinh doanh Online" 
  AND department_lv2 == "${department}" AND drilling_level IN (2,3) SINCE today UNTIL today ORDER BY key_driver_position ASC`;
};

export const getTemplateQueryLevel3and4 = (shop: string) => {
  return `SHOW monthly_target, monthly_actual, monthly_progress, monthly_forecasted, daily_target, daily_actual, daily_progress 
  BY key_driver_position, key_driver, key_driver_title, key_driver_description, key_driver_group_lv2, key_driver_group_lv3, key_driver_group_lv4, drilling_level, department_lv1, department_lv2, department_lv3, department_lv4, account_code, account_name, account_role 
  FROM key_drivers 
  WHERE key_driver_group_lv1 == "Kinh doanh Online" 
  AND department_lv3 == "${shop}" AND drilling_level IN (3,4) SINCE today UNTIL today ORDER BY key_driver_position ASC`;
};

const ATTRIBUTE_VALUE = [
  "monthly_target",
  "monthly_actual",
  "monthly_progress",
  "monthly_forecasted",
  "daily_target",
  "daily_actual",
  "daily_progress",
];

const ATTRIBUTE_TITLE = [
  "key_driver_position",
  "key_driver",
  "key_driver_title",
  "key_driver_description",
  "key_driver_group_lv2",
  "key_driver_group_lv3",
  "key_driver_group_lv4",
  "drilling_level",
];

export const ATTRIBUTE_ORDER_LV_1 = [
  ...ATTRIBUTE_TITLE,
  "department_lv1",
  "department_lv2",
  ...ATTRIBUTE_VALUE,
];

export const ATTRIBUTE_ORDER_LV_2 = [
  ...ATTRIBUTE_TITLE,
  "department_lv1",
  "department_lv2",
  "department_lv3",
  ...ATTRIBUTE_VALUE,
];

export const ATTRIBUTE_ORDER_LV_3 = [
  ...ATTRIBUTE_TITLE,
  "department_lv1",
  "department_lv2",
  "department_lv3",
  "department_lv4",
  "account_code",
  "account_name",
  "account_role",
  ...ATTRIBUTE_VALUE,
];

export async function fetchQuery(query: string, dispatch: Dispatch<any>) {
  const response: AnalyticDataQuery = await callApiNative(
    { notifyAction: "SHOW_ALL" },
    dispatch,
    executeAnalyticsQueryService,
    { q: query },
  );
  return response;
}

// function convertRawDataToKeyDriverLevel1And2(
//   analyticResult: AnalyticResult,
//   lastDrillingNames: string[],
//   attributeOrdered: string[],
// ): KeyDriverOnlineDataSourceType[] {
//   // TODO: convert raw data to key driver table
//   const groupLv2Index = attributeOrdered.indexOf("key_driver_group_lv2");
//   const groupLv3Index = attributeOrdered.indexOf("key_driver_group_lv3");
//   const keyTitleIndex = attributeOrdered.indexOf("key_driver_title");
//   const keyDescriptionIndex = attributeOrdered.indexOf(
//     "key_driver_description",
//   );

//   const data: KeyDriverOnlineDataSourceType[] = [];

//   let lv2Key = "";
//   let lv3Key = "";
//   let keyTitle = "";
//   let lastLv2Data: any;
//   let lastLv3Data: any;

//   analyticResult.data.forEach((row: Array<string>) => {
//     const department = nonAccentVietnamese(
//       lastDrillingNames.reduce((acc, curr) => {
//         const name = row[ATTRIBUTE_ORDER_LV_1_2.indexOf(curr)];
//         return acc + name;
//       }, ""),
//     );

//     const currentLv2Key = row[groupLv2Index];
//     const currentLv3Key = row[groupLv2Index] + row[groupLv3Index];
//     const objValue = {} as any;
//     ATTRIBUTE_VALUE.forEach((attr) => {
//       objValue[nonAccentVietnamese(department) + "_" + attr] =
//         row[ATTRIBUTE_ORDER_LV_1_2.indexOf(attr)];
//     });

//     if (lv2Key !== currentLv2Key) {
//       lv2Key = currentLv2Key;
//       lv3Key = "";
//       keyTitle = "";

//       lastLv2Data = {
//         key: row[groupLv2Index],
//         name: row[keyTitleIndex],
//         method: row[keyDescriptionIndex],
//         ...objValue,
//       };
//       data.push(lastLv2Data);
//     } else {
//       if (!lastLv2Data.children) {
//         lastLv2Data.children = [];
//       }
//       const currentLv3Data = lastLv2Data.children;

//       if (currentLv3Key !== lv3Key) {
//         lv3Key = currentLv3Key;
//         keyTitle = "";

//         lastLv3Data = {
//           key: row[groupLv3Index],
//           name: row[keyTitleIndex],
//           method: row[keyDescriptionIndex],
//           ...objValue,
//         };
//         currentLv3Data.push(lastLv3Data);
//       } else {
//         const currentKeyTitle =
//           row[groupLv2Index] + row[groupLv3Index] + row[keyTitleIndex];
//         if (currentKeyTitle !== keyTitle) {
//           keyTitle = currentKeyTitle;

//           if (!lastLv3Data.children) {
//             lastLv3Data.children = [];
//           }
//           const currentKeyData = lastLv3Data.children;
//           const lastKeyTitleData = {
//             key: row[keyTitleIndex],
//             name: row[keyTitleIndex],
//             method: row[keyDescriptionIndex],
//             ...objValue,
//           };
//           currentKeyData.push(lastKeyTitleData);
//         }
//       }
//     }
//   });

//   return data;
// }

export const convertDataToFlatTableKeyDriver = (
  analyticResult: AnalyticResult,
  lastDrillingNames: string[],
  attributeOrdered: string[],
) => {
  const keyDriverIndex = attributeOrdered.indexOf("key_driver");
  const keyDriverTitleIndex = attributeOrdered.indexOf("key_driver_title");
  const keyDriverDescriptionIndex = attributeOrdered.indexOf(
    "key_driver_description",
  );

  const data: KeyDriverOnlineDataSourceType[] = [];

  let keyDriver = "";
  analyticResult.data.forEach((row: Array<string>) => {
    const currentKeyDriver = row[keyDriverIndex];
    const department = nonAccentVietnamese(
      lastDrillingNames.reduce((acc, curr) => {
        const name = row[attributeOrdered.indexOf(curr)];
        return acc + name;
      }, ""),
    );
    const objValue = {} as any;

    ATTRIBUTE_VALUE.forEach((attr) => {
      objValue[nonAccentVietnamese(department) + "_" + attr] =
        row[attributeOrdered.indexOf(attr)];
    });

    const otherValue = {} as any;
    attributeOrdered.forEach((key) => {
      otherValue[key] = row[attributeOrdered.indexOf(key)];
    });

    if (currentKeyDriver !== keyDriver) {
      keyDriver = currentKeyDriver;
      // console.log("otherValue", otherValue);
      data.push({
        key: keyDriver,
        title: row[keyDriverTitleIndex],
        method: row[keyDriverDescriptionIndex],
        ...objValue,
        ...otherValue,
      });
    } else {
      data[data.length - 1] = {
        ...data[data.length - 1],
        ...objValue,
        ...otherValue,
      };
    }
  });
  return data;
};

export const getAllDepartmentByAnalyticResult = (
  analyticResultData: Array<ArrayAny>,
  lastDrillingNames: string[],
  attributeOrdered: string[],
) => {
  const drillingLevelIndex = attributeOrdered.indexOf("drilling_level");

  const departments = analyticResultData
    .sort((a, b) => a[drillingLevelIndex] - b[drillingLevelIndex])
    .map((row: Array<string>) => {
      return {
        name: lastDrillingNames
          .reduce((prev, cur) => {
            return prev + row[attributeOrdered.indexOf(cur)] + "-";
          }, "")
          .slice(0, -1)
          .toUpperCase(),
        drillingLevel: +row[drillingLevelIndex],
      };
    });
  return uniqBy(departments, "name");
};

export async function saveMonthTargetKeyDriver(
  value: { [key: string]: number },
  row: KeyDriverOnlineDataSourceType,
  dispatch: Dispatch<any>,
) {
  const params = {
    entity_name: "monthly_target",
    entity_key: row.key,
    year: moment().year(),
    month: moment().month() + 1,
    department_lv1: row.department_lv1,
    department_lv2: row.department_lv2,
    department_lv3: row.department_lv3,
    account_code: row.account_code || "",
    account_name: row.account_name || "",
    account_role: row.account_role || "",
    ...value,
  };

  const response = await callApiNative(
    { notifyAction: "SHOW_ALL" },
    dispatch,
    onlineCounterService,
    params,
  );
  if (response) {
    showSuccess("Lưu thành công");
  } else {
    showError("Lưu không thành công");
  }
}

export const handleFocusInput = (e: any) => {
  e.target.select();
};
