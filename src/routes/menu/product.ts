import React from 'react';
import { RouteMenu } from "model/other";
import { HEADER_TYPE } from 'config/HeaderConfig';
import ColorUpdateScreen from 'screens/color/color-update.screen';
import UrlConfig from 'config/UrlConfig';

const Category = React.lazy(() => import ("screens/category/category-list.screen"));
const Product = React.lazy(() => import ("screens/product/product.search.screen"));
const ColorListScreen = React.lazy(() => import ("screens/color/color-list.screen"));
const UpdateMaterial = React.lazy(() => import ("screens/materials/ material-update.screen"));
const ListMaterial = React.lazy(() => import ("screens/materials/materials-list.screen"));
const AddMaterial = React.lazy(() => import ("screens/materials/material-add.screen"));
const SizeListScreen = React.lazy(() => import ("screens/size/size-list.screen"));
const ListSupplier = React.lazy(() => import ("screens/supllier/supplier-list.screen"));
const AddCategory = React.lazy(() => import ("screens/category/category-add.screen"))
const UpdateCategory = React.lazy(() => import ("screens/category/category-update.screen"))
const CreateSupplierScreen = React.lazy(() => import ("screens/supllier/supplier-add.screen"));
const ColorCreateScreen = React.lazy(() => import ("screens/color/color-create.screen"));

const product: Array<RouteMenu> = [
  {
    path: UrlConfig.PRODUCT,
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
    path: UrlConfig.CATEGORIES,
    exact: true,
    title: "Danh mục",
    icon: 'icon-dot',
    component: Category,
    key: "submenu22",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.CATEGORIES}/create`,
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
      },
      {
        path: `${UrlConfig.CATEGORIES}/:id`,
        exact: true,
        title: "Sửa danh mục",
        icon: 'icon-dot',
        component: UpdateCategory,
        key: "submenu221",
        isShow: false,
        header: null,
        subMenu: [],
        pathIgnore: ['create'],
        type: 0,
        object: null,
      }
    ],
    type: HEADER_TYPE.BUTTON_CREATE,
    object: {
      pathCreate: `${UrlConfig.CATEGORIES}/create`
    },
  },
  {
    path: UrlConfig.MATERIALS,
    exact: true,
    title: "Chất liệu",
    icon: 'icon-dot',
    component: ListMaterial,
    key: "submenu23",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.MATERIALS}/create`,
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
        path: `${UrlConfig.MATERIALS}/:id`,
        exact: true,
        title: "Sửa chất liệu",
        icon: 'icon-dot',
        component: UpdateMaterial,
        key: "submenu23",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: {},
        pathIgnore: ['create']
      }
    ],
    type: HEADER_TYPE.BUTTON_CREATE,
    object: {
      pathCreate: `${UrlConfig.MATERIALS}/create`,
    },
  },
  {
    path: UrlConfig.SIZES,
    exact: true,
    title: "Kích cỡ",
    icon: 'icon-dot',
    component: SizeListScreen,
    key: "submenu24",
    isShow: true,
    header: null,
    subMenu: [],
    type: 0,
    object: null,
  },
  {
    path: UrlConfig.COLORS,
    exact: true,
    title: "Màu sắc",
    icon: 'icon-dot',
    component: ColorListScreen,
    key: "submenu25",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.COLORS}/create`,
        exact: true,
        title: "Thêm màu sắc",
        icon: 'icon-dot',
        component: ColorCreateScreen,
        key: "submenu23",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: {}
      },
      {
        path: `${UrlConfig.COLORS}/:id`,
        exact: true,
        title: "Sừa màu sắc",
        icon: 'icon-dot',
        component: ColorUpdateScreen,
        key: "submenu23",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: {},
        pathIgnore: ['create']
      },
    ],
    type: HEADER_TYPE.BUTTON_CREATE,
    object: {
      pathCreate: `${UrlConfig.COLORS}/create`,
    },
  },
  {
    path: UrlConfig.SUPPLIERS,
    exact: true,
    title: "Nhà cung cấp",
    icon: 'icon-dot',
    component: ListSupplier,
    key: "submenu26",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.SUPPLIERS}/create`,
        exact: true,
        title: "Thêm mới nhà cung cấp",
        icon: 'icon-dot',
        component: CreateSupplierScreen,
        key: "submenu261",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
      }
    ],
    type: HEADER_TYPE.BUTTON_CREATE,
    object: {
      pathCreate: `${UrlConfig.SUPPLIERS}/create`,
    },
  }
]

export default product;