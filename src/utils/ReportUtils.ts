import { YodyAction } from "base/base.action";
import { TIME_GROUP_BY } from "config/report";
import { AnalyticConditions, AnalyticMetadata, AnalyticQuery, QueryMode } from "model/report/analytics.model";
import moment from "moment";
import { Dispatch } from "react";
import { executeAnalyticsQueryService } from "../service/report/analytics.service";
import { callApiNative } from "./ApiUtils";
import { DATE_FORMAT } from "./DateUtils";

const getCondistions = (conditions: AnalyticConditions) => {
  let whereValue = "";
  conditions.forEach((conditionsElement) => {
    // check trường hợp dùng operator IN : mảng conditionsElement có độ dài lớn hơn hoặc bằng 5
    if (Array.isArray(conditionsElement) && conditionsElement.length >= 5) {
      // copy array from item 2nd to end
      const value: Array<string> = conditionsElement.slice(2);
      // convert ["camel", ",", "elephant"] to "("camel", "elephant")"

      whereValue += ` ${conditionsElement[0]} ${conditionsElement[1]}  (${value.join("")}) AND`;
    } else if (Array.isArray(conditionsElement) && conditionsElement.length === 3) {
      // check trường hợp dùng operator == != >= .... : mảng conditionsElement có độ dài bằng 3
      whereValue += ` ${conditionsElement[0]} ${conditionsElement[1]} '${conditionsElement[2]}' AND`;
    }
  });

  return whereValue.slice(0, -3);
};

const getRows = (rows: Array<string>, mode: QueryMode = "table") => {
  let rowsValue = "";
  if (rows.length === 1) {
    if (mode === "chart" && TIME_GROUP_BY.some((item) => item.value === rows[0])) {
      /*nếu là query cho chart và chỉ nhóm theo thời gian thì dùng OVER */
      rowsValue = ` OVER ${rows[0]}`;
    } else {
      rowsValue = ` BY ${rows[0]}`;
    }
  } else if (rows.length > 1) {
    rowsValue = ` BY ${rows.join(",")}`;
  }
  return rowsValue;
};

const generateRQuery = (queryObject: AnalyticQuery, mode: QueryMode = "table") => {
  //validate queryObject
  if (!queryObject.columns || !queryObject.cube) {
    throw new Error("Query is not valid");
  }

  const { columns: column, rows, cube, conditions, from, to, order_by } = queryObject;
  let queryString = "SHOW";
  // column
  if (Array.isArray(column)) {
    queryString += ` ${column.map((item) => item.field).join(", ")}`;
  }
  // by or over
  if (Array.isArray(rows)) {
    queryString += getRows(rows, mode);
  }
  // from
  if (cube) {
    queryString += ` FROM ${cube}`;
  }
  // conditions WHERE
  if (conditions) {
    const whereValue = getCondistions(conditions);
    queryString += whereValue ? ` WHERE ${whereValue}` : "";
  }
  // since
  if (from) {
    queryString += ` SINCE ${from}`;
  }
  // until
  if (to) {
    queryString += ` UNTIL ${to}`;
  }
  // orderBy
  if (Array.isArray(order_by) && order_by.length > 0) {
    queryString += ` ORDER BY `;
    order_by.forEach((item) => {
      queryString += `${item[0]} ${item[1]} `;
    });
  }
  //   console.log(queryString);
  return queryString;
};
// check array a has a value in array b
const checkArrayHasAnyValue = (a: Array<string>, b: Array<string>) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.find((item) => b.includes(item));
  }
  return false;
};

export const checkArrayHasAllValue = (a: Array<string>, b: Array<string>) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.every((item) => b.includes(item));
  }
  return false;
};

export const getTranslatePropertyKey = (metadata: AnalyticMetadata, key: string) => {
  const TIME: { [key: string]: string } = {
    year: "Năm",
    month: "Tháng",
    week: "Tuần",
    day: "Ngày",
    hour: "Giờ",
    minute: "Phút",
    second: "Giây",
  };
  let name = key;

  if (Object.keys(TIME).includes(key.toLocaleLowerCase())) {
    return TIME[key];
  }
  if (Object.keys(metadata.aggregates).includes(key)) {
    return metadata.aggregates[key].name;
  }

  if (name === key) {
    Object.keys(metadata.properties).forEach((item) => {
      const child = metadata.properties[item];
      Object.keys(child).some((childKey) => {
        if (childKey === key) {
          name = child[childKey];
          return true;
        } else {
          return false;
        }
      });
    });
  }
  return name;
};

export const formatReportTime = (date: string, timeType: string) => {
  if (timeType === "year") {
    return moment(date).format("YYYY");
  }
  if (timeType === "month") {
    return moment(date).format("MM/YYYY");
  }
  if (timeType === "week") {
    return moment(date).format("YYYY/WW");
  }
  if (timeType === "day") {
    return moment(date).format("DD/MM/YYYY");
  }
  if (timeType === "hour") {
    return moment(date).format("DD/MM/YYYY HH:mm");
  }
  if (timeType === "minute") {
    return moment(date).format("DD/MM/YYYY HH:mm");
  }
  if (timeType === "second") {
    return moment(date).format("DD/MM/YYYY HH:mm:ss");
  }
  return date;
};

export const transformDateRangeToString = (dateRange: Array<moment.Moment>) => {
  if (dateRange.length === 2) {
    return {
      from: moment.isMoment(dateRange[0])
        ? moment(dateRange[0]).format(DATE_FORMAT.YYYYMMDD)
        : dateRange[0],
      to: moment.isMoment(dateRange[1])
        ? moment(dateRange[1]).format(DATE_FORMAT.YYYYMMDD)
        : dateRange[1],
    };
  }
};

export const getConditionsFormServerToForm = (conditions: AnalyticConditions) => {
  const conditionsValue: any = {};
  conditions.forEach((item: Array<string>) => {
    if (item.length > 0) {
      // convert  [ "customer_name", "in", "Nguyen", "," , "Nam" ] to { customer_name: ["Nguyen", "Nam"] }
      conditionsValue[item[0]] = item.slice(2).filter((item) => item !== ",");
    }
  });
  return conditionsValue;
};

export const getPropertiesKey = (childrenKey: string, metadata: AnalyticMetadata) => {
  if (metadata) {
    return Object.keys(metadata.properties).find((perentKey) => {
      // get perent value
      const perentValue = Object.keys(
        Object.values(metadata.properties)[Object.keys(metadata.properties).indexOf(perentKey)]
      );
      return perentValue.includes(childrenKey);
    });
  } else {
    return null;
  }
};

export const getPropertiesValue = (childrenKey: string[], metadata: AnalyticMetadata) => {
  const propertiesValue: any = {};
  childrenKey.forEach((key) => {
    const perentKey = getPropertiesKey(key, metadata);
    if (perentKey && propertiesValue[perentKey]) {
      propertiesValue[perentKey] = [...propertiesValue[perentKey], key];
    } else if (perentKey && !propertiesValue[perentKey]) {
      propertiesValue[perentKey] = [key];
    }
  });
  return propertiesValue;
};

export const exportReportToExcel = async (
  dispatch: Dispatch<YodyAction>,
  q: string,
  name: string = "Báo cáo",
  format: "xls" = "xls"
) => {
  const response = await callApiNative(
    { isShowError: true },
    dispatch,
    executeAnalyticsQueryService,
    { q, format },
    {
      headers: {
        "Content-Type": "application/vnd.openxmlformatsofficedocument.spreadsheetml.sheet",
      },
      responseType: "arraybuffer",
    }
  );
  if (response) {
    console.log(typeof response);
    const blob = new Blob([response], { type: "application/vnd.ms-excel" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name + ".xls";
    a.click();
    window.URL.revokeObjectURL(url);
  }
};

export const compare2RangeDate = (date1: moment.Moment[], date2: moment.Moment[]) => {
  if (date1?.length !== 2 || date2?.length !== 2) {
    return false;
  }
  return (
    date1[0].format(DATE_FORMAT.YYYYMMDD) === date2[0].format(DATE_FORMAT.YYYYMMDD) &&
    date1[1].format(DATE_FORMAT.YYYYMMDD) === date2[1].format(DATE_FORMAT.YYYYMMDD)
  );
};

export const removeSpacesAndEnterCharacters = (str: string) => {
  if(str){
  return str.replace(/\r?\n|\r/g, " ").replace(/\s+/g, " ");
  }else{
    return str;
  }
};

export { generateRQuery, checkArrayHasAnyValue };
