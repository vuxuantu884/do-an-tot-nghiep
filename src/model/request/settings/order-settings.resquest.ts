import { BaseObject } from "model/base/base.response";

export interface CreateShippingServiceConfigReQuestModel extends BaseObject {
  program_name: string;
  start_date: string;
  end_date: string;
  status: string;
  shipping_fee_configs: [
    {
      from_price: number;
      to_price: number;
      city_name: string;
      transport_fee: number;
    }
  ];
  external_service_transport_type_ids: number[];
}
