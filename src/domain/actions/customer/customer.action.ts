import { CustomerSearchQuery } from 'model/query/customer.query';
import BaseAction from 'base/BaseAction';
import { CustomerType } from 'domain/types/customer.type';
import { CustomerResponse } from 'model/response/customer/customer.response';
//import { CustomerRequest, CustomerUpdateRequest } from 'model/request/customer.request';

export const CustomerSearch = (query: CustomerSearchQuery, setData: (data: Array<CustomerResponse>) => void) => {
    return BaseAction(CustomerType.KEY_SEARCH_CUSTOMER_CHANGE, { query, setData });
}

export const CustomerList = (query: CustomerSearchQuery, setData: (data: any) => void) => {
    return BaseAction(CustomerType.CUSTOMER_LIST, { query, setData });
}

export const CustomerDetail = (id: number|null, setData: (data: CustomerResponse) => void) => {
    return BaseAction(CustomerType.CUSTOMER_DETAIL, { id, setData });
}

export const CustomerGroups = (setData: (data: any) => void) => {
    return BaseAction(CustomerType.CUSTOMER_GROUPS, { setData });
}

export const CustomerLevels = (setData: (data: any) => void) => {
    return BaseAction(CustomerType.CUSTOMER_LEVELS, { setData });
}

export const CustomerTypes = (setData: (data: any) => void) => {
    return BaseAction(CustomerType.CUSTOMER_TYPES, { setData });
}

export const CreateCustomer= (customer: any, setResult: (data: any) => void) => {
    return BaseAction(CustomerType.CREATE_CUSTOMER, { customer, setResult });
}

export const UpdateCustomer = (id: number, customer:any, setResult: (data: any) => void) => {
    return BaseAction(CustomerType.UPDATE_CUSTOMER, { id, customer, setResult });
}

export const CreateShippingAddress = (customerId:number, address: any, setResult: (data: any) => void) => {
    return BaseAction(CustomerType.CREATE_SHIPPING_ADDR, { customerId, address, setResult });
}

export const UpdateShippingAddress = (id: number,customerId:number, address: any, setResult: (data: any) => void) => {
    return BaseAction(CustomerType.UPDATE_SHIPPING_ADDR, { id, customerId, address, setResult });
}

export const CreateBillingAddress = (customerId:number, address: any, setResult: (data: any) => void) => {
    return BaseAction(CustomerType.CREATE_BILLING_ADDR, { customerId, address, setResult });
}

export const UpdateBillingAddress = (id: number,customerId:number, address: any, setResult: (data: any) => void) => {
    return BaseAction(CustomerType.UPDATE_BILLING_ADDR, { id, customerId, address, setResult });
}

export const CreateContact = (customerId:number, contact: any, setResult: (data: any) => void) => {
    return BaseAction(CustomerType.CREATE_CONTACT, { customerId, contact, setResult });
}

export const UpdateContact = (id: number,customerId:number, contact: any, setResult: (data: any) => void) => {
    return BaseAction(CustomerType.UPDATE_CONTACT, { id, customerId, contact, setResult });
}

export const DeleteContact = (id: number,customerId:number, setResult: (data: any) => void) => {
    return BaseAction(CustomerType.DELETE_CONTACT, { id, customerId, setResult });
}

export const DeleteShippingAddress = (id: number,customerId:number, setResult: (data: any) => void) => {
    return BaseAction(CustomerType.DELETE_SHIPPING_ADDR, { id, customerId, setResult });
}

export const DeleteBillingAddress = (id: number,customerId:number, setResult: (data: any) => void) => {
    return BaseAction(CustomerType.DELETE_BILLING_ADDR, { id, customerId, setResult });
}

