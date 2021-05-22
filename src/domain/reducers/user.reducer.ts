import { AppType } from 'domain/types/app.type';
import { AuthType } from 'domain/types/auth.type';
import { AnyAction } from 'redux';;

const intitalState = {
  isLogin: false,
  isLoad: false,
  account: undefined,
};

const userReducer = (state = intitalState, action: AnyAction) => {
  const {type} = action;
  switch (type) {
    case AppType.LOAD_USER_FROM_STORAGE_SUCCESS:
      return {...state, isLogin: true, isLoad: true};
    case AuthType.LOGIN_RESPONSE:
      return {...state, isLogin: true,}
    default:
      return state;
  }
}

export default userReducer;