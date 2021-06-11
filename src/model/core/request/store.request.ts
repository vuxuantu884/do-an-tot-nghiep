import { Moment } from 'moment';
export interface BaseStoreRequest {
  name: string
  hotline: string
  country_id: number
  city_id: number|null
  district_id: number|null
  ward_id: number|null
  address: string
  zip_code: string|null
  email: string|null
  square: number|null
  rank: number|null
  status: string,
  begin_date: Moment
  latitude: number|null
  longtitude: number|null
  group_id: number|null
}

export interface StoreCreateRequest extends BaseStoreRequest {
}

export interface StoreUpdateRequest extends BaseStoreRequest {
  version: number,
}