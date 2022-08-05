import { ApiConfig } from "config/api.config";
import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { HandoverNoteRequest, HandoverRequest } from "model/handover/handover.request";
import { HandoverResponse } from "model/handover/handover.response";
import { PageResponse } from "model/base/base-metadata.response";
import { HandoverSearchRequest } from "model/handover/handover.search";
import { generateQuery } from "utils/AppUtils";

const createHandoverService = (
  request: HandoverRequest,
): Promise<BaseResponse<HandoverResponse>> => {
  return BaseAxios.post(`${ApiConfig.HANDOVER}/handovers`, request);
};

const validateHandoverService = (
  code: string,
  type: string,
  id: number | null,
): Promise<BaseResponse<any>> => {
  let queryPath = `type=${type}`;
  if (id != null) {
    queryPath = `${queryPath}&id=${id}`;
  }
  return BaseAxios.get(`${ApiConfig.HANDOVER}/handovers/validate/${code}?${queryPath}`);
};

const searchHandoverService = (
  request: HandoverSearchRequest,
): Promise<BaseResponse<PageResponse<HandoverResponse>>> => {
  let queryPath = generateQuery(request);
  return BaseAxios.get(`${ApiConfig.HANDOVER}/handovers?${queryPath}`);
};

const updateNoteHandoverService = (
  id: number,
  request: HandoverNoteRequest,
): Promise<BaseResponse<HandoverResponse>> => {
  return BaseAxios.put(`${ApiConfig.HANDOVER}/handovers/${id}/note`, request);
};

const getHandoverService = (id: number): Promise<BaseResponse<HandoverResponse>> => {
  return BaseAxios.get(`${ApiConfig.HANDOVER}/handovers/${id}`);
};

const updateHandoverService = (
  id: number,
  request: HandoverRequest,
): Promise<BaseResponse<HandoverResponse>> => {
  return BaseAxios.put(`${ApiConfig.HANDOVER}/handovers/${id}`, request);
};

const deleteHandoverService = (id: string): Promise<BaseResponse<HandoverResponse>> => {
  return BaseAxios.delete(`${ApiConfig.HANDOVER}/handovers/${id}`);
};

const deleteOrderHandoverService = (
  id: number,
  fulfillment_codes: Array<string>,
): Promise<BaseResponse<HandoverResponse>> => {
  return BaseAxios.delete(
    `${ApiConfig.HANDOVER}/handovers/${id}/orders?fulfillment_codes=${fulfillment_codes.join(",")}`,
  );
};

const printHandOverService = (
  ids: number[] | number,
  type: "simple" | "detail" | string,
): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.HANDOVER}/handovers/print_forms?ids=${ids}&type=${type}`);
};

export {
  createHandoverService,
  validateHandoverService,
  searchHandoverService,
  getHandoverService,
  deleteOrderHandoverService,
  updateNoteHandoverService,
  updateHandoverService,
  deleteHandoverService,
  printHandOverService,
};
