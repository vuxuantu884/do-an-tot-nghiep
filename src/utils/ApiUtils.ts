import {YodyAction} from "base/base.action";
import {HttpStatus} from "config/http-status.config";
import {unauthorizedAction} from "domain/actions/auth/auth.action";
import {hideLoading, showLoading} from "domain/actions/loading.action";
import {Dispatch} from "react";
import {call, put} from "redux-saga/effects";
import {showError} from "./ToastUtils";

/**
 * ## Thông báo lỗi khi call api
 * @param error 
 */
export const catcherError = (error: any) => {
  if (typeof error === "string") {
    showError(error);
  } else if (Array.isArray(error)) {
    error.forEach((e: string) => showError(e));
  } else {
    showError("Hệ thống gặp lỗi lạ");
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
export const callApiSaga = function* <
  Fn extends (...args: any[]) => any,
  R extends ReturnType<Fn>
>(hasLoading: boolean, callbackDataFn: R, fn: Fn, ...args: Parameters<Fn>) {
  if (hasLoading) yield put(showLoading());

  try {
    const response: R = yield call(fn, ...args);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        if (response.data) {
          callbackDataFn(response.data);
        } else {
          callbackDataFn(response);
        }
        break;

      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        throw response.message;

      case HttpStatus.BAD_REQUEST:
        throw response.errors;

      default:
        throw response.message;
    }
  } catch (error: any) {
    console.log("error at", fn.name, error);
    catcherError(error);
    callbackDataFn(null);
  } finally {
    if (hasLoading) yield put(hideLoading());
  }
};

/**
 * ## Call api trực tiếp từ axios
 * @param hasLoading : Loading khi call api
 * @param dispatch : Dispatch
 * @param fn : api service function
 * @param args : Tham số của function fn
 * @returns Giá trị trả về của api
 */
export const callApiNative = async <
  Fn extends (...args: any[]) => any,
  R extends ReturnType<Fn>
>(
  hasLoading: boolean,
  dispatch: Dispatch<YodyAction>,
  fn: Fn,
  ...args: Parameters<Fn>
) => {
  if (hasLoading) dispatch(showLoading());

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
        throw response.errors;

      default:
        throw response.message;
    }
  } catch (error: any) {
    console.log("error at", fn.name, error);
    catcherError(error);
    return null;
  } finally {
    if (hasLoading) dispatch(hideLoading());
  }
};
