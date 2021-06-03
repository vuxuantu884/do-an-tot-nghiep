import { BaseMetadata } from "model/other/BaseModel";
import { OrderModel } from 'model/other/Order/OrderModel';

export interface OrderMetadata extends BaseMetadata {
  selected: number;
  seq: number;
}

export interface OrderListReducerType {
  metadata: OrderMetadata;
  data: Array<OrderModel>;
}