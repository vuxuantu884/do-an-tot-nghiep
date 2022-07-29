import BaseAction from "base/base.action";
import { MaterialType } from "domain/types/product.type";
import {
  MaterialQuery,
  MaterialCreateRequest,
  MaterialUpdateRequest,
  MaterialResponse,
} from "model/product/material.model";
import { PageResponse } from "model/base/base-metadata.response";

export const materialSearchAll = (setData: (data: Array<MaterialResponse>) => void) => {
  return BaseAction(MaterialType.SEARCH_ALL_MATERIAL_REQUEST, {
    setData,
  });
};

export const getMaterialAction = (
  query: MaterialQuery,
  setData: (data: PageResponse<MaterialResponse> | false) => void,
) => {
  return BaseAction(MaterialType.GET_MATERIAL_REQUEST, {
    query,
    setData,
  });
};

export const deleteOneMaterialAction = (id: number, onDeleteSuccess: () => void) => {
  return BaseAction(MaterialType.DELETE_ONE_MATERIAL_REQUEST, {
    id,
    onDeleteSuccess,
  });
};

export const deleteManyMaterialAction = (ids: Array<number>, onDeleteSuccess: () => void) => {
  return BaseAction(MaterialType.DELETE_MANY_MATERIAL_REQUEST, {
    ids,
    onDeleteSuccess,
  });
};

export const createMaterialAction = (
  request: MaterialCreateRequest,
  onCreateSuccess: () => void,
) => {
  return BaseAction(MaterialType.CREATE_MATERIAL_REQUEST, {
    request,
    onCreateSuccess,
  });
};

export const detailMaterialAction = (
  id: number,
  setMaterial: (material: MaterialResponse | false) => void,
) => {
  return BaseAction(MaterialType.DETAIL_MATERIAL_REQUEST, { id, setMaterial });
};

export const updateMaterialAction = (
  id: number,
  request: MaterialUpdateRequest,
  onUpdate: (material: MaterialResponse | false) => void,
) => {
  return BaseAction(MaterialType.UPDATE_MATERIAL_REQUEST, {
    id,
    request,
    onUpdate,
  });
};

export const updateMaterialOtherAction = (
  id: string | number,
  request: MaterialUpdateRequest,
  onUpdate: (material: MaterialResponse | false) => void,
) => {
  return BaseAction(MaterialType.UPDATE_MATERIAL_OTHER_REQUEST, {
    id,
    request,
    onUpdate,
  });
};
