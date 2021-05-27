import { SearchVariantQuery } from './../../model/query/search.variant.query';
import { VariantResponse } from './../../model/response/products/variant.response';
import BaseAction from "base/BaseAction"
import { ProductType } from 'domain/types/product.type';
import { BaseMetadata } from 'model/response/base-metadata.response';


export const searchVariantsRequestAction = (
  query: SearchVariantQuery,
  setData: (data: Array<VariantResponse>) => void,
  setMetadata: (metadata: BaseMetadata) => void
) => {
  return BaseAction(ProductType.SEARCH_PRODUCT_REQUEST, {
    query,
    setData,
    setMetadata
  });
}

export const getProductSuccessAction = () => {
  return BaseAction(ProductType.GET_PRODUCT_SUCCESS, null);
}
