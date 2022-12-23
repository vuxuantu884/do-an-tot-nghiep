import { uniqBy } from "lodash";
import { nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
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

export const getAllKDByGroupLevel = (data: any, currentDrillingLevel: number) => {
  const keyDriverIndex = COLUMN_ORDER_LIST.indexOf("key_driver");
  const keyDriverTitleIndex = COLUMN_ORDER_LIST.indexOf("key_driver_title");
  let allKeyDriverByGroupLevel = [];
  const filterData = filterKDOfflineHorizontalByDim(currentDrillingLevel, data);
  allKeyDriverByGroupLevel = uniqBy(
    filterData.map((item: any) => {
      return {
        keyDriver: item[keyDriverTitleIndex],
        keyDriverCode: item[keyDriverIndex],
      };
    }),
    "keyDriver",
  );

  return allKeyDriverByGroupLevel;
};

export const setCompanyTableColumns = (
  allKeyDriverByGroupLevel: any[],
  setObjectiveColumns: (
    kdTableHeader: KDTableHeader,
    queryString: any,
    history: any,
    dispatch: any,
  ) => void,
  link: IColumnLink,
): any[] => {
  const { queryString, history, dispatch } = link;
  const columns: any[] = [];

  allKeyDriverByGroupLevel.forEach((item: any, index: number) => {
    const { keyDriver } = item;
    const kdTableHeader: KDTableHeader = {
      departmentKey: nonAccentVietnameseKD(keyDriver),
      department: keyDriver,
      columnIndex: index,
      departmentDrillingLevel: 1,
      className: "key-driver-header",
      link: "",
    };
    columns.push(setObjectiveColumns(kdTableHeader, queryString, history, dispatch));
  });
  return columns;
};
