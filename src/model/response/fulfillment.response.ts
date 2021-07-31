import { BaseMetadata } from "model/base/base-metadata.response";
import { BaseObject } from "model/base/base.response";

export interface FulfillmentModel extends BaseObject {
  company: string;
  id: number;
  company_id: number;
  is_active: boolean;
  note: string;
  status: string;
  sub_status: string;
}

export interface FulfillmentResponseModel {
  items: FulfillmentModel[];
  metadata: BaseMetadata;
}
