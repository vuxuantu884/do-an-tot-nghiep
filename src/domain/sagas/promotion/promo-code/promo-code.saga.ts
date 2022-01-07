import { 
  checkPromoCode,
  addPromoCode,
  deletePromoCodeById,
  getAllPromoCodeList,
  getPromoCodeById,
  updatePromoCodeById,
  deleteBulkPromoCode,
  publishedBulkPromoCode,
  enableBulkPromoCode,
  disableBulkPromoCode
} from '../../../../service/promotion/promo-code/promo-code.service';
import {YodyAction} from "../../../../base/base.action";
import BaseResponse from "../../../../base/base.response";
import {call, put, takeLatest} from "@redux-saga/core/effects";
import {HttpStatus} from "../../../../config/http-status.config";
import {unauthorizedAction} from "../../../actions/auth/auth.action";
import {showError} from "../../../../utils/ToastUtils";
import {PageResponse} from "../../../../model/base/base-metadata.response"; 
import {PromoCodeType} from "../../../types/promotion.type";
import { all } from "redux-saga/effects";
import { DiscountCode } from 'model/promotion/price-rules.model';

function* checkPromoCodeAtc(action: YodyAction) {
  const { code, handleResponse } = action.payload;
  try {
    const response: BaseResponse<PageResponse<DiscountCode>> = yield call(
      checkPromoCode,
      code
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleResponse(true);
        break;
      case HttpStatus.UNAUTHORIZED:
        handleResponse(false);
        yield put(unauthorizedAction());
        break;
      default:
        handleResponse(false);
        break;
    }
  } catch (error) {
    handleResponse(false);
  }
}

function* getPromoCode(action: YodyAction) {
  const { priceRuleId, query, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<DiscountCode>> = yield call(
      getAllPromoCodeList,
      priceRuleId,
      query
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

function* getPromoCodeByIdAct(action: YodyAction) {
  const { priceRuleId, id, onResult } = action.payload;
  try {
    let response: BaseResponse<DiscountCode> = yield call(
      getPromoCodeById,
      priceRuleId,
      id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
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
  } catch (error) {
    onResult(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* deletePromoCodeByIdAct(action: YodyAction) {
  console.log('deletePriceRuleByIdAct - action : ', action);
  const { priceRuleId, id, deleteCallBack } = action.payload;
  try {
    const response: BaseResponse<DiscountCode> = yield call(
      deletePromoCodeById,
      priceRuleId,
      id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        deleteCallBack(true);
        break;
      case HttpStatus.UNAUTHORIZED:
        deleteCallBack(false);
        yield put(unauthorizedAction());
        break;
      default:
        deleteCallBack(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    deleteCallBack(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* updatePromoCodeByIdAct(action: YodyAction) {
  console.log('updatePromoCodeByIdAct - action : ', action);
  const { priceRuleId, body, updateCallBack } = action.payload;
  try {
    const response: BaseResponse<DiscountCode> = yield call(
      updatePromoCodeById,
      priceRuleId,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        updateCallBack(true);
        break;
      case HttpStatus.UNAUTHORIZED:
        updateCallBack(false);
        yield put(unauthorizedAction());
        break;
      default:
        updateCallBack(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    updateCallBack(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* addPromoCodeManualAct(action: YodyAction) {
  const { priceRuleId, body, addCallBack } = action.payload;
  try {
    const response: BaseResponse<DiscountCode> = yield call(
      addPromoCode,
      priceRuleId,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        addCallBack(true);
        break;
      case HttpStatus.UNAUTHORIZED:
        addCallBack(false);
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        addCallBack(false);
        break;
    }
  } catch (error: any) {
    if(typeof error?.response.data.message === 'string') {
    showError(error?.response.data.message || "Có lỗi vui lòng thử lại sau");
    }
    addCallBack(false);
  }
}

function* deleteBulkPromoCodeAct(action: YodyAction) {
  console.log('deleteBulkPromoCodeAct - action : ', action);
  const { priceRuleId, body, deleteCallBack } = action.payload;
  try {
    const response: BaseResponse<DiscountCode> = yield call(
      deleteBulkPromoCode,
      priceRuleId,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        deleteCallBack(true)
        break;
      case HttpStatus.UNAUTHORIZED:
        deleteCallBack(false)
        yield put(unauthorizedAction());
        break;
      default:
        deleteCallBack(false)
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    deleteCallBack(false)
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* publishedBulkPromoCodeAct(action: YodyAction) {
  console.log('publishedBulkPromoCodeAct - action : ', action);
  const { priceRuleId, body, publishedCallBack } = action.payload;
  try {
    const response: BaseResponse<DiscountCode> = yield call(
      publishedBulkPromoCode,
      priceRuleId,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        publishedCallBack(true)
        break;
      case HttpStatus.UNAUTHORIZED:
        publishedCallBack(false)
        yield put(unauthorizedAction());
        break;
      default:
        publishedCallBack(false)
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    publishedCallBack(false)
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* enableBulkPromoCodeAct(action: YodyAction) {
  console.log('enableBulkPromoCodeAct - action : ', action);
  const { priceRuleId, body, enableCallBack } = action.payload;
  try {
    const response: BaseResponse<DiscountCode> = yield call(
      enableBulkPromoCode,
      priceRuleId,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        enableCallBack(true)
        break;
      case HttpStatus.UNAUTHORIZED:
        enableCallBack(false)
        yield put(unauthorizedAction());
        break;
      default:
        enableCallBack(false)
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    enableCallBack(false)
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* disableBulkPromoCodeAct(action: YodyAction) {
  console.log('disableBulkPromoCodeAct - action : ', action);
  const { priceRuleId, body, disableCallBack } = action.payload;
  try {
    const response: BaseResponse<DiscountCode> = yield call(
      disableBulkPromoCode,
      priceRuleId,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        disableCallBack(true)
        break;
      case HttpStatus.UNAUTHORIZED:
        disableCallBack(false)
        yield put(unauthorizedAction());
        break;
      default:
        disableCallBack(false)
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    disableCallBack(false)
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* promoCodeSaga() {
  yield all([
    takeLatest(PromoCodeType.CHECK_PROMO_CODE, checkPromoCodeAtc),
    takeLatest(PromoCodeType.GET_LIST_PROMO_CODE, getPromoCode),
    takeLatest(PromoCodeType.GET_PROMO_CODE_BY_ID, getPromoCodeByIdAct),
    takeLatest(PromoCodeType.DELETE_PROMO_CODE_BY_ID, deletePromoCodeByIdAct),
    takeLatest(PromoCodeType.UPDATE_PROMO_CODE_BY_ID, updatePromoCodeByIdAct),
    takeLatest(PromoCodeType.ADD_PROMO_CODE, addPromoCodeManualAct),
    takeLatest(PromoCodeType.DELETE_PROMO_CODE_BULK, deleteBulkPromoCodeAct),
    takeLatest(PromoCodeType.PUBLISHED_PROMO_CODE_BULK, publishedBulkPromoCodeAct),
    takeLatest(PromoCodeType.ENABLE_PROMO_CODE_BULK, enableBulkPromoCodeAct),
    takeLatest(PromoCodeType.DISABLE_PROMO_CODE_BULK, disableBulkPromoCodeAct)
  ])
}
