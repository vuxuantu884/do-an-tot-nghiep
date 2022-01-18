import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { fetchApiErrorAction } from "domain/actions/app.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { SETTING_TYPES } from "domain/types/settings.type";
import {
	IsAllowToSellWhenNotAvailableStockResponseModel,
	OrderConfigActionOrderPreviewResponseModel,
	OrderConfigPrintResponseModel,
	OrderConfigResponseModel,
	ShippingServiceConfigDetailResponseModel,
	ShippingServiceConfigResponseModel
} from "model/response/settings/order-settings.response";
import { call, put, takeLatest } from "redux-saga/effects";
import {
	configureIsAllowToSellWhenNotAvailableStockService,
	createListShippingServiceConfigService,
	deleteShippingServiceConfigService,
	editOrderConfigActionService,
	getIsAllowToSellWhenNotAvailableStockService,
	getListShippingServiceConfigService,
	getOrderConfigActionService,
	getOrderConfigPrintService,
	getOrderConfigService,
	getShippingServiceConfigDetailService,
	updateShippingServiceConfigService
} from "service/order/order-settings.service";
import { isFetchApiSuccessful } from "utils/AppUtils";
import { showError, showSuccess } from "utils/ToastUtils";

function* getOrderConfigSaga(action: YodyAction) {
  const { handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<OrderConfigResponseModel> = yield call(
      getOrderConfigService
    );
		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Cấu hình đơn hàng"));
		}
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi api cấu hình đơn hàng!");
  } finally {
    yield put(hideLoading());
  }
}

function* getOrderConfigPrintSaga(action: YodyAction) {
  const { handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<OrderConfigPrintResponseModel[]> = yield call(
      getOrderConfigPrintService
    );
		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách cấu hình in"));
		}
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi api danh sách cấu hình in!");
  } finally {
    yield put(hideLoading());
  }
}

function* getOrderConfigActionSaga(action: YodyAction) {
  const { handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<OrderConfigActionOrderPreviewResponseModel[]> =
      yield call(getOrderConfigActionService);
		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Cấu hình đơn hàng"));
		}

  } catch (error) {
    console.log("error", error);
    showError("Có lỗi api lấy danh sách cấu hình đơn hàng!");
  } finally {
    yield put(hideLoading());
  }
}

function* editOrderConfigActionSaga(action: YodyAction) {
  const { params, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<any> = yield call(
      editOrderConfigActionService,
      params
    );

		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
      showSuccess("Cập nhật cấu hình chung thành công!");
		} else {
			yield put(fetchApiErrorAction(response, "Cập nhật cấu hình đơn hàng"));
		}
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi api cập nhật cấu hình đơn hàng. Vui lòng thử lại sau!");
  } finally {
    yield put(hideLoading());
  }
}

function* getIsAllowToSellWhenNotAvailableStockSaga(action: YodyAction) {
  const { handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<IsAllowToSellWhenNotAvailableStockResponseModel> =
      yield call(getIsAllowToSellWhenNotAvailableStockService);

		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Cập nhật cấu hình đơn hàng bán khi tồn kho nhỏ hơn 0"));
		}

  } catch (error) {
    console.log("error", error);
    showError("Có lỗi api cấu hình đơn hàng bán khi tồn kho nhỏ hơn 0!");
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
		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
			showSuccess("Cập nhật trạng thái cho phép bán khi tồn kho thành công!");
		} else {
			yield put(fetchApiErrorAction(response, "Cập nhật cho phép bán khi tồn kho"));
		}
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi api cập nhật trạng thái cho phép bán khi tồn kho! Vui lòng thử lại sau!");
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

		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách cấu hình phí ship và phí vận chuyển"));
		}
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi api lấy danh sách cấu hình phí ship và phí vận chuyển!");
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
		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Tạo mới cài đặt phí ship và phí vận chuyển"));
		}

  } catch (error) {
    console.log("error", error);
    showError("Có lỗi api tạo mới cài đặt phí ship và phí vận chuyển!");
  } finally {
    yield put(hideLoading());
  }
}

function* getConfigurationShippingServiceAndShippingFeeDetailSaga(
  action: YodyAction
) {
  const { id, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<ShippingServiceConfigDetailResponseModel> =
      yield call(getShippingServiceConfigDetailService, id);

		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Chi tiết cấu hình phí ship và phí vận chuyển"));
		}
  } catch (error) {
    console.log("error", error);
		showError("Có lỗi api chi tiết cấu hình phí ship và phí vận chuyển!");
  } finally {
    yield put(hideLoading());
  }
}

function* updateConfigurationShippingServiceAndShippingFeeSaga(
  action: YodyAction
) {
  const { id, params, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<any> = yield call(
      updateShippingServiceConfigService,
      id,
      params
    );
		if (isFetchApiSuccessful(response)) {
			showSuccess("Cập nhật cài đặt thành công!")
			handleData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Cập nhật cấu hình phí ship và phí vận chuyển"));
		}
  } catch (error) {
    console.log("error", error);
		showError("Có lỗi api cập nhật cấu hình phí ship và phí vận chuyển!");
  } finally {
    yield put(hideLoading());
  }
}

function* deleteConfigurationShippingServiceAndShippingFeeSaga(
  action: YodyAction
) {
  const { id, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<any> = yield call(
      deleteShippingServiceConfigService,
      id
    );

		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
      showSuccess("Xóa cài đặt thành công");
		} else {
			yield put(fetchApiErrorAction(response, "Xóa cấu hình phí ship và phí vận chuyển"));
		}
  } catch (error) {
    console.log("error", error);
		showError("Có lỗi api xóa cấu hình phí ship và phí vận chuyển!");
  } finally {
    yield put(hideLoading());
  }
}

export function* settingOrdersSaga() {
  yield takeLatest(
    SETTING_TYPES.orderSettings.GET_ORDER_CONFIGURATIONS,
    getOrderConfigSaga
  );

  yield takeLatest(
    SETTING_TYPES.orderSettings.GET_ORDER_CONFIG_PRINT,
    getOrderConfigPrintSaga
  );

  yield takeLatest(
    SETTING_TYPES.orderSettings.GET_ORDER_CONFIG_ACTION,
    getOrderConfigActionSaga
  );

  yield takeLatest(
    SETTING_TYPES.orderSettings.EDIT_ORDER_CONFIGURATIONS,
    editOrderConfigActionSaga
  );

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

  yield takeLatest(
    SETTING_TYPES.orderSettings
      .GET_CONFIGURATION_SHIPPING_SERVICE_AND_SHIPPING_FEE_DETAIL,
    getConfigurationShippingServiceAndShippingFeeDetailSaga
  );

  yield takeLatest(
    SETTING_TYPES.orderSettings
      .UPDATE_CONFIGURATION_SHIPPING_SERVICE_AND_SHIPPING_FEE,
    updateConfigurationShippingServiceAndShippingFeeSaga
  );

  yield takeLatest(
    SETTING_TYPES.orderSettings
      .DELETE_CONFIGURATION_SHIPPING_SERVICE_AND_SHIPPING_FEE,
    deleteConfigurationShippingServiceAndShippingFeeSaga
  );
}
