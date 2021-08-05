import { BaseObject } from "model/base/base.response";

export interface PurchasePayments extends BaseObject
{
    accountCode:string,
    payment_method_code:string,
    amount:number,
    reference:string,
    transaction_date:string,
    note:string,
    status:string,
    status_name:string,
    
}