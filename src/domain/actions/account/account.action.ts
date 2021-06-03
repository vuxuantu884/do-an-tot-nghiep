import BaseAction from "base/BaseAction";
import { AccountType } from "domain/types/account.type";
import { AccountSearchQuery } from "model/query/account.search.query";
import { AccountDetailResponse } from "model/response/accounts/account-detail.response";
import { PageResponse } from "model/response/base-metadata.response";

const AccountAction = {
  SearchAccount: (query: AccountSearchQuery, setData: (data: PageResponse<AccountDetailResponse>) => void) => {
    return BaseAction(AccountType.SEARCH_ACCOUNT_REQUEST, {query, setData});
  }
}

export default AccountAction;