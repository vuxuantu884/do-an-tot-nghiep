import { BaseQuery } from "./base.query";

export interface SearchSupplierQuerry extends BaseQuery {
  country_id?: number,
  city_id?: number,
  district_id?: number,
  contact?: string,
  created_name?: string,
  from_created_date?: number,
  to_created_date?: number,
  info?: string,
  note?: string,
  pic?: string,
  scorecard?: string,
  sort_column?: string,
  sort_type?: string,
  status?: string,
  type?: string,
  goods?: string,
}