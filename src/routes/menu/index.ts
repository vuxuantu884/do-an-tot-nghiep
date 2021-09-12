import React from 'react';
import { RouteMenu } from "model/other";
import setting from './setting.route';
import product from './product.route';
import bill from './bill.route';
import UrlConfig from 'config/url.config';
import customers from "./customer.route"
import shipments from "./shipment.route"
import ecommerce from "./ecommerce.route"
import promotion from './promotion.route';


const Dashboard = React.lazy(() => import ("screens/dashboard"));
const Product = React.lazy(() => import ("screens/products/product/product.search.screen"));
const OrderOnline = React.lazy(() => import ("screens/order-online/order.screen"));
const Customer = React.lazy(() => import ("screens/customer"));
const EcommerceConfig = React.lazy(() => import ("screens/ecommerce/config"))

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
    path: "/kho",
    exact: true,
    title: "Kho hàng",
    icon: 'icon-inventory',
    component: null,
    key: "3",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: "/unicorn/pos",
    exact: true,
    title: "Bán hàng",
    icon: 'icon-sale',
    component: null,
    key: "4",
    isShow: false,
    header: null,
    subMenu: [],
  },
  {
    path: UrlConfig.ORDER,
    exact: true,
    title: "Đơn hàng",
    icon: 'icon-order',
    component: OrderOnline,
    key: "5",
    isShow: true,
    header: null,
    subMenu: bill,
  },
  {
    path: UrlConfig.SHIPMENTS,
    exact: true,
    title: "Vận chuyển",
    icon: 'icon-transport',
    component: OrderOnline,
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
    path: "/report",
    exact: true,
    title: "Báo cáo",
    icon: 'icon-report',
    component: null,
    key: "9",
    isShow: true,
    header: null,
    subMenu: [],
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