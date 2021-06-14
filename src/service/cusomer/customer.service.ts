import { CustomerResponse } from 'model/response/customer/customer.response';
import { PageResponse } from 'model/base/base-metadata.response';
import { generateQuery } from 'utils/AppUtils';
import { CustomerSearchQuery } from 'model/query/customer.query';
import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";

export const getCustomers = (query : CustomerSearchQuery): Promise<BaseResponse<PageResponse<CustomerResponse>>> => {
  let params = generateQuery(query);
  let link = `${ApiConfig.CUSTOMER}/customers?${params}`;
  return BaseAxios.get(link);
};