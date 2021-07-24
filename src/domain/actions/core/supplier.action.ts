import BaseAction from "base/BaseAction";
import { SupplierType } from "domain/types/core.type";
import { SupplierQuery } from "model/core/supplier.model";
import { SupplierCreateRequest, SupplierUpdateRequest } from "model/core/supplier.model";
import { PageResponse } from "model/base/base-metadata.response";
import { SupplierResponse } from "model/core/supplier.model";

export const SupplierSearchAction = (query: SupplierQuery, searchSupplierCallback: (response: PageResponse<SupplierResponse>) => void) => {
  return BaseAction(SupplierType.SEARCH_SUPPLIER_REQUEST, {query, searchSupplierCallback});
}

export const SupplierGetAllAction = (setData: (response: Array<SupplierResponse>) => void) => {
  return BaseAction(SupplierType.GET_ALL_SUPPLIER_REQUEST, {setData});
}

export const SupplierCreateAction = (request: SupplierCreateRequest, setData: () => void) => {
  return BaseAction(SupplierType.CREATE_SUPPLIER_REQUEST, {request, setData});
}

export const SupplierUpdateAction = (id: number, request: SupplierUpdateRequest, setData: (response: SupplierResponse|false) => void) => {
  return BaseAction(SupplierType.EDIT_SUPPLIER_REQUEST, {id, request, setData});
}

export const SupplierDetailAction = (id: number, setData: (response: SupplierResponse|false) => void) => {
  return BaseAction(SupplierType.DETAIL_SUPPLIER_REQUEST, {id, setData});
}
export const SupplierDeleteAction = (id: number, deleteCallback: (result: any|null) => void) => {
  return BaseAction(SupplierType.DELETE_SUPPLIER_REQUEST, {id, deleteCallback});
}