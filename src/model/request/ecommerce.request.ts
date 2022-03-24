interface BaseObject {
  created_by: number | null;
  created_name: string | null;
  updated_by: number | null;
  updated_name: string | null;
  request_id: string | null;
  operator_kc_id: string | null;
}

export enum EcommerceId {
  SHOPEE = 1,
  LAZADA = 2,
}

export enum EcommerceOrderStatus {
  PACKED = "packed",
  READY_TO_SHIP = "ready_to_ship",
}

export type EcommerceOrderList = {
  shop_id: string | null;
  order_sn: string;
};
export interface EcommerceOrderStatusRequest {
  status: EcommerceOrderStatus;
  ecommerce_id: EcommerceId;
  items: Array<EcommerceOrderList>;
}
export interface EcommerceSearchQuery {
  shop_id: string | null;
  code: string | null;
}
export interface EcommerceShopInventoryDto {
  store: String; //
  store_id: Number;
  deleted?: Boolean;
}
export interface EcommerceRequest extends BaseObject {
  name: String;
  store_id: number;
  store: String;
  assign_account_code: String;
  assign_account: String;
  status: String;
  inventory_sync: boolean;
  order_sync: boolean;
  product_sync: String;
  inventories: Array<EcommerceShopInventoryDto>;
  source: String;
  source_id: number;
}

export interface EcommerceConnectRequest {}
