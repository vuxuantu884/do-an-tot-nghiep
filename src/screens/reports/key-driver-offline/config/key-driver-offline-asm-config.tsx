import { START_OF_MONTH, TODAY } from "config/dashboard";
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

export const PRODUCT_TOTAL_SALES_DAY_QUERY = (selectedDate: string): AnalyticSampleQuery => {
  return {
    query: {
      columns: [
        {
          field: "total_sales",
        },
      ],
      rows: ["variant_sku3_group", "pos_location_department_lv2"],
      cube: AnalyticCube.Costs,
      conditions: [
        [
          "pos_location_department_lv2",
          "IN",
          "",
          "'ASM Đỗ Quang Hiếu','ASM Dương Sơn Tùng','ASM Nguyễn Văn Ánh'",
          "",
        ],
      ],
      from: selectedDate,
      to: selectedDate,
    },
    options: `time:"completed_at"`,
  };
};

export const PRODUCT_TOTAL_SALES_MONTH_QUERY = (selectedDate: string): AnalyticSampleQuery => {
  const { YYYYMMDD } = DATE_FORMAT;
  return {
    query: {
      columns: [
        {
          field: "total_sales",
        },
      ],
      rows: ["variant_sku3_group", "pos_location_department_lv2"],
      cube: AnalyticCube.Costs,
      conditions: [
        [
          "pos_location_department_lv2",
          "IN",
          "",
          "'ASM Đỗ Quang Hiếu','ASM Dương Sơn Tùng','ASM Nguyễn Văn Ánh'",
          "",
        ],
      ],
      from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
      to:
        selectedDate === moment().format(YYYYMMDD)
          ? moment(selectedDate, YYYYMMDD).subtract(1, "days").format(YYYYMMDD)
          : moment(selectedDate, YYYYMMDD).format(YYYYMMDD),
    },
    options: `time:"completed_at"`,
  };
};

export const STORES_PRODUCT_TOTAL_SALES_DAY_QUERY = (
  asmName: string,
  stores: string[],
  selectedDate: string,
  selectedAllStores: boolean,
) => {
  let conditions = [
    ["pos_location_department_lv2", "IN", "", `'${asmName}'`, ""],
    ["variant_sku3_group", "!==", ""],
  ];
  if (!selectedAllStores) {
    conditions = [
      ...conditions,
      [
        "pos_location_name",
        "IN",
        "",
        ...stores.map((store, index) => {
          return index === stores.length - 1 ? `'${store}'` : `'${store}',`;
        }),
        "",
      ],
    ];
  }
  return {
    query: {
      columns: [
        {
          field: "total_sales",
        },
      ],
      rows: ["variant_sku3_group", "pos_location_name"],
      cube: AnalyticCube.Costs,
      conditions,
      from: selectedDate,
      to: selectedDate,
    },
    options: `time:"completed_at"`,
  };
};

export const STORES_PRODUCT_TOTAL_SALES_MONTH_QUERY = (
  asmName: string,
  stores: string[],
  selectedDate: string,
  selectedAllStores: boolean,
) => {
  const { YYYYMMDD } = DATE_FORMAT;
  let conditions = [
    ["pos_location_department_lv2", "IN", "", `'${asmName}'`, ""],
    ["variant_sku3_group", "!==", ""],
  ];
  if (!selectedAllStores) {
    conditions = [
      ...conditions,
      [
        "pos_location_name",
        "IN",
        "",
        ...stores.map((store, index) => {
          return index === stores.length - 1 ? `'${store}'` : `'${store}',`;
        }),
        "",
      ],
    ];
  }

  return {
    query: {
      columns: [
        {
          field: "total_sales",
        },
      ],
      rows: ["variant_sku3_group", "pos_location_name"],
      cube: AnalyticCube.Costs,
      conditions,
      from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
      to:
        selectedDate === moment().format(YYYYMMDD)
          ? moment(selectedDate, YYYYMMDD).subtract(1, "days").format(YYYYMMDD)
          : moment(selectedDate, YYYYMMDD).format(YYYYMMDD),
    },
    options: `time:"completed_at"`,
  };
};

export const STAFFS_PRODUCT_TOTAL_SALES_DAY_QUERY = (
  asmName: string,
  stores: string[],
  staffCodes: string[],
  selectedDate: string,
) => {
  return {
    query: {
      columns: [
        {
          field: "total_sales",
        },
      ],
      rows: ["variant_sku3_group", "assignee_code"],
      cube: AnalyticCube.Costs,
      conditions: [
        ["pos_location_department_lv2", "IN", "", `'${asmName}'`, ""],
        [
          "pos_location_name",
          "IN",
          "",
          ...stores.map((store, index) => {
            return index === stores.length - 1 ? `'${store}'` : `'${store}',`;
          }),
          "",
        ],
        [
          "assignee_code",
          "IN",
          "",
          ...staffCodes.map((staff, index) => {
            return index === staffCodes.length - 1 ? `'${staff}'` : `'${staff}',`;
          }),
          "",
        ],
      ],
      from: selectedDate,
      to: selectedDate,
    },
    options: `time:"completed_at"`,
  };
};

export const STAFFS_PRODUCT_TOTAL_SALES_MONTH_QUERY = (
  asmName: string,
  stores: string[],
  staffCodes: string[],
  selectedDate: string,
) => {
  const { YYYYMMDD } = DATE_FORMAT;
  return {
    query: {
      columns: [
        {
          field: "total_sales",
        },
      ],
      rows: ["variant_sku3_group", "assignee_code"],
      cube: AnalyticCube.Costs,
      conditions: [
        ["pos_location_department_lv2", "IN", "", `'${asmName}'`, ""],
        [
          "pos_location_name",
          "IN",
          "",
          ...stores.map((store, index) => {
            return index === stores.length - 1 ? `'${store}'` : `'${store}',`;
          }),
          "",
        ],
        [
          "assignee_code",
          "IN",
          "",
          ...staffCodes.map((staff, index) => {
            return index === staffCodes.length - 1 ? `'${staff}'` : `'${staff}',`;
          }),
          "",
        ],
      ],
      from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
      to:
        selectedDate === moment().format(YYYYMMDD)
          ? moment(selectedDate, YYYYMMDD).subtract(1, "days").format(YYYYMMDD)
          : moment(selectedDate, YYYYMMDD).format(YYYYMMDD),
    },
    options: `time:"completed_at"`,
  };
};
