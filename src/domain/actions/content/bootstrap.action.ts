import BaseAction from "base/base.action";
import { BootstrapType } from "domain/types/content.type";
import { BootstrapResponse } from "model/content/bootstrap.model";

export const getBootstrapAction = () => {
  return BaseAction(BootstrapType.GET_BOOTSTRAP_REQUEST, null);
};

export const getBootstrapSuccessAction = (data: Partial<BootstrapResponse>) => {
  return BaseAction(BootstrapType.GET_BOOTSTRAP_SUCESSS, { data: data });
};
