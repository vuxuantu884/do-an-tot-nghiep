import UrlConfig from "config/url.config";
import { AnalyticCube, AnalyticTemplateData, TimeAtOptionValue } from "model/report/analytics.model";
import moment from "moment";
import { DATE_FORMAT } from "utils/DateUtils";

const TODAY = moment().format(DATE_FORMAT.YYYYMMDD);
const START_OF_MONTH = moment().startOf("month").format(DATE_FORMAT.YYYYMMDD);

export const OFFLINE_REPORT_TEMPLATES: AnalyticTemplateData[] = [
  {
    type: "Báo cáo bán hàng",
    name: "theo thời gian",
    query: `SHOW orders, return_count, net_quantity, gross_sales, returns, discounts, ordered_point_payments, total_sales  
    OVER day 
    FROM offline_sales 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY}
    `,
    chart_query: `SHOW customers, total_sales 
    OVER day 
    FROM offline_sales 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY}
    `,
    cube: AnalyticCube.OfflineSales,
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    iconImg: "thoi-gian.svg",
    id: 1,
    chartColumnSelected: ['customers', 'total_sales'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    id: 2,
    type: "Báo cáo bán hàng",
    name: "theo nhân viên thu ngân",
    query: `SHOW total_sales, cash_payments, transfer_payments, card_payments, qr_pay_payments, ordered_point_payments, payments, unknown_payments 
    BY staff_name, staff_code 
    FROM offline_sales 
    SINCE ${TODAY} UNTIL ${TODAY} 
    `,
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    cube: AnalyticCube.OfflineSales,
    iconImg: "nhan-vien.svg",
    chartColumnSelected: [],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    id: 3,
    type: "Báo cáo bán hàng",
    name: "theo nhân viên bán hàng",
    query: `SHOW orders, return_count, ordered_net_sales, returns, total_sales, average_order_value 
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
    chartColumnSelected: ['total_sales', 'average_order_value'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    type: "Báo cáo bán hàng",
    name: "theo cửa hàng",
    query: `SHOW orders, return_count, ordered_item_quantity, returned_item_quantity, total_sales, average_order_value, customers 
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
    chartColumnSelected: ['total_sales', 'average_order_value'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    type: "Báo cáo bán hàng",
    name: "theo sản phẩm (mã 3)",
    query: `SHOW ordered_item_quantity, returned_item_quantity, gross_sales, discounts, ordered_point_payments, returns, total_sales 
    BY variant_sku3 
    FROM offline_sales 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY total_sales DESC `,
    chart_query: `SHOW total_sales, net_quantity 
    BY variant_sku3 
    FROM offline_sales 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY total_sales DESC `,
    cube: AnalyticCube.OfflineSales,
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    iconImg: "san-pham.svg",
    id: 5,
    chartColumnSelected: ['total_sales', 'net_quantity'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  // {
  //   type: "Báo cáo trả hàng",
  //   name: " theo nhân viên",
  //   query: `SHOW returns, returned_item_quantity 
  //   BY staff_name 
  //   FROM offline_sales
  //   WHERE sale_kind IN ('Trả hàng')  
  //   SINCE ${START_OF_MONTH} UNTIL ${TODAY}
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
    query: `SHOW ordered_item_quantity, returned_item_quantity, gross_sales, discounts, ordered_point_payments, returns, total_sales 
    BY variant_sku7 
    FROM offline_sales 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY total_sales DESC`,
    chart_query: `SHOW total_sales, net_quantity  
    BY variant_sku7 
    FROM offline_sales 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY total_sales DESC`,
    cube: AnalyticCube.OfflineSales,
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    iconImg: "san-pham.svg",
    id: 6,
    chartColumnSelected: ['total_sales', 'net_quantity'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    type: "Báo cáo bán hàng",
    name: "theo khách hàng",
    query: `SHOW ordered_item_quantity, returned_item_quantity, gross_sales, discounts, ordered_point_payments, returns, total_sales 
    BY customer_name, customer_phone_number 
    FROM offline_sales 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY total_sales DESC `,
    cube: AnalyticCube.OfflineSales,
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    iconImg: "khach-hang.svg",
    id: 7,
    chartColumnSelected: [],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  }
]