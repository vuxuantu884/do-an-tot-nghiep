import { BaseObject } from "model/base/base.response";

export enum ChangeOrderStatusErrorLineType {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}
export interface ChangeOrderStatusErrorLine {
  order_sn: string;
  error_message: string;
  type: ChangeOrderStatusErrorLineType;
}
export interface EcommerceChangeOrderStatusReponse {
  success_list: Array<string>;
  error_list: Array<ChangeOrderStatusErrorLine>;
}
export interface EcommerceShopInventoryDto {
  store: String; //
  store_id: Number;
}

export interface EcommerceResponse extends BaseObject {
  name: String; // tên gian hàng
  ecommerce: String; //tên sàn
  ecommerce_id: number; //id sàn
  ecommerce_shop: String; //tên sàn
  email: String; //email shop
  shop_id: any // id shop
  store_id: number; // id cửa hàng
  store: String; // tên cửa hàng
  assign_account_code: String; // mã người phụ trách /vd: YD23123
  assign_account: String; // tên người phụ trách
  status: String; // trạng thái gian hàng
  inventory_sync: String; // đồng bộ tồn // Bằng tay và tự động
  order_sync: String; // đồng bộ đơn hàng // Bằng tay và tự động
  product_sync: String; // đồng bộ sản phẩm // Bằng tay và tự động
  auth_time: String; // thời gian bắt đầu kết nối
  expire_time: String; // thời gian hết hạn
  inventories: Array<EcommerceShopInventoryDto>; // danh sách kho
  source: String; // nguồn
  source_id: number; // id nguồn
}
