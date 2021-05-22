import BaseAction from "base/BaseAction"
import { AuthType } from "domain/types/auth.type";

export const loginRequestAction = (username: string, password: string) => {
  return BaseAction(AuthType.LOGIN_REQUEST, {username: username, password: password});
}

export const loginSuccessAction = () => {
  return BaseAction(AuthType.LOGIN_RESPONSE, null);
}
