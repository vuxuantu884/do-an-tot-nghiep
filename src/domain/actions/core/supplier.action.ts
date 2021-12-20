import BaseAction from "base/base.action";
import { SupplierType } from "domain/types/core.type";
import { SupplierAddress, SupplierQuery } from "model/core/supplier.model";
import { SupplierCreateRequest, SupplierUpdateRequest , SupplierPayment, SupplierContact} from "model/core/supplier.model";
import { PageResponse } from "model/base/base-metadata.response";
import { SupplierResponse } from "model/core/supplier.model";

export const SupplierSearchAction = (query: SupplierQuery, searchSupplierCallback: (response: PageResponse<SupplierResponse>) => void) => {
  return BaseAction(SupplierType.SEARCH_SUPPLIER_REQUEST, {query, searchSupplierCallback});
}

export const SupplierGetAllAction = (setData: (response: Array<SupplierResponse>) => void) => {
  return BaseAction(SupplierType.GET_ALL_SUPPLIER_REQUEST, {setData});
}

export const SupplierCreateAction = (request: SupplierCreateRequest, setData: (result:SupplierResponse) => void) => {
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

export const SupplierCreateAddressAction = (id: number, request: SupplierAddress, callback : (result: SupplierResponse|null) => void) => {
  return BaseAction(SupplierType.CREATE_ADDRESS_SUPPLIER_REQUEST, {id, request, callback});
}

export const SupplierUpdateAddressAction = (id: number, addressId: number, request: SupplierAddress, callback : (result: SupplierResponse|null) => void) => {
  return BaseAction(SupplierType.UPDATE_ADDRESS_SUPPLIER_REQUEST, {id, addressId, request, callback});
}

export const SupplierDeleteAddressAction = (id: number, addressId: number, callback : (result: SupplierResponse|null) => void) => {
  return BaseAction(SupplierType.DELETE_ADDRESS_SUPPLIER_REQUEST, {id, addressId, callback});
}

export const SupplierCreateContactAction = (id: number, request: SupplierContact, callback : (result: SupplierResponse|null) => void) => {
  return BaseAction(SupplierType.CREATE_CONTACT_SUPPLIER_REQUEST, {id, request, callback});
}

export const SupplierUpdateContactAction = (id: number, contactId: number, request: SupplierContact, callback : (result: SupplierResponse|null) => void) => {
  return BaseAction(SupplierType.UPDATE_CONTACT_SUPPLIER_REQUEST, {id, contactId, request, callback});
}

export const SupplierDeleteContactAction = (id: number, contactId: number, callback : (result: SupplierResponse|null) => void) => {
  return BaseAction(SupplierType.DELETE_CONTACT_SUPPLIER_REQUEST, {id, contactId, callback});
}

export const SupplierCreatePaymentAction = (id: number, request: SupplierPayment, callback : (result: SupplierResponse|null) => void) => {
  return BaseAction(SupplierType.CREATE_PAYMENT_SUPPLIER_REQUEST, {id, request, callback});
}

export const SupplierUpdatePaymentAction = (id: number, paymentId: number, request: SupplierPayment, callback : (result: SupplierResponse|null) => void) => {
  return BaseAction(SupplierType.UPDATE_PAYMENT_SUPPLIER_REQUEST, {id, paymentId, request, callback});
}

export const SupplierDeletePaymentAction = (id: number, paymentId: number, callback : (result: SupplierResponse|null) => void) => {
  return BaseAction(SupplierType.DELETE_PAYMENT_SUPPLIER_REQUEST, {id, paymentId, callback});
}
