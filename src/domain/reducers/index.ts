import { combineReducers } from "redux";
import appSettingReducer from "./appseting.reducer";
import bootstrapReducer from "./bootstrap.reducer";
import loadingReducer from "./loading.reducer";
import userReducer from "./user.reducer";
import permissionReducer from './permisson.reducer'
import orderReducer from "./order.reducer";
const rootReducer = combineReducers({
  userReducer: userReducer,
  loadingReducer: loadingReducer,
  bootstrapReducer: bootstrapReducer,
  appSettingReducer: appSettingReducer,
  permissionReducer: permissionReducer,
  orderReducer: orderReducer,
});

export default rootReducer;