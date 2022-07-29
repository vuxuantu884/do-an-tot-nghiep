import { SizeType } from "domain/types/product.type";
import BaseAction from "base/base.action";
import { PageResponse } from "model/base/base-metadata.response";
import {
  SizeQuery,
  SizeResponse,
  SizeCreateRequest,
  SizeUpdateRequest,
} from "model/product/size.model";

export const sizeGetAll = (setData: (data: Array<SizeResponse>) => void) => {
  return BaseAction(SizeType.GET_ALL_SIZE_REQUEST, { setData });
};

export const sizeSearchAction = (
  query: SizeQuery,
  setData: (data: PageResponse<SizeResponse>) => void,
) => {
  return BaseAction(SizeType.SEARCH_SIZE_REQUEST, { query, setData });
};

export const sizeCreateAction = (request: SizeCreateRequest, onCreateSuccess: () => void) => {
  return BaseAction(SizeType.CREATE_SIZE_REQUEST, { request, onCreateSuccess });
};

export const sizeUpdateAction = (
  id: number,
  request: SizeUpdateRequest,
  onUpdateSuccess: () => void,
) => {
  return BaseAction(SizeType.UPDATE_SIZE_REQUEST, {
    id,
    request,
    onUpdateSuccess,
  });
};

export const sizeDetailAction = (id: number, setData: (data: SizeResponse | false) => void) => {
  return BaseAction(SizeType.DETAIL_SIZE_REQUEST, { id, setData });
};

export const sizeDeleteOneAction = (id: number, onDeleteSuccess: () => void) => {
  return BaseAction(SizeType.DELETE_SIZE_REQUEST, { id, onDeleteSuccess });
};

export const sizeDeleteManyAction = (ids: Array<number>, onDeleteSuccess: () => void) => {
  return BaseAction(SizeType.DELETE_MANY_SIZE_REQUEST, {
    ids,
    onDeleteSuccess,
  });
};
