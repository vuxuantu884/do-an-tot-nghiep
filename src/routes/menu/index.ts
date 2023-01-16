import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";
import bill from "./bill.route";
import customers from "./customer.route";
import campaign from "./campaign.route";
import ecommerce from "./ecommerce.route";
import { inventory } from "./inventory.route";
import product from "./product.route";
import promotion from "./promotion.route";
// import { AdminPermission } from 'config/permissions/admin.permission';
import { ORDER_PERMISSIONS } from "config/permissions/order.permission";
import { CAMPAIGN_PERMISSION } from "config/permissions/marketing.permission";
import offlineOrdersRoute from "./offline-orders.route";
import reports from "./reports.route";
import setting from "./setting.route";
import shipments from "./shipment.route";
import supplierRoutes from "./supplier.route";
import warrantyRoute from "./warranty.route";
import webAppRoute from "./web-app.route";
import dailyRevenueRoute from "routes/menu/daily-revenue.route";

const Dashboard = React.lazy(() => import("screens/dashboard"));
const Product = React.lazy(() => import("screens/products/product/ProductSearchScreen"));
const OnlineOrders = React.lazy(() => import("screens/order-online/orders/online-orders.screen"));
const PosOrders = React.lazy(() => import("screens/order-online/orders/offline-orders.screen"));
const DailyRevenueScreen = React.lazy(() => import("screens/DailyRevenue/daily-revenue-list"));
const Customer = React.lazy(() => import("screens/customer"));
const Campaign = React.lazy(() => import("screens/marketing/campaign/Campaign"));
const EcommerceConfig = React.lazy(() => import("screens/ecommerce/config"));
const WebAppOrdersSync = React.lazy(() => import("screens/web-app/orders-sync/WebAppOrdersSync"));
const ListTicket = React.lazy(() => import("screens/inventory/ListTicket"));
const SocialNetworkChannel = React.lazy(() => import("screens/social/index"));

const menu: Array<RouteMenu> = [
  {
    path: UrlConfig.HOME,
    exact: true,
    title: "Tổng quan",
    icon: "icon-dashboard",
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
    icon: "icon-product",
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
    icon: "icon-inventory",
    component: ListTicket,
    key: "3",
    isShow: true,
    header: null,
    subMenu: inventory,
  },
  {
    path: UrlConfig.SUPPLIERS,
    exact: true,
    title: "Nhà cung cấp",
    icon: "icon-supplier",
    component: null,
    key: UrlConfig.SUPPLIERS,
    isShow: true,
    header: null,
    subMenu: supplierRoutes,
  },
  {
    path: UrlConfig.ORDER,
    exact: true,
    title: "Đơn hàng online",
    icon: "icon-order",
    component: OnlineOrders,
    // key: ordersMenuKey.onlineOrders,
    key: "đơn hàng online",
    isShow: true,
    header: null,
    subMenu: bill,
  },
  {
    path: UrlConfig.OFFLINE_ORDERS,
    exact: true,
    title: "Bán lẻ offline",
    icon: "icon-offline-order",
    component: PosOrders,
    key: "bán lẻ offline",
    isShow: true,
    header: null,
    subMenu: offlineOrdersRoute,
  },
  {
    path: UrlConfig.DAILY_REVENUE,
    exact: true,
    title: "Tổng kết ca",
    icon: "icon-daily-revenue",
    component: DailyRevenueScreen,
    key: "tong-ket-ca",
    isShow: true,
    header: null,
    subMenu: dailyRevenueRoute,
  },
  {
    path: UrlConfig.SHIPMENTS,
    exact: true,
    title: "Vận chuyển",
    icon: "icon-transport",
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
    icon: "icon-customer",
    component: Customer,
    key: "6",
    isShow: true,
    header: null,
    subMenu: customers,
  },
  {
    path: UrlConfig.MARKETING,
    exact: true,
    title: "Marketing",
    icon: "icon-marketing",
    component: Campaign,
    key: "marketing",
    isShow: true,
    header: null,
    permissions: [CAMPAIGN_PERMISSION.marketings_campaigns_read],
    subMenu: campaign,
  },
  {
    path: UrlConfig.PROMOTION,
    exact: true,
    title: "Khuyến mãi",
    icon: "icon-promotion",
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
    icon: "icon-report",
    component: null,
    key: "9",
    isShow: true,
    header: null,
    subMenu: reports,
  },
  {
    path: "/pos",
    exact: true,
    title: "Bán tại quầy",
    icon: "icon-sale",
    component: null,
    key: "4",
    isShow: false,
    header: null,
    subMenu: [],
    permissions: [ORDER_PERMISSIONS.READ_POS],
  },
  {
    path: UrlConfig.SOCIAL,
    exact: true,
    title: "Kênh social",
    icon: "icon-YDpage",
    component: SocialNetworkChannel,
    key: "social-network-channel",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: UrlConfig.ECOMMERCE,
    exact: true,
    title: "Sàn TMĐT",
    icon: "icon-ecommerce",
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
    icon: "icon-web-app",
    component: WebAppOrdersSync,
    key: "web_app",
    isShow: true,
    header: null,
    subMenu: webAppRoute,
  },
  {
    path: UrlConfig.WARRANTY,
    exact: true,
    title: "Bảo hành",
    icon: "icon-warranty",
    component: null,
    key: "warranty",
    isShow: true,
    header: null,
    subMenu: warrantyRoute,
  },
  {
    path: "/setting",
    exact: true,
    title: "Cài đặt",
    icon: "icon-setting",
    component: null,
    key: "10",
    isShow: true,
    header: null,
    subMenu: setting,
  },
];

export default menu;
