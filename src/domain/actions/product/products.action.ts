import { VariantSearchQuery } from '../../../model/query/variant.search.query';
import { VariantResponse } from '../../../model/response/products/variant.response';
import BaseAction from "base/BaseAction"
import { ProductType } from 'domain/types/product.type';
import { PageResponse } from 'model/response/base-metadata.response';

export const searchVariantsRequestAction = (
  query: VariantSearchQuery,
  setData: (data: PageResponse<VariantResponse>) => void
) => {
  return BaseAction(ProductType.SEARCH_PRODUCT_REQUEST, {
    query,
    setData
  });
}

export const searchVariantsOrderRequestAction = (
  query: VariantSearchQuery,
  setData: (data: PageResponse<VariantResponse>) => void
) => {
  return BaseAction(ProductType.SEARCH_PRODUCT_FOR_ORDER_REQUEST, {
    query,
    setData
  });
}


export const productUploadAction = (
  query: VariantSearchQuery,
  setData: (data: PageResponse<VariantResponse>) => void
) => {
  return BaseAction(ProductType.SEARCH_PRODUCT_REQUEST, {
    query,
    setData
  });
}
