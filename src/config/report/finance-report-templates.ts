import UrlConfig from "config/url.config";
import { AnalyticCube, AnalyticGroup, AnalyticTemplateData, TimeAtOptionValue } from "model/report";
import moment from "moment";
import { DATE_FORMAT } from "utils/DateUtils";

const TODAY = moment().format(DATE_FORMAT.YYYYMMDD);

export const FINANCE_REPORT_TEMPLATES: AnalyticTemplateData[] = [
  {
    id: 1,
    type: "Báo cáo lợi nhuận",
    name: "theo nhân viên",
    query: `SHOW net_sales_v2, taxes, total_sales, gross_profit, orders, net_quantity, return_count, average_order_value BY staff_name FROM costs 
    SINCE ${TODAY} UNTIL ${TODAY} 
    ORDER BY gross_profit DESC`,
    chart_query: `SHOW gross_profit BY staff_name FROM costs 
    SINCE ${TODAY} UNTIL ${TODAY} 
    ORDER BY gross_profit DESC`,
    alias: [UrlConfig.ANALYTIC_FINACE],
    cube: AnalyticCube.Costs,
    iconImg: "nhan-vien.svg",
    chartColumnSelected: ["gross_profit"],
    timeAtOption: TimeAtOptionValue.CompletedAt,
    group: AnalyticGroup.Costs,
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo cửa hàng",
    query: `SHOW net_sales_v2, taxes, total_sales, gross_profit, orders, return_count, net_quantity, average_order_value BY pos_location_name FROM costs WHERE channel_provider_name IN ('Bán lẻ') 
    SINCE ${TODAY} UNTIL ${TODAY}    ORDER BY gross_profit DESC`,
    chart_query: `SHOW gross_margin BY pos_location_name FROM costs WHERE channel_provider_name IN ('Bán lẻ') 
    SINCE ${TODAY} UNTIL ${TODAY}    ORDER BY gross_profit DESC`,
    alias: [UrlConfig.ANALYTIC_FINACE],
    cube: AnalyticCube.Costs,
    iconImg: "cua-hang.svg",
    id: 2,
    chartColumnSelected: ["gross_margin"],
    timeAtOption: TimeAtOptionValue.CompletedAt,
    group: AnalyticGroup.Costs,
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo nguồn bán hàng",
    query: `SHOW pre_total_sales, net_sales_v2, taxes, total_sales, gross_profit, pre_orders, orders, return_count BY channel_provider_name,source_name FROM costs WHERE sale_area IN ('Khối KD Online') 
    SINCE ${TODAY} UNTIL ${TODAY} 
    ORDER BY gross_profit DESC `,
    chart_query: `SHOW gross_margin BY channel_provider_name,source_name FROM costs WHERE sale_area IN ('Khối KD Online') 
    SINCE ${TODAY} UNTIL ${TODAY} 
    ORDER BY gross_profit DESC `,
    cube: AnalyticCube.Costs,
    alias: [UrlConfig.ANALYTIC_FINACE],
    iconImg: "nguon-ban-hang.svg",
    id: 3,
    chartColumnSelected: ["gross_margin"],
    timeAtOption: TimeAtOptionValue.CreatedAt,
    group: AnalyticGroup.Costs,
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo sản phẩm",
    query: `SHOW net_sales_v2, taxes, total_sales, gross_profit, gross_margin, ordered_item_quantity, returned_item_quantity, net_quantity BY variant_sku3 FROM costs 
    SINCE ${TODAY} UNTIL ${TODAY} 
    ORDER BY gross_profit DESC `,
    chart_query: `SHOW gross_profit BY variant_sku3 FROM costs 
    SINCE ${TODAY} UNTIL ${TODAY} 
    ORDER BY gross_profit DESC `,
    cube: AnalyticCube.Costs,
    alias: [UrlConfig.ANALYTIC_FINACE],
    iconImg: "san-pham.svg",
    id: 4,
    chartColumnSelected: ["gross_profit"],
    timeAtOption: TimeAtOptionValue.CompletedAt,
    group: AnalyticGroup.Costs,
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo thời gian",
    query: `SHOW net_sales_v2, taxes, total_sales, gross_profit, orders, return_count, net_quantity, average_order_value OVER day FROM costs 
    SINCE ${TODAY} UNTIL ${TODAY}
    `,
    chart_query: `SHOW gross_profit OVER day FROM costs 
    SINCE ${TODAY} UNTIL ${TODAY}
    `,
    cube: AnalyticCube.Costs,
    alias: [UrlConfig.ANALYTIC_FINACE],
    iconImg: "thoi-gian.svg",
    id: 5,
    chartColumnSelected: ["gross_profit"],
    timeAtOption: TimeAtOptionValue.CompletedAt,
    group: AnalyticGroup.Costs,
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo khách hàng",
    query: `SHOW net_sales_v2, taxes, total_sales, gross_profit, orders, net_quantity, return_count, average_order_value BY customer_name,customer_phone_number FROM costs SINCE ${TODAY} UNTIL ${TODAY} 
    ORDER BY gross_profit DESC `,
    cube: AnalyticCube.Costs,
    alias: [UrlConfig.ANALYTIC_FINACE],
    iconImg: "khach-hang.svg",
    id: 6,
    chartColumnSelected: [],
    timeAtOption: TimeAtOptionValue.CompletedAt,
    group: AnalyticGroup.Costs,
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo nhóm khách hàng",
    query: `SHOW net_sales_v2, taxes, total_sales, average_order_value, gross_profit, orders, return_count, net_quantity BY customer_group FROM costs 
    SINCE ${TODAY}  UNTIL ${TODAY} 
    ORDER BY gross_profit desc `,
    chart_query: `SHOW gross_profit BY customer_group FROM costs 
    SINCE ${TODAY}  UNTIL ${TODAY} 
    ORDER BY gross_profit desc `,
    cube: AnalyticCube.Costs,
    iconImg: "ban-hang-nhom kh.png",
    alias: [UrlConfig.ANALYTIC_FINACE],
    id: 15,
    chartColumnSelected: ["gross_profit"],
    timeAtOption: TimeAtOptionValue.CompletedAt,
    group: AnalyticGroup.Costs,
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo địa chỉ giao hàng",
    query: `SHOW net_sales_v2, taxes, total_sales, gross_profit, gross_margin, orders, return_count, net_quantity, customers, average_order_value BY shipping_city FROM costs WHERE sale_area IN ('Khối KD Online') 
      SINCE ${TODAY}  UNTIL ${TODAY} 
      ORDER BY gross_profit desc `,
    chart_query: `SHOW gross_profit, gross_margin BY shipping_city FROM costs WHERE sale_area IN ('Khối KD Online') 
      SINCE ${TODAY}  UNTIL ${TODAY} 
      ORDER BY gross_profit desc `,
    cube: AnalyticCube.Costs,
    iconImg: "dia-chi-kh.png",
    alias: [UrlConfig.ANALYTIC_FINACE],
    id: 16,
    chartColumnSelected: ["gross_profit", "gross_margin"],
    timeAtOption: TimeAtOptionValue.CompletedAt,
    group: AnalyticGroup.Costs,
  },
];
