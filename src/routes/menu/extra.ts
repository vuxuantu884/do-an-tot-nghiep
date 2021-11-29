import { RouteMenu } from "model/other"
import CustomerCreate from "screens/customer/customer-create/CustomerCreate"
import CustomerUpdate from "screens/customer/customer-update/CustomerUpdate";
import CustomerDetail from "screens/customer/customer-detail/CustomerDetail"

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

