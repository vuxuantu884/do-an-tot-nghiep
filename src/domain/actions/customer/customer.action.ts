import {
  CustomerSearchQuery,
  FpageCustomerSearchQuery,
  ImportCustomerQuery,
} from "model/query/customer.query";
import BaseAction from "base/base.action";
import { CustomerType } from "domain/types/customer.type";
import { CustomerResponse } from "model/response/customer/customer.response";
import {
  CustomerGroupModel,
  CustomerGroupResponseModel,
} from "model/response/customer/customer-group.response";
//import { CustomerRequest, CustomerUpdateRequest } from 'model/request/customer.request';

export const CustomerSearchSo = (
  query: CustomerSearchQuery,
  setData: (data: Array<CustomerResponse>) => void,
) => {
  return BaseAction(CustomerType.KEY_SEARCH_CUSTOMER_CHANGE_SO, {
    query,
    setData,
  });
};

export const CustomerSearch = (
  query: CustomerSearchQuery,
  setData: (data: Array<CustomerResponse>) => void,
) => {
  return BaseAction(CustomerType.KEY_SEARCH_CUSTOMER_CHANGE, {
    query,
    setData,
  });
};

export const CustomerSearchByPhone = (
  query: FpageCustomerSearchQuery,
  setData: (data: CustomerResponse) => void,
) => {
  return BaseAction(CustomerType.CUSTOMER_SEARCH_BY_PHONE, { query, setData });
};

export const getCustomerListAction = (query: CustomerSearchQuery, setData: (data: any) => void) => {
  return BaseAction(CustomerType.CUSTOMER_LIST, { query, setData });
};

export const actionAddCustomerGroup = (item: CustomerGroupModel, handleData: () => void) => {
  return {
    type: CustomerType.CUSTOMER_GROUP_CREATE,
    payload: {
      item,
      handleData,
    },
  };
};

export const actionDeleteCustomerGroup = (id: number, handleData: () => void) => {
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
  handleData: () => void,
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
  handleData: (data: CustomerGroupResponseModel) => void,
) => {
  console.log(2);
  return {
    type: CustomerType.CUSTOMER_GROUP_SEARCH,
    payload: {
      params,
      handleData,
    },
  };
};

// get customer detail action
export const getCustomerDetailAction = (
  id: number | null | string,
  setData: (data: CustomerResponse) => void,
) => {
  let customer_id: number;
  const customerIdString = id?.toString().toUpperCase();
  if (customerIdString?.includes("CU")) {
    customer_id = Number(customerIdString.replace("CU", ""));
  } else {
    customer_id = Number(customerIdString);
  }
  return BaseAction(CustomerType.CUSTOMER_DETAIL, { id: customer_id, setData });
};

// get customer's order history
export const getCustomerOrderHistoryAction = (queryParams: any, callback: (data: any) => void) => {
  return BaseAction(CustomerType.CUSTOMER_ORDER_HISTORY, {
    queryParams,
    callback,
  });
};

// get customer's order return history
export const getCustomerOrderReturnHistoryAction = (
  customer_id: number | null,
  callback: (data: any) => void,
) => {
  return BaseAction(CustomerType.CUSTOMER_ORDER_RETURN_HISTORY, {
    customer_id,
    callback,
  });
};

// get customer's Activity Log
export const getCustomerActivityLogAction = (queryParams: any, callback: (data: any) => void) => {
  return BaseAction(CustomerType.CUSTOMER_ACTIVITY_LOG, {
    queryParams,
    callback,
  });
};

// get customer's Activity Log detail
export const getCustomerActivityLogDetailAction = (
  log_id: number,
  callback: (data: any) => void,
) => {
  return BaseAction(CustomerType.CUSTOMER_ACTIVITY_LOG_DETAIL, {
    log_id,
    callback,
  });
};

export const CustomerGroups = (setData: (data: any) => void) => {
  return BaseAction(CustomerType.CUSTOMER_GROUPS, { setData });
};

export const CustomerLevels = (setData: (data: any) => void) => {
  return BaseAction(CustomerType.CUSTOMER_LEVELS, { setData });
};

export const CustomerTypes = (setData: (data: any) => void) => {
  return BaseAction(CustomerType.CUSTOMER_TYPES, { setData });
};

export const CreateCustomer = (request: any, setResult: (data: any) => void) => {
  return BaseAction(CustomerType.CREATE_CUSTOMER, { request, setResult });
};

export const UpdateCustomer = (id: number, request: any, setResult: (data: any) => void) => {
  return BaseAction(CustomerType.UPDATE_CUSTOMER, { id, request, setResult });
};

export const CreateShippingAddress = (
  customerId: number,
  address: any,
  setResult: (data: any) => void,
) => {
  return BaseAction(CustomerType.CREATE_SHIPPING_ADDR, {
    customerId,
    address,
    setResult,
  });
};

export const CreateNote = (customerId: number, note: any, setResult: (data: any) => void) => {
  return BaseAction(CustomerType.CREATE_NOTE, { customerId, note, setResult });
};

export const UpdateShippingAddress = (
  id: number,
  customerId: number,
  address: any,
  setResult: (data: any) => void,
) => {
  return BaseAction(CustomerType.UPDATE_SHIPPING_ADDR, {
    id,
    customerId,
    address,
    setResult,
  });
};

export const UpdateNote = (
  id: number,
  customerId: number,
  note: any,
  setResult: (data: any) => void,
) => {
  return BaseAction(CustomerType.UPDATE_NOTE, {
    id,
    customerId,
    note,
    setResult,
  });
};

export const CreateBillingAddress = (
  customerId: number,
  address: any,
  setResult: (data: any) => void,
) => {
  return BaseAction(CustomerType.CREATE_BILLING_ADDR, {
    customerId,
    address,
    setResult,
  });
};

export const UpdateBillingAddress = (
  id: number,
  customerId: number,
  address: any,
  setResult: (data: any) => void,
) => {
  return BaseAction(CustomerType.UPDATE_BILLING_ADDR, {
    id,
    customerId,
    address,
    setResult,
  });
};

export const CreateContact = (customerId: number, contact: any, setResult: (data: any) => void) => {
  return BaseAction(CustomerType.CREATE_CONTACT, {
    customerId,
    contact,
    setResult,
  });
};

export const UpdateContact = (
  id: number,
  customerId: number,
  contact: any,
  setResult: (data: any) => void,
) => {
  return BaseAction(CustomerType.UPDATE_CONTACT, {
    id,
    customerId,
    contact,
    setResult,
  });
};

export const DeleteContact = (id: number, customerId: number, setResult: (data: any) => void) => {
  return BaseAction(CustomerType.DELETE_CONTACT, { id, customerId, setResult });
};

export const DeleteShippingAddress = (
  id: number,
  customerId: number,
  setResult: (data: any) => void,
) => {
  return BaseAction(CustomerType.DELETE_SHIPPING_ADDR, {
    id,
    customerId,
    setResult,
  });
};

export const DeleteBillingAddress = (
  id: number,
  customerId: number,
  setResult: (data: any) => void,
) => {
  return BaseAction(CustomerType.DELETE_BILLING_ADDR, {
    id,
    customerId,
    setResult,
  });
};

export const DeleteNote = (id: number, customerId: number, setResult: (data: any) => void) => {
  return BaseAction(CustomerType.DELETE_NOTE, { id, customerId, setResult });
};

export const CustomerCreateAction = (request: any, setResult: (data: CustomerResponse) => void) => {
  return BaseAction(CustomerType.CREATE_CUSTOMER, { request, setResult });
};

export const CustomerUpdateAction = (
  id: number,
  request: any,
  setResult: (data: CustomerResponse) => void,
) => {
  return BaseAction(CustomerType.UPDATE_CUSTOMER, { id, request, setResult });
};

export const importCustomerAction = (
  queryParams: ImportCustomerQuery,
  callback: (data: any) => void,
) => {
  return BaseAction(CustomerType.IMPORT_CUSTOMER, { queryParams, callback });
};

/** family info */
export const createFamilyMemberAction = (customerId: number, memberInfo: any, callback: (data: any) => void) => {
  return BaseAction(CustomerType.CREATE_FAMILY_MEMBER, {
    customerId,
    memberInfo,
    callback,
  });
};

export const updateFamilyMemberAction = (
  id: number,
  customerId: number,
  memberInfo: any,
  callback: (data: any) => void,
) => {
  return BaseAction(CustomerType.UPDATE_FAMILY_MEMBER, {
    id,
    customerId,
    memberInfo,
    callback,
  });
};

export const deleteFamilyMemberAction = (
  id: number,
  customerId: number,
  callback: (data: any) => void,
) => {
  return BaseAction(CustomerType.DELETE_FAMILY_MEMBER, {
    id,
    customerId,
    callback
  });
};
/** end family info */
