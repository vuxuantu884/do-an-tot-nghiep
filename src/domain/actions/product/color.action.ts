import { ColorType } from './../../types/product.type';
import { ColorSearchQuery } from '../../../model/query/color.search.query';
import BaseAction from "./../../../base/BaseAction";
import { ColorResponse } from './../../../model/response/products/color.response';
import { PageResponse } from 'model/response/base-metadata.response';

export const getMaterialAction = ( query: ColorSearchQuery,  setData: (data: Array<ColorResponse>) => void
) => {
    
  return BaseAction(ColorType.SEARCH_COLOR_REQUEST, {query,  setData });
}

export const getColorAction = ( query: ColorSearchQuery,  setData: (data: PageResponse<ColorResponse>) => void) => {
  return BaseAction(ColorType.GET_COLOR_REQUEST, {query,  setData });
}
