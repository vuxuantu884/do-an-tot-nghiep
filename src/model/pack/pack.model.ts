import { GoodsReceiptsResponse } from 'model/response/pack/pack.response';
import { PackFulFillmentResponse } from 'model/response/order/order.response';
export interface PackModel{
  store_id?:number|null;
  delivery_service_provider_id?:number|null;
  fulfillments:PackFulFillmentResponse[];
}
export interface PackSearchQuery {
  page: number;
  limit: number;
  sort_type: string|null;
  sort_column: string|null;
  delivery_provider_ids: [];
}

export interface PackItemOrderModel{
  id:number;
  code:string;
  receiver:string|null;
  product:string;
  sku:string|null;
  variant_id:number|null;
  price:number;
  quantity:number;
  postage:number;
  total_revenue:number;
}

export interface paymentsModel{
  id: number;
  code: string;
  payment_method_id: number;
  payment_method_code: string;
  amount: number;
}
export interface fulfillmentsModel{
  id: number;
  code: string;
  total: number;
  total_quantity: number;
  status: string;
  shipment:{
    shipping_fee_informed_to_customer?:number;
    id?:number;
  }
  items:Array<VariantModel>;
  return_status?:string|null;
}
export interface VariantModel{
  sku: string;
  product_id: number;
  product: string;
  variant_id: number;
  variant: string;
  variant_barcode: string;
  quantity:number;
  price?:number;
}

export interface GoodsReceiptsSearchModel{
  key:number;
  id_handover_record:number;
  store_name:string;
  handover_record_type:string;//loại biên bản
  total_quantity:number;// sl sản phẩm
  order_quantity:number;//SL đơn
  order_send_quantity:number;//Số đơn gửi hvc                                                                                                          
  order_transport:number;//Đơn đang chuyển
  order_returning:number;//đơn đang hoàn
  order_returned:number; //đã hoàn
  order_cancel:number;//đơn hủy 
  order_success:number;//đơn thành công
  account_create:string;//người tạo
  description?:string; //ghi chú
  ecommerce_id?:number;
  note?:string;
  goods_receipts:GoodsReceiptsResponse
  delivery_service_id?:number|null;
  updated_date?:Date;
  ecommerce_name?:string|null;
}

export interface GoodsReceiptsInfoOrderModel{
  key:number;
  order_id:number;
  order_code:string;
  fulfillment_code?:string|null;
  customer_id:number;
  customer_name:string;
  customer_phone:string;
  customer_address:string;
  product:VariantModel[];
  ship_price:number;
  total_price:number;
}

export interface GoodsReceiptsFileModel{
  file_name:string;
  create_name:string;
  create_time:string;
}

export interface GoodsReceiptsTotalProductModel{
  key:number;
  barcode:string;
  product_id:number;
  product_sku:string;
  product_name:string;
  variant_id:number;
  inventory:number;
  price:number;
  total_quantity:number;
  total_incomplate:number;
  on_hand:number;
}

export interface GoodsReceiptsOrderListModel{
  key:number;
  order_id:number;
  order_code:string;
  ffm_code?:string;
  tracking_code?:string
  customer_name:string;
  total_quantity:number;
  total_price:number;
  postage:number;
  card_number:number;
  sub_status?: string;
  note:string|null;
  customer_note?:string|null;
  items:Array<FulfillmentsItemModel>;
}

export interface FulfillmentsItemModel{
  sku: string;
  product_id:number;
  variant_id: number;
  variant: string;
  variant_barcode: string;
  net_weight:number|undefined|null;
  quantity:number|undefined|null;
  price:number|undefined|null;
}

export class PackModelDefaultValue implements PackModel{
  store_id=null;
  delivery_service_id=null;
  fulfillments=[];
}