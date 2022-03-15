import BaseAction from "base/base.action"
import { AuthType } from "domain/types/auth.type";

export const loginRequestAction = (username: string, password: string, setLoading: (isLoading: boolean) => void) => {
  return BaseAction(AuthType.LOGIN_REQUEST, {username: username, password: password, setLoading});
}

export const loginSuccessAction = () => {
  return BaseAction(AuthType.LOGIN_RESPONSE, null);
}

export const unauthorizedAction = () => {
  return BaseAction(AuthType.UNAUTHORIZED_REQUEST, null);
}

export const unauthorizedSuccessAction = () => {
  return BaseAction(AuthType.UNAUTHORIZED_SUCCESS, null);
}

export const logoutAction = (userId: string | undefined) => {
  return BaseAction(AuthType.LOGOUT_REQUEST, {
    operatorKcId: userId
  });
}

export const logoutSuccessAction = () => {
  return BaseAction(AuthType.LOGOUT_SUCCESS, null);
}
