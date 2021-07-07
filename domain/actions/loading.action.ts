import BaseAction from "base/BaseAction"
import LoadingType from "domain/types/loading.type"

export const showLoading = () => {
  return BaseAction(LoadingType.LOADING_SHOW, null);
}

export const hideLoading = () => {
  return BaseAction(LoadingType.LOADING_HIDE, null);
}