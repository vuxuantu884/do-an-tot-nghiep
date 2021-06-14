import BaseAction from "base/BaseAction";
import { SupplierType } from "domain/types/core.type";
import { SupplierQuery } from "model/core/supplier.model";
import { SupplierCreateRequest, SupplierUpdateRequest } from "model/core/supplier.model";
import { PageResponse } from "model/base/base-metadata.response";
import { SupplierResponse } from "model/core/supplier.model";

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