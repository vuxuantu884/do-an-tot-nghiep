import { colorDeleteManyApi, colorDeleteOneApi, colorSearchApi } from 'service/product/color.service';
import { call, takeLatest, takeEvery } from '@redux-saga/core/effects';
import { YodyAction } from 'base/BaseAction';
import BaseResponse from 'base/BaseResponse';
import { HttpStatus } from 'config/HttpStatus';
import { showError } from 'utils/ToastUtils';
import { PageResponse } from 'model/response/base-metadata.response';
import { ColorResponse } from 'model/response/products/color.response';
import { ColorType } from 'domain/types/product.type';

function* searchColorSaga(action: YodyAction) {
  const {query,setData} = action.payload;
  try {
    debugger;
    let response: BaseResponse<PageResponse<ColorResponse>> = yield call(colorSearchApi, query);
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

function* getColorSaga(action: YodyAction) {
  const {query, setData} = action.payload;
  try {
   
    let response: BaseResponse<PageResponse<ColorResponse>> = yield call(colorSearchApi,query);
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

function* deleteColorSaga(action: YodyAction) {
  const {id, onDeleteSuccess} = action.payload;
  try {
    let response: BaseResponse<string> = yield call(colorDeleteOneApi, id);
    switch(response.code) {
      case HttpStatus.SUCCESS:
        onDeleteSuccess();
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError('Có lỗi vui lòng thử lại sau');
  }
}

function* deleteManyColorSaga(action: YodyAction) {
  const {ids, onDeleteSuccess} = action.payload;
  try {
    let response: BaseResponse<string> = yield call(colorDeleteManyApi, ids);
    switch(response.code) {
      case HttpStatus.SUCCESS:
        onDeleteSuccess();
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError('Có lỗi vui lòng thử lại sau');
  }
}

export function* colorSaga() {
  yield takeLatest(ColorType.SEARCH_COLOR_REQUEST, searchColorSaga);
  yield takeEvery(ColorType.GET_COLOR_REQUEST, getColorSaga);
  yield takeLatest(ColorType.DELETE_COLOR_REQUEST, deleteColorSaga);
  yield takeLatest(ColorType.DELETE_MANY_COLOR_REQUEST, deleteManyColorSaga);
}