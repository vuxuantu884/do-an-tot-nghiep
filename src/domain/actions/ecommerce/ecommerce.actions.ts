import { EcommerceRequest } from "model/request/ecommerce.request";
import BaseAction from "base/base.action";
import { EcommerceType } from "domain/types/ecommerce.type";
import { EcommerceResponse } from "model/response/ecommerce/ecommerce.response";
import { ProductEcommerceQuery } from "model/query/ecommerce.query";

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
  deleteCallback: (result: boolean) => void
) => {
  return BaseAction(EcommerceType.DELETE_ECOMMERCE_CONFIG_REQUEST, {
    id,
    deleteCallback,
  });
};
// connect to ecommerce

export const ecommerceConnectAction = (
  setData: (result: any) => void
) => {
  return BaseAction(EcommerceType.CONNECT_ECOMMERCE_CONFIG_REQUEST, {
    setData,
  });
};

export const ecommerceConfigInfoAction = (
  query: any,
  setData: (result: EcommerceResponse ) => void
) => {
  return BaseAction(EcommerceType.GET_ECOMMERCE_CONFIG_INFO_REQUEST, {
    query,
    setData,
  });
};

export const getProductEcommerceList = (query: ProductEcommerceQuery, setData: (data: any) => void) => {
  return BaseAction(EcommerceType.GET_ECOMMERCE_VARIANTS_REQUEST, { query, setData });
}
