import { axiosClientV2 } from "base/base.axios";
import { WorkShiftTableRequest, WorkShiftTableResponse } from "model/work-shift/work-shift.model";
import { generateQuery } from "utils/AppUtils";

export const getByIdWorkShiftTableService = (id: number): Promise<WorkShiftTableResponse> => {
  return axiosClientV2.get(`/admin/v2/work_shift_tables/${id}.json`);
};

export const putWorkShiftTableService = (
  id: number,
  request: WorkShiftTableRequest,
): Promise<WorkShiftTableResponse> => {
  return axiosClientV2.put(`/admin/v2/work_shift_tables/${id}.json`, request);
};

export const deleteWorkShiftTableService = (id: number): Promise<any> => {
  return axiosClientV2.delete(`/admin/v2/work_shift_tables/${id}.json`);
};

export const patchWorkShiftTableService = (
  id: number,
  request: WorkShiftTableRequest,
): Promise<WorkShiftTableResponse> => {
  return axiosClientV2.patch(`/admin/v2/work_shift_tables/${id}.json`, request);
};

export const getWorkShiftTableService = (request: any): Promise<WorkShiftTableResponse> => {
  let params = generateQuery(request);
  return axiosClientV2.get(`/admin/v2/work_shift_tables.json?${params}`);
};

export const postWorkShiftTableService = (
  request: WorkShiftTableRequest,
): Promise<WorkShiftTableResponse> => {
  return axiosClientV2.post(`/admin/v2/work_shift_tables.json`, request);
};

export const getWorkShiftTableCountService = (request: any): Promise<number> => {
  let params = generateQuery(request);
  return axiosClientV2.get(`/admin/v2/work_shift_tables/count.json?${params}`);
};
