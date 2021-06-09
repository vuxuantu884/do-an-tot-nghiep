import { convertDateToUTC } from './DateUtils';
import { DistrictResponse } from './../model/response/content/district.response';
import { CityView } from '../model/other/district-view';
import { AppConfig } from './../config/AppConfig';
import { VariantPrice, VariantImage } from '../model/other/Product/product-model';
import { RouteMenu } from "model/other";
import { CategoryView } from "model/other/Product/category-view";
import { CategoryResponse } from "model/response/category.response";
import { AccountStore } from 'model/other/Account/AccountStore';
import { OrderDiscountModel, OrderItemDiscountModel, OrderItemModel, OrderPaymentModel } from 'model/other/Order/order-model';
import { VariantImagesResponse } from 'model/response/products/variant.images.response';

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



 const checkPath = (p1: string, p2: string, pathIgnore?: Array<string>) => {
  if (p1.includes(":") || p2.includes(":")) {
    if (p1.includes(":")) {
      let urls1 = p1.split("/");
      let urls2 = p2.split("/");
      let index = urls1.findIndex((a) => a.includes(":"));
      if(pathIgnore &&  pathIgnore.includes(urls2[index])) {
        return false;
      }
      urls1[index] = urls2[index];
      return urls1.join("/") === urls2.join("/")
    }
  }
  if (p2.includes(":")) {
    let urls1 = p2.split("/");
    let urls2 = p1.split("/");
    let index = urls1.findIndex((a) => a.includes(":"));
    if(pathIgnore &&  pathIgnore.includes(urls2[index])) {
      return false;
    }
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
          if (checkPath(route1.path, path, route1.pathIgnore)) {
            result.push(route);
            result.push(route1);
          } else {
            if (route1.subMenu.length > 0) {
              route1.subMenu.forEach((route2) => {
                if (checkPath(route2.path, path, route2.pathIgnore)) {
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

export const getArrCategory = (i: CategoryResponse, level: number, parent: CategoryResponse | null) => {
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

 const formatCurrency = (currency: number | string): string => {
  let format = currency.toString();
  return format.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

export const generateQuery = (obj: any) => {
  if(obj!==undefined){
    let a: string = Object.keys(obj).map((key, index) => {
      let url = '';
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
        let value = obj[key];
        if(obj[key] instanceof Array) {
          value = obj[key].join(',')
        }
        if(obj[key] instanceof Date) {
          value = convertDateToUTC(obj[key])
          console.log(value);
        }
        url = key + '=' + encodeURIComponent(value) + '&'
      }
      return url
    }).join('')
    if (a.charAt(a.length - 1) === '&') {
      a = a.substring(0, a.length - 1);
    }
    return a;
  }
  return "";
  
}

export const convertDistrict = (data: Array<DistrictResponse>) => {
  let array: Array<CityView> = [];
  data.forEach((item) => {
    let index = array.findIndex((item1) => item1.city_id === item.city_id);
    if(index !== -1) {
      array[index].districts.push({id: item.id, name: item.name, code: item.code});
    } else {
      array.push({
        city_id: item.city_id,
        city_name: item.city_name,
        districts: [
          {
            id: item.id,
            name: item.name,
            code: item.code
          }
        ]
      })
    }
  })
  return array;
}


const findPriceInVariant = (variantPrices: Array<VariantPrice>, currency_code: string): number => {
  let price: number = 0;
  variantPrices.forEach((v) => {
    if (v.currency_code === currency_code && v.price_type === AppConfig.price_type) {
      price = v.price;
    }
  })
  return price;
}

const findTaxInVariant = (variantPrices: Array<VariantPrice>, currency_code: string): number => {
  let tax: number = 0;
  variantPrices.forEach((v) => {
    if (v.currency_code === currency_code && v.price_type === AppConfig.price_type) {
      tax = v.tax_percent;
    }
  })
  return tax;
}

const findPrice = (variantPrices: Array<VariantPrice>, currency_code: string): string => {
  let price: string = '0';
  variantPrices.forEach((v) => {
    if (v.currency_code === currency_code && v.price_type === AppConfig.price_type) {
      price = v.price.toString();
    }
  })
  return price.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}


const formatSuffixPoint = (point: number | string): string => {
  let format = point.toString();
  return `${format.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")} điểm`;
}

const replaceFormat = (currency: number | string): number => {
  let format = currency.toString();
  return parseInt(format.replace(/,/gi, ''));
}

const replaceFormatString = (currency: number | string): string => {
  let format = currency.toString();
  return format.replace(/,/gi, '');
}

const findAvatar = (variantImages: Array<VariantImagesResponse>): string => {
  let avatar: string = '';
  variantImages.forEach((v) => {
    if (v.variant_avatar) {
      avatar = v.url;
    }
  })
  return avatar;
}

const haveAccess = (storeId: number, accountStores: Array<AccountStore>): boolean => {
  let isHave = false;
  let accountStoreFilter = accountStores.filter((store: AccountStore) => store.store_id === storeId);
  if (accountStoreFilter.length > 0) {
    return isHave = true;
  }
  return isHave;
}

const getTotalQuantity = (items: Array<OrderItemModel>) => {
  let total = 0;
  items.forEach((a) => total = total + a.quantity);
  return total;
}

const getTotalAmountAfferDiscount = (items: Array<OrderItemModel>) => {
  let total = 0;
  items.forEach((a) => total = total + a.line_amount_after_line_discount);
  return total;
}

const getTotalAmount = (items: Array<OrderItemModel>) => {
  let total = 0;
  items.forEach((a) => {
    if (a.product_type === 'normal') {
      total = total + a.amount;
    }
  });
  return total;
}

const getTotalAmountFreeForm = (items: Array<OrderItemModel>) => {
  let total = 0;
  items.forEach((a) => {
    if (a.product_type === 'service') {
      total = total + a.amount;
    }
  });
  return total;
}

const getTotalDiscount = (items: Array<OrderItemModel>) => {
  let total = 0;
  items.forEach((a) => total = total + a.discount_amount);
  return total;
}

const getDiscountRate = (items: Array<OrderItemDiscountModel>) => {
  let value = 0;
  if (items.length > 0) {
    if (items[0].rate !== null) {
      value = items[0].rate;
    }
  }
  return value;
}

const getDiscountValue = (items: Array<OrderItemDiscountModel>) => {
  let value = 0;
  if (items.length > 0) {
    if (items[0].value !== null) {
      value = items[0].value;
    }
  }
  return value;
}

const getAmountDiscount = (items: Array<OrderItemDiscountModel>) => {
  let value = 0;
  if (items.length > 0) {
    if (items[0].amount !== null) {
      value = items[0].amount;
    }
  }
  return value;
}

const getAmountItemDiscount = (items: Array<OrderItemDiscountModel>) => {
  let value = 0;
  items.forEach((i) => value = value + (i.amount ? i.amount : 0));
  return value;
}

const findDiscountIndex = (items: Array<OrderDiscountModel>) => {
  let index = items.findIndex((value) => value.promotion_id == null);
  return index;
}

const findDiscountPromotion = (items: Array<OrderDiscountModel>) => {
  let index = items.findIndex((value) => value.promotion_id != null);
  return index;
}

const caculatorTotalDiscount = (items: Array<OrderDiscountModel>) => {
  let total = 0;
  items.forEach((value) => total = total + value.amount);
  return total;
}

const findOrderDiscount = (items: Array<OrderDiscountModel>) => {
  let index = findDiscountIndex(items);
  if (index === -1) {
    return 0;
  }
  return items[index].amount;
}

const caculateMoney = (items: Array<OrderPaymentModel>, totalMoney: number) => {
  let total = 0;
  items.forEach((i) => total = total + i.amount);
  return totalMoney - total;
}

const isPaymentCashOnly = (items: Array<OrderPaymentModel>) => {
  return items.length === 1 && items[0].payment_method_id === AppConfig.DEFAULT_PAYMENT;
}
export {
  findPrice, findAvatar, findPriceInVariant, haveAccess, findTaxInVariant, formatCurrency,
  replaceFormat, replaceFormatString, getTotalQuantity, getTotalAmount, getTotalDiscount, getTotalAmountAfferDiscount, getDiscountRate, getDiscountValue,
  getAmountDiscount, getAmountItemDiscount, findDiscountIndex, findDiscountPromotion, caculatorTotalDiscount, findOrderDiscount, getTotalAmountFreeForm,
  formatSuffixPoint,caculateMoney, isPaymentCashOnly
};
