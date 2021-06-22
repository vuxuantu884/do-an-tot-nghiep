import { RoleSearchQuery, RoleResponse } from 'model/auth/roles.model';
import { RoleType } from 'domain/types/auth.type';
import BaseAction from "base/BaseAction"

export const RoleGetListAction = (query: RoleSearchQuery, setData: (data: Array<RoleResponse>) => void) => {
  return BaseAction(RoleType.GET_LIST_ROLE_REQUEST, {query,setData});
}