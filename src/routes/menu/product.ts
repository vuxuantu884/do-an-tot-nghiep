import React from 'react';
import { RouteMenu } from "model/other";
import { HEADER_TYPE } from 'config/HeaderConfig';


const Category = React.lazy(() => import ("screens/category/category.screen"));
const Product = React.lazy(() => import ("screens/product"));
const Color = React.lazy(() => import ("screens/product/color.screen"));
const UpdateMaterial = React.lazy(() => import ("screens/materials/update-material"));
const ListMaterial = React.lazy(() => import ("screens/materials/list-materials"));
const AddMaterial = React.lazy(() => import ("screens/materials/add-material"));
const Size = React.lazy(() => import ("screens/product/size.screen"));
const ListSupplier = React.lazy(() => import ("screens/supllier/list-supplier.screen"));
const AddCategory = React.lazy(() => import ("screens/category/add-category.screen"))

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
    type: 0,
    object: null,
  },
  {
    path: "/categories",
    exact: true,
    title: "Danh mục",
    icon: 'icon-dot',
    component: Category,
    key: "submenu22",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: "/categories/create",
        exact: true,
        title: "Thêm danh mục",
        icon: 'icon-dot',
        component: AddCategory,
        key: "submenu221",
        isShow: false,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
      }
    ],
    type: HEADER_TYPE.BUTTON_CREATE,
    object: {
      pathCreate: '/categories/create'
    },
  },
  {
    path: "/materials",
    exact: true,
    title: "Chất liệu",
    icon: 'icon-dot',
    component: ListMaterial,
    key: "submenu23",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: "/materials/create",
        exact: true,
        title: "Thêm chất liệu",
        icon: 'icon-dot',
        component: AddMaterial,
        key: "submenu23",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: {}
      },
      {
        path: "/materials/:id",
        exact: true,
        title: "Sửa chất liệu",
        icon: 'icon-dot',
        component: UpdateMaterial,
        key: "submenu23",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: {}
      }
    ],
    type: HEADER_TYPE.BUTTON_CREATE,
    object: {
      pathCreate: '/materials/create'
    },
  },
  {
    path: "/sizes",
    exact: true,
    title: "Kích cỡ",
    icon: 'icon-dot',
    component: Size,
    key: "submenu24",
    isShow: true,
    header: null,
    subMenu: [],
    type: 0,
    object: null,
  },
  {
    path: "/colors",
    exact: true,
    title: "Màu sắc",
    icon: 'icon-dot',
    component: Color,
    key: "submenu25",
    isShow: true,
    header: null,
    subMenu: [],
    type: 0,
    object: null,
  },
  {
    path: "/suppliers",
    exact: true,
    title: "Nhà cung cấp",
    icon: 'icon-dot',
    component: ListSupplier,
    key: "submenu26",
    isShow: true,
    header: null,
    subMenu: [],
    type: HEADER_TYPE.BUTTON_CREATE,
    object: {
      pathCreate: '/suppliers/create'
    },
  }
]

export default product;