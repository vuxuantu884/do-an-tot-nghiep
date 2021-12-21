import { BaseMetadata } from "model/base/base-metadata.response";
import { BaseObject } from "model/base/base.response";

export interface CustomerGroupModel extends BaseObject {
  name: string;
  note: string;
  status:string;
}

export interface CustomerGroupResponseModel {
  items: CustomerGroupModel[];
  metadata: BaseMetadata;
}
