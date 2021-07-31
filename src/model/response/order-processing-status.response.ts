import { BaseMetadata } from "model/base/base-metadata.response";
import { BaseObject } from "model/base/base.response";

export interface OrderProcessingStatusModel extends BaseObject {
  company: string;
  id: number;
  company_id: number;
  is_active: boolean;
  note: string;
  status: string;
  sub_status: string;
}

export interface OrderProcessingStatusResponseModel {
  items: OrderProcessingStatusModel[];
  metadata: BaseMetadata;
}
