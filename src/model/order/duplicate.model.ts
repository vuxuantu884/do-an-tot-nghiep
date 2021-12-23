import { BaseObject } from 'model/base/base.response';
export interface CustomerDuplicateModel extends BaseObject{
    key:number;
    customer:string;
    customer_phone_number:string;
    country:string;
    city:string;
    district:string;
    ward:string;
    full_address:string;
    store_id:number;
    store:string;
    count_order:number;
}