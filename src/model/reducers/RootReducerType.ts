import { BootstrapReducerType } from './BootstrapReducerType';
import { LoadingReducerType } from './LoadingReducerType';
import { UserReducerType } from './UserReducerType';

export interface RootReducerType {
  userReducer: UserReducerType
  loadingReducer: LoadingReducerType
  bootstrapReducer: BootstrapReducerType,
}
