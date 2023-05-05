import { axiosClientV2 } from "base/base.axios";
import {
  AddWorkShiftAssignmentRequest,
  DeleteWorkShiftAssignmentRequest,
  SearchStaffActivityManagerLocationParams,
  WorkShiftAssignmentLogRequest,
  WorkShiftCellRequest,
  WorkShiftTableRequest,
  WorkShiftTableResponse,
} from "model/work-shift/work-shift.model";
import { generateQuery } from "utils/AppUtils";

export const getByIdWorkShiftTableService = (id: number): Promise<any> => {
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

export const getWorkShiftTableService = (request: any): Promise<any> => {
  let params = generateQuery(request);
  return axiosClientV2.get(`/admin/v2/work_shift_tables.json?${params}`);
};

export const postWorkShiftTableService = (request: WorkShiftTableRequest): Promise<any> => {
  return axiosClientV2.post(`/admin/v2/work_shift_tables.json`, request);
};

export const getWorkShiftTableCountService = (request: any): Promise<number> => {
  let params = generateQuery(request);
  return axiosClientV2.get(`/admin/v2/work_shift_tables/count.json?${params}`);
};

export const getWorkShiftCellsService = (request: any): Promise<any> => {
  let params = generateQuery(request);
  return axiosClientV2.get(`/admin/v2/work_shift_cells.json?${params}`);
};

export const getStaffActivityManagerLocationService = (
  request: SearchStaffActivityManagerLocationParams,
): Promise<any> => {
  const params = generateQuery(request);
  return axiosClientV2.get(`/admin/v2/staff_activity_manager_location.json?${params}`);
};

export const addWorkShiftAssignmentService = (
  request: AddWorkShiftAssignmentRequest,
): Promise<any> => {
  return axiosClientV2.post(`/admin/v2/work_shift_assignments.json`, request);
};

export const deleteWorkShiftAssignmentService = (
  workShiftAssignmentId: number,
  request: DeleteWorkShiftAssignmentRequest,
): Promise<any> => {
  return axiosClientV2.delete(`/admin/v2/work_shift_assignments/${workShiftAssignmentId}.json`, {
    data: request,
  });
};

export const getWorkShiftAssignmentLogService = (
  request: WorkShiftAssignmentLogRequest,
): Promise<any> => {
  const params = generateQuery(request);
  return axiosClientV2.get(`/admin/v2/work_shift_assignment_log.json?${params}`);
};

export const putWorkShiftCellsService = (request: WorkShiftCellRequest): Promise<any> => {
  return axiosClientV2.put(`/admin/v2/work_shift_cells.json`, request);
};

export const getStaffActivityManagerService = (request: any): Promise<any> => {
  let params = generateQuery(request);
  return axiosClientV2.get(`/admin/v2/staff-activity-manager.json?${params}`);
};
