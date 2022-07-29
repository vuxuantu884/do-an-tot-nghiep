import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { BaseQuery } from "model/base/base.query";
import {
  CustomerGroupModel,
  CustomerGroupResponseModel,
} from "model/response/customer/customer-group.response";
import { generateQuery } from "utils/AppUtils";

/**
 * list Order Processing Status: Xử lý đơn hàng
 */

export const getCustomerGroupService = (
  query: BaseQuery,
): Promise<BaseResponse<CustomerGroupResponseModel>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.CUSTOMER}/customer-groups/listing?${queryString}`);
};

export const createCustomerGroupService = (
  newCustomerGroup: CustomerGroupModel,
): Promise<BaseResponse<CustomerGroupResponseModel>> => {
  return BaseAxios.post(`${ApiConfig.CUSTOMER}/customer-groups`, newCustomerGroup);
};

export const editCustomerGroupService = (
  id: number,
  CustomerGroup: CustomerGroupModel,
): Promise<BaseResponse<CustomerGroupResponseModel>> => {
  return BaseAxios.put(`${ApiConfig.CUSTOMER}/customer-groups/${id}`, CustomerGroup);
};

export const deleteCustomerGroupService = (
  id: number,
): Promise<BaseResponse<CustomerGroupResponseModel>> => {
  return BaseAxios.delete(`${ApiConfig.CUSTOMER}/customer-groups/${id}`);
};
