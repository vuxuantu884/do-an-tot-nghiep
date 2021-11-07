import { PromoCodeResponse } from '../../../../model/response/promotion/promo-code/list-promo-code.response';
import { 
  addPromoCode,
  deletePromoCodeById,
  getAllPromoCodeList,
  getPromoCodeById,
  updatePromoCodeById,
  deleteBulkPromoCode
} from '../../../../service/promotion/promo-code/promo-code.service';
import {YodyAction} from "../../../../base/base.action";
import BaseResponse from "../../../../base/base.response";
import {call, put} from "@redux-saga/core/effects";
import {HttpStatus} from "../../../../config/http-status.config";
import {unauthorizedAction} from "../../../actions/auth/auth.action";
import {showError} from "../../../../utils/ToastUtils";
import {PageResponse} from "../../../../model/base/base-metadata.response";
import {takeLatest} from "typed-redux-saga";
import {PromoCodeType} from "../../../types/promotion.type";
import { all } from "redux-saga/effects";

function* getPromoCode(action: YodyAction) {
  const { priceRuleId, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<PromoCodeResponse>> = yield call(
      getAllPromoCodeList,
      priceRuleId
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
    let response: BaseResponse<PromoCodeResponse> = yield call(
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
    const response: BaseResponse<PromoCodeResponse> = yield call(
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
    const response: BaseResponse<PromoCodeResponse> = yield call(
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
  console.log('addPromoCodeManualAct - action : ', action);
  const { priceRuleId, body, addCallBack } = action.payload;
  try {
    const response: BaseResponse<PromoCodeResponse> = yield call(
      addPromoCode,
      priceRuleId,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        addCallBack(true)
        break;
      case HttpStatus.UNAUTHORIZED:
        addCallBack(false)
        yield put(unauthorizedAction());
        break;
      default:
        addCallBack(false)
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    addCallBack(false)
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* deleteBulkPromoCodeAct(action: YodyAction) {
  console.log('deleteBulkPromoCodeAct - action : ', action);
  const { priceRuleId, body, deleteCallBack } = action.payload;
  try {
    const response: BaseResponse<PromoCodeResponse> = yield call(
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

export function* promoCodeSaga() {
  yield all([
    takeLatest(PromoCodeType.GET_LIST_PROMO_CODE, getPromoCode),
    takeLatest(PromoCodeType.GET_PROMO_CODE_BY_ID, getPromoCodeByIdAct),
    takeLatest(PromoCodeType.DELETE_PROMO_CODE_BY_ID, deletePromoCodeByIdAct),
    takeLatest(PromoCodeType.UPDATE_PROMO_CODE_BY_ID, updatePromoCodeByIdAct),
    takeLatest(PromoCodeType.ADD_PROMO_CODE, addPromoCodeManualAct),
    takeLatest(PromoCodeType.DELETE_PROMO_CODE_BULK, deleteBulkPromoCodeAct)
  ])
}
