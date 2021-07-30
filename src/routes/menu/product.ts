import React from 'react';
import { RouteMenu } from "model/other";
import { HEADER_TYPE } from 'config/HeaderConfig';
import ColorUpdateScreen from 'screens/color/color-update.screen';
import UrlConfig from 'config/UrlConfig';
import UpdateSupplierScreen from "../../screens/supllier/supplier-update.screen";

const Category = React.lazy(() => import ("screens/category/category-list.screen"));
const ProductCreateScreen = React.lazy(() => import ("screens/product/product-create.screen"));
const ColorListScreen = React.lazy(() => import ("screens/color/color-list.screen"));
const UpdateMaterial = React.lazy(() => import ("screens/materials/ material-update.screen"));
const ListMaterial = React.lazy(() => import ("screens/materials/materials-list.screen"));
const AddMaterial = React.lazy(() => import ("screens/materials/material-add.screen"));
const SizeListScreen = React.lazy(() => import ("screens/size/size-list.screen"));
const SizeCreateScreen = React.lazy(() => import ("screens/size/size-create.screen"));
const SizeUpdateScreen = React.lazy(() => import ("screens/size/size-update.screen"));
const ListSupplier = React.lazy(() => import ("screens/supllier/supplier-list.screen"));
const AddCategory = React.lazy(() => import ("screens/category/category-add.screen"))
const UpdateCategory = React.lazy(() => import ("screens/category/category-update.screen"))
const SupplierCreateScreen = React.lazy(() => import ("screens/supllier/supplier-add.screen"));
const ColorCreateScreen = React.lazy(() => import ("screens/color/color-create.screen"));

//Product
const Product = React.lazy(() => import ("screens/product/product.search.screen"));
const  VariantUpdateScreen = React.lazy(() => import ("screens/product/variant-update.screen"));
const  ProductUpdateScreen = React.lazy(() => import ("screens/product/product-update.screen"));

//PO
const  PurchaseOrderListScreen = React.lazy(() => import ("screens/purchase-order/purchase-order-list.screen"));
const  PurchaseOrderCreateScreen = React.lazy(() => import ("screens/purchase-order/purchase-order-create.screen"));
const  PurchaseOrderDetailScreen = React.lazy(() => import ("screens/purchase-order/purchase-order-detail.screen"));



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
    subMenu: [
      {
        path: `${UrlConfig.PRODUCT}/create`,
        exact: true,
        title: "Thêm sản phẩm mới",
        icon: 'icon-dot',
        component: ProductCreateScreen,
        key: "submenu211",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
      },
      {
        path: `${UrlConfig.PRODUCT}/variants/:id`,
        exact: true,
        title: "Sửa biến thể",
        icon: 'icon-dot',
        component: VariantUpdateScreen,
        key: "submenu212",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
      },
      {
        path: `${UrlConfig.PRODUCT}/:id`,
        exact: true,
        title: "Sửa sản phẩm",
        icon: 'icon-dot',
        component: ProductUpdateScreen,
        key: "submenu213",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
        pathIgnore: ['create']
      },
    ],
    type: HEADER_TYPE.BUTTON_CREATE,
    object: {
      pathCreate: `${UrlConfig.PRODUCT}/create`,
    },
  },
  {
    path: UrlConfig.PURCHASE_ORDER,
    exact: true,
    title: "Nhập hàng",
    icon: 'icon-dot',
    component: PurchaseOrderListScreen,
    key: "submenu22",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.PURCHASE_ORDER}/create`,
        exact: true,
        title: "Thêm sản phẩm mới",
        icon: 'icon-dot',
        component: PurchaseOrderCreateScreen,
        key: "submenu221",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
      },
      {
        path: `${UrlConfig.PURCHASE_ORDER}/:id`,
        exact: true,
        title: "Thêm sản phẩm mới",
        icon: 'icon-dot',
        component: PurchaseOrderDetailScreen,
        key: "submenu222",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
        pathIgnore:['create']
      },
    ],
    type: 0,
    object: {},
  },
  {
    path: UrlConfig.CATEGORIES,
    exact: true,
    title: "Danh mục",
    icon: 'icon-dot',
    component: Category,
    key: "submenu23",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.CATEGORIES}/create`,
        exact: true,
        title: "Thêm danh mục",
        icon: 'icon-dot',
        component: AddCategory,
        key: "submenu231",
        isShow: true,
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
        key: "submenu232",
        isShow: true,
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
    key: "submenu24",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.MATERIALS}/create`,
        exact: true,
        title: "Thêm chất liệu",
        icon: 'icon-dot',
        component: AddMaterial,
        key: "submenu241",
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
        key: "submenu242",
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
    key: "submenu25",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.SIZES}/create`,
        exact: true,
        title: "Thêm kích cỡ",
        icon: 'icon-dot',
        component: SizeCreateScreen,
        key: "submenu251",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: {}
      },
      {
        path: `${UrlConfig.SIZES}/:id`,
        exact: true,
        title: "Sừa kích cỡ",
        icon: 'icon-dot',
        component: SizeUpdateScreen,
        key: "submenu252",
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
      pathCreate: `${UrlConfig.SIZES}/create`,
    },
  },
  {
    path: UrlConfig.COLORS,
    exact: true,
    title: "Màu sắc",
    icon: 'icon-dot',
    component: ColorListScreen,
    key: "submenu26",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.COLORS}/create`,
        exact: true,
        title: "Thêm màu sắc",
        icon: 'icon-dot',
        component: ColorCreateScreen,
        key: "submenu261",
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
        key: "submenu262",
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
    key: "submenu27",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.SUPPLIERS}/create`,
        exact: true,
        title: "Thêm mới nhà cung cấp",
        icon: 'icon-dot',
        component: SupplierCreateScreen,
        key: "submenu271",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
      },
      {
        path: `${UrlConfig.SUPPLIERS}/:id`,
        exact: true,
        title: "Sửa nhà cung cấp",
        icon: 'icon-dot',
        component: UpdateSupplierScreen,
        key: "submenu272",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
        pathIgnore: ['create']
      }
    ],
    type: HEADER_TYPE.BUTTON_CREATE,
    object: {
      pathCreate: `${UrlConfig.SUPPLIERS}/create`,
    },
  }
]

export default product;