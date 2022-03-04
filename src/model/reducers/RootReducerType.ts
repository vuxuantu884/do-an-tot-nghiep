import { AuthProfilePermission } from 'model/auth/permission.model';
import { AppSettingReducerType } from './AppSettingReducerType';
import { BootstrapReducerType } from './BootstrapReducerType';
import { LoadingReducerType } from './LoadingReducerType';
import { OrderReducerType } from './OrderReducerType';
import { UserReducerType } from './UserReducerType';

export interface RootReducerType {
  userReducer: UserReducerType,
  loadingReducer: LoadingReducerType,
  bootstrapReducer: BootstrapReducerType,
  appSettingReducer: AppSettingReducerType,
  permissionReducer: AuthProfilePermission,
  orderReducer: OrderReducerType,
}
