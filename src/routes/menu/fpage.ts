import { HEADER_TYPE } from "config/HeaderConfig";
import UrlConfig from "config/UrlConfig";
import { RouteMenu } from "model/other";
import React from "react";

const fpage_customer = React.lazy(() => import ("screens/fpage/customer/index.screen"))

const fpage: Array<RouteMenu> = [
  {
    path: `${UrlConfig.FPAGE}`,
    exact: true,
    title: "Danh sách khách hàng",
    icon: 'icon-dot',
    component: fpage_customer,
    key: "submenuok",
    isShow: true,
    header: null,
    subMenu: [],
    type: HEADER_TYPE.STEP,
    object: null,
  }
]

export default fpage;