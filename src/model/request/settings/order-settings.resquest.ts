export interface CreateShippingServiceConfigReQuestModel {
  program_name: string;
  start_date: string;
  end_date: string;
  status: string;
  shipping_fee_configs: {
    from_price: number | undefined;
    to_price: number | undefined;
    city_name: string;
    city_id: number | undefined;
    transport_fee: number | undefined;
  }[];
  external_service_transport_type_ids: number[];
}

export interface CreateShippingServiceConfigReQuestFormModel
  extends Omit<
    CreateShippingServiceConfigReQuestModel,
    "start_date" | "end_date"
  > {
  start_date: moment.Moment | null;
  end_date: moment.Moment | null;
}

export interface OrderConfigRequestModel {
  sellable_inventory: boolean;
  for_all_order: boolean;
  allow_choose_item: boolean;
  order_config_action: string;
  order_config_print_id: number;
  hide_gift:boolean;
  hide_bonus_item:boolean;
}
