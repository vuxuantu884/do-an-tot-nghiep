import BaseAction from "base/base.action"
import { DepartmentType } from "domain/types/account.type"
import { DepartmentRequest, DepartmentResponse } from "model/account/department.model";

const searchDepartmentAction = (onResult: (result: Array<DepartmentResponse>|false) => void) => {
  return BaseAction(DepartmentType.SEARCH_DEPARTMENT, {onResult})
}

const departmentDetailAction = (id: number | null, onResult: (result: DepartmentResponse|false) => void) => {
  return BaseAction(DepartmentType.DETAIL_DEPARTMENT, {id, onResult})
}

const departmentCreateAction = (request: DepartmentRequest, onResult: (result: DepartmentResponse|false) => void) => {
  return BaseAction(DepartmentType.CREATE_DEPARTMENT, {request, onResult})
}

const departmentUpdateAction = (id: number, request: DepartmentRequest, onResult: (result: DepartmentResponse|false) => void) => {
  return BaseAction(DepartmentType.UPDATE_DEPARTMENT, {id, request, onResult})
}

export {searchDepartmentAction, departmentDetailAction, departmentCreateAction, departmentUpdateAction};
