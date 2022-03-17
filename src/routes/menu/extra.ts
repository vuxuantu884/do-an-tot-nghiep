import { RouteMenu } from "model/other"
import React from "react";

const CustomerCreate = React.lazy(
  () => import("screens/customer/customer-create/CustomerCreate")
);
const CustomerUpdate = React.lazy(
  () => import("screens/customer/customer-update/CustomerUpdate")
);
const CustomerDetail = React.lazy(
  () => import("screens/customer/customer-detail/CustomerDetail")
);
const extra: Array<RouteMenu> = [
    {
        path: "/customers/create",
        exact: true,
        title: "Thêm khách hàng",
        icon: 'icon-customer',
        component: CustomerCreate,
        key: "10",
        isShow: true,
        header: null,
        subMenu: [],
    },
    {
        path: "/customers/:id/update",
        exact: true,
        title: "Sửa thông tin khách hàng",
        icon: 'icon-customer',
        component: CustomerUpdate,
        key: "11",
        isShow: true,
        header: null,
        subMenu: [],
    },
    {
        path: "/customers/:id",
        exact: true,
        title: "Chi tiết khách hàng",
        icon: 'icon-customer',
        component: CustomerDetail,
        key: "12",
        isShow: true,
        header: null,
        subMenu: [],
    },
]

export default extra;

