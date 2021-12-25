import {
  createPriceRule,
  searchDiscountList,
  deletePriceRuleById,
  getPriceRuleById,
  bulkEnablePriceRules,
  bulkDeletePriceRules,
  bulkDisablePriceRules,
  getVariantApi,
  updatePriceRuleById
} from 'service/promotion/discount/discount.service';
import { DiscountResponse } from 'model/response/promotion/discount/list-discount.response';
import { YodyAction } from "../../../../base/base.action";
import BaseResponse from "../../../../base/base.response";
import {call, put} from "@redux-saga/core/effects";
import {HttpStatus} from "../../../../config/http-status.config";
import {unauthorizedAction} from "../../../actions/auth/auth.action";
import {showError} from "../../../../utils/ToastUtils";
import {PageResponse} from "../../../../model/base/base-metadata.response";
import {takeLatest} from "typed-redux-saga";
import {DiscountType, PriceRuleType} from "../../../types/promotion.type";
import { all } from "redux-saga/effects";

function* getDiscounts(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<DiscountResponse>> = yield call(
      searchDiscountList,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        setData(null);
        yield put(unauthorizedAction());
        break;
      default:
        setData(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    setData(null);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* getVariantsAct(action: YodyAction) {
  const { id, onResult } = action.payload;
  try {
    let response: BaseResponse<any> = yield call(
      getVariantApi,
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


function* deletePriceRuleByIdAct(action: YodyAction) {
  const { id, onResult } = action.payload;
  try {
    let response: BaseResponse<DiscountResponse> = yield call(
      deletePriceRuleById,
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

function* getPromoCodeDetail(action: YodyAction) {
  const { id, onResult } = action.payload;
  try {
    let response: BaseResponse<DiscountResponse> = yield call(
      getPriceRuleById,
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

function* addPriceRule(action: YodyAction) {
  console.log('addPriceRule - action : ', action);
  const { body, createCallback } = action.payload;
  try {
    const response: BaseResponse<DiscountResponse> = yield call(
      createPriceRule,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        createCallback(response.data)
        break;
      case HttpStatus.UNAUTHORIZED:
        createCallback(null);
        yield put(unauthorizedAction());
        break;
      default:
        createCallback(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    createCallback(null);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* bulkEnablePriceRulesSaga(action: YodyAction) {
  const { body, enableCallback } = action.payload;
  try {
    const response: BaseResponse<{count: number}> = yield call(
      bulkEnablePriceRules,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        enableCallback(response.data.count)
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
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* bulkDisablePriceRulesSaga(action: YodyAction) {
  const { body, disableCallback } = action.payload;
  try {
    const response: BaseResponse<{count: number}> = yield call(
      bulkDisablePriceRules,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        //Số lượng bản ghi đc disable thành công
        disableCallback(response.data.count)
        break;
      case HttpStatus.UNAUTHORIZED:
        disableCallback(false);
        yield put(unauthorizedAction());
        break;
      default:
        disableCallback(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    disableCallback(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* bulkDeletePriceRulesAct(action: YodyAction) {
  console.log('bulkDeletePriceRulesAct - action : ', action);
  const { body, deleteCallback } = action.payload;
  try {
    const response: BaseResponse<DiscountResponse> = yield call(
      bulkDeletePriceRules,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        deleteCallback(true)
        break;
      case HttpStatus.UNAUTHORIZED:
        deleteCallback(false);
        yield put(unauthorizedAction());
        break;
      default:
        deleteCallback(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    deleteCallback(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* updatePriceRuleByIdSaga(action: YodyAction) { 
  const { body, onResult } = action.payload;
  try {
    const response: BaseResponse<DiscountResponse> = yield call(
      updatePriceRuleById,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(true)
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


function* createPriceRuleSaga(action: YodyAction) { 
  const { body, onResult } = action.payload;
  try {
    const response: BaseResponse<DiscountResponse> = yield call(
      createPriceRule,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data)
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

export function* discountSaga() {
  yield all([
    takeLatest(DiscountType.GET_LIST_DISCOUNTS, getDiscounts),
    takeLatest(DiscountType.GET_PROMO_CODE_DETAIL, getPromoCodeDetail),
    takeLatest(DiscountType.DELETE_PRICE_RULE_BY_ID, deletePriceRuleByIdAct),
    takeLatest(DiscountType.ADD_PRICE_RULE, addPriceRule),
    takeLatest(DiscountType.ENABLE_PRICE_RULE, bulkEnablePriceRulesSaga),
    takeLatest(DiscountType.DISABLE_PRICE_RULE, bulkDisablePriceRulesSaga),
    takeLatest(DiscountType.DELETE_BULK_PRICE_RULE, bulkDeletePriceRulesAct),
    takeLatest(DiscountType.GET_VARIANTS, getVariantsAct),
    takeLatest(DiscountType.UPDATE_PRICE_RULE_BY_ID, updatePriceRuleByIdSaga),
    takeLatest(PriceRuleType.CREATE_PRICE_RULE, createPriceRuleSaga)
  ])
}
