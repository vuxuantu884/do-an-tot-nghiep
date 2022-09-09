import { BaseObject } from "model/base/base.response";
import { Moment } from "moment";

export interface ExpenditureSearchQuery {
  page: number | null;
  limit: number | null;
  store_ids?: number[];
  create_date?: string | Moment | null;
}

export interface ExpenditureTableModel extends BaseObject {
  name: string;
}
