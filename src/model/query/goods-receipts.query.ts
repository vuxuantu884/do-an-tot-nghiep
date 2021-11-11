import { BaseQuery } from "../base/base.query";

export interface GoodsReceiptsSearchQuery extends BaseQuery{
    store_id:number|null;
    delivery_service_id:string|null;
    ecommerce_id:number|null;
    good_receipt_type_id:number|null;
    from_date:string|null;
    to_date:string|null;
}