interface BaseObject {
    created_by: number | null;
    created_name: string | null;
    updated_by: number | null;
    updated_name: string | null;
    request_id: string | null;
    operator_kc_id: string | null;
  }
  
  export interface EcommerceRequest extends BaseObject {
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
    // inventories: Array<EcommerceShopInventoryDto>;
  }