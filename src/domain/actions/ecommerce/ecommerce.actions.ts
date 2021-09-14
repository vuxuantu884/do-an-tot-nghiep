import { EcommerceRequest } from "model/request/ecommerce.request";
import BaseAction from "base/base.action";
import { EcommerceType } from "domain/types/ecommerce.type";
import { EcommerceResponse } from "model/response/ecommerce/ecommerce.response";
import { TotalItemsEcommerceQuery } from "model/query/ecommerce.query";
import { ConnectedItemsQuery } from "model/query/ecommerce.query";
import { NotConnectedItemsQuery} from "model/query/ecommerce.query";

export const ecommerceConfigCreateAction = (
  request: EcommerceRequest,
  setData: (data: Array<EcommerceResponse>) => void
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

export const TotalItemsEcommerceList = (query: TotalItemsEcommerceQuery, setData: (data: any) => void) => {
  //thai need todo
  // return BaseAction(EcommerceType.GET_TOTAL_ITEMS_ECOMMERCE, { query, setData });
  return {}
}

export const ConnectedItemsList = (query: ConnectedItemsQuery, setData: (data: any) => void) => {
  //thai need todo
  // return BaseAction(EcommerceType.GET_TOTAL_ITEMS_ECOMMERCE, { query, setData });
  return {}
}

export const NotConnectedItemsList = (query: NotConnectedItemsQuery, setData: (data: any) => void) => {
  //thai need todo
  // return BaseAction(EcommerceType.GET_TOTAL_ITEMS_ECOMMERCE, { query, setData });
  return {}
}
