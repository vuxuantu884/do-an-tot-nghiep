import { YodyAction } from "base/base.action";
import { AppType } from "domain/types/app.type";
import { AuthType } from "domain/types/auth.type";

const intitalState = {
  isLogin: false,
  isLoad: false,
  account: null,
  isError: false,
};

const userReducer = (state = intitalState, action: YodyAction) => {
  const { type, payload } = action;
  switch (type) {
    case AppType.LOAD_USER_FROM_STORAGE_SUCCESS:
      return {
        ...state,
        isLogin: true,
        isLoad: true,
        account: payload.account,
      };
    case AppType.LOAD_USER_FROM_STORAGE_FAIL:
      return { ...state, isLoad: true };
    case AuthType.LOGIN_RESPONSE:
      return { ...state, isLogin: true, isLoad: false };
    case AuthType.UNAUTHORIZED_SUCCESS:
    case AuthType.LOGOUT_SUCCESS:
      return { ...state, isLogin: false, account: null };
    default:
      return state;
  }
};

export default userReducer;
