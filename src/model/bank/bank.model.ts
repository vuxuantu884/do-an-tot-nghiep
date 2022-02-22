import { BaseQuery } from "model/base/base.query";
import { BaseObject } from "model/base/base.response";

export interface BankAccountResponse extends BaseObject{
    account_number: string,
    account_holder: string,
    bank_code: string,
    bank_name: string,
    status: boolean,
    default: boolean,
    stores: BankStoreInAccount[],
}

export interface BankAccountRequest extends BaseObject{
    account_number: string,
    account_holder: string,
    bank_code: string|null,
    bank_name: string|null,
    status: boolean,
    default: boolean,
    stores: BankStoreInAccount[],
}

export interface BankAccountSearchQuery extends BaseQuery {
    ids?:number|null;
    store_ids?:number[]|null;
    account_numbers?:string|null;
    account_holders?:string|null;
    status?:boolean|null;
    is_default?:boolean|null;
}

export class BankAccountModel implements BankAccountRequest{
    id=0;
    code= "";
    request_id= "";
    operator_kc_id= "";
    account_number= "";
    account_holder= "";
    bank_code= "";
    bank_name= "";
    stores= [];
    status= true;
    default= false;
}

export interface BankStoreInAccount extends BaseObject{
    store_id:number;
    store_code:string;
    store_name:string;
}