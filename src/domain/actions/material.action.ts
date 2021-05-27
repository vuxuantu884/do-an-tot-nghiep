import BaseAction from "base/BaseAction"
import { MaterialType } from "domain/types/product.type";
import { MaterialQuery } from "model/query/material.query";
import { BaseMetadata } from "model/response/base-metadata.response";
import { MaterialResponse } from "model/response/product/material.response";

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

export const getMaterialSuccessAction = () => {
  return BaseAction(MaterialType.GET_MATERIAL_SUCCESS, null);
}