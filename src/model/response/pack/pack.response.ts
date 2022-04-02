
import { BaseObject } from "model/base/base.response";
import { fulfillmentsModel, paymentsModel } from "model/pack/pack.model";
import { OrderResponse } from "../order/order.response";

export interface GoodsReceiptsTypeResponse extends BaseObject {
    name: string
}

export interface GoodsReceiptsAddOrderRequest{
    order_codes:string;
    store_id:number;
    delivery_service_provider_id:number;
    channel_id:number;
}

export interface GoodsReceiptsResponse extends BaseObject{
    key:number;
    store_id:number;
    store_name:string;
    ecommerce_id:number;
    ecommerce_name:string;
    receipt_type_id:number;
    receipt_type_name:string;
    delivery_service_id:number;
    delivery_service_name:string;
    orders:Array<GoodsReceiptsOrder> | null;
    delivery_service_type:string;
    variant: Array<any>;
    total_quantity?: number;
    version?:number;
    description?:string;
    note?:string;
}

export interface GoodsReceiptsOrder extends OrderResponse{
    code: string;
    fulfillment_status: string;
    goods_receipt_id: number;
    id: number;
    total_quantity: number|null;
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

export interface OrderConcernGoodsReceiptsResponse extends BaseObject{
    id: number;
    code: string;
    customer_id: number;
    customer: string;
    fulfillment_status: string;
    payments: Array<paymentsModel>;
    fulfillments:Array<fulfillmentsModel>;
}
