import { uniqBy } from "lodash";
import { KeyboardKey } from "model/other/keyboard/keyboard.model";
import {
  AnalyticDataQuery,
  AnalyticResult,
  ArrayAny,
  KeyDriverOnlineDataSourceType,
  KeyDriverOnlineParams,
} from "model/report";
import moment from "moment";
import { Dispatch } from "redux";
import { onlineCounterService } from "service/report/analytics.service";
import { getKeyDriverOnlineApi } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { nonAccentVietnamese } from "utils/PromotionUtils";
import { showError, showSuccess } from "utils/ToastUtils";

export const DRILLING_LEVEL = {
  COMPANY: 1,
  DEPARTMENT: 2,
  SHOP: 3,
  ACCOUNT: 4,
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
  "key_driver_group_lv1",
  "key_driver_group_lv2",
  "key_driver_group_lv3",
  "key_driver_group_lv4",
  "drilling_level",
];

export const COLUMN_ORDER_LIST = [
  ...ATTRIBUTE_TITLE,
  "department_lv1",
  "department_lv2",
  "department_lv3",
  "department_lv4",
  "account_code",
  "account_name",
  "account_role",
  "target_drilling_level",
  "calculation",
  ...ATTRIBUTE_VALUE,
];

export async function fetchQuery(
  params: KeyDriverOnlineParams,
  dispatch: Dispatch<any>,
) {
  const response: AnalyticDataQuery = await callApiNative(
    { notifyAction: "SHOW_ALL" },
    dispatch,
    getKeyDriverOnlineApi,
    params,
  );
  return response;
}

export const convertDataToFlatTableKeyDriver = (
  analyticResult: AnalyticResult,
  attributeOrdered: string[],
) => {
  const keyDriverIndex = attributeOrdered.indexOf("key_driver");
  const keyDriverTitleIndex = attributeOrdered.indexOf("key_driver_title");
  const keyDriverDescriptionIndex = attributeOrdered.indexOf(
    "key_driver_description",
  );
  const drillingLevelIndex = attributeOrdered.indexOf("drilling_level");

  const data: KeyDriverOnlineDataSourceType[] = [];

  let keyDriver = "";
  analyticResult.data.forEach((row: Array<string>) => {
    const currentKeyDriver = row[keyDriverIndex];

    const drillingLevel = Number(row[drillingLevelIndex]);
    const departmentLevelIndex = attributeOrdered.indexOf(
      `department_lv${drillingLevel}`,
    );

    const department = nonAccentVietnamese(row[departmentLevelIndex]);
    const objValue = {} as any;

    ATTRIBUTE_VALUE.forEach((attr) => {
      objValue[nonAccentVietnamese(department) + "_" + attr] =
        row[attributeOrdered.indexOf(attr)];
    });

    const otherValue = {} as any;
    attributeOrdered.forEach((attr) => {
      otherValue[nonAccentVietnamese(department) + "_" + attr] =
        row[attributeOrdered.indexOf(attr)];
    });

    if (currentKeyDriver !== keyDriver) {
      keyDriver = currentKeyDriver;
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
  attributeOrdered: string[],
) => {
  const drillingLevelIndex = attributeOrdered.indexOf("drilling_level");

  const departments = analyticResultData
    .sort((a, b) => a[drillingLevelIndex] - b[drillingLevelIndex])
    .map((row: Array<string>) => {
      const drillingLevel = Number(row[drillingLevelIndex]);
      const departmentLevelIndex = attributeOrdered.indexOf(
        `department_lv${drillingLevel}`,
      );
      return {
        groupedBy: row[departmentLevelIndex].toUpperCase(),
        drillingLevel: drillingLevel,
      };
    });
  return uniqBy(departments, "groupedBy").filter(
    (department) => department.groupedBy,
  );
};

export async function saveMonthTargetKeyDriver(
  value: { [key: string]: number },
  row: KeyDriverOnlineDataSourceType,
  columnDrillingLevel: number,
  columnKey: string,
  dispatch: Dispatch<any>,
) {
  const departmentLevel: any = {
    department_lv1: "",
    department_lv2: "",
    department_lv3: "",
  };

  if (columnDrillingLevel > 0) {
    for (let i = 1; i <= columnDrillingLevel; i++) {
      departmentLevel[`department_lv${i}`] =
        row[`${columnKey}_department_lv${i}`] || "";
    }
  }

  const params = {
    entity_name: "monthly_target",
    entity_key: row.key,
    year: moment().year(),
    month: moment().month() + 1,
    account_code: row[`${columnKey}_account_code`] || "",
    account_name: row[`${columnKey}_account_name`] || "",
    account_role: row[`${columnKey}_account_role`] || "",
    ...departmentLevel,
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
  setTimeout(() => {
    e.target.select();
  }, 0);
  return false;
};

export const handleMoveFocusInput = (
  row: number,
  column: number,
  prefix: string,
  key: KeyboardKey | string,
) => {
  let nextRow = row;
  let nextColumn = column;
  switch (key) {
    case KeyboardKey.ArrowDown:
      nextRow += 1;
      break;
    case KeyboardKey.ArrowUp:
      nextRow -= 1;
      break;
    case KeyboardKey.ArrowLeft:
      nextColumn -= 1;
      break;
    case KeyboardKey.ArrowRight:
      nextColumn += 1;
      break;
    default:
      break;
  }
  const nextColumnId = getInputTargetId(nextRow, nextColumn, prefix);
  const nextColumnElement = document.getElementById(nextColumnId);
  nextColumnElement?.focus();
};

export const getInputTargetId = (
  row: number,
  column: number,
  prefix: string,
) => {
  return `${prefix}_row_${row}_column_${column}`;
};
