import { StoreResponse } from "model/core/store.model";

export interface TabProps {
  current: string;
  stores: Array<StoreResponse>;
}
