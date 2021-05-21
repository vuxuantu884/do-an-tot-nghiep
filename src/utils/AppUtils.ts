import { RouteMenu } from "model/other";

export const isUndefinedOrNull = (variable: any) => {
  if(variable && variable !== null) {
    return false;
  }
  return true;
}

export const findCurrentRoute = (routes: Array<RouteMenu> = [], path: string = '') => {
  let obj = {
    current: '',
    subMenu: '',
  };
  routes.forEach((route) => {
    if(path.includes(route.path)) {
      obj.current = route.key;
    }
    if(route.subMenu.length > 0) {
      route.subMenu.forEach((item) => {
        if(path.includes(item.path)) {
          obj.current = item.key
          obj.subMenu = route.key;
        }
      })
    }
  })
  return obj;
}

export const getListBreadcumb = (routes: Array<RouteMenu> = [], path: string = '') => {
  let result: Array<RouteMenu> = [];
  if(path === '' || path === '/') {
    return result;
  }
  result.push(routes[0]);
  routes.forEach((route) => {
    if(route.path === path) {
      result.push(route);
    } else {
      if(route.subMenu.length>0 ) {
        route.subMenu.forEach((route1) => {
          if(route1.path === path) {
            result.push(route);
            result.push(route1);
          } else {
            if(route1.subMenu.length > 0) {
              route1.subMenu.forEach((route2) => {
                if(route2.path === path) {
                  result.push(route);
                  result.push(route1);
                  result.push(route2);
                }
              })
            } 
          }
        })
      }
    }
  })
  return result;
}

