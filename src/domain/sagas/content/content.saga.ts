import { getCityByCountryApi, getDistrictByCityApi, getGroupsApi } from './../../../service/content/content.service';
import { YodyAction } from "base/base.action";
import { takeLatest, call } from "@redux-saga/core/effects";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { ContentType } from "domain/types/content.type";
import { countryGetApi, getDistrictApi, getWardApi } from "service/content/content.service";
import { showError } from "utils/ToastUtils";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import { put, takeEvery } from "redux-saga/effects";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { GroupResponse } from 'model/content/group.model';

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
    // showError("Có lỗi vui lòng thử lại sau");
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* cityByCountryGetSaga(action: YodyAction) {
  const { countryId, setData } = action.payload;
  try {
    let response: BaseResponse<Array<any>> = yield call(
      getCityByCountryApi,
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* districtByCityGetSaga(action: YodyAction) {
  const { cityId, setData } = action.payload;
  try {
    let response: BaseResponse<Array<DistrictResponse>> = yield call(
      getDistrictByCityApi,
      cityId
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* wardGetSaga(action: YodyAction) {
  const { districtId, setData } = action.payload;
  try {
    let response: BaseResponse<Array<DistrictResponse>> = yield call(
      getWardApi,
      districtId
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* groupGetSaga(action: YodyAction) {
  const { setData } = action.payload;
  try {
    let response: BaseResponse<Array<GroupResponse>> = yield call(getGroupsApi);
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* contentSaga() {
  yield takeLatest(ContentType.GET_COUNTRY_REQUEST, countryGetSaga);
  yield takeEvery(ContentType.GET_DISTRICT_REQUEST, districtGetSaga);
  yield takeLatest(ContentType.GET_GROUP_REQUEST, groupGetSaga);
  yield takeEvery(ContentType.GET_WARD_REQUEST, wardGetSaga);
  yield takeEvery(ContentType.GET_CITY_BY_COUNTRY_REQUEST, cityByCountryGetSaga);
  yield takeEvery(ContentType.GET_DISTRICT_BY_CITY_REQUEST, districtByCityGetSaga);
}
