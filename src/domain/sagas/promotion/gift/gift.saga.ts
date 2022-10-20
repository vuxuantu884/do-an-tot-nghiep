import {
  createPromotionGiftService,
  getPromotionGiftDetailService,
  updatePromotionGiftService,
  getPromotionGiftProductApplyService,
  getPromotionGiftVariantService,
} from "service/promotion/gift/gift.service";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { call, put } from "@redux-saga/core/effects";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { showError } from "utils/ToastUtils";
import { takeEvery, takeLatest } from "typed-redux-saga";
import { PromotionGiftType } from "domain/types/promotion.type";
import { all } from "redux-saga/effects";
import { PromotionGift } from "model/promotion/gift.model";
import { callApiSaga } from "utils/ApiUtils";
import {
  disablePromotionGiftService,
  enablePromotionGiftService,
  getPromotionGiftListService,
} from "service/promotion/gift/gift.service";
import { hideLoading, showLoading } from "domain/actions/loading.action";


/** Promotion Gift List */
function* getPromotionGiftListSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, setData, getPromotionGiftListService, query);
}

function* getPromotionGiftProductApplySaga(action: YodyAction) {
  const { id, params, onResult } = action.payload;
  yield callApiSaga(
    { isShowError: true, jobName: "đọc danh sách sản phẩm phương thức khuyến mại" },
    onResult,
    getPromotionGiftProductApplyService,
    id,
    params,
  );
}

function* getPromotionGiftVariantSaga(action: YodyAction) {
  const { id, params, onResult } = action.payload;
  yield callApiSaga(
    { isShowError: true, jobName: "đọc danh sách sản phẩm quà tặng" },
    onResult,
    getPromotionGiftVariantService,
    id,
    params,
  );
}

function* getPromotionGiftDetailSaga(action: YodyAction) {
  const { id, onResult } = action.payload;
  try {
    let response: BaseResponse<PromotionGift> = yield call(getPromotionGiftDetailService, id);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        onResult(null);
        yield put(unauthorizedAction());
        break;
      default:
        onResult(null);
        response.errors?.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onResult(null);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* enablePromotionGiftSaga(action: YodyAction) {
  const { id, enableCallback } = action.payload;
  try {
    const response: BaseResponse<any> = yield call(enablePromotionGiftService, id);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        enableCallback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        enableCallback(null);
        yield put(unauthorizedAction());
        break;
      default:
        enableCallback(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    enableCallback(null);
  }
}

function* disablePromotionGiftSaga(action: YodyAction) {
  const { id, disableCallback } = action.payload;
  try {
    const response: BaseResponse<any> = yield call(disablePromotionGiftService, id);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        disableCallback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        disableCallback(null);
        yield put(unauthorizedAction());
        break;
      default:
        disableCallback(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    disableCallback(null);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* updatePromotionGiftSaga(action: YodyAction) {
  const { body, onResult } = action.payload;
  try {
    const response: BaseResponse<PromotionGift> = yield call(updatePromotionGiftService, body);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(true);
        break;
      case HttpStatus.UNAUTHORIZED:
        onResult(false);
        yield put(unauthorizedAction());
        break;
      default:
        onResult(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error: any) {
    onResult(false);
    error.response.data?.errors?.forEach((e: string) => showError(e));
  }
}

function* createPromotionGiftSaga(action: YodyAction) {
  const { body, onResult } = action.payload;
  try {
    const response: BaseResponse<PromotionGift> = yield call(createPromotionGiftService, body);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        onResult(null);
        yield put(unauthorizedAction());
        break;
      default:
        onResult(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error: any) {
    onResult(null);
    error.response.data?.errors?.forEach((e: string) => showError(e));
  }
}

export function* giftSaga() {
  yield all([
    takeLatest(PromotionGiftType.GET_PROMOTION_GIFT_LIST, getPromotionGiftListSaga),
    takeLatest(PromotionGiftType.GET_PROMOTION_GIFT_DETAIL, getPromotionGiftDetailSaga),
    takeLatest(PromotionGiftType.ENABLE_PROMOTION_GIFT, enablePromotionGiftSaga),
    takeLatest(PromotionGiftType.DISABLE_PROMOTION_GIFT, disablePromotionGiftSaga),
    takeEvery(PromotionGiftType.GET_PROMOTION_GIFT_PRODUCT_APPLY, getPromotionGiftProductApplySaga),
    takeLatest(PromotionGiftType.GET_PROMOTION_GIFT_VARIANT, getPromotionGiftVariantSaga),
    takeLatest(PromotionGiftType.UPDATE_PROMOTION_GIFT, updatePromotionGiftSaga),
    takeLatest(PromotionGiftType.CREATE_PROMOTION_GIFT, createPromotionGiftSaga),
  ]);
}
