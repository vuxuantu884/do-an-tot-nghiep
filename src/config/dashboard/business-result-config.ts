import { BusinessResultChartKey } from "model/dashboard/dashboard.model";
import { AnalyticSampleQuery } from "model/report/analytics.model";
import { LAST_3_MONTHS, START_OF_MONTH, TODAY } from "./time-query-config";

export const BUSINESS_RESULT_CHART_LABEL = {
    [BusinessResultChartKey.CURRENT_MONTH]: "Tháng này",
    [BusinessResultChartKey.AVERAGE_OF_LAST_3_MONTH]: "Trung bình 3 tháng trước",
};

export const BUSINESS_RESULT_CART_NAME = {
    online: "online",
    offline: "offline",
    return: "return",
    cancel: "cancel",
    successRate: "successRate",
    averageOrder: "averageOrder",
    conversionRate: "conversionRate",
    chart: "chart",
}

export const BUSINESS_RESULT_CART_LABEL = {
    [BUSINESS_RESULT_CART_NAME.online]: "Doanh thu online",
    [BUSINESS_RESULT_CART_NAME.offline]: "Doanh thu offline",
    [BUSINESS_RESULT_CART_NAME.return]: "Doanh thu Trả hàng",
    [BUSINESS_RESULT_CART_NAME.cancel]: "Doanh thu Huỷ đơn",
    [BUSINESS_RESULT_CART_NAME.successRate]: "Tỉ lệ thành công",
    [BUSINESS_RESULT_CART_NAME.averageOrder]: "GTTB/ Hóa đơn",
    [BUSINESS_RESULT_CART_NAME.conversionRate]: "Tỉ lệ chuyển đổi",
};

export enum ReportDatavalue {
    KD_ONLINE = "Khối KD Online",
    KD_OFFLINE = "Khối KD Offline",
}

export enum ReportDataColumn {
    returns = "returns"
}

export const BUSINESS_RESULT_QUERY_TOTAL_SALES_COMPLETED: AnalyticSampleQuery = {
    /**
     * query cho : Doanh thu Offline, Doanh thu Online, Doanh thu Trả hàng
     * 
     * Tổng trả : sumary column : returns
     * Khối KD Offline: column[1] của row column[0] == "Khối KD Offline"
     * Khối KD Online: column[1] của row column[0] == "Khối KD Online"
     */
    query: {
        columns: [{
            field: "total_sales"
        },
        {
            field: "returns"
        }
        ],
        rows: ["day", "sale_area"],
        cube: "sales",
        conditions: [],
        from: START_OF_MONTH,
        to: TODAY,
    },
    options: `time:"completed_at"`
};



// export const BUSINESS_RESULT_CANCELED_QUERY = `SHOW net_sales FROM sales WHERE order_status IN ('Hủy') SINCE ${TODAY} UNTIL ${TODAY} ORDER BY net_sales DESC
// options: time:"cancelled_at"`


export const BUSINESS_RESULT_AVG_ORDER_VALUE_TODAY_QUERY: AnalyticSampleQuery = {
    // q: `SHOW average_order_value FROM sales SINCE ${TODAY} UNTIL ${TODAY}`,
    query: {
        columns: [{
            field: "average_order_value"
        }],
        rows: [],
        cube: "sales",
        conditions: [],
        from: TODAY,
        to: TODAY,
    },
    options: `time:"completed_at"`
};

export const BUSINESS_RESULT_AVG_ORDER_VALUE_CURRENT_MONTH_QUERY: AnalyticSampleQuery = {
    // q: `SHOW average_order_value FROM sales SINCE ${START_OF_MONTH} UNTIL ${TODAY}`,
    query: {
        columns: [{
            field: "average_order_value"
        }],
        rows: [],
        cube: "sales",
        conditions: [],
        from: START_OF_MONTH,
        to: TODAY,
    },
    options: `time:"completed_at"`
};




export const BUSINESS_RESULT_LAST_3_MONTHS_QUERY: AnalyticSampleQuery = {
    // q: `SHOW total_sales OVER FROM  sales SINCE 2022-04-01 UNTIL 2022-04-14`,
    query: {
        columns: [{
            field: "total_sales"
        }],
        rows: ["day"],
        cube: "sales",
        conditions: [],
        from: LAST_3_MONTHS[0],
        to: LAST_3_MONTHS[1],
    },
    options: `time:"completed_at"`
}

export const BUSINESS_RESULT_CURRRENT_MONTHS_QUERY: AnalyticSampleQuery = {
    // q: `SHOW total_sales OVER FROM  sales SINCE 2022-04-01 UNTIL 2022-04-14`,
    query: {
        columns: [{
            field: "total_sales"
        }],
        rows: ["day"],
        cube: "sales",
        conditions: [],
        from: START_OF_MONTH,
        to: TODAY,
    },
    options: `time:"completed_at"`
}

export const BUSINESS_RESULT_CHART_TEMPLATE: Array<AnalyticSampleQuery> = [
    BUSINESS_RESULT_LAST_3_MONTHS_QUERY,
    BUSINESS_RESULT_CURRRENT_MONTHS_QUERY,
]