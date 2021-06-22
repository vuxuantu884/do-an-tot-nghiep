import { YodyAction } from "base/BaseAction";
import { takeLatest, call } from "@redux-saga/core/effects";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { ContentType } from "domain/types/content.type";
import { countryGetApi, getDistrictApi } from "service/content/content.service";
import { showError } from "utils/ToastUtils";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import { put } from "redux-saga/effects";
import { unauthorizedAction } from "domain/actions/auth/auth.action";

function* countryGetSaga(action: YodyAction) {
  const { setData } = action.payload;
  try {
    let response: BaseResponse<Array<CountryResponse>> = yield call(
      countryGetApi
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

function* districtGetSaga(action: YodyAction) {
  const { countryId, setData } = action.payload;
  try {
    let response: BaseResponse<Array<DistrictResponse>> = yield call(
      getDistrictApi,
      countryId
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

export function* contentSaga() {
  yield takeLatest(ContentType.GET_COUNTRY_REQUEST, countryGetSaga);
  yield takeLatest(ContentType.GET_DISTRICT_REQUEST, districtGetSaga);
}
