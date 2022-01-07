import AuthRoute from "component/auth.route";
import UrlConfig from "config/url.config";
import { RouteMenu } from "model/other";
import React from "react";
import { Route, Switch } from "react-router-dom";
import Login from "screens/login";
import menu from "./menu";
import extra from "./menu/extra";
import routesNotShowInMenu from "./list-routes-not-show-in-menu";

const  NotFoundScreen = React.lazy(() => import ('screens/notfound.screen'));
/**
 * route dạng /:id cần phải để phía sau tránh bị ghi đè
 * VD: có products/:id và products/variants 
 * nếu để products/:id trước thì products/variants sẽ không được match 
 */
const childRoute : Array<RouteMenu> = []; 

const listMenu = () => {
  let list: Array<RouteMenu> = [];
  menu.forEach((item) => list = [...list, ...getAllRoute(item)]);
  console.log("RouteMenu",list)
  return list;
}

const listExtraMenu = () => {
  let list: Array<RouteMenu> = [];
  extra.forEach((item) => list = [...list, ...getAllRoute(item)]);
  return list;
}

const listRoutesNotShowInMenu = () => {
  let list: Array<RouteMenu> = [];
  routesNotShowInMenu.forEach((item) => list = [...list, ...getAllRoute(item)]);

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
  if (route.isShow) {
    if (route.path.includes(":")) {
      childRoute.push(route);
    } else {
      temps.push(route);
    }
  }  
  return temps;
}

const MainRoute = () => {
  return (
    <Switch>
      {
        listRoutesNotShowInMenu().map((item: RouteMenu) => (
          <AuthRoute key={item.key} component={item.component} exact={item.exact} path={item.path} title={item.title} permissions={item.permissions}/>
        ))
      }
      {
        listMenu().map((item: RouteMenu) => (
          <AuthRoute key={item.key} component={item.component} exact={item.exact} path={item.path} title={item.title} permissions={item.permissions}/>
        ))
      }
      {
        listExtraMenu().map((item: RouteMenu) => (
          <AuthRoute key={item.key} component={item.component} exact={item.exact} path={item.path} title={item.title}  permissions={item.permissions}/>
        ))
      }
      {
        childRoute.map((item: RouteMenu) => (
          <AuthRoute key={item.key} component={item.component} exact={item.exact} path={item.path} title={item.title}  permissions={item.permissions}/>
        ))
      }
      <Route path={UrlConfig.LOGIN} exact={true} component={Login} />
      <Route component={NotFoundScreen} />
    </Switch>
  )
}

export default MainRoute;