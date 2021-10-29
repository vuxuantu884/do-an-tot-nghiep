import { PageResponse } from 'model/base/base-metadata.response';
import { RoleSearchQuery, RoleResponse, RoleAuthorize } from 'model/auth/roles.model';
import { RoleType } from 'domain/types/auth.type';
import BaseAction from "base/base.action"

export const RoleGetListAction = (query: RoleSearchQuery, setData: (data: Array<RoleResponse>) => void) => {
  return BaseAction(RoleType.GET_LIST_ROLE_REQUEST, {query,setData});
}

export const RoleSearchAction = (query: RoleSearchQuery, setData: (data: PageResponse<RoleResponse>) => void) => {
  return BaseAction(RoleType.SEARCH_LIST_ROLE_REQUEST, {query,setData});
}

export const createRoleAction = (role: RoleAuthorize, setData: (data: RoleAuthorize) => void) => {
  return BaseAction(RoleType.CREATE_ROLES, {role,setData});
}