export interface UpdateConfig3rdPartyLogisticsReQuestModel {
  external_service_id?: number;
  external_service_code?: string;
  base_url?: string;
  token?: string;
  username?: string;
  password?: string;
  api_key?: string;
  status: string;
  transport_types?: {
    id: number;
    status: string;
  }[];
}

export interface updateConfigReQuestModel {
  token?: string;
  username?: string;
  password?: string;
  external_service_code: string;
  status: string;
  transport_types?: {
    code: string;
    status: string;
    name: string;
    description: string;
  }[];
}

export interface getDeliveryMappedStoresReQuestModel {
  token?: string;
  username?: string;
  password?: string;
}

export interface createDeliveryMappedStoreReQuestModel {
  token: string;
  username: string;
  password: string;
  store_id: number;
  store_name: string;
  partner_shop_id: number;
}

export interface deleteDeliveryMappedStoreReQuestModel {
  token: string;
  username: string;
  password: string;
  store_id: number;
  partner_shop_id: number;
}
