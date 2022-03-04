import {YodyAction} from "base/base.action";
import BaseResponse from "base/base.response";
import {HttpStatus} from "config/http-status.config";
import {unauthorizedAction} from "domain/actions/auth/auth.action";
import {SupplierType} from "domain/types/core.type";
import {PageResponse} from "model/base/base-metadata.response";
import {SupplierResponse} from "model/core/supplier.model";
import {call, put, takeEvery, takeLatest} from "redux-saga/effects";
import {
  supplierDeleteApi,
  supplierDetailApi,
  supplierGetApi,
  supplierPostApi,
  supplierPutApi,
  supplierCreateAddressApi,
  supplierUpdateAddressApi,
  supplierDeleteAddressApi,
  supplierDeletePaymentApi,
  supplierCreatePaymentApi,
  supplierUpdatePaymentApi,
  supplierCreateContactApi,
  supplierUpdateContactApi,
  supplierDeleteContactApi,
} from "service/core/supplier.service";
import {showError} from "utils/ToastUtils";
import {callApiSaga} from "utils/ApiUtils";
function* supplierSearchSaga(action: YodyAction) {
  const {query, searchSupplierCallback} = action.payload;
  try {
    let response: BaseResponse<PageResponse<SupplierResponse>> = yield call(
      supplierGetApi,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        searchSupplierCallback(response.data);
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

function* supplierGetAllSaga(action: YodyAction) {
  const {setData} = action.payload;
  try {
    let response: BaseResponse<PageResponse<SupplierResponse>> = yield call(
      supplierGetApi
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data.items);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        console.log("supplierGetAllSaga:" + response.errors);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("supplierGetAllSaga:" + error);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* supplierUpdateSaga(action: YodyAction) {
  const {id, request, setData} = action.payload;
  yield callApiSaga({isShowError:true, jobName: "supplierUpdateSaga"}, setData, supplierPutApi, id, request);
}

function* supplierDetailSaga(action: YodyAction) {
  const {id, setData} = action.payload;
  try {
    let response: BaseResponse<SupplierResponse> = yield call(supplierDetailApi, id);

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
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* supplierCreateSaga(action: YodyAction) {
  const {request, setData} = action.payload;
  try {
    let response: BaseResponse<SupplierResponse> = yield call(supplierPostApi, request);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());

        break;
      default:
        response.errors.forEach((e) => showError(e));
        setData(null);
        break;
    }
  } catch (error) {
    setData(null);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* supplierDeleteSaga(action: YodyAction) {
  const {id, deleteCallback} = action.payload;
  try {
    let response: BaseResponse<any | null> = yield call(supplierDeleteApi, id);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        deleteCallback(true);
        break;
      case HttpStatus.UNAUTHORIZED:
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

function* createAddressSaga(action: YodyAction) {
  const {id, request, callback} = action.payload;
  try {
    let response: BaseResponse<SupplierResponse> = yield call(
      supplierCreateAddressApi,
      id,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
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

function* updateAddressSaga(action: YodyAction) {
  const {id, addressId, request, callback} = action.payload;
  try {
    let response: BaseResponse<SupplierResponse> = yield call(
      supplierUpdateAddressApi,
      id,
      addressId,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
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

function* deleteAddressSaga(action: YodyAction) {
  const {id, addressId, callback} = action.payload;
  try {
    let response: BaseResponse<SupplierResponse> = yield call(
      supplierDeleteAddressApi,
      id,
      addressId
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
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

function* createPaymentSaga(action: YodyAction) {
  const {id, request, callback} = action.payload;
  try {
    let response: BaseResponse<SupplierResponse> = yield call(
      supplierCreatePaymentApi,
      id,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
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

function* updatePaymentSaga(action: YodyAction) {
  const {id, paymentId, request, callback} = action.payload;
  try {
    let response: BaseResponse<SupplierResponse> = yield call(
      supplierUpdatePaymentApi,
      id,
      paymentId,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
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

function* deletePaymentSaga(action: YodyAction) {
  const {id, paymentId, callback} = action.payload;
  try {
    let response: BaseResponse<SupplierResponse> = yield call(
      supplierDeletePaymentApi,
      id,
      paymentId
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
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

function* createContactSaga(action: YodyAction) {
  const {id, request, callback} = action.payload;
  try {
    let response: BaseResponse<SupplierResponse> = yield call(
      supplierCreateContactApi,
      id,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
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

function* updateContactSaga(action: YodyAction) {
  const {id, contactId, request, callback} = action.payload;
  try {
    let response: BaseResponse<SupplierResponse> = yield call(
      supplierUpdateContactApi,
      id,
      contactId,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
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

function* deleteContactSaga(action: YodyAction) {
  const {id, contactId, callback} = action.payload;
  try {
    let response: BaseResponse<SupplierResponse> = yield call(
      supplierDeleteContactApi,
      id,
      contactId
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
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

export function* supplierSagas() {
  yield takeLatest(SupplierType.SEARCH_SUPPLIER_REQUEST, supplierSearchSaga);
  yield takeLatest(SupplierType.CREATE_SUPPLIER_REQUEST, supplierCreateSaga);
  yield takeEvery(SupplierType.GET_ALL_SUPPLIER_REQUEST, supplierGetAllSaga);
  yield takeLatest(SupplierType.EDIT_SUPPLIER_REQUEST, supplierUpdateSaga);
  yield takeLatest(SupplierType.DETAIL_SUPPLIER_REQUEST, supplierDetailSaga);
  yield takeLatest(SupplierType.DELETE_SUPPLIER_REQUEST, supplierDeleteSaga);
  yield takeLatest(SupplierType.CREATE_ADDRESS_SUPPLIER_REQUEST, createAddressSaga);
  yield takeLatest(SupplierType.UPDATE_ADDRESS_SUPPLIER_REQUEST, updateAddressSaga);
  yield takeLatest(SupplierType.DELETE_ADDRESS_SUPPLIER_REQUEST, deleteAddressSaga);
  yield takeLatest(SupplierType.CREATE_PAYMENT_SUPPLIER_REQUEST, createPaymentSaga);
  yield takeLatest(SupplierType.UPDATE_PAYMENT_SUPPLIER_REQUEST, updatePaymentSaga);
  yield takeLatest(SupplierType.DELETE_PAYMENT_SUPPLIER_REQUEST, deletePaymentSaga);
  yield takeLatest(SupplierType.CREATE_CONTACT_SUPPLIER_REQUEST, createContactSaga);
  yield takeLatest(SupplierType.UPDATE_CONTACT_SUPPLIER_REQUEST, updateContactSaga);
  yield takeLatest(SupplierType.DELETE_CONTACT_SUPPLIER_REQUEST, deleteContactSaga);
}
