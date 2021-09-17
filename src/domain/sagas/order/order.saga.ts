import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { OrderModel } from "model/order/order.model";
import { ShipmentModel } from "model/order/shipment.model";
import {
  DeliveryMappedStoreType,
  DeliveryServiceResponse,
  DeliveryTransportTypesResponse,
  ErrorLogResponse,
  GHNFeeResponse,
  OrderResponse,
  OrderSubStatusResponse,
  ShippingGHTKResponse,
  TrackingLogFulfillmentResponse,
  VTPFeeResponse,
} from "model/response/order/order.response";
import { ChannelResponse } from "model/response/product/channel.response";
import { call, put, takeLatest } from "redux-saga/effects";
import { getAmountPayment } from "utils/AppUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { YodyAction } from "../../../base/base.action";
import {
  createDeliveryMappedStoreServices,
  deleteDeliveryMappedStoreServices,
  getChannelApi,
  getDeliveryMappedStoresServices,
  getDeliveryTransportTypesServices,
  getPaymentMethod,
  orderPostApi,
  updateDeliveryConnectService,
} from "../../../service/order/order.service";
import { OrderType } from "../../types/order.type";
import { PaymentMethodResponse } from "./../../../model/response/order/paymentmethod.response";
import { SourceResponse } from "./../../../model/response/order/source.response";
import {
  getDeliverieServices,
  getInfoDeliveryGHN,
  getInfoDeliveryGHTK,
  getInfoDeliveryVTP,
  getListOrderApi,
  getListOrderCustomerApi,
  getOrderDetail,
  getOrderSubStatusService,
  getShipmentApi,
  getSources,
  getTrackingLogFulFillment,
  getTrackingLogFulFillmentError,
  setSubStatusService,
  updateFulFillmentStatus,
  updatePayment,
  updateShipment,
} from "./../../../service/order/order.service";
import { unauthorizedAction } from "./../../actions/auth/auth.action";

function* getListOrderSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  try {
    let response: BaseResponse<Array<OrderModel>> = yield call(
      getListOrderApi,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        break;
    }
  } catch (error) {}
}

function* getListOrderCustomerSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  try {
    let response: BaseResponse<Array<OrderModel>> = yield call(
      getListOrderCustomerApi,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        break;
    }
  } catch (error) {}
}

function* getShipmentsSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  try {
    let response: BaseResponse<Array<ShipmentModel>> = yield call(
      getShipmentApi,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        break;
    }
  } catch (error) {}
}

function* orderCreateSaga(action: YodyAction) {
  const { request, setData } = action.payload;
  try {
    let response: BaseResponse<OrderResponse> = yield call(
      orderPostApi,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* orderFpageCreateSaga(action: YodyAction) {
  const { request, setData, setDisable } = action.payload;
  try {
    let response: BaseResponse<OrderResponse> = yield call(
      orderPostApi,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        setDisable(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* InfoGHTKSaga(action: YodyAction) {
  const { request, setData } = action.payload;
  try {
    let response: BaseResponse<Array<ShippingGHTKResponse>> = yield call(
      getInfoDeliveryGHTK,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* InfoGHNSaga(action: YodyAction) {
  const { request, setData } = action.payload;
  try {
    let response: BaseResponse<GHNFeeResponse> = yield call(
      getInfoDeliveryGHN,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* InfoVTPSaga(action: YodyAction) {
  const { request, setData } = action.payload;
  try {
    let response: BaseResponse<Array<VTPFeeResponse>> = yield call(
      getInfoDeliveryVTP,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* updateFulFillmentStatusSaga(action: YodyAction) {
  const { request, setData } = action.payload;
  try {
    let response: BaseResponse<OrderResponse> = yield call(
      updateFulFillmentStatus,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* updatePaymentSaga(action: YodyAction) {
  const { request, order_id, setData } = action.payload;
  try {
    let response: BaseResponse<OrderResponse> = yield call(
      updatePayment,
      request,
      order_id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* updateShipmentSaga(action: YodyAction) {
  const { request, setData } = action.payload;
  try {
    let response: BaseResponse<OrderResponse> = yield call(
      updateShipment,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* PaymentMethodGetListSaga(action: YodyAction) {
  let { setData } = action.payload;
  try {
    let response: BaseResponse<Array<PaymentMethodResponse>> = yield call(
      getPaymentMethod
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        break;
    }
  } catch (error) {}
}

function* getDataSource(action: YodyAction) {
  let { setData } = action.payload;
  try {
    let response: BaseResponse<Array<SourceResponse>> = yield call(getSources);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        break;
    }
  } catch (error) {}
}

function* orderDetailSaga(action: YodyAction) {
  const { id, setData } = action.payload;
  try {
    let response: BaseResponse<OrderResponse> = yield call(getOrderDetail, id);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        response.data.total_paid = getAmountPayment(response.data.payments);
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* getTRackingLogFulfillmentSaga(action: YodyAction) {
  const { fulfillment_code, setData } = action.payload;
  try {
    let response: BaseResponse<Array<TrackingLogFulfillmentResponse>> =
      yield call(getTrackingLogFulFillment, fulfillment_code);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(
          response.data.sort((a, b) => {
            return b.id - a.id;
          })
        );
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* getTRackingLogErrorSaga(action: YodyAction) {
  const { fulfillment_code, setData } = action.payload;
  try {
    let response: BaseResponse<Array<ErrorLogResponse>> = yield call(
      getTrackingLogFulFillmentError,
      fulfillment_code
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(
          response.data.sort((a, b) => {
            return b.id - a.id;
          })
        );
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* ListDeliveryServicesSaga(action: YodyAction) {
  let { setData } = action.payload;
  try {
    let response: BaseResponse<Array<DeliveryServiceResponse>> = yield call(
      getDeliverieServices
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* getDeliveryTransportTypeSaga(action: YodyAction) {
  let { id, handleData } = action.payload;
  try {
    let response: BaseResponse<Array<DeliveryTransportTypesResponse>> =
      yield call(getDeliveryTransportTypesServices, id);
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
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* getDeliveryMappedStoresSaga(action: YodyAction) {
  let { id, handleData } = action.payload;
  try {
    let response: BaseResponse<Array<DeliveryMappedStoreType>> = yield call(
      getDeliveryMappedStoresServices,
      id
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
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* createDeliveryMappedStoreSaga(action: YodyAction) {
  yield put(showLoading());
  let { idDelivery, shop_id, store_id, token, handleData } = action.payload;
  try {
    let response: BaseResponse<any> = yield call(
      createDeliveryMappedStoreServices,
      idDelivery,
      shop_id,
      store_id,
      token
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData(response.data);
        showSuccess("Thêm mapping store thành công!");
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* deleteDeliveryMappedStoreSaga(action: YodyAction) {
  yield put(showLoading());
  let { idDelivery, shop_id, store_id, handleData } = action.payload;
  try {
    let response: BaseResponse<Array<DeliveryMappedStoreType>> = yield call(
      deleteDeliveryMappedStoreServices,
      idDelivery,
      shop_id,
      store_id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData(response.data);
        showSuccess("Xóa mapping store thành công!");
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* updateDeliveryConfigurationSaga(action: YodyAction) {
  yield put(showLoading());
  let { params, handleData } = action.payload;
  try {
    let response: BaseResponse<any> = yield call(
      updateDeliveryConnectService,
      params
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData(response.data);
        showSuccess("Cập nhật thành công!");
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* getListSubStatusSaga(action: YodyAction) {
  let { status, handleData } = action.payload;
  try {
    let response: BaseResponse<any> = yield call(
      getOrderSubStatusService,
      status
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
  } catch (error) {}
}

function* setSubStatusSaga(action: YodyAction) {
  let { order_id, statusId, handleData } = action.payload;
  const actionText = action.payload.action;
  yield put(showLoading());
  try {
    let response: BaseResponse<Array<DeliveryServiceResponse>> = yield call(
      setSubStatusService,
      order_id,
      statusId,
      actionText
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        showSuccess("Cập nhật trạng thái thành công");
        handleData();
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* getAllChannelSaga(action: YodyAction) {
  const { setData } = action.payload;
  try {
    let response: BaseResponse<Array<ChannelResponse>> = yield call(
      getChannelApi
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* OrderOnlineSaga() {
  yield takeLatest(OrderType.GET_LIST_ORDER_REQUEST, getListOrderSaga);
  yield takeLatest(
    OrderType.GET_LIST_ORDER_CUSTOMER_REQUEST,
    getListOrderCustomerSaga
  );
  yield takeLatest(OrderType.GET_SHIPMENTS_REQUEST, getShipmentsSaga);
  yield takeLatest(OrderType.CREATE_ORDER_REQUEST, orderCreateSaga);
  yield takeLatest(OrderType.CREATE_FPAGE_ORDER_REQUEST, orderFpageCreateSaga);
  yield takeLatest(OrderType.GET_LIST_PAYMENT_METHOD, PaymentMethodGetListSaga);
  yield takeLatest(OrderType.GET_LIST_SOURCE_REQUEST, getDataSource);
  yield takeLatest(OrderType.GET_ORDER_DETAIL_REQUEST, orderDetailSaga);
  yield takeLatest(
    OrderType.UPDATE_FULFILLMENT_METHOD,
    updateFulFillmentStatusSaga
  );
  yield takeLatest(OrderType.UPDATE_SHIPPING_METHOD, updateShipmentSaga);
  yield takeLatest(
    OrderType.GET_LIST_DELIVERY_SERVICE,
    ListDeliveryServicesSaga
  );
  yield takeLatest(OrderType.GET_TRANSPORT_TYPES, getDeliveryTransportTypeSaga);
  yield takeLatest(OrderType.GET_MAPPED_STORES, getDeliveryMappedStoresSaga);
  yield takeLatest(
    OrderType.CREATE_MAPPED_STORE,
    createDeliveryMappedStoreSaga
  );
  yield takeLatest(
    OrderType.DELETE_MAPPED_STORE,
    deleteDeliveryMappedStoreSaga
  );
  yield takeLatest(
    OrderType.UPDATE_3RD_PL_CONNECT,
    updateDeliveryConfigurationSaga
  );

  yield takeLatest(OrderType.UPDATE_PAYMENT_METHOD, updatePaymentSaga);
  yield takeLatest(OrderType.GET_INFO_DELIVERY_GHTK, InfoGHTKSaga);
  yield takeLatest(OrderType.GET_INFO_GHN_FEE, InfoGHNSaga);
  yield takeLatest(OrderType.GET_INFO_VTP_FEE, InfoVTPSaga);
  yield takeLatest(OrderType.GET_LIST_SUB_STATUS, getListSubStatusSaga);
  yield takeLatest(
    OrderType.GET_TRACKING_LOG_FULFILLMENT,
    getTRackingLogFulfillmentSaga
  );
  yield takeLatest(OrderType.GET_TRACKING_LOG_ERROR, getTRackingLogErrorSaga);
  yield takeLatest(OrderType.SET_SUB_STATUS, setSubStatusSaga);
  yield takeLatest(OrderType.GET_LIST_CHANNEL_REQUEST, getAllChannelSaga);
}
