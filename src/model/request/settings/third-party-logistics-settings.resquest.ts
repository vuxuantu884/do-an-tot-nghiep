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
