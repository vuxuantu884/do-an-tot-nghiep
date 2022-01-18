import BaseResponse from "base/base.response";
import { fetchApiErrorAction } from "domain/actions/app.action";
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
	getFulFillmentDetailAction,
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
	rePushFulFillmentService,
	splitOrderService,
	updateDeliveryConnectService,
	updateOrderPartialService
} from "service/order/order.service";
import { isFetchApiSuccessful } from "utils/AppUtils";
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

function* getDetailOrderSaga(action: YodyAction) {
	let { orderId, setData } = action.payload;
	try {
		let response: BaseResponse<OrderResponse> = yield call(getDetailOrderApi, orderId);
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Chi tiết đơn hàng"));
		}
	}
	catch {
		showError("Có lỗi khi lấy chi tiết đơn hàng! Vui lòng thử lại sau!")
	}
}

function* getListOrderSaga(action: YodyAction) {
	let { query, setData, handleError } = action.payload;
	try {
		let response: BaseResponse<Array<OrderModel>> = yield call(getListOrderApi, query);
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			handleError()
			yield put(fetchApiErrorAction(response, "Danh sách đơn hàng"));
		}
	} catch (error) {
		showError("Có lỗi khi lấy dữ liệu danh sách đơn hàng! Vui lòng thử lại sau!")
		handleError()
	}
}

function* getListOrderFpageSaga(action: YodyAction) {
	let { query, setData } = action.payload;
	try {
		let response: BaseResponse<Array<OrderModel>> = yield call(getListOrderApi, query);
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách đơn hàng Fpage"));
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
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách khách hàng"));
		}
	} catch (error) {
		showError("Có lỗi khi lấy dữ liệu danh sách khách hàng! Vui lòng thử lại sau!")
	}
}

function* getShipmentsSaga(action: YodyAction) {
	let { query, setData, handleError } = action.payload;
	try {
		let response: BaseResponse<Array<ShipmentModel>> = yield call(getShipmentApi, query);
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			handleError()
			yield put(fetchApiErrorAction(response, "Danh sách giao hàng"));
		}
	} catch (error) {
		console.log('error', error);
		handleError();
		showError("Có lỗi khi lấy dữ liệu giao hàng! Vui lòng thử lại sau!")
	}
}

function* getReturnsSaga(action: YodyAction) {
	let { query, setData } = action.payload;
	try {
		let response: BaseResponse<Array<ReturnModel>> = yield call(getReturnApi, query);
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách trả hàng"));
		}
	} catch (error) {
		showError("Có lỗi khi lấy dữ liệu danh sách trả hàng! Vui lòng thử lại sau!")
	}
}

function* orderCreateSaga(action: YodyAction) {
	const { request, setData, onError } = action.payload;
	try {
		let response: BaseResponse<OrderResponse> = yield call(orderPostApi, request);
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			onError()
			yield put(fetchApiErrorAction(response, "Tạo đơn hàng"));
		}
	} catch (error) {
		onError()
		showError("Có lỗi khi tạo đơn hàng! Vui lòng thử lại sau!")
	}
}
function* orderUpdateSaga(action: YodyAction) {
	const { id, request, setData, onError } = action.payload;
	try {
		let response: BaseResponse<OrderResponse> = yield call(orderPutApi, id, request);
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Cập nhật đơn hàng"));
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
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			setDisable(false);
			yield put(fetchApiErrorAction(response, "Tạo đơn hàng Fpage"));
		}
	} catch (error) {
		setDisable(false);
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
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Phí ship"));
		}
	} catch (error) {
		showError("Có lỗi khi lấy dữ liệu phí ship! Vui lòng thử lại sau!")
	}
}

function* updateFulFillmentStatusSaga(action: YodyAction) {
	const { request, setData, setError } = action.payload;
	yield put(showLoading())
	try {
		let response: BaseResponse<OrderResponse> = yield call(
			updateFulFillmentStatus,
			request
		);
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			setError(true);
			yield put(fetchApiErrorAction(response, "Cập nhật trạng thái fulfillment"));
		}
	} catch (error) {
		setError(true);
		showError("Có lỗi khi cập nhật trạng thái fulfillment! Vui lòng thử lại sau!")
	} finally {
		yield put(hideLoading())
	}
}

function* rePushFulFillmentSaga(action: YodyAction) {
	const { fulfillment_id, setData, setError } = action.payload;
	try {
		let response: BaseResponse<any> = yield call(
			rePushFulFillmentService,
			fulfillment_id
		);
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Đẩy đơn sang HVC"));
		}
	} catch (error) {
		setError(true);
		showError("Đẩy đơn sang HVC thất bại. Vui lòng thử lại!”")
	}
}

function* updatePaymentSaga(action: YodyAction) {
	const { request, order_id, setData, setError } = action.payload;
	yield put(showLoading());
	try {
		let response: BaseResponse<OrderResponse> = yield call(
			updatePayment,
			request,
			order_id
		);
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			setError(true);
			yield put(fetchApiErrorAction(response, "Cập nhật thanh toán"));
		}
	} catch (error) {
		setError(true);
		showError("Có lỗi khi cập nhật thanh toán! Vui lòng thử lại sau!")
	} finally {
		yield put(hideLoading());
	}
}

function* updateShipmentSaga(action: YodyAction) {
	const { request, setData, setError } = action.payload;
	yield put(showLoading());
	try {
		let response: BaseResponse<OrderResponse> = yield call(updateShipment, request);
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			setError(true)
			yield put(fetchApiErrorAction(response, "Cập nhật giao hàng"));
		}
	} catch (error) {
		setError(true);
		showError("Có lỗi khi cập nhật giao hàng! Vui lòng thử lại sau!")
	} finally {
		yield put(hideLoading());
	}
}

function* PaymentMethodGetListSaga(action: YodyAction) {
	let { setData } = action.payload;
	yield put(showLoading());
	try {
		let response: BaseResponse<Array<PaymentMethodResponse>> = yield call(
			getPaymentMethod
		);
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách cách thức thanh toán"));
		}
	} catch (error) {
		showError("Có lỗi khi lấy dữ liệu danh sách cách thức thanh toán đơn hàng! Vui lòng thử lại sau!")
	} finally {
		yield put(hideLoading());
	}
}

function* getDataSource(action: YodyAction) {
	let { setData } = action.payload;
	yield put(showLoading());
	try {
		let response: BaseResponse<PageResponse<Array<SourceResponse>>> = yield call(getSources);
		if (isFetchApiSuccessful(response)) {
			setData(response.data.items);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách nguồn đơn hàng"));
		}
	} catch (error) {
		showError("Có lỗi khi lấy dữ liệu danh sách nguồn đơn hàng! Vui lòng thử lại sau!")
	} finally {
		yield put(hideLoading());
	}
}

function* orderDetailSaga(action: YodyAction) {
	const { id, setData } = action.payload;
	yield put(showLoading());
	try {
		let response: BaseResponse<OrderResponse> = yield call(getOrderDetail, id);
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Chi tiết đơn hàng"));
		}
	} catch (error) {
		console.log('error', error)
		showError("Có lỗi khi lấy dữ liệu chi tiết đơn hàng! Vui lòng thử lại sau!")
	} finally {
		yield put(hideLoading());
	}
}

function* getFulfillmentDetailSaga(action: YodyAction) {
	const { fulfillment_code, setData } = action.payload;
	yield put(showLoading());
	try {
		let response: BaseResponse<any> = yield call(
			getFulFillmentDetailAction,
			fulfillment_code
		);
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Dữ liệu đơn giao hàng"));
		}
	} catch (error) {
		showError("Có lỗi khi lấy dữ liệu đơn giao hàng! Vui lòng thử lại sau!")
	} finally {
		yield put(hideLoading());
	}
}

function* getTRackingLogFulfillmentSaga(action: YodyAction) {
	const { fulfillment_code, setData } = action.payload;
	yield put(showLoading());
	try {
		let response: BaseResponse<Array<TrackingLogFulfillmentResponse>> = yield call(
			getTrackingLogFulFillment,
			fulfillment_code
		);
		if (isFetchApiSuccessful(response)) {
			setData(
				response.data.sort((a, b) => {
					return b.id - a.id;
				})
			);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách bản ghi trạng thái đơn hàng"));
		}
	} catch (error) {
		showError("Có lỗi khi lấy dữ liệu danh sách bản ghi trạng thái đơn hàng! Vui lòng thử lại sau!")
	} finally {
		yield put(hideLoading());
	}
}

function* getTRackingLogErrorSaga(action: YodyAction) {
	const { fulfillment_code, setData } = action.payload;
	try {
		let response: BaseResponse<Array<ErrorLogResponse>> = yield call(
			getTrackingLogFulFillmentError,
			fulfillment_code
		);
		if (isFetchApiSuccessful(response)) {
			setData(
				response.data.sort((a, b) => {
					return b.id - a.id;
				})
			);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách bản ghi lỗi trạng thái đơn hàng"));
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
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách phương thức giao hàng"));
		}
	} catch (error) {
		showError("Có lỗi khi lấy dữ liệu danh sách phương thức giao hàng! Vui lòng thử lại sau!")
	}
}

function* getDeliveryTransportTypeSaga(action: YodyAction) {
	let { providerCode, handleData } = action.payload;
	yield put(showLoading());
	try {
		let response: BaseResponse<Array<DeliveryTransportTypesResponse>> = yield call(
			getDeliveryTransportTypesService,
			providerCode
		);
		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách dịch vụ giao hàng"));
		}
	} catch (error) {
		showError("Có lỗi khi lấy danh sách dịch vụ giao hàng! Vui lòng thử lại sau!")
	} finally {
		yield put(hideLoading());
	}
}

function* getDeliveryMappedStoresSaga(action: YodyAction) {
	let { providerCode, handleData } = action.payload;
	yield put(showLoading());
	try {
		let response: BaseResponse<Array<DeliveryMappedStoreType>> = yield call(
			getDeliveryMappedStoresService,
			providerCode
		);
		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách mapping cửa hàng"));
		}
	} catch (error) {
		showError("Có lỗi khi lấy dữ liệu danh sách mapping cửa hàng! Vui lòng thử lại sau!")
	} finally {
		yield put(hideLoading());
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
		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
			showSuccess("Thêm mapping store thành công!");
		} else {
			yield put(fetchApiErrorAction(response, "Tạo mapping cửa hàng"));
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
		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
			showSuccess("Xóa mapping cửa hàng thành công!");
		} else {
			yield put(fetchApiErrorAction(response, "Xóa mapping cửa hàng"));
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
		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
			showSuccess("Cập nhật thành công!");
		} else {
			yield put(fetchApiErrorAction(response, "Cập nhật mapping cửa hàng"));
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
		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách trạng thái phụ đơn hàng"));
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
		if (isFetchApiSuccessful(response)) {
			showSuccess("Cập nhật trạng thái phụ đơn hàng thành công!");
				handleData();
		} else {
			yield put(fetchApiErrorAction(response, "Cập nhật trạng thái phụ đơn hàng"));
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
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách kênh"));
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
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách lý do"));
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
		if (isFetchApiSuccessful(response)) {
			showSuccess("Huỷ đơn hàng thành công!");
				onSuccess();
		} else {
			yield put(fetchApiErrorAction(response, "Hủy đơn hàng"));
		}
	} catch (error) {
		onError();
		showError("Có lỗi khi hủy đơn hàng! Vui lòng thử lại sau!")
	} finally {
		yield put(hideLoading());
	}
}

function* orderConfigSaga(action: YodyAction) {
	const { setData } = action.payload;
	yield put(showLoading());
	try {
		let response: BaseResponse<OrderConfig> = yield call(getOrderConfig);
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách cấu hình đơn hàng"));
		}
	} catch (error) {
		showError("Có lỗi khi lấy danh sách cấu hình đơn hàng! Vui lòng thử lại sau!")
	} finally {
		yield put(hideLoading());
	}
}

function* getFulfillmentsSaga(action: YodyAction) {
	const { code, setData } = action.payload;
	yield put(showLoading());
	try {
		let response: BaseResponse<any> = yield call(getFulfillmentsApi, code);
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách fulfillment"));
		}
	} catch (error) {
		showError("Có lỗi khi lấy danh sách fulfillment! Vui lòng thử lại sau!")
	} finally {
		yield put(hideLoading());
	}
}

function* putFulfillmentsSagaPack(action: YodyAction) {
	const { request, setData } = action.payload;
	yield put(showLoading());
	try {
		let response: BaseResponse<any> = yield call(putFulfillmentsPackApi, request);
		if (isFetchApiSuccessful(response)) {
			setData(response);
		} else {
			yield put(fetchApiErrorAction(response, "Cập nhật fulfillment"));
		}
	} catch (error) {
		showError("Có lỗi khi cập nhật fulfillment! Vui lòng thử lại sau!")
	}
	finally {
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
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách fulfillment"));
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
		if (isFetchApiSuccessful(response)) {
			showSuccess(`Xác nhận đơn nháp thành công!`);
			handleData();
		} else {
			yield put(fetchApiErrorAction(response, "Xác nhận đơn nháp"));
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
		if (isFetchApiSuccessful(response)) {
			showSuccess(`Đẩy đơn sang bên vận chuyển thành công!`);
			handleData();
		} else {
			yield put(fetchApiErrorAction(response, "Đẩy đơn sang bên vận chuyển"));
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
		if (isFetchApiSuccessful(response)) {
			showSuccess(`Tách đơn thành công!`);
			handleData(response);
		} else {
			yield put(fetchApiErrorAction(response, "Tách đơn"));
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
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách nguồn Ecommerce"));
		}
	} catch (error) {
		console.log('error', error)
	}
}

function* getChannelsSaga(action: YodyAction) {
	let { typeId, setData } = action.payload;
	try {
		let response: BaseResponse<ChannelResponse[]> = yield call(getChannelsService, typeId);
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách kênh"));
		}
	}
	catch (error) {
		console.log('error', error)
		showError(`Có lỗi khi lấy danh sách kênh! Vui lòng thử lại sau!`);
	}
}

function* updateOrderPartial(action: YodyAction) {
	let { params, orderID, onSuccess } = action.payload;
	yield put(showLoading())
	try {
		let response: BaseResponse<any> = yield call(updateOrderPartialService, params, orderID);
		if (isFetchApiSuccessful(response)) {
			onSuccess()
			showSuccess(`Cập nhật đơn hàng thành công!`);
		} else {
			yield put(fetchApiErrorAction(response, "Cập nhật đơn hàng"));
		}
	}
	catch (e) {
		showError(`Có lỗi khi cập nhật đơn hàng! Vui lòng thử lại sau!`);
	} finally {
		yield put(hideLoading())
	}
}

export function* OrderOnlineSaga() {
	yield takeLatest(OrderType.GET_DETAIL_ORDER_REQUEST, getDetailOrderSaga);
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
	yield takeLatest(OrderType.REPUSH_FULFILLMENT, rePushFulFillmentSaga);
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
	yield takeLatest(OrderType.GET_FULFILLMENT_DETAIL, getFulfillmentDetailSaga);
	yield takeLatest(OrderType.GET_TRACKING_LOG_FULFILLMENT, getTRackingLogFulfillmentSaga);
	yield takeLatest(OrderType.GET_TRACKING_LOG_ERROR, getTRackingLogErrorSaga);
	yield takeLatest(OrderType.SET_SUB_STATUS, setSubStatusSaga);
	yield takeLatest(OrderType.GET_LIST_CHANNEL_REQUEST, getAllChannelSaga);
	yield takeLatest(OrderType.GET_LIST_REASON_REQUEST, getListReasonSaga);
	yield takeLatest(OrderType.CANCEL_ORDER_REQUEST, cancelOrderSaga);
	yield takeLatest(OrderType.GET_ORDER_CONFIG, orderConfigSaga);
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
