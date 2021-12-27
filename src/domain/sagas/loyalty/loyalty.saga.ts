import { call, put, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { showError, showSuccess } from "utils/ToastUtils";
import { PageResponse } from "model/base/base-metadata.response";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import {
  LoyaltyRankType,
  LoyaltyCardReleaseType,
  LoyaltyCardType,
  LoyaltyProgramType,
  LoyaltyRateType,
  LoyaltyUsageType,
  LoyaltyPointsType,
  LoyaltyPointsAdjustmentType
} from "domain/types/loyalty.type";
import { loyaltyCardUploadApi, searchLoyaltyCardReleaseList } from "service/loyalty/release/loyalty-card-release.service";
import { createLoyaltyRank, deleteLoyaltyRank, getLoyaltyRankDetail, getLoyaltyRankList, updateLoyaltyRank } from "service/loyalty/ranking/loyalty-ranking.service";
import { LoyaltyRankResponse } from "model/response/loyalty/ranking/loyalty-rank.response";
import { LoyaltyCardReleaseResponse } from "model/response/loyalty/release/loyalty-card-release.response";
import { loyaltyCardAssignmentApi, loyaltyCardLockApi, searchLoyaltyCardList } from "service/loyalty/card/loyalty-card.service";
import { LoyaltyAccumulationProgramResponse } from "model/response/loyalty/loyalty-accumulation.response";
import { LoyaltyRateResponse } from "model/response/loyalty/loyalty-rate.response";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import {
  addLoyaltyPointService,
  createLoyaltyProgram,
  createLoyaltyRate,
  createLoyaltyUsage,
  getLoyaltyPoint,
  getLoyaltyProgramDetail,
  getLoyaltyRate,
  getLoyaltyUsage,
  getLoyaltyAdjustPointService,
  searchLoyaltyProgramList,
  subtractLoyaltyPointService,
  updateLoyaltyProgram,
  getPointAdjustmentListService,
  getPointAdjustmentDetailService
} from "service/loyalty/loyalty.service";

function* uploadLoyaltyCardSaga(action: YodyAction) {
  const { file, name, callback } = action.payload;
  try {
    let response: BaseResponse<PageResponse<any>> = yield call(
      loyaltyCardUploadApi,
      file,
      name
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        callback(null);
        yield put(unauthorizedAction());
        break;
      default:
        callback(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    callback(null);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* loyaltyCardAssignmentSaga(action: YodyAction) {
  const { query, id, callback } = action.payload;
  try {
    let response: BaseResponse<PageResponse<any>> = yield call(
      loyaltyCardAssignmentApi,
      id,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        callback(null);
        yield put(unauthorizedAction());
        break;
      default:
        callback(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    callback(null);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* loyaltyCardLockSaga(action: YodyAction) {
  const { id, callback } = action.payload;
  try {
    let response: BaseResponse<PageResponse<any>> = yield call(
      loyaltyCardLockApi,
      id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        callback(null);
        yield put(unauthorizedAction());
        break;
      default:
        callback(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    callback(null);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* getLoyaltyRankingList(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      getLoyaltyRankList,
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

function* getLoyaltyRankingDetail(action: YodyAction) {
  const { id, callback } = action.payload;
  try {
    const response: BaseResponse<LoyaltyRankResponse> = yield call(
      getLoyaltyRankDetail,
      id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
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

function* createLoyaltyRanking(action: YodyAction) {
  const { body, callback } = action.payload;
  try {
    const response: BaseResponse<LoyaltyRankResponse> = yield call(
      createLoyaltyRank,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
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

function* updateLoyaltyRanking(action: YodyAction) {
  const { id, body, callback } = action.payload;
  try {
    const response: BaseResponse<LoyaltyRankResponse> = yield call(
      updateLoyaltyRank,
      id,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
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

function* deleteLoyaltyRankSaga(action: YodyAction) {
  const { id, callback } = action.payload;
  try {
    const response: BaseResponse<any> = yield call(
      deleteLoyaltyRank,
      id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        showSuccess('Xóa thành công')
        callback()
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

function* getLoyaltyCardReleaseList(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<LoyaltyCardReleaseResponse>> = yield call(
      searchLoyaltyCardReleaseList,
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

function* getLoyaltyCardList(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<LoyaltyCardReleaseResponse>> = yield call(
      searchLoyaltyCardList,
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

function* createLoyaltyAccumulationProgram(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    const response: BaseResponse<LoyaltyAccumulationProgramResponse> = yield call(
      createLoyaltyProgram,
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

function* updateLoyaltyAccumulationProgram(action: YodyAction) {
  const { id, query, setData } = action.payload;
  try {
    const response: BaseResponse<LoyaltyAccumulationProgramResponse> = yield call(
      updateLoyaltyProgram,
      id,
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

function* loyaltyDetailSaga(action: YodyAction) {
  const { id, setData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<LoyaltyAccumulationProgramResponse> = yield call(getLoyaltyProgramDetail, id);
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
  } finally {
    yield put(hideLoading());
  }
}

function* loyaltyRateSaga(action: YodyAction) {
  const { setData } = action.payload;
  try {
    let response: BaseResponse<LoyaltyRateResponse> = yield call(getLoyaltyRate);
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

function* createLoyaltyRateSaga(action: YodyAction) {
  const { addingRate, usageRate, enableUsingPoint, setData } = action.payload;
  try {
    let response: BaseResponse<LoyaltyRateResponse> = yield call(createLoyaltyRate, addingRate, usageRate, enableUsingPoint);
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

function* loyaltyUsageSaga(action: YodyAction) {
  const { setData } = action.payload;
  try {
    let response: BaseResponse<LoyaltyRateResponse> = yield call(getLoyaltyUsage);
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

function* createLoyaltyUsageSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    let response: BaseResponse<LoyaltyRateResponse> = yield call(createLoyaltyUsage, query);
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

function* getLoyaltyProgramList(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      searchLoyaltyProgramList,
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

function* getloyaltyPoint(action: YodyAction) {
  const { customerId, setData } = action.payload;
  try {
    const response: BaseResponse<LoyaltyPoint> = yield call(
      getLoyaltyPoint,
      customerId
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e:any) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* addLoyaltyPoint(action: YodyAction) {
  const { customerId, setData, params, onError } = action.payload;
  try {
    const response: BaseResponse<LoyaltyPoint> = yield call(
      addLoyaltyPointService,
      customerId,
      params
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e:any) => showError(e));
        onError()
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* subtractLoyaltyPoint(action: YodyAction) {
  const { customerId, setData, params, onError } = action.payload;
  try {
    const response: BaseResponse<LoyaltyPoint> = yield call(
      subtractLoyaltyPointService,
      customerId,
      params
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e:any) => showError(e));
        onError()
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* getLoyaltyAdjustPointSaga(action: YodyAction) {
  const { customerId, setData, onError } = action.payload;
  try {
    const response: BaseResponse<LoyaltyPoint> = yield call(
      getLoyaltyAdjustPointService,
      customerId,
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e:any) => showError(e));
        onError()
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* getPointAdjustmentListSaga(action: YodyAction) {
  const { query, callback } = action.payload;
  try {
    const response: BaseResponse<LoyaltyPoint> = yield call(
      getPointAdjustmentListService,
      query,
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e:any) => showError(e));
        callback(false);
        break;
    }
  } catch (error) {
    callback(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* getPointAdjustmentDetailSaga(action: YodyAction) {
  const { adjustmentId, callback } = action.payload;
  try {
    const response: BaseResponse<LoyaltyPoint> = yield call(
      getPointAdjustmentDetailService,
      adjustmentId,
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e:any) => showError(e));
        callback(false);
        break;
    }
  } catch (error) {
    callback(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}


export function* loyaltySaga() {
  yield takeLatest(LoyaltyCardReleaseType.UPLOAD, uploadLoyaltyCardSaga);
  yield takeLatest(LoyaltyRankType.SEARCH_LOYALTY_RANK_REQUEST, getLoyaltyRankingList);
  yield takeLatest(LoyaltyRankType.GET_LOYALTY_RANK_DETAIL_REQUEST, getLoyaltyRankingDetail);
  yield takeLatest(LoyaltyRankType.UPDATE_LOYALTY_RANK_REQUEST, updateLoyaltyRanking);
  yield takeLatest(LoyaltyRankType.CREATE_LOYALTY_RANK_REQUEST, createLoyaltyRanking);
  yield takeLatest(LoyaltyRankType.DELELTE_LOYALTY_RANK_REQUEST, deleteLoyaltyRankSaga);
  yield takeLatest(LoyaltyCardReleaseType.SEARCH_LOYALTY_CARD_RELEASE_REQUEST, getLoyaltyCardReleaseList);
  yield takeLatest(LoyaltyCardType.SEARCH_LOYALTY_CARD_REQUEST, getLoyaltyCardList);
  yield takeLatest(LoyaltyCardType.ASSIGN_CUSTOMER_REQUEST, loyaltyCardAssignmentSaga);
  yield takeLatest(LoyaltyCardType.LOCK_CARD_REQUEST, loyaltyCardLockSaga);
  yield takeLatest(LoyaltyProgramType.CREATE_LOYALTY_ACCUMULATION_PROGRAM_REQUEST, createLoyaltyAccumulationProgram);
  yield takeLatest(LoyaltyProgramType.UPDATE_LOYALTY_ACCUMULATION_PROGRAM_REQUEST, updateLoyaltyAccumulationProgram);
  yield takeLatest(LoyaltyProgramType.GET_LOYALTY_ACCUMULATION_PROGRAM_DETAIL, loyaltyDetailSaga);
  yield takeLatest(LoyaltyRateType.GET_LOYALTY_RATE_REQUEST, loyaltyRateSaga);
  yield takeLatest(LoyaltyRateType.CREATE_LOYALTY_RATE_REQUEST, createLoyaltyRateSaga);
  yield takeLatest(LoyaltyUsageType.GET_LOYALTY_USAGE_REQUEST, loyaltyUsageSaga);
  yield takeLatest(LoyaltyUsageType.CREATE_LOYALTY_USAGE_REQUEST, createLoyaltyUsageSaga);
  yield takeLatest(LoyaltyProgramType.GET_LOYALTY_ACCUMULATION_PROGRAM, getLoyaltyProgramList);
  yield takeLatest(LoyaltyPointsType.GET_LOYALTY_POINT, getloyaltyPoint);
  yield takeLatest(LoyaltyPointsType.ADD_LOYALTY_POINT, addLoyaltyPoint);
  yield takeLatest(LoyaltyPointsType.SUBTRACT_LOYALTY_POINT, subtractLoyaltyPoint);
  yield takeLatest(LoyaltyPointsType.GET_LOYALTY_ADJUST_POINT, getLoyaltyAdjustPointSaga);
  yield takeLatest(LoyaltyPointsAdjustmentType.GET_LOYALTY_ADJUST_POINT_LIST, getPointAdjustmentListSaga);
  yield takeLatest(LoyaltyPointsAdjustmentType.GET_LOYALTY_ADJUST_POINT_DETAIL, getPointAdjustmentDetailSaga);
}
