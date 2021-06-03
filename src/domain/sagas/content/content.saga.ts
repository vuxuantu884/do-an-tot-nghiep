import { YodyAction } from 'base/BaseAction';
import { takeLatest, call } from "@redux-saga/core/effects";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { ContentType } from "domain/types/content.type";
import { getCountry, getDistrictApi } from "service/content/content.service";
import { showError } from "utils/ToastUtils";
import { CountryResponse } from 'model/response/content/country.response';
import { DistrictResponse } from 'model/response/content/district.response';

function* getCountrySaga(action: YodyAction) {
  const { setData } = action.payload;
  try {
    let response: BaseResponse<Array<CountryResponse>> = yield call(getCountry);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError('Có lỗi vui lòng thử lại sau');
  }
}

function* getDistrictSaga(action: YodyAction) {
  const {countryId, setData } = action.payload;
  try {
    let response: BaseResponse<Array<DistrictResponse>> = yield call(getDistrictApi, countryId);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError('Có lỗi vui lòng thử lại sau');
  }
}

export function* contentSaga() {
  yield takeLatest(ContentType.GET_COUNTRY_REQUEST, getCountrySaga);
  yield takeLatest(ContentType.GET_DISTRICT_REQUEST, getDistrictSaga);
}