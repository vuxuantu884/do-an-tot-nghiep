import { BusinessResultChartKey } from "model/dashboard/dashboard.model";
import { AnalyticCube, AnalyticSampleQuery, TimeAtOptionValue } from "model/report/analytics.model";
import moment from "moment";
import { DATE_FORMAT } from "utils/DateUtils";
import { LAST_3_MONTHS, START_OF_MONTH, TODAY } from "./time-query-config";

export const BUSINESS_RESULT_CHART_LABEL = {
  [BusinessResultChartKey.CURRENT_MONTH]: "Tháng này",
  [BusinessResultChartKey.AVERAGE_OF_LAST_3_MONTH]: "Trung bình 3 tháng trước",
};

export const BUSINESS_RESULT_CART_NAME = {
  companyTotalSales: "companyTotalSales",
  companyOrders: "companyOrders",
  offlineTotalSales: "offlineTotalSales",
  offlineOrders: "offlineOrders",
  offlineReturns: "offlineReturns",
  onlineTotalSales: "onlineTotalSales",
  onlineOrders: "onlineOrders",
  onlineReturns: "onlineReturns",
  onlinePreTotalSales: "onlinePreTotalSales",
  onlinePreOrders: "onlinePreOrders",
  cancelledPreTotalSales: "cancelledPreTotalSales",
  successRate: "successRate",
  averageOrder: "averageOrder",
  conversionRate: "conversionRate",
  chart: "chart",
};

export const BUSINESS_RESULT_CART_LABEL = {
  [BUSINESS_RESULT_CART_NAME.companyTotalSales]: "Tổng DT công ty",
  [BUSINESS_RESULT_CART_NAME.companyOrders]: "Tổng đơn công ty",
  [BUSINESS_RESULT_CART_NAME.offlineTotalSales]: "DT Offline",
  [BUSINESS_RESULT_CART_NAME.offlineOrders]: "Số đơn Offline",
  [BUSINESS_RESULT_CART_NAME.offlineReturns]: "Trả hàng Offline",
  [BUSINESS_RESULT_CART_NAME.onlineTotalSales]: "DT TC Online",
  [BUSINESS_RESULT_CART_NAME.onlineOrders]: "Số đơn TC Online",
  [BUSINESS_RESULT_CART_NAME.onlineReturns]: "Trả hàng Online",
  [BUSINESS_RESULT_CART_NAME.onlinePreTotalSales]: "DT ĐT Online",
  [BUSINESS_RESULT_CART_NAME.onlinePreOrders]: "Số đơn ĐT Online",
  [BUSINESS_RESULT_CART_NAME.cancelledPreTotalSales]: "Huỷ đơn Online",
  [BUSINESS_RESULT_CART_NAME.successRate]: "Tỉ lệ thành công",
  [BUSINESS_RESULT_CART_NAME.averageOrder]: "GTTB/ Hóa đơn",
  [BUSINESS_RESULT_CART_NAME.conversionRate]: "Tỉ lệ chuyển đổi",
};

export const BUSINESS_RESULT_CART_DESCRIPTION = {
  [BUSINESS_RESULT_CART_NAME.companyTotalSales]: "= DT Offline + DT TC Online",
  [BUSINESS_RESULT_CART_NAME.companyOrders]: "= Số đơn Offline + Số đơn TC Online",
};

export enum ReportDatavalue {
  KD_ONLINE = "Khối KD Online",
  KD_OFFLINE = "Khối KD Offline",
}

export enum ReportDataColumn {
  returns = "returns",
}

export const COMPANY_BUSINESS_RESULT_COMPLETED_QUERY: AnalyticSampleQuery = {
  /**
   * query cho : Tổng DT công ty, Tổng đơn công ty
   */
  query: {
    columns: [
      {
        field: "total_sales",
      },
      {
        field: "orders",
      },
    ],
    rows: ["day"],
    cube: AnalyticCube.Costs,
    conditions: [],
    from: START_OF_MONTH,
    to: TODAY,
  },
  options: TimeAtOptionValue.CompletedAt,
};

export const OFFLINE_BUSINESS_RESULT_COMPLETED_QUERY: AnalyticSampleQuery = {
  /**
   * query cho : Doanh thu + SL đơn hàng + DT trả hàng Offline
   */
  query: {
    columns: [
      {
        field: "total_sales",
      },
      {
        field: "orders",
      },
      {
        field: "returns",
      },
    ],
    rows: ["day"],
    cube: AnalyticCube.OfflineSales,
    conditions: [],
    from: START_OF_MONTH,
    to: TODAY,
  },
  options: TimeAtOptionValue.CompletedAt,
};

export const ONLINE_BUSINESS_RESULT_COMPLETED_QUERY: AnalyticSampleQuery = {
  /**
   * query cho : Doanh thu + SL đơn hàng + DT trả hàng Online (Ngày thành công)
   */
  query: {
    columns: [
      {
        field: "total_sales",
      },
      {
        field: "orders",
      },
      {
        field: "returns",
      },
    ],
    rows: ["day"],
    cube: AnalyticCube.Sales,
    conditions: [["sale_area", "==", ReportDatavalue.KD_ONLINE]],
    from: START_OF_MONTH,
    to: TODAY,
  },
  options: TimeAtOptionValue.CompletedAt,
};

export const ONLINE_BUSINESS_RESULT_CREATED_QUERY: AnalyticSampleQuery = {
  /**
   * query cho : Doanh thu đơn tạo + SL đơn tạo Online
   */
  query: {
    columns: [
      {
        field: "pre_total_sales",
      },
      {
        field: "pre_orders",
      },
    ],
    rows: ["day"],
    cube: AnalyticCube.Sales,
    conditions: [["sale_area", "==", ReportDatavalue.KD_ONLINE]],
    from: START_OF_MONTH,
    to: TODAY,
  },
  options: TimeAtOptionValue.CreatedAt,
};

export const BUSINESS_RESULT_CANCELED_QUERY: AnalyticSampleQuery = {
  // Hủy đơn Online
  query: {
    columns: [
      {
        field: "pre_total_sales ",
      },
    ],
    rows: ["day"],
    cube: AnalyticCube.Sales,
    conditions: [
      ["sale_area", "==", ReportDatavalue.KD_ONLINE],
      ["cancelled", "==", "Hủy/hết hàng"],
    ],
    from: START_OF_MONTH,
    to: TODAY,
  },
  options: TimeAtOptionValue.CancelledAt,
};

export const BUSINESS_RESULT_CONVERSION_RATE_QUERY: AnalyticSampleQuery = {
  // SHOW conversion_rate OVER day FROM sales WHERE sale_area IN ('Khối KD Online') SINCE 2022-04-01 UNTIL 2022-04-19
  //time:"created_at"
  query: {
    columns: [
      {
        field: "conversion_rate ",
      },
    ],
    rows: ["day"],
    cube: "sales",
    // conditions: [["sale_area", "==", ReportDatavalue.KD_ONLINE], ["cancelled", "==", 'Chưa hủy']],
    conditions: [],
    from: START_OF_MONTH,
    to: TODAY,
  },
  options: `time:"created_at"`,
};

export const BUSINESS_RESULT_SUCCESS_RATE_DAY_QUERY: AnalyticSampleQuery = {
  // SHOW pre_total_sales, total_sales FROM sales WHERE sale_area IN ('Khối KD Online') SINCE 2022-06-26 UNTIL 2022-06-28 ORDER BY pre_total_sales DESC
  // options: time:"created_at"
  query: {
    columns: [
      {
        field: "pre_total_sales ",
      },
      {
        field: "total_sales ",
      },
    ],
    rows: [],
    cube: "sales",
    conditions: [["sale_area", "IN", "'", ReportDatavalue.KD_ONLINE, "'"]],
    order_by: [["pre_total_sales", "DESC"]],
    from: moment().subtract(4, "days").format(DATE_FORMAT.YYYYMMDD),
    to: moment().subtract(4, "days").format(DATE_FORMAT.YYYYMMDD),
  },
  options: `time:"created_at"`,
};

export const BUSINESS_RESULT_SUCCESS_RATE_MONTH_QUERY: AnalyticSampleQuery = {
  // SHOW pre_total_sales, total_sales FROM sales WHERE sale_area IN ('Khối KD Online') SINCE 2022-06-26 UNTIL 2022-06-28 ORDER BY pre_total_sales DESC
  // options: time:"created_at"
  query: {
    columns: [
      {
        field: "pre_total_sales ",
      },
      {
        field: "total_sales ",
      },
    ],
    rows: [],
    cube: "sales",
    conditions: [["sale_area", "==", ReportDatavalue.KD_ONLINE]],
    from:
      moment().subtract(4, "days").date() >= 26
        ? `${moment().year()}-${moment().month() + 1}-26`
        : `${moment().year()}-${moment().month()}-26`,
    to: moment().subtract(4, "days").format(DATE_FORMAT.YYYYMMDD),
  },
  options: `time:"created_at"`,
};

export const BUSINESS_RESULT_AVG_ORDER_VALUE_TODAY_QUERY: AnalyticSampleQuery = {
  // q: `SHOW average_order_value FROM sales SINCE ${TODAY} UNTIL ${TODAY}`,
  query: {
    columns: [
      {
        field: "average_order_value",
      },
    ],
    rows: [],
    cube: "sales",
    conditions: [],
    from: TODAY,
    to: TODAY,
  },
  options: `time:"completed_at"`,
};

export const BUSINESS_RESULT_AVG_ORDER_VALUE_CURRENT_MONTH_QUERY: AnalyticSampleQuery = {
  // q: `SHOW average_order_value FROM sales SINCE ${START_OF_MONTH} UNTIL ${TODAY}`,
  query: {
    columns: [
      {
        field: "average_order_value",
      },
    ],
    rows: [],
    cube: "sales",
    conditions: [],
    from: START_OF_MONTH,
    to: TODAY,
  },
  options: `time:"completed_at"`,
};

export const BUSINESS_RESULT_LAST_3_MONTHS_QUERY: AnalyticSampleQuery = {
  // q: `SHOW total_sales OVER FROM  sales SINCE 2022-04-01 UNTIL 2022-04-14`,
  query: {
    columns: [
      {
        field: "total_sales",
      },
    ],
    rows: ["day"],
    cube: "sales",
    conditions: [],
    from: LAST_3_MONTHS[0],
    to: LAST_3_MONTHS[1],
  },
  options: `time:"completed_at"`,
};

export const BUSINESS_RESULT_CURRRENT_MONTHS_QUERY: AnalyticSampleQuery = {
  // q: `SHOW total_sales OVER FROM  sales SINCE 2022-04-01 UNTIL 2022-04-14`,
  query: {
    columns: [
      {
        field: "total_sales",
      },
    ],
    rows: ["day"],
    cube: "sales",
    conditions: [],
    from: START_OF_MONTH,
    to: TODAY,
  },
  options: `time:"completed_at"`,
};
