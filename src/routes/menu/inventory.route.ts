import { RouteMenu } from "../../model/other";
import UrlConfig from "../../config/url.config";
import React from "react";
const ListTicket = React.lazy(() => import("screens/inventory/ListTicket"));
const DetailTicket = React.lazy(() => import("screens/inventory/DetailTicket/index"));
const UpdateTicket = React.lazy(() => import("screens/inventory/UpdateTicket"));
const CreateTicket = React.lazy(
  () => import("screens/inventory/CreateTicket/index")
);
export const inventory: Array<RouteMenu> = [
  {
    path: UrlConfig.INVENTORY_TRANSFER,
    exact: true,
    title: "Chuyển hàng",
    icon: "icon-dot",
    component: ListTicket,
    key: "submenu31",
    isShow: true,
    header: null,
    subMenu: [
      {
        path: `${UrlConfig.INVENTORY_TRANSFER}/create`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: CreateTicket,
        key: "submenu31",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFER}/:id`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: DetailTicket,
        key: "submenu31",
        isShow: true,
        header: null,
        subMenu: [],
      },
      {
        path: `${UrlConfig.INVENTORY_TRANSFER}/:id/update`,
        exact: true,
        title: "Chuyển hàng",
        icon: "icon-dot",
        component: UpdateTicket,
        key: "submenu31",
        isShow: true,
        header: null,
        subMenu: [],
      },
    ],
  },
];
