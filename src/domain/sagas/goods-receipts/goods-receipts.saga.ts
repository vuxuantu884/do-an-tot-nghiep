import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { GoodsReceiptsResponse, GoodsReceiptsTypeResponse } from "model/response/pack/pack.response";
import { createGoodsReceiptsService, getGoodsReceiptsSerchService, getGoodsReceiptsTypeService } from "service/order/order.service";
import { unauthorizedAction } from "./../../actions/auth/auth.action";
import { call, put, takeLatest } from "redux-saga/effects";
import { showError } from "utils/ToastUtils";
import { GoodsReceiptsType } from "domain/types/goods-receipts";

function* getGoodsReceiptsTypeSaga(action:YodyAction){
    let {setData}= action.payload;
    try{
      let response:BaseResponse<Array<GoodsReceiptsTypeResponse>>= yield call(getGoodsReceiptsTypeService);
      switch(response.code){
        case HttpStatus.SUCCESS:
          setData(response.data)
          break;
        case HttpStatus.UNAUTHORIZED:
          yield put(unauthorizedAction());
          break;
        default:
          response.errors.forEach((e: any) => showError(e));
          break;
      }
    }
    catch(e){}
  }
  
  function* createGoodsReceiptsSaga(action:YodyAction){
    let {data, setData}= action.payload;
    try{
      let response:BaseResponse<GoodsReceiptsResponse>= yield call(createGoodsReceiptsService,data);
      switch(response.code){
        case HttpStatus.SUCCESS:
          setData(response.data)
          break;
        case HttpStatus.UNAUTHORIZED:
          yield put(unauthorizedAction());
          break;
        default:
          response.errors.forEach((e: any) => showError(e));
          break;
      }
    }
    catch(e){}
  }
  
  function* getGoodsReceiptsSerchSaga(action:YodyAction){
    let {data, setData}= action.payload;
    try{
      let response:BaseResponse<Array<GoodsReceiptsResponse>>= yield call(getGoodsReceiptsSerchService,data);
      switch(response.code){
        case HttpStatus.SUCCESS:
          setData(response.data)
          break;
        case HttpStatus.UNAUTHORIZED:
          yield put(unauthorizedAction());
          break;
        default:
          response.errors.forEach((e: any) => showError(e));
          break;
      }
    }
    catch(e){}
  }
  
  export function* GoodsReceiptsSaga() {
    yield takeLatest(GoodsReceiptsType.GET_GOODS_RECEIPTS_TYPE, getGoodsReceiptsTypeSaga);
    yield takeLatest(GoodsReceiptsType.CREATE_GOODS_RECEIPTS, createGoodsReceiptsSaga);
    yield takeLatest(GoodsReceiptsType.SEARCH_GOODS_RECEIPTS, getGoodsReceiptsSerchSaga);
  }