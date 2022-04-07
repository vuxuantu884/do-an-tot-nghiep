import { CustomerNote, CustomerRequest } from '../../model/request/customer.request';
import {CustomerResponse, ExportCustomerResponse} from 'model/response/customer/customer.response';
import { PageResponse } from 'model/base/base-metadata.response';
import { generateQuery } from 'utils/AppUtils';
import { CustomerSearchQuery } from 'model/query/customer.query';
import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { CustomerBillingAddress, CustomerContact, CustomerShippingAddress } from 'model/request/customer.request';
import {ExportRequest, ExportResponse} from "model/other/files/export-model";

export const getCustomers = (query : CustomerSearchQuery): Promise<BaseResponse<PageResponse<CustomerResponse>>> => {
  let params = generateQuery(query);
  let link = `${ApiConfig.CUSTOMER}/customers?${params}`;
  return BaseAxios.get(link);
};

//customer export file
export const exportCustomerFile = (
  params: ExportRequest
): Promise<BaseResponse<ExportResponse>> => {
  return BaseAxios.post(`${ApiConfig.CUSTOMER}/customers/export`, params);
};

// export jobs
export const getCustomerFile = (
  code: string
): Promise<BaseResponse<ExportCustomerResponse>> => {
  return BaseAxios.get(`${ApiConfig.CUSTOMER}/jobs/${code}`);
};

export const getCustomersSo = (query : CustomerSearchQuery): Promise<BaseResponse<CustomerResponse>> => {
  let params = generateQuery(query);
  let link = `${ApiConfig.CUSTOMER}/customers?${params}`;
  return BaseAxios.get(link);
};

// get customer detail
export const getDetailCustomer = (id: number): Promise<BaseResponse<CustomerResponse>> => {
  let link = `${ApiConfig.CUSTOMER}/customers/${id}`;
  return BaseAxios.get(link);
};

// get custommer's order history
export const getCustomerOrderHistoryApi = (queryParams: any): Promise<BaseResponse<any>> => {
  const query = {
    limit: queryParams.limit,
    page: queryParams.page,
    variant_ids: queryParams.variant_ids,
    customer_id: null,
  }
  const params = generateQuery(query);
  const link = `${ApiConfig.CUSTOMER}/customers/${queryParams.customer_id}/order-histories?${params}`;
  return BaseAxios.get(link);
};

// get custommer's order return history
export const getCustomerOrderReturnHistoryApi = (customer_id: number): Promise<BaseResponse<any>> => {
  let link = `${ApiConfig.CUSTOMER}/customers/${customer_id}/order-return-histories`;
  return BaseAxios.get(link);
};

// get custommer's activity log
export const getCustomerActivityLogApi = (queryParams: any): Promise<BaseResponse<any>> => {
  const query = {
    limit: queryParams.limit,
    page: queryParams.page,
  }
  const params = generateQuery(query);
  const link = `${ApiConfig.CUSTOMER}/customers/${queryParams.customer_id}/logs?${params}`;
  return BaseAxios.get(link);
};

// get custommer's activity log detail
export const getCustomerActivityLogDetailApi = (log_id: number): Promise<BaseResponse<any>> => {
  const link = `${ApiConfig.CUSTOMER}/customers/logs/${log_id}`;
  return BaseAxios.get(link);
};

export const getCustomerTypes = (): Promise<BaseResponse<any>> => {
  let link = `${ApiConfig.CUSTOMER}/customer-types`;
  return BaseAxios.get(link);
};

export const getCustomerGroups = (): Promise<BaseResponse<any>> => {
  let link = `${ApiConfig.CUSTOMER}/customer-groups`;
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

export const createNote = (customerId: number, note: CustomerNote): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.CUSTOMER}/customers/${customerId}/notes`;
  return BaseAxios.post(url, note);
};

export const updateShippingAddress = (id: number, customerId: number, address: CustomerShippingAddress): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.CUSTOMER}/customers/${customerId}/shipping-address/${id}`;
  return BaseAxios.put(url, address);
};

export const updateNote = (id: number, customerId: number, note: CustomerNote): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.CUSTOMER}/customers/${customerId}/notes/${id}`;
  return BaseAxios.put(url, note);
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

export const updateCustomer = (id: number,request: CustomerRequest): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.CUSTOMER}/customers/${id}`;
  return BaseAxios.put(url, request);
};

export const deleteContact = (id: number, customerId: number): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.CUSTOMER}/customers/${customerId}/contacts/${id}`;
  return BaseAxios.delete(url);
};

export const deleteShippingAddress = (id: number, customerId: number): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.CUSTOMER}/customers/${customerId}/shipping-address/${id}`;
  return BaseAxios.delete(url);
};

export const deleteNote = (id: number, customerId: number): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.CUSTOMER}/customers/${customerId}/notes/${id}`;
  return BaseAxios.delete(url);
};

export const deleteBillingAddress = (id: number, customerId: number): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.CUSTOMER}/customers/${customerId}/billing-address/${id}`;
  return BaseAxios.delete(url);
};

export const importCustomerService = (file: File) => {
  let formData = new FormData();
  formData.append("file_upload", file);
  return BaseAxios.post(`${ApiConfig.CUSTOMER}/customers/import`, formData, {
    headers: { "content-type": "multipart/form-data" },
  });
}

//get progress import customer
export const getProgressImportCustomerApi = (
    process_code: any
): Promise<BaseResponse<any>> => {
  const requestUrl = `${ApiConfig.CUSTOMER}/jobs/${process_code}`;
  return BaseAxios.get(requestUrl);
};
