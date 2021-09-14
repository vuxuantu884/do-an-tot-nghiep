import {
  ProductHistoryQuery,
  ProductHistoryResponse,
  ProductRequest,
  ProductResponse,
  ProductWrapperResponse,
  ProductWrapperSearchQuery,
  VariantResponse,
  VariantSearchQuery,
  VariantUpdateRequest,
} from "model/product/product.model";
import BaseAction from "base/base.action";
import { ProductType } from "domain/types/product.type";
import { PageResponse } from "model/base/base-metadata.response";
import { ProductUploadModel } from "model/product/product-upload.model";

export const searchVariantsRequestAction = (
  query: VariantSearchQuery,
  setData: (data: PageResponse<VariantResponse>|false) => void
) => {
  return BaseAction(ProductType.SEARCH_PRODUCT_REQUEST, {
    query,
    setData,
  });
};


export const searchProductWrapperRequestAction = (
  query: ProductWrapperSearchQuery,
  setData: (data: PageResponse<ProductWrapperResponse>|false) => void
) => {
  return BaseAction(ProductType.SEARCH_PRODUCT_WRAPPER_REQUEST, {
    query,
    setData,
  });
};

export const searchVariantsOrderRequestAction = (
  query: VariantSearchQuery,
  setData: (data: PageResponse<VariantResponse>) => void
) => {
  return BaseAction(ProductType.SEARCH_PRODUCT_FOR_ORDER_REQUEST, {
    query,
    setData,
  });
};

export const productUploadAction = (
  files: Array<File>,
  folder: string,
  setData: (data: Array<ProductUploadModel>|false) => void
) => {
  return BaseAction(ProductType.UPLOAD_PRODUCT_REQUEST, {
    files,
    folder,
    setData,
  });
};

export const productCreateAction = (
  request: ProductRequest|null,
  createCallback: (result: ProductResponse) => void
) => {
  return BaseAction(ProductType.CREATE_PRODUCT_REQUEST, {
    request,
    createCallback,
  });
};

export const variantDetailAction = (
  id: number,
  setData: (data: VariantResponse | null) => void
) => {
  return BaseAction(ProductType.VARIANT_DETAIL_REQUEST, { id, setData });
};

export const variantUpdateAction = (
  id: number|null,
  request: VariantUpdateRequest,
  onUpdateSuccess: (result:VariantResponse) => void
) => {
  return BaseAction(ProductType.VARIANT_UPDATE_REQUEST, {
    id,
    request,
    onUpdateSuccess,
  });
};

export const productGetHistoryAction = (
  query: ProductHistoryQuery,
  onResult: (result: PageResponse<ProductHistoryResponse>|false) => void
) => {
  return BaseAction(ProductType.GET_HISTORY, {
    query,
    onResult,
  });
};

export const productGetDetail = (id: number, onResult: (result: ProductResponse|false) => void) => {
  return BaseAction(ProductType.PRODUCT_DETAIL, {id, onResult});
}