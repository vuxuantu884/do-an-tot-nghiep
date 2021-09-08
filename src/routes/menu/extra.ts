import { RouteMenu } from "model/other"
import CustomerAdd from "screens/customer/customer.create"
import CustomerEdit from "screens/customer/customer.update";
import CustomerDetail from "screens/customer/customer-detail"

const extra: Array<RouteMenu> = [
    {
        path: "/customers/create",
        exact: true,
        title: "Thêm khách hàng",
        icon: 'icon-customer',
        component: CustomerAdd,
        key: "10",
        isShow: true,
        header: null,
        subMenu: [],
    },
    {
        path: "/customers/:id/edit",
        exact: true,
        title: "Sửa thông tin khách hàng",
        icon: 'icon-customer',
        component: CustomerEdit,
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
        key: "11",
        isShow: true,
        header: null,
        subMenu: [],
    },
]

export default extra;

