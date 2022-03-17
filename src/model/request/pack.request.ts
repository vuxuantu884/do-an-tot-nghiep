import { BaseObject } from "model/base/base.response";

export interface GoodsReceiptsRequest extends BaseObject {
    request_id:string;
    operator_kc_id:string;
    store_id:number;
    store_name:string;
    ecommerce_id:number;
    ecommerce_name:string;
    receipt_type_id:number;
    receipt_type_name:string;
    delivery_service_id:number;
    delivery_service_name:string;
    delivery_service_type:string;
    codes:string[];
    description:string;
}

export interface GoodsReceiptsDeleteRequest extends BaseObject{
    request_id:string;
    operator_kc_id:string;
    ids:number[];
}