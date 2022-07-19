import {
  AnalyticDataQuery,
  AnalyticQueryMany,
  AnalyticSampleQuery
} from "model/report/analytics.model";
import moment from "moment";
import { Dispatch } from "redux";
import {
  executeAnalyticsQueryService,
  executeManyAnalyticsQueryService
} from "service/report/analytics.service";
import { callApiNative } from "./ApiUtils";
import { generateRQuery } from "./ReportUtils";

export const getDataManyQueryKeyDriverOffline = async (
  dispatch: Dispatch<any>,
  queries: AnalyticSampleQuery[]
): Promise<AnalyticDataQuery[]> => {
  const params: AnalyticQueryMany = { q: [], options: [] };

  queries.forEach((item: AnalyticSampleQuery) => {
    const q = generateRQuery(item.query);
    params.q.push(q);
    params.options.push(item.options || "");
  });

  const data: AnalyticDataQuery[] = await callApiNative(
    { notifyAction: "HIDE_ALL" },
    dispatch,
    executeManyAnalyticsQueryService,
    params
  );
  return data;
};

export const getDataOneQueryKeyDriverOffline = async (
  dispatch: Dispatch<any>,
  queries: AnalyticSampleQuery
): Promise<AnalyticDataQuery> => {
  const q = generateRQuery(queries.query);
  const data: AnalyticDataQuery = await callApiNative(
    { notifyAction: "HIDE_ALL" },
    dispatch,
    executeAnalyticsQueryService,
    { q, options: queries.options }
  );

  return data;
};

export const calculateTargetMonth = (accumulatedMonthData: number) => {
  if (moment().date() - 1) {
    const dayNumber = moment().date() - 1;
    const dayInMonth = moment().daysInMonth();
    return Math.round(accumulatedMonthData * dayInMonth / dayNumber);
  }
  return 0;
};

const findKeyDriver = (keyDriverData: any, key: string, result: any) => {
  if (keyDriverData.key === key) {
    result = keyDriverData;
    console.log('item', result);
    return keyDriverData;
  }
  if (result) {
    return result;
  }
  if (keyDriverData.children?.length && !result) {
    const a = JSON.parse(JSON.stringify(keyDriverData.children));
    a.forEach((item: any) => {
      findKeyDriver(item, key, result);
    });
  }
}

export const calculateKDAverageCustomerSpent = (keyDriverData: any, department: string) => {
  const offlineTotalSales = findKeyDriver(keyDriverData, 'offline_total_sales', undefined);
  const customersCount = findKeyDriver(keyDriverData, 'customers_count', undefined);
  const averageCustomerSpent = findKeyDriver(keyDriverData, 'average_customer_spent', undefined);
  averageCustomerSpent[`${department}_accumulatedMonth`] = offlineTotalSales[`${department}_accumulatedMonth`] / customersCount[`${department}_accumulatedMonth`];
  averageCustomerSpent[`${department}_month`] = offlineTotalSales[`${department}_month`] / customersCount[`${department}_month`];
  averageCustomerSpent[`${department}_day`] = offlineTotalSales[`${department}_day`] / customersCount[`${department}_day`];
  averageCustomerSpent[`${department}_actualDay`] = offlineTotalSales[`${department}_actualDay`] / customersCount[`${department}_actualDay`];
  console.log('averageCustomerSpent', averageCustomerSpent);
  console.log('keyDriverData', keyDriverData);
  
}

export const nonAccentVietnamese = (str: string) => {
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
  return str
    .toUpperCase()
    .replaceAll(/\s/g, "")
    .replace(/[^a-zA-Z ]/g, "");
}
