import { PositionResponse } from 'model/account/position.response';
import { DepartmentResponse } from 'model/account/department.response';
import BaseAction from "base/BaseAction";
import { AccountType } from "domain/types/account.type";
import { AccountSearchQuery } from "model/query/account.search.query";
import { AccountResponse } from "model/account/account.response";
import { PageResponse } from "model/response/base-metadata.response";

export const AccountSearchAction= (query: AccountSearchQuery, setData: (data: PageResponse<AccountResponse>) => void) => {
  return BaseAction(AccountType.SEARCH_ACCOUNT_REQUEST, {query, setData});
}

export const AccountGetList = (query: AccountSearchQuery, setData: (data: Array<AccountResponse>) => void) => {
    return BaseAction(AccountType.GET_LIST_ACCOUNT_REQUEST, {query, setData});
  }

  export const DepartmentGetListAction = (setData: (data: Array<DepartmentResponse>) => void) => {
    return BaseAction(AccountType.GET_LIST_DEPARTMENT_REQUEST, { setData});
  }

  export const PositionGetListAction = (setData: (data: Array<PositionResponse>) => void) => {
    return BaseAction(AccountType.GET_LIST_POSITION_REQUEST, { setData});
  }