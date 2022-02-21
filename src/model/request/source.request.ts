import { BaseQuery } from "model/base/base.query";

export interface SourceSearchQuery extends BaseQuery {
  name?: string,
  channel_id?: number,
  department_ids?: number[],
  ids?: number[],
}