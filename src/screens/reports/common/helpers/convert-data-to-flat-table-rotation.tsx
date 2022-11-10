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

  const data: any[] = [];
  let keyDriverUpLevel = "";
  keyDriverResult.data
    .filter((item, index) => {
      if (!groupLevel) {
        const kdParentIndex = attributeOrdered.indexOf(`key_driver_group_lv2`);
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
        (item) => item.title && item.title === row[departmentLevelIndex],
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
