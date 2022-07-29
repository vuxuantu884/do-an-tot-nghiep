import BaseAction from "base/base.action";
import { DepartmentType } from "domain/types/account.type";
import {
  DepartmentFilterProps,
  DepartmentRequest,
  DepartmentResponse,
} from "model/account/department.model";
import { PageResponse } from "model/base/base-metadata.response";

const searchDepartmentAction = (onResult: (result: Array<DepartmentResponse> | false) => void) => {
  return BaseAction(DepartmentType.SEARCH_DEPARTMENT, { onResult });
};

const searchDepartmentPagingAction = (
  query: DepartmentFilterProps,
  onResult: (result: PageResponse<DepartmentResponse> | false) => void,
) => {
  return BaseAction(DepartmentType.SEARCH_DEPARTMENT_PAGING, {
    query,
    onResult,
  });
};

const departmentDetailAction = (
  id: number | null | string,
  onResult: (result: DepartmentResponse | false) => void,
) => {
  return BaseAction(DepartmentType.DETAIL_DEPARTMENT, { id, onResult });
};

const departmentCreateAction = (
  request: DepartmentRequest,
  onResult: (result: DepartmentResponse | false) => void,
) => {
  return BaseAction(DepartmentType.CREATE_DEPARTMENT, { request, onResult });
};

const departmentUpdateAction = (
  id: number,
  request: DepartmentRequest,
  onResult: (result: DepartmentResponse | false) => void,
) => {
  return BaseAction(DepartmentType.UPDATE_DEPARTMENT, {
    id,
    request,
    onResult,
  });
};

export {
  searchDepartmentAction,
  departmentDetailAction,
  departmentCreateAction,
  departmentUpdateAction,
  searchDepartmentPagingAction,
};
