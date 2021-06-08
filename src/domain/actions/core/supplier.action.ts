import BaseAction from "base/BaseAction";
import { SupplierType } from "domain/types/core.type";
import { SupplierQuery } from "model/query/supplier.query";
import { SupplierCreateRequest, SupplierUpdateRequest } from "model/request/create-supplier.request";
import { PageResponse } from "model/response/base-metadata.response";
import { SupplierResponse } from "model/response/supplier/supplier.response";

const supplierSearchAction = (query: SupplierQuery, setData: (response: PageResponse<SupplierResponse>) => void) => {
  return BaseAction(SupplierType.SEARCH_SUPPLIER_REQUEST, {query, setData});
}

export const supplierGetAllAction = (setData: (response: Array<SupplierResponse>) => void) => {
  return BaseAction(SupplierType.GET_ALL_SUPPLIER_REQUEST, {setData});
}

const supplierCreateAction = (request: SupplierCreateRequest, setData: () => void) => {
  return BaseAction(SupplierType.CREATE_SUPPLIER_REQUEST, {request, setData});
}

const supplierUpdateAction = (request: SupplierUpdateRequest, setData: (response: SupplierResponse) => void) => {
  return BaseAction(SupplierType.EDIT_SUPPLIER_REQUEST, {request, setData});
}

const SupplierAction = {
  supplierSearchAction, 
  supplierCreateAction,
  supplierUpdateAction,
}

export default SupplierAction;