import { BaseObject } from "model/base/base.response";

export interface WebAppShopInventoryDtoResponse {
  store: String; //
  store_id: Number;
}

export interface WebAppResponse extends BaseObject {
  name: String; // tên gian hàng
  ecommerce: String; //tên sàn
  ecommerce_id: Number; //id sàn
  ecommerce_shop: String; //tên sàn
  email: String; //email shop
  store_id: Number; // id cửa hàng
  store: String; // tên cửa hàng
  assign_account_code: String; // mã người phụ trách /vd: YD23123
  assign_account: String; // tên người phụ trách
  status: String; // trạng thái gian hàng
  inventory_sync: String; // đồng bộ tồn // Bằng tay và tự động
  order_sync: String; // đồng bộ đơn hàng // Bằng tay và tự động
  product_sync: String; // đồng bộ sản phẩm // Bằng tay và tự động
  auth_time: String; // thời gian bắt đầu kết nối
  expire_time: String; // thời gian hết hạn
  inventories: Array<WebAppShopInventoryDtoResponse>; // danh sách kho
  source: String; // nguồn
  source_id: number; // id nguồn
}
