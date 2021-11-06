import { updatePromoCodeById } from './../../../../service/promotion/promo-code/promo-code.service';
import { PromoCodeResponse } from '../../../../model/response/promotion/promo-code/list-promo-code.response';
import { 
  addPromoCodeManual,
  deletePromoCodeById,
  getAllPromoCodeList,
  getPromoCodeById 
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
  const { priceRuleId, id, onDeleteSuccess } = action.payload;
  try {
    const response: BaseResponse<PromoCodeResponse> = yield call(
      deletePromoCodeById,
      priceRuleId,
      id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onDeleteSuccess()
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

function* updatePromoCodeByIdAct(action: YodyAction) {
  console.log('updatePromoCodeByIdAct - action : ', action);
  const { priceRuleId, body, onDeleteSuccess } = action.payload;
  try {
    const response: BaseResponse<PromoCodeResponse> = yield call(
      updatePromoCodeById,
      priceRuleId,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onDeleteSuccess()
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

function* addPromoCodeManualAct(action: YodyAction) {
  console.log('addPromoCodeManualAct - action : ', action);
  const { priceRuleId, body, onAddSuccess } = action.payload;
  try {
    const response: BaseResponse<PromoCodeResponse> = yield call(
      addPromoCodeManual,
      priceRuleId,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onAddSuccess()
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

export function* promoCodeSaga() {
  yield all([
    takeLatest(PromoCodeType.GET_LIST_PROMO_CODE, getPromoCode),
    takeLatest(PromoCodeType.GET_PROMO_CODE_BY_ID, getPromoCodeByIdAct),
    takeLatest(PromoCodeType.DELETE_PROMO_CODE_BY_ID, deletePromoCodeByIdAct),
    takeLatest(PromoCodeType.UPDATE_PROMO_CODE_BY_ID, updatePromoCodeByIdAct),
    takeLatest(PromoCodeType.ADD_PROMO_CODE_MANUAL, addPromoCodeManualAct)
  ])
}
