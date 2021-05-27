import { VariantResponse } from './../../model/response/products/variant.response';
import BaseAction from "base/BaseAction"
import { ProductType } from 'domain/types/product.type';



export const searchVariantsRequestAction = (info: string|null, barcode: string|null,
  setData: (data: Array<VariantResponse>) => void) => {
  return BaseAction(ProductType.SEARCH_PRODUCT_REQUEST, {info, barcode,  setData});
}

export const getProductSuccessAction = () => {
  return BaseAction(ProductType.GET_PRODUCT_SUCCESS, null);
}
