import { RightOutlined } from "@ant-design/icons";
import classnames from "classnames";
import { uniqBy } from "lodash";
import queryString from "query-string";
import { Link } from "react-router-dom";
import { nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { kdOffHaveNotChildren, kdOnHaveNotChildren } from "../constant/kd-have-not-children";
import { COLUMN_ORDER_LIST } from "../constant/kd-report-response-key";

interface IColumnLink {
  groupLv: string;
  groupLvName: string;
  queryParams: any;
}

export const setTableHorizontalColumns = (
  data: any,
  setObjectiveColumns: any,
  currentDrillingLevel: number,
  link: IColumnLink,
): any[] => {
  const { groupLv, groupLvName, queryParams } = link;
  const columns: any[] = [];
  const keyDriverIndex = COLUMN_ORDER_LIST.indexOf("key_driver");
  const keyDriverTitleIndex = COLUMN_ORDER_LIST.indexOf("key_driver_title");
  const departmentLv1Index = COLUMN_ORDER_LIST.indexOf(`department_lv1`);
  let kdParentIndex = COLUMN_ORDER_LIST.indexOf(`key_driver_group_lv2`);
  let currentGroupLv = 2;
  let nextGroupLv = 2;
  let currentGroupLvName = "";
  if (groupLv) {
    currentGroupLv = +groupLv;
    nextGroupLv = +groupLv + 1;
    currentGroupLvName = groupLvName;
    kdParentIndex = COLUMN_ORDER_LIST.indexOf(`key_driver_group_lv${currentGroupLv}`);
  }
  let keyDriverUpLevel = "";
  let allKeyDriverByGroupLevel = [];
  if (!groupLv) {
    allKeyDriverByGroupLevel = uniqBy(
      data
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
              item[keyDriverIndex].includes("ON.SP.01.") ||
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
      data
        .filter((item: any, index: number) => {
          return (
            item[kdParentIndex] === currentGroupLvName &&
            (!item[kdParentIndex + 1] ||
              typeof item[kdParentIndex + 1] !== "string" ||
              (typeof item[kdParentIndex + 1] === "string" &&
                item[kdParentIndex + 1].includes(item[keyDriverTitleIndex])))
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

  allKeyDriverByGroupLevel.forEach((item: any, index: number) => {
    const { keyDriver, children, parent, keyDriverCode } = item;
    const navigateTo = `?${queryString.stringify({
      ...queryParams,
      groupLv2: queryParams.groupLv2 || parent,
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
        parentHeader.children.push(
          setObjectiveColumns(
            nonAccentVietnameseKD(keyDriverChild),
            keyDriverChild,
            index,
            1,
            "key-driver-header",
            "",
          ),
        );
      });
      columns.push(parentHeader);
    } else {
      columns.push(
        setObjectiveColumns(
          nonAccentVietnameseKD(keyDriver),
          keyDriver,
          index,
          1,
          "key-driver-header",
          [...kdOffHaveNotChildren, ...kdOnHaveNotChildren].includes(keyDriverCode)
            ? ""
            : navigateTo,
        ),
      );
    }
  });
  return columns;
};
