import { RouteMenu } from "model/other"
import CustomerAdd from "screens/customer/add"
import CustomerEdit from "screens/customer/edit";
import CustomerDetail from "screens/customer/customer.detail"

const extra: Array<RouteMenu> = [
    {
        path: "/customer/create",
        exact: true,
        title: "Thêm khách hàng",
        icon: 'icon-customer',
        component: CustomerAdd,
        key: "10",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
    },
    {
        path: "/customer/edit/:id",
        exact: true,
        title: "Sửa thông tin khách hàng",
        icon: 'icon-customer',
        component: CustomerEdit,
        key: "11",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
    },
    {
        path: "/customer/detail/:id",
        exact: true,
        title: "Chi tiết khách hàng",
        icon: 'icon-customer',
        component: CustomerDetail,
        key: "11",
        isShow: true,
        header: null,
        subMenu: [],
        type: 0,
        object: null,
    },
]

export default extra;

