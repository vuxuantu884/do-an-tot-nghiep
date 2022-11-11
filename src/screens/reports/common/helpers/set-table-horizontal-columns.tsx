import classnames from "classnames";
import { uniqBy } from "lodash";
import { nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { COLUMN_ORDER_LIST } from "../constant/kd-report-response-key";

export const setTableHorizontalColumns = (
  data: any,
  setObjectiveColumns: any,
  groupLevel: string,
  currentDrillingLevel: number,
): any[] => {
  const columns: any[] = [];
  const keyDriverIndex = COLUMN_ORDER_LIST.indexOf("key_driver");
  const keyDriverTitleIndex = COLUMN_ORDER_LIST.indexOf("key_driver_title");
  const departmentLv1Index = COLUMN_ORDER_LIST.indexOf(`department_lv1`);
  const kdParentIndex = COLUMN_ORDER_LIST.indexOf(`key_driver_group_lv2`);
  let keyDriverUpLevel = "";
  const allKeyDriverByGroupLevel = uniqBy(
    data
      .filter((item: any, index: number) => {
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
            item[departmentLv1Index] &&
            !item[keyDriverIndex].endsWith(".L")
          );
        }
        return item;
      })
      .map((item: any) => {
        return { keyDriver: item[keyDriverTitleIndex], parent: item[kdParentIndex] };
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
          children: [item],
        });
      } else {
        res[existedParentIdx].children.push(item);
      }
    }
    return res;
  }, []);
  allKeyDriverByGroupLevel.forEach((item: any, index: number) => {
    const { keyDriver, children } = item;
    if (children?.length) {
      const parentHeader = {
        title: keyDriver,
        className: classnames("key-driver-header"),
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
          "",
        ),
      );
    }
  });
  return columns;
};
