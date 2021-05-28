import { SizeResponse } from './../../model/response/products/size.response';
import { SizeType } from './../types/product.type';
import BaseAction from "base/BaseAction"

export const getAllSize = (setData: (data: Array<SizeResponse>) => void) => {
  return BaseAction(SizeType.GET_ALL_SIZE_REQUEST, {setData});
}
