import {
  ProductRequest,
  VariantResponse,
  VariantSearchQuery,
} from 'model/product/product.model';
import BaseAction from 'base/BaseAction';
import {ProductType} from 'domain/types/product.type';
import {PageResponse} from 'model/base/base-metadata.response';

export const searchVariantsRequestAction = (
  query: VariantSearchQuery,
  setData: (data: PageResponse<VariantResponse>) => void
) => {
  return BaseAction(ProductType.SEARCH_PRODUCT_REQUEST, {
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
  setData: (data: any) => void
) => {
  return BaseAction(ProductType.UPLOAD_PRODUCT_REQUEST, {
    files,
    folder,
    setData,
  });
};

export const productCreateAction = (
  request: ProductRequest,
  onCreateSuccess: () => void
) => {
  return BaseAction(ProductType.CREATE_PRODUCT_REQEUST, {
    request,
    onCreateSuccess,
  });
};

export const variantDetailAction = (id: number, setData: (data: VariantResponse) => void) => {
  return BaseAction(ProductType.VARIANT_DETAIL_REQUEST, {id, setData});
}