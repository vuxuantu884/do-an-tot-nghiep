import { PageResponse } from "model/base/base-metadata.response";
import { CustomerResponse } from "model/response/customer/customer.response";
import BaseResponse from "base/BaseResponse";
import { YodyAction } from "base/BaseAction";
import { call, put, takeLatest } from "redux-saga/effects";
import { HttpStatus } from "config/HttpStatus";
import {
  createCustomer,
  getCustomerGroups,
  getCustomerLevels,
  getCustomers,
  getCustomerTypes,
  getDetailCustomer,
  updateCustomer,
} from "service/cusomer/customer.service";
import { CustomerType } from "domain/types/customer.type";
import { showError } from "utils/ToastUtils";
import { unauthorizedAction } from "domain/actions/auth/auth.action";

function* onKeySearchCustomerChange(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    if (query.request.length >= 3) {
      const response: BaseResponse<PageResponse<CustomerResponse>> = yield call(
        getCustomers,
        query
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
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* getCustomerList(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<CustomerResponse>> = yield call(
      getCustomers,
      query
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
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* CustomerDetail(action: YodyAction) {
  const { id, setData } = action.payload;
  try {
    const response: BaseResponse<CustomerResponse> = yield call(
      getDetailCustomer,
      id
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

function* CustomerGroups(action: YodyAction) {
  const { setData } = action.payload;
  try {
    const response: BaseResponse<CustomerResponse> = yield call(
      getCustomerGroups,
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

function* CustomerLevels(action: YodyAction) {
  const { setData } = action.payload;
  try {
    const response: BaseResponse<CustomerResponse> = yield call(
      getCustomerLevels,
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

function* CustomerTypes(action: YodyAction) {
  const { setData } = action.payload;
  try {
    const response: BaseResponse<CustomerResponse> = yield call(
      getCustomerTypes,
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

function* CreateCustomer(action: YodyAction) {
  const { customer, setData } = action.payload;
  try {
    const response: BaseResponse<any> = yield call(
      createCustomer,
      customer
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

function* UpdateCustomer(action: YodyAction) {
  const { customer, id, setData } = action.payload;
  try {
    const response: BaseResponse<any> = yield call(
      updateCustomer,
      id,
      customer,
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

export default function* customerSagas() {
  yield takeLatest(
    CustomerType.KEY_SEARCH_CUSTOMER_CHANGE,
    onKeySearchCustomerChange
  );
  yield takeLatest(
    CustomerType.CUSTOMER_LIST,
    getCustomerList
  );
  yield takeLatest(CustomerType.CUSTOMER_DETAIL, CustomerDetail);
  yield takeLatest(CustomerType.CREATE_CUSTOMER, CreateCustomer);
  yield takeLatest(CustomerType.UPDATE_CUSTOMER, UpdateCustomer);
  yield takeLatest(CustomerType.CUSTOMER_GROUPS, CustomerGroups);
  yield takeLatest(CustomerType.CUSTOMER_LEVELS, CustomerLevels);
  yield takeLatest(CustomerType.CUSTOMER_TYPES, CustomerTypes);
}
