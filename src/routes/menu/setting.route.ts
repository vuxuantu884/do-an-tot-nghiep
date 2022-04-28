import UrlConfig, { AccountUrl } from "config/url.config";
import React from "react";
import {RouteMenu} from "model/other";
import {
  AccountPermissions,
  DepartmentsPermissions,
} from "config/permissions/account.permisssion";
import { AuthPermissions, PrintPermissions, SourcePermissions, StorePermissions } from "config/permissions/setting.permisssion";

const AccountMeScreen = React.lazy(
  () => import("screens/settings/account/account.me.screen")
);
const BankAccountScreen = React.lazy(
  () => import("screens/settings/bank/bank-account.screen")
);
const BankAccountCreateScreen = React.lazy(
  () => import("screens/settings/bank/create/bank-account.create.screen")
);
const BackAccountUpdateScreen = React.lazy(
  () => import("screens/settings/bank/update/bank-account.update.screen")
);
const SmsScreen = React.lazy(
  () => import("screens/settings/sms/sms.screen")
);
const SmsOrderRetail = React.lazy(
  () => import("screens/settings/sms/config/SmsOrderRetail")
);
const SmsWebsiteOrder = React.lazy(
  () => import("screens/settings/sms/config/SmsWebsiteOrder")
);

const ManageUserScreen = React.lazy(
  () => import("screens/settings/account/account.search.screen")
);

const AccountDetailScreen = React.lazy(() => import("screens/settings/account/detail"));
// const ManageStoreScreen = React.lazy(
//   () => import("screens/setting/manage-store.screen")
// );
const RoleListScreen = React.lazy(
  () => import("screens/settings/roles/role-list.screen")
);
const RoleCreateScreen = React.lazy(
  () => import("screens/settings/roles/role-create.screen")
);
const RoleUpdateScreen = React.lazy(
  () => import("screens/settings/roles/update/role-update.screen")
);
const AccountCreateScreen = React.lazy(
  () => import("screens/settings/account/account.create.screen")
);
const AccountUpdateScreen = React.lazy(
  () => import("screens/settings/account/account.update.screen")
);
const AccountUpdatePassScreen = React.lazy(
  () => import("screens/settings/account/account.update.pass.screen")
);

//store
const StoreCreateScreen = React.lazy(
  () => import("screens/settings/store/store-create.screen")
);
const StoreListScreen = React.lazy(
  () => import("screens/settings/store/store-list.screen")
);
const StoreUpdateScreen = React.lazy(
  () => import("screens/settings/store/store-update.screen")
);
const StoreDetailScreen = React.lazy(() => import("screens/settings/store/store-detail"));

// fulfillment: quản lý đơn hàng
const SettingFulfillmentScreen = React.lazy(
  () => import("screens/order-online/settings/OrderProcessingStatus/OrderProcessingStatus")
);

// order sources: quản lý nguồn đơn hàng
const SettingOrderSourcesScreen = React.lazy(
  () => import("screens/order-online/settings/order-sources")
);

// printer: quản lý mẫu in
const SettingPrinterScreen = React.lazy(() => import("screens/settings/printer"));
const SettingCreatePrinterScreen = React.lazy(
  () => import("screens/settings/printer/create")
);
const SettingSinglePrinterScreen = React.lazy(
  () => import("screens/settings/printer/id")
);

// OrderSettings: Cài đặt đơn hàng
const OrderSettingsScreen = React.lazy(() => import("screens/settings/order-settings"));
const OrderSettingsCreateShippingServicesAndShippingFeeScreen = React.lazy(
  () => import("screens/settings/order-settings/ShippingServicesAndShippingFee/create")
);
const OrderSettingsCreateShippingServicesAndShippingDetailScreen = React.lazy(
  () => import("screens/settings/order-settings/ShippingServicesAndShippingFee/id")
);
const DepartmentSearchScreen = React.lazy(
  () => import("screens/settings/department/Search")
);
const DepartmentCreateScreen = React.lazy(
  () => import("screens/settings/department/Create")
);
const DepartmentDetailScreen = React.lazy(
  () => import("screens/settings/department/Detail")
);
const DepartmentUpdateScreen = React.lazy(
  () => import("screens/settings/department/Update")
);

const setting: Array<RouteMenu> = [
  {
    path: UrlConfig.ACCOUNTS,
    exact: true,
    title: "Quản lý người dùng",
    icon: "icon-dot",
    component: ManageUserScreen,
    key: "subMenu91",
    isShow: true,
    header: null,
    permissions: [AccountPermissions.READ],
    subMenu: [
      {
        path: `${UrlConfig.ACCOUNTS}/create`,
        exact: true,
        title: "Thêm mới người dùng",
        icon: "icon-dot",
        component: AccountCreateScreen,
        key: "subMenu261",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [AccountPermissions.CREATE],
      },
      {
        path: `${UrlConfig.ACCOUNTS}/:code/update`,
        exact: true,
        title: "Chỉnh sửa người dùng",
        icon: "icon-dot",
        component: AccountUpdateScreen,
        key: "account2",
        isShow: true,
        header: null,
        subMenu: [],
        pathIgnore: ["create"],
        permissions: [AccountPermissions.UPDATE],
      }, {
        path: AccountUrl.UPDATE_PASSWORD,
        exact: true,
        title: "Đặt lại mật khẩu",
        icon: "icon-dot",
        component: AccountUpdatePassScreen,
        key: "account2",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.ACCOUNTS}/me`,
        exact: true,
        title: "Thông tin tài khoản",
        icon: "icon-dot",
        component: AccountMeScreen,
        key: "account2",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.ACCOUNTS}/:code`,
        exact: true,
        title: "Xem thông tin người dùng",
        icon: "icon-dot",
        component: AccountDetailScreen,
        key: "subMenu262",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [AccountPermissions.READ],
      },
    ],
  },
  {
    path: UrlConfig.DEPARTMENT,
    exact: true,
    title: "Quản lý phòng ban",
    icon: "icon-dot",
    component: DepartmentSearchScreen,
    key: "subMenu910",
    isShow: true,
    header: null,
    permissions: [DepartmentsPermissions.READ],
    subMenu: [
      {
        path: `${UrlConfig.DEPARTMENT}/create`,
        exact: true,
        title: "Thêm mới",
        icon: "icon-dot",
        component: DepartmentCreateScreen,
        key: "subMenu261",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [DepartmentsPermissions.CREATE],
      },
      {
        path: `${UrlConfig.DEPARTMENT}/:id`,
        exact: true,
        title: "Chi tiết bộ phận",
        icon: "icon-dot",
        component: DepartmentDetailScreen,
        key: "account2",
        isShow: true,
        header: null,
        subMenu: [],
        pathIgnore: ["create"],
        permissions: [DepartmentsPermissions.READ],
      },
      {
        path: `${UrlConfig.DEPARTMENT}/:id/update`,
        exact: true,
        title: "Chi tiết bộ phận",
        icon: "icon-dot",
        component: DepartmentUpdateScreen,
        key: "account2",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [DepartmentsPermissions.UPDATE],
      },
    ],
  },
  {
    path: `${UrlConfig.STORE}`,
    exact: true,
    title: "Quản lý cửa hàng",
    icon: "icon-dot",
    component: StoreListScreen,
    key: "subMenu92",
    isShow: true,
    header: null,
    permissions: [StorePermissions.READ],
    subMenu: [
      {
        path: `${UrlConfig.STORE}/create`,
        exact: true,
        title: "Thêm cửa hàng",
        icon: "icon-dot",
        component: StoreCreateScreen,
        key: "subMenu921",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [StorePermissions.CREATE],
      },
      {
        path: `${UrlConfig.STORE}/:id`,
        exact: true,
        title: "Chi tiết cửa hàng",
        icon: "icon-dot",
        component: StoreDetailScreen,
        key: "subMenu922",
        isShow: true,
        header: null,
        permissions: [StorePermissions.READ],
        subMenu: [
          {
            path: `${UrlConfig.STORE}/:id/update`,
            exact: true,
            title: "Sửa cửa hàng",
            icon: "icon-dot",
            component: StoreUpdateScreen,
            key: "subMenu9221",
            isShow: true,
            header: null,
            subMenu: [],
            pathIgnore: ["create"],
            permissions: [StorePermissions.UPDATE],
          },
        ],
        pathIgnore: ["create"],
      },
    ],
  },
  {
    path: UrlConfig.PRINTER,
    exact: true,
    title: "Quản lý mẫu in",
    icon: "icon-dot",
    component: SettingPrinterScreen,
    key: "subMenu93",
    isShow: true,
    header: null,
    permissions: [PrintPermissions.READ],
    subMenu: [
      {
        path: `${UrlConfig.PRINTER}/create`,
        exact: true,
        title: "Thêm mới mẫu in",
        icon: "icon-dot",
        component: SettingCreatePrinterScreen,
        key: "subMenu262",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [PrintPermissions.CREATE],
      },
      {
        path: `${UrlConfig.PRINTER}/:id`,
        exact: true,
        title: "Sửa mẫu in",
        icon: "icon-dot",
        component: SettingSinglePrinterScreen,
        key: "subMenu263",
        isShow: true,
        header: null,
        subMenu: [],
        pathIgnore: ["create"],
        permissions: [PrintPermissions.CREATE],
      },
    ],
  },
  {
    path: UrlConfig.ROLES,
    exact: true,
    title: "Quản lý nhóm quyền",
    icon: "icon-dot",
    component: RoleListScreen,
    key: "subMenu94",
    isShow: true,
    header: null,
    permissions: [AuthPermissions.READ],
    subMenu: [
      {
        path: `${UrlConfig.ROLES}/create`,
        exact: true,
        title: "Thêm mới nhóm quyền",
        icon: "icon-dot",
        component: RoleCreateScreen,
        key: "subMenu941",
        isShow: true,
        header: null,
        permissions: [AuthPermissions.CREATE],
        subMenu: [],
      },
      {
        path: `${UrlConfig.ROLES}/:id/update`,
        exact: true,
        title: "Chỉnh sửa nhóm quyền",
        icon: "icon-dot",
        component: RoleUpdateScreen,
        key: "subMenu942",
        isShow: true,
        header: null,
        permissions: [AuthPermissions.UPDATE],
        subMenu: [],
      },
    ],
  },
  {
    path: UrlConfig.ORDER_PROCESSING_STATUS,
    exact: true,
    title: "Xử lý đơn hàng",
    subTitle: "Thiết lập quy trình xử lý đơn hàng",
    icon: "icon-dot",
    component: SettingFulfillmentScreen,
    key: UrlConfig.ORDER_PROCESSING_STATUS,
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.ORDER_PROCESSING_STATUS}/create`,
        exact: true,
        title: "Thêm mới đơn hàng",
        icon: "icon-dot",
        component: SettingFulfillmentScreen,
        key: "subMenu261",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
  {
    path: UrlConfig.ORDER_SOURCES,
    exact: true,
    title: "Nguồn đơn hàng",
    subTitle: "Thêm và quản lý nguồn tạo ra đơn hàng",
    icon: "icon-dot",
    component: SettingOrderSourcesScreen,
    key: UrlConfig.ORDER_SOURCES,
    isShow: true,
    header: null,
    permissions: [SourcePermissions.READ],
    subMenu: [
      {
        path: `${UrlConfig.ORDER_SOURCES}/create`,
        exact: true,
        title: "Thêm mới nguồn đơn hàng",
        icon: "icon-dot",
        component: AccountCreateScreen,
        key: "subMenu261",
        isShow: true,
        header: null,
        subMenu: [],
        permissions: [SourcePermissions.CREATE],
      },
      {
        path: `${UrlConfig.ORDER_SOURCES}/:id`,
        exact: true,
        title: "Chỉnh sửa nguồn đơn hàng",
        icon: "icon-dot",
        component: AccountUpdateScreen,
        key: "account2",
        isShow: true,
        header: null,
        subMenu: [],
        pathIgnore: ["create"],
        permissions: [SourcePermissions.UPDATE],
      },
    ],
  },

  {
    path: UrlConfig.ORDER_SETTINGS,
    exact: true,
    title: "Cấu hình đơn hàng",
    subTitle: "",
    icon: "icon-dot",
    component: OrderSettingsScreen,
    key: UrlConfig.ORDER_SETTINGS,
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.ORDER_SETTINGS}/create`,
        exact: true,
        title: "Thêm cài đặt dịch vụ vận chuyển & phí ship báo khách",
        icon: "icon-dot",
        component: OrderSettingsCreateShippingServicesAndShippingFeeScreen,
        key: "create-order-setting",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.ORDER_SETTINGS}/shipping-services-and-shipping-fee/:id`,
        exact: true,
        title: "Chi tiết dịch vụ vận chuyển & phí ship báo khách",
        icon: "icon-dot",
        component: OrderSettingsCreateShippingServicesAndShippingDetailScreen,
        key: "detail-order-setting",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
  {
    path: UrlConfig.BANK_ACCOUNT,
    exact: true,
    title: "Tài khoản ngân hàng",
    subTitle: "",
    icon: "icon-dot",
    component: BankAccountScreen,
    key: UrlConfig.BANK_ACCOUNT,
    isShow: true,
    header: null,
    subMenu:[
      {
        path: `${UrlConfig.BANK_ACCOUNT}/create`,
        exact: true,
        title: "Thêm tài khoản ngân hàng",
        icon: "icon-dot",
        component: BankAccountCreateScreen,
        key: "create-bank-account-setting",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.BANK_ACCOUNT}/:id/edit`,
        exact: true,
        title: "Sửa tài khoản ngân hàng",
        icon: "icon-dot",
        component: BackAccountUpdateScreen,
        key: "update-bank-account-setting",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ]
  },
  {
    path: UrlConfig.SMS_SETTINGS,
    exact: true,
    title: "Cài đặt gửi tin",
    subTitle: "",
    icon: "icon-dot",
    component: SmsScreen,
    key: UrlConfig.SMS_SETTINGS,
    isShow: true,
    header: null,
    subMenu:[
      {
        path: `${UrlConfig.SMS_SETTINGS}/order-retail`,
        exact: true,
        title: "Phát sinh hóa đơn bán lẻ",
        icon: "icon-dot",
        component: SmsOrderRetail,
        key: "sms-order-retail",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.SMS_SETTINGS}/website-order`,
        exact: true,
        title: "Phát sinh hóa đơn trên Website",
        icon: "icon-dot",
        component: SmsWebsiteOrder,
        key: "sms-website-order",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ]
  }
];

export default setting;
