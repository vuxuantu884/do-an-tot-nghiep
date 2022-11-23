import { uniqBy } from "lodash";
import { AnalyticColumns, AnalyticResult, ArrayAny, KeyDriverDataSourceType } from "model/report";
import { nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { ATTRIBUTE_VALUE } from "../constant/kd-report-response-key";
import { KDReportName } from "../enums/kd-report-name";
import { filterKDOfflineByDim } from "./filter-kd-by-dim";

interface IKDReport {
  name: KDReportName;
  currentDrillingLevel?: number;
}

export const convertDataToFlatTableKeyDriver = (
  analyticResult: any,
  attributeOrdered: string[],
  kdReport?: IKDReport,
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
  let filterData = data;
  const { currentDrillingLevel, name: kdReportName } = kdReport || {};
  if (currentDrillingLevel && kdReportName === KDReportName.Offline) {
    filterData = filterKDOfflineByDim(currentDrillingLevel, data) || data;
  }
  return buildSchemas(filterData);
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
