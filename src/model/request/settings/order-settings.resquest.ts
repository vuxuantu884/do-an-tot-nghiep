import { BaseObject } from "model/base/base.response";

export interface CreateShippingServiceConfigReQuestModel {
  program_name: string;
  start_date: string;
  end_date: string;
  status: string;
  shipping_fee_configs: {
    from_price: number | undefined;
    to_price: number | undefined;
    city_name: string;
    transport_fee: number | undefined;
  }[];
  external_service_transport_type_ids: number[];
}
