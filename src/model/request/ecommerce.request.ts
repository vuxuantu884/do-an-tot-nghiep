interface BaseObject {
    created_by: number | null;
    created_name: string | null;
    updated_by: number | null;
    updated_name: string | null;
    request_id: string | null;
    operator_kc_id: string | null;
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
    source_id: number
  }

  export interface EcommerceConnectRequest {

  }