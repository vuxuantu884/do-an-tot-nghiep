import { NumberLiteralType } from "typescript";
import { BaseQuery } from "./base.query";

export interface AccountSearchQuery extends BaseQuery {
    code?: string, 
    department_ids?: Array<number>, 
    from_date?:number,
    to_date?:number
    info?:string,
    mobile?:string,
    position_ids?:number,
    role_id?:number,
    store_ids?:number,
    
}