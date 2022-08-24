import { KeyDriverField } from "model/report";
import {
  AnalyticDataQuery,
  AnalyticQueryMany,
  AnalyticSampleQuery,
} from "model/report/analytics.model";
import moment from "moment";
import { Dispatch } from "redux";
import {
  executeAnalyticsQueryService,
  executeManyAnalyticsQueryService,
} from "service/report/analytics.service";
import { callApiNative } from "./ApiUtils";
import { generateRQuery } from "./ReportUtils";

export const getDataManyQueryKeyDriverOffline = async (
  dispatch: Dispatch<any>,
  queries: AnalyticSampleQuery[],
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
    params,
  );
  return data;
};

export const getDataOneQueryKeyDriverOffline = async (
  dispatch: Dispatch<any>,
  queries: AnalyticSampleQuery,
): Promise<AnalyticDataQuery> => {
  const q = generateRQuery(queries.query);
  const data: AnalyticDataQuery = await callApiNative(
    { notifyAction: "HIDE_ALL" },
    dispatch,
    executeAnalyticsQueryService,
    { q, options: queries.options },
  );

  return data;
};

export const calculateTargetMonth = (accumulatedMonthData: number) => {
  if (moment().date() - 1) {
    const dayNumber = moment().date() - 1;
    const dayInMonth = moment().daysInMonth();
    return Math.round((accumulatedMonthData * dayInMonth) / dayNumber);
  }
  return 0;
};

export const findKeyDriver = (keyDriverData: any, key: string, result: any[]) => {
  if (keyDriverData.key === key) {
    result.push(keyDriverData);
    return result;
  }
  if (keyDriverData.children?.length) {
    keyDriverData.children.forEach((item: any) => {
      findKeyDriver(item, key, result);
    });
  }
};

export const calculateKDAverageCustomerSpent = (keyDriverData: any, department: string) => {
  let offlineTotalSales: any = [];
  findKeyDriver(keyDriverData, "offline_total_sales", offlineTotalSales);
  let customersCount: any = [];
  findKeyDriver(keyDriverData, "customers_count", customersCount);
  let averageCustomerSpent: any = [];
  findKeyDriver(keyDriverData, "average_customer_spent", averageCustomerSpent);
  offlineTotalSales = offlineTotalSales[0];
  customersCount = customersCount[0];
  averageCustomerSpent = averageCustomerSpent[0];
  averageCustomerSpent[`${department}_day`] = customersCount[`${department}_day`]
    ? offlineTotalSales[`${department}_day`] / customersCount[`${department}_day`]
    : "";
  averageCustomerSpent[`${department}_targetMonth`] = customersCount[`${department}_targetMonth`]
    ? offlineTotalSales[`${department}_targetMonth`] / customersCount[`${department}_targetMonth`]
    : "";
  averageCustomerSpent[`${department}_accumulatedMonth`] = customersCount[
    `${department}_accumulatedMonth`
  ]
    ? offlineTotalSales[`${department}_accumulatedMonth`] /
      customersCount[`${department}_accumulatedMonth`]
    : "";
  averageCustomerSpent[`${department}_actualDay`] = customersCount[`${department}_actualDay`]
    ? offlineTotalSales[`${department}_actualDay`] / customersCount[`${department}_actualDay`]
    : "";
};

export const calculateKDConvertionRate = (keyDriverData: any, department: string) => {
  let convertionRate: any = [];
  findKeyDriver(keyDriverData, KeyDriverField.ConvertionRate, convertionRate);
  let customersCount: any = [];
  findKeyDriver(keyDriverData, KeyDriverField.CustomersCount, customersCount);
  let visitors: any = [];
  findKeyDriver(keyDriverData, KeyDriverField.Visitors, visitors);
  convertionRate = convertionRate[0];
  customersCount = customersCount[0];
  visitors = visitors[0];
  convertionRate[`${department}_day`] = visitors[`${department}_day`]
    ? +((customersCount[`${department}_day`] / visitors[`${department}_day`]) * 100).toFixed(1)
    : "";
  convertionRate[`${department}_targetMonth`] = visitors[`${department}_targetMonth`]
    ? +(
        (customersCount[`${department}_targetMonth`] / visitors[`${department}_targetMonth`]) *
        100
      ).toFixed(1)
    : "";
  convertionRate[`${department}_accumulatedMonth`] = visitors[`${department}_accumulatedMonth`]
    ? +(
        (customersCount[`${department}_accumulatedMonth`] /
          visitors[`${department}_accumulatedMonth`]) *
        100
      ).toFixed(1)
    : "";
  convertionRate[`${department}_actualDay`] = visitors[`${department}_actualDay`]
    ? +(
        (customersCount[`${department}_actualDay`] / visitors[`${department}_actualDay`]) *
        100
      ).toFixed(1)
    : "";
};

export const calculateKDAverageOrderValue = (keyDriverData: any, department: string) => {
  let offlineTotalSales: any = [];
  findKeyDriver(keyDriverData, KeyDriverField.OfflineTotalSales, offlineTotalSales);
  let averageOrderValue: any = [];
  findKeyDriver(keyDriverData, KeyDriverField.AverageOrderValue, averageOrderValue);
  offlineTotalSales = offlineTotalSales[0];
  averageOrderValue = averageOrderValue[0];
  const dayNumber = moment().date() - 1;
  const dayInMonth = moment().daysInMonth();
  const averageOrderValueDayTarget =
    offlineTotalSales[`${department}_day`] /
    ((Math.round(
      offlineTotalSales[`${department}_month`] / averageOrderValue[`${department}_month`],
    ) -
      Math.round(
        offlineTotalSales[`${department}_accumulatedMonth`] /
          averageOrderValue[`${department}_accumulatedMonth`],
      )) /
      (dayInMonth - dayNumber));
  averageOrderValue[`${department}_day`] =
    averageOrderValueDayTarget >= 0
      ? averageOrderValueDayTarget
      : averageOrderValue[`${department}_accumulatedMonth`];
  if (!averageOrderValue[`${department}_accumulatedMonth`]) {
    averageOrderValue[`${department}_targetMonth`] = "";
  } else {
    const orders = Math.round(
      offlineTotalSales[`${department}_accumulatedMonth`] /
        averageOrderValue[`${department}_accumulatedMonth`],
    );
    if (!orders) {
      averageOrderValue[`${department}_targetMonth`] = "";
    }
    averageOrderValue[`${department}_targetMonth`] =
      offlineTotalSales[`${department}_targetMonth`] / calculateTargetMonth(orders);
  }
};

export const calculateKDNewCustomerRateTargetDay = (keyDriverData: any, department: string) => {
  const { NewCustomersConversionRate, PotentialCustomerCount } = KeyDriverField;
  let potentialCustomerCount: any = [];
  findKeyDriver(keyDriverData, PotentialCustomerCount, potentialCustomerCount);
  let newCustomersConversionRate: any = [];
  findKeyDriver(keyDriverData, NewCustomersConversionRate, newCustomersConversionRate);
  potentialCustomerCount = potentialCustomerCount[0];
  newCustomersConversionRate = newCustomersConversionRate[0];
  const dayNumber = moment().date() - 1;
  const dayInMonth = moment().daysInMonth();
  const newCustomerTargetDay = Math.round(
    (Math.round(
      (potentialCustomerCount[`${department}_month`] *
        newCustomersConversionRate[`${department}_month`]) /
        100,
    ) -
      Math.round(
        (potentialCustomerCount[`${department}_accumulatedMonth`] *
          newCustomersConversionRate[`${department}_accumulatedMonth`]) /
          100,
      )) /
      (dayInMonth - dayNumber),
  );
  if (newCustomerTargetDay >= 0) {
    const rate = +(
      (newCustomerTargetDay / potentialCustomerCount[`${department}_day`]) *
      100
    ).toFixed(1);
    if (rate > 100) {
      newCustomersConversionRate[`${department}_day`] = 100;
    } else {
      newCustomersConversionRate[`${department}_day`] = rate;
    }
  } else {
    newCustomersConversionRate[`${department}_day`] = "";
  }
};

export const nonAccentVietnameseKD = (str: string) => {
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
    .replace(/[^a-zA-Z0-9 ]/g, "");
};

export const findKDProductAndUpdateValueUtil = (
  data: any,
  keyDriversTarget: any,
  asmName: string,
  targetTime: "month" | "day",
) => {
  Object.keys(keyDriversTarget).forEach((keyDriver) => {
    if (data.children?.length) {
      const idx = data.children.findIndex((child: any) => child.key === keyDriver);
      if (idx !== -1) {
        data.children[idx][`${asmName}_${targetTime}`] = keyDriversTarget[keyDriver].value;
      } else {
        data.children.push({
          key: keyDriver,
          [`${asmName}_${targetTime}`]: keyDriversTarget[keyDriver].value,
        });
      }
    } else {
      data.children.push({
        key: keyDriver,
        [`${asmName}_${targetTime}`]: keyDriversTarget[keyDriver].value,
      });
    }
  });
};

const calculateDepartmentMonthRate = (keyDriver: any, department: string) => {
  if (keyDriver[`${department}_accumulatedMonth`] && keyDriver[`${department}_month`]) {
    keyDriver[`${department}_rateMonth`] = keyDriver[`${department}_month`]
      ? Math.floor(
          +(keyDriver[`${department}_accumulatedMonth`] / keyDriver[`${department}_month`]) * 100,
        )
      : "";
  }
};

const calculateDepartmentDayTarget = (keyDriver: any, department: string) => {
  if (keyDriver[`${department}_month`]) {
    const dayNumber = moment().date() - 1;
    const dayInMonth = moment().daysInMonth();
    const { AverageOrderValue, AverageCustomerSpent, CustomersCount, NewCustomersConversionRate } =
      KeyDriverField;
    if (
      ![AverageOrderValue, AverageCustomerSpent, NewCustomersConversionRate].includes(
        keyDriver["key"],
      )
    ) {
      keyDriver[`${department}_day`] =
        keyDriver[`${department}_month`] - (keyDriver[`${department}_accumulatedMonth`] || 0) > 0
          ? Math.round(
              (keyDriver[`${department}_month`] -
                (keyDriver[`${department}_accumulatedMonth`] || 0)) /
                (dayInMonth - dayNumber) +
                (CustomersCount === keyDriver["key"] ? 0.5 : 0),
            )
          : Math.round(keyDriver[`${department}_month`] / dayInMonth);
    }
  }
};

const calculateDepartmentDayRate = (keyDriver: any, department: string) => {
  if (keyDriver[`${department}_actualDay`] && keyDriver[`${department}_day`]) {
    keyDriver[`${department}_rateDay`] = keyDriver[`${department}_day`]
      ? Math.floor(+(keyDriver[`${department}_actualDay`] / keyDriver[`${department}_day`]) * 100)
      : "";
  }
};

// Tỷ lệ TT luỹ kế đạt so vs mục tiêu tháng
export const calculateMonthRateUtil = (keyDriver: any, departments: string[]) => {
  departments.forEach((asm) => {
    const asmKey = nonAccentVietnameseKD(asm);
    calculateDepartmentMonthRate(keyDriver, asmKey);
  });
  if (keyDriver.children?.length) {
    keyDriver.children.forEach((item: any) => {
      calculateMonthRateUtil(item, departments);
    });
  }
};

// Tỷ lệ thực đạt so vs mục tiêu ngày
export const calculateDayRateUtil = (keyDriver: any, departments: string[]) => {
  departments.forEach((asm) => {
    const asmKey = nonAccentVietnameseKD(asm);
    calculateDepartmentDayRate(keyDriver, asmKey);
  });
  if (keyDriver.children?.length) {
    keyDriver.children.forEach((item: any) => {
      calculateDayRateUtil(item, departments);
    });
  }
};

// Mục tiêu ngày
export const calculateDayTargetUtil = (keyDriver: any, departments: string[]) => {
  departments.forEach((asm) => {
    const asmKey = nonAccentVietnameseKD(asm);
    calculateDepartmentDayTarget(keyDriver, asmKey);
  });
  if (keyDriver.children?.length) {
    keyDriver.children.forEach((item: any) => {
      calculateDayTargetUtil(item, departments);
    });
  }
};
