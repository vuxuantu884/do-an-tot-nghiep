import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderModel } from "model/order/order.model";
import { ReturnModel } from "model/order/return.model";
import { ShipmentModel } from "model/order/shipment.model";
import {
  DeliveryMappedStoreType,
  DeliveryServiceResponse,
  DeliveryTransportTypesResponse,
  ErrorLogResponse,
  FeesResponse,
  OrderConfig,
  OrderResponse,
  // OrderSubStatusResponse,
  TrackingLogFulfillmentResponse
} from "model/response/order/order.response";
import { ChannelResponse } from "model/response/product/channel.response";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  cancelOrderApi,
  confirmDraftOrderService,
  createDeliveryMappedStoreService,
  createShippingOrderService,
  deleteDeliveryMappedStoreService,
  getChannelApi,
  getChannelsService,
  getDeliveryMappedStoresService,
  getDeliveryTransportTypesService,
  getDetailOrderApi,
  getFulfillmentsApi,
  getInfoDeliveryFees,
  getOrderConfig,
  getPaymentMethod,
  getReasonsApi,
  getReturnApi,
  getSourcesEcommerceService,
  orderPostApi,
  orderPutApi,
  putFulfillmentsPackApi,
  splitOrderService,
  updateDeliveryConnectService,
  updateOrderPartialService
} from "service/order/order.service";
import { getAmountPayment } from "utils/AppUtils";
import { getPackInfo } from "utils/LocalStorageUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { YodyAction } from "../../../base/base.action";
import { OrderType } from "../../types/order.type";
import { PaymentMethodResponse } from "./../../../model/response/order/paymentmethod.response";
import { SourceEcommerceResponse, SourceResponse } from "./../../../model/response/order/source.response";
import {
  getDeliverieServices,
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
  updateShipment
} from "./../../../service/order/order.service";
import { unauthorizedAction } from "./../../actions/auth/auth.action";

function* getDetailOrderSaga(action:YodyAction){
  let {orderId, setData}= action.payload;
  try{
    let response:BaseResponse<OrderResponse>=yield call(getDetailOrderApi, orderId);
    switch(response.code)
    {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
        default:
          response.errors.forEach(e=>showError(e));
          break;
    }
  }
  catch{
    showError("Có lỗi khi lấy dữ liệu đơn hàng! Vui lòng thử lại sau!")
  }
}

function* getListOrderSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  try {
    let response: BaseResponse<Array<OrderModel>> = yield call(getListOrderApi, query);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        break;
    }
  } catch (error) {
		showError("Có lỗi khi lấy dữ liệu danh sách đơn hàng! Vui lòng thử lại sau!")
	 }
}

function* getListOrderFpageSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  try {
    let response: BaseResponse<Array<OrderModel>> = yield call(getListOrderApi, query);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        break;
    }
  } catch (error) { 
		showError("Có lỗi khi lấy dữ liệu danh sách đơn hàng FPage! Vui lòng thử lại sau!")
	 }
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
  } catch (error) { 
		showError("Có lỗi khi lấy dữ liệu danh sách khách hàng! Vui lòng thử lại sau!")
	 }
}

function* getShipmentsSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  try {
    let response: BaseResponse<Array<ShipmentModel>> = yield call(getShipmentApi, query);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        break;
    }
  } catch (error) {
		console.log('error', error);
		showError("Có lỗi khi lấy dữ liệu đơn giao hàng! Vui lòng thử lại sau!")
	}
}

function* getReturnsSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  try {
    let response: BaseResponse<Array<ReturnModel>> = yield call(getReturnApi, query);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        break;
    }
  } catch (error) {
		showError("Có lỗi khi lấy dữ liệu danh sách trả hàng! Vui lòng thử lại sau!")
	 }
}

function* orderCreateSaga(action: YodyAction) {
  const { request, setData, onError } = action.payload;
  try {
    let response: BaseResponse<OrderResponse> = yield call(orderPostApi, request);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        onError()
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
		showError("Có lỗi khi tạo đơn hàng! Vui lòng thử lại sau!")
  }
}
function* orderUpdateSaga(action: YodyAction) {
  const { id, request, setData, onError } = action.payload;
  try {
    let response: BaseResponse<OrderResponse> = yield call(orderPutApi, id, request);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        onError();
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onError();
		showError("Có lỗi khi cập nhật đơn hàng! Vui lòng thử lại sau!")
  }
}

function* orderFpageCreateSaga(action: YodyAction) {
  const { request, setData, setDisable } = action.payload;
  try {
    let response: BaseResponse<OrderResponse> = yield call(orderPostApi, request);
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
    showError("Có lỗi khi tạo đơn hàng FPage! Vui lòng thử lại sau!")
  }
}

function* InfoFeesSaga(action: YodyAction) {
  const { request, setData } = action.payload;
  try {
    let response: BaseResponse<Array<FeesResponse>> = yield call(
      getInfoDeliveryFees,
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
		showError("Có lỗi khi lấy dữ liệu phí ship! Vui lòng thử lại sau!")
  }
}

function* updateFulFillmentStatusSaga(action: YodyAction) {
  const { request, setData, setError } = action.payload;
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
        setError(true);
        break;
    }
  } catch (error) {
    setError(true);
		showError("Có lỗi khi cập nhật trạng thái fulfillment! Vui lòng thử lại sau!")
  }
}

function* updatePaymentSaga(action: YodyAction) {
  const { request, order_id, setData, setError } = action.payload;
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
        setError(true);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    setError(true);
		showError("Có lỗi khi cập nhật thanh toán! Vui lòng thử lại sau!")
  }
}

function* updateShipmentSaga(action: YodyAction) {
  const { request, setData, setError } = action.payload;
  try {
    let response: BaseResponse<OrderResponse> = yield call(updateShipment, request);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        setError(true);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    setError(true);
		showError("Có lỗi khi cập nhật giao hàng! Vui lòng thử lại sau!")
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
  } catch (error) { 
		showError("Có lỗi khi lấy dữ liệu danh sách cách thức thanh toán đơn hàng! Vui lòng thử lại sau!")
	}
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
  } catch (error) { 
		showError("Có lỗi khi lấy dữ liệu danh sách nguồn đơn hàng! Vui lòng thử lại sau!")
	}
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
    console.log('error', error)
		showError("Có lỗi khi lấy dữ liệu chi tiết đơn hàng! Vui lòng thử lại sau!")
  }
}

function* getTRackingLogFulfillmentSaga(action: YodyAction) {
  const { fulfillment_code, setData } = action.payload;
  try {
    let response: BaseResponse<Array<TrackingLogFulfillmentResponse>> = yield call(
      getTrackingLogFulFillment,
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
		showError("Có lỗi khi lấy dữ liệu danh sách bản ghi trạng thái đơn hàng! Vui lòng thử lại sau!")
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
		showError("Có lỗi khi lấy dữ liệu danh sách bản ghi lỗi trạng thái đơn hàng! Vui lòng thử lại sau!")
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
		showError("Có lỗi khi lấy dữ liệu danh sách phương thức giao hàng! Vui lòng thử lại sau!")
  }
}

function* getDeliveryTransportTypeSaga(action: YodyAction) {
  let { providerCode, handleData } = action.payload;
  try {
    let response: BaseResponse<Array<DeliveryTransportTypesResponse>> = yield call(
      getDeliveryTransportTypesService,
      providerCode
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
		showError("Có lỗi khi lấy dữ liệu danh sách phương thức dịch vụ giao hàng! Vui lòng thử lại sau!")
  }
}

function* getDeliveryMappedStoresSaga(action: YodyAction) {
  let { providerCode, handleData } = action.payload;
  try {
    let response: BaseResponse<Array<DeliveryMappedStoreType>> = yield call(
      getDeliveryMappedStoresService,
      providerCode
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
		showError("Có lỗi khi lấy dữ liệu danh sách mapping cửa hàng! Vui lòng thử lại sau!")
  }
}

function* createDeliveryMappedStoreSaga(action: YodyAction) {
  yield put(showLoading());
  let { providerCode, params, handleData } = action.payload;
  try {
    let response: BaseResponse<any> = yield call(
      createDeliveryMappedStoreService,
      providerCode,
      params
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
		showError("Có lỗi khi tạo mapping cửa hàng! Vui lòng thử lại sau!")
  } finally {
    yield put(hideLoading());
  }
}

function* deleteDeliveryMappedStoreSaga(action: YodyAction) {
  yield put(showLoading());
  let { providerCode, params, handleData } = action.payload;
  try {
    let response: BaseResponse<Array<DeliveryMappedStoreType>> = yield call(
      deleteDeliveryMappedStoreService,
      providerCode,
      params
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        showSuccess("Xóa mapping store thành công!");
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
		showError("Có lỗi khi xóa mapping cửa hàng! Vui lòng thử lại sau!")
  } finally {
    yield put(hideLoading());
    handleData();
  }
}

function* updateDeliveryConfigurationSaga(action: YodyAction) {
  yield put(showLoading());
  let { params, handleData } = action.payload;
  try {
    let response: BaseResponse<any> = yield call(updateDeliveryConnectService, params);
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
		showError("Có lỗi khi cập nhật mapping cửa hàng! Vui lòng thử lại sau!")
  } finally {
    yield put(hideLoading());
  }
}

function* getListSubStatusSaga(action: YodyAction) {
  let { status, handleData } = action.payload;
  try {
    let response: BaseResponse<any> = yield call(getOrderSubStatusService, status);
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
		showError("Có lỗi khi lấy danh sách trạng thái phụ đơn hàng! Vui lòng thử lại sau!")
	}
}

function* setSubStatusSaga(action: YodyAction) {
  let { order_id, statusCode, handleData } = action.payload;
  const actionText = action.payload.action;
  yield put(showLoading());
  try {
    let response: BaseResponse<any> = yield call(
      setSubStatusService,
      order_id,
      statusCode,
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
		showError("Có lỗi khi cập nhật trạng thái phụ đơn hàng! Vui lòng thử lại sau!")
  } finally {
    yield put(hideLoading());
  }
}

function* getAllChannelSaga(action: YodyAction) {
  const { setData } = action.payload;
  try {
    let response: BaseResponse<Array<ChannelResponse>> = yield call(getChannelApi);
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
		showError("Có lỗi khi lấy danh sách kênh đơn hàng! Vui lòng thử lại sau!")
  }
}

function* getListReasonSaga(action: YodyAction) {
  const { setData } = action.payload;
  try {
    let response: BaseResponse<Array<{ id: string; name: string, sub_reasons: any[] }>> = yield call(
      getReasonsApi
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
		showError("Có lỗi khi lấy danh sách lý do! Vui lòng thử lại sau!")
  }
}

function* cancelOrderSaga(action: YodyAction) {
  yield put(showLoading());
  let { id, reason_id, sub_reason_id, reason, onSuccess, onError } = action.payload;
  try {
    let response: BaseResponse<any> = yield call(cancelOrderApi, id, reason_id, sub_reason_id, reason);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        showSuccess("Huỷ đơn hàng thành công!");
        onSuccess();
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onError();
		showError("Có lỗi khi hủy đơn hàng! Vui lòng thử lại sau!")
  } finally {
    yield put(hideLoading());
  }
}

function* configOrderSaga(action: YodyAction) {
  const { setData } = action.payload;
  try {
    let response: BaseResponse<OrderConfig> = yield call(getOrderConfig);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e: any) => showError(e));
        break;
    }
  } catch (error) {
		showError("Có lỗi khi lấy danh sách cấu hình đơn hàng! Vui lòng thử lại sau!")
  }
}

function* getFulfillmentsSaga(action: YodyAction) {
  const { code, setData } = action.payload;
  try {
    let response: BaseResponse<any> = yield call(getFulfillmentsApi, code);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e: any) => showError(e));
        break;
    }
  } catch (error) {
		showError("Có lỗi khi lấy danh sách fulfillment! Vui lòng thử lại sau!")
  }
}

function* putFulfillmentsSagaPack(action: YodyAction) {
  const { request, setData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<any> = yield call(putFulfillmentsPackApi, request);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e: any) => showError(e));
        break;
    }
  } catch (error) {
		showError("Có lỗi khi cập nhật fulfillment! Vui lòng thử lại sau!")
  }
  finally{
    yield put(hideLoading());
  }
}

function* getFulfillmentsPackedSaga(action: YodyAction) {
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
  } catch (error) { 
		showError("Có lỗi khi lấy danh sách fulfillment! Vui lòng thử lại sau!")
	}
}

function* confirmDraftOrderSaga(action: YodyAction) {
  let { orderId, params, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<any> = yield call(
      confirmDraftOrderService,
      orderId,
      params
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        showSuccess(`Xác nhận đơn nháp thành công!`);
        handleData();
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        handleData();
        break;
    }
  } catch (error) {
    showError(`Xác nhận đơn nháp xảy ra lỗi! Vui lòng thử lại sau!`);
    handleData();
  } finally {
    yield put(hideLoading());
  }
}

function* createShippingOrderSaga(action: YodyAction) {
  let { params, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<any> = yield call(createShippingOrderService, params);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        showSuccess(`Đẩy đơn sang bên vận chuyển thành công!`);
        handleData();
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        // response.errors.forEach((e) => showError(e));
        showError(response.message.toString());
        handleData();
        break;
    }
  } catch (error) {
    console.log("error", error);
    showError(`Đẩy đơn sang bên vận chuyển xảy ra lỗi! Vui lòng thử lại sau!`);
  } finally {
    yield put(hideLoading());
  }
}

function* loadOrderPackSaga(action: YodyAction) {
  let { setData } = action.payload;
  let appSetting: string = yield call(getPackInfo);
  let appSettingObj: PageResponse<any> = JSON.parse(appSetting);
  if (appSettingObj) {
    setData(appSettingObj);
  } else {
    setData({
      metadata: {
        limit: 1,
        page: 1,
        total: 0,
      },
      items: [],
    });
  }
}

function* splitOrderSaga(action: YodyAction) {
  let { params, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<any> = yield call(splitOrderService, params);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        showSuccess(`Tách đơn thành công!`);
        handleData(response);
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
    showError(`Tách đơn thất bại! Vui lòng thử lại sau!`);
  } finally {
    yield put(hideLoading());
  }
}

function* getSourcesEcommerceSaga(action: YodyAction) {
  let { setData } = action.payload;
  try {
    let response: BaseResponse<Array<SourceEcommerceResponse>> = yield call(
      getSourcesEcommerceService
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        break;
    }
  } catch (error) { }
}

function* getChannelsSaga(action:YodyAction){
  let{typeId,setData}=action.payload;
  try{
    let response:BaseResponse<ChannelResponse[]>=yield call(getChannelsService, typeId);
    switch(response.code){
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
  }
  catch(e){
    showError(`Có lỗi khi lấy danh sách kênh! Vui lòng thử lại sau!`);
  }
}

function* updateOrderPartial(action:YodyAction){
  let { params, orderID, onSuccess } = action.payload;
  try{
    let response: BaseResponse<any> = yield call(updateOrderPartialService, params, orderID);
    switch(response.code){
      case HttpStatus.SUCCESS:
        onSuccess()
        showSuccess(`Sửa ghi chú thành công!`);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  }
  catch(e){
    showError(`Có lỗi khi lấy danh sách kênh! Vui lòng thử lại sau!`);
  }
}

export function* OrderOnlineSaga() {
  yield takeLatest(OrderType.GET_DETAIL_ORDER_REQUEST,getDetailOrderSaga);
  yield takeLatest(OrderType.GET_LIST_ORDER_REQUEST, getListOrderSaga);
  yield takeLatest(OrderType.GET_LIST_ORDER_FPAGE_REQUEST, getListOrderFpageSaga);
  yield takeLatest(OrderType.GET_LIST_ORDER_CUSTOMER_REQUEST, getListOrderCustomerSaga);
  yield takeLatest(OrderType.GET_SHIPMENTS_REQUEST, getShipmentsSaga);
  yield takeLatest(OrderType.GET_RETURNS_REQUEST, getReturnsSaga);
  yield takeLatest(OrderType.CREATE_ORDER_REQUEST, orderCreateSaga);
  yield takeLatest(OrderType.UPDATE_ORDER_REQUEST, orderUpdateSaga);
  yield takeLatest(OrderType.CREATE_FPAGE_ORDER_REQUEST, orderFpageCreateSaga);
  yield takeLatest(OrderType.GET_LIST_PAYMENT_METHOD, PaymentMethodGetListSaga);
  yield takeLatest(OrderType.GET_LIST_SOURCE_REQUEST, getDataSource);
  yield takeLatest(OrderType.GET_ORDER_DETAIL_REQUEST, orderDetailSaga);
  yield takeLatest(OrderType.UPDATE_FULFILLMENT_METHOD, updateFulFillmentStatusSaga);
  yield takeLatest(OrderType.UPDATE_SHIPPING_METHOD, updateShipmentSaga);
  yield takeLatest(OrderType.GET_LIST_DELIVERY_SERVICE, ListDeliveryServicesSaga);
  yield takeLatest(OrderType.GET_TRANSPORT_TYPES, getDeliveryTransportTypeSaga);
  yield takeLatest(OrderType.GET_MAPPED_STORES, getDeliveryMappedStoresSaga);
  yield takeLatest(OrderType.CREATE_MAPPED_STORE, createDeliveryMappedStoreSaga);
  yield takeLatest(OrderType.DELETE_MAPPED_STORE, deleteDeliveryMappedStoreSaga);
  yield takeLatest(OrderType.UPDATE_3RD_PL_CONNECT, updateDeliveryConfigurationSaga);

  yield takeLatest(OrderType.UPDATE_PAYMENT_METHOD, updatePaymentSaga);
  // yield takeLatest(OrderType.GET_INFO_DELIVERY_GHTK, InfoGHTKSaga);
  // yield takeLatest(OrderType.GET_INFO_GHN_FEE, InfoGHNSaga);
  // yield takeLatest(OrderType.GET_INFO_VTP_FEE, InfoVTPSaga);
  yield takeLatest(OrderType.GET_INFO_FEES, InfoFeesSaga);
  yield takeLatest(OrderType.GET_LIST_SUB_STATUS, getListSubStatusSaga);
  yield takeLatest(OrderType.GET_TRACKING_LOG_FULFILLMENT, getTRackingLogFulfillmentSaga);
  yield takeLatest(OrderType.GET_TRACKING_LOG_ERROR, getTRackingLogErrorSaga);
  yield takeLatest(OrderType.SET_SUB_STATUS, setSubStatusSaga);
  yield takeLatest(OrderType.GET_LIST_CHANNEL_REQUEST, getAllChannelSaga);
  yield takeLatest(OrderType.GET_LIST_REASON_REQUEST, getListReasonSaga);
  yield takeLatest(OrderType.CANCEL_ORDER_REQUEST, cancelOrderSaga);
  yield takeLatest(OrderType.GET_ORDER_CONFIG, configOrderSaga);
  yield takeLatest(OrderType.GET_FULFILLMENTS, getFulfillmentsSaga);
  yield takeLatest(OrderType.GET_FULFILLMENTS_PACK, putFulfillmentsSagaPack);
  yield takeLatest(OrderType.GET_FULFILLMENTS_PACKED, getFulfillmentsPackedSaga);
  yield takeLatest(OrderType.CONFIRM_DRAFT_ORDER, confirmDraftOrderSaga);
  yield takeLatest(OrderType.CREATE_SHIPPING_ORDER, createShippingOrderSaga);
  yield takeLatest(OrderType.GET_LOCALSTOGARE_PACK, loadOrderPackSaga);
  yield takeLatest(OrderType.SPLIT_ORDER, splitOrderSaga);
  yield takeLatest(OrderType.SOURCES_ECOMMERCE, getSourcesEcommerceSaga);
  yield takeLatest(OrderType.GET_CHANNELS, getChannelsSaga);
  yield takeLatest(OrderType.UPDATE_ORDER_PARTIAL_REQUEST, updateOrderPartial);
}