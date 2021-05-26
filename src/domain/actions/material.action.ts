import BaseAction from "base/BaseAction"
import { MaterialType } from "domain/types/product.type";
import { BaseMetadata } from "model/response/base-metadata.response";
import { MaterialResponse } from "model/response/product/material.response";

export const getMaterialAction = (
  component: string|null, 
  created_name: string|null, 
  description: string|null, 
  info: string|null, 
  limit: number, 
  page: number,
  sortColumn: string|null, 
  sortType: string|null,
  setData: (data: Array<MaterialResponse>) => void,
  setMetadata: (metadata: BaseMetadata) => void
) => {
  return BaseAction(MaterialType.GET_MATERIAL_REQUEST, {
    component,
    created_name,
    description,
    info,
    limit,
    page,
    sortType,
    sortColumn,
    setData,
    setMetadata
  });
}

export const getMaterialSuccessAction = () => {
  return BaseAction(MaterialType.GET_MATERIAL_SUCCESS, null);
}