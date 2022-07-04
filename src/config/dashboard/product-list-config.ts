import { AnalyticSampleQuery } from "model/report/analytics.model";
import { TODAY } from "./time-query-config";
export enum PRODUCT_LIST_TAB_KEY {
    TotalSales = "totalSales",
    NetQuantity = "netQuantity",
    OnHand = 'onHand'
};
export const PRODUCT_LIST_TAB_NAME = {
    [PRODUCT_LIST_TAB_KEY.TotalSales]: "Doanh thu",
    [PRODUCT_LIST_TAB_KEY.NetQuantity]: "SL",
    [PRODUCT_LIST_TAB_KEY.OnHand]: "Tồn trong kho",
};

export const PAGE_SIZE = 8;

export const PRODUCT_LIST_CONFIG: AnalyticSampleQuery = {
    // q: SHOW total_sales, net_quantity BY product_name,variant_sku FROM sales SINCE 2022-06-09 UNTIL 2022-06-09 ORDER BY total_sales DESC 
    // options: time:"completed_at"
    query: {
        columns: [
            {
                field: "total_sales"
            },
            {
                field: "net_quantity"
            }
        ],
        rows: ["variant_name", "variant_sku", "variant_sku7"],
        cube: "sales",
        from: TODAY,
        to: TODAY,
        order_by: [["total_sales", "DESC"]]
    },
    options: `time:"completed_at"`
}

