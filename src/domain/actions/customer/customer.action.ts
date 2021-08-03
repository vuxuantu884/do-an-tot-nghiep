import { CustomerSearchQuery } from 'model/query/customer.query';
import BaseAction from 'base/BaseAction';
import { CustomerType } from 'domain/types/customer.type';
import { CustomerResponse } from 'model/response/customer/customer.response';
import { CustomerRequest, CustomerUpdateRequest } from 'model/request/customer.request';

export const CustomerSearch = (query: CustomerSearchQuery, setData: (data: Array<CustomerResponse>) => void) => {
    return BaseAction(CustomerType.KEY_SEARCH_CUSTOMER_CHANGE, { query, setData: setData });
}

export const CustomerList = (query: CustomerSearchQuery, setData: (data: Array<CustomerResponse>) => void) => {
    return BaseAction(CustomerType.CUSTOMER_LIST, { query, setData: setData });
}

export const CustomerDetail = (id: number|null, setData: (data: CustomerResponse) => void) => {
    return BaseAction(CustomerType.CUSTOMER_DETAIL, { id, setData: setData });
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

export const CreateCustomer= (customer: CustomerRequest, setData: (data: any) => void) => {
    return BaseAction(CustomerType.CREATE_CUSTOMER, { customer, setData });
}

export const UpdateCustomer = (id: number, customer:CustomerUpdateRequest, setData: (data: any) => void) => {
    return BaseAction(CustomerType.UPDATE_CUSTOMER, { id, customer, setData });
}

