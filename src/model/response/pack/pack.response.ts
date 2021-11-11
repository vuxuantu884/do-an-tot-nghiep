
import { BaseObject } from "model/base/base.response";
import { OrderResponse } from "../order/order.response";

export interface GoodsReceiptsTypeResponse extends BaseObject {
    name: string
}

export interface GoodsReceiptsResponse extends BaseObject{
    key:number;
    store_id:number;
    store_name:string;
    ecommerce_id:number;
    ecommerce_name:string;
    receipt_type_id:number;
    receipt_type_name:string;
    delivery_service_code:string;
    delivery_service_name:string;
    orders:Array<OrderResponse> | null;
}

export interface  GoodsReceiptsSearchResponse extends BaseObject{
    store_id:number;
    store_name:string;
    ecommerce_id:number;
    ecommerce_name:string;
    receipt_type_id:number;
    receipt_type_name:string;
    delivery_service_id:number;
    delivery_service_name:string;
    orders:Array<OrderResponse>;
}