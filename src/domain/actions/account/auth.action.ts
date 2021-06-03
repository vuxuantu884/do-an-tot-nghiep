import BaseAction from "base/BaseAction"
import { AuthType } from "domain/types/account.type";

export const loginRequestAction = (username: string, password: string, setLoading: (isLoading: boolean) => void) => {
  return BaseAction(AuthType.LOGIN_REQUEST, {username: username, password: password, setLoading});
}

export const loginSuccessAction = () => {
  return BaseAction(AuthType.LOGIN_RESPONSE, null);
}

export const logoutAction = () => {
  return BaseAction(AuthType.LOGOUT_REQUEST, null);
}

export const logoutSuccessAction = () => {
  return BaseAction(AuthType.LOGOUT_SUCCESS, null);
}
