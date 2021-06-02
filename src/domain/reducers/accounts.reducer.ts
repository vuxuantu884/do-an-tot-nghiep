import { StoreType } from 'domain/types/product.type';
import { AccountModel } from 'model/other/Account/AccountModel';
import { YodyAction } from 'base/BaseAction';

const initialState: Array<AccountModel> = [];

const accountReducer = (state = initialState, action: YodyAction) => {
  let {type, payload} = action;
  switch(type) {
    case StoreType.SAVE_ACCOUNT_STORE:
      return payload.accounts;
    default:
      return state;
  }
}

export default accountReducer;