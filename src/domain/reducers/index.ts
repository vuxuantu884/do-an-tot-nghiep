import { combineReducers } from "redux";
import bootstrapReducer from "./bootstrap.reducer";
import loadingReducer from "./loading.reducer";
import userReducer from "./user.reducer";

const rootReducer = combineReducers({
  userReducer: userReducer,
  loadingReducer: loadingReducer,
  bootstrapReducer: bootstrapReducer,
});

export default rootReducer;