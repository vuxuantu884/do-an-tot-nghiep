import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { GoodsReceiptsType } from "domain/types/goods-receipts";
import { PageResponse } from "model/base/base-metadata.response";
import {
  GoodsReceiptsResponse,
  GoodsReceiptsSearchResponse,
  GoodsReceiptsTypeResponse,
  OrderConcernGoodsReceiptsResponse
} from "model/response/pack/pack.response";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  createGoodsReceiptsService,
  deleteGoodsReceiptsService,
  getByIdGoodsReceiptsService,
  getGoodsReceiptsSerchService,
  getGoodsReceiptsTypeService,
  getOrderConcernGoodsReceiptsService,
  getOrderGoodsReceiptsService,
  updateGoodsReceiptsService,
  getPrintGoodsReceiptsService,
  deleteAllGoodsReceipService,
} from "service/order/order-pack.service";
import {unauthorizedAction} from "./../../actions/auth/auth.action";
import {showError} from "utils/ToastUtils";
import { OrderResponse } from "model/response/order/order.response";
import { hideLoading, showLoading } from "domain/actions/loading.action";

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
  put(showLoading())
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
    console.log(e)
  }
  finally{
    put(hideLoading())
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
  yield put(showLoading())
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
        if (response.errors && response.errors.length) {
          response.errors.forEach((e: any) => showError(e));
        } else {
          showError(response.message)
        }
        break;
    }
  } catch (e) {
    console.log(e)
    showError("Có lỗi xảy ra, vui lòng thử lại");
  }
  finally{
    yield put(hideLoading())
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
 * xóa nhiều biên bản bàn giao
 * @param action 
 */
function* deleteAllGoodsReceipSaga(action: YodyAction)
{
  let {request,setData}=action.payload;
  yield put(showLoading());
  try{
    let response : BaseResponse<GoodsReceiptsResponse>=yield call(deleteAllGoodsReceipService, request);
    switch(response.code){
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e:any)=>showError(e));
        break;
    }
  }
  catch(e){
    console.log(e);
    showError("Có lỗi xảy ra khi xoá nhiều biên bản bàn giao");
  }
  finally {
    yield put(hideLoading());
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

/**
 * In 
 */
function* getPrintGoodsReceiptsSaga(action:YodyAction)
{
  const{ids,type,setData}=action.payload;
  try{
    let response:BaseResponse<any>=yield call(getPrintGoodsReceiptsService, ids, type);
    switch(response.code){
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e:any)=>showError(e));
        break;
    }
  }
  catch{
    showError("xảy ra lỗi in biên bản bàn giao, vui long thử lại sau");
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
  yield takeLatest(GoodsReceiptsType.GET_PRINT_GOODS_RECEIPTS, getPrintGoodsReceiptsSaga)
  yield takeLatest(GoodsReceiptsType.DELETE_ALL_GOODS_RECEIPTS,deleteAllGoodsReceipSaga)
}
