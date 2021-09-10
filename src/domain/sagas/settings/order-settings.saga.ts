import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { SETTING_TYPES } from "domain/types/settings.type";
import {
  IsAllowToSellWhenNotAvailableStockResponseModel,
  ShippingServiceConfigResponseModel,
} from "model/response/settings/order-settings.response";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  configureIsAllowToSellWhenNotAvailableStockService,
  createListShippingServiceConfigService,
  getIsAllowToSellWhenNotAvailableStockService,
  getListShippingServiceConfigService,
} from "service/order/order-settings.service";
import { showError, showSuccess } from "utils/ToastUtils";

function* getIsAllowToSellWhenNotAvailableStockSaga(action: YodyAction) {
  const { handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<IsAllowToSellWhenNotAvailableStockResponseModel> =
      yield call(getIsAllowToSellWhenNotAvailableStockService);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* configureIsAllowToSellWhenNotAvailableStockSaga(action: YodyAction) {
  const { sellable_inventory, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<IsAllowToSellWhenNotAvailableStockResponseModel> =
      yield call(
        configureIsAllowToSellWhenNotAvailableStockService,
        sellable_inventory
      );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* listConfigurationShippingServiceAndShippingFeeSaga(
  action: YodyAction
) {
  const { handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<ShippingServiceConfigResponseModel[]> =
      yield call(getListShippingServiceConfigService);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* createConfigurationShippingServiceAndShippingFeeSaga(
  action: YodyAction
) {
  const { params, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<any> = yield call(
      createListShippingServiceConfigService,
      params
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData(response.data);
        showSuccess("Tạo mới cài đặt thành công");
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

export function* settingOrdersSaga() {
  yield takeLatest(
    SETTING_TYPES.orderSettings.GET_IS_ALLOW_TO_SELL_WHEN_NOT_AVAILABLE_STOCK,
    getIsAllowToSellWhenNotAvailableStockSaga
  );

  yield takeLatest(
    SETTING_TYPES.orderSettings
      .CONFIGURE_IS_ALLOW_TO_SELL_WHEN_NOT_AVAILABLE_STOCK,
    configureIsAllowToSellWhenNotAvailableStockSaga
  );

  yield takeLatest(
    SETTING_TYPES.orderSettings
      .LIST_CONFIGURATION_SHIPPING_SERVICE_AND_SHIPPING_FEE,
    listConfigurationShippingServiceAndShippingFeeSaga
  );

  yield takeLatest(
    SETTING_TYPES.orderSettings
      .CREATE_CONFIGURATION_SHIPPING_SERVICE_AND_SHIPPING_FEE,
    createConfigurationShippingServiceAndShippingFeeSaga
  );
}
