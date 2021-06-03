import { CustomerModel } from 'model/other/Customer/CustomerModel';
import { ListDataModel } from '../../model/other/ListDataModel';
import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";

const getCustomers = (page: number, limit: number, search: string): Promise<BaseResponse<ListDataModel<CustomerModel>>> => {
  let link = `${ApiConfig.CUSTOMER}/customers?request=${search}&page=${page}&limit=${limit}`;
  return BaseAxios.get(link);
};

export {getCustomers};