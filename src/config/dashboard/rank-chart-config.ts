import { AnalyticSampleQuery } from "model/report/analytics.model";
import { TODAY } from "./time-query-config";

export const MAX_TOP_RANK = 5;

export const TOP_CHARTS_KEY = {
    TOP_STAFF_SALES: "TOP_STAFF_SALES",
    TOP_SHOP_SALES: "TOP_SHOP_SALES",
    TOP_DEPARTMENT_SALES: "TOP_DEPARTMENT_SALES",
}

export const TOP_SALES_BY_STAFF: AnalyticSampleQuery = {
    // q: SHOW total_sales, average_order_value BY assignee_code,assignee_name FROM sales SINCE 2022-04-15 UNTIL 2022-04-15 ORDER BY total_sales DESC 
    query: {
        columns: [{
            field: "total_sales"
        },
        {
            field: "average_order_value"
        }
        ],
        rows: ["assignee_code", "assignee_name"],
        cube: "sales",
        conditions: [["assignee_code", "!=", ""]],
        from: TODAY,
        to: TODAY,
        order_by: [["total_sales", "DESC"]]
    },
    options: `time:"completed_at"`
}

export const TOP_SALES_BY_SHOP_ONLINE: AnalyticSampleQuery = {
    // q: SHOW total_sales, average_order_value BY source_department_name FROM sales SINCE 2022-04-15 UNTIL 2022-04-15 ORDER BY total_sales DESC
    query: {
        columns: [{
            field: "total_sales"
        },
        {
            field: "average_order_value"
        }
        ],
        rows: ["source_department_name"],
        cube: "sales",
        conditions: [["source_department_name", "!=", ""]],
        from: TODAY,
        to: TODAY,
        order_by: [["total_sales", "DESC"]]
    },
    options: `time:"completed_at"`
}

export const TOP_SALES_BY_SHOP_OFFLINE: AnalyticSampleQuery = {
    // q: SHOW total_sales, average_order_value BY source_department_name FROM sales SINCE 2022-04-15 UNTIL 2022-04-15 ORDER BY total_sales DESC
    query: {
        columns: [{
            field: "total_sales"
        },
        {
            field: "average_order_value"
        }
        ],
        rows: ["pos_location_name"],
        cube: "sales",
        conditions: [["pos_location_name", "!=", ""]],
        from: TODAY,
        to: TODAY,
        order_by: [["total_sales", "DESC"]]
    },
    options: `time:"completed_at"`
}

export const TOP_SALES_BY_SOURCE_DEPARMENT_LV2: AnalyticSampleQuery = {
    // q: SHOW total_sales, average_order_value BY source_department_name FROM sales SINCE 2022-04-15 UNTIL 2022-04-15 ORDER BY total_sales DESC
    query: {
        columns: [{
            field: "total_sales"
        },
        {
            field: "average_order_value"
        }
        ],
        rows: ["source_department_lv2"],
        cube: "sales",
        conditions: [["source_department_lv2", "!=", ""]],
        from: TODAY,
        to: TODAY,
        order_by: [["total_sales", "DESC"]]
    },
    options: `time:"completed_at"`
}

export const TOP_SALES_BY_POS_DEPARMENT_LV2: AnalyticSampleQuery = {
    // q: SHOW total_sales, average_order_value BY source_department_name FROM sales SINCE 2022-04-15 UNTIL 2022-04-15 ORDER BY total_sales DESC
    query: {
        columns: [{
            field: "total_sales"
        },
        {
            field: "average_order_value"
        }
        ],
        rows: ["pos_location_department_lv2"],
        cube: "sales",
        conditions: [["pos_location_department_lv2", "!=", ""]],
        from: TODAY,
        to: TODAY,
        order_by: [["total_sales", "DESC"]]
    },
    options: `time:"completed_at"`
}
