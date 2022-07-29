import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { profilePermissionSuccessAction } from "domain/actions/auth/permission.action";
import { PermissionType } from "domain/types/auth.type";
import { AuthProfilePermission } from "model/auth/permission.model";
import { call, put, takeLatest, takeEvery } from "redux-saga/effects";
import { profilePermissionApi, updateAccountPermissionApi } from "service/auth/permission.service";
import { showError, showSuccess } from "utils/ToastUtils";

// function* permissionGetListSaga(action: YodyAction) {
//   let {setResult} = action.payload;
//   try {
//     let response: BaseResponse<PageResponse<PermissionResponse>> = yield call(
//       permissionModuleListApi,
//       {}
//     );
//     switch (response.code) {
//       case HttpStatus.SUCCESS:
//         setResult(response.data);
//         break;
//       case HttpStatus.UNAUTHORIZED:
//         yield put(unauthorizedAction());
//         break;
//       default:
//         break;
//     }
//   } catch (e) {
//     setResult(false);
//   }
// }

function* profilePermissionSaga(action: YodyAction) {
  let { operator_kc_id } = action.payload;
  try {
    let response: BaseResponse<AuthProfilePermission> = yield call(
      profilePermissionApi,
      operator_kc_id,
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        yield put(profilePermissionSuccessAction(response.data));
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        break;
    }
  } catch (e) {}
}

function* updateAccountPermissionSaga(action: YodyAction) {
  let { params, onResult } = action.payload;
  try {
    let response: BaseResponse<string> = yield call(updateAccountPermissionApi, params);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult("DONE");
        showSuccess("Cập nhật quyền thành công");
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        throw new Error(response.errors.toString());
    }
  } catch (e: any) {
    onResult("");
    const messages = e.message.split(",");
    if (Array.isArray(messages)) {
      messages.forEach((message: string) => {
        showError(message);
      });
    } else {
      showError("Cập nhật quyền thất bại");
    }
  }
}

export function* permissionSaga() {
  yield takeLatest(PermissionType.GET_PROFILE_PERMISSION, profilePermissionSaga);
  yield takeEvery(PermissionType.UPDATE_USER_PERMISSION, updateAccountPermissionSaga);
}
