import { delay, put, takeLatest } from "@redux-saga/core/effects";
import { loginSuccessAction, logoutSuccessAction } from "domain/actions/auth.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { AuthType } from 'domain/types/account.type';
import { removeToken, setToken } from "utils/LocalStorageUtils";

function* loginSaga() {
  //TODO: call api login
  yield delay(1000);
  let token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJNUndFdDVURzNfb2g3M01VRVlsVC01R1VHT0tBNWtLMThjSnlzU2FUTnZjIn0.eyJleHAiOjE2MjI1MTYwODksImlhdCI6MTYyMTY1MjA4OSwianRpIjoiYzdmNzZjZjAtNDVlZC00ZGIwLTg2NTYtM2M5OGMxYWZlMDlmIiwiaXNzIjoiaHR0cHM6Ly9kZXYuaWFtLnlvZHkudm4vYXV0aC9yZWFsbXMvWW9keSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI1Y2ViNWI0NS0xZWEwLTQxN2MtYjZlMS1jOGI4NDZkNGJlNmQiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJ5b2R5LW8ybyIsInNlc3Npb25fc3RhdGUiOiJkMTZiZTg3Yi1jYzQ5LTRlZmMtOTcyMS05YTNiODdjNjI5YjgiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiTmd1eeG7hW4gw4FuaCIsInByZWZlcnJlZF91c2VybmFtZSI6ImFuaHRvbmciLCJnaXZlbl9uYW1lIjoiTmd1eeG7hW4gw4FuaCJ9.QyySC1DgikcaC-A6n5UO36UELeAKjelguoMWHttf7IuierL-LqqSICoJLnkym0k3v61XP819JHJLoBNcZpdjNXcYte4hbZl2uqW0sRj4gXFs-jLpjcCfPHDBW1075osrysPRZOZ3HFhVCRZ1waqzewf8g7CjMuJpD7eQv48U1mAgkl8x43mbWHPTp0Z6d6mGDNOWjV__HUgEi01F8q21_WrdGXCk-x5ou1VWqKzv1bU01VxBhaDYyVxHdNF2o0ldZJCBt_ux7uzv5mlgd8HBx3SMDoGyR90ACNhOqqz8KJT7XYzpU6oMhmtHKCaCevrHycS9jYFNSv9nfBZybNNunw';
  setToken(token);
  yield put(loginSuccessAction());
}

function* logoutSaga() {
  yield put(showLoading());
  yield removeToken();
  //TODO: LOGOUT IN SERVER
  yield delay(1000);
  yield put(hideLoading());
  yield put(logoutSuccessAction())
}

export function* authSaga() {
  yield takeLatest(AuthType.LOGIN_REQUEST, loginSaga)
  yield takeLatest(AuthType.LOGOUT_REQUEST, logoutSaga)
}