import { ColorType } from './../../types/product.type';
import { ColorSearchQuery } from '../../../model/query/color.search.query';
import BaseAction from "./../../../base/BaseAction";
import { ColorResponse } from './../../../model/response/products/color.response';

export const getMaterialAction = ( query: ColorSearchQuery,  setData: (data: Array<ColorResponse>) => void
) => {
    
  return BaseAction(ColorType.SEARCH_COLOR_REQUEST, {query,  setData });
}
