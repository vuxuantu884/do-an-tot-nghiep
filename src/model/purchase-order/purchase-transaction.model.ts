export interface PurchaseTransaction
{
    id:number,
    accountCode:string,
    reference:string,
    amount:string,
    payment_method_id:number,
    status:string,
    purchase_order_id:string,
    transaction_date:string,
}