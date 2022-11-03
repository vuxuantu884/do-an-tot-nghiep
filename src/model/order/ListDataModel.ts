import { BaseMetadata } from "./BaseModel";

export interface ListDataModel<T> {
  metadata: BaseMetadata
  items: Array<T>
}
