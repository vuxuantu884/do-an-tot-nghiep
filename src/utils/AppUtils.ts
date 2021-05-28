import { RouteMenu } from "model/other";
import { CategoryView } from "model/other/category-view";
import { CategoryResponse } from "model/response/category.response";

export const isUndefinedOrNull = (variable: any) => {
  if (variable && variable !== null) {
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
    if (path.includes(route.path)) {
      obj.current = route.key;
    }
    if (route.subMenu.length > 0) {
      route.subMenu.forEach((item) => {
        if (path.includes(item.path)) {
          obj.current = item.key
          obj.subMenu = route.key;
        }
      })
    }
  })
  return obj;
}

const checkPath = (p1: string, p2: string) => {
  if(p1.includes(":") || p2.includes(":")) {
    if(p1.includes(":")) {
      let urls1  = p1.split("/");
      let urls2  = p2.split("/");
      let index = urls1.findIndex((a) => a.includes(":"));
      urls1[index] = urls2[index];
      return urls1.join("/") === urls2.join("/")
    }
  }
  if(p2.includes(":")) {
    let urls1  = p2.split("/");
    let urls2  = p1.split("/");
    let index = urls1.findIndex((a) => a.includes(":"));
    urls1[index] = urls2[index];
    return urls1.join("/") === urls2.join("/")
  }
  return p1 === p2;
}

export const getListBreadcumb = (routes: Array<RouteMenu> = [], path: string = '') => {
  let result: Array<RouteMenu> = [];
  if (path === '' || path === '/') {
    return result;
  }
  result.push(routes[0]);
  routes.forEach((route) => {
    if (checkPath(route.path, path)) {
      result.push(route);
    } else {
      if (route.subMenu.length > 0) {
        route.subMenu.forEach((route1) => {
          if (checkPath(route1.path, path)) {
            result.push(route);
            result.push(route1);
          } else {
            if (route1.subMenu.length > 0) {
              route1.subMenu.forEach((route2) => {
                if (checkPath(route2.path, path)) {
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



export const convertCategory = (data: Array<CategoryResponse>) => {
  let arr: Array<CategoryView> = [];
  data.forEach((item) => {
    let level = 0;
    let temp = getArrCategory(item, level, null);
    arr = [...arr, ...temp];
  })
  return arr;
}

const getArrCategory = (i: CategoryResponse, level: number, parent: CategoryResponse | null) => {
  let arr: Array<CategoryView> = [];
  let parentTemp = null;
  if (parent !== null) {
    parentTemp = {
      id: parent.id,
      name: parent.name,
    }
  }
  arr.push({
    id: i.id,
    created_by: i.created_by,
    created_date: i.created_date,
    created_name: i.created_name,
    updated_by: i.updated_by,
    updated_name: i.updated_name,
    updated_date: i.updated_date,
    version: i.version,
    code: i.code,
    goods_name: i.goods_name,
    gooods: i.gooods,
    level: level,
    parent: parentTemp,
    name: i.name,
  })
  if (i.children.length > 0) {
    i.children.forEach((i1) => {
      let c = getArrCategory(i1, level + 1, i);
      arr = [...arr, ...c];
    })
  }
  return arr;
}

export const formatCurrency = (currency: number | string): string => {
  let format = currency.toString();
  return format.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

export const replaceFormat = (currency: number | string): number => {
  let format = currency.toString();
  return parseInt(format.replace(/,/gi, ''));
}
export const generateQuery = (obj: any) => {
  let a: string = Object.keys(obj).map((key, index) => {
    let url = '';
    if (obj[key]) {
      url = key + '=' + obj[key] + '&'
    }
    return url
  }).join('')
  console.log(a.charAt(a.length - 1))
  if (a.charAt(a.length - 1) === '&') {
    a = a.substring(0, a.length - 1);
  }
  return a;
}
