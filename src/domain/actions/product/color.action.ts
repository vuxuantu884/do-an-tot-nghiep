import { ColorType } from "domain/types/product.type";
import { ColorSearchQuery, ColorResponse, ColorCreateRequest } from "model/product/color.model";
import BaseAction from "base/base.action";
import { PageResponse } from "model/base/base-metadata.response";

export const getColorAction = (
  query: ColorSearchQuery,
  setData: (data: PageResponse<ColorResponse>) => void,
) => {
  return BaseAction(ColorType.GET_COLOR_REQUEST, { query, setData });
};
export const listColorAction = (
  query: ColorSearchQuery,
  setData: (data: Array<ColorResponse>) => void,
) => {
  return BaseAction(ColorType.LIST_COLOR_REQUEST, { query, setData });
};

export const colorDeleteAction = (id: number, onDeleteSuccess: () => void) => {
  return BaseAction(ColorType.DELETE_COLOR_REQUEST, { id, onDeleteSuccess });
};

export const colorDeleteManyAction = (ids: Array<number>, onDeleteSuccess: () => void) => {
  return BaseAction(ColorType.DELETE_MANY_COLOR_REQUEST, {
    ids,
    onDeleteSuccess,
  });
};

export const colorCreateAction = (
  request: ColorCreateRequest,
  createCallback: (result: ColorResponse) => void,
) => {
  return BaseAction(ColorType.CREATE_COLOR_REQUEST, {
    request,
    createCallback,
  });
};

export const colorUpdateAction = (
  id: number,
  request: ColorCreateRequest,
  onCreateSuccess: () => void,
) => {
  return BaseAction(ColorType.UPDATE_COLOR_REQUEST, {
    id,
    request,
    onCreateSuccess,
  });
};

export const colorDetailAction = (
  id: number,
  getColorCallback: (result: ColorResponse) => void,
) => {
  return BaseAction(ColorType.DETAIL_COLOR_REQUEST, { id, getColorCallback });
};
