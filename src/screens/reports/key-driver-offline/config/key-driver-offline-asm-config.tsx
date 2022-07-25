import { START_OF_MONTH, TODAY, YESTERDAY } from "config/dashboard";
import { AnalyticCube, AnalyticSampleQuery } from "model/report";
import moment from "moment";
import { DATE_FORMAT } from "utils/DateUtils";

export const TOTAL_SALES_BY_ASM_DAY_QUERY: AnalyticSampleQuery = {
  query: {
    columns: [
      {
        field: "total_sales",
      },
    ],
    rows: ["day", "pos_location_department_lv2"],
    cube: AnalyticCube.OfflineSales,
    conditions: [],
    from: TODAY,
    to: TODAY,
  },
  options: `time:"completed_at"`,
};

export const TOTAL_SALES_BY_ASM_MONTH_QUERY: AnalyticSampleQuery = {
  query: {
    columns: [
      {
        field: "total_sales",
      },
    ],
    rows: ["month", "pos_location_department_lv2"],
    cube: AnalyticCube.OfflineSales,
    conditions: [],
    from: START_OF_MONTH,
    to: moment().subtract(1, "days").format(DATE_FORMAT.YYYYMMDD),
  },
  options: `time:"completed_at"`,
};

export const OFFLINE_TOTAL_SALES_DAY_QUERY: AnalyticSampleQuery = {
  query: {
    columns: [
      {
        field: "total_sales",
      },
      {
        field: "orders",
      },
    ],
    rows: ["day", "pos_location_department_lv2"],
    cube: AnalyticCube.OfflineSales,
    conditions: [
      ["offline_source", "==", ""],
      ["uniform", "==", ""],
    ],
    from: TODAY,
    to: TODAY,
  },
  options: `time:"completed_at"`,
};

export const OFFLINE_TOTAL_SALES_MONTH_QUERY: AnalyticSampleQuery = {
  query: {
    columns: [
      {
        field: "total_sales",
      },
      {
        field: "orders",
      },
    ],
    rows: ["month", "pos_location_department_lv2"],
    cube: AnalyticCube.OfflineSales,
    conditions: [
      ["offline_source", "==", ""],
      ["uniform", "==", ""],
    ],
    from: START_OF_MONTH,
    to: moment().subtract(1, "days").format(DATE_FORMAT.YYYYMMDD),
  },
  options: `time:"completed_at"`,
};

export const FACEBOOK_TOTAL_SALES_DAY_QUERY: AnalyticSampleQuery = {
  query: {
    columns: [
      {
        field: "total_sales",
      },
    ],
    rows: ["day", "pos_location_department_lv2"],
    cube: AnalyticCube.OfflineSales,
    conditions: [
      ["offline_source", "==", "Facebook"],
      ["uniform", "==", ""],
    ],
    from: TODAY,
    to: TODAY,
  },
  options: `time:"completed_at"`,
};

export const FACEBOOK_TOTAL_SALES_MONTH_QUERY: AnalyticSampleQuery = {
  query: {
    columns: [
      {
        field: "total_sales",
      },
    ],
    rows: ["month", "pos_location_department_lv2"],
    cube: AnalyticCube.OfflineSales,
    conditions: [
      ["offline_source", "==", "Facebook"],
      ["uniform", "==", ""],
    ],
    from: START_OF_MONTH,
    to: moment().subtract(1, "days").format(DATE_FORMAT.YYYYMMDD),
  },
  options: `time:"completed_at"`,
};

export const ZALO_TOTAL_SALES_DAY_QUERY: AnalyticSampleQuery = {
  query: {
    columns: [
      {
        field: "total_sales",
      },
    ],
    rows: ["day", "pos_location_department_lv2"],
    cube: AnalyticCube.OfflineSales,
    conditions: [
      ["offline_source", "==", "Zalo"],
      ["uniform", "==", ""],
    ],
    from: TODAY,
    to: TODAY,
  },
  options: `time:"completed_at"`,
};

export const ZALO_TOTAL_SALES_MONTH_QUERY: AnalyticSampleQuery = {
  query: {
    columns: [
      {
        field: "total_sales",
      },
    ],
    rows: ["month", "pos_location_department_lv2"],
    cube: AnalyticCube.OfflineSales,
    conditions: [
      ["offline_source", "==", "Zalo"],
      ["uniform", "==", ""],
    ],
    from: START_OF_MONTH,
    to: moment().subtract(1, "days").format(DATE_FORMAT.YYYYMMDD),
  },
  options: `time:"completed_at"`,
};

export const UNIFORM_TOTAL_SALES_DAY_QUERY: AnalyticSampleQuery = {
  query: {
    columns: [
      {
        field: "total_sales",
      },
    ],
    rows: ["day", "pos_location_department_lv2"],
    cube: AnalyticCube.OfflineSales,
    conditions: [["uniform", "==", "Đồng phục"]],
    from: TODAY,
    to: TODAY,
  },
  options: `time:"completed_at"`,
};

export const UNIFORM_TOTAL_SALES_MONTH_QUERY: AnalyticSampleQuery = {
  query: {
    columns: [
      {
        field: "total_sales",
      },
    ],
    rows: ["month", "pos_location_department_lv2"],
    cube: AnalyticCube.OfflineSales,
    conditions: [["uniform", "==", "Đồng phục"]],
    from: START_OF_MONTH,
    to: moment().subtract(1, "days").format(DATE_FORMAT.YYYYMMDD),
  },
  options: `time:"completed_at"`,
};

export const PRODUCT_TOTAL_SALES_DAY_QUERY: AnalyticSampleQuery = {
  query: {
    columns: [
      {
        field: "total_sales",
      },
    ],
    rows: ["variant_sku3_group", "pos_location_department_lv2"],
    cube: AnalyticCube.Costs,
    conditions: [["pos_location_department_lv2", "IN", "" , "'ASM Đỗ Quang Hiếu','ASM Dương Sơn Tùng','ASM Nguyễn Văn Ánh'", ""]],
    from: TODAY,
    to: TODAY,
  },
  options: `time:"completed_at"`,
};

export const PRODUCT_TOTAL_SALES_MONTH_QUERY: AnalyticSampleQuery = {
  query: {
    columns: [
      {
        field: "total_sales",
      },
    ],
    rows: ["variant_sku3_group", "pos_location_department_lv2"],
    cube: AnalyticCube.Costs,
    conditions: [["pos_location_department_lv2", "IN", "" , "'ASM Đỗ Quang Hiếu','ASM Dương Sơn Tùng','ASM Nguyễn Văn Ánh'", ""]],
    from: START_OF_MONTH,
    to: YESTERDAY,
  },
  options: `time:"completed_at"`,
};
