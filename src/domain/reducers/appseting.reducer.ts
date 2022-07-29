import { AnyAction } from "redux";
import { AppType } from "domain/types/app.type";
import { AppSettingReducerType } from "model/reducers/AppSettingReducerType";
import { setAppSetting } from "utils/LocalStorageUtils";

const intitalState: AppSettingReducerType = {
  collapse: false,
};

const appSettingReducer = (state = intitalState, action: AnyAction): AppSettingReducerType => {
  const { payload, type } = action;
  switch (type) {
    case AppType.LOAD_SETTING_APP_RESULT:
    case AppType.LOAD_SETTING_APP_REQUEST:
      let data = { ...state, ...payload.data };
      setAppSetting(data);
      return data;
    default:
      return state;
  }
};

export default appSettingReducer;
