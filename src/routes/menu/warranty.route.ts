import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const WarrantyHistoryList = React.lazy(() => import("screens/warranty/history-list/WarrantyList"));
const CreateWarranty = React.lazy(() => import("screens/warranty/create/index"));
const ReadWarranty = React.lazy(() => import("screens/warranty/WarrantyDetail/WarrantyDetail"));
const warrantyRoute: Array<RouteMenu> = [
    {
        path: `${UrlConfig.WARRANTY}`,
        exact: true,
        title: "Lịch sử bảo hành",
        icon: "icon-dot",
        component: WarrantyHistoryList,
        key: "warranty-history-list",
        isShow: true,
        header: null,
        permissions: [],
        subMenu: [
            {
                path: `${UrlConfig.WARRANTY}/create`,
                exact: true,
                title: "Tạo phiếu bảo hành",
                icon: "icon-dot",
                component: CreateWarranty,
                key: "warranty-histoty-list",
                isShow: true,
                header: null,
                subMenu: [],
                permissions: [],

            },
            {
                path: `${UrlConfig.WARRANTY}/:id`,
                exact: true,
                title: "Xem phiếu bảo hành",
                icon: "icon-dot",
                component: ReadWarranty,
                key: "warranty-histoty-list",
                isShow: true,
                header: null,
                subMenu: [],
                permissions: [],

            }
        ],

    }

]
export default warrantyRoute;