import { BaseMetadata } from "model/base/base-metadata.response";
import { BaseObject } from "model/base/base.response";

export interface FulfillmentModel {
  company_id: number;
  company: string;
  status: string;
  is_active: boolean;
  sub_status: string;
}

export interface FulfillmentResponseModel {
  items: FulfillmentModel[];
  metadata: BaseMetadata;
}
