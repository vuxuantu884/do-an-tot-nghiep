import { BaseQuery } from "model/base/base.query";
import { BaseObject } from "model/base/base.response";

export interface BankAccountResponse extends BaseObject{
    account_number: string,
    account_holder: string,
    bank_code: string,
    bank_name: string,
    store_ids: number[],
    status: boolean,
    default: boolean
}

export interface BankAccountRequest extends BaseObject{
    account_number: string,
    account_holder: string,
    bank_code: string,
    bank_name: string,
    store_ids: string,
    status: boolean,
    default: boolean
}

export interface BankAccountSearchQuery extends BaseQuery {
    account_number?:string;
    store_ids?:number[];
    status?:string;
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
    store_ids= "";
    status= true;
    default= false;
}