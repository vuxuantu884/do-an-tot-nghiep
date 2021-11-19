import {PageResponse} from "model/base/base-metadata.response";
import {YodyAction} from "base/base.action";
import BaseResponse from "base/base.response";
import {HttpStatus} from "config/http-status.config";
import {
  GoodsReceiptsResponse,
  GoodsReceiptsSearchResponse,
  GoodsReceiptsTypeResponse,
  OrderConcernGoodsReceiptsResponse,
} from "model/response/pack/pack.response";
import {
  createGoodsReceiptsService,
  deleteGoodsReceiptsService,
  getByIdGoodsReceiptsService,
  getGoodsReceiptsSerchService,
  getGoodsReceiptsTypeService,
  getOrderConcernGoodsReceiptsService,
  getOrderGoodsReceiptsService,
  updateGoodsReceiptsService,
} from "service/order/order.service";
import {unauthorizedAction} from "./../../actions/auth/auth.action";
import {call, put, takeLatest} from "redux-saga/effects";
import {showError} from "utils/ToastUtils";
import {GoodsReceiptsType} from "domain/types/goods-receipts";
import { OrderResponse } from "model/response/order/order.response";

/**
 * lấy danh sách loại biên bản
 */
function* getGoodsReceiptsTypeSaga(action: YodyAction) {
  let {setData} = action.payload;
  try {
    let response: BaseResponse<Array<GoodsReceiptsTypeResponse>> = yield call(
      getGoodsReceiptsTypeService
    );
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
  } catch (e) {
    showError("Có lỗi xảy ra, vui lòng thử lại");
  }
}

/**
 * tạo biên bản bàn giao
 */
function* createGoodsReceiptsSaga(action: YodyAction) {
  let {data, setData} = action.payload;
  try {
    let response: BaseResponse<GoodsReceiptsResponse> = yield call(
      createGoodsReceiptsService,
      data
    );
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
  } catch (e) {
    showError("Có lỗi xảy ra, vui lòng thử lại");
  }
}

/**
 * tìm kiếm bản bàn giao
 */
function* getGoodsReceiptsSerchSaga(action: YodyAction) {
  let {data, setData} = action.payload;
  try {
    let response: BaseResponse<PageResponse<GoodsReceiptsSearchResponse>> = yield call(
      getGoodsReceiptsSerchService,
      data
    );
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
  } catch (e) {
    showError("Có lỗi xảy ra, vui lòng thử lại");
  }
}

/**
 * cập nhật biên bản bàn giao
 */
function* updateGoodsReceiptsSaga(action: YodyAction) {
  let {goodsReceiptsId, data, setData} = action.payload;
  try {
    let response: BaseResponse<GoodsReceiptsResponse> = yield call(
      updateGoodsReceiptsService,
      goodsReceiptsId,
      data
    );
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
  } catch (e) {
    showError("Có lỗi xảy ra, vui lòng thử lại");
  }
}

/**
 * xóa biên bản bàn giao
 */

function* deleteGoodsReceiptsSaga(action: YodyAction) {
  let {goodsReceiptsId, setData} = action.payload;
  try {
    let response: BaseResponse<any> = yield call(
      deleteGoodsReceiptsService,
      goodsReceiptsId
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(true);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e: any) => showError(e));
        break;
    }
  } catch (e) {
    showError("Có lỗi xảy ra vui lòng thử lại");
  }
}

/**
 * lấy thông tin biên bản bàn giao
 */
function* getByIdGoodsReceiptsSaga(action: YodyAction) {
  let {goodsReceiptsId, setData} = action.payload;
  try {
    let response: BaseResponse<GoodsReceiptsResponse> = yield call(
      getByIdGoodsReceiptsService,
      goodsReceiptsId
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
  } catch {
    showError("Có lỗi xảy ra vui lòng thử lại");
  }
}

function* getOrderConcernGoodsReceiptsSaga(action: YodyAction) {
  let {param, setData} = action.payload;
  try {
    let response: BaseResponse<OrderConcernGoodsReceiptsResponse[]> =
      yield call(getOrderConcernGoodsReceiptsService, param);
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
  } catch {
    showError("Lỗi hệ thống, vui lòng thử lại");
  }
}

/**
 *  Danh sách đơn hàng đủ điều kiện thêm vào biên bản
 */

function* getOrderGoodsReceiptsSaga(action: YodyAction){
  let {setData} = action.payload;
  try {
    let response: BaseResponse<PageResponse<OrderResponse>> =
      yield call(getOrderGoodsReceiptsService);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data.items);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch {
    showError("Lỗi hệ thống, vui lòng thử lại");
  }
}

export function* GoodsReceiptsSaga() {
  yield takeLatest(GoodsReceiptsType.GET_GOODS_RECEIPTS_TYPE, getGoodsReceiptsTypeSaga);
  yield takeLatest(GoodsReceiptsType.CREATE_GOODS_RECEIPTS, createGoodsReceiptsSaga);
  yield takeLatest(GoodsReceiptsType.SEARCH_GOODS_RECEIPTS, getGoodsReceiptsSerchSaga);
  yield takeLatest(GoodsReceiptsType.UPDATE_GOODS_RECEIPTS, updateGoodsReceiptsSaga);
  yield takeLatest(GoodsReceiptsType.DELETE_GOODS_RECEIPTS, deleteGoodsReceiptsSaga);
  yield takeLatest(GoodsReceiptsType.GETBYID_GOODS_RECEIPTS, getByIdGoodsReceiptsSaga);
  yield takeLatest(
    GoodsReceiptsType.GET_ORDER_CONCERN_GOODS_RECEIPTS,
    getOrderConcernGoodsReceiptsSaga
  );
  yield takeLatest(GoodsReceiptsType.GET_ORDER_GOODS_RECEIPTS_ADD,getOrderGoodsReceiptsSaga)
}
