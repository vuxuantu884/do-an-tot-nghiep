import { PageResponse } from "model/base/base-metadata.response";
import { CustomerResponse } from "model/response/customer/customer.response";
import BaseResponse from "base/base.response";
import { YodyAction } from "base/base.action";
import { call, put, takeLatest } from "redux-saga/effects";
import { HttpStatus } from "config/http-status.config";
import {
  createBillingAddress,
  createContact,
  createCustomer,
  createShippingAddress,
  deleteBillingAddress,
  deleteContact,
  deleteShippingAddress,
  getCustomerGroups,
  getCustomerLevels,
  getCustomers,
  getCustomerTypes,
  getDetailCustomer,
  updateBillingAddress,
  updateContact,
  updateCustomer,
  updateShippingAddress,
  createNote,
  updateNote,
  deleteNote,
  getCustomersSo,
  importCustomerService,
  getCustomerOrderHistoryApi,
  getCustomerOrderReturnHistoryApi,
  getCustomerActivityLogApi,
  getCustomerActivityLogDetailApi,
  createFamilyMemberService,
  updateFamilyMemberService,
  deleteFamilyMemberService,
} from "service/customer/customer.service";
import { showError } from "utils/ToastUtils";
import { isFetchApiSuccessful } from "utils/AppUtils";
import { callApiSaga } from "utils/ApiUtils";
import { CustomerType } from "domain/types/customer.type";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { fetchApiErrorAction } from "domain/actions/app.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";

function* onKeySearchCustomerChange(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    if (query.request.length >= 3) {
      const response: BaseResponse<PageResponse<CustomerResponse>> = yield call(
        getCustomers,
        query,
      );
      switch (response.code) {
        case HttpStatus.SUCCESS:
          setData(response.data.items);
          break;
        case HttpStatus.UNAUTHORIZED:
          yield put(unauthorizedAction());
          break;
        default:
          response.errors.forEach((e) => showError(e));
          break;
      }
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* onKeySearchCustomerChangeSo(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    if (query.request.length >= 3) {
      const response: BaseResponse<PageResponse<CustomerResponse>> = yield call(
        getCustomersSo,
        query,
      );
      if (isFetchApiSuccessful(response)) {
        setData(response.data.items);
      } else {
        yield put(fetchApiErrorAction(response, "Tìm kiếm khách hàng"));
      }
    }
  } catch (error) {
    showError("Có lỗi khi tìm kiếm khách hàng! Vui lòng thử lại sau!");
  }
}

function* getCustomerList(action: YodyAction) {
  const { query, setData } = action.payload;
  yield put(showLoading());
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(getCustomers, query);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        setData(false);
        break;
    }
  } catch (error) {
    setData(false);
    // showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* getCustomerByPhone(action: YodyAction) {
  const { query, setData } = action.payload;
  yield put(showLoading());
  try {
    const response: BaseResponse<CustomerResponse> = yield call(getCustomers, query);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        setData(null);
        yield put(unauthorizedAction());
        break;
      default:
        setData(null);
        // response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* CustomerDetail(action: YodyAction) {
  const { id, setData } = action.payload;
  if (isNaN(id)) {
    showError("Mã khách hàng không hợp lệ. Vui lòng kiểm tra lại");
    setData(null);
    return ;
  }
  yield put(showLoading());
  try {
    const response: BaseResponse<CustomerResponse> = yield call(getDetailCustomer, id);
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
  } finally {
    yield put(hideLoading());
  }
}

// get customer's order history
function* getCustomerOrderHistorySaga(action: YodyAction) {
  const { queryParams, callback } = action.payload;
  yield put(showLoading());
  try {
    const response: BaseResponse<any> = yield call(getCustomerOrderHistoryApi, queryParams);
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
  } finally {
    yield put(hideLoading());
  }
}

// get customer's order return history
function* getCustomerOrderReturnHistorySaga(action: YodyAction) {
  const { customer_id, callback } = action.payload;
  yield put(showLoading());
  try {
    const response: BaseResponse<any> = yield call(getCustomerOrderReturnHistoryApi, customer_id);
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
  } finally {
    yield put(hideLoading());
  }
}

// get customer's activity log
function* getCustomerActivityLogSaga(action: YodyAction) {
  const { queryParams, callback } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, callback, getCustomerActivityLogApi, queryParams);
}

// get customer's activity log detail
function* getCustomerActivityLogDetailSaga(action: YodyAction) {
  const { log_id, callback } = action.payload;
  yield callApiSaga(
    { notifyAction: "SHOW_ALL" },
    callback,
    getCustomerActivityLogDetailApi,
    log_id,
  );
}

function* CustomerGroups(action: YodyAction) {
  const { setData } = action.payload;
  yield put(showLoading());
  try {
    const response: BaseResponse<CustomerResponse> = yield call(getCustomerGroups);
    if (isFetchApiSuccessful(response)) {
      setData(response.data);
    } else {
      yield put(fetchApiErrorAction(response, "Danh sách nhóm khách hàng"));
    }
  } catch (error) {
    showError("Có lỗi khi lấy danh sách nhóm khách hàng. Vui lòng thử lại sau!");
  } finally {
    yield put(hideLoading());
  }
}

function* CustomerLevels(action: YodyAction) {
  const { setData } = action.payload;
  yield put(showLoading());
  try {
    const response: BaseResponse<CustomerResponse> = yield call(getCustomerLevels);
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
  } finally {
    yield put(hideLoading());
  }
}

function* CustomerTypes(action: YodyAction) {
  const { setData } = action.payload;
  yield put(showLoading());
  try {
    const response: BaseResponse<CustomerResponse> = yield call(getCustomerTypes);
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
  } finally {
    yield put(hideLoading());
  }
}

function* CreateCustomer(action: YodyAction) {
  const { request, setResult } = action.payload;
  yield put(showLoading());
  try {
    const response: BaseResponse<any> = yield call(createCustomer, request);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        setResult(null);
        yield put(unauthorizedAction());
        break;
      default:
        setResult(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* UpdateCustomer(action: YodyAction) {
  const { id, request, setResult } = action.payload;
  yield put(showLoading());
  try {
    const response: BaseResponse<any> = yield call(updateCustomer, id, request);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        setResult(null);
        yield put(unauthorizedAction());
        break;
      default:
        setResult(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* UpdateBillingAddress(action: YodyAction) {
  const { customerId, id, address, setResult } = action.payload;
  try {
    const response: BaseResponse<any> = yield call(updateBillingAddress, id, customerId, address);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        setResult(null);
        yield put(unauthorizedAction());
        break;
      default:
        setResult(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* CreateBillingAddress(action: YodyAction) {
  const { customerId, address, setResult } = action.payload;
  try {
    const response: BaseResponse<any> = yield call(createBillingAddress, customerId, address);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        setResult(null);
        yield put(unauthorizedAction());
        break;
      default:
        setResult(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* UpdateShippingAddress(action: YodyAction) {
  const { customerId, id, address, setResult } = action.payload;
  try {
    const response: BaseResponse<any> = yield call(updateShippingAddress, id, customerId, address);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        setResult(null);
        yield put(unauthorizedAction());
        break;
      default:
        setResult(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* UpdateNote(action: YodyAction) {
  const { customerId, id, note, setResult } = action.payload;
  try {
    const response: BaseResponse<any> = yield call(updateNote, id, customerId, note);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        setResult(null);
        yield put(unauthorizedAction());
        break;
      default:
        setResult(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* CreateNote(action: YodyAction) {
  const { customerId, note, setResult } = action.payload;
  try {
    const response: BaseResponse<any> = yield call(createNote, customerId, note);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        setResult(null);
        yield put(unauthorizedAction());
        break;
      default:
        setResult(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* CreateShippingAddress(action: YodyAction) {
  const { customerId, address, setResult } = action.payload;
  try {
    const response: BaseResponse<any> = yield call(createShippingAddress, customerId, address);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        setResult(null);
        yield put(unauthorizedAction());
        break;
      default:
        setResult(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* UpdateContact(action: YodyAction) {
  const { customerId, id, contact, setResult } = action.payload;
  try {
    const response: BaseResponse<any> = yield call(updateContact, id, customerId, contact);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        setResult(null);
        yield put(unauthorizedAction());
        break;
      default:
        setResult(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* CreateContact(action: YodyAction) {
  const { customerId, contact, setResult } = action.payload;
  try {
    const response: BaseResponse<any> = yield call(createContact, customerId, contact);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        setResult(null);
        yield put(unauthorizedAction());
        break;
      default:
        setResult(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* DeleteBillingAddress(action: YodyAction) {
  const { customerId, id, setResult } = action.payload;
  try {
    const response: BaseResponse<any> = yield call(deleteBillingAddress, id, customerId);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setResult(response.data || "OK");
        break;
      case HttpStatus.UNAUTHORIZED:
        setResult(null);
        yield put(unauthorizedAction());
        break;
      default:
        setResult(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* DeleteContact(action: YodyAction) {
  const { customerId, id, setResult } = action.payload;
  try {
    const response: BaseResponse<any> = yield call(deleteContact, id, customerId);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setResult(response.data || "OK");
        break;
      case HttpStatus.UNAUTHORIZED:
        setResult(null);
        yield put(unauthorizedAction());
        break;
      default:
        setResult(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* DeleteShippingAddress(action: YodyAction) {
  const { customerId, id, setResult } = action.payload;
  try {
    const response: BaseResponse<any> = yield call(deleteShippingAddress, id, customerId);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setResult(response.data || "OK");
        break;
      case HttpStatus.UNAUTHORIZED:
        setResult(null);
        yield put(unauthorizedAction());
        break;
      default:
        setResult(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* DeleteNote(action: YodyAction) {
  const { customerId, id, setResult } = action.payload;
  try {
    const response: BaseResponse<any> = yield call(deleteNote, id, customerId);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setResult(response.data || "OK");
        break;
      case HttpStatus.UNAUTHORIZED:
        setResult(null);
        yield put(unauthorizedAction());
        break;
      default:
        setResult(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* importCustomerSaga(action: YodyAction) {
  const { queryParams, callback } = action.payload;
  yield put(showLoading());
  try {
    const response: BaseResponse<any> = yield call(importCustomerService, queryParams);
    if (response.code) {
      callback(response);
    } else {
      callback(null);
      yield put(unauthorizedAction());
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

/** family info */
function* createFamilyMemberSaga(action: YodyAction) {
  const { customerId, memberInfo, callback } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, callback, createFamilyMemberService, customerId, memberInfo);
}

function* updateFamilyMemberSaga(action: YodyAction) {
  const { id, customerId, memberInfo, callback } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, callback, updateFamilyMemberService, id, customerId, memberInfo);
}

function* deleteFamilyMemberSaga(action: YodyAction) {
  const { id, customerId, callback } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, callback, deleteFamilyMemberService, id, customerId);
}


export default function* customerSagas() {
  yield takeLatest(CustomerType.KEY_SEARCH_CUSTOMER_CHANGE, onKeySearchCustomerChange);
  yield takeLatest(CustomerType.KEY_SEARCH_CUSTOMER_CHANGE_SO, onKeySearchCustomerChangeSo);
  yield takeLatest(CustomerType.CUSTOMER_LIST, getCustomerList);

  yield takeLatest(CustomerType.CUSTOMER_SEARCH_BY_PHONE, getCustomerByPhone);
  yield takeLatest(CustomerType.CUSTOMER_DETAIL, CustomerDetail);
  yield takeLatest(CustomerType.CUSTOMER_ORDER_HISTORY, getCustomerOrderHistorySaga);
  yield takeLatest(CustomerType.CUSTOMER_ORDER_RETURN_HISTORY, getCustomerOrderReturnHistorySaga);
  yield takeLatest(CustomerType.CUSTOMER_ACTIVITY_LOG, getCustomerActivityLogSaga);
  yield takeLatest(CustomerType.CUSTOMER_ACTIVITY_LOG_DETAIL, getCustomerActivityLogDetailSaga);
  yield takeLatest(CustomerType.CREATE_CUSTOMER, CreateCustomer);
  yield takeLatest(CustomerType.UPDATE_CUSTOMER, UpdateCustomer);
  yield takeLatest(CustomerType.CUSTOMER_GROUPS, CustomerGroups);
  yield takeLatest(CustomerType.CUSTOMER_LEVELS, CustomerLevels);
  yield takeLatest(CustomerType.CUSTOMER_TYPES, CustomerTypes);
  yield takeLatest(CustomerType.CREATE_BILLING_ADDR, CreateBillingAddress);
  yield takeLatest(CustomerType.UPDATE_BILLING_ADDR, UpdateBillingAddress);
  yield takeLatest(CustomerType.CREATE_SHIPPING_ADDR, CreateShippingAddress);
  yield takeLatest(CustomerType.CREATE_NOTE, CreateNote);
  yield takeLatest(CustomerType.UPDATE_SHIPPING_ADDR, UpdateShippingAddress);
  yield takeLatest(CustomerType.UPDATE_NOTE, UpdateNote);
  yield takeLatest(CustomerType.CREATE_CONTACT, CreateContact);
  yield takeLatest(CustomerType.UPDATE_CONTACT, UpdateContact);
  yield takeLatest(CustomerType.DELETE_CONTACT, DeleteContact);
  yield takeLatest(CustomerType.DELETE_BILLING_ADDR, DeleteBillingAddress);
  yield takeLatest(CustomerType.DELETE_SHIPPING_ADDR, DeleteShippingAddress);
  yield takeLatest(CustomerType.DELETE_NOTE, DeleteNote);
  yield takeLatest(CustomerType.IMPORT_CUSTOMER, importCustomerSaga);
  yield takeLatest(CustomerType.CREATE_FAMILY_MEMBER, createFamilyMemberSaga);
  yield takeLatest(CustomerType.UPDATE_FAMILY_MEMBER, updateFamilyMemberSaga);
  yield takeLatest(CustomerType.DELETE_FAMILY_MEMBER, deleteFamilyMemberSaga);
}
