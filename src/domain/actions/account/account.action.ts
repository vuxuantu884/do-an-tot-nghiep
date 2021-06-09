import BaseAction from "base/BaseAction";
import { AccountType } from "domain/types/account.type";
import { AccountSearchQuery } from "model/query/account.search.query";
import { AccountResponse } from "model/response/accounts/account-detail.response";
import { PageResponse } from "model/response/base-metadata.response";

export const AccountSearchAction= (query: AccountSearchQuery, setData: (data: PageResponse<AccountResponse>) => void) => {
  return BaseAction(AccountType.SEARCH_ACCOUNT_REQUEST, {query, setData});
}

export const AccountGetList = (query: AccountSearchQuery, setData: (data: Array<AccountResponse>) => void) => {
    return BaseAction(AccountType.GET_LIST_ACCOUNT_REQUEST, {query, setData});
  }