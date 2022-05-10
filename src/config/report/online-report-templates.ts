import UrlConfig from "config/url.config";
import { AnalyticCube, AnalyticTemplateData, TimeAtOptionValue } from "model/report/analytics.model";
import moment from "moment";
import { DATE_FORMAT } from "utils/DateUtils";

const TODAY = moment().format(DATE_FORMAT.YYYYMMDD);
const START_OF_MONTH = moment().startOf("month").format(DATE_FORMAT.YYYYMMDD);

export const ONLINE_REPORT_TEMPLATES: AnalyticTemplateData[] = [
  {
    type: "Báo cáo đơn hàng",
    name: "theo nhân viên bán hàng",
    query: `SHOW pre_orders, return_count, pre_total_sales BY assignee_code,assignee_name FROM sales WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy') 
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY pre_total_sales DESC `,
    chart_query: `SHOW pre_total_sales BY assignee_code,assignee_name FROM sales WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy') 
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY pre_total_sales DESC `,
    cube: AnalyticCube.Sales,
    alias: [UrlConfig.ANALYTIC_SALES_ONLINE],
    iconImg: "nhan-vien.svg",
    id: 1,
    chartColumnSelected: ['pre_total_sales'],
    timeAtOption: TimeAtOptionValue.CreatedAt,
  },
  {
    type: "Báo cáo đơn hàng",
    name: "theo nhân viên marketing",
    query: `SHOW pre_orders, return_count, pre_total_sales BY marketer_code,marketer_name FROM sales WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy')  
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY pre_total_sales DESC `,
    chart_query: `SHOW pre_total_sales, pre_orders BY marketer_code,marketer_name FROM sales WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy')  
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY pre_total_sales DESC `,
    cube: AnalyticCube.Sales,
    alias: [UrlConfig.ANALYTIC_SALES_ONLINE],
    iconImg: "nhan-vien.svg",
    id: 2,
    chartColumnSelected: ['pre_total_sales', 'pre_orders'],
    timeAtOption: TimeAtOptionValue.CreatedAt,
  },
  {
    type: "Báo cáo đơn hàng",
    name: "theo nhân viên vận đơn",
    query: `SHOW pre_total_sales BY coordinator_name,coordinator_code,order_sub_status FROM sales WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy') 
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY pre_total_sales DESC `,
    chart_query: `SHOW pre_total_sales BY coordinator_name,coordinator_code,order_sub_status FROM sales WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy')  
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY pre_total_sales DESC `,
    cube: AnalyticCube.Sales,
    alias: [UrlConfig.ANALYTIC_SALES_ONLINE],
    iconImg: "nhan-vien.svg",
    id: 3,
    chartColumnSelected: ['pre_total_sales'],
    timeAtOption: TimeAtOptionValue.CreatedAt,
  },
  {
    type: "Báo cáo đơn hàng",
    name: "theo kênh bán",
    query: `SHOW pre_orders, return_count, pre_total_sales, total_sales BY channel_provider_name,source_name FROM sales WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy')  
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY total_sales DESC `,
    chart_query: `SHOW total_sales BY channel_provider_name,source_name FROM sales WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy')  
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY total_sales DESC `,
    cube: AnalyticCube.Sales,
    alias: [UrlConfig.ANALYTIC_SALES_ONLINE],
    iconImg: "nguon-ban-hang.svg",
    id: 4,
    chartColumnSelected: ['total_sales'],
    timeAtOption: TimeAtOptionValue.CreatedAt,
  },
  {
    type: "Báo cáo đơn hàng",
    name: "theo đơn tạo",
    query: `SHOW pre_orders, return_count, pre_total_sales, total_sales OVER day FROM sales WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy')  
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY pre_total_sales DESC`,
    chart_query: `SHOW total_sales OVER day FROM sales WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy')  
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY pre_total_sales DESC`,
    cube: AnalyticCube.Sales,
    alias: [UrlConfig.ANALYTIC_SALES_ONLINE],
    iconImg: "nguon-ban-hang.svg",
    id: 5,
    chartColumnSelected: ['total_sales'],
    timeAtOption: TimeAtOptionValue.CreatedAt,
  },
  {
    type: "Báo cáo đơn hàng",
    name: "theo đơn thành công",
    query: `SHOW orders, return_count, total_sales, net_quantity, average_order_value, customers 
        OVER day 
        FROM sales 
        WHERE sale_area IN ('Khối KD Online') 
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        `,
    chart_query: `SHOW total_sales, average_order_value  
        OVER day 
        FROM sales 
        WHERE sale_area IN ('Khối KD Online') 
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        `,
    cube: AnalyticCube.Sales,
    alias: [UrlConfig.ANALYTIC_SALES_ONLINE],
    iconImg: "nguon-ban-hang.svg",
    id: 6,
    chartColumnSelected: ['total_sales', 'average_order_value'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    type: "Báo cáo đơn hàng",
    name: "theo shop",
    query: `SHOW pre_orders, return_count, pre_total_sales, total_sales BY source_department_lv2,source_department_name FROM sales WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy')  
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY pre_total_sales DESC `,
    chart_query: `SHOW pre_total_sales BY source_department_lv2,source_department_name FROM sales WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy')  
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY pre_total_sales DESC `,
    cube: AnalyticCube.Sales,
    alias: [UrlConfig.ANALYTIC_SALES_ONLINE],
    iconImg: "nguon-ban-hang.svg",
    id: 7,
    chartColumnSelected: ['pre_total_sales'],
    timeAtOption: TimeAtOptionValue.CreatedAt,
  },
  {
    type: "Báo cáo đơn hàng",
    name: "theo trạng thái đơn hàng",
    query: `SHOW pre_orders, pre_total_sales BY order_sub_status FROM sales WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy')  
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY pre_total_sales DESC`,
    chart_query: `SHOW pre_total_sales, pre_orders BY order_sub_status FROM sales WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy')  
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY pre_total_sales DESC`,
    cube: AnalyticCube.Sales,
    alias: [UrlConfig.ANALYTIC_SALES_ONLINE],
    iconImg: "nguon-ban-hang.svg",
    id: 8,
    chartColumnSelected: ['pre_total_sales', 'pre_orders'],
    timeAtOption: TimeAtOptionValue.CreatedAt,
  },
  {
    type: "Báo cáo đơn hàng",
    name: "theo địa chỉ giao hàng",
    query: `SHOW pre_orders, return_count, net_quantity, pre_total_sales, total_sales BY shipping_city FROM sales WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy')  
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY pre_total_sales DESC `,
    chart_query: `SHOW pre_total_sales, pre_orders BY shipping_city FROM sales WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy')  
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY pre_total_sales DESC `,
    cube: AnalyticCube.Sales,
    alias: [UrlConfig.ANALYTIC_SALES_ONLINE],
    iconImg: "nguon-ban-hang.svg",
    id: 9,
    chartColumnSelected: ['pre_total_sales', 'pre_orders'],
    timeAtOption: TimeAtOptionValue.CreatedAt,
  },
  // {
  //   type: "Báo cáo đơn hàng",
  //   name: "theo lí do hủy đơn",
  //   query: `SHOW orders, return_count, net_quantity, total_sales 
  //   BY shipping_city 
  //   FROM sales 
  //   WHERE sale_area IN ('Khối KD Online') 
  //   SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
  //   ORDER BY total_sales DESC `,
  //   cube: AnalyticCube.Sales,
  //   alias: [UrlConfig.ANALYTIC_SALES_ONLINE],
  //   iconImg: "nguon-ban-hang.svg",
  //   id: 10,
  //   chartColumnSelected: ['total_sales', 'average_order_value'],
  //   timeAtOption: TimeAtOptionValue.CreatedAt,
  // },
  // {
  //   type: "Báo cáo đơn hàng",
  //   name: "theo HVC",
  //   query: `SHOW orders, return_count, net_quantity, total_sales 
  //   BY shipping_city 
  //   FROM sales 
  //   WHERE sale_area IN ('Khối KD Online') 
  //   SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
  //   ORDER BY total_sales DESC `,
  //   cube: AnalyticCube.Sales,
  //   alias: [UrlConfig.ANALYTIC_SALES_ONLINE],
  //   iconImg: "nguon-ban-hang.svg",
  //   id: 11,
  //   chartColumnSelected: ['total_sales', 'average_order_value'],
  //   timeAtOption: TimeAtOptionValue.CreatedAt,
  // },

  {
    type: "Báo cáo đơn hàng",
    name: "theo sản phẩm (mã 3)",
    query: `SHOW pre_ordered_item_quantity, ordered_item_quantity, returned_item_quantity, pre_total_sales, total_sales BY variant_sku3 FROM sales WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy')  
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY pre_total_sales DESC `,
    chart_query: `SHOW pre_total_sales, pre_ordered_item_quantity BY variant_sku3 FROM sales WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy')  
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY pre_total_sales DESC `,
    cube: AnalyticCube.Sales,
    alias: [UrlConfig.ANALYTIC_SALES_ONLINE],
    iconImg: "san-pham.svg",
    id: 12,
    chartColumnSelected: ['pre_total_sales', 'pre_ordered_item_quantity'],
    timeAtOption: TimeAtOptionValue.CreatedAt,
  },
  {
    type: "Báo cáo đơn hàng",
    name: "theo sản phẩm (mã 7)",
    query: `SHOW pre_ordered_item_quantity, ordered_item_quantity, returned_item_quantity, pre_total_sales, total_sales BY variant_sku7 FROM sales WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy')  
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY pre_total_sales DESC `,
    chart_query: `SHOW pre_total_sales, pre_ordered_item_quantity BY variant_sku7 FROM sales WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy')  
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY pre_total_sales DESC `,
    cube: AnalyticCube.Sales,
    alias: [UrlConfig.ANALYTIC_SALES_ONLINE],
    iconImg: "san-pham.svg",
    id: 13,
    chartColumnSelected: ['pre_total_sales', 'pre_ordered_item_quantity'],
    timeAtOption: TimeAtOptionValue.CreatedAt,
  },
  {
    type: "Báo cáo đơn hàng",
    name: "theo khách hàng",
    query: `SHOW orders, return_count, ordered_item_quantity, returned_item_quantity, total_sales BY customer_name,customer_phone_number FROM sales WHERE sale_area IN ('Khối KD Online') 
        SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
        ORDER BY total_sales DESC `,
    cube: AnalyticCube.Sales,
    alias: [UrlConfig.ANALYTIC_SALES_ONLINE],
    iconImg: "khach-hang.svg",
    id: 14,
    chartColumnSelected: [],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
]