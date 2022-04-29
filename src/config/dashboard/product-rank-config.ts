import { AnalyticSampleQuery } from "model/report/analytics.model"
import { TODAY } from "./time-query-config"
export const PRODUCT_RANK_TAB_KEY = {
    total_sales: "total_sales",
    net_quantity: "net_quantity",
};
export const PRODUCT_RANK_TAB_NAME = {
    [PRODUCT_RANK_TAB_KEY.total_sales]: "Doanh thu",
    [PRODUCT_RANK_TAB_KEY.net_quantity]: "Số lượng",
};
export const TOP_SALES_PRODUCT_TEMPLATE: AnalyticSampleQuery = {
    // q:SHOW total_sales BY variant_sku3_group FROM sales SINCE 2022-04-15 UNTIL 2022-04-15 ORDER BY total_sales DESC 
    query: {
        columns: [
            {
                field: "total_sales"
            },
            {
                field: "net_quantity"
            }
        ],
        rows: ["variant_sku3_group"],
        cube: "sales",
        // conditions: [["variant_sku3_group", "!=", ""]],
        from: TODAY,
        to: TODAY,
        order_by: [["total_sales", "DESC"]]
    },
    options: `time:"completed_at"`
}

 