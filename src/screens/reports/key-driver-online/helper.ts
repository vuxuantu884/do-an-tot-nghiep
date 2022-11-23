import { uniqBy } from "lodash";
import { KeyboardKey } from "model/other/keyboard/keyboard.model";
import {
  AnalyticColumns,
  AnalyticDataQuery,
  AnalyticResult,
  ArrayAny,
  KeyDriverDataSourceType,
  KeyDriverOnlineParams,
} from "model/report";
import moment from "moment";
import { Dispatch } from "redux";
import {
  actualDayUpdateApi,
  getKeyDriverOnlineApi,
  onlineCounterService,
} from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { ATTRIBUTE_VALUE } from "../common/constant/kd-report-response-key";
// import { parseLocaleNumber } from "utils/AppUtils";

export async function fetchQuery(params: KeyDriverOnlineParams, dispatch: Dispatch<any>) {
  const response: AnalyticDataQuery = await callApiNative(
    { notifyAction: "SHOW_ALL" },
    dispatch,
    getKeyDriverOnlineApi,
    params,
  );
  return response;
}

export const convertDataToFlatTableKeyDriver = (
  analyticResult: any,
  attributeOrdered: string[],
) => {
  const keyDriverResult = analyticResult.result as AnalyticResult;
  const keyDriverData = analyticResult.key_drivers as AnalyticResult;

  const targetDrillingLevelIndex = keyDriverData.columns.findIndex(
    (item: AnalyticColumns) => item.field === "target_drilling_level",
  );
  const keyDriverIndex = keyDriverData.columns.findIndex(
    (item: AnalyticColumns) => item.field === "key_driver",
  );

  const keyDriverDataIndex = attributeOrdered.indexOf("key_driver");
  const keyDriverTitleDataIndex = attributeOrdered.indexOf("key_driver_title");
  const keyDriverDescriptionDataIndex = attributeOrdered.indexOf("key_driver_description");
  const drillingLevelDataIndex = attributeOrdered.indexOf("drilling_level");

  const data: KeyDriverDataSourceType[] = [];

  let keyDriver = "";
  keyDriverResult.data.forEach((row: Array<string>) => {
    const currentKeyDriver = row[keyDriverDataIndex];

    const drillingLevel = Number(row[drillingLevelDataIndex]);
    const departmentLevelIndex = attributeOrdered.indexOf(`department_lv${drillingLevel}`);

    const department = nonAccentVietnameseKD(row[departmentLevelIndex]);
    const objValue = {} as any;

    ATTRIBUTE_VALUE.forEach((attr) => {
      objValue[nonAccentVietnameseKD(department) + "_" + attr] =
        row[attributeOrdered.indexOf(attr)];
    });

    const otherValue = {} as any;
    attributeOrdered.forEach((attr) => {
      otherValue[nonAccentVietnameseKD(department) + "_" + attr] =
        row[attributeOrdered.indexOf(attr)];
      otherValue[attr] = row[attributeOrdered.indexOf(attr)];
    });

    if (currentKeyDriver !== keyDriver) {
      keyDriver = currentKeyDriver;
      const targetDrillingLevel = keyDriverData.data.find((item: Array<any>) => {
        return item[keyDriverIndex] === keyDriver;
      });
      const currentTargetDrillingValue =
        targetDrillingLevel && targetDrillingLevel?.length > 0
          ? targetDrillingLevel[targetDrillingLevelIndex]
          : null;
      data.push({
        key: keyDriver,
        key_driver: keyDriver,
        title: row[keyDriverTitleDataIndex],
        method: row[keyDriverDescriptionDataIndex],
        target_drilling_level: currentTargetDrillingValue,
        ...objValue,
        ...otherValue,
      });
    } else {
      const lastItem = data[data.length - 1];

      const newRow = {
        ...lastItem,
        ...objValue,
        ...otherValue,
      };
      data[data.length - 1] = newRow;
    }
  });
  return buildSchemas(data);
};

const sliceGroups = (schema: any) => {
  const {
    key_driver_group_lv1,
    key_driver_group_lv2,
    key_driver_group_lv3,
    key_driver_group_lv4,
    key_driver_group_lv5,
  } = schema;
  const groups = [
    key_driver_group_lv1,
    key_driver_group_lv2,
    key_driver_group_lv3,
    key_driver_group_lv4,
    key_driver_group_lv5,
  ];
  return groups.filter((_group) => !!_group);
};

const findParent: any = (groups: any, prev_schema: any) => {
  if (!groups || !prev_schema) {
    return {
      _parent: null,
      _grouped: true,
    };
  }
  const prev_groups = sliceGroups(prev_schema);
  // TODO update comparation
  if (JSON.stringify(groups) === JSON.stringify(prev_groups)) {
    const { _parent, _grouped } = prev_schema;
    if (_grouped) {
      return {
        _parent: prev_schema,
        _grouped: false,
      };
    }
    return {
      _parent,
      _grouped: false,
    };
  }
  if (groups.length > prev_groups.length) {
    const next_groups = groups.slice(0, -1);
    const { _parent } = findParent(next_groups, prev_schema);
    return { _parent, _grouped: true };
  }
  const { _parent } = findParent(groups, prev_schema._parent);
  return { _parent, _grouped: true };
};
// code by TO, ý kiến qua TO mà hỏi :))
const buildSchemas = (_input: any) => {
  const _schemas = _input.reduce(
    (schemas: any, current_value: any, current_index: any, arr: any) => {
      const schema = current_value;
      const groups = sliceGroups(schema);
      const prev_schema = current_index > 0 ? schemas[current_index - 1] : null;
      const parent = findParent(groups, prev_schema);
      return [
        ...schemas,
        {
          ...schema,
          ...parent,
          parent_key_driver:
            parent && parent._parent && parent._parent.key_driver
              ? parent._parent.key_driver
              : null,
        },
      ];
    },
    [],
  );
  _schemas.forEach((_schema: any) => {
    delete _schema["_parent"];
    delete _schema["_grouped"];
  });
  const treeData: any = (arr: any[], key_driver = null) =>
    arr
      .filter((item) => item.parent_key_driver === key_driver)
      .map((child) => ({ ...child, children: treeData(arr, child.key_driver) }));
  const finalData = removeChildrentEmpty(treeData(_schemas));
  return finalData;
};

function removeChildrentEmpty(arrTreeLayers: any[]) {
  const removeChildrent = arrTreeLayers.map((item) => {
    if (item.children.length === 0) {
      delete item.children;
    } else {
      removeChildrentEmpty(item.children);
    }
    return item;
  });
  return removeChildrent;
}

export const getAllDepartmentByAnalyticResult = (
  analyticResultData: Array<ArrayAny>,
  attributeOrdered: string[],
) => {
  const drillingLevelIndex = attributeOrdered.indexOf("drilling_level");

  const departments = analyticResultData
    .sort((a, b) => a[drillingLevelIndex] - b[drillingLevelIndex])
    .map((row: Array<string>) => {
      const drillingLevel = Number(row[drillingLevelIndex]);
      const departmentLevelIndex = attributeOrdered.indexOf(`department_lv${drillingLevel}`);
      return {
        groupedBy: row[departmentLevelIndex].toUpperCase(),
        drillingLevel: drillingLevel,
      };
    });
  return uniqBy(departments, "groupedBy").filter((department) => department.groupedBy);
};

export async function saveMonthTargetKeyDriver(
  value: { [key: string]: number },
  row: KeyDriverDataSourceType,
  columnDrillingLevel: number,
  columnKey: string,
  inputId: string,
  dispatch: Dispatch<any>,
  currentValue: any,
  key: string,
) {
  const departmentLevel: any = {
    department_lv1: "",
    department_lv2: "",
    department_lv3: "",
  };

  if (columnDrillingLevel > 0) {
    for (let i = 1; i <= columnDrillingLevel; i++) {
      departmentLevel[`department_lv${i}`] = row[`${columnKey}_department_lv${i}`] || "";
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
  console.log("response[key]", response[key]);
  // if (response && response[key]) {
  if (response) {
    showSuccess("Lưu thành công");
    // const input: any = document.getElementById(inputId);
    // input.value = parseLocaleNumber(response[key]);
  } else {
    showError("Lưu không thành công");
    const input: any = document.getElementById(inputId);
    input.value = currentValue;
  }
}

export async function saveActualDay(
  department_lv1: string,
  department_lv2: string,
  department_lv3: string,
  department_lv4: string,
  driver_key: string,
  value: number,
  dispatch: Dispatch<any>,
) {
  const params = {
    department_lv1,
    department_lv2,
    department_lv3,
    // department_lv4,
    driver_key,
    value_a: value,
    account_code: "",
    account_name: "",
    account_role: "",
  };
  console.log("params", params);
  if (params.department_lv1 && params.department_lv2 && params.department_lv3) {
    try {
      const response = await callApiNative(
        { notifyAction: "SHOW_ALL" },
        dispatch,
        actualDayUpdateApi,
        params,
      );
      if (response) showSuccess("Lưu thành công");
    } catch {
      showError("Lưu không thành công");
    }
  } else {
    showError("Chỉ số thực đạt được nhập phải từ shop");
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

export const getInputTargetId = (row: number, column: number, prefix: string) => {
  return `${prefix}_row_${row}_column_${column}`;
};
