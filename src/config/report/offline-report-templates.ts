import UrlConfig from "config/url.config";
import { AnalyticTemplateData, TimeAtOptionValue } from "model/report/analytics.model";
import moment from "moment";
import { DATE_FORMAT } from "utils/DateUtils";

const TODAY = moment().format(DATE_FORMAT.YYYYMMDD);
const START_OF_MONTH = moment().startOf("month").format(DATE_FORMAT.YYYYMMDD);

export const OFFLINE_REPORT_TEMPLATES: AnalyticTemplateData[] = [
  {
    type: "Báo cáo bán hàng",
    name: "theo thời gian",
    query: `SHOW orders, return_count, net_quantity, gross_sales, returns, discounts, point_payments, total_sales  
    OVER day 
    FROM sales 
    WHERE channel_provider_name IN ('POS') 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY}
    `,
    chart_query: `SHOW customers, total_sales 
    OVER day 
    FROM sales 
    WHERE channel_provider_name IN ('POS') 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY}
    `,
    cube: "sales",
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
    query: `SHOW cash_payments, transfer_payments, card_payments, qr_pay_payments, point_payments, payments, unknown_payments, net_payments   
    BY staff_name, staff_code 
    FROM sales 
    WHERE channel_provider_name IN ('POS') 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    `,
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    cube: "sales",
    iconImg: "nhan-vien.svg",
    chartColumnSelected: [],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    id: 3,
    type: "Báo cáo bán hàng",
    name: "theo nhân viên bán hàng",
    query: `SHOW orders, return_count, ordered_item_quantity, returned_item_quantity, discounts, point_payments, total_sales, average_order_value 
    BY assignee_code,assignee_name   
    FROM sales 
    WHERE channel_provider_name IN ('POS') 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY total_sales DESC`,
    chart_query: `SHOW total_sales, average_order_value 
    BY assignee_code,assignee_name   
    FROM sales 
    WHERE channel_provider_name IN ('POS') 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY total_sales DESC`,
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    cube: "sales",
    iconImg: "nhan-vien.svg",
    chartColumnSelected: ['total_sales', 'average_order_value'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    type: "Báo cáo bán hàng",
    name: "theo cửa hàng",
    query: `SHOW orders, return_count, ordered_item_quantity, returned_item_quantity, total_sales, average_order_value, customers 
    BY pos_location_name 
    FROM sales 
    WHERE channel_provider_name IN ('POS') 
    SINCE ${TODAY} UNTIL ${TODAY} ORDER BY total_sales DESC`,
    chart_query: `SHOW total_sales, average_order_value 
    BY pos_location_name 
    FROM sales 
    WHERE channel_provider_name IN ('POS') 
    SINCE ${TODAY} UNTIL ${TODAY} ORDER BY total_sales DESC`,
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    cube: "sales",
    iconImg: "cua-hang.svg",
    id: 4,
    chartColumnSelected: ['total_sales', 'average_order_value'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    type: "Báo cáo bán hàng",
    name: "theo sản phẩm (mã 3)",
    query: `SHOW ordered_item_quantity, returned_item_quantity, gross_sales, returns, discounts, point_payments, total_sales 
    BY variant_sku3 
    FROM sales 
    WHERE channel_provider_name IN ('POS') 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY total_sales DESC `,
    chart_query: `SHOW total_sales, net_quantity 
    BY variant_sku3 
    FROM sales 
    WHERE channel_provider_name IN ('POS') 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY total_sales DESC `,
    cube: "sales",
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
  //   FROM sales
  //   WHERE sale_kind IN ('Trả hàng')  
  //   SINCE ${START_OF_MONTH} UNTIL ${TODAY}
  //   ORDER BY returns DESC`,
  //   cube: "sales",
  //   alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
  //   iconImg: "nhan-vien-tra-hang.svg",
  //   id: 7,
  //   chartColumnSelected: ['returns', 'returned_item_quantity'],
  //   timeAtOption: TimeAtOptionValue.CompletedAt,
  // },
  {
    type: "Báo cáo bán hàng",
    name: "theo sản phẩm (mã 7)",
    query: `SHOW ordered_item_quantity, returned_item_quantity, gross_sales, returns, discounts, point_payments, total_sales 
    BY variant_sku7 
    FROM sales 
    WHERE channel_provider_name IN ('POS')   
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY total_sales DESC`,
    chart_query: `SHOW total_sales, net_quantity  
    BY variant_sku7 
    FROM sales 
    WHERE channel_provider_name IN ('POS')   
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY total_sales DESC`,
    cube: "sales",
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    iconImg: "san-pham.svg",
    id: 6,
    chartColumnSelected: ['total_sales', 'net_quantity'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    type: "Báo cáo bán hàng",
    name: "theo khách hàng",
    query: `SHOW ordered_item_quantity, returned_item_quantity, gross_sales, returns, discounts, point_payments, total_sales 
    BY customer_name,customer_phone_number 
    FROM sales 
    WHERE channel_provider_name IN ('POS') 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY total_sales DESC `,
    cube: "sales",
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    iconImg: "khach-hang.svg",
    id: 7,
    chartColumnSelected: [],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    type: "Báo cáo thanh toán",
    name: "theo nhân viên",
    query: `SHOW payments, cash_payments, transfer_payments, cod_payments, point_payments, card_payments, qr_pay_payments, unknown_payments  
    BY staff_name 
    FROM payments 
    SINCE ${TODAY}  UNTIL ${TODAY} 
    ORDER BY payments DESC     `,
    chart_query: `SHOW payments  
    BY staff_name 
    FROM payments 
    SINCE ${TODAY}  UNTIL ${TODAY} 
    ORDER BY payments DESC     `,
    cube: "payments",
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    iconImg: "nhan-vien-thanh-toan.svg",
    id: 8,
    chartColumnSelected: ['payments'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    type: "Báo cáo thanh toán",
    name: " theo cửa hàng",
    query: `SHOW  payments, cash_payments, transfer_payments, cod_payments, point_payments, card_payments, qr_pay_payments, unknown_payments 
    BY pos_location_name
    FROM payments 
    SINCE ${TODAY}  UNTIL ${TODAY} 
    ORDER BY payments DESC `,
    chart_query: `SHOW  payments 
    BY pos_location_name
    FROM payments 
    SINCE ${TODAY}  UNTIL ${TODAY} 
    ORDER BY payments DESC `,
    cube: "payments",
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    iconImg: "cua-hang-thanh-toan.svg",
    id: 9,
    chartColumnSelected: ['payments'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    type: "Báo cáo thanh toán",
    name: "theo phương thức thanh toán",
    query: `SHOW payments 
    BY payment_method_name
    FROM payments 
    SINCE ${TODAY}  UNTIL ${TODAY}  
    ORDER BY payments DESC `,
    chart_query: `SHOW payments 
    BY payment_method_name
    FROM payments 
    SINCE ${TODAY}  UNTIL ${TODAY}  
    ORDER BY payments DESC `,
    cube: "payments",
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    iconImg: "phuong-thuc-thanh-toan.svg",
    id: 10,
    chartColumnSelected: ['payments'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    type: "Báo cáo thanh toán",
    name: " theo thời gian",
    query: `SHOW payments, cash_payments, transfer_payments, cod_payments, point_payments, card_payments, qr_pay_payments, unknown_payments 
    BY hour 
    FROM payments  
    SINCE ${TODAY}  UNTIL ${TODAY}  
    ORDER BY hour DESC `,
    chart_query: `SHOW payments 
    BY hour 
    FROM payments  
    SINCE ${TODAY}  UNTIL ${TODAY}  
    ORDER BY hour DESC `,
    cube: "payments",
    alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
    iconImg: "thoi-gian-thanh-toan.svg",
    id: 11,
    chartColumnSelected: ['payments'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  // {
  //   type: "Báo cáo thanh toán",
  //   name: "theo ngân hàng",
  //   query: `SHOW payments BY bank_name FROM payments 
  //   SINCE ${TODAY} UNTIL ${TODAY}
  //   ORDER BY payments DESC `,
  //   cube: "payments",
  //   alias: [UrlConfig.ANALYTIC_SALES_OFFLINE],
  //   iconImg: "tk-ngan-hang-thanh-toan.svg",
  //   id: 12,
  //   chartColumnSelected: ['payments']
  // },
]