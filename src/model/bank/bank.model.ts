import { BaseQuery } from "model/base/base.query";
import { BaseObject } from "model/base/base.response";
import { StoreResponse } from "model/core/store.model";

export interface BankAccountResponse extends BaseObject{
    account_number:string;
    account_holder:string;
    bank_name:string;
    store?:StoreResponse[];
    status:string;
    is_default:boolean;
}

export interface BankAccountSearchQuery extends BaseQuery {
    account_number?:string;
    store_ids?:number[];
    status?:string;
}