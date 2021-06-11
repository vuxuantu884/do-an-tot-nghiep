import { PositionResponse } from 'model/account/position.model';
import { DepartmentResponse } from 'model/account/department.model';
import BaseAction from "base/BaseAction";
import { AccountType } from "domain/types/account.type";
import { AccountSearchQuery,AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";

export const AccountSearchAction= (query: AccountSearchQuery, setData: (data: PageResponse<AccountResponse>) => void) => {
  return BaseAction(AccountType.SEARCH_ACCOUNT_REQUEST, {query, setData});
}

export const AccountGetListAction = (query: AccountSearchQuery, setData: (data: Array<AccountResponse>) => void) => {
    return BaseAction(AccountType.GET_LIST_ACCOUNT_REQUEST, {query, setData});
  }

  export const DepartmentGetListAction = (setData: (data: Array<DepartmentResponse>) => void) => {
    return BaseAction(AccountType.GET_LIST_DEPARTMENT_REQUEST, { setData});
  }

  export const PositionGetListAction = (setData: (data: Array<PositionResponse>) => void) => {
    return BaseAction(AccountType.GET_LIST_POSITION_REQUEST, { setData});
  }