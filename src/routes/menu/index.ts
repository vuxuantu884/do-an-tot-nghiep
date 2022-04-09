import UrlConfig from 'config/url.config';
import { RouteMenu } from "model/other";
import React from 'react';
import bill from './bill.route';
import customers from "./customer.route";
import ecommerce from "./ecommerce.route";
import { inventory } from "./inventory.route";
import product from './product.route';
import promotion from './promotion.route';
// import { AdminPermission } from 'config/permissions/admin.permission';
import setting from './setting.route';
import shipments from "./shipment.route";
import reports from "./reports.route";
import { ODERS_PERMISSIONS } from 'config/permissions/order.permission';
import offlineOrdersRoute from './offline-orders.route';
import webAppRoute from "./web-app.route";

const Dashboard = React.lazy(() => import ("screens/dashboard"));
const Product = React.lazy(() => import ("screens/products/product/ProductSearchScreen"));
const OrderOnline = React.lazy(() => import ("screens/order-online/order.screen"));
const PosOrders = React.lazy(() => import ("screens/order-online/orders/offline-orders.screen"));
const Customer = React.lazy(() => import ("screens/customer"));
const EcommerceConfig = React.lazy(() => import ("screens/ecommerce/config"));
const WebAppOrdersSync = React.lazy(() => import ("screens/web-app/orders-sync/WebAppOrdersSync"));
const ListTicket = React.lazy(() => import ("screens/inventory/ListTicket"));
const ReportOrdersOnline = React.lazy(() => import ("screens/reports/report-orders-online"));
const YDpage = React.lazy(() => import ("screens/YDpage/YDpage"));

const menu: Array<RouteMenu> = [
  {
    path: UrlConfig.HOME,
    exact: true,
    title: "Tổng quan",
    icon: 'icon-dashboard',
    component: Dashboard,
    key: "1",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: "/products",
    exact: true,
    title: "Sản phẩm",
    icon: 'icon-product',
    component: Product,
    key: "2",
    isShow: true,
    header: null,
    subMenu: product,

  },
  {
    path: "/inventory-transfers",
    exact: true,
    title: "Kho hàng",
    icon: 'icon-inventory',
    component: ListTicket,
    key: "3",
    isShow: true,
    header: null,
    subMenu: inventory,
  },
  {
    path: UrlConfig.ORDER,
    exact: true,
    title: "Đơn hàng online",
    icon: 'icon-order',
    component: OrderOnline,
    key: "5",
    isShow: true,
    header: null,
    subMenu: bill,
  },
  {
    path: UrlConfig.ORDER,
    exact: true,
    title: "Bán lẻ offline",
    icon: 'icon-order',
    component: PosOrders,
    key: "ban-hang",
    isShow: true,
    header: null,
    subMenu: offlineOrdersRoute,
  },
  {
    path: UrlConfig.SHIPMENTS,
    exact: true,
    title: "Vận chuyển",
    icon: 'icon-transport',
    component: null,
    key: "19",
    isShow: true,
    header: null,
    subMenu: shipments,
  },
  {
    path: UrlConfig.CUSTOMER,
    exact: true,
    title: "Khách hàng",
    icon: 'icon-customer',
    component: Customer,
    key: "6",
    isShow: true,
    header: null,
    subMenu: customers,
  },
  {
    path: UrlConfig.PROMOTION,
    exact: true,
    title: "Khuyến mại",
    icon: 'icon-promotion',
    component: null,
    key: "7",
    isShow: true,
    header: null,
    subMenu: promotion,
  },
  {
    path: "/reports",
    exact: true,
    title: "Báo cáo",
    icon: 'icon-report',
    component: ReportOrdersOnline,
    key: "9",
    isShow: true,
    header: null,
    subMenu: reports,
  },
  {
    path: "/pos",
    exact: true,
    title: "Bán tại quầy",
    icon: 'icon-sale',
    component: null,
    key: "4",
    isShow: false,
    header: null,
    subMenu: [],
    permissions: [ODERS_PERMISSIONS.READ_POS],
  },
  {
    path: UrlConfig.YDPAGE,
    exact: true,
    title: "Kênh social",
    icon: 'icon-YDpage',
    component: YDpage,
    key: "YDpage",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: UrlConfig.ECOMMERCE,
    exact: true,
    title: "Sàn TMĐT",
    icon: 'icon-ecommerce',
    component: EcommerceConfig,
    key: "8",
    isShow: true,
    header: null,
    subMenu: ecommerce,
  },
  {
    path: UrlConfig.WEB_APP,
    exact: true,
    title: "Web/App",
    icon: 'icon-web-app',
    component: WebAppOrdersSync,
    key: "web_app",
    isShow: true,
    header: null,
    subMenu: webAppRoute,
  },
  {
    path: "/setting",
    exact: true,
    title: "Cài đặt",
    icon: 'icon-setting',
    component: null,
    key: "10",
    isShow: true,
    header: null,
    subMenu: setting,
  },
]

export default menu; 