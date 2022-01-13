import { CustomerSearchQuery, FpageCustomerSearchQuery } from 'model/query/customer.query';
import BaseAction from 'base/base.action';
import { CustomerType } from 'domain/types/customer.type';
import { CustomerResponse } from 'model/response/customer/customer.response';
import {
    CustomerGroupModel,
    CustomerGroupResponseModel,
  } from "model/response/customer/customer-group.response";
//import { CustomerRequest, CustomerUpdateRequest } from 'model/request/customer.request';

export const CustomerSearchSo = (query: CustomerSearchQuery, setData: (data: Array<CustomerResponse>) => void) => {
  return BaseAction(CustomerType.KEY_SEARCH_CUSTOMER_CHANGE_SO, { query, setData });
}

export const CustomerSearch = (query: CustomerSearchQuery, setData: (data: Array<CustomerResponse>) => void) => {
    return BaseAction(CustomerType.KEY_SEARCH_CUSTOMER_CHANGE, { query, setData });
}

export const CustomerSearchByPhone = (query: FpageCustomerSearchQuery, setData: (data: CustomerResponse) => void) => {
  return BaseAction(CustomerType.CUSTOMER_SEARCH_BY_PHONE, { query, setData });
}

export const getCustomerListAction = (query: CustomerSearchQuery, setData: (data: any) => void) => {
    return BaseAction(CustomerType.CUSTOMER_LIST, { query, setData });
}

export const CustomerGroupList = (query: CustomerSearchQuery, setData: (data: any) => void) => {
    return BaseAction(CustomerType.CUSTOMER_LIST, { query, setData });
}

export const actionAddCustomerGroup = (
    item: CustomerGroupModel,
    handleData: () => void
  ) => {
    return {
      type: CustomerType.CUSTOMER_GROUP_CREATE,
      payload: {
        item,
        handleData,
      },
    };
  };

  export const actionDeleteCustomerGroup = (
    id: number,
    handleData: () => void
  ) => {
    return {
      type: CustomerType.CUSTOMER_GROUP_DELETE,
      payload: {
        id,
        handleData,
      },
    };
  };

  export const actionEditCustomerGroup = (
    id: number,
    item: CustomerGroupModel,
    handleData: () => void
  ) => {
    return {
      type: CustomerType.CUSTOMER_GROUP_EDIT,
      payload: {
        id,
        item,
        handleData,
      },
    };
  };

  export const actionFetchListCustomerGroup = (
    params = {},
    handleData: (data: CustomerGroupResponseModel) => void
  ) => {
    console.log(2)
    return {
      type: CustomerType.CUSTOMER_GROUP_SEARCH,
      payload: {
        params,
        handleData,
      },
    };
  };

export const getCustomerDetailAction = (id: number|null, setData: (data: CustomerResponse) => void) => {
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

export const CreateCustomer= (request: any, setResult: (data: any) => void) => {
    return BaseAction(CustomerType.CREATE_CUSTOMER, { request, setResult });
}

export const UpdateCustomer = (id: number, request:any, setResult: (data: any) => void) => {
    return BaseAction(CustomerType.UPDATE_CUSTOMER, { id, request, setResult });
}

export const CreateShippingAddress = (customerId:number, address: any, setResult: (data: any) => void) => {
    return BaseAction(CustomerType.CREATE_SHIPPING_ADDR, { customerId, address, setResult });
}

export const CreateNote = (customerId:number, note: any, setResult: (data: any) => void) => {
  return BaseAction(CustomerType.CREATE_NOTE, { customerId, note, setResult });
}

export const UpdateShippingAddress = (id: number,customerId:number, address: any, setResult: (data: any) => void) => {
    return BaseAction(CustomerType.UPDATE_SHIPPING_ADDR, { id, customerId, address, setResult });
}

export const UpdateNote = (id: number,customerId:number, note: any, setResult: (data: any) => void) => {
  return BaseAction(CustomerType.UPDATE_NOTE, { id, customerId, note, setResult });
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

export const DeleteNote = (id: number,customerId:number, setResult: (data: any) => void) => {
  return BaseAction(CustomerType.DELETE_NOTE, { id, customerId, setResult });
}

export const CustomerCreateAction = (
  request: any,
  setResult: (data: CustomerResponse) => void
) => {
  return BaseAction(CustomerType.CREATE_CUSTOMER, { request, setResult });
};

export const CustomerUpdateAction = (
  id: number,
  request: any,
  setResult: (data: CustomerResponse) => void
) => {
  return BaseAction(CustomerType.UPDATE_CUSTOMER, { id, request, setResult });
};

export const importCustomerAction = (file: File | undefined, callback: (data: any) => void) => {
  return BaseAction(CustomerType.IMPORT_CUSTOMER, { file, callback });
}
