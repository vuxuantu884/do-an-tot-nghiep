import { YodyAction } from 'base/BaseAction';
import { takeLatest, call} from "@redux-saga/core/effects";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { ContentType } from "domain/types/content.type";
import { getCountry } from "service/content/content.service";
import { showError } from "utils/ToastUtils";
import { CountryResponse } from 'model/response/content/country.response';

function* getCountrySaga(action: YodyAction) {
    const {setData} = action.payload;
  try {
    debugger;
    let response: BaseResponse<Array<CountryResponse>> = yield call(getCountry);
    switch(response.code) {
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
}