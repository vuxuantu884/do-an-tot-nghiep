import { CustomerResponse } from 'model/response/customer/customer.response';
import { PageResponse } from 'model/base/base-metadata.response';
import { generateQuery } from 'utils/AppUtils';
import { CustomerSearchQuery } from 'model/query/customer.query';
import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { CustomerBillingAddress, CustomerContact, CustomerRequest, CustomerShippingAddress } from 'model/request/customer.request';

export const getCustomers = (query : CustomerSearchQuery): Promise<BaseResponse<PageResponse<CustomerResponse>>> => {
  let params = generateQuery(query);
  let link = `${ApiConfig.CUSTOMER}/customers?${params}`;
  return BaseAxios.get(link);
};


export const getDetailCustomer = (id: number): Promise<BaseResponse<CustomerResponse>> => {
  let link = `${ApiConfig.CUSTOMER}/customers/${id}`;
  return BaseAxios.get(link);
};

export const getCustomerTypes = (): Promise<BaseResponse<any>> => {
  let link = `${ApiConfig.CUSTOMER}/customer-types`;
  return BaseAxios.get(link);
};

export const getCustomerGroups = (): Promise<BaseResponse<any>> => {
  let link = `${ApiConfig.CUSTOMER}`;
  return BaseAxios.get(link);
};

export const getCustomerLevels = (): Promise<BaseResponse<any>> => {
  let link = `${ApiConfig.CUSTOMER}/customer-levels`;
  return BaseAxios.get(link);
};

export const createShippingAddress = (customerId: number, address: CustomerShippingAddress): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.CUSTOMER}/customers/${customerId}/shipping-address`;
  return BaseAxios.post(url, address);
};

export const updateShippingAddress = (id: number, customerId: number, address: CustomerShippingAddress): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.CUSTOMER}/customers/${customerId}/shipping-address/${id}`;
  return BaseAxios.put(url, address);
};

export const createBillingAddress = (customerId: number, address: CustomerBillingAddress): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.CUSTOMER}/customers/${customerId}/billing-address`;
  return BaseAxios.post(url, address);
};

export const updateBillingAddress = (id: number, customerId: number, address: CustomerBillingAddress): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.CUSTOMER}/customers/${customerId}/billing-address/${id}`;
  return BaseAxios.put(url, address);
};

export const createContact = (customerId: number, contact: CustomerContact): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.CUSTOMER}/customers/${customerId}/contacts`;
  return BaseAxios.post(url, contact);
};

export const updateContact = (id: number, customerId: number, contact: CustomerContact): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.CUSTOMER}/customers/${customerId}/contacts/${id}`;
  return BaseAxios.put(url, contact);
};

export const createCustomer = (customer: CustomerRequest): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.CUSTOMER}/customers`;
  return BaseAxios.post(url, customer);
};

export const updateCustomer = (id: number,customer: CustomerRequest): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.CUSTOMER}/customer/${id}`;
  return BaseAxios.put(url, customer);
};

export const deleteContact = (id: number, customerId: number): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.CUSTOMER}/customer/${customerId}/contacts/${id}`;
  return BaseAxios.delete(url);
};

export const deleteShippingAddress = (id: number, customerId: number): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.CUSTOMER}/customer/${customerId}/shipping-address/${id}`;
  return BaseAxios.delete(url);
};

export const deleteBillingAddress = (id: number, customerId: number): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.CUSTOMER}/customer/${customerId}/billing-address/${id}`;
  return BaseAxios.delete(url);
};