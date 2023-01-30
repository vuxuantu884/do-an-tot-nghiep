import UrlConfig from "config/url.config";
import {
  AnalyticCube,
  AnalyticGroup,
  AnalyticTemplateData,
  TimeAtOptionValue,
} from "model/report/analytics.model";
import moment from "moment";
import { DATE_FORMAT } from "utils/DateUtils";

const TODAY = moment().format(DATE_FORMAT.YYYYMMDD);

export const OFFLINE_REPORT_TEMPLATES: AnalyticTemplateData[] = [
  {
    type: "Báo cáo bán hàng",
    name: "theo thời gian",
    query: `SHOW total_sales, net_sales_v2, taxes, orders, return_count, net_quantity, gross_sales, discounts, ordered_point_payments, returns 
    OVER day 
    FROM offline_sales 
    SINCE ${TODAY} UNTIL ${TODAY}
    `,
    chart_query: `SHOW customers, total_sales 
    OVER day 
    FROM offline_sales 
    SINCE ${TODAY} UNTIL ${TODAY}
    `,
    cube: AnalyticCube.OfflineSales,
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    iconImg: "thoi-gian.svg",
    id: 1,
    chartColumnSelected: ["customers", "total_sales"],
    timeAtOption: TimeAtOptionValue.CompletedAt,
    group: AnalyticGroup.OfflineSales,
  },
  {
    id: 2,
    type: "Báo cáo bán hàng",
    name: "theo nhân viên thu ngân",
    query: `SHOW total_sales, net_sales_v2, taxes, cash_payments, transfer_payments, card_payments, qr_pay_payments, ordered_point_payments, payments, unknown_payments 
    BY staff_name, staff_code 
    FROM offline_sales 
    SINCE ${TODAY} UNTIL ${TODAY} 
    `,
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    cube: AnalyticCube.OfflineSales,
    iconImg: "nhan-vien.svg",
    chartColumnSelected: [],
    timeAtOption: TimeAtOptionValue.CompletedAt,
    group: AnalyticGroup.OfflineSales,
  },
  {
    id: 3,
    type: "Báo cáo bán hàng",
    name: "theo nhân viên bán hàng",
    query: `SHOW total_sales, net_sales_v2, taxes, orders, return_count, ordered_net_sales, returns, average_order_value 
    BY assignee_code,assignee_name 
    FROM offline_sales 
    SINCE ${TODAY} UNTIL ${TODAY} 
    ORDER BY total_sales DESC`,
    chart_query: `SHOW ordered_net_sales, returns 
    BY assignee_code, assignee_name   
    FROM offline_sales 
    SINCE ${TODAY} UNTIL ${TODAY} 
    ORDER BY total_sales DESC`,
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    cube: AnalyticCube.OfflineSales,
    iconImg: "nhan-vien.svg",
    chartColumnSelected: ["total_sales", "average_order_value"],
    timeAtOption: TimeAtOptionValue.CompletedAt,
    group: AnalyticGroup.OfflineSales,
  },
  {
    type: "Báo cáo bán hàng",
    name: "theo cửa hàng",
    query: `SHOW total_sales, net_sales_v2, taxes, orders, return_count, ordered_item_quantity, returned_item_quantity, average_order_value, customers 
    BY pos_location_name 
    FROM offline_sales 
    SINCE ${TODAY} UNTIL ${TODAY} ORDER BY total_sales DESC`,
    chart_query: `SHOW total_sales, average_order_value 
    BY pos_location_name 
    FROM offline_sales 
    SINCE ${TODAY} UNTIL ${TODAY} ORDER BY total_sales DESC`,
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    cube: AnalyticCube.OfflineSales,
    iconImg: "cua-hang.svg",
    id: 4,
    chartColumnSelected: ["total_sales", "average_order_value"],
    timeAtOption: TimeAtOptionValue.CompletedAt,
    group: AnalyticGroup.OfflineSales,
  },
  {
    type: "Báo cáo bán hàng",
    name: "theo sản phẩm (mã 3)",
    query: `SHOW total_sales, net_sales_v2, taxes, ordered_item_quantity, returned_item_quantity, gross_sales, discounts, ordered_point_payments, returns  
    BY variant_sku3 
    FROM offline_sales 
    SINCE ${TODAY} UNTIL ${TODAY} 
    ORDER BY total_sales DESC `,
    chart_query: `SHOW total_sales, net_quantity 
    BY variant_sku3 
    FROM offline_sales 
    SINCE ${TODAY} UNTIL ${TODAY} 
    ORDER BY total_sales DESC `,
    cube: AnalyticCube.OfflineSales,
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    iconImg: "san-pham.svg",
    id: 5,
    chartColumnSelected: ["total_sales", "net_quantity"],
    timeAtOption: TimeAtOptionValue.CompletedAt,
    group: AnalyticGroup.OfflineSales,
  },
  // {
  //   type: "Báo cáo trả hàng",
  //   name: " theo nhân viên",
  //   query: `SHOW returns, returned_item_quantity
  //   BY staff_name
  //   FROM offline_sales
  //   WHERE sale_kind IN ('Trả hàng')
  //   SINCE ${TODAY} UNTIL ${TODAY}
  //   ORDER BY returns DESC`,
  //   cube: AnalyticCube.OfflineSales,
  //   alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
  //   iconImg: "nhan-vien-tra-hang.svg",
  //   id: 7,
  //   chartColumnSelected: ['returns', 'returned_item_quantity'],
  //   timeAtOption: TimeAtOptionValue.CompletedAt,
  // },
  {
    type: "Báo cáo bán hàng",
    name: "theo sản phẩm (mã 7)",
    query: `SHOW total_sales, net_sales_v2, taxes, ordered_item_quantity, returned_item_quantity, gross_sales, discounts, ordered_point_payments, returns 
    BY variant_sku7 
    FROM offline_sales 
    SINCE ${TODAY} UNTIL ${TODAY} 
    ORDER BY total_sales DESC`,
    chart_query: `SHOW total_sales, net_quantity  
    BY variant_sku7 
    FROM offline_sales 
    SINCE ${TODAY} UNTIL ${TODAY} 
    ORDER BY total_sales DESC`,
    cube: AnalyticCube.OfflineSales,
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    iconImg: "san-pham.svg",
    id: 6,
    chartColumnSelected: ["total_sales", "net_quantity"],
    timeAtOption: TimeAtOptionValue.CompletedAt,
    group: AnalyticGroup.OfflineSales,
  },
  {
    type: "Báo cáo bán hàng",
    name: "theo khách hàng",
    query: `SHOW total_sales, net_sales_v2, taxes, ordered_item_quantity, returned_item_quantity, gross_sales, discounts, ordered_point_payments, returns 
    BY customer_name, customer_phone_number 
    FROM offline_sales 
    SINCE ${TODAY} UNTIL ${TODAY} 
    ORDER BY total_sales DESC `,
    cube: AnalyticCube.OfflineSales,
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    iconImg: "khach-hang.svg",
    id: 7,
    chartColumnSelected: [],
    timeAtOption: TimeAtOptionValue.CompletedAt,
    group: AnalyticGroup.OfflineSales,
  },
];
