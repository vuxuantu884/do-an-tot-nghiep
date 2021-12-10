import { BaseObject } from 'model/base/base.response';
export interface CustomerDuplicateModel extends BaseObject{
    key:number;
    customer:string;
    customer_phone_number:string;
    customer_city:string;
    customer_district:string;
    customer_ward:string;
    customer_full_address:string;
    store_id:number;
    store:string;
    order_number:number;
}