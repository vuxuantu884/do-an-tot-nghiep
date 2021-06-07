import { BaseMetadata } from "model/other/base-model";
import { OrderModel } from 'model/other/Order/order-model';

export interface OrderMetadata extends BaseMetadata {
  selected: number;
  seq: number;
}

export interface OrderListReducerType {
  metadata: OrderMetadata;
  data: Array<OrderModel>;
}