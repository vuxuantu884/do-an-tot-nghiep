import { RightOutlined } from "@ant-design/icons";
import classnames from "classnames";
import { uniqBy } from "lodash";
import { Link } from "react-router-dom";
import { nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { showWarning } from "utils/ToastUtils";
import { kdOffHaveChildren, kdOnHaveChildren } from "../constant/kd-have-children";
import { COLUMN_ORDER_LIST } from "../constant/kd-report-response-key";
import { filterKDOfflineHorizontalByDim } from "./filter-kd-by-dim";
import { KDTableHeader } from "./set-objective-columns";

interface IColumnLink {
  groupLv: string;
  groupLvName: string;
  queryParams: any;
  queryString: any;
  history: any;
  dispatch: any;
}

export const getAllKeyDriverByGroupLevel = (
  data: any,
  currentDrillingLevel: number,
  link: IColumnLink,
) => {
  const { groupLv, groupLvName } = link;
  const keyDriverIndex = COLUMN_ORDER_LIST.indexOf("key_driver");
  const keyDriverTitleIndex = COLUMN_ORDER_LIST.indexOf("key_driver_title");
  const departmentLv1Index = COLUMN_ORDER_LIST.indexOf(`department_lv1`);
  let kdParentIndex = COLUMN_ORDER_LIST.indexOf(`key_driver_group_lv2`);
  let allKeyDriverByGroupLevel = [];
  const filterData = filterKDOfflineHorizontalByDim(currentDrillingLevel, data);
  let currentGroupLv = 2;
  let keyDriverUpLevel = "";
  let currentGroupLvName = "";
  if (groupLv) {
    currentGroupLv = +groupLv;
    currentGroupLvName = groupLvName;
    kdParentIndex = COLUMN_ORDER_LIST.indexOf(`key_driver_group_lv${currentGroupLv}`);
  }
  if (!groupLv) {
    allKeyDriverByGroupLevel = uniqBy(
      filterData
        .filter((item: any, index: number) => {
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
              (keyDriverUpLevel && item[keyDriverIndex] === keyDriverUpLevel)) &&
            item[departmentLv1Index] &&
            !item[keyDriverIndex].endsWith(".L")
          );
        })
        .map((item: any) => {
          return {
            keyDriver: item[keyDriverTitleIndex],
            keyDriverCode: item[keyDriverIndex],
            parent: item[kdParentIndex],
          };
        }),
      "keyDriver",
    ).reduce((res: any[], item: any) => {
      const { keyDriver, parent } = item;
      if (keyDriver === parent) {
        res = [...res, item];
      } else {
        const existedParentIdx = res.findIndex((item) => item.keyDriver === parent);
        if (existedParentIdx === -1) {
          res.push({
            keyDriver: parent,
            parent,
            children: [item],
          });
        } else {
          res[existedParentIdx].children.push(item);
        }
      }
      return res;
    }, []);
  } else {
    allKeyDriverByGroupLevel = uniqBy(
      filterData
        .filter((item: any, index: number) => {
          return (
            item[kdParentIndex] === currentGroupLvName &&
            (!item[kdParentIndex + 1] ||
              typeof item[kdParentIndex + 1] !== "string" ||
              (typeof item[kdParentIndex + 1] === "string" &&
                item[kdParentIndex + 1].includes(item[keyDriverTitleIndex]))) &&
            item[departmentLv1Index] &&
            !item[keyDriverIndex].endsWith(".L")
          );
        })
        .map((item: any) => {
          return {
            keyDriver: item[keyDriverTitleIndex],
            keyDriverCode: item[keyDriverIndex],
            parent: item[kdParentIndex],
          };
        }),
      "keyDriver",
    );
  }
  return allKeyDriverByGroupLevel;
};

export const setTableHorizontalColumns = (
  allKeyDriverByGroupLevel: any[],
  setObjectiveColumns: (
    kdTableHeader: KDTableHeader,
    queryString: any,
    history: any,
    dispatch: any,
  ) => void,
  link: IColumnLink,
): any[] => {
  const { groupLv, groupLvName, queryParams, queryString, history, dispatch } = link;
  const columns: any[] = [];
  let nextGroupLv = 2;
  let currentGroupLvName = "";
  if (groupLv) {
    nextGroupLv = +groupLv + 1;
    currentGroupLvName = groupLvName;
  }

  if (!allKeyDriverByGroupLevel.length && groupLvName !== undefined) {
    showWarning(`Chỉ số ${groupLvName} không có ở chiều view hiện tại`);
    return [];
  }

  allKeyDriverByGroupLevel.forEach((item: any, index: number) => {
    const { keyDriver, children, parent, keyDriverCode } = item;
    const navigateTo = `?${queryString.stringify({
      ...queryParams,
      groupLv2: queryParams.groupLv2 || parent,
      [`groupLv${nextGroupLv}`]: queryParams.groupLv2 !== keyDriver ? keyDriver : "",
      groupLv: nextGroupLv,
      groupLvName: keyDriver,
    })}`;
    if (children?.length) {
      const parentHeader = {
        title: (
          <Link to={navigateTo}>
            <span>{keyDriver}</span> <RightOutlined />
          </Link>
        ),
        className: classnames("department-name key-driver-header"),
        children: [] as any[],
      };
      children.forEach((child: any) => {
        const { keyDriver: keyDriverChild } = child;
        const kdTableHeader: KDTableHeader = {
          departmentKey: nonAccentVietnameseKD(keyDriverChild),
          department: keyDriverChild,
          columnIndex: index,
          departmentDrillingLevel: 1,
          className: "key-driver-header",
          link: "",
        };
        parentHeader.children.push(
          setObjectiveColumns(kdTableHeader, queryString, history, dispatch),
        );
      });
      columns.push(parentHeader);
    } else {
      const kdTableHeader: KDTableHeader = {
        departmentKey: nonAccentVietnameseKD(keyDriver),
        department: keyDriver,
        columnIndex: index,
        departmentDrillingLevel: 1,
        className: "key-driver-header",
        link:
          [...kdOffHaveChildren, ...kdOnHaveChildren].includes(keyDriverCode) &&
          keyDriver !== currentGroupLvName
            ? navigateTo
            : "",
      };
      columns.push(setObjectiveColumns(kdTableHeader, queryString, history, dispatch));
    }
  });
  return columns;
};
