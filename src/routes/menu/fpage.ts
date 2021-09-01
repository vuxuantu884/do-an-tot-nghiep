import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";

const fpage_customer = React.lazy(() => import ("screens/fpage/fpage-customer/create.customer"))

const fpage: Array<RouteMenu> = [
  {
    path: UrlConfig.FPAGE,
    exact: true,
    title: "Danh sách sản phẩm",
    icon: "icon-dot",
    component: fpage_customer,
    key: "submenu100",
    isShow: true,
    header: null,
    subMenu: [],
  }
]

export default fpage;