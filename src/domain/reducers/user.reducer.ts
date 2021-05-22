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
    case AuthType.LOGIN_RESPONSE:
    case AppType.LOAD_USER_FROM_STORAGE_SUCCESS:
      return {...state, isLogin: true}
    default:
      return state;
  }
}

export default userReducer;