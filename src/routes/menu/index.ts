import React from 'react';
import { RouteMenu } from "model/other";
import setting from './setting';
import product from './product';

const Dashboard = React.lazy(() => import ("screens/dashboard"));
const Product = React.lazy(() => import ("screens/product"));
const Inventory = React.lazy(() => import ("screens/inverory"));

const menu: Array<RouteMenu> = [
  {
    path: "/",
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
    path: "/inventory",
    exact: true,
    title: "Kho hàng",
    icon: 'icon-inventory',
    component: Inventory,
    key: "3",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: "/sale",
    exact: true,
    title: "Bán hàng",
    icon: 'icon-sale',
    component: Inventory,
    key: "4",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: "/bill",
    exact: true,
    title: "Bán hàng",
    icon: 'icon-order',
    component: Inventory,
    key: "5",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: "/customer",
    exact: true,
    title: "Khách hàng",
    icon: 'icon-customer',
    component: Inventory,
    key: "6",
    isShow: true,
    header: null,
    subMenu: [],
  },
  {
    path: "/promotion",
    exact: true,
    title: "Khuyễn mại",
    icon: 'icon-promotion',
    component: Inventory,
    key: "7",
    isShow: true,
    header: null,
    subMenu: [],
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
  },
]

export default menu;