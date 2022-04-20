import { ProductBarcodeRequest } from 'model/product/product.model';
import {
  ProductHistoryQuery,
  ProductHistoryResponse,
  ProductRequest,
  ProductResponse,
  ProductWrapperUpdateRequest,
  ProductWrapperSearchQuery,
  VariantResponse,
  VariantSearchQuery,
  VariantUpdateRequest,
} from "model/product/product.model";
import BaseAction from "base/base.action";
import { ProductType } from "domain/types/product.type";
import { PageResponse } from "model/base/base-metadata.response";
import { ProductUploadModel } from "model/product/product-upload.model";
import { SearchType } from 'domain/types/search.type';

export const searchVariantsRequestAction = (
  query: VariantSearchQuery,
  setData: (data: PageResponse<VariantResponse>|false) => void
) => {
  return BaseAction(ProductType.SEARCH_PRODUCT_REQUEST, {
    query,
    setData,
  });
};

export const searchVariantsInventoriesRequestAction = (
  query: VariantSearchQuery,
  setData: (data: PageResponse<VariantResponse>|false) => void
) => {
  return BaseAction(ProductType.SEARCH_VARIANTS_INVENTORIES_REQUEST, {
    query,
    setData,
  });
};

export const searchProductWrapperRequestAction = (
  query: ProductWrapperSearchQuery,
  setData: (data: PageResponse<ProductResponse>|false) => void
) => {
  return BaseAction(ProductType.SEARCH_PRODUCT_WRAPPER_REQUEST, {
    query,
    setData,
  });
};

export const productWrapperDeleteAction = (ids: Array<number>, onDeleteSuccess: (res: any) => void) => {
  return BaseAction(ProductType.DELETE_PRODUCT_WRAPPER_REQUEST, {ids, onDeleteSuccess});
}

export const productWrapperUpdateAction = (
  id: number|null,
  request: ProductWrapperUpdateRequest,
  onUpdateSuccess: (result:ProductWrapperUpdateRequest) => void
) => {
  return BaseAction(ProductType.UPDATE_PRODUCT_WRAPPER_REQUEST, {
    id,
    request,
    onUpdateSuccess,
  });
};


export const searchVariantsOrderRequestAction = (
  query: VariantSearchQuery,
  setData: (data: PageResponse<VariantResponse>) => void,
  handleError?: ()=>void,
) => {
  return BaseAction(ProductType.SEARCH_PRODUCT_FOR_ORDER_REQUEST, {
    query,
    setData,
    handleError,
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

export const productGetDetail = (id: number, onResult: (result: ProductResponse) => void) => {
  return BaseAction(ProductType.PRODUCT_DETAIL, {id, onResult});
}

export const productUpdateAction = (id: number, request: ProductRequest|ProductResponse, onResult: (result: ProductResponse|false) => void) => {
  return BaseAction(ProductType.PRODUCT_UPDATE, {id, request, onResult});
}

export const productBarcodeAction = (request: ProductBarcodeRequest, onResult: (result: string|false) => void) => {
  return BaseAction(ProductType.PRODUCT_BARCODE, {request, onResult});
}

export const productImportAction = (file: File, isCreate: string, onResult: (result: string|false) => void) => {
  return BaseAction(ProductType.PRODUCT_IMPORT, {file, isCreate, onResult});
}

export const variantUpdateManyAction = (variants: Array<VariantUpdateRequest>, onResult: (success: Array<VariantResponse>, error: Array<VariantResponse>, exception: boolean) => void) => {
  return BaseAction(ProductType.VARIANT_UPDATE_SALEABLE, {variants, onResult});
}

export const variantDeleteManyAction = (variants: Array<any>, onResult: (exception: boolean) => void) => {
  return BaseAction(ProductType.VARIANT_DELETE, {variants, onResult});
}

export const SearchBarCode = (barcode: string, setData:(data:VariantResponse)=>void) => {
  return BaseAction(SearchType.SEARCH_BAR_CODE, {barcode, setData});
}

export const productCheckDuplicateCodeAction = (code: string, onResult: (duplicateMessages: string) => void) => {
  return BaseAction(ProductType.DUPLICATE_PRODUCT_CODE, {code, onResult});
}
