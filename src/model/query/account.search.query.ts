import { BaseQuery } from "./base.query";

export interface AccountSearchQuery extends BaseQuery {
    code?: string, 
    department_ids?: Array<number>, 
    from_date?:Date,
    to_date?:Date
    info?:string,
    mobile?:string,
    position_ids?:number,
    role_id?: Array<number>,    
    store_ids?:Array<number>,
}