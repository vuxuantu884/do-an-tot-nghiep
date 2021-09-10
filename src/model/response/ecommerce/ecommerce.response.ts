import { BaseObject } from "model/base/base.response";

export interface EcommerceShopInventoryDto {}

export interface EcommerceResponse extends BaseObject {
  name: String;
  ecommerce: String;
  stor_id: String;
  store: number;
  assign_account_code: String;
  assign_account: String;
  status: String;
  inventory_sync: boolean;
  order_sync: boolean;
  product_sync: String;
  auth_time: number;
  expire_time: number;
  inventories: Array<EcommerceShopInventoryDto>;
}
