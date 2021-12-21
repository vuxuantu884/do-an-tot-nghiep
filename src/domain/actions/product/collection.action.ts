import BaseAction from "base/base.action"
import { CollectionType } from "domain/types/product.type";
import { PageResponse } from "model/base/base-metadata.response";
import { CollectionQuery, CollectionResponse, CollectionCreateRequest, CollectionUpdateRequest } from "model/product/collection.model";

export const getCollectionRequestAction = (query: CollectionQuery, setData: (data: PageResponse<CollectionResponse>) => void) => {
  return BaseAction(CollectionType.GET_COLLECTION_REQUEST, {query, setData});
}

 export const createCollectionAction = (request: CollectionCreateRequest, onCreateSuccess: (result: CollectionResponse) => void) => {
  return BaseAction(CollectionType.CREATE_COLLECTION_REQUEST, {request, onCreateSuccess});
 }

export const collectionDetailAction = (id: number, setData: (data: CollectionResponse) => void) => {
  return BaseAction(CollectionType.DETAIL_COLLECTION_REQUEST, {id, setData});
}

export const collectionUpdateAction = (id: number, request: CollectionUpdateRequest, onUpdateSuccess: (result: CollectionResponse) => void) => {
  return BaseAction(CollectionType.UPDATE_COLLECTION_REQUEST, {id, request, onUpdateSuccess});
}

export const collectionDeleteAction = (id: number, onDeleteSuccess: () => void) => {
  return BaseAction(CollectionType.DELETE_COLLECTION_REQUEST, {id, onDeleteSuccess});
}