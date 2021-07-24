import { YodyAction } from 'base/BaseAction';
import { POType } from "domain/types/purchase-order.type";
import { takeLatest } from "redux-saga/effects";

function* poCreateSaga(action: YodyAction) {

}

export function* poSaga() {
  yield takeLatest(POType.CREATE_PO_REQUEST, poCreateSaga)
}


