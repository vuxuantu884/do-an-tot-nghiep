import classnames from "classnames";
import { uniqBy } from "lodash";
import { nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { COLUMN_ORDER_LIST } from "../constant/kd-report-response-key";

export const setTableHorizontalColumns = (
  data: any,
  setObjectiveColumns: any,
  groupLevel: string,
): any[] => {
  const columns: any[] = [];
  const keyDriverTitleIndex = COLUMN_ORDER_LIST.indexOf("key_driver_title");
  const departmentLv1Index = COLUMN_ORDER_LIST.indexOf(`department_lv1`);
  const allKeyDriverByGroupLevel = uniqBy(
    data
      .filter((item: any) => {
        if (!groupLevel) {
          const kdParentIndex = COLUMN_ORDER_LIST.indexOf(`key_driver_group_lv2`);
          return (
            (item[kdParentIndex] === item[keyDriverTitleIndex] ||
              item[kdParentIndex] === "F. Doanh thu theo sản phẩm") &&
            item[departmentLv1Index]
          );
        }
        return item;
      })
      .map((item: any) => {
        return { keyDriver: item[2], parent: item[6] };
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
        className: classnames("department-name department-name--secondary border-bottom-none"),
        children: [] as any[],
      };
      children.forEach((child: any) => {
        const { keyDriver: keyDriverChild } = child;
        parentHeader.children.push(
          setObjectiveColumns(
            nonAccentVietnameseKD(keyDriverChild),
            keyDriverChild.toUpperCase(),
            index,
            1,
            index === 0 ? "department-name--primary" : undefined,
            "",
          ),
        );
      });
      columns.push(parentHeader);
    } else {
      columns.push(
        setObjectiveColumns(
          nonAccentVietnameseKD(keyDriver),
          keyDriver.toUpperCase(),
          index,
          1,
          index === 0 ? "department-name--primary" : undefined,
          "",
        ),
      );
    }
  });
  return columns;
};
