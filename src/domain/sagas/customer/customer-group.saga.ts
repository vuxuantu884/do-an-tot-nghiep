import { call, put, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { PageResponse } from "model/base/base-metadata.response";
import { CustomerGroupResponseModel } from "model/response/customer/customer-group.response";
import { CustomerType } from 'domain/types/customer.type';

import {
  createCustomerGroupService,
  deleteCustomerGroupService,
  editCustomerGroupService,
  getCustomerGroupService,
} from "service/customer/customer-group.service";
import { showError, showSuccess } from "utils/ToastUtils";

function* listDataCustomerGroupSaga(action: YodyAction) {
  const { params, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<
      PageResponse<CustomerGroupResponseModel>
    > = yield call(getCustomerGroupService, params);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        /**
         * call function handleData in payload, variables are taken from the response -> use when dispatch
         */
        handleData(response.data);
        console.log(response.data)
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
    // showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* addCustomerGroupSaga(action: YodyAction) {
  const { item, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<
      PageResponse<CustomerGroupResponseModel>
    > = yield call(createCustomerGroupService, item);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData();
        showSuccess("Tạo mới thành công");
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
    // showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* editCustomerGroupSaga(action: YodyAction) {
  const { id, item, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<
      PageResponse<CustomerGroupResponseModel>
    > = yield call(editCustomerGroupService, id, item);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData();
        showSuccess("Cập nhật thành công");
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
    // showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* deleteCustomerGroupSaga(action: YodyAction) {
  const { id, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<
      PageResponse<CustomerGroupResponseModel>
    > = yield call(deleteCustomerGroupService, id);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData();
        showSuccess("Xóa thành công");
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
    // showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

export function* customerGroupSaga() {
  yield takeLatest(
    CustomerType.CUSTOMER_GROUP_SEARCH,
    listDataCustomerGroupSaga
  );
  yield takeLatest(
    CustomerType.CUSTOMER_GROUP_CREATE,
    addCustomerGroupSaga
  );
  yield takeLatest(
    CustomerType.CUSTOMER_GROUP_EDIT,
    editCustomerGroupSaga
  );
  yield takeLatest(
    CustomerType.CUSTOMER_GROUP_DELETE,
    deleteCustomerGroupSaga
  );
}
