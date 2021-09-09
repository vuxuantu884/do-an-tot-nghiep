import { BaseObject } from "model/base/base.response";

export interface IsAllowToSellWhenNotAvailableStockResponseModel
  extends BaseObject {
  sellable_inventory: boolean;
}

export interface ShippingServiceConfigResponseModel {
  id: number;
  program_name: string;
  start_date: string;
  end_date: string;
  status: string;
}
