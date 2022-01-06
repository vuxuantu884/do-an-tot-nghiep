import { BaseObject } from "model/base/base.response";

export interface OrderConfigResponseModel extends BaseObject {
  sellable_inventory: boolean;
  order_config_action: string;
  order_config_print: {
    id: number;
    name: string;
  };
  for_all_order: boolean;
  allow_choose_item: boolean;
  hide_gift:boolean;
  hide_bonus_item:boolean;
}

export interface OrderConfigPrintResponseModel extends BaseObject {
  id: number;
  name: string;
}

export interface OrderConfigActionOrderPreviewResponseModel extends BaseObject {
  id: number;
  name: string;
}
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
  transport_types: [
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
