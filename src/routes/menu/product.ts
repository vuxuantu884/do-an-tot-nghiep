import React from 'react';
import { RouteMenu } from "model/other";


const Category = React.lazy(() => import ("screens/product/category.screen"));
const Product = React.lazy(() => import ("screens/product"));
const Color = React.lazy(() => import ("screens/product/color.screen"));
const Material = React.lazy(() => import ("screens/product/material.screen"));
const Size = React.lazy(() => import ("screens/product/size.screen"));
const Supplier = React.lazy(() => import ("screens/product/supplier.screen"));
const AddCategory = React.lazy(() => import ("screens/product/add-category.screen"))

const product: Array<RouteMenu> = [
  {
    path: "/products",
    exact: true,
    title: "Danh sách sản phẩm",
    icon: 'icon-dot',
    component: Product,
    key: "submenu21",
    isShow: true,
    header: null,
    subMenu: [],
    isShowCreate: false,
    pathCreate: ''
  },
  {
    path: "/products/categories",
    exact: true,
    title: "Danh mục",
    icon: 'icon-dot',
    component: Category,
    key: "submenu22",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: "/products/categories/create",
        exact: true,
        title: "Thêm danh mục",
        icon: 'icon-dot',
        component: AddCategory,
        key: "submenu221",
        isShow: false,
        header: null,
        subMenu: [],
        isShowCreate: false,
        pathCreate: ''
      }
    ],
    isShowCreate: true,
    pathCreate: '/products/categories/create'
  },
  {
    path: "/products/materials",
    exact: true,
    title: "Chất liệu",
    icon: 'icon-dot',
    component: Material,
    key: "submenu23",
    isShow: true,
    header: null,
    subMenu: [],
    isShowCreate: false,
    pathCreate: ''
  },
  {
    path: "/products/sizes",
    exact: true,
    title: "Kích cỡ",
    icon: 'icon-dot',
    component: Size,
    key: "submenu24",
    isShow: true,
    header: null,
    subMenu: [],
    isShowCreate: false,
    pathCreate: ''
  },
  {
    path: "/products/colors",
    exact: true,
    title: "Màu sắc",
    icon: 'icon-dot',
    component: Color,
    key: "submenu25",
    isShow: true,
    header: null,
    subMenu: [],
    isShowCreate: false,
    pathCreate: ''
  },
  {
    path: "/products/suppliers",
    exact: true,
    title: "Nhà cung cấp",
    icon: 'icon-dot',
    component: Supplier,
    key: "submenu26",
    isShow: true,
    header: null,
    subMenu: [],
    isShowCreate: false,
    pathCreate: ''
  }
]

export default product;