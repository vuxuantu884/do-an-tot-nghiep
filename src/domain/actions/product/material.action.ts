import BaseAction from "base/BaseAction"
import { MaterialType } from "domain/types/product.type";
import { MaterialQuery } from "model/query/material.query";
import { CreateMaterialRequest, UpdateMaterialRequest } from "model/request/create-material.request";
import { BaseMetadata } from "model/base/base-metadata.response";
import { MaterialResponse } from "model/response/products/material.response";

export const materialSearchAll = (
  setData: (data: Array<MaterialResponse>) => void,
) => {
  return BaseAction(MaterialType.SEARCH_ALL_MATERIAL_REQUEST, {
    setData,
  });
}

export const getMaterialAction = (
  query: MaterialQuery,
  setData: (data: Array<MaterialResponse>) => void,
  setMetadata: (metadata: BaseMetadata) => void
) => {
  return BaseAction(MaterialType.GET_MATERIAL_REQUEST, {
    query,
    setData,
    setMetadata
  });
}

export const deleteOneMaterialAction = (id: number, onDeleteSuccess: () => void) => {
  return BaseAction(MaterialType.DELETE_ONE_MATERIAL_REQUEST, {id, onDeleteSuccess});
}

export const deleteManyMaterialAction = (ids: Array<number>, onDeleteSuccess: () => void) => {
  return BaseAction(MaterialType.DELETE_MANY_MATERIAL_REQUEST, {ids, onDeleteSuccess});
}

export const createMaterialAction = (request: CreateMaterialRequest, onCreateSuccess: () => void) => {
  return BaseAction(MaterialType.CREATE_MATERIAL_REQUEST, {request, onCreateSuccess});
}

export const detailMaterialAction = (id: number, setMaterial: (material: MaterialResponse) => void) => {
  return BaseAction(MaterialType.DETAIL_MATERIAL_REQUEST, {id, setMaterial});
}

export const updateMaterialAction = (id: number, request: UpdateMaterialRequest, onUpdateSuccess: () => void) => {
  return BaseAction(MaterialType.UPDATE_MATERIAL_REQUEST, {id, request, onUpdateSuccess});
}