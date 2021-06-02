import { SearchReducerType } from './SearchReducerType';
import { AppSettingReducerType } from './AppSettingReducerType';
import { AccountModel } from 'model/other/Account/AccountModel';
import { BootstrapReducerType } from './BootstrapReducerType';
import { LoadingReducerType } from './LoadingReducerType';
import { UserReducerType } from './UserReducerType';

export interface RootReducerType {
  userReducer: UserReducerType,
  appSettingReducer: AppSettingReducerType,
  loadingReducer: LoadingReducerType,
  bootstrapReducer: BootstrapReducerType,
  accountReducer: Array<AccountModel>,
  searchReducer: SearchReducerType,
}
