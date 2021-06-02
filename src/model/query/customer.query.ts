import { BaseQuery } from "./base.query";

export interface SearchCustomerQuery extends BaseQuery {
    request?: string,
}