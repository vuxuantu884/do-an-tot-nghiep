import { getIdBankAccountService } from './../../../service/bank/bank.service';
import { fetchApiErrorAction } from 'domain/actions/app.action';
import { isFetchApiSuccessful } from 'utils/AppUtils';
import { call } from 'redux-saga/effects';
import { BankAccountResponse } from 'model/bank/bank.model';
import BaseResponse from 'base/base.response';
import { BankType } from '../../types/bank.type';
import { takeLatest } from 'redux-saga/effects';
import { put } from 'redux-saga/effects';
import { showLoading } from 'domain/actions/loading.action';
import { hideLoading } from 'domain/actions/loading.action';
import { showError } from '../../../utils/ToastUtils';
import { YodyAction } from 'base/base.action';
import { PageResponse } from 'model/base/base-metadata.response';
import { getBankService,getBankAccountService, postBankAccountService, putBankAccountService,deleteBankAccountService } from 'service/bank/bank.service';

function* getIdBankSaga(action:YodyAction){
    const {setData}= action.payload;
    yield put(showLoading());
    try{
        const response:BaseResponse<any>= yield call(getBankService);
        if (isFetchApiSuccessful(response)) {
            setData(response.data.bank_account);
        } else {
            yield put(fetchApiErrorAction(response, "Lấy thông tin ngân hàng"));
        }
    }
    catch (e) {
        showError("Lỗi Lấy thông tin ngân hàng");
    }
    finally {
        yield put(hideLoading());
    }
}

function* getIdBankAccountSaga(action:YodyAction){
    const {id,setData}= action.payload;
    yield put(showLoading());
    try{
        const response:BaseResponse<BankAccountResponse>= yield call(getIdBankAccountService,id);
        if (isFetchApiSuccessful(response)) {
            setData(response.data);
        } else {
            yield put(fetchApiErrorAction(response, "Lấy thông tin tài khoản ngân hàng"));
        }
    }
    catch (e) {
        showError("Lỗi Lấy thông tin tài khoản ngân hàng");
    }
    finally {
        yield put(hideLoading());
    }
}

function* getBankAccountSaga(action: YodyAction) {
    const { query, setData } = action.payload;
    yield put(showLoading());
    try {
        const response: BaseResponse<PageResponse<BankAccountResponse>> = yield call(getBankAccountService, query);
        if (isFetchApiSuccessful(response)) {
            setData(response.data);
        } else {
            yield put(fetchApiErrorAction(response, "Danh sách tài khoản ngân hàng"));
        }
    }
    catch (e) {
        showError("Lỗi lấy dữ liệu danh sách tài khoản ngân hàng");
    }
    finally {
        yield put(hideLoading());
    }
}

function* postBankAcountSaga(action: YodyAction) {
    const { param, setData } = action.payload;
    yield put(showLoading());
    try {
        const response: BaseResponse<BankAccountResponse> = yield call(postBankAccountService, param);
        if (isFetchApiSuccessful(response)) {
            setData(response.data);
        } else {
            yield put(fetchApiErrorAction(response, "Thêm tài khoản ngân hàng"));
        }
    }
    catch (e) {
        console.log(e);
        showError("Thêm tài khoản ngân hàng lỗi");
    }
    finally {
        yield put(hideLoading());
    }
}

function* putBankAccountSaga(action: YodyAction) {
    const { id,param, setData } = action.payload;
    try {
        let response: BaseResponse<BankAccountResponse> = yield call(putBankAccountService,id, param);
        if (isFetchApiSuccessful(response)) {
            setData(response.data);
        } else {
            yield put(fetchApiErrorAction(response, "Cập nhật tài khoản ngân hàng thất bại"));
        }
    }
    catch (e) {
        console.log(e);
        showError("Cập nhật tài khoản ngân hàng lỗi");
    }
    finally {
        yield put(hideLoading());
    }
}

function* deleteBankAccountSaga(action:YodyAction){
    const {id, setData}= action.payload;
    yield put(showLoading());
    try{
        const response:BaseResponse<BankAccountResponse>= yield call(deleteBankAccountService,id);
        if (isFetchApiSuccessful(response)) {
            setData(response.data);
        } else {
            yield put(fetchApiErrorAction(response, "xóa thông tin tài khoản ngân hàng"));
        }
    }
    catch (e) {
        showError("Lỗi xóa thông tin tài khoản ngân hàng");
    }
    finally {
        yield put(hideLoading());
    }
}

export default function* bankAccountSagas() {
    yield takeLatest(BankType.GET_BANK_ACCOUNT, getBankAccountSaga);
    yield takeLatest(BankType.POST_BANK_ACCOUNT, postBankAcountSaga);
    yield takeLatest(BankType.PUT_BANK_ACCOUNT, putBankAccountSaga);
    yield takeLatest(BankType.DELETE_BANK_ACCOUNT, deleteBankAccountSaga);
    yield takeLatest(BankType.GET_ID_BANK_ACCOUNT, getIdBankAccountSaga);
    yield takeLatest(BankType.GET_BANK, getIdBankSaga);
}