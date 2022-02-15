export interface EcommerceAddressQuery {
  order_sn: String | null;
  shop_id: null
}

export interface EcommerceStoreAddress {
  address_id: number;
  region: String | null;
  state: String | null;
  city: String | null;
  address: String | null;
  zipcode: String | null;
  district: String | null;
  town: String | null;
  address_flag: Array<string>;
  time_slot_list: Array<TimeSlotList>;
}

export interface TimeSlotList {
  date: number;
  time_next: String | null;
  pickup_time_id: String | null;
}

export interface EcommerceCreateLogistic {
  order_sn: String;
  shop_id: String;
  pickup: PickUpAddress;
}

export interface PickUpAddress {
  address_id: number;
  pickup_time_id: String;
  tracking_number: String;
}