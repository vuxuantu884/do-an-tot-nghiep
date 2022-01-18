import { BaseQuery } from "../base/base.query";

export interface GoodsReceiptsSearchQuery extends BaseQuery{
    ids:number[]|null;
    order_codes:string[]|null;
    store_ids:number[]|null;
    delivery_service_ids:string[]|null;
    ecommerce_ids:number[]|null;
    good_receipt_type_ids:number[]|null;
    from_date:string|null;
    to_date:string|null;
}