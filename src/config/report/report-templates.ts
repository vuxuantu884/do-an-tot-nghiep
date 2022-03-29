import {
  AnalyticCube,
  AnalyticCustomizeTemplateForCreate,
  AnalyticTemplateData,
  AnalyticTemplateGroup
} from "model/report/analytics.model";
import moment from "moment";
import { DATE_FORMAT } from "utils/DateUtils";
import UrlConfig from "../url.config";

const TODAY = moment().format(DATE_FORMAT.YYYYMMDD);
const START_OF_MONTH = moment().startOf("month").format(DATE_FORMAT.YYYYMMDD);

export const REPORT_CUBES = {
  [UrlConfig.ANALYTIC_SALES]: ["sales", "payments"],
  [UrlConfig.ANALYTIC_FINACE]: ["costs"],
  [UrlConfig.ANALYTIC_CUSTOMER]: ["sales", "payments"],
}

export const REPORT_NAMES = {
  [UrlConfig.ANALYTIC_SALES]: "Báo cáo bán hàng ",
  [UrlConfig.ANALYTIC_FINACE]: "Báo cáo tài chính ",
  [UrlConfig.ANALYTIC_CUSTOMER]: "Báo cáo khách hàng",
};

const REPORT_TEMPLATES_LIST_NO_ID: AnalyticTemplateData[] = [
  {
    id: 1,
    type: "Báo cáo bán hàng",
    name: "theo nhân viên",
    query: `SHOW gross_sales,returns, net_sales, shipping,total_sales, average_order_value, orders, ordered_item_quantity, returned_item_quantity, net_quantity   
    BY staff_name
    FROM sales 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY net_sales DESC`,
    alias: [UrlConfig.ANALYTIC_SALES],
    cube: "sales",
    iconImg: "nhan-vien.svg",
    chartColumnSelected: ['net_sales', 'average_order_value']
  },
  {
    id: 1,
    type: "Báo cáo lợi nhuận",
    name: "theo nhân viên",
    query: `SHOW gross_sales,returns, net_sales, shipping,total_sales,gross_profit, average_order_value, orders, ordered_item_quantity, returned_item_quantity, net_quantity  
    BY staff_name
    FROM costs 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY net_sales DESC`,
    alias: [UrlConfig.ANALYTIC_FINACE],
    cube: "costs",
    iconImg: "nhan-vien.svg",
    chartColumnSelected: ['gross_profit']
  },
  {
    type: "Báo cáo bán hàng",
    name: "theo cửa hàng",
    query: `SHOW net_sales, average_order_value, orders, ordered_item_quantity, returned_item_quantity, net_quantity
    BY pos_location_name  
    FROM sales  
    WHERE channel_provider_name IN ('POS')
    SINCE ${START_OF_MONTH} UNTIL ${TODAY}    ORDER BY net_sales DESC`,
    alias: [UrlConfig.ANALYTIC_SALES],
    cube: "sales",
    iconImg: "cua-hang.svg",
    id: 2,
    chartColumnSelected: ['net_sales', 'average_order_value']
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo cửa hàng",
    query: `SHOW gross_profit  
    BY pos_location_name  
    FROM costs  
    WHERE channel_provider_name IN ('POS') 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY}    ORDER BY net_sales DESC`,
    alias: [UrlConfig.ANALYTIC_FINACE],
    cube: "costs",
    iconImg: "cua-hang.svg",
    id: 2,
    chartColumnSelected: ['gross_profit']
  },
  {
    type: "Báo cáo bán hàng",
    name: "theo nguồn bán hàng",
    query: `SHOW net_sales, average_order_value  
    BY source_name
    FROM sales 
    WHERE channel_provider_name IN ('web','Shopee','Facebook','Admin','Lazada') 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY net_sales DESC `,
    cube: "sales",
    alias: [UrlConfig.ANALYTIC_SALES],
    iconImg: "nguon-ban-hang.svg",
    id: 3,
    chartColumnSelected: ['net_sales', 'average_order_value']
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo nguồn bán hàng",
    query: `SHOW gross_profit  
    BY source_name
    FROM costs 
    WHERE channel_provider_name IN ('web','Shopee','Lazada','Facebook','Admin') 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY net_sales DESC `,
    cube: "costs",
    alias: [UrlConfig.ANALYTIC_FINACE],
    iconImg: "nguon-ban-hang.svg",
    id: 3,
    chartColumnSelected: ['gross_profit']
  },
  {
    type: "Báo cáo bán hàng",
    name: "theo sản phẩm",
    query: `SHOW orders,gross_sales,returns,shipping,total_sales,net_sales, average_order_value  
    BY variant_sku
    FROM sales 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY net_sales DESC `,
    cube: "sales",
    alias: [UrlConfig.ANALYTIC_SALES],
    iconImg: "san-pham.svg",
    id: 4,
    chartColumnSelected: ['net_sales', 'average_order_value']
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo sản phẩm",
    query: `SHOW orders,gross_sales,returns,shipping,total_sales,net_sales,gross_profit, average_order_value  
    BY variant_sku
    FROM costs 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY net_sales DESC `,
    cube: "costs",
    alias: [UrlConfig.ANALYTIC_FINACE],
    iconImg: "san-pham.svg",
    id: 4,
    chartColumnSelected: ['gross_profit']
  },
  {
    type: "Báo cáo bán hàng",
    name: "theo thời gian",
    query: `SHOW orders,gross_sales,returns, net_sales,shipping,total_sales, average_order_value  
    BY day 
    FROM sales 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY}
    ORDER BY DAY DESC`,
    cube: "sales",
    alias: [UrlConfig.ANALYTIC_SALES],
    iconImg: "thoi-gian.svg",
    id: 5,
    chartColumnSelected: ['net_sales', 'average_order_value']
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo thời gian",
    query: `SHOW orders,gross_sales,returns, net_sales,shipping,total_sales,gross_profit, average_order_value  
    BY day 
    FROM costs 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY}
    ORDER BY DAY DESC`,
    cube: "costs",
    alias: [UrlConfig.ANALYTIC_FINACE],
    iconImg: "thoi-gian.svg",
    id: 5,
    chartColumnSelected: ['gross_profit']
  },
  {
    type: "Báo cáo bán hàng",
    name: "theo khách hàng",
    query: `SHOW orders,gross_sales,returns,shipping,total_sales,net_sales, average_order_value  
    BY customer_name
    FROM sales SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY net_sales DESC `,
    cube: "sales",
    alias: [UrlConfig.ANALYTIC_SALES],
    iconImg: "khach-hang.svg",
    id: 6,
    chartColumnSelected: ['net_sales', 'average_order_value']
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo khách hàng",
    query: `SHOW orders,gross_sales,returns,shipping,total_sales,net_sales,gross_profit, average_order_value  
    BY customer_name
    FROM costs SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY net_sales DESC `,
    cube: "costs",
    alias: [UrlConfig.ANALYTIC_FINACE],
    iconImg: "khach-hang.svg",
    id: 6,
    chartColumnSelected: ['gross_profit']
  },
  {
    type: "Báo cáo trả hàng",
    name: " theo nhân viên",
    query: `SHOW returns, returned_item_quantity 
    BY staff_name 
    FROM sales
    WHERE sale_kind == "Trả hàng" 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY}
    ORDER BY returns DESC`,
    cube: "sales",
    alias: [UrlConfig.ANALYTIC_SALES],
    iconImg: "nhan-vien-tra-hang.svg",
    id: 7,
    chartColumnSelected: ['returned_item_quantity']
  },
  {
    type: "Báo cáo trả hàng",
    name: "theo sản phẩm",
    query: `SHOW returns, returned_item_quantity 
    BY variant_sku
    FROM sales
    WHERE sale_kind == "Trả hàng" 
    SINCE ${START_OF_MONTH} UNTIL ${TODAY} 
    ORDER BY returned_item_quantity DESC`,
    cube: "sales",
    alias: [UrlConfig.ANALYTIC_SALES],
    iconImg: "nhan-vien-tra-hang.svg",
    id: 8,
    chartColumnSelected: ['returned_item_quantity']
  },
  {
    type: "Báo cáo thanh toán",
    name: "theo nhân viên",
    query: `SHOW payments, cash_payments, transfer_payments, cod_payments, point_payments, card_payments, qr_pay_payments, unknown_payments  
    BY staff_name 
    FROM payments 
    SINCE ${TODAY}  UNTIL ${TODAY} 
    ORDER BY payments DESC     `,
    cube: "payments",
    alias: [UrlConfig.ANALYTIC_SALES],
    iconImg: "nhan-vien-thanh-toan.svg",
    id: 9,
    chartColumnSelected: ['payments']
  },
  {
    type: "Báo cáo thanh toán",
    name: " theo cửa hàng",
    query: `SHOW  payments, cash_payments, transfer_payments, cod_payments, point_payments, card_payments, qr_pay_payments, unknown_payments 
    BY pos_location_name
    FROM payments 
    SINCE ${TODAY}  UNTIL ${TODAY} 
    ORDER BY payments DESC `,
    cube: "payments",
    alias: [UrlConfig.ANALYTIC_SALES],
    iconImg: "cua-hang-thanh-toan.svg",
    id: 10,
    chartColumnSelected: ['payments']
  },
  {
    type: "Báo cáo thanh toán",
    name: "theo phương thức thanh toán",
    query: `SHOW payments 
    BY payment_method_name
    FROM payments 
    SINCE ${TODAY}  UNTIL ${TODAY}  
    ORDER BY payments DESC `,
    cube: "payments",
    alias: [UrlConfig.ANALYTIC_SALES],
    iconImg: "phuong-thuc-thanh-toan.svg",
    id: 11,
    chartColumnSelected: ['payments']
  },
  {
    type: "Báo cáo thanh toán",
    name: " theo thời gian",
    query: `SHOW payments, cash_payments, transfer_payments, cod_payments, point_payments, card_payments, qr_pay_payments, unknown_payments 
    BY hour 
    FROM payments  
    SINCE ${TODAY}  UNTIL ${TODAY}  
    ORDER BY hour DESC `,
    cube: "payments",
    alias: [UrlConfig.ANALYTIC_SALES],
    iconImg: "thoi-gian-thanh-toan.svg",
    id: 12,
    chartColumnSelected: ['payments']
  },
  // {
  //   type: "Báo cáo thanh toán",
  //   name: "theo ngân hàng",
  //   query: `SHOW payments BY bank_name FROM payments 
  //   SINCE ${TODAY} UNTIL ${TODAY}
  //   ORDER BY payments DESC `,
  //   cube: "payments",
  //   alias: [UrlConfig.ANALYTIC_SALES],
  //   iconImg: "tk-ngan-hang-thanh-toan.svg",
  //   id: 13,
  //   chartColumnSelected: ['payments']
  // },
  //khách hàng
  {
    type: "Báo cáo thanh toán",
    name: "theo nhóm khách hàng",
    query: `SHOW payments, cash_payments, transfer_payments, cod_payments, point_payments, card_payments, qr_pay_payments, unknown_payments 
    BY customer_group
    FROM payments 
    SINCE ${START_OF_MONTH}  UNTIL ${TODAY} 
    ORDER BY payments desc `,
    cube: "payments",
    iconImg: "thanh-toan-nhom kh.png",
    alias: [UrlConfig.ANALYTIC_CUSTOMER],
    id: 14,
    chartColumnSelected: ['payments']
  },
  {
    type: "Báo cáo bán hàng",
    name: "theo nhóm khách hàng",
    query: `SHOW  orders,gross_sales, returns, net_sales,shipping,total_sales, average_order_value  
    BY customer_group 
    FROM sales 
    SINCE ${START_OF_MONTH}  UNTIL ${TODAY} 
    ORDER BY net_sales desc `,
    cube: "sales",
    iconImg: "ban-hang-nhom kh.png",
    alias: [UrlConfig.ANALYTIC_CUSTOMER],
    id: 15,
    chartColumnSelected: ['net_sales', 'average_order_value']
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo nhóm khách hàng",
    query: `SHOW  orders,gross_sales, returns, net_sales,shipping,total_sales,gross_profit, average_order_value  
    BY customer_group 
    FROM costs 
    SINCE ${START_OF_MONTH}  UNTIL ${TODAY} 
    ORDER BY net_sales desc `,
    cube: "costs",
    iconImg: "ban-hang-nhom kh.png",
    alias: [UrlConfig.ANALYTIC_FINACE],
    id: 15,
    chartColumnSelected: ['gross_profit']
  },
  {
    type: "Báo cáo bán hàng",
    name: "theo địa chỉ khách hàng",
    query: `SHOW  net_sales, average_order_value  
      BY shipping_city  
      FROM sales 
      WHERE channel_provider_name IN ('Admin','Facebook','Lazada','Shopee','web') 
      SINCE ${START_OF_MONTH}  UNTIL ${TODAY} 
      ORDER BY net_sales desc `,
    cube: "sales",
    iconImg: "dia-chi-kh.png",
    alias: [UrlConfig.ANALYTIC_CUSTOMER],
    id: 16,
    chartColumnSelected: ['net_sales', 'average_order_value']
  },
  {
    type: "Báo cáo lợi nhuận",
    name: "theo địa chỉ khách hàng",
    query: `SHOW  gross_profit  
      BY shipping_city  
      FROM costs 
      WHERE channel_provider_name IN ('Admin','Facebook','Lazada','Shopee','web') 
      SINCE ${START_OF_MONTH}  UNTIL ${TODAY} 
      ORDER BY net_sales desc `,
    cube: "costs",
    iconImg: "dia-chi-kh.png",
    alias: [UrlConfig.ANALYTIC_FINACE],
    id: 16,
    chartColumnSelected: ['gross_profit']
  },
];

//re-generate unique id
const REPORT_TEMPLATES = REPORT_TEMPLATES_LIST_NO_ID.map((item, index: number) => ({
  ...item,
  id: index,
}));

const CUSTOMIZE_TEMPLATE_SALES_FOR_CREATE: Array<AnalyticCustomizeTemplateForCreate> =
  REPORT_TEMPLATES.filter((template) => template.alias.includes(UrlConfig.ANALYTIC_SALES)).map(
    (item: AnalyticTemplateData) => ({
      name: item.type + " " + item.name,
      cube: item.cube,
      query: item.query,
    })
  );

const CUSTOMIZE_TEMPLATE_FINANCE_FOR_CREATE: Array<AnalyticCustomizeTemplateForCreate> =
  REPORT_TEMPLATES.filter((template) => template.alias.includes(UrlConfig.ANALYTIC_FINACE)).map(
    (item: AnalyticTemplateData) => ({
      name: item.type + " " + item.name,
      cube: item.cube,
      query: item.query,
    })
  );

const CUSTOMIZE_TEMPLATE_CUSTOMER_FOR_CREATE: Array<AnalyticCustomizeTemplateForCreate> =
  REPORT_TEMPLATES.filter((template) => template.alias.includes(UrlConfig.ANALYTIC_CUSTOMER)).map(
    (item: AnalyticTemplateData) => ({
      name: item.type + " " + item.name,
      cube: item.cube,
      query: item.query,
    })
  );

export const CUSTOMIZE_TEMPLATE = {
  [UrlConfig.ANALYTIC_SALES]: CUSTOMIZE_TEMPLATE_SALES_FOR_CREATE,
  [UrlConfig.ANALYTIC_FINACE]: CUSTOMIZE_TEMPLATE_FINANCE_FOR_CREATE,
  [UrlConfig.ANALYTIC_CUSTOMER]: CUSTOMIZE_TEMPLATE_CUSTOMER_FOR_CREATE,
};

export const ANALYTIC_TEMPLATE_GROUP: AnalyticTemplateGroup = {
  [UrlConfig.ANALYTIC_SALES]: [
    {
      name: 'Nhóm báo cáo bán hàng',
      cube: AnalyticCube.Sales,
    },
    {
      name: 'Nhóm báo cáo thanh toán',
      cube: AnalyticCube.Payments,
    }
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
  }
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
export default REPORT_TEMPLATES;
