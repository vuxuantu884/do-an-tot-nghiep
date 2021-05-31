import { ColorType } from './../types/product.type';
import { SearchColorQuery } from './../../model/query/search.color.query';
import BaseAction from "base/BaseAction";
import { ColorResponse } from '../../model/response/products/color.response';

export const getMaterialAction = ( query: SearchColorQuery,  setData: (data: Array<ColorResponse>) => void
) => {
    
  return BaseAction(ColorType.SEARCH_COLOR_REQUEST, {query,  setData });
}
