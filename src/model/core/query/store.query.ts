import { BaseQuery } from "model/query/base.query";
import { Moment } from "moment";

export interface StoreQuery extends BaseQuery {
  city_id?: number
  code?: string,
  country_id?: number,
  district_id?: number,
  zip_code?: string,
  ward_id?: string,
  vm_code?: string,
  finder_code?: string,
  from_begin_date?: Moment
  from_square?: number,
  group_id?: number,
  hotline?: number,
  is_simple?: boolean,
  mail?: string,
  manager_code?: string,
  name?: string,
  rank?: string,
  status?: string,
  to_begin_date?: Moment,
  to_square?: number,
}