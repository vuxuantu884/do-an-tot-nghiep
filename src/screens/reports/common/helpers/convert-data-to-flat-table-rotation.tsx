import { uniq } from "lodash";
import { AnalyticResult } from "model/report";
import { nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { ATTRIBUTE_VALUE, COLUMN_ORDER_LIST } from "../constant/kd-report-response-key";

export const convertDataToFlatTableRotation = (
  analyticResult: any,
  currentDrillingLevel: number,
  groupLevel?: string,
) => {
  const keyDriverResult = analyticResult.result as AnalyticResult;
  const attributeOrdered = COLUMN_ORDER_LIST;
  const keyDriverDescriptionDataIndex = attributeOrdered.indexOf("key_driver_description");
  const keyDriverIndex = attributeOrdered.indexOf("key_driver");
  const keyDriverTitleIndex = attributeOrdered.indexOf("key_driver_title");
  const drillingLevelDataIndex = attributeOrdered.indexOf("drilling_level");
  const departmentLv1Index = attributeOrdered.indexOf(`department_lv1`);
  const kdParentIndex = attributeOrdered.indexOf(`key_driver_group_lv2`);

  let data: any[] = [];
  let keyDriverUpLevel = "";
  keyDriverResult.data
    .filter((item, index) => {
      if (!groupLevel) {
        switch (currentDrillingLevel) {
          case 1:
            keyDriverUpLevel = "OF.HS.01.01";
            break;
          case 2:
            keyDriverUpLevel = "OF.HS.01.61";
            break;
          default:
            break;
        }

        return (
          (item[kdParentIndex] === item[keyDriverTitleIndex] ||
            item[keyDriverIndex].includes("OF.SP.01.") ||
            item[keyDriverIndex].includes("ON.SP.01.") ||
            (keyDriverUpLevel && item[keyDriverIndex] === keyDriverUpLevel)) &&
          item[departmentLv1Index]
        );
      }
      return item;
    })
    .forEach((row: Array<string>) => {
      const keyDriver = nonAccentVietnameseKD(row[keyDriverTitleIndex]);
      const drillingLevel = Number(row[drillingLevelDataIndex]);
      const departmentLevelIndex = attributeOrdered.indexOf(`department_lv${drillingLevel}`);
      const department = nonAccentVietnameseKD(row[departmentLevelIndex]);

      const objValue = {} as any;

      ATTRIBUTE_VALUE.forEach((attr) => {
        objValue[nonAccentVietnameseKD(keyDriver) + "_" + attr] =
          row[attributeOrdered.indexOf(attr)];
      });

      const otherValue = {} as any;
      attributeOrdered.forEach((attr) => {
        otherValue[nonAccentVietnameseKD(department) + "_" + attr] =
          row[attributeOrdered.indexOf(attr)];
        otherValue[attr] = row[attributeOrdered.indexOf(attr)];
      });

      const existedKey = data.findIndex(
        (item) =>
          item.title && item.title.toUpperCase() === row[departmentLevelIndex].toUpperCase(),
      );
      if (existedKey === -1) {
        if (row[departmentLevelIndex]) {
          data.push({
            [`${keyDriver}_key`]: row[keyDriverIndex],
            title: row[departmentLevelIndex],
            drillingLevel,
            [`${keyDriver}_method`]: row[keyDriverDescriptionDataIndex],
            ...objValue,
            ...otherValue,
          });
        }
      } else {
        data[existedKey] = {
          ...data[existedKey],
          ...objValue,
          ...otherValue,
          [`${keyDriver}_key`]: row[keyDriverIndex],
          [`${keyDriver}_method`]: row[keyDriverDescriptionDataIndex],
        };
      }
    });
  if (currentDrillingLevel === 2) {
    // console.log("data data data", data);
    let objDailyActual: any = {};
    let propertyArrDailyActual: string[] = [];
    for (const property in data[0]) {
      if (property.includes("_daily_actual")) {
        propertyArrDailyActual.push(property);
      }
    }
    propertyArrDailyActual.forEach((ppt) => {
      const arrValue = data.map((item, index) => {
        return item[ppt];
      });
      objDailyActual[ppt] = arrValue.sort((a: number, b: number) => b - a);
    });
    // console.log("objDailyActual", objDailyActual);

    propertyArrDailyActual.forEach((ppt) => {
      data = data.map((item, index) => {
        let color = "";
        const valueArr: any[] = objDailyActual[ppt];
        // return item[ppt] ? (!objDailyActual[ppt][3] ? "" : (item[ppt] >= valueArr[3] ? "green" : "")) : "red",
        if (item[ppt]) {
          if (valueArr[2]) {
            if (item[ppt] >= valueArr[2]) {
              color = "background-green";
            }
          } else {
            color = "background-green";
          }
          if (valueArr[valueArr.length - 3]) {
            if (item[ppt] <= valueArr[valueArr.length - 3]) {
              color = "background-red";
            }
          }
        } else {
          color = valueArr[valueArr.length - 3] && valueArr[2] ? "background-red" : "";
        }
        return {
          ...item,
          [`${ppt}_color`]: color,
        };
      });
    });
  }
  return buildSchemas(data);
};

const buildSchemas = (data: any[]) => {
  const drillingLevels = uniq(data.map((item) => item.drillingLevel)).sort();
  let schemas: any[] = [];
  drillingLevels.forEach((_, index) => {
    if (!schemas.length) {
      const dataParent = data.find((item) => item.drillingLevel === drillingLevels[index]);
      schemas.push({ ...dataParent, blockAction: true });
    } else {
      const dataChildren = data.filter((item) => item.drillingLevel === drillingLevels[index]);
      schemas[0].children = dataChildren;
    }
  });
  return schemas;
};
