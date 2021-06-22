import { convertDateToUtc } from './DateUtils';
import { AccountStoreResponse } from 'model/account/account.model';
import { DistrictResponse } from 'model/content/district.model';
import { CityView } from 'model/content/district.model';
import { AppConfig } from 'config/AppConfig';
import { RouteMenu } from "model/other";
import { CategoryResponse, CategoryView } from "model/product/category.model";
import moment from 'moment';
import { SizeDetail, SizeResponse } from 'model/product/size.model';
import { ProductRequest, ProductRequestView, VariantImageRequest, VariantImagesResponse, VariantPriceRequest, VariantPricesResponse, VariantRequest, VariantRequestView } from 'model/product/product.model';

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

export const formatSuffixPoint = (point: number | string): string => {
  let format = point.toString();
  //return `${format.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")} điểm`;
  return `${format.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}`;
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

export const convertSizeResponeToDetail = (size: SizeResponse) => {
  let ids: Array<number> = []
  size.categories.forEach((category) => ids.push(category.category_id))
  let sizeConvert: SizeDetail = {
    id: size.id,
    created_by: size.created_by,
    created_date: size.created_date,
    created_name: size.created_name,
    updated_by: size.updated_by,
    updated_name: size.updated_name,
    updated_date: size.updated_date,
    version: size.version,
    code: size.code,
    category_ids: ids
  }
  return sizeConvert;
}

export const formatCurrency = (currency: number | string): string => {
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
          value = convertDateToUtc(obj[key])
        }
        if(moment.isMoment(obj[key] )) {
          value = obj[key].utc().format();
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


export const findPriceInVariant = (variantPrices: Array<VariantPricesResponse>, currency_code: string): number => {
  let price: number = 0;
  variantPrices.forEach((v) => {
    if (v.currency_code === currency_code && v.price_type === AppConfig.price_type) {
      price = v.price;
    }
  })
  return price;
}

export const findTaxInVariant = (variantPrices: Array<VariantPricesResponse>, currency_code: string): number => {
  let tax: number = 0;
  variantPrices.forEach((v) => {
    if (v.currency_code === currency_code && v.price_type === AppConfig.price_type) {
      tax = v.tax_percent;
    }
  })
  return tax;
}

export const findPrice = (variantPrices: Array<VariantPricesResponse>, currency_code: string): string => {
  let price: string = '0';
  variantPrices.forEach((v) => {
    if (v.currency_code === currency_code && v.price_type === AppConfig.price_type) {
      price = v.price.toString();
    }
  })
  return price.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

export const replaceFormat = (currency: number | string): number => {
  let format = currency.toString();
  return parseInt(format.replace(/,/gi, ''));
}

export const replaceFormatString = (currency: number | string): string => {
  let format = currency.toString();
  return format.replace(/,/gi, '');
}

export const findAvatar = (variantImages: Array<VariantImagesResponse>): string => {
  let avatar: string = '';
  variantImages.forEach((v) => {
    if (v.variant_avatar) {
      avatar = v.url;
    }
  })
  return avatar;
}

export const haveAccess = (storeId: number, accountStores: Array<AccountStoreResponse>): boolean => {
  let isHave = false;
  let accountStoreFilter = accountStores.filter((store: AccountStoreResponse) => store.store_id === storeId);
  if (accountStoreFilter.length > 0) {
    return isHave = true;
  }
  return isHave;
}



export const ListUtil = {
  notEmpty: (a: Array<any>|undefined) => {
    return a !== undefined &&  a.length >= 0
  } 
}

export const Products = {
  convertProductViewToRequest: (pr: ProductRequestView, arrVariants: Array<VariantRequestView>, status: string) => {
    let variants: Array<VariantRequest> = [];
    let variant_prices: Array<VariantPriceRequest> = [];
    pr.variant_prices.forEach((item) => {
      let retail_price = parseInt(item.retail_price);
      let import_price = parseInt(item.import_price);
      let whole_sale_price = parseInt(item.whole_sale_price);
      let tax_percent = parseInt(item.tax_percent);
      if(!isNaN(retail_price)) {
        variant_prices.push({
          price: retail_price,
          price_type: 'retail_price',
          currency_code: item.currency,
          tax_percent: tax_percent,
        })
      }
      if(!isNaN(import_price)) {
        variant_prices.push({
          price: import_price,
          price_type: 'import_price',
          currency_code: item.currency,
          tax_percent: tax_percent,
        })
      }
      if(!isNaN(whole_sale_price)) {
        variant_prices.push({
          price: whole_sale_price,
          price_type: 'whole_sale_price',
          currency_code: item.currency,
          tax_percent: tax_percent,
        })
      }
      
    })
    arrVariants.forEach((item) => {
      variants.push({
        status: status,
        name: item.name,
        color_id: item.color_id,
        size_id: item.size_id,
        barcode: null,
        taxable: false,
        saleable: pr.saleable,
        deleted: false,
        sku: item.sku,
        width: pr.width,
        height: pr.height,
        length: pr.length,
        length_unit: pr.length_unit,
        weight: pr.weight,
        weight_unit: pr.weight_unit,
        variant_prices: variant_prices,
        variant_images: [],
        inventory: 0,
      })
    })
    let productRequest: ProductRequest = {
      brand: pr.brand,
      category_id: pr.category_id,
      code: pr.code,
      content: pr.content,
      description: pr.description,
      designer_code: pr.designer_code,
      goods: pr.goods,
      made_in_id: pr.made_in_id,
      merchandiser_code: pr.merchandiser_code,
      name: pr.name,
      preservation: pr.preservation,
      specifications: pr.specifications,
      product_type: pr.product_type ? pr.product_type : '',
      status: status,
      tags: pr.tags.join(','),
      variants: variants,
      product_unit: pr.product_unit
    }
    return productRequest;
  },
  findAvatar: (images: Array<VariantImageRequest>) => {
    let image: VariantImageRequest|null = null;
    images.forEach((imagerRequest) => {
      if(imagerRequest.variant_avatar) {
        image = imagerRequest;
      }
    })
    return image;
  }
}