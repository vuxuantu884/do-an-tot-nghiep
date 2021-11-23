import { EcommerceRequest } from "model/request/ecommerce.request";
import BaseAction from "base/base.action";
import { EcommerceType } from "domain/types/ecommerce.type";
import { EcommerceResponse } from "model/response/ecommerce/ecommerce.response";
import { YDPageCustomerResponse } from "model/response/ecommerce/fpage.response";
import {
  ProductEcommerceQuery,
  PostProductEcommerceQuery,
  PostEcommerceOrderQuery,
  GetOrdersMappingQuery,
} from "model/query/ecommerce.query";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderType } from "domain/types/order.type";

export const addFpagePhone = (
  userId: string,
  phone: string,
  setData: (data: YDPageCustomerResponse) => void
) => {
  return BaseAction(EcommerceType.ADD_FPAGE_PHONE, {
    userId,
    phone,
    setData,
  });
};
export const deleteFpagePhone = (
  userId: string,
  phone: string,
  setData: (data: YDPageCustomerResponse) => void
) => {
  return BaseAction(EcommerceType.DELETE_FPAGE_PHONE, {
    userId,
    phone,
    setData,
  });
};
export const setFpageDefaultPhone = (
  userId: string,
  phone: string,
  setData: (data: YDPageCustomerResponse) => void
) => {
  return BaseAction(EcommerceType.SET_FPAGE_DEFAULT_PHONE, {
    userId,
    phone,
    setData,
  });
};

export const getFpageCustomerInfo = (
  userId: string,
  setData: (data: YDPageCustomerResponse) => void
) => {
  return BaseAction(EcommerceType.GET_FPAGE_CUSTOMER, {
    userId,
    setData,
  });
};
// config
export const ecommerceConfigCreateAction = (
  request: EcommerceRequest,
  setData: (data: EcommerceResponse) => void
) => {
  return BaseAction(EcommerceType.CREATE_ECOMMERCE_CONFIG_REQUEST, {
    request,
    setData,
  });
};

export const ecommerceConfigGetAction = (
  setData: (data: Array<EcommerceResponse>) => void
) => {
  return BaseAction(EcommerceType.GET_ECOMMERCE_CONFIG_REQUEST, { setData });
};

export const ecommerceConfigGetByIdAction = (
  id: number,
  setData: (data: EcommerceRequest) => void
) => {
  return BaseAction(EcommerceType.GET_ECOMMERCE_CONFIG_BY_ID_REQUEST, {
    id,
    setData,
  });
};

export const ecommerceConfigUpdateAction = (
  id: number,
  request: EcommerceRequest,
  setData: (data: EcommerceResponse) => void
) => {
  return BaseAction(EcommerceType.UPDATE_ECOMMERCE_CONFIG_REQUEST, {
    id,
    request,
    setData,
  });
};

export const ecommerceConfigDeleteAction = (
  id: number,
  setData: (result: boolean) => void
) => {
  return BaseAction(EcommerceType.DELETE_ECOMMERCE_CONFIG_REQUEST, {
    id,
    setData,
  });
};
// connect to ecommerce

export const ecommerceConnectAction = (setData: (result: any) => void) => {
  return BaseAction(EcommerceType.CONNECT_ECOMMERCE_CONFIG_REQUEST, {
    setData,
  });
};

export const ecommerceConfigInfoAction = (
  query: any,
  setData: (result: EcommerceResponse) => void
) => {
  return BaseAction(EcommerceType.GET_ECOMMERCE_CONFIG_INFO_REQUEST, {
    query,
    setData,
  });
};

export const getProductEcommerceList = (
  query: ProductEcommerceQuery,
  setData: (data: any) => void
) => {
  return BaseAction(EcommerceType.GET_ECOMMERCE_VARIANTS_REQUEST, { query, setData });
};

export const getShopEcommerceList = (query: any, setData: (data: any) => void) => {
  return BaseAction(EcommerceType.GET_ECOMMERCE_SHOP_REQUEST, { query, setData });
};

export const postProductEcommerceList = (
  query: PostProductEcommerceQuery,
  setData: (data: any) => void
) => {
  return BaseAction(EcommerceType.POST_ECOMMERCE_VARIANTS_REQUEST, { query, setData });
};

export const deleteEcommerceItem = (ids: any, setData: (data: any) => void) => {
  return BaseAction(EcommerceType.DELETE_ECOMMERCE_ITEM_REQUEST, { ids, setData });
};

export const disconnectEcommerceItem = (ids: any, setData: (data: any) => void) => {
  return BaseAction(EcommerceType.DISCONNECT_ECOMMERCE_ITEM_REQUEST, { ids, setData });
};

export const postSyncStockEcommerceProduct = (
  query: any,
  setData: (data: any) => void
) => {
  return BaseAction(EcommerceType.POST_SYNC_STOCK_ECOMMERCE_ITEM_REQUEST, {
    query,
    setData,
  });
};

export const getCategoryList = (query: any, setData: (data: any) => void) => {
  return BaseAction(EcommerceType.GET_ECOMMERCE_CATEGORY_REQUEST, { query, setData });
};

export const putConnectEcommerceItem = (query: any, setData: (data: any) => void) => {
  return BaseAction(EcommerceType.PUT_CONNECT_ECOMMERCE_ITEM_REQUEST, { query, setData });
};

//ecommerce order actions
export const postEcommerceOrderAction = (
  query: PostEcommerceOrderQuery,
  setData: (data: any) => void
) => {
  return BaseAction(EcommerceType.POST_ECOMMERCE_ORDER_REQUEST, { query, setData });
};

//get orders mapping list thai todo, need update api
export const getOrderMappingListAction = (
  query: GetOrdersMappingQuery,
  setData: (data: PageResponse<any> | false) => void
) => {
  return BaseAction(OrderType.GET_LIST_ORDER_REQUEST, {
    query,
    setData,
  });
};

// print ecommerce orders actions
export const printEcommerceOrdersAction = (
  query: any,
  callBack: (data: any) => void
) => {
  return BaseAction(EcommerceType.PRINT_ECOMMERCE_ORDERS, { query, callBack });
};
