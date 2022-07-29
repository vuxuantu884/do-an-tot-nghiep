import { YodyAction } from "base/base.action";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { Dispatch } from "react";
import { call, put } from "redux-saga/effects";
import { showError } from "./ToastUtils";

export type NotifyActionName = "SHOW_ALL" | "HIDE_ALL" | "USE_CONFIG";
export interface NotifyConfigApi {
  notifyAction?: NotifyActionName; // default: USE_CONFIG
  jobName?: string;
  isShowLoading?: boolean;
  isShowError?: boolean;
}

/**
 * ## Thông báo lỗi khi call api
 * @param error
 */
export const catcherError = (error: any, jobName?: string) => {
  if (typeof error === "string") {
    showError(`${error} ${jobName ? jobName.toLowerCase() : ""}`);
  } else if (Array.isArray(error)) {
    error.forEach((e: string) => showError(e));
  } else {
    // showError("Hệ thống gặp lỗi lạ");
  }
};

/**
 * ## Call api saga and and handle response
 *
 * @param hasLoading Loading khi call api
 * @param callbackDataFn callback handle data
 * @param fn api service function
 * @param args Tham số của function fn
 */
export const callApiSaga = function* <Fn extends (...args: any[]) => any, R extends ReturnType<Fn>>(
  notifyConfig: NotifyConfigApi,
  callbackDataFn: (data: any) => any,
  fn: Fn,
  ...args: Parameters<Fn>
) {
  const { isShowLoading, isShowError, notifyAction = "USE_CONFIG", jobName } = notifyConfig;

  if (notifyAction === "SHOW_ALL" || isShowLoading) yield put(showLoading());

  try {
    const response: R = yield call(fn, ...args);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        if (response.data) {
          yield callbackDataFn(response.data);
        } else {
          yield callbackDataFn(response);
        }
        break;

      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        throw response.message;

      case HttpStatus.BAD_REQUEST:
        throw response.errors;

      case HttpStatus.NOT_FOUND:
        throw response.message;

      default:
        throw response.message;
    }
  } catch (error: any) {
    console.log("error at", fn.name, error);
    if (notifyAction === "SHOW_ALL" || isShowError) catcherError(error, jobName);
    yield callbackDataFn(null);
  } finally {
    if (notifyAction === "SHOW_ALL" || isShowLoading) yield put(hideLoading());
  }
};

/**
 * ## Call api trực tiếp từ axios
 * @param notifyConfig : Loading khi call api
 * @param dispatch : Dispatch
 * @param fn : api service function
 * @param args : Tham số của function fn
 * @returns Giá trị trả về của api
 */
export const callApiNative = async <Fn extends (...args: any[]) => any, R extends ReturnType<Fn>>(
  notifyConfig: NotifyConfigApi,
  dispatch: Dispatch<YodyAction>,
  fn: Fn,
  ...args: Parameters<Fn>
) => {
  const { isShowLoading, isShowError, notifyAction = "USE_CONFIG", jobName } = notifyConfig;

  if (notifyAction === "SHOW_ALL" || isShowLoading) dispatch(showLoading());

  try {
    const response: R = await fn(...args);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        if (response.data) {
          return response.data;
        } else {
          return response;
        }

      case HttpStatus.UNAUTHORIZED:
        dispatch(unauthorizedAction());
        throw response.message;

      case HttpStatus.BAD_REQUEST:
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach((e: string) => showError(e));
          break;
        }
        throw response.message;

      case HttpStatus.NOT_FOUND:
        throw response.message;

      case HttpStatus.SERVER_ERROR:
        throw response.message;

      default:
        // if (response.errors && response.errors.length > 0) {
        //   response.errors.forEach((e: string) => showError(e));
        //   break
        // }
        // throw response.message;
        return response;
    }
  } catch (error: any) {
    console.log("error at", fn.name, error?.toString());
    if (notifyAction === "SHOW_ALL" || isShowError) catcherError(error, jobName);
    return null;
  } finally {
    if (notifyAction === "SHOW_ALL" || isShowLoading) dispatch(hideLoading());
  }
};
