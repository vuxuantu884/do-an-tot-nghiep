import AuthRoute from "component/auth.route";
import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React, { useState, useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import Login from "screens/login";
import routesNotShowInMenu from "./list-routes-not-show-in-menu";
import menu from "./menu";
import extra from "./menu/extra";
import axios from "axios";
import { IP_IGNORE } from "config/app.config";
import { Modal } from "antd";
const NotFoundScreen = React.lazy(() => import("screens/notfound.screen"));

/**
 * route dạng /:id cần phải để phía sau tránh bị ghi đè
 * VD: có products/:id và products/variants
 * nếu để products/:id trước thì products/variants sẽ không được match
 */
const childRoute: Array<RouteMenu> = [];

const listMenu = () => {
  let list: Array<RouteMenu> = [];
  menu.forEach((item) => (list = [...list, ...getAllRoute(item)]));
  return list;
};

const listExtraMenu = () => {
  let list: Array<RouteMenu> = [];
  extra.forEach((item) => (list = [...list, ...getAllRoute(item)]));
  return list;
};

const listRoutesNotShowInMenu = () => {
  let list: Array<RouteMenu> = [];
  routesNotShowInMenu.forEach((item) => (list = [...list, ...getAllRoute(item)]));

  return list;
};

const getAllRoute = (route: RouteMenu) => {
  let temps: Array<RouteMenu> = [];
  if (route.subMenu.length > 0) {
    route.subMenu.forEach((subItem: RouteMenu) => {
      let menu = getAllRoute(subItem);
      temps = [...temps, ...menu];
    });
  }
  if (route.isShow) {
    if (route.path.includes(":")) {
      childRoute.push(route);
    } else {
      temps.push(route);
    }
  }
  return temps;
};

const MainRoute = () => {
  //page state
  const [visible, setVisible] = useState(false);
  const [ipIgnore, setIPIgnore] = useState("");

  const getIPAddress = async () => {
    const res = await axios.get("https://geolocation-db.com/json/");
    setIPIgnore(res.data.IPv4);
  };

  const handleOkeIpAddress = () => {
    window.location.reload();
  };

  useEffect(() => {
    //passing getData method to the lifecycle method
    getIPAddress();
  }, []);
  return (
    <>
      {IP_IGNORE.includes(ipIgnore) ? (
        Modal.info({
          title: "Thông báo",
          content: (
            <>
              Địa chỉ IP của bạn đã quá số lượt truy cập, vui lòng sử dụng địa chỉ IP mới hoặc mạng
              mới.
            </>
          ),
          onOk: handleOkeIpAddress,
          okText: "Đồng ý",
        })
      ) : (
        <Switch>
          {listRoutesNotShowInMenu().map((item: RouteMenu) => (
            <AuthRoute
              key={item.key}
              component={item.component}
              exact={item.exact}
              path={item.path}
              title={item.title}
              permissions={item.permissions}
            />
          ))}
          {listMenu().map((item: RouteMenu) => (
            <AuthRoute
              key={item.key}
              component={item.component}
              exact={item.exact}
              path={item.path}
              title={item.title}
              permissions={item.permissions}
            />
          ))}
          {listExtraMenu().map((item: RouteMenu) => (
            <AuthRoute
              key={item.key}
              component={item.component}
              exact={item.exact}
              path={item.path}
              title={item.title}
              permissions={item.permissions}
            />
          ))}
          {childRoute.map((item: RouteMenu) => (
            <AuthRoute
              key={item.key}
              component={item.component}
              exact={item.exact}
              path={item.path}
              title={item.title}
              permissions={item.permissions}
            />
          ))}
          <Route path={UrlConfig.LOGIN} exact={true} component={Login} />
          <Route component={NotFoundScreen} />
        </Switch>
      )}
    </>
  );
};

export default MainRoute;
