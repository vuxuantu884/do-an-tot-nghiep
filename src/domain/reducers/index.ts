import { combineReducers } from "redux";
import appSettingReducer from "./appseting.reducer";
import bootstrapReducer from "./bootstrap.reducer";
import loadingReducer from "./loading.reducer";
import userReducer from "./user.reducer";

const rootReducer = combineReducers({
  userReducer: userReducer,
  loadingReducer: loadingReducer,
  bootstrapReducer: bootstrapReducer,
  appSettingReducer: appSettingReducer,
});

export default rootReducer;