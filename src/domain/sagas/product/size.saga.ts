import { SizeType } from 'domain/types/product.type';
import { SizeResponse } from 'model/response/products/size.response';
import { call,  put,  takeLatest } from '@redux-saga/core/effects';
import { YodyAction } from 'base/BaseAction';
import BaseResponse from 'base/BaseResponse';
import { HttpStatus } from 'config/HttpStatus';
import { getAllSizeApi, sizeCreateApi, sizeDeleteManyApi, sizeDeleteOneApi, sizeDetailApi, sizeUpdateApi } from 'service/product/size.service';
import { showError } from 'utils/ToastUtils';
import { PageResponse } from 'model/response/base-metadata.response';
import { hideLoading, showLoading } from 'domain/actions/loading.action';

function* getAllSizeSaga(action: YodyAction) {
  const {setData} = action.payload;
  try {
    let response: BaseResponse<PageResponse<SizeResponse>> = yield call(getAllSizeApi);
    switch(response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data.items);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError('Có lỗi vui lòng thử lại sau');
  }
}

function* sizeSearchSaga(action: YodyAction) {
  const {setData} = action.payload;
  try {
    let response: BaseResponse<PageResponse<SizeResponse>> = yield call(getAllSizeApi);
    yield put(showLoading())
    switch(response.code) {
      case HttpStatus.SUCCESS:
         yield put(hideLoading())
        setData(response.data);
        break;
      default:
        yield put(hideLoading())
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    yield put(hideLoading())
    showError('Có lỗi vui lòng thử lại sau');
  }
}

function* sizeCreateSaga(action: YodyAction) {
  const {request, onCreateSuccess} = action.payload;
  try {
    let response: BaseResponse<SizeResponse> = yield call(sizeCreateApi, request);
    yield put(showLoading())
    switch(response.code) {
      case HttpStatus.SUCCESS:
         yield put(hideLoading())
         onCreateSuccess()
        break;
      default:
        yield put(hideLoading())
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    yield put(hideLoading())
    showError('Có lỗi vui lòng thử lại sau');
  }
}

function* sizeDetailSaga(action: YodyAction) {
  const {id, setData} = action.payload;
  try {
    let response: BaseResponse<SizeResponse> = yield call(sizeDetailApi, id);
    yield put(showLoading())
    switch(response.code) {
      case HttpStatus.SUCCESS:
         yield put(hideLoading())
         setData(response.data)
        break;
      default:
        yield put(hideLoading())
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    yield put(hideLoading())
    showError('Có lỗi vui lòng thử lại sau');
  }
}

function* sizeUpdateSaga(action: YodyAction) {
  const {id, request, onUpdateSuccess} = action.payload;
  try {
    let response: BaseResponse<SizeResponse> = yield call(sizeUpdateApi, id, request);
    yield put(showLoading())
    switch(response.code) {
      case HttpStatus.SUCCESS:
         yield put(hideLoading())
         onUpdateSuccess()
        break;
      default:
        yield put(hideLoading())
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    yield put(hideLoading())
    showError('Có lỗi vui lòng thử lại sau');
  }
}

function* sizeDeleteSaga(action: YodyAction) {
  const {id, onDeleteSuccess} = action.payload;
  try {
    let response: BaseResponse<SizeResponse> = yield call(sizeDeleteOneApi, id);
    switch(response.code) {
      case HttpStatus.SUCCESS:
         yield put(hideLoading())
         onDeleteSuccess()
        break;
      default:
        yield put(hideLoading())
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    yield put(hideLoading())
    showError('Có lỗi vui lòng thử lại sau');
  }
}

function* sizeDeleteManySaga(action: YodyAction) {
  const {ids, onDeleteSuccess} = action.payload;
  try {
    let response: BaseResponse<string> = yield call(sizeDeleteManyApi, ids);
    switch(response.code) {
      case HttpStatus.SUCCESS:
         yield put(hideLoading())
         onDeleteSuccess()
        break;
      default:
        yield put(hideLoading())
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    yield put(hideLoading())
    showError('Có lỗi vui lòng thử lại sau');
  }
}

export function* sizeSaga() {
  yield takeLatest(SizeType.GET_ALL_SIZE_REQUEST, getAllSizeSaga);
  yield takeLatest(SizeType.SEARCH_SIZE_REQUEST, sizeSearchSaga);
  yield takeLatest(SizeType.CREATE_SIZE_REQUEST, sizeCreateSaga);
  yield takeLatest(SizeType.DETAIL_SIZE_REQUEST, sizeDetailSaga);
  yield takeLatest(SizeType.UPDATE_SIZE_REQUEST, sizeUpdateSaga);
  yield takeLatest(SizeType.DELETE_SIZE_REQUEST, sizeDeleteSaga);
  yield takeLatest(SizeType.DELETE_MANY_SIZE_REQUEST, sizeDeleteManySaga);
}