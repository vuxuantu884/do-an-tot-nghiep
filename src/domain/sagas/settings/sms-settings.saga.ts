import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { fetchApiErrorAction } from "domain/actions/app.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { SETTING_TYPES } from "domain/types/settings.type";
import { call, put, takeLatest } from "redux-saga/effects";
import { isFetchApiSuccessful } from "utils/AppUtils";
import { showError } from "utils/ToastUtils";
import {
  configSmsMessageApi,
  getSmsConfigApi,
  updateSmsConfigApi,
  createSmsPromotionVoucherApi,
  updateSmsPromotionVoucherApi,
} from "service/sms-settings/sms-settings.service";

function* getSmsConfigSaga(action: YodyAction) {
  const { handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<any> = yield call(getSmsConfigApi);

    if (isFetchApiSuccessful(response)) {
      handleData(response.data);
    } else {
      yield put(fetchApiErrorAction(response, "Tải dữ liệu cài đặt tài khoản gửi sms"));
    }
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi api tải dữ liệu cài đặt tài khoản gửi sms!");
  } finally {
    yield put(hideLoading());
  }
}

function* updateSmsConfigSaga(action: YodyAction) {
  const { request, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<any> = yield call(updateSmsConfigApi, request);

    if (isFetchApiSuccessful(response)) {
      handleData(response.data);
    } else {
      yield put(fetchApiErrorAction(response, "Cập nhật dữ liệu cài đặt tài khoản gửi sms"));
    }
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi api Cập nhật dữ liệu cài đặt tài khoản gửi sms!");
  } finally {
    yield put(hideLoading());
  }
}

function* configSmsMessageSaga(action: YodyAction) {
  const { request, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<any> = yield call(configSmsMessageApi, request);

    if (isFetchApiSuccessful(response)) {
      handleData(response.data);
    } else {
      yield put(fetchApiErrorAction(response, "Cấu hình gửi tin sms"));
    }
  } catch (error) {
    console.log("error", error);
  } finally {
    yield put(hideLoading());
  }
}

function* createSmsPromotionVoucherSaga(action: YodyAction) {
  const { params, callback } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<any> = yield call(createSmsPromotionVoucherApi, params);
    if (isFetchApiSuccessful(response)) {
      callback(response.data);
    } else {
      callback(null);
      yield put(fetchApiErrorAction(response, "Cập nhật tin nhắn sinh mã giảm giá"));
    }
  } catch (error) {
    callback(null);
    console.log("error", error);
  } finally {
    yield put(hideLoading());
  }
}

function* updateSmsPromotionVoucherSaga(action: YodyAction) {
  const { id, params, callback } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<any> = yield call(updateSmsPromotionVoucherApi, id, params);
    if (isFetchApiSuccessful(response)) {
      callback(response.data);
    } else {
      callback(null);
      yield put(fetchApiErrorAction(response, "Cập nhật tin nhắn sinh mã giảm giá"));
    }
  } catch (error) {
    callback(null);
    console.log("error", error);
  } finally {
    yield put(hideLoading());
  }
}

export function* smsSettingSaga() {
  yield takeLatest(SETTING_TYPES.smsSettingsType.GET_SMS_CONFIG, getSmsConfigSaga);
  yield takeLatest(SETTING_TYPES.smsSettingsType.UPDATE_SMS_CONFIG, updateSmsConfigSaga);
  yield takeLatest(SETTING_TYPES.smsSettingsType.CONFIG_SMS_MESSAGE, configSmsMessageSaga);
  yield takeLatest(SETTING_TYPES.smsSettingsType.CREATE_SMS_PROMOTION_VOUCHER, createSmsPromotionVoucherSaga);
  yield takeLatest(SETTING_TYPES.smsSettingsType.UPDATE_SMS_PROMOTION_VOUCHER, updateSmsPromotionVoucherSaga);
}
