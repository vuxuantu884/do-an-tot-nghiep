import { CustomerModel } from 'model/other/Customer/CustomerModel';
import { ListDataModel } from './../../model/other/ListDataModel';
import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";

const getCustomers = (page: number, limit: number, search: string): Promise<BaseResponse<ListDataModel<CustomerModel>>> => {
  let link = `${ApiConfig.PRODUCT}/variants?page=${page}&limit=${limit}&info=${search}`;
  return BaseAxios.get(link);
};

const getCustomerByBarcode = (barcode: string): Promise<BaseResponse<CustomerModel>> => {
  let link = `${ApiConfig.PRODUCT}/variants/barcode/${barcode}`;
  return BaseAxios.get(link);
};

export {getCustomers, getCustomerByBarcode};