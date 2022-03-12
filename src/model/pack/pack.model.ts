import { OrderResponse } from 'model/response/order/order.response';
export interface PackModel{
  store_id?:number|null;
  delivery_service_provider_id?:number|null;
  order:OrderResponse[];
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
  shipment: string;
  items:Array<VariantModel>;
}
export interface VariantModel{
  sku: string;
  product_id: number;
  product: string;
  variant_id: number;
  variant: string;
  variant_barcode: string;
  quantity:number;
}

export interface GoodsReceiptsSearhModel{
  key:number;
  id_handover_record:number;
  store_name:string;
  handover_record_type:string;//loại biên bản
  product_quantity:number;// sl sản phẩm
  order_quantity:number;//SL đơn 
  order_send_quantity:number;//Số đơn gửi hvc                                                                                                          
  order_transport:number;//Đơn đang chuyển
  order_have_not_taken:number;//Đơn chưa lấy
  order_cancel:number;//đơn hủy 
  order_moving_complete:number;//đơn hoàn chuyển
  order_success:number;//đơn thành công
  order_complete:number;//đơn hoàn
  account_create:string;//người tạo
}

export interface GoodsReceiptsInfoOrderModel{
  key:number;
  order_id:number;
  order_code:string;
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
}

export interface GoodsReceiptsOrderListModel{
  key:number;
  order_id:number;
  order_code:string;
  customer_name:string;
  total_quantity:number;
  total_price:number;
  postage:number;
  card_number:number;
  status:string;
  status_color?: string;
  note:string|null;
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

export class PackModelDefaltValue implements PackModel{
  store_id=null;
  delivery_service_id=null;
  order=[];
}