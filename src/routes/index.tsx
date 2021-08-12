import AuthRoute from "component/auth.route";
import UrlConfig from "config/UrlConfig";
import { RouteMenu } from "model/other";
import React from "react";
import { Route, Switch } from "react-router-dom";
import Login from "screens/login";
import menu from "./menu";
import extra from "./menu/extra";

const  NotFoundScreen = React.lazy(() => import ('screens/notfound.screen'));

const listMenu = () => {
  let list: Array<RouteMenu> = [];
  menu.forEach((item) => list = [...list, ...getAllRoute(item)]);
  return list;
}

const listExtraMenu = () => {
  let list: Array<RouteMenu> = [];
  extra.forEach((item) => list = [...list, ...getAllRoute(item)]);
  return list;
}

const getAllRoute = (route: RouteMenu) => {
  let temps: Array<RouteMenu> = [];
  if(route.subMenu.length > 0) {
    route.subMenu.forEach((subItem: RouteMenu) => {
      let menu = getAllRoute(subItem)
      temps = [...temps, ...menu]
    })
  }
  if(route.isShow) {
    temps.push(route);
  }
  return temps;
}

const MainRoute = () => {
  return (
    <Switch>
      {
        listMenu().map((item: RouteMenu) => (
          <AuthRoute type={item.type} object={item.object} key={item.key} component={item.component} exact={item.exact} path={item.path} title={item.title} />
        ))
      }
      {
        listExtraMenu().map((item: RouteMenu) => (
          <AuthRoute type={item.type} object={item.object} key={item.key} component={item.component} exact={item.exact} path={item.path} title={item.title} />
        ))
      }
      <Route path={UrlConfig.LOGIN} exact={true} component={Login} />
      <Route component={NotFoundScreen} />
    </Switch>
  )
}

export default MainRoute;