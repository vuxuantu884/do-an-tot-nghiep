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
export interface ShippingServiceConfigDetailResponseModel {
  id: number;
  program_name: string;
  start_date: string;
  end_date: string;
  status: string;
  shipping_fee_configs: [
    {
      id: number;
      from_price: number;
      to_price: number;
      city_name: string;
      transport_fee: number;
      city_id: number;
    }
  ];
  external_service_transport_types: [
    {
      id: number;
      code: string;
      external_service_id: number;
      external_service_code: string;
      name: string;
      status: string;
    }
  ];
}
