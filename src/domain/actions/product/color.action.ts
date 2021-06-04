import { ColorType } from 'domain/types/product.type';
import { ColorSearchQuery } from 'model/query/color.search.query';
import BaseAction from "base/BaseAction";
import { ColorResponse } from 'model/response/products/color.response';
import { PageResponse } from 'model/response/base-metadata.response';

export const getMaterialAction = ( query: ColorSearchQuery,  setData: (data: Array<ColorResponse>) => void
) => {
    
  return BaseAction(ColorType.SEARCH_COLOR_REQUEST, {query,  setData });
}

const getColorAction = ( query: ColorSearchQuery,  setData: (data: PageResponse<ColorResponse>) => void) => {
  return BaseAction(ColorType.GET_COLOR_REQUEST, {query,  setData });
}
export const listColorAction = ( query: ColorSearchQuery,  setData: (data: Array<ColorResponse>) => void) => {
  return BaseAction(ColorType.LIST_COLOR_REQUEST, {query,  setData });
}


const colorDeleteAction = ( id: number,  onDeleteSuccess: () => void) => {
  return BaseAction(ColorType.DELETE_COLOR_REQUEST, {id,  onDeleteSuccess });
}

const colorDeleteManyAction = ( ids: Array<number>,  onDeleteSuccess: () => void) => {
  return BaseAction(ColorType.DELETE_MANY_COLOR_REQUEST, {ids,  onDeleteSuccess });
}

const ColorAction = {getColorAction, colorDeleteAction, colorDeleteManyAction}

export default ColorAction;
