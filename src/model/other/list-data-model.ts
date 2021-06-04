import { BaseMetadata } from "./base-model";

export interface ListDataModel<T> {
  metadata: BaseMetadata
  items: Array<T>
}