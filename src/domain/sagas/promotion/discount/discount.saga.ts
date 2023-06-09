import {
  createPriceRule,
  searchDiscountList,
  deletePriceRuleById,
  getPriceRuleById,
  bulkEnablePriceRules,
  bulkDeletePriceRules,
  bulkDisablePriceRules,
  getVariantApi,
  updatePriceRuleById,
  getPriceRuleVariantApi,
  searchProductDiscountVariantApi,
} from "service/promotion/discount/discount.service";
import { YodyAction } from "../../../../base/base.action";
import BaseResponse from "../../../../base/base.response";
import { call, put } from "@redux-saga/core/effects";
import { HttpStatus } from "../../../../config/http-status.config";
import { unauthorizedAction } from "../../../actions/auth/auth.action";
import { showError } from "../../../../utils/ToastUtils";
import { PageResponse } from "../../../../model/base/base-metadata.response";
import { delay, takeEvery, takeLatest } from "typed-redux-saga";
import { DiscountType, PriceRuleType } from "domain/types/promotion.type";
import { all } from "redux-saga/effects";
import { PriceRule, ProductEntitlements } from "model/promotion/price-rules.model";
import { isFetchApiSuccessful } from "utils/AppUtils";
import { fetchApiErrorAction } from "domain/actions/app.action";
import { callApiSaga } from "utils/ApiUtils";

function* getDiscounts(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<PriceRule>> = yield call(searchDiscountList, query);
    if (isFetchApiSuccessful(response)) {
      setData(response.data);
    } else {
      setData(null);
      yield put(fetchApiErrorAction(response, "Thông tin khuyến mại đơn hàng"));
    }
  } catch (error) {
    setData(null);
    showError("Có lỗi khi lấy thông tin khuyến mại đơn hàng. Vui lòng thử lại sau!");
  }
}

function* getVariantsAct(action: YodyAction) {
  const { id, onResult } = action.payload;
  try {
    let response: BaseResponse<any> = yield call(getVariantApi, id);
    if (isFetchApiSuccessful(response)) {
      onResult(response.data);
    } else {
      onResult(false);
      yield put(fetchApiErrorAction(response, "Danh sách sản phẩm"));
    }
  } catch (error) {
    onResult(false);
    showError("Có lỗi khi lấy danh sách sản phẩm. Vui lòng thử lại sau!");
  }
}

function* getPriceRuleVariantPaggingAction(action: YodyAction) {
  const { id, params, onResult } = action.payload;
  yield callApiSaga(
    { isShowError: true, jobName: "đọc danh sách sản phẩm chiêt khấu" },
    onResult,
    getPriceRuleVariantApi,
    id,
    params,
  );
}

function* deletePriceRuleByIdAct(action: YodyAction) {
  const { id, onResult } = action.payload;
  try {
    let response: BaseResponse<PriceRule> = yield call(deletePriceRuleById, id);
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* getPromoCodeDetail(action: YodyAction) {
  const { id, onResult } = action.payload;
  try {
    let response: BaseResponse<PriceRule> = yield call(getPriceRuleById, id);
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

function* addPriceRule(action: YodyAction) {
  console.log("addPriceRule - action : ", action);
  const { body, createCallback } = action.payload;
  try {
    const response: BaseResponse<PriceRule> = yield call(createPriceRule, body);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        createCallback(response.data);
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* bulkEnablePriceRulesSaga(action: YodyAction) {
  const { body, enableCallback } = action.payload;
  try {
    const response: BaseResponse<{ count: number }> = yield call(bulkEnablePriceRules, body);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        enableCallback(response.data.count);
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* bulkDisablePriceRulesSaga(action: YodyAction) {
  const { body, disableCallback } = action.payload;
  try {
    const response: BaseResponse<{ count: number }> = yield call(bulkDisablePriceRules, body);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        //Số lượng bản ghi đc disable thành công
        disableCallback(response.data.count);
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

function* bulkDeletePriceRulesAct(action: YodyAction) {
  console.log("bulkDeletePriceRulesAct - action : ", action);
  const { body, deleteCallback } = action.payload;
  try {
    const response: BaseResponse<PriceRule> = yield call(bulkDeletePriceRules, body);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        deleteCallback(true);
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* updatePriceRuleByIdSaga(action: YodyAction) {
  const { body, onResult } = action.payload;
  try {
    const response: BaseResponse<PriceRule> = yield call(updatePriceRuleById, body);
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

function* createPriceRuleSaga(action: YodyAction) {
  const { body, onResult } = action.payload;
  try {
    const response: BaseResponse<PriceRule> = yield call(createPriceRule, body);
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

function* searchProductDiscountVariantSaga(action: YodyAction) {
  const { id, query, setData } = action.payload;
  try {
    yield delay(500);
    let response: BaseResponse<PageResponse<ProductEntitlements>> = yield call(
      searchProductDiscountVariantApi,
      id,
      query,
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        console.log(response);
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* discountSaga() {
  yield all([
    takeLatest(DiscountType.GET_LIST_DISCOUNTS, getDiscounts),
    takeLatest(DiscountType.GET_PRICE_RULE_DETAIL, getPromoCodeDetail),
    takeLatest(DiscountType.DELETE_PRICE_RULE_BY_ID, deletePriceRuleByIdAct),
    takeLatest(DiscountType.ADD_PRICE_RULE, addPriceRule),
    takeLatest(DiscountType.ENABLE_PRICE_RULE, bulkEnablePriceRulesSaga),
    takeLatest(DiscountType.DISABLE_PRICE_RULE, bulkDisablePriceRulesSaga),
    takeLatest(DiscountType.DELETE_BULK_PRICE_RULE, bulkDeletePriceRulesAct),
    takeEvery(DiscountType.GET_VARIANTS, getVariantsAct),
    takeEvery(DiscountType.GET_PRICE_RULE_VARIANTS_PAGGING, getPriceRuleVariantPaggingAction),
    takeLatest(DiscountType.UPDATE_PRICE_RULE_BY_ID, updatePriceRuleByIdSaga),
    takeLatest(PriceRuleType.CREATE_PRICE_RULE, createPriceRuleSaga),
    takeLatest(DiscountType.SEARCH_PRODUCT_DISCOUNT_VARIANT, searchProductDiscountVariantSaga),
  ]);
}
