import { BaseObject } from "model/base/base.response";

export interface PurchasePayments extends BaseObject
{
    accountCode:string,
    payment_method_id:number,
    amount:number,
    reference:string,
    transaction_date:string,
    note:string,
    status:string,
    status_name:string,
    
}