import React from 'react';
import { RouteMenu } from "model/other";
import setting from './setting';
import product from './product';
import bill from './bill';
import UrlConfig from 'config/UrlConfig';
import customers from "./customer"
import shipments from "./shipment"

const Dashboard = React.lazy(() => import ("screens/dashboard"));
const Product = React.lazy(() => import ("screens/product/product.search.screen"));
const Inventory = React.lazy(() => import ("screens/inverory"));
const OrderOnline = React.lazy(() => import ("screens/order-online/order.screen"));
const Customer = React.lazy(() => import ("screens/customer"));
// const CustomerAdd = React.lazy(() => import ("screens/customer/add"));

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
    type: 0,
    object: null,
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
    type: 0,
    object: null,
  },
  {
    path: "/inventory",
    exact: true,
    title: "Kho hàng",
    icon: 'icon-inventory',
    component: Inventory,
    key: "3",
    isShow: true,
    header: null,
    subMenu: [],
    type: 0,
    object: null,
  },
  {
    path: "/unicorn/pos",
    exact: true,
    title: "Bán hàng",
    icon: 'icon-sale',
    component: Inventory,
    key: "4",
    isShow: false,
    header: null,
    subMenu: [],
    type: 0,
    object: null,
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
    type: 0,
    object: null,
  },
  {
    path: UrlConfig.SHIPMENTS,
    exact: true,
    title: "Vận chuyển",
    icon: 'icon-transport',
    component: OrderOnline,
    key: "10",
    isShow: true,
    header: null,
    subMenu: shipments,
    type: 0,
    object: null,
  },
  {
    path: "/customers",
    exact: true,
    title: "Khách hàng",
    icon: 'icon-customer',
    component: Customer,
    key: "6",
    isShow: true,
    header: null,
    subMenu: customers,
    type: 0,
    object: null,
  },
  {
    path: "/promotion",
    exact: true,
    title: "Khuyến mại",
    icon: 'icon-promotion',
    component: Inventory,
    key: "7",
    isShow: true,
    header: null,
    subMenu: [],
    type: 0,
    object: null,
  },
  {
    path: "/report",
    exact: true,
    title: "Báo cáo",
    icon: 'icon-report',
    component: Inventory,
    key: "8",
    isShow: true,
    header: null,
    subMenu: [],
    type: 0,
    object: null,
  },
  {
    path: "/setting",
    exact: true,
    title: "Cài đặt",
    icon: 'icon-setting',
    component: Inventory,
    key: "9",
    isShow: true,
    header: null,
    subMenu: setting,
    type: 0,
    object: null,
  },
]

export default menu;