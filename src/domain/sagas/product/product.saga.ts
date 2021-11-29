import { productBarcodeApi, productCheckDuplicateCodeApi, productDetailApi, productImportApi, productUpdateApi, productWrapperDeleteApi, productWrapperPutApi } from 'service/product/product.service';
import {
  ProductHistoryResponse,
  ProductResponse,
  VariantResponse,
} from "model/product/product.model";
import { call, put, takeEvery, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { ProductType } from "domain/types/product.type";
import {
  createProductApi,
  getVariantApi,
  productGetHistory,
  productUploadApi,
  searchProductWrapperApi,
  searchVariantsApi,
} from "service/product/product.service";
import { showError } from "utils/ToastUtils";
import { PageResponse } from "model/base/base-metadata.response";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { deleteVariantApi, getVariantByBarcode, updateVariantApi } from "service/product/variant.service";
import { ProductUploadModel } from "model/product/product-upload.model";
import { SearchType } from 'domain/types/search.type';

function* searchVariantSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<VariantResponse>> = yield call(
      searchVariantsApi,
      query
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        console.log(response);
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

function* searchProductWrapperSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<VariantResponse>> = yield call(
      searchProductWrapperApi,
      query
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

function* productWrapperDeleteSaga(action: YodyAction) {
  const {id, onDeleteSuccess} = action.payload;
  try {
    let response: BaseResponse<string> = yield call(productWrapperDeleteApi, id);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        onDeleteSuccess();
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError('Có lỗi vui lòng thử lại sau');
  }
}

function* productWrapperUpdateSaga(action: YodyAction) {
  const { id, request, onUpdateSuccess } = action.payload;
  try {
    let response: BaseResponse<PageResponse<VariantResponse>> = yield call(
      productWrapperPutApi,
      id,
      request
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        onUpdateSuccess(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        onUpdateSuccess(null);
        yield put(unauthorizedAction());
        break;
      default:
        onUpdateSuccess(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onUpdateSuccess(null);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* searchVariantOrderSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    if (query.info.length >= 3) {
      let response: BaseResponse<PageResponse<VariantResponse>> = yield call(
        searchVariantsApi,
        query
      );
      switch (response.code) {
        case HttpStatus.SUCCESS:
          let data = { ...response.data };
          data.items = data.items.filter((item) => item.status === "active");
          setData(data);
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

function* createProductSaga(action: YodyAction) {
  const { request, createCallback } = action.payload;
  try {
    let response: BaseResponse<PageResponse<VariantResponse>> = yield call(
      createProductApi,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        createCallback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        createCallback(null);
        yield put(unauthorizedAction());
        break;
      default:
        createCallback(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    createCallback(null);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* variantDetailSaga(action: YodyAction) {
  const { id, setData } = action.payload;
  try {
    let response: BaseResponse<VariantResponse> = yield call(getVariantApi, id);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        console.log(response.data);
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        setData(null);
        // response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error ", error);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* uploadProductSaga(action: YodyAction) {
  const { files, folder, setData } = action.payload;
  try {
    let response: BaseResponse<Array<ProductUploadModel>> = yield call(
      productUploadApi,
      files,
      folder
    );
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

function* variantUpdateSaga(action: YodyAction) {
  const { id, request, onUpdateSuccess } = action.payload;
  try {
    let response: BaseResponse<VariantResponse> = yield call(
      updateVariantApi,
      id,
      request
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        onUpdateSuccess(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        onUpdateSuccess(null);
        yield put(unauthorizedAction());
        break;
      default:
        onUpdateSuccess(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onUpdateSuccess(null);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* getHistorySaga(action: YodyAction) {
  const { query, onResult } = action.payload;
  try {
    let response: BaseResponse<PageResponse<ProductHistoryResponse>> =
      yield call(productGetHistory, query);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        onResult(false);
        yield put(unauthorizedAction());
        break;
      default:
        onResult(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onResult(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* getProductDetail(action: YodyAction) {
  const { id, onResult } = action.payload;
  try {
    let response: BaseResponse<ProductResponse> = yield call(
      productDetailApi,
      id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        onResult(false);
        yield put(unauthorizedAction());
        break;
      default:
        onResult(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onResult(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* putProductUpdate(action: YodyAction) {
  const { id, request, onResult } = action.payload;
  try {
    let response: BaseResponse<ProductResponse> = yield call(
      productUpdateApi,
      id,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        onResult(false);
        yield put(unauthorizedAction());
        break;
      default:
        onResult(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onResult(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* createProductBarcode(action: YodyAction){
  const { request, onResult } = action.payload;
  try {
    let response: BaseResponse<string> =yield call(productBarcodeApi, request);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        onResult(false);
        yield put(unauthorizedAction());
        break;
      default:
        onResult(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onResult(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* importProductSaga(action: YodyAction) {
  const { file, isCreate, onResult } = action.payload;
  try {
    let response: BaseResponse<Array<string>> =yield call(productImportApi, file, isCreate);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        onResult(false);
        yield put(unauthorizedAction());
        break;
      default:
        onResult(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onResult(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* variantUpdateSaleableSaga(action: YodyAction) {
  const { variants, onResult } = action.payload;
  try {
    let arrSuccess: Array<VariantResponse> = [];
    let arrFail: Array<VariantResponse> = [];
    for(let i = 0 ; i< variants.length; i++) {
      let response: BaseResponse<VariantResponse> =yield call(updateVariantApi,
        variants[i].id,
        variants[i]);
      switch (response.code) {
        case HttpStatus.SUCCESS:
          arrSuccess.push(response.data)
          break;
        case HttpStatus.UNAUTHORIZED:
          arrFail.push(variants[i]);
          yield put(unauthorizedAction());
          break;
        default:
          arrFail.push(variants[i]);
          break;
      }
    }
    onResult(arrSuccess, arrFail, false);
  } catch (error) {
    onResult([], [], true);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* variantDeleteSaga(action: YodyAction) {
  const { variants, onResult } = action.payload;
  try {
    for(let i = 0 ; i< variants.length; i++) {
      let response: BaseResponse<VariantResponse> =yield call(deleteVariantApi,
        variants[i].product_id,
        variants[i].variant_id);
      switch (response.code) {
        case HttpStatus.SUCCESS:
          break;
        case HttpStatus.UNAUTHORIZED:
          yield put(unauthorizedAction());
          break;
        default:
          break;
      }
    }
    onResult(false);
  } catch (error) {
    onResult(true);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* searchBarCodeSaga(action: YodyAction) {
  let {barcode,setData} = action.payload;
  try {
    let response: BaseResponse<VariantResponse> = yield call(getVariantByBarcode, barcode);
    switch(response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        showError('Không tìm thấy sản phẩm')
        break;
    }
  } catch (error) {
    showError('Không tìm thấy sản phẩm')
  }
}

export function* checkDuplicateSkuSaga(action: YodyAction) {
  const {code, onResult } = action.payload;
  try {
    let response: BaseResponse<null> = yield call(productCheckDuplicateCodeApi, code);
 
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult('');
        break;
      case HttpStatus.BAD_REQUEST:
        onResult(response.errors);
        break;
      case HttpStatus.UNAUTHORIZED:
        onResult(false);
        yield put(unauthorizedAction());
        break;
      default:
        onResult(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onResult('');
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* productSaga() {
  yield takeLatest(ProductType.SEARCH_PRODUCT_REQUEST, searchVariantSaga);
  yield takeLatest(
    ProductType.SEARCH_PRODUCT_WRAPPER_REQUEST,
    searchProductWrapperSaga
  );
  yield takeLatest(
    ProductType.DELETE_PRODUCT_WRAPPER_REQUEST,
    productWrapperDeleteSaga);
  yield takeLatest(
    ProductType.UPDATE_PRODUCT_WRAPPER_REQUEST,
    productWrapperUpdateSaga);
  yield takeLatest(
    ProductType.SEARCH_PRODUCT_FOR_ORDER_REQUEST,
    searchVariantOrderSaga
  );
  yield takeLatest(ProductType.CREATE_PRODUCT_REQUEST, createProductSaga);
  yield takeLatest(ProductType.VARIANT_DETAIL_REQUEST, variantDetailSaga);
  yield takeLatest(ProductType.VARIANT_UPDATE_REQUEST, variantUpdateSaga);
  yield takeEvery(ProductType.UPLOAD_PRODUCT_REQUEST, uploadProductSaga);
  yield takeLatest(ProductType.GET_HISTORY, getHistorySaga);
  yield takeLatest(ProductType.PRODUCT_DETAIL, getProductDetail);
  yield takeLatest(ProductType.PRODUCT_UPDATE, putProductUpdate);
  yield takeLatest(ProductType.PRODUCT_BARCODE, createProductBarcode)
  yield takeLatest(ProductType.PRODUCT_IMPORT, importProductSaga)
  yield takeLatest(ProductType.VARIANT_UPDATE_SALEABLE, variantUpdateSaleableSaga)
  yield takeLatest(ProductType.VARIANT_DELETE, variantDeleteSaga);
  yield takeLatest(SearchType.SEARCH_BAR_CODE, searchBarCodeSaga);
  yield takeLatest(ProductType.DUPLICATE_PRODUCT_CODE, checkDuplicateSkuSaga);
}
