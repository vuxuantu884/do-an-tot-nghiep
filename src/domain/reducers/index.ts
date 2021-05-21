import { combineReducers } from "redux";
import loadingReducer from "./loading.reducer";
import userReducer from "./user.reducer";

const rootReducer = combineReducers({
  userReducer: userReducer,
  loadingReducer: loadingReducer,
});

export default rootReducer;