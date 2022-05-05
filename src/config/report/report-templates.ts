import {
  AnalyticCube,
  AnalyticCustomizeTemplateForCreate,
  AnalyticTemplateData,
  AnalyticTemplateGroup,
  TimeAtOptionValue
} from "model/report/analytics.model";
import moment from "moment";
import { DATE_FORMAT } from "utils/DateUtils";
import UrlConfig from "../url.config";
import { OFFLINE_REPORT_TEMPLATES } from "./offline-report-templates";
import { ONLINE_REPORT_TEMPLATES } from "./online-report-templates";

const TODAY = moment().format(DATE_FORMAT.YYYYMMDD);
const START_OF_MONTH = moment().startOf("month").format(DATE_FORMAT.YYYYMMDD);

export const REPORT_CUBES = {
  [UrlConfig.ANALYTIC_SALES_OFFLINE]: ["sales", "payments"],
  [UrlConfig.ANALYTIC_FINACE]: ["costs"],
  [UrlConfig.ANALYTIC_CUSTOMER]: ["sales", "payments"],
}

export const REPORT_NAMES = {
  [UrlConfig.ANALYTIC_SALES_OFFLINE]: "Báo cáo bán lẻ",
  [UrlConfig.ANALYTIC_SALES_ONLINE]: "Báo cáo bán đơn hàng",
  [UrlConfig.ANALYTIC_FINACE]: "Báo cáo tài chính ",
  [UrlConfig.ANALYTIC_CUSTOMER]: "Báo cáo khách hàng",
};

const REPORT_TEMPLATES_LIST_NO_ID: AnalyticTemplateData[] = [
  ...OFFLINE_REPORT_TEMPLATES,
  {
    id: 1,
    type: "Báo cáo lợi nhuận",
    name: "theo nhân viên",
    query: `SHOW gross_sales,returns, net_sales, shipping,total_sales,gross_profit, average_order_value, orders, ordered_item_quantity, returned_item_quantity, net_quantity  
    BY staff_name
    FROM costs 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY net_sales DESC`,
    chart_query: `SHOW gross_profit  
    BY staff_name
    FROM costs 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY net_sales DESC`,
    alias: [UrlConfig.ANALYTIC_FINACE],
    cube: "costs",
    iconImg: "nhan-vien.svg",
    chartColumnSelected: ['gross_profit'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo cửa hàng",
    query: `SHOW orders, gross_sales, returns, net_sales, shipping, total_sales, gross_profit, average_order_value   
    BY pos_location_name  
    FROM costs  
    WHERE channel_provider_name IN ('POS') 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY}    ORDER BY net_sales DESC`,
    chart_query: `SHOW gross_profit   
    BY pos_location_name  
    FROM costs  
    WHERE channel_provider_name IN ('POS') 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY}    ORDER BY net_sales DESC`,
    alias: [UrlConfig.ANALYTIC_FINACE],
    cube: "costs",
    iconImg: "cua-hang.svg",
    id: 2,
    chartColumnSelected: ['gross_profit'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo nguồn bán hàng",
    query: `SHOW orders, gross_sales, returns, net_sales, shipping, total_sales, gross_profit, average_order_value  
    BY channel_provider_name, source_name  
    FROM costs 
    WHERE channel_provider_name IN ('web','Shopee','Lazada','Facebook','Admin') 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY net_sales DESC `,
    chart_query: `SHOW gross_profit  
    BY channel_provider_name, source_name  
    FROM costs 
    WHERE channel_provider_name IN ('web','Shopee','Lazada','Facebook','Admin') 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY net_sales DESC `,
    cube: "costs",
    alias: [UrlConfig.ANALYTIC_FINACE],
    iconImg: "nguon-ban-hang.svg",
    id: 3,
    chartColumnSelected: ['gross_profit'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo sản phẩm",
    query: `SHOW orders,gross_sales,returns,shipping,total_sales,net_sales,gross_profit, average_order_value  
    BY variant_sku
    FROM costs 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY net_sales DESC `,
    chart_query: `SHOW gross_profit  
    BY variant_sku
    FROM costs 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY net_sales DESC `,
    cube: "costs",
    alias: [UrlConfig.ANALYTIC_FINACE],
    iconImg: "san-pham.svg",
    id: 4,
    chartColumnSelected: ['gross_profit'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo thời gian",
    query: `SHOW orders,gross_sales,returns, net_sales,shipping,total_sales,gross_profit, average_order_value  
    BY day 
    FROM costs 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY}
    ORDER BY DAY DESC`,
    chart_query: `SHOW gross_profit  
    BY day 
    FROM costs 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY}
    ORDER BY DAY DESC`,
    cube: "costs",
    alias: [UrlConfig.ANALYTIC_FINACE],
    iconImg: "thoi-gian.svg",
    id: 5,
    chartColumnSelected: ['gross_profit'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo khách hàng",
    query: `SHOW orders,gross_sales,returns,shipping,total_sales,net_sales,gross_profit, average_order_value  
    BY customer_name
    FROM costs SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY net_sales DESC `,
    chart_query: `SHOW gross_profit  
    BY customer_name
    FROM costs SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY net_sales DESC `,
    cube: "costs",
    alias: [UrlConfig.ANALYTIC_FINACE],
    iconImg: "khach-hang.svg",
    id: 6,
    chartColumnSelected: ['gross_profit'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  //khách hàng
  {
    type: "Báo cáo thanh toán",
    name: "theo nhóm khách hàng",
    query: `SHOW payments, cash_payments, transfer_payments, cod_payments, point_payments, card_payments, qr_pay_payments, unknown_payments 
    BY customer_group
    FROM payments 
    SINCE ${START_OF_MONTH}  UNTIL ${TODAY} 
    ORDER BY payments desc `,
    chart_query: `SHOW payments 
    BY customer_group
    FROM payments 
    SINCE ${START_OF_MONTH}  UNTIL ${TODAY} 
    ORDER BY payments desc `,
    cube: "payments",
    iconImg: "thanh-toan-nhom kh.png",
    alias: [UrlConfig.ANALYTIC_CUSTOMER],
    id: 14,
    chartColumnSelected: ['payments'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    type: "Báo cáo bán hàng",
    name: "theo nhóm khách hàng",
    query: `SHOW  orders,gross_sales, returns, net_sales,shipping,total_sales, average_order_value  
    BY customer_group 
    FROM sales 
    SINCE ${START_OF_MONTH}  UNTIL ${TODAY} 
    ORDER BY net_sales desc `,
    chart_query: `SHOW net_sales,shipping, average_order_value  
    BY customer_group 
    FROM sales 
    SINCE ${START_OF_MONTH}  UNTIL ${TODAY} 
    ORDER BY net_sales desc `,
    cube: "sales",
    iconImg: "ban-hang-nhom kh.png",
    alias: [UrlConfig.ANALYTIC_CUSTOMER],
    id: 15,
    chartColumnSelected: ['net_sales', 'average_order_value'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo nhóm khách hàng",
    query: `SHOW  orders,gross_sales, returns, net_sales,shipping,total_sales,gross_profit, average_order_value  
    BY customer_group 
    FROM costs 
    SINCE ${START_OF_MONTH}  UNTIL ${TODAY} 
    ORDER BY net_sales desc `,
    chart_query: `SHOW  gross_profit  
    BY customer_group 
    FROM costs 
    SINCE ${START_OF_MONTH}  UNTIL ${TODAY} 
    ORDER BY net_sales desc `,
    cube: "costs",
    iconImg: "ban-hang-nhom kh.png",
    alias: [UrlConfig.ANALYTIC_FINACE],
    id: 15,
    chartColumnSelected: ['gross_profit'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    type: "Báo cáo bán hàng",
    name: "theo địa chỉ khách hàng",
    query: `SHOW  customers, orders, ordered_item_quantity, returned_item_quantity, returns, net_sales, average_order_value   
      BY shipping_city  
      FROM sales 
      SINCE ${START_OF_MONTH}  UNTIL ${TODAY} 
      `,
    chart_query: `SHOW  customers, net_sales   
      BY shipping_city  
      FROM sales 
      SINCE ${START_OF_MONTH}  UNTIL ${TODAY} 
      `,
    cube: "sales",
    iconImg: "dia-chi-kh.png",
    alias: [UrlConfig.ANALYTIC_CUSTOMER],
    id: 16,
    chartColumnSelected: ['customers', 'net_sales'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo địa chỉ khách hàng",
    query: `SHOW  orders, gross_sales, returns, net_sales, shipping, total_sales, gross_profit, average_order_value  
      BY shipping_city  
      FROM costs 
      WHERE channel_provider_name IN ('Admin','Facebook','Lazada','Shopee','web') 
      SINCE ${START_OF_MONTH}  UNTIL ${TODAY} 
      ORDER BY net_sales desc `,
    chart_query: `SHOW  gross_profit  
      BY shipping_city  
      FROM costs 
      WHERE channel_provider_name IN ('Admin','Facebook','Lazada','Shopee','web') 
      SINCE ${START_OF_MONTH}  UNTIL ${TODAY} 
      ORDER BY net_sales desc `,
    cube: "costs",
    iconImg: "dia-chi-kh.png",
    alias: [UrlConfig.ANALYTIC_FINACE],
    id: 16,
    chartColumnSelected: ['gross_profit'],
    timeAtOption: TimeAtOptionValue.CompletedAt,
  },
  ...ONLINE_REPORT_TEMPLATES
];

//re-generate unique id
const REPORT_TEMPLATES = REPORT_TEMPLATES_LIST_NO_ID.map((item, index: number) => ({
  ...item,
  id: index,
}));

// offline reports - báo cáo bán lẻ
const CUSTOMIZE_TEMPLATE_SALES_FOR_CREATE: Array<AnalyticCustomizeTemplateForCreate> =
  REPORT_TEMPLATES.filter((template) => template.alias.includes(UrlConfig.ANALYTIC_SALES_OFFLINE)).map(
    (item: AnalyticTemplateData) => ({
      name: item.type + " " + item.name,
      cube: item.cube,
      query: item.query,
      chartColumnSelected: item.chartColumnSelected,
      timeAtOption: item.timeAtOption,
      chart_query: item.chart_query,
    })
  );

// online reports - báo cáo đơn hàng
const CUSTOMIZE_TEMPLATE_ONLINE_FOR_CREATE: Array<AnalyticCustomizeTemplateForCreate> =
  REPORT_TEMPLATES.filter((template) => template.alias.includes(UrlConfig.ANALYTIC_SALES_ONLINE)).map(
    (item: AnalyticTemplateData) => ({
      name: item.type + " " + item.name,
      cube: item.cube,
      query: item.query,
      chartColumnSelected: item.chartColumnSelected,
      timeAtOption: item.timeAtOption,
      chart_query: item.chart_query,
    })
  );

const CUSTOMIZE_TEMPLATE_FINANCE_FOR_CREATE: Array<AnalyticCustomizeTemplateForCreate> =
  REPORT_TEMPLATES.filter((template) => template.alias.includes(UrlConfig.ANALYTIC_FINACE)).map(
    (item: AnalyticTemplateData) => ({
      name: item.type + " " + item.name,
      cube: item.cube,
      query: item.query,
      chartColumnSelected: item.chartColumnSelected,
      timeAtOption: item.timeAtOption,
      chart_query: item.chart_query,
    })
  );

const CUSTOMIZE_TEMPLATE_CUSTOMER_FOR_CREATE: Array<AnalyticCustomizeTemplateForCreate> =
  REPORT_TEMPLATES.filter((template) => template.alias.includes(UrlConfig.ANALYTIC_CUSTOMER)).map(
    (item: AnalyticTemplateData) => ({
      name: item.type + " " + item.name,
      cube: item.cube,
      query: item.query,
      chartColumnSelected: item.chartColumnSelected,
      timeAtOption: item.timeAtOption,
      chart_query: item.chart_query,
    })
  );

export const CUSTOMIZE_TEMPLATE = {
  [UrlConfig.ANALYTIC_SALES_OFFLINE]: CUSTOMIZE_TEMPLATE_SALES_FOR_CREATE,
  [UrlConfig.ANALYTIC_SALES_ONLINE]: CUSTOMIZE_TEMPLATE_ONLINE_FOR_CREATE,
  [UrlConfig.ANALYTIC_FINACE]: CUSTOMIZE_TEMPLATE_FINANCE_FOR_CREATE,
  [UrlConfig.ANALYTIC_CUSTOMER]: CUSTOMIZE_TEMPLATE_CUSTOMER_FOR_CREATE,
};

export const ANALYTIC_TEMPLATE_GROUP: AnalyticTemplateGroup = {
  [UrlConfig.ANALYTIC_SALES_OFFLINE]: [
    {
      name: 'Nhóm báo cáo bán hàng',
      cube: AnalyticCube.OfflineSales,
    },
    // {
    //   name: 'Nhóm báo cáo thanh toán',
    //   cube: AnalyticCube.Payments,
    // }
  ],
  [UrlConfig.ANALYTIC_SALES_ONLINE]: [
    {
      name: 'Nhóm báo cáo đơn hàng',
      cube: AnalyticCube.Sales,
    },
    // {
    //   name: 'Nhóm báo cáo thanh toán',
    //   cube: AnalyticCube.Payments,
    // }
  ],
  [UrlConfig.ANALYTIC_FINACE]: [
    {
      name: 'Nhóm báo cáo lợi nhuận',
      cube: AnalyticCube.Costs,
    }
  ],
  [UrlConfig.ANALYTIC_CUSTOMER]: [
    {
      name: 'Nhóm báo cáo khách hàng',
      cube: AnalyticCube.All,
    }
  ],
};

export const DETAIL_LINKS = [
  {
    field: "order_id",
    link: "/orders",
  },
  {
    field: "customer_code",
    link: "/customers",
  },
  {
    field: "order_code",
    link: "/orders",
  },
];

export const TIME_GROUP_BY = [
  {
      label: 'Giờ',
      value: 'hour'
  },
  {
      label: 'Ngày',
      value: 'day'
  },
  {
      label: 'Tháng',
      value: 'month'
  },
  {
      label: 'Năm',
      value: 'year'
  }
]

export const TIME_AT_OPTION = [
  {
      label: 'Ngày tạo',
      value: TimeAtOptionValue.CreatedAt
  },
  {
      label: 'Ngày xác nhận',
      value: TimeAtOptionValue.FinalizedAt
  },
  {
      label: 'Ngày thành công',
      value: TimeAtOptionValue.CompletedAt
  },
  {
      label: 'Ngày huỷ',
      value: TimeAtOptionValue.CancelledAt
  },
]
export default REPORT_TEMPLATES;
