import { FormInstance } from "antd/es/form/Form";
import BaseResponse from "base/base.response";
import currencyFormatter from "currency.js";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import _, { cloneDeep, round, sortBy } from "lodash";
import { AccountStoreResponse } from "model/account/account.model";
import { DepartmentResponse, DepartmentView } from "model/account/department.model";
import { BaseMetadata } from "model/base/base-metadata.response";
import { CityView, DistrictResponse } from "model/content/district.model";
import { LineItem } from "model/inventory/transfer";
import { OrderModel } from "model/order/order.model";
import { RouteMenu } from "model/other";
import { VariantImage, VariantPricesResponse } from "model/product/product.model";
import { SizeDetail, SizeResponse } from "model/product/size.model";
import {
  OrderDiscountRequest,
  OrderLineItemRequest,
  OrderPaymentRequest,
} from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import {
  CustomerOrderHistoryResponse,
  FulFillmentResponse,
  OrderDiscountResponse,
  // DeliveryServiceResponse,
  OrderLineItemResponse,
  OrderPaymentResponse,
  OrderResponse,
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { SourceResponse } from "model/response/order/source.response";
import { ShippingServiceConfigDetailResponseModel } from "model/response/settings/order-settings.response";
import moment, { Moment } from "moment";
import { getSourcesWithParamsService } from "service/order/order.service";
import { BaseFilterTag } from "../model/base/base-filter-tag";
import {
  LAZADA,
  OrderStatus,
  PaymentMethodCode,
  POS,
  PRODUCT_TYPE,
  SENDO,
  ShipmentMethod,
  SHIPPING_TYPE,
  SHOPEE,
  TIKI,
} from "./Constants";
import { ConvertDateToUtc } from "./DateUtils";
import { ORDER_SUB_STATUS } from "./Order.constants";
import { ORDER_SETTINGS_STATUS } from "./OrderSettings.constants";
import {
  checkIfExpiredOrCancelledPayment,
  checkIfFinishedPayment,
  checkIfFulfillmentCancelled,
} from "./OrderUtils";
import { RegUtil } from "./RegUtils";
import { showError, showSuccess } from "./ToastUtils";
import { AppConfig } from "config/app.config";
import { sortFulfillments } from "./fulfillmentUtils";

export const isUndefinedOrNull = (variable: any) => {
  if (variable && variable !== null) {
    return false;
  }
  return true;
};

export const getPath = (object: any, search: string): any => {
  if (object?.path === search) return [object.key];
  else if (object.subMenu || Array.isArray(object)) {
    let subMenu = Array.isArray(object) ? object : object.subMenu;
    for (let child of subMenu) {
      let result = getPath(child, search);
      if (result) {
        if (object.path) result.unshift(object.key);
        return result;
      }
    }
  }
};

const checkPath = (p1: string, p2: string, pathIgnore?: Array<string>) => {
  if (p1.includes(":") || p2.includes(":")) {
    if (p1.includes(":")) {
      let urls1 = p1.split("/");
      let urls2 = p2.split("/");
      let index = urls1.findIndex((a) => a.includes(":"));
      if (pathIgnore && pathIgnore.includes(urls2[index])) {
        return false;
      }
      urls1[index] = urls2[index];
      return urls1.join("/") === urls2.join("/");
    }
  }
  if (p2.includes(":")) {
    let urls1 = p2.split("/");
    let urls2 = p1.split("/");
    let index = urls1.findIndex((a) => a.includes(":"));
    if (pathIgnore && pathIgnore.includes(urls2[index])) {
      return false;
    }
    urls1[index] = urls2[index];
    return urls1.join("/") === urls2.join("/");
  }
  return p1 === p2;
};

export const formatSuffixPoint = (point: number | string): string => {
  let format = point.toString();
  //return `${format.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")} điểm`;
  return `${format.replace(RegUtil.SUFIX_POINT, "$1,")}`;
};

export const getListBreadcumb = (routes: Array<RouteMenu> = [], path: string = "") => {
  let result: Array<RouteMenu> = [];
  if (path === "" || path === "/") {
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
              });
            }
          }
        });
      }
    }
  });
  return result;
};

export const convertDepartment = (data: Array<DepartmentResponse>) => {
  let arr: Array<DepartmentView> = [];
  data.forEach((item) => {
    let level = 0;
    let temp = getArrDepartment(item, level, null);
    arr = [...arr, ...temp];
  });
  return arr;
};

export const getArrDepartment = (
  i: DepartmentResponse,
  level: number,
  parent: DepartmentResponse | null,
) => {
  let arr: Array<DepartmentView> = [];
  let parentTemp = null;
  if (parent !== null) {
    parentTemp = {
      id: parent.id,
      name: parent.name,
    };
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
    address: i.address,
    manager: i.manager,
    parent_name: i.parent_name,
    manager_code: i.manager_code,
    phone: i.phone,
    level: level,
    parent: parentTemp,
    name: i.name,
    isHaveChild: i.children.length > 0,
  });
  if (i.children.length > 0) {
    i.children.forEach((i1) => {
      let c = getArrDepartment(i1, level + 1, i);
      arr = [...arr, ...c];
    });
  }
  return arr;
};

export const convertSizeResponeToDetail = (size: SizeResponse) => {
  let ids: Array<number> = [];
  size.categories.forEach((category) => ids.push(category.category_id));
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
  };
  return sizeConvert;
};

export const formatCurrency = (currency: number | string | boolean, sep: string = "."): string => {
  try {
    if (typeof currency === "number") {
      currency = Math.round(currency);
    } else if (typeof currency === "string") {
      currency = Math.round(Number(currency));
    }
    let format = currency.toLocaleString();
    return format;
  } catch (e) {
    return "";
  }
};

export const formatCurrencyNotDefaultValue = (
  currency: number | string | boolean,
  sep: string = ".",
): string => {
  try {
    if (typeof currency === "number") {
      currency = Math.round(currency);
    } else if (typeof currency === "string" && currency) {
      currency = Math.round(Number(currency));
    }
    let format = currency.toLocaleString();
    return format;
  } catch (e) {
    return "";
  }
};

export const formatNumber = (value: number | string | boolean): string => {
  try {
    let format = Number(value).toLocaleString();
    return format;
  } catch (e) {
    return "";
  }
};

export const formatPercentage = (percentage: number | string | boolean): string => {
  try {
    if (typeof percentage === "number") {
      percentage = Math.round(percentage * 100) / 100;
    } else if (typeof percentage === "string") {
      percentage = Math.round(Number(percentage) * 100) / 100;
    }
    let format = percentage.toLocaleString();
    return format;
  } catch (e) {
    return "";
  }
};

/**
 * supported currencies and their decimal place.
 *
 * Refer to https://en.wikipedia.org/wiki/ISO_4217
 */
export const supportedCurrencies = {
  USD: 2,
  THB: 2,
  VND: 0,
  EUR: 2,
  RMB: 2,
  TWD: 2,
  HKD: 2,
};

export type SupportedCurrencyType = keyof typeof supportedCurrencies;

/**
 *
 * @param amount amount of money
 * @param separator default to "."
 * @param currencyCode "USD" | "VND" ...
 * @param decimal floating point is , or .
 * @returns E.g: 123 VND, 123.45 USD
 */
export const formatCurrencyValue = (
  amount: number,
  separator: string = ".",
  decimal: string = ",",
  currencyCode: SupportedCurrencyType = "VND",
): string => {
  if (typeof amount !== "number") {
    return "";
  }

  return (
    currencyFormatter(amount, {
      symbol: "",
      separator,
      decimal,
      precision: supportedCurrencies[currencyCode],
    }).format() +
    " " +
    currencyCode
  );
};

export const generateQuery = (obj: any) => {
  if (obj !== undefined) {
    let a: string = Object.keys(obj)
      .map((key, index) => {
        let url = "";
        if (
          obj[key] !== undefined &&
          obj[key] !== null &&
          obj[key] !== "" &&
          obj[key].length !== 0
        ) {
          let value = obj[key];
          if (obj[key] instanceof Array) {
            value = obj[key].join(",");
          }
          if (obj[key] instanceof Date) {
            value = ConvertDateToUtc(obj[key]);
          }
          if (moment.isMoment(obj[key])) {
            value = obj[key].utc().format();
          }
          url = key + "=" + encodeURIComponent(value) + "&";
        }
        return url;
      })
      .join("");
    if (a.charAt(a.length - 1) === "&") {
      a = a.substring(0, a.length - 1);
    }
    return a;
  }
  return "";
};

export const convertDistrict = (data: Array<DistrictResponse>) => {
  let array: Array<CityView> = [];
  data.forEach((item) => {
    let index = array.findIndex((item1) => item1.city_id === item.city_id);
    if (index !== -1) {
      array[index].districts.push({
        id: item.id,
        name: item.name,
        code: item.code,
      });
    } else {
      array.push({
        city_id: item.city_id,
        city_name: item.city_name,
        districts: [
          {
            id: item.id,
            name: item.name,
            code: item.code,
          },
        ],
      });
    }
  });
  return array;
};

export const findPriceInVariant = (
  variantPrices: Array<VariantPricesResponse>,
  currency_code: string,
): number => {
  let price: number = 0;
  variantPrices.forEach((v) => {
    if (v.currency_code === currency_code) {
      price = v.retail_price;
    }
  });
  return price;
};

export const findTaxInVariant = (
  variantPrices: Array<VariantPricesResponse>,
  currency_code: string,
): number => {
  let tax: number | null = 0;
  variantPrices.forEach((v) => {
    if (v.currency_code === currency_code) {
      tax = v.tax_percent;
    }
  });
  return tax;
};

export const findPrice = (
  variantPrices: Array<VariantPricesResponse>,
  currency_code: string,
): string => {
  let price: string = "0";
  variantPrices.forEach((v) => {
    if (v.currency_code === currency_code) {
      price = v.retail_price.toString();
    }
  });
  return formatCurrency(price);
};

export const replaceFormat = (currency: number | string): number => {
  let format = currency.toString();
  return parseInt(format.replace(/\.|,/gi, ""));
};

export const replaceFormatString = (currency: number | string): string => {
  let format = currency.toString();
  return format.replace(/\.|,/gi, "");
};

export const findAvatar = (VariantImage: Array<VariantImage>): string => {
  let avatar: string = "";

  VariantImage?.length > 0 &&
    VariantImage.forEach((v) => {
      if (v.variant_avatar) {
        avatar = v.url;
      }
    });
  return avatar;
};

export const findVariantAvatar = (variantImageArr: Array<VariantImage>): string => {
  let result = "";
  const defaultVariantImage = variantImageArr.find((single) => single.variant_avatar && single.url);
  if (defaultVariantImage) {
    result = defaultVariantImage.url;
  }
  return result;
};

export const haveAccess = (
  storeId: number,
  accountStores: Array<AccountStoreResponse>,
): boolean => {
  let isHave = false;
  let accountStoreFilter = accountStores.filter(
    (store: AccountStoreResponse) => store.store_id === storeId,
  );
  if (accountStoreFilter.length > 0) {
    return (isHave = true);
  }
  return isHave;
};

export const ListUtil = {
  notEmpty: (a: Array<any> | undefined) => {
    return a !== undefined && a.length >= 0;
  },
};

export const isNormalTypeVariantItem = (lineItem: OrderLineItemResponse) => {
  const type = [PRODUCT_TYPE.normal, PRODUCT_TYPE.combo];
  return type.includes(lineItem.type);
};

export const getAmountPayment = (
  items: Array<OrderPaymentResponse | OrderPaymentRequest> | null | undefined,
) => {
  let value = 0;
  if (items && items.length > 0) {
    items.forEach((a) => {
      if (!checkIfExpiredOrCancelledPayment(a)) {
        value = value + a.paid_amount;
      }
    });
  }
  return value;
};

export const getAmountPaymentRequest = (items: Array<OrderPaymentRequest> | null) => {
  let value = 0;
  if (items && items.length > 0) {
    items.forEach((a) => {
      value = value + a.paid_amount;
    });
  }
  return value;
};

export const getTotalAmount = (items: Array<OrderLineItemRequest>) => {
  let total = 0;
  items.forEach((a) => {
    if (a.product_type === "normal" || "combo") {
      total = total + a.amount;
    }
  });
  return total;
};

export const getLineItemDiscountValue = (lineItem: OrderLineItemRequest) => {
  let total = 0;
  lineItem.discount_items.forEach((a) => (total = total + a.value));
  return total;
};

export const getLineItemDiscountAmount = (lineItem: OrderLineItemRequest) => {
  let total = 0;
  lineItem.discount_items.forEach((a) => (total = total + a.amount));
  return total;
};

export const getLineItemDiscountRate = (lineItem: OrderLineItemRequest) => {
  return (lineItem.discount_value * 100) / lineItem.price;
};

export const getTotalDiscount = (items: Array<OrderLineItemRequest>) => {
  let total = 0;
  items.forEach((a) => (total = total + a.discount_amount));
  return total;
};

export const getTotalAmountAfterDiscount = (items: Array<OrderLineItemRequest>) => {
  // let total = 0;
  // items.forEach((a) => (total = total + a.line_amount_after_line_discount));
  // return total;

  console.log("getTotalAmountAfterDiscount", items);
  return items
    .map((item) => item.line_amount_after_line_discount)
    .reduce((prev, next) => prev + next);
};

export const getOrderTotalPaymentAmount = (payments: Array<OrderPaymentResponse>) => {
  let total = 0;
  payments.forEach((a) => {
    if (checkIfFinishedPayment(a)) {
      total = total + a.amount;
    }
  });
  return total;
};

export const getOrderTotalPaymentAmountReturn = (payments: Array<OrderPaymentResponse>) => {
  let total = 0;
  payments.forEach((a) => {
    if (checkIfFinishedPayment(a)) {
      total = total + a.paid_amount;
    }
  });
  return total;
};

export const getLineAmountAfterLineDiscount = (lineItem: OrderLineItemRequest) => {
  return lineItem.amount - lineItem.discount_amount;
};

export const getTotalQuantity = (items: Array<OrderLineItemResponse>) => {
  let total = 0;
  items.forEach((a) => {
    if (isNormalTypeVariantItem(a)) {
      total = total + a.quantity;
    }
  });
  return total;
};

export const checkPaymentStatusToShow = (items: OrderResponse) => {
  //tính tổng đã thanh toán
  let value = 0;
  if (items && items?.payments && items.payments.length) {
    items.payments.forEach((a) => {
      if (checkIfFinishedPayment(a)) {
        value = value + a.paid_amount;
      }
    });
  }
  if (items?.total <= value) {
    return 1; //đã thanh toán
  } else {
    if (value === 0) {
      return -1; //chưa thanh toán
    } else {
      return 0; //thanh toán 1 phần
    }
  }
};

export const checkPaymentStatus = (payments: any, orderAmount: number) => {
  let value = 0;
  if (payments && payments.length > 0) {
    payments.forEach((a: any) => {
      if (checkIfFinishedPayment(a)) {
        value = value + a.paid_amount;
      }
    });
  }
  if (value >= orderAmount) {
    return 1; //đã thanh toán
  } else {
    if (value === 0) {
      return -1; //chưa thanh toán
    } else {
      return 0; //thanh toán 1 phần
    }
  }
};

export const SumCOD = (items: OrderResponse) => {
  let cod = 0;
  if (items !== null) {
    if (items.fulfillments) {
      if (items.fulfillments.length > 0) {
        items.fulfillments.forEach((a) => {
          if (a.shipment !== undefined && a.shipment !== null) {
            cod = cod + a.shipment?.cod;
          }
        });
      }
    }
  }

  return cod;
};

//COD + tổng đã thanh toán
export const checkPaymentAll = (items: OrderResponse) => {
  //tính tổng đã thanh toán
  let value = 0;
  if (items?.payments && items.payments.length > 0) {
    items.payments.forEach((a) => {
      if (checkIfFinishedPayment(a)) {
        value = value + a.paid_amount;
      }
    });
  }

  //tổng cod
  let cod = SumCOD(items);

  let totalPay = value + cod;
  if (items?.total === totalPay) {
    return 1;
  } else {
    return 0;
  }
};

// export const getDateLastPayment = (items: OrderResponse) => {
//   let value: Date | undefined;
//   if (items !== null) {
//     if (items.payments !== null) {
//       if (items.payments.length > 0) {
//         items.payments.forEach((a) => (value = a.created_date));
//       }
//     }
//   }
//   return value;
// };

export const getDateLastPayment = (items: any) => {
  let value: Date | undefined;
  if (items !== null) {
    if (items.length > 0) {
      items.forEach((a: any) => (value = a.created_date));
    }
  }
  return value;
};

//Lấy ra địa chỉ giao hàng mắc định
export const getShippingAddressDefault = (items: CustomerResponse | null) => {
  let objShippingAddress = null;
  if (items !== null) {
    for (let i = 0; i < items.shipping_addresses?.length; i++) {
      if (items.shipping_addresses[i].default) {
        objShippingAddress = items.shipping_addresses[i];
      }
    }
  }
  return objShippingAddress;
};

export const SumWeight = (items?: Array<OrderLineItemRequest>) => {
  let totalWeight = 0;
  if (items) {
    for (let i = 0; i < items.length; i++) {
      switch (items[i].weight_unit) {
        case "g":
          totalWeight = totalWeight + items[i].weight * items[i].quantity;
          break;
        case "kg":
          totalWeight = totalWeight + items[i].weight * 1000 * items[i].quantity;
          break;
        default:
          break;
      }
    }
  }

  return totalWeight;
};

export const SumWeightLineItems = (items?: Array<LineItem>) => {
  let totalWeight = 0;
  if (items) {
    for (let i = 0; i < items.length; i++) {
      switch (items[i].weight_unit) {
        case "g":
          totalWeight = totalWeight + items[i].weight * items[i].transfer_quantity;
          break;
        case "kg":
          totalWeight = totalWeight + items[i].weight * 1000 * items[i].transfer_quantity;
          break;
        default:
          break;
      }
    }
  }

  return totalWeight;
};

export const SumWeightInventory = (items?: Array<LineItem>) => {
  let totalWeight = 0;
  if (items) {
    for (let i = 0; i < items.length; i++) {
      switch (items[i].weight_unit) {
        case "g":
          totalWeight = totalWeight + items[i].weight * items[i].transfer_quantity;
          break;
        case "kg":
          totalWeight = totalWeight + items[i].weight * 1000 * items[i].transfer_quantity;
          break;
        default:
          break;
      }
    }
  }

  return totalWeight;
};

export const SumWeightResponse = (items?: Array<OrderLineItemResponse>) => {
  let totalWeight = 0;
  if (items) {
    for (let i = 0; i < items.length; i++) {
      switch (items[i].weight_unit) {
        case "g":
          totalWeight = totalWeight + items[i].weight * items[i].quantity;
          break;
        case "kg":
          totalWeight = totalWeight + items[i].weight * 1000 * items[i].quantity;
          break;
        default:
          break;
      }
    }
  }

  return totalWeight;
};

export const InfoServiceDeliveryDetail = (items: Array<any> | null, delivery_id: number | null) => {
  if (items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === delivery_id) {
        return items[i].logo;
      }
    }
  }
};

export const CheckShipmentType = (item: OrderResponse) => {
  if (item) {
    if (item.fulfillments) {
      if (item.fulfillments.length > 0) {
        return item.fulfillments[0].shipment?.delivery_service_provider_type;
      }
    }
  }
};

export const TrackingCode = (item: OrderResponse | OrderModel | null) => {
  if (item) {
    if (item.fulfillments) {
      if (item.fulfillments.length > 0) {
        // if (item.fulfillments[0].shipment?.pushing_status === "waiting") {
        //   return ErrorGHTK.WAITTING;
        // } else {
        // }
        return item.fulfillments[0].shipment?.tracking_code;
      }
    }
  }
};

export const getServiceName = (item: OrderResponse) => {
  if (item) {
    if (item.fulfillments) {
      if (item.fulfillments.length > 0) {
        if (item.fulfillments[0].shipment?.delivery_service_provider_type === "external_service") {
          if (item.fulfillments[0].shipment?.delivery_service_provider_id === 1) {
            if (item.fulfillments[0].shipment?.service === "standard") {
              return "Đường bộ";
            } else {
              return "Đường bay";
            }
          } else {
            return "Chuyển phát nhanh PDE";
          }
        }
      }
    }
  }
};

export const scrollAndFocusToDomElement = (
  element?: HTMLElement | null,
  offsetY: number = -250,
) => {
  if (!element) {
    return;
  }
  element.focus();
  const y = element.getBoundingClientRect()?.top + window.pageYOffset + offsetY;
  window.scrollTo({ top: y, behavior: "smooth" });
};

// lấy danh sách sản phẩm đã đổi
export const getListReturnedOrders = (OrderDetail: OrderResponse | null) => {
  if (!OrderDetail) {
    return [];
  }
  if (!OrderDetail?.order_returns || OrderDetail?.order_returns?.length === 0) {
    return [];
  }
  let orderReturnItems: OrderLineItemResponse[] = [];

  for (const singleReturn of OrderDetail.order_returns) {
    //xử lý trường hợp 1 sản phẩm có số lượng nhiều đổi trả nhiều lần
    for (const singleReturnItem of singleReturn.items) {
      let index = orderReturnItems.findIndex(
        (item) =>
          item.variant_id === singleReturnItem.variant_id &&
          item.type === singleReturnItem.type &&
          (item.order_line_item_id
            ? item.order_line_item_id === singleReturnItem.order_line_item_id
            : true),
      );

      if (index > -1) {
        let duplicatedItem = { ...orderReturnItems[index] };
        duplicatedItem.quantity = duplicatedItem.quantity + singleReturnItem.quantity;
        orderReturnItems[index] = duplicatedItem;
      } else {
        orderReturnItems.push(singleReturnItem);
      }
    }
  }
  // console.log('orderReturnItems', orderReturnItems)
  return orderReturnItems;
};

export const reCalculateOrderItem = (orderLineItems: OrderLineItemResponse[]) => {
  // console.log('orderLineItems', orderLineItems)
  return orderLineItems.map((item) => {
    return {
      ...item,
      discount_items: item.discount_items.map((discount) => {
        return {
          ...discount,
          value: item.quantity
            ? mathRoundAmount(discount.amount / item.quantity)
            : mathRoundAmount(discount.value),
        };
      }),
    };
  });
};

/**
 * tính lại discount và quantity theo quantity mới
 */
export const reCalculateDiscountReturnByOrigin = (
  itemResult: OrderLineItemResponse,
  itemOrigin: OrderLineItemResponse,
  quantity: number,
) => {
  if (!quantity) {
    return;
  }
  itemResult.quantity = quantity;
  itemResult.discount_items = itemOrigin.discount_items.map((single) => {
    return {
      ...single,
      amount: itemOrigin?.quantity
        ? (single.amount / itemOrigin?.quantity) * quantity
        : single.amount,
    };
  });
  itemResult.discount_amount = itemOrigin?.quantity
    ? (itemOrigin.discount_amount / itemOrigin?.quantity) * quantity
    : itemOrigin.discount_amount;
};

// lấy danh sách còn có thể đổi trả
export const getListItemsCanReturn = (OrderDetail: OrderResponse | null) => {
  if (!OrderDetail) {
    return [];
  }
  const OrderDetailClone = cloneDeep(OrderDetail);
  let result: OrderLineItemResponse[] = [];
  let listReturned = getListReturnedOrders(OrderDetailClone);
  let orderReturnItems = [...listReturned];
  let _orderReturnItems = orderReturnItems.filter((single) => single.quantity > 0);
  let newReturnItems = cloneDeep(_orderReturnItems);
  // let normalItems = _.cloneDeep(OrderDetail.items).filter(item=>item.type !==Type.SERVICE);
  // console.log('_orderReturnItems', _orderReturnItems)
  for (const singleOrder of OrderDetailClone.items) {
    // trường hợp line item trùng nhau, trùng loại (trường hợp sp và quà tặng trùng nhau, nếu có order_line_item_id thì check luôn)
    let duplicatedItem = newReturnItems.find((single) => {
      // console.log('singleOrder', singleOrder)
      return (
        single.variant_id === singleOrder.variant_id &&
        single.type === singleOrder.type &&
        (single.order_line_item_id ? single.order_line_item_id === singleOrder.id : true)
      );
    });
    // console.log('duplicatedItem', duplicatedItem)
    if (duplicatedItem) {
      let index = newReturnItems.findIndex(
        (single) =>
          single.variant_id === duplicatedItem?.variant_id &&
          single.type === duplicatedItem.type &&
          (duplicatedItem.order_line_item_id ? single.id === duplicatedItem.id : true),
      );
      const quantityLeft = newReturnItems[index].quantity - singleOrder.quantity;
      if (quantityLeft === 0) {
        newReturnItems.splice(index, 1);
      } else if (quantityLeft > 0) {
        newReturnItems[index].quantity = quantityLeft;
        const clone = cloneDeep(duplicatedItem);
        reCalculateDiscountReturnByOrigin(clone, duplicatedItem, quantityLeft);
        clone.id = singleOrder.id;
        // result.push(clone)
      } else {
        const quantityLeft = singleOrder.quantity - duplicatedItem.quantity;
        reCalculateDiscountReturnByOrigin(singleOrder, duplicatedItem, quantityLeft);
        newReturnItems.splice(index, 1);
        result.push(singleOrder);
      }
    } else {
      result.push(singleOrder);
    }
  }
  // console.log('result111', result)
  return result;
};

// kiểm tra xem đã trả hết hàng chưa
export const checkIfOrderHasReturnedAll = (OrderDetail: OrderResponse | null) => {
  if (!OrderDetail) {
    return false;
  }
  let result = false;
  let itemsCanReturn = getListItemsCanReturn(OrderDetail);
  if (itemsCanReturn.length === 0) {
    result = true;
  }
  return result;
};

export const handleDisplayCoupon = (
  coupon: string,
  numberCouponCharactersShowedBeforeAndAfter: number = 2,
) => {
  if (coupon.length > numberCouponCharactersShowedBeforeAndAfter) {
    const firstCharacters = coupon.substring(0, numberCouponCharactersShowedBeforeAndAfter);
    const lastCharacters = coupon.substring(
      coupon.length - numberCouponCharactersShowedBeforeAndAfter,
      coupon.length,
    );
    return `${firstCharacters}***${lastCharacters}`;
  } else {
    return `${coupon}***${coupon}`;
  }
};

export const getAccountCodeFromCodeAndName = (text: string | null | undefined) => {
  const splitString = "-";
  let result = null;
  if (text) {
    result = text.split(splitString)[0].trim();
  }
  return result;
};

export const handleDelayActionWhenInsertTextInSearchInput = (
  inputRef: React.MutableRefObject<any>,
  func: (...arg: any) => void | any,
  delayTime: number = 500,
) => {
  if (inputRef.current) {
    clearTimeout(inputRef.current);
  }
  inputRef.current = setTimeout(() => {
    func();
  }, delayTime);
};

export const getProductDiscountPerProduct = (product: OrderLineItemResponse) => {
  let discountPerProduct = 0;
  product.discount_items.forEach((single) => {
    discountPerProduct += single.value;
  });
  return discountPerProduct;
};

export const getProductDiscountPerOrder = (
  OrderDetail: OrderResponse | null | undefined,
  product: OrderLineItemResponse,
) => {
  // đối với đơn có trường distributed_order_discount
  const getDiscountPerOrderIfHasDistributedOrderDiscount = () => {
    let taxValue = 1;
    if (OrderDetail?.discounts?.length && product.tax_lines && product.tax_lines[0]?.rate) {
      let taxRate = OrderDetail.discounts[0].taxable ? product.tax_lines[0]?.rate : 0;
      taxValue = 1 + taxRate;
    }
    console.log(
      "product.single_distributed_order_discount",
      product.single_distributed_order_discount,
    );
    console.log("taxValue", taxValue);
    return (product.single_distributed_order_discount || 0) * taxValue;
  };
  console.log(
    "getDiscountPerOrderIfHasDistributedOrderDiscount",
    getDiscountPerOrderIfHasDistributedOrderDiscount(),
  );

  // đối với đơn cũ không có trường distributed_order_discount
  const getDiscountPerOrderIfHasNotDistributedOrderDiscount = () => {
    let totalDiscountAmountPerOrder = 0;
    let result = 0;
    if (OrderDetail?.total_line_amount_after_line_discount) {
      OrderDetail?.discounts?.forEach((singleOrderDiscount) => {
        if (singleOrderDiscount?.amount) {
          totalDiscountAmountPerOrder = totalDiscountAmountPerOrder + singleOrderDiscount?.amount;
        }
      });
      product.discount_value = getLineItemDiscountValue(product);
      result =
        (totalDiscountAmountPerOrder / OrderDetail?.total_line_amount_after_line_discount) *
        (product.price - product.discount_value);
    }
    return result;
  };
  console.log(
    "getDiscountPerOrderIfHasNotDistributedOrderDiscount",
    getDiscountPerOrderIfHasNotDistributedOrderDiscount(),
  );
  let discountPerOrder = 0;
  if (OrderDetail?.discounts?.length && OrderDetail.discounts[0].amount > 0) {
    // tạm thời FE tính, ko dùng của BE
    if (product.distributed_order_discount) {
      discountPerOrder = getDiscountPerOrderIfHasDistributedOrderDiscount();
    } else {
      discountPerOrder = getDiscountPerOrderIfHasNotDistributedOrderDiscount();
    }
  }
  return discountPerOrder;
};

/**
 * tính toán tiền trả lại khách khi đổi trả
 */
export const getReturnPricePerOrder = (
  OrderDetail: OrderResponse | null | undefined,
  product: OrderLineItemResponse,
) => {
  const discountPerProduct = getProductDiscountPerProduct(product);
  const discountPerOrder = getProductDiscountPerOrder(OrderDetail, product);
  return Math.round(product.price - discountPerProduct - discountPerOrder);
};

export const getTotalOrderDiscount = (
  discounts: OrderDiscountRequest[] | OrderDiscountResponse[] | null,
) => {
  if (!discounts) {
    return 0;
  }
  let totalDiscount = 0;
  discounts.forEach((singleOrderDiscount) => {
    if (singleOrderDiscount?.amount) {
      totalDiscount = totalDiscount + singleOrderDiscount.amount;
    }
  });
  return totalDiscount;
};

export const totalAmount = (items: Array<OrderLineItemRequest>) => {
  if (!items) {
    return 0;
  }
  let _items = [...items];
  let _amount = 0;

  _items.forEach((i) => {
    let total_discount_items = 0;
    let discountRate = 0;
    i.amount = i.price * i.quantity;
    i.discount_items.forEach((d) => {
      if (d.amount > i.price * i.quantity) {
        d.amount = i.price * i.quantity;
        d.value = i.price;
      }
      total_discount_items = total_discount_items + d.amount;
      d.rate = (d.amount / i.amount) * 100;
      discountRate = discountRate + (d.amount / i.amount) * 100;
    });
    i.discount_rate = discountRate;
    let amountItem = i.price * i.quantity - total_discount_items;
    _amount += amountItem;
    i.line_amount_after_line_discount = amountItem;
    if (i.amount !== null) {
      let totalDiscount = 0;
      i.discount_items.forEach((a) => {
        totalDiscount = totalDiscount + a.amount;
      });
      i.discount_amount = totalDiscount;
    }
  });
  return _amount;
};

export const isNullOrUndefined = (value: any) => {
  return value === null || value === undefined;
};

export const convertItemToArray = (item: any, type?: string) => {
  if (type?.toLowerCase() === "number") {
    return Array.isArray(item) ? item.map((item: any) => Number(item)) : [Number(item)];
  }
  return Array.isArray(item) ? item : [item];
};

export const convertActionLogDetailToText = (
  data?: string,
  dateFormat: string = "HH:mm DD/MM/YYYY",
) => {
  const renderAddress = (dataJson: any) => {
    let result = "-";
    let textFullAddress = "";
    let textWard = "";
    let textDistrict = "";
    let textCity = "";
    if (dataJson.shipping_address?.full_address) {
      textFullAddress = dataJson.shipping_address?.full_address;
    }
    if (dataJson.shipping_address?.ward) {
      textWard = `${dataJson.shipping_address?.ward},`;
    }
    if (dataJson.shipping_address?.district) {
      textDistrict = `${dataJson.shipping_address?.district},`;
    }
    if (dataJson.shipping_address?.city) {
      textCity = `${dataJson.shipping_address?.city},`;
    }
    if (
      dataJson.shipping_address?.full_address ||
      dataJson.shipping_address?.ward ||
      dataJson.shipping_address?.district ||
      dataJson.shipping_address?.city
    ) {
      result = `${textFullAddress} ${textWard} ${textDistrict} ${textCity}`;
    }
    return result;
  };
  const renderShipmentMethod = (dataJson: any) => {
    let result = "-";
    if (dataJson.fulfillments) {
      const sortedFulfillments = dataJson?.fulfillments?.sort(
        (a: FulFillmentResponse, b: FulFillmentResponse) =>
          moment(b?.updated_date).diff(moment(a?.updated_date)),
      );
      switch (sortedFulfillments[0]?.shipment?.delivery_service_provider_type) {
        case ShipmentMethod.EMPLOYEE:
          result = `Tự giao hàng - ${sortedFulfillments[0]?.shipment?.shipper_code} - ${sortedFulfillments[0]?.shipment.shipper_name}`;
          break;
        case ShipmentMethod.EXTERNAL_SERVICE:
          result = `Hãng vận chuyển - ${sortedFulfillments[0]?.shipment?.delivery_service_provider_name}`;
          break;
        case ShipmentMethod.EXTERNAL_SHIPPER:
          result = `Tự giao hàng - ${sortedFulfillments[0]?.shipment.shipper_code} - ${sortedFulfillments[0]?.shipment.shipper_name}`;
          break;
        case ShipmentMethod.PICK_AT_STORE:
          result = "Nhận tại cửa hàng";
          break;
        case ShipmentMethod.SHOPEE:
          result = "Shopee";
          break;
        default:
          break;
      }
    }
    return result;
  };
  const renderDiscountItem = (singleItem: any) => {
    // console.log('singleItem', singleItem)
    let discountAmount = 0;
    if (singleItem?.discount_items && singleItem?.discount_items.length > 0) {
      singleItem?.discount_items.forEach((discount: any) => {
        !discount.deleted && (discountAmount = discountAmount + discount.amount);
      });
    }
    return formatCurrency(discountAmount);
  };
  let result = "";
  if (data) {
    let dataJson = JSON.parse(data);
    // console.log("dataJson", dataJson);
    result = `
		<span style="color:red">Thông tin đơn hàng: </span><br/> 
		- Nhân viên: ${dataJson?.created_name || "-"}<br/>
		- Trạng thái : ${dataJson?.status_after || "-"}<br/>
		- Nguồn : ${dataJson?.source || "-"}<br/>
		- Cửa hàng : ${dataJson?.store || "-"}<br/>
		- Địa chỉ cửa hàng : ${dataJson?.store_full_address}<br/>
		- Thời gian: ${
      dataJson?.updated_date ? moment(dataJson?.updated_date).format(dateFormat) : "-"
    }<br/>
		- Ghi chú nội bộ: ${dataJson?.note || "-"} <br/>
		- Ghi chú của khách: ${dataJson?.customer_note || "-"} <br/>
		<br/>
		<span style="color:red">Sản phẩm: </span><br/> 
		${dataJson?.items
      .filter((singleItem: any) => !singleItem?.deleted)
      .map((singleItem: any, index: any) => {
        return `
		- Sản phẩm ${index + 1}: ${singleItem?.variant} <br/>
			+ Đơn giá: ${formatCurrency(singleItem?.price)} <br/>
			+ Số lượng: ${singleItem?.quantity} <br/>
			+ Thuế : ${singleItem?.tax_rate || 0} <br/>
			+ Chiết khấu sản phẩm: ${renderDiscountItem(singleItem)} <br/>
			+ Thành tiền: ${formatCurrency(singleItem?.line_amount_after_line_discount)} <br/>
			`;
      })
      .join("<br/>")}
		<br/>
		<span style="color:red">Phiếu đóng gói: </span><br/> 
		- Địa chỉ giao hàng: ${renderAddress(dataJson)} <br/>
		- Địa chỉ nhận hóa đơn: ${renderAddress(dataJson)} <br/>
		- Phương thức giao hàng: ${renderShipmentMethod(dataJson)} <br/>
		- Trạng thái: ${dataJson?.fulfillments ? dataJson?.fulfillments[0]?.status : "-"} <br/>
		<br/>
		<span style="color:red">Thanh toán: </span><br/>  
		${
      !(dataJson?.payments?.length > 0)
        ? `- Chưa thanh toán`
        : dataJson?.payments &&
          dataJson?.payments
            .map((singlePayment: any, index: number) => {
              return `
							- ${singlePayment?.payment_method}: ${formatCurrency(singlePayment?.paid_amount)} 
						`;
            })
            .join("<br/>")
    }
		`;
  }
  return result;
};

export const reCalculatePaymentReturn = (
  payments: OrderPaymentRequest[],
  totalAmountCustomerNeedToPay: number,
  listPaymentMethod: PaymentMethodResponse[],
) => {
  if (totalAmountCustomerNeedToPay < 0) {
    let returnAmount = Math.abs(totalAmountCustomerNeedToPay);
    let _payments = cloneDeep(payments);
    let paymentCashIndex = _payments.findIndex(
      (payment) => payment.payment_method_code === PaymentMethodCode.CASH,
    );
    if (paymentCashIndex > -1) {
      _payments[paymentCashIndex].paid_amount = payments[paymentCashIndex].amount;
      _payments[paymentCashIndex].amount = payments[paymentCashIndex].paid_amount - returnAmount;
      _payments[paymentCashIndex].return_amount = returnAmount;
    } else {
      let newPaymentCash: OrderPaymentRequest | undefined = undefined;
      newPaymentCash = {
        code: PaymentMethodCode.CASH,
        payment_method_code: PaymentMethodCode.CASH,
        payment_method_id:
          listPaymentMethod.find((single) => single.code === PaymentMethodCode.CASH)?.id || 0,
        amount: -returnAmount,
        paid_amount: 0,
        return_amount: returnAmount,
        status: "",
        payment_method:
          listPaymentMethod.find((single) => single.code === PaymentMethodCode.CASH)?.name || "",
        reference: "",
        source: "",
        customer_id: 1,
        note: "",
        type: "",
      };
      _payments.push(newPaymentCash);
    }
    return _payments;
  }
  return payments;
};

export const isFetchApiSuccessful = (response: BaseResponse<any>) => {
  if (response) {
    switch (response?.code) {
      case HttpStatus.SUCCESS:
        return true;
      default:
        return false;
    }
  }
  return false;
};

export function handleFetchApiError(
  response: BaseResponse<any>,
  textApiInformation: string,
  dispatch: any,
) {
  if (response) {
    switch (response.code) {
      case HttpStatus.UNAUTHORIZED:
        dispatch(unauthorizedAction());
        break;
      default:
        if (response?.message) {
          showError(`${textApiInformation}: ${response?.message}`);
        }
        if (response?.errors && response?.errors.length > 0) {
          response?.errors?.forEach((e: any) => showError(e));
        }
        break;
    }
  }
}

export async function sortSources(orderSources: SourceResponse[], departmentIds: number[] | null) {
  let result = orderSources;
  let departmentSources: SourceResponse[] = [];
  if (departmentIds && departmentIds.length > 0) {
    const query = {
      department_ids: departmentIds,
      active: true,
    };
    try {
      let response = await getSourcesWithParamsService(query);
      if (response.data.items) {
        for (const item of response.data.items) {
          let index = departmentSources.findIndex((single) => single.id === item.id);
          if (index === -1) {
            departmentSources.push(item);
          }
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  }
  if (departmentSources.length > 0) {
    result = [...departmentSources];
  }
  return result;
}

export const isOrderFromPOS = (
  OrderDetail: OrderModel | OrderResponse | CustomerOrderHistoryResponse | null | undefined,
) => {
  if (OrderDetail?.channel_id === POS.channel_id || OrderDetail?.source_code === POS.source_code) {
    return true;
  }
  return false;
};

/**
 * Ẩn kí tự
 * value: ki tu can dua vao
 * length: số kí tự muốn hiển thị
 * lastLength: số kí tự cuối muốn hiện thị
 */
export const splitEllipsis = (value: string, length: number, lastLength: number): string => {
  if (value.length <= length) return value;
  let strLength = value.length - (value.length - length + 7); // tổng số kí tự cần lấy

  let strFirst = value.substring(0, strLength - lastLength); //lấy kí tự đầu
  let strLast = value.substring(value.length - lastLength, value.length); //lấy kí tự cuối

  return `${strFirst} [...] ${strLast}`;
};

export const trimText = (text?: string) => {
  if (!text) return;
  return text.replace(/(\s)+/g, "");
};

export const goToTopPage = () => {
  window.scrollTo(0, 0);
};

export const formatFieldTag = (
  params: { [key: string]: any },
  fieldMapping?: any,
): BaseFilterTag[] => {
  const transformParams = transformParamsToArray(params);
  let formatted: BaseFilterTag[] = [];

  transformParams.forEach((item: any, i: number) => {
    for (let keyItem in item) {
      Object.keys(params).forEach((key: any, index) => {
        if (keyItem === "page" || keyItem === "limit") return;
        if (keyItem === key) {
          formatted.push({
            id: i,
            keyId: key,
            keyName: fieldMapping && fieldMapping[key],
            valueId: item[key],
            valueName: null,
          });
        }
      });
    }
  });
  return sortBy(formatted, "keyName");
};

export const transformParamsToArray = (params: { [key: string]: any }) => {
  let newParams: any = [];
  Object.keys(params).forEach((key: any, index) => {
    if (params[key] && !_.isEmpty(params[key])) {
      newParams.push({ [key]: params && params[key] });
    }
  });
  return newParams;
};

export const transformParamsToObject = (arrays: BaseFilterTag[]) => {
  return arrays.reduce(function (result: any, item: BaseFilterTag) {
    result[item.keyId] = item.valueId;
    return result;
  }, {});
};
/**
 * check cấu hình đơn hàng để tính phí ship báo khách
 */
export const handleCalculateShippingFeeApplyOrderSetting = (
  customerShippingAddressCityId: number | null | undefined = -999,
  orderPrice: number = 0,
  shippingServiceConfig: ShippingServiceConfigDetailResponseModel[],
  transportService: string | null | undefined,
  form: FormInstance<any>,
  setShippingFeeInformedToCustomer?: (value: number) => void,
  isOrderUpdatePage = false,
  isApplyAll = true,
) => {
  if (isOrderUpdatePage) {
    return;
  }
  if (!transportService && !isApplyAll) {
    return;
  }

  if (!isApplyAll) {
    if (!shippingServiceConfig || !customerShippingAddressCityId || orderPrice === undefined) {
      form?.setFieldsValue({ shipping_fee_informed_to_customer: 0 });
      setShippingFeeInformedToCustomer && setShippingFeeInformedToCustomer(0);
      showSuccess("Chú ý: Phí ship báo khách đã được thay đổi!");
      return;
    }
  }
  //check thời gian
  const checkIfIsInTimePeriod = (startDate: any, endDate: any) => {
    const now = moment();
    const checkIfTodayAfterStartDate = moment(startDate).isBefore(now);
    const checkIfTodayBeforeEndDate = moment(now).isBefore(endDate);
    return checkIfTodayAfterStartDate && checkIfTodayBeforeEndDate;
  };

  // check dịch vụ
  const checkIfListServicesContainSingle = (
    listServices: any[],
    singleService: string | null | undefined,
  ) => {
    if (!singleService) {
      return false;
    }
    let result = false;
    let checkCondition = listServices.some((single) => {
      return single.code.toLowerCase() === singleService.toLowerCase();
    });
    if (checkCondition) {
      result = true;
    }
    return result;
  };

  // check tỉnh giao hàng ( config -1 là tất cả tỉnh thành)
  const checkIfSameCity = (
    configShippingAddressCityId: number,
    customerShippingAddressCityId: number,
  ) => {
    if (configShippingAddressCityId === -1) {
      return true;
    }
    return customerShippingAddressCityId === configShippingAddressCityId;
  };

  // check giá
  const checkIfPrice = (orderPrice: number, fromPrice: number, toPrice: number) => {
    return fromPrice <= orderPrice && orderPrice <= toPrice;
  };

  // filter thời gian, active
  const filteredShippingServiceConfig = shippingServiceConfig.filter((single) => {
    if (isApplyAll) {
      return (
        checkIfIsInTimePeriod(single.start_date, single.end_date) &&
        single.status === ORDER_SETTINGS_STATUS.active
      );
    }
    return (
      checkIfIsInTimePeriod(single.start_date, single.end_date) &&
      single.status === ORDER_SETTINGS_STATUS.active &&
      single.transport_types &&
      checkIfListServicesContainSingle(single.transport_types, transportService)
    );
  });

  // filter city
  let listCheckedShippingFeeConfig = [];
  if (filteredShippingServiceConfig) {
    for (const singleOnTimeShippingServiceConfig of filteredShippingServiceConfig) {
      const checkedShippingFeeConfig =
        singleOnTimeShippingServiceConfig.shipping_fee_configs.filter((single) => {
          return (
            checkIfSameCity(single.city_id, customerShippingAddressCityId || -999) &&
            checkIfPrice(orderPrice, single.from_price, single.to_price)
          );
        });
      listCheckedShippingFeeConfig.push(checkedShippingFeeConfig);
    }
  }

  // console.log('listCheckedShippingFeeConfig', listCheckedShippingFeeConfig)

  const listCheckedShippingFeeConfigFlatten = flattenArray(listCheckedShippingFeeConfig);

  let result = 0;
  // lấy số nhỏ nhất
  if (listCheckedShippingFeeConfigFlatten && listCheckedShippingFeeConfigFlatten.length > 0) {
    result = listCheckedShippingFeeConfigFlatten[0].transport_fee;
    listCheckedShippingFeeConfigFlatten.forEach((single: any) => {
      if (single.transport_fee < result) {
        result = single.transport_fee;
      }
    });
  }
  form?.setFieldsValue({ shipping_fee_informed_to_customer: result });
  setShippingFeeInformedToCustomer && setShippingFeeInformedToCustomer(result);
  showSuccess("Chú ý: Phí ship báo khách đã được thay đổi!");
};

export const getCustomerShippingAddress = (customer: CustomerResponse) => {
  return customer.shipping_addresses.find((item) => item.default);
};

export const isOrderFinishedOrCancel = (orderDetail: OrderResponse | null | undefined) => {
  return (
    orderDetail?.status === OrderStatus.FINISHED ||
    orderDetail?.status === OrderStatus.COMPLETED ||
    orderDetail?.status === OrderStatus.CANCELLED
  );
};

export const copyTextToClipboard = (e: any, data: string | null | undefined) => {
  e.stopPropagation();
  navigator.clipboard?.writeText(data ? data : "").then(() => {});
};

export const isOrderFromSaleChannel = (
  orderDetail: OrderResponse | OrderModel | null | undefined,
) => {
  if (!orderDetail || !orderDetail?.channel_id) {
    return false;
  }
  const SALE_CHANNEL_SOURCE = [
    SHOPEE.channel_id,
    TIKI.channel_id,
    LAZADA.channel_id,
    SENDO.channel_id,
  ];
  return SALE_CHANNEL_SOURCE.includes(orderDetail?.channel_id);
};

const handleIfOrderStatusWithPartner = (sub_status_code: string) => {
  let isChange = true;
  switch (sub_status_code) {
    case ORDER_SUB_STATUS.require_warehouse_change: {
      isChange = false;
      break;
    }
    default:
      break;
  }
  return isChange;
};

const handleIfOrderStatusPickAtStore = (sub_status_code: string) => {
  let isChange = true;
  return isChange;
  // changeSubStatusCode(sub_status_code);
};

const handleIfOrderStatusOther = (
  sub_status_code: string,
  sortedFulfillments: FulFillmentResponse[],
) => {
  let isChange = true;
  switch (sub_status_code) {
    case ORDER_SUB_STATUS.awaiting_saler_confirmation: {
      if (
        !sortedFulfillments[0]?.shipment ||
        (sortedFulfillments[0]?.status && checkIfFulfillmentCancelled(sortedFulfillments[0]))
      ) {
        isChange = true;
      } else {
        isChange = false;
        showError("Bạn chưa hủy đơn giao hàng!");
      }
      break;
    }
    case ORDER_SUB_STATUS.coordinator_confirmed: {
      if (
        (sortedFulfillments[0]?.status && checkIfFulfillmentCancelled(sortedFulfillments[0])) ||
        !sortedFulfillments[0]?.shipment
      ) {
        isChange = false;
        showError("Chưa có hình thức vận chuyển!");
      } else {
        isChange = true;
      }
      break;
    }
    case ORDER_SUB_STATUS.fourHour_delivery: {
      if (sortedFulfillments[0]?.shipment?.service !== SHIPPING_TYPE.DELIVERY_4H) {
        isChange = false;
        showError("Chưa chọn giao hàng 4h!");
      } else {
        isChange = true;
      }
      break;
    }
    default:
      break;
  }
  return isChange;
};

export const getValidateChangeOrderSubStatus = (
  orderDetail: OrderModel | OrderResponse | null,
  sub_status_code: string,
) => {
  if (isOrderFromSaleChannel(orderDetail)) {
    return true;
  }
  if (!orderDetail) {
    return false;
  }
  let isChange = true;
  const sortedFulfillments = orderDetail?.fulfillments
    ? sortFulfillments(orderDetail?.fulfillments).filter(
        (single) => single.status && !checkIfFulfillmentCancelled(single),
      )
    : [];
  switch (sortedFulfillments[0]?.shipment?.delivery_service_provider_type) {
    // giao hàng hvc, tự giao hàng
    case ShipmentMethod.EXTERNAL_SERVICE:
    case ShipmentMethod.EMPLOYEE:
      isChange = handleIfOrderStatusWithPartner(sub_status_code);
      break;
    // nhận tại cửa hàng
    case ShipmentMethod.PICK_AT_STORE:
      isChange = handleIfOrderStatusPickAtStore(sub_status_code);
      break;
    default:
      break;
  }
  // console.log('isChange', isChange)
  if (isChange) {
    isChange = handleIfOrderStatusOther(sub_status_code, sortedFulfillments);
  }
  return isChange;
};

export const convertFromStringToDate = (pDate: any, fomat: string) => {
  let date: Moment | null = null;

  if (pDate) {
    if (!moment(pDate).isValid()) {
      let dd = pDate.split("-")[0].padStart(2, "0");
      let mm = pDate.split("-")[1].padStart(2, "0");
      let yyyy = pDate.split("-")[2].split(" ")[0];
      // let hh = pDate.split("-")[2].split(" ")[1].split(":")[0].padStart(2, "0");
      // let mi = pDate.split("-")[2].split(" ")[1].split(":")[1].padStart(2, "0");
      // let secs = pDate.split("-")[2].split(" ")[1].split(":")[2].padStart(2, "0");

      mm = (parseInt(mm) - 1).toString(); // January is 0
      dd = (parseInt(dd) + 1).toString();

      date = moment(new Date(yyyy, mm, dd)).utc(true);
    } else date = moment(pDate, "DD-MM-YYYY").utc(true);
  }

  return date;
};

export const removeSpaceBeforeAndAfterWord = (text: string) => {
  return text
    .split(" ")
    .map((single) => single.trim())
    .filter((single) => single)
    .join(" ");
};

export const replaceLast = (text: string, textShort: string) => {
  textShort = removeSpaceBeforeAndAfterWord(textShort);
  text = removeSpaceBeforeAndAfterWord(text);
  // console.log('textShort', textShort)
  // console.log('text', text)
  let index = text.lastIndexOf(textShort);
  // console.log('index', index);
  let result = text;
  if (index > -1) {
    let deleteText = text.substring(index, index + textShort.length);
    // console.log('deleteText', deleteText);
    result = text.replace(deleteText, "");
  }
  return result;
};

export const convertStringDistrictWithoutLine = (text: string) => {
  return text
    .toLowerCase()
    .replace("tỉnh", "")
    .replaceAll("đường", "")
    .replaceAll("thị xã", "")
    .replaceAll("xã", "")
    .replaceAll("phường", "")
    .replace("quận", "")
    .replaceAll(".", "")
    .replaceAll("-", " ")
    .replaceAll(",", " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace("huyen", "")
    .replace("thanh pho", "")
    .replace("thi tran", "")
    .replace("thi xa", "")
    .replace("tp", "")
    .replace("p.", "")
    .replace("hcm", "ho chi minh")
    .replace("hn", "ha noi");
};

export const convertStringDistrict = (text: string) => {
  return convertStringDistrictWithoutLine(text).replaceAll("-", " ").replace(/\s\s+/g, " ");
};

export const findWard = (district: string | null, newWards: any[], newValue: string) => {
  let districtConvert = district
    ? convertStringDistrictWithoutLine(district).toLowerCase().replace("tỉnh ", "").normalize("NFD")
    : "";
  // console.log('districtConvert', districtConvert);
  let districtArr = districtConvert.split("-");
  // console.log('districtArr', districtArr);
  // if(cityName.length > 0) {
  //   convertStringDistrict(cityName).split(" ").forEach(character => {
  //     newValue = newValue.replace(character, "")
  //   })

  // }
  let valueResult = convertStringDistrict(newValue);
  // console.log('valueResult', valueResult)
  districtArr.forEach((district) => {
    // console.log('district', district)
    // console.log('valueResult', valueResult)
    // valueResult = valueResult.replace(district.trim(), "");
    // valueResult = replaceLast(valueResult, convertStringDistrict(district));
    // phân cách bằng dấu cách, valueResult thêm dấu cách để chính xác
    convertStringDistrict(district)
      .split(" ")
      .forEach((single) => {
        // nếu có dấu cách thì bỏ qua
        if (!single.trim()) {
          return;
        }
        // console.log('single', single)
        // valueResult =" "+ valueResult+" ";
        // console.log('single', single)
        // valueResult = valueResult.replace(" " +single.trim() + " ", "");
        let splitArr = valueResult.split(" ");
        let duplicateIndex = splitArr.findIndex((aa) => single.trim() === aa.trim());
        // console.log('duplicateIndex', duplicateIndex)
        if (duplicateIndex > -1) {
          splitArr.splice(duplicateIndex, 1);
          // console.log('valueResult', valueResult)
          valueResult = splitArr.join(" ");
        }
      });
  });
  // tìm array có index lớn nhất
  // console.log('valueResult', valueResult)
  const findWard = newWards
    .filter((ward: any) => {
      const valueResultArr: any[] = convertStringDistrict(valueResult)
        .split(" ")
        .filter((single) => single);
      // console.log('valueResultArr', valueResultArr)
      const wardNameArr: any[] = convertStringDistrict(ward.name)
        .split(" ")
        .filter((x) => x);
      // console.log('wardNameArr', wardNameArr)
      return !wardNameArr.some((single) => !valueResultArr.includes(single));
    })
    .reverse()[0];
  return findWard;
};

export const handleFindArea = (value: string, newAreas: any) => {
  const newValue = convertStringDistrict(value);
  // khi tìm xong tỉnh thì xóa ký tự đó để tìm huyện
  const findArea = newAreas.filter((area: any) => {
    // replace quận trong list danh sách tỉnh huyện có sẵn
    const districtString = convertStringDistrict(area.name).replace("dao ", "");
    // tp thì xóa dấu cách thừa, tỉnh thì ko-chưa biết sao:
    // test Thị xã Phú Mỹ, bà rịa vũng tàu
    // test khu một thị trấn lam Sơn huyện thọ Xuân tỉnh thanh hoá
    const cityString = convertStringDistrict(area.city_name);
    // console.log('cityString', cityString)
    // console.log('districtString', districtString);
    return (
      newValue.indexOf(cityString) > -1 &&
      newValue.indexOf(districtString) > -1 &&
      newValue.replace(cityString, "").indexOf(districtString) > -1
    );
  });
  // console.log('findArea1111', findArea)
  let result = findArea.reverse()[0];

  return result;
};

export const changeMetaDataAfterDelete = (
  metadata: BaseMetadata,
  setMetaData: (value: BaseMetadata) => void,
  removedCount: number,
) => {
  setMetaData({
    ...metadata,
    total: metadata.total - removedCount,
    limit: metadata.limit - removedCount,
  });
};

export const formatCurrencyInputValue = (a: string) => {
  if (a) {
    return formatCurrency(a);
  }
  return a;
};

export const checkIfOrderCanBeReturned = (
  orderDetail: OrderResponse | OrderModel | CustomerOrderHistoryResponse,
) => {
  return (
    orderDetail.status === OrderStatus.FINISHED || orderDetail.status === OrderStatus.COMPLETED
  );
};

export const removeMultiWhitespaceAndTrimText = (value: string) => {
  return value.trim().replace(/\s\s+/g, " ");
};

//chuyển đổi mảng đa chiều sang mảng 1 chiều
export const flattenArray = (arr: any) => {
  return arr.reduce(function (flat: any, toFlatten: any) {
    return flat.concat(Array.isArray(toFlatten) ? flattenArray(toFlatten) : toFlatten);
  }, []);
};

/**
 * Parse a localized number to a float.
 * @param {string} stringNumber - the localized number
 * @param {string} locale - [optional] the locale that the number is represented in. Omit this parameter to use the current locale.
 */
export function parseLocaleNumber(stringNumber: any, locale?: string) {
  const thousandSeparator = Intl.NumberFormat(locale)
    .format(11111)
    .replace(/\p{Number}/gu, "");
  const decimalSeparator = Intl.NumberFormat(locale)
    .format(1.1)
    .replace(/\p{Number}/gu, "");

  return parseFloat(
    stringNumber
      .toString()
      .replace(new RegExp("\\" + thousandSeparator, "g"), "")
      .replace(new RegExp("\\" + decimalSeparator), "."),
  );
}

/*
 *Thêm item vào vị trí chỉ định
 */
export const insertCustomIndexArray = (arr: any, index: number, newItem: any) => [
  ...arr.slice(0, index),
  newItem,
  ...arr.slice(index),
];

export function capitalEachWords(str: string) {
  return str
    .split(" ")
    .map((item) => _.capitalize(item))
    .join(" ");
}
export const mathRoundPercentage = (percentage: number) => {
  return round(percentage, AppConfig.mathRoundPrecision.percentage);
};

export const mathRoundAmount = (amount: number) => {
  return round(amount, AppConfig.mathRoundPrecision.amount);
};
