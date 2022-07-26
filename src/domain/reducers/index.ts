import { combineReducers } from "redux";
import appSettingReducer from "./appseting.reducer";
import bootstrapReducer from "./bootstrap.reducer";
import loadingReducer from "./loading.reducer";
import userReducer from "./user.reducer";
import permissionReducer from './permisson.reducer'
import orderReducer from "./order.reducer";
import inventoryReducer from "./inventory.reducre";
const rootReducer = combineReducers({
  userReducer: userReducer,
  loadingReducer: loadingReducer,
  bootstrapReducer: bootstrapReducer,
  appSettingReducer: appSettingReducer,
  permissionReducer: permissionReducer,
  orderReducer: orderReducer,
  inventoryReducer: inventoryReducer,
});

export default rootReducer;
