import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { PageResponse } from "model/base/base-metadata.response";
import {
  CreateWarrantyCenterParamsModel,
  CreateWarrantyProductStatusModel,
  CreateWarrantyReasonParamsModel,
  DeleteWarrantiesParamModel,
  GetWarrantiesParamModel,
  GetWarrantyCentersParamModel,
  GetWarrantyProductStatusesParamModel,
  GetWarrantyReasonsParamModel,
  UpdateWarrantyProductStatusModel,
  UpdateWarrantyReasonParamsModel,
  WarrantiesUpdateDetailStatusModel,
  WarrantyItemModel,
  WarrantyReasonModel,
  WarrantyReasonStatusModel,
} from "model/warranty/warranty.model";
import { generateQuery } from "utils/AppUtils";

export const getWarrantiesService = (
  query?: GetWarrantiesParamModel,
): Promise<BaseResponse<PageResponse<WarrantyItemModel>>> => {
  const params = generateQuery(query).replaceAll("%2C", ",");
  return BaseAxios.get(`${ApiConfig.WARRANTY}/cards?${params}`);
};

export const getWarrantyDetailService = (
  id: number,
): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.WARRANTY}/cards/${id}`);
};

export const createWarrantyService = (
  body: any,
): Promise<BaseResponse<any>> => {
  return BaseAxios.post(`${ApiConfig.WARRANTY}/warranties`, body);
};

// lý do bảo hành
export const getWarrantyReasonsService = (
  query?: GetWarrantyReasonsParamModel,
): Promise<BaseResponse<PageResponse<WarrantyReasonModel>>> => {
  const params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.WARRANTY}/warranties/reasons?${params}`);
};

export const updateWarrantyService = (
  id: string,
  body: WarrantyItemModel,
): Promise<BaseResponse<any>> => {
  return BaseAxios.put(`${ApiConfig.WARRANTY}/warranties/${id}`, body);
};

export const updateWarrantyDetailNoteService = (
  warrantyItemId: number,
  warrantyId: number,
  note: string,
): Promise<BaseResponse<any>> => {
  return BaseAxios.put(
    `${ApiConfig.WARRANTY}/warranties/${warrantyItemId}/update/${warrantyId}/note`,
    {
      note,
    },
  );
};

export const updateWarrantyDetailStatusService = (
  warrantyItemId: number,
  warrantyId: number,
  params: WarrantiesUpdateDetailStatusModel,
): Promise<BaseResponse<any>> => {
  return BaseAxios.put(
    `${ApiConfig.WARRANTY}/warranties/${warrantyItemId}/fix/${warrantyId}/status`,
    params,
  );
};

export const getWarrantyCentersService = (
  query?: GetWarrantyCentersParamModel,
): Promise<BaseResponse<PageResponse<any>>> => {
  const params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.WARRANTY}//warranties/centers?${params}`);
};

export const sendToWarrantyCentersService = (
  warrantyId: number,
  warrantyItemId: number,
  params: {
    warranty_center_id: number;
  },
): Promise<BaseResponse<any>> => {
  return BaseAxios.put(
    `${ApiConfig.WARRANTY}/warranties/${warrantyId}/fix/${warrantyItemId}`,
    params,
  );
};

export const updateWarrantyDetailFeeService = (
  warrantyId: number,
  warrantyItemId: number,
  params: {
    price?: number;
    customer_fee?: number;
  },
): Promise<BaseResponse<any>> => {
  return BaseAxios.put(
    `${ApiConfig.WARRANTY}/warranties/${warrantyId}/update/${warrantyItemId}/fee`,
    params,
  );
};

export const deleteWarrantiesService = (
  request: DeleteWarrantiesParamModel,
): Promise<BaseResponse<any>> => {
  return BaseAxios.delete(`${ApiConfig.WARRANTY}/cards`, { data: request });
};

export const createWarrantyCenterService = (
  request: CreateWarrantyCenterParamsModel,
): Promise<BaseResponse<any>> => {
  return BaseAxios.post(`${ApiConfig.WARRANTY}/warranties/centers`, request);
};

export const getWarrantyCenterDetailService = (
  warrantyCenterId: number,
): Promise<BaseResponse<any>> => {
  return BaseAxios.get(
    `${ApiConfig.WARRANTY}/warranties/centers/${warrantyCenterId}`,
  );
};

export const deleteWarrantyCenterService = (
  warrantyCenterId: number,
): Promise<BaseResponse<any>> => {
  return BaseAxios.delete(
    `${ApiConfig.WARRANTY}/warranties/centers/${warrantyCenterId}`,
  );
};

export const updateWarrantyCenterService = (
  warrantyCenterId: number,
  body: CreateWarrantyCenterParamsModel,
): Promise<BaseResponse<any>> => {
  return BaseAxios.put(
    `${ApiConfig.WARRANTY}/warranties/centers/${warrantyCenterId}`,
    body,
  );
};

export const deleteWarrantyCentersService = (
  ids: number[],
): Promise<BaseResponse<any>> => {
  const query = {
    ids,
  };
  const params = generateQuery(query);
  return BaseAxios.delete(`${ApiConfig.WARRANTY}/warranties/centers?${params}`);
};

export const createWarrantyReasonService = (
  request: CreateWarrantyReasonParamsModel,
): Promise<BaseResponse<any>> => {
  return BaseAxios.post(`${ApiConfig.WARRANTY}/warranties/reasons`, request);
};

export const updateWarrantyReasonService = (
  warrantyReasonId: number,
  body: UpdateWarrantyReasonParamsModel,
): Promise<BaseResponse<any>> => {
  return BaseAxios.put(
    `${ApiConfig.WARRANTY}/warranties/reasons/${warrantyReasonId}`,
    body,
  );
};

export const deleteWarrantyReasonService = (
  warrantyReasonId: number,
): Promise<BaseResponse<any>> => {
  return BaseAxios.delete(
    `${ApiConfig.WARRANTY}/warranties/reasons/${warrantyReasonId}`,
  );
};

export const getWarrantyReasonDetailService = (
  warrantyReasonId: number,
): Promise<BaseResponse<any>> => {
  return BaseAxios.get(
    `${ApiConfig.WARRANTY}/warranties/reasons/${warrantyReasonId}`,
  );
};

export const deleteWarrantyReasonsService = (
  ids: number[],
): Promise<BaseResponse<any>> => {
  const query = {
    ids,
  };
  const params = generateQuery(query);
  return BaseAxios.delete(`${ApiConfig.WARRANTY}/warranties/reasons?${params}`);
};

export const updateWarrantyReasonsActiveService = (
  ids: number[],
  status: WarrantyReasonStatusModel,
): Promise<BaseResponse<any>> => {
  const query = {
    ids,
  };
  const body = { status };
  const params = generateQuery(query);
  return BaseAxios.put(
    `${ApiConfig.WARRANTY}/warranties/reasons?${params}`,
    body,
  );
};

// trạng thái sản phẩm

export const getWarrantyProductStatusesService = (
  query?: GetWarrantyProductStatusesParamModel,
): Promise<BaseResponse<PageResponse<any>>> => {
  const params = generateQuery(query);
  return BaseAxios.get(
    `${ApiConfig.WARRANTY}/warranties/product-status?${params}`,
  );
};

export const createProductStatusService = (
  request: CreateWarrantyProductStatusModel,
): Promise<BaseResponse<any>> => {
  return BaseAxios.post(
    `${ApiConfig.WARRANTY}/warranties/product-status`,
    request,
  );
};

export const updateWarrantyProductStatusService = (
  warrantyProductStatusId: number,
  body: UpdateWarrantyProductStatusModel,
): Promise<BaseResponse<any>> => {
  return BaseAxios.put(
    `${ApiConfig.WARRANTY}/warranties/product-status/${warrantyProductStatusId}`,
    body,
  );
};

export const deleteWarrantyProductStatusService = (
  warrantyProductStatusId: number,
): Promise<BaseResponse<any>> => {
  return BaseAxios.delete(
    `${ApiConfig.WARRANTY}/warranties/product-status/${warrantyProductStatusId}`,
  );
};

export const getWarrantyProductStatusService = (
  warrantyProductStatusId: number,
): Promise<BaseResponse<any>> => {
  return BaseAxios.get(
    `${ApiConfig.WARRANTY}/warranties/product-status/${warrantyProductStatusId}`,
  );
};

export const deleteWarrantyProductStatusesService = (
  ids: number[],
): Promise<BaseResponse<any>> => {
  const query = {
    ids,
  };
  const params = generateQuery(query);
  return BaseAxios.delete(
    `${ApiConfig.WARRANTY}/warranties/product-status?${params}`,
  );
};

export const updateWarrantyLineItemService = (
  warrantyItemId: number,
  warrantyId: number,
  query: any,
): Promise<BaseResponse<any>> => {
  return BaseAxios.put(
    `${ApiConfig.WARRANTY}/warranties/${warrantyId}/update/${warrantyItemId}`,
    query,
  );
};

export const getWarrantyCountService = (
  query: string[],
): Promise<BaseResponse<number[]>> => {
  const body = {
    conditions: query,
  };
  return BaseAxios.post(`${ApiConfig.WARRANTY}/cards`, body);
};

export const getPrintFormByWarrantyIdsService = (
  ids: string[],
  type: string,
): Promise<BaseResponse<any>> => {
  const queryParams = {
    ids,
    type,
  };
  const queryString = generateQuery(queryParams);
  return BaseAxios.get(
    `${ApiConfig.WARRANTY}/cards/print_forms?${queryString}`,
  );
};
