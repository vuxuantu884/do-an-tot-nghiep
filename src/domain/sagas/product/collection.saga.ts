import {call, put, takeLatest} from '@redux-saga/core/effects';
import {YodyAction} from 'base/base.action';
import BaseResponse from 'base/base.response';
import {HttpStatus} from 'config/http-status.config';
import {unauthorizedAction} from 'domain/actions/auth/auth.action';
import { CollectionType } from 'domain/types/product.type';
import {CollectionResponse} from 'model/product/collection.model';
import {
  createCollectionApi,
  getCollectionApi,
  collectionDetailApi,
  updateCollectionApi,
  collectionDeleteApi,
} from 'service/product/collection.service';
import {showError} from 'utils/ToastUtils';

function* getCollectionSaga(action: YodyAction) {
  const {query, setData} = action.payload;
  try {
    let response: BaseResponse<Array<CollectionResponse>> = yield call(
      getCollectionApi,
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
    showError('Có lỗi vui lòng thử lại sau');
  }
}

function* createCollectionSaga(action: YodyAction) {
  const {request, onCreateSuccess} = action.payload;
  try {
    let response: BaseResponse<CollectionResponse> = yield call(
      createCollectionApi,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onCreateSuccess(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError('Có lỗi vui lòng thử lại sau');
  }
}

function* collectionDetailSaga(action: YodyAction) {
  const {id, setData} = action.payload;
  try {
    let response: BaseResponse<CollectionResponse> = yield call(
      collectionDetailApi,
      id
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        setData(false);
        yield put(unauthorizedAction());
        break;
      default:
        setData(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    setData(false);
    showError('Có lỗi vui lòng thử lại sau');
  }
}

function* collectionUpdateSaga(action: YodyAction) {
  const {id, request, onUpdateSuccess} = action.payload;
  try {
    let response: BaseResponse<CollectionResponse> = yield call(
      updateCollectionApi,
      id,
      request
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        onUpdateSuccess(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError('Có lỗi vui lòng thử lại sau');
  }
}

function* collectionDeleteSaga(action: YodyAction) {
  const {id, onDeleteSuccess} = action.payload;
  try {
    let response: BaseResponse<string> = yield call(collectionDeleteApi, id);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        onDeleteSuccess();
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError('Có lỗi vui lòng thử lại sau');
  }
}

export function* collectionSaga() {
  yield takeLatest(CollectionType.GET_COLLECTION_REQUEST, getCollectionSaga);
  yield takeLatest(CollectionType.CREATE_COLLECTION_REQUEST, createCollectionSaga);
  yield takeLatest(CollectionType.DETAIL_COLLECTION_REQUEST, collectionDetailSaga);
  yield takeLatest(CollectionType.UPDATE_COLLECTION_REQUEST, collectionUpdateSaga);
  yield takeLatest(CollectionType.DELETE_COLLECTION_REQUEST, collectionDeleteSaga);
}
