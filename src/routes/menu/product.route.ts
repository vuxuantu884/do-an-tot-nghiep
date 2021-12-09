import {ProductPermission} from "config/permissions/product.permission";
import {SuppliersPermissions} from "config/permissions/supplier.permisssion";
import UrlConfig from "config/url.config";
import {RouteMenu} from "model/other";
import React from "react";
import ColorUpdateScreen from "screens/products/color/color-update.screen";

const Category = React.lazy(
  () => import("screens/products/category/category-list.screen")
);
const ProductCreateScreen = React.lazy(
  () => import("screens/products/product/ProductCreateScreen")
);
const ColorListScreen = React.lazy(
  () => import("screens/products/color/color-list.screen")
);
const UpdateMaterial = React.lazy(
  () => import("screens/products/materials/material-update.screen")
);
const ListMaterial = React.lazy(
  () => import("screens/products/materials/materials-list.screen")
);
const AddMaterial = React.lazy(
  () => import("screens/products/materials/material-add.screen")
);
const SizeListScreen = React.lazy(() => import("screens/products/size/size-list.screen"));
const SizeCreateScreen = React.lazy(
  () => import("screens/products/size/size-create.screen")
);
const SizeUpdateScreen = React.lazy(
  () => import("screens/products/size/size-update.screen")
);
const ListSupplier = React.lazy(
  () => import("screens/products/supplier/supplier-list.screen")
);
const ViewSupplier = React.lazy(
  () => import("screens/products/supplier/supplier-view.screen")
);

const AddCategory = React.lazy(
  () => import("screens/products/category/category-add.screen")
);
const UpdateCategory = React.lazy(
  () => import("screens/products/category/category-update.screen")
);
const SupplierCreateScreen = React.lazy(
  () => import("screens/products/supplier/supplier-add.screen")
);
const SupplierUpdateScreen = React.lazy(
  () => import("screens/products/supplier/supplier-update.screen")
);
const ColorCreateScreen = React.lazy(
  () => import("screens/products/color/color-create.screen")
);

//Product
const Product = React.lazy(() => import("screens/products/product/ProductSearchScreen"));
const ProductDetailScreen = React.lazy(
  () => import("screens/products/product/ProductDetailScreen")
);
const ProductUpdateScreen = React.lazy(
  () => import("screens/products/product/ProductUpdateScreen")
);
const ProductImportScreen = React.lazy(
  () => import("screens/products/product/ImportScreen")
);
const ProductBarcodeScreen = React.lazy(
  () => import("screens/products/product/BarcodeProductScreen")
);

//product Collection 
const Collection = React.lazy(
  () => import("screens/products/collection")
);
const CollectionAdd = React.lazy(
  () => import("screens/products/collection/create")
);
const CollectionUpdate = React.lazy(
  () => import("screens/products/collection/update")
);

const product: Array<RouteMenu> = [
  {
    path: UrlConfig.VARIANTS,
    exact: true,
    title: "Sản phẩm",
    icon: "icon-dot",
    component: Product,
    key: "submenu21",
    isShow: true,
    header: null,
    permissions: [
      ProductPermission.read,
      ProductPermission.read_variant,
      ProductPermission.read_histories,
    ],
    subMenu: [
      {
        path: `${UrlConfig.PRODUCT}/create`,
        exact: true,
        title: "Thêm sản phẩm mới",
        icon: "icon-dot",
        component: ProductCreateScreen,
        key: "submenu211",
        isShow: true,
        header: null,
        permissions: [ProductPermission.create],
        subMenu: [],
      },
      {
        path: `${UrlConfig.PRODUCT}/import`,
        exact: true,
        title: "Nhập file",
        icon: "icon-dot",
        component: ProductImportScreen,
        key: "submenu214",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.PRODUCT}/barcode`,
        exact: true,
        title: "Nhập file",
        icon: "icon-dot",
        component: ProductBarcodeScreen,
        key: "submenu215",
        isShow: true,
        header: null,
        permissions: [ProductPermission.print_temp],
        subMenu: [],
      },

      {
        path: `${UrlConfig.PRODUCT}`,
        exact: true,
        title: "Danh sách cha",
        icon: "icon-dot",
        component: Product,
        key: "submenu216",
        isShow: true,
        header: null,
        permissions: [ProductPermission.read],
        subMenu: [],
      },
      {
        path: `${UrlConfig.PRODUCT}/histories`,
        exact: true,
        title: "Lịch sử sản phẩm",
        icon: "icon-dot",
        component: Product,
        key: "submenu217",
        isShow: true,
        permissions: [ProductPermission.read_histories],
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.PRODUCT}/history-prices`,
        exact: true,
        title: "Lịch sử giá",
        icon: "icon-dot",
        component: Product,
        key: "submenu218",
        isShow: true,
        permissions: [ProductPermission.read_histories],
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.PRODUCT}/:id`,
        exact: true,
        title: "Chi tiết sản phẩm",
        icon: "icon-dot",
        component: ProductDetailScreen,
        key: "submenu219",
        isShow: true,
        header: null,
        permissions: [ProductPermission.read],
        subMenu: [],
        pathIgnore: ["create"],
      },
      {
        path: `${UrlConfig.PRODUCT}/:id/variants/:variantId`,
        exact: true,
        title: "Chi tiết sản phẩm",
        icon: "icon-dot",
        component: ProductDetailScreen,
        key: "submenu2220",
        isShow: true,
        header: null,
        permissions: [ProductPermission.read, ProductPermission.update],
        subMenu: [],
        pathIgnore: ["create"],
      },
      {
        path: `${UrlConfig.PRODUCT}/:id/update`,
        exact: true,
        title: "Sửa sản phẩm",
        icon: "icon-dot",
        component: ProductUpdateScreen,
        key: "submenu2221",
        isShow: true,
        header: null,
        permissions: [ProductPermission.update],
        subMenu: [],
        pathIgnore: ["create"],
      },
    ],
  },
  {
    path: "submenu23",
    exact: true,
    title: "Thuộc tính",
    subTitle: "Cấu hình thuộc tính",
    icon: "icon-dot",
    component: Category,
    key: "submenu23",
    isShow: true,
    header: null,
    showMenuThird: true,
    subMenu: [
      {
        path: UrlConfig.CATEGORIES,
        exact: true,
        title: "Danh mục",
        icon: "icon-dot",
        component: Category,
        key: "submenu231",
        isShow: true,
        header: null,
        permissions: [ProductPermission.categories_read],
        subMenu: [
          {
            path: `${UrlConfig.CATEGORIES}/create`,
            exact: true,
            title: "Thêm danh mục",
            icon: "icon-dot",
            component: AddCategory,
            key: "submenu2311",
            isShow: true,
            header: null,
            permissions: [ProductPermission.categories_create],
            subMenu: [],
          },
          {
            path: `${UrlConfig.CATEGORIES}/:id`,
            exact: true,
            title: "Sửa danh mục",
            icon: "icon-dot",
            component: UpdateCategory,
            key: "submenu2312",
            isShow: true,
            header: null,
            permissions: [
              ProductPermission.categories_read,
              ProductPermission.categories_update,
            ],
            subMenu: [],
            pathIgnore: ["create"],
          },
        ],
      }, 
      {
        path: UrlConfig.MATERIALS,
        exact: true,
        title: "Chất liệu",
        icon: "icon-dot",
        component: ListMaterial,
        key: "submenu232",
        isShow: true,
        header: null,
        permissions: [ProductPermission.materials_read],
        subMenu: [
          {
            path: `${UrlConfig.MATERIALS}/create`,
            exact: true,
            title: "Thêm chất liệu",
            icon: "icon-dot",
            component: AddMaterial,
            key: "submenu2321",
            isShow: true,
            header: null,
            permissions: [ProductPermission.materials_create],
            subMenu: [],
          },
          {
            path: `${UrlConfig.MATERIALS}/:id`,
            exact: true,
            title: "Sửa chất liệu",
            icon: "icon-dot",
            component: UpdateMaterial,
            key: "submenu2322",
            isShow: true,
            header: null,
            permissions: [
              ProductPermission.materials_read,
              ProductPermission.materials_update,
            ],
            subMenu: [],
            pathIgnore: ["create"],
          },
        ],
      },
      {
        path: UrlConfig.SIZES,
        exact: true,
        title: "Kích cỡ",
        icon: "icon-dot",
        component: SizeListScreen,
        key: "submenu233",
        isShow: true,
        header: null,
        permissions: [ProductPermission.sizes_read],
        subMenu: [
          {
            path: `${UrlConfig.SIZES}/create`,
            exact: true,
            title: "Thêm kích cỡ",
            icon: "icon-dot",
            component: SizeCreateScreen,
            key: "submenu2331",
            isShow: true,
            header: null,
            permissions: [ProductPermission.sizes_create],
            subMenu: [],
          },
          {
            path: `${UrlConfig.SIZES}/:id`,
            exact: true,
            title: "Sừa kích cỡ",
            icon: "icon-dot",
            component: SizeUpdateScreen,
            key: "submenu2332",
            isShow: true,
            header: null,
            permissions: [ProductPermission.sizes_read, ProductPermission.sizes_update],
            subMenu: [],
            pathIgnore: ["create"],
          },
        ],
      },
      {
        path: UrlConfig.COLORS,
        exact: true,
        title: "Màu sắc",
        icon: "icon-dot",
        component: ColorListScreen,
        key: "submenu234",
        isShow: true,
        header: null,
        permissions: [ProductPermission.colors_read],
        subMenu: [
          {
            path: `${UrlConfig.COLORS}/create`,
            exact: true,
            title: "Thêm màu sắc",
            icon: "icon-dot",
            component: ColorCreateScreen,
            key: "submenu2341",
            isShow: true,
            header: null,
            permissions: [ProductPermission.colors_create],
            subMenu: [],
          },
          {
            path: `${UrlConfig.COLORS}/:id`,
            exact: true,
            title: "Sừa màu sắc",
            icon: "icon-dot",
            component: ColorUpdateScreen,
            key: "submenu2342",
            isShow: true,
            header: null,
            permissions: [ProductPermission.colors_update, ProductPermission.colors_read],
            subMenu: [],
            pathIgnore: ["create"],
          },
        ],
      },
      {
        path: UrlConfig.COLLECTIONS,
        exact: true,
        title: "Nhóm hàng",
        icon: "icon-dot",
        component: Collection,
        key: "submenu235",
        isShow: true,
        header: null,
        permissions: [ProductPermission.collections_read],
        subMenu: [
          {
            path: `${UrlConfig.COLLECTIONS}/create`,
            exact: true,
            title: "Thêm nhóm hàng",
            icon: "icon-dot",
            component: CollectionAdd,
            key: "submenu2351",
            isShow: true,
            header: null,
            permissions: [ProductPermission.collections_create],
            subMenu: [],
          },
          {
            path: `${UrlConfig.COLLECTIONS}/:id`,
            exact: true,
            title: "Sửa nhóm hàng",
            icon: "icon-dot",
            component: CollectionUpdate,
            key: "submenu2352",
            isShow: true,
            header: null,
            permissions: [
              ProductPermission.collections_read,
              ProductPermission.collections_update,
            ],
            subMenu: [],
            pathIgnore: ["create"],
          },
        ],
      },
    ],
  },
  {
    path: UrlConfig.SUPPLIERS,
    exact: true,
    title: "Nhà cung cấp",
    icon: "icon-dot",
    component: ListSupplier,
    key: "submenu236",
    isShow: true,
    header: null,
    permissions: [SuppliersPermissions.READ],
    subMenu: [
      {
        path: `${UrlConfig.SUPPLIERS}/create`,
        exact: true,
        title: "Thêm mới nhà cung cấp",
        icon: "icon-dot",
        component: SupplierCreateScreen,
        key: "submenu2361",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [SuppliersPermissions.CREATE],
      },
      {
        path: `${UrlConfig.SUPPLIERS}/:id/update`,
        exact: true,
        title: "Sửa nhà cung cấp",
        icon: "icon-dot",
        component: SupplierUpdateScreen,
        key: "submenu2362",
        isShow: true,
        header: null,
        subMenu: [],
        pathIgnore: ["create"],
        permissions: [SuppliersPermissions.UPDATE, SuppliersPermissions.READ],
      },
      {
        path: `${UrlConfig.SUPPLIERS}/:id`,
        exact: false,
        title: "Chi tiết nhà cung cấp",
        icon: "icon-dot",
        component: ViewSupplier,
        key: "submenu2351",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [SuppliersPermissions.READ],
      },
      
    ],
  },
];

export default product;
