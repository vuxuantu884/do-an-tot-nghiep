import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { profilePermissionSuccessAction } from "domain/actions/auth/permission.action";
import { PermissionType } from "domain/types/auth.type";
import { AuthProfilePermission } from "model/auth/permission.model";
import { call, put, takeLatest } from "redux-saga/effects";
import { profilePermissionApi } from "service/auth/permission.service";

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
      operator_kc_id
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

export function* permissionSaga() {
  // yield takeLatest(PermissionType.GET_LIST_PERMISSION, permissionGetListSaga)
  yield takeLatest(PermissionType.GET_PROFILE_PERMISSION, profilePermissionSaga)
}