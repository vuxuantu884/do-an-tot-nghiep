import BaseAction from "base/base.action";
import { WarrantyType } from "domain/types/warranty.type";

export const getWarrantiesAction = (
  // query: AccountSearchQuery,
  setData: (data: Array<any>) => void
) => {
  return BaseAction(WarrantyType.GET_DATA_WARRANTIES_REQUEST, { setData });
};

export const getDetailsWarrantyAction = (
  id: string,
  setData: (data: any) => void
) => {
  return BaseAction(WarrantyType.GET_DETAILS_WARRANTY_REQUEST, { id, setData });
};

export const createWarrantyAction = (
  body: any,
  setData: (data: any) => void
) => {
  return BaseAction(WarrantyType.CREATE_WARRANTY_REQUEST, { body, setData });
};

export const updateWarrantyAction = (
  id: string,
  body: any,
  setData: (data: any) => void
) => {
  return BaseAction(WarrantyType.UPDATE_WARRANTY_REQUEST, { id, body, setData });
};


export const getWarrantyReasonsAction = (
  setData: (data: Array<any>) => void
) => {
  return BaseAction(WarrantyType.GET_WARRANTY_REASONS_REQUEST, { setData });
};

