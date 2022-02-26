import { BaseObject } from "../base/base.response";

export interface InventoryTransferSearchQuery {
  page: number;
  limit: number;
  condition: string | null,
  from_store_id: number | null,
  to_store_id: number | null,
  status: [],
  from_total_variant: number | null,
  to_total_variant: number | null,
  from_total_quantity: number | null,
  to_total_quantity: number | null,
  from_total_amount: number | null,
  to_total_amount: number | null,
  created_by: [],
  from_created_date: any,
  to_created_date: any,
  from_transfer_date: any,
  to_transfer_date: any,
  from_receive_date: any,
  to_receive_date: any
}

export interface InventoryTransferLogSearchQuery{
  page: number;
  limit: number;
  condition: string | null,
  from_store_id: number | null,
  to_store_id: number | null,
  updated_by: [],
  action: [],
  from_created_date: any,
  to_created_date: any
}

export interface Store extends BaseObject {
  id: number;
  accounts: string;
  address: string;
  code: string;
  begin_date: Date;
  city_id: number;
  city_name: string;
  country_id: number;
  country_name: string;
  district_id: number;
  district_name: string;
  finder_code: string;
  full_address: string;
  group_id: number;
  group_name: string;
  hotline: string;
  mail: string;
  manager_code: string;
  name: string;
  number_of_account: number;
  rank: number;
  rank_name: string;
  square: number;
  status: string;
  vm_code: string;
  ward_id: number;
  ward_name: string;
  zip_code: string;
}

export type StoreStatus = {
  simple?: boolean;
  status?: string;
  limit?: number;
  page?: number;
  info?: string;
  store_ids?: number|null;
};

export type FileParam = {
  files: File[] | undefined;
  folder: string;
};

export interface LineItem {
  id: number;
  code: string;
  version: number;
  created_by: string;
  created_name: string;
  created_date: Date;
  updated_by: string;
  updated_name: string;
  updated_date: Date;
  sku: string;
  variant_name: string;
  variant_id: number;
  variant_image: string;
  product_name: string;
  product_id: number;
  available: number;
  transfer_quantity: number;
  real_quantity: number;
  amount: number;
  price: number;
  barcode: string;
  weight: number;
  weight_unit: string
}

export interface FileUrl {
  id?: number;
  transfer_id?: number;
  url: string;
}

export type StockTransferSubmit = {
  store_transfer: {
    id?: number;
    store_id: number,
    hotline: string,
    address: string,
    name: string,
    code: string
  },
  store_receive: {
    id?: number;
    store_id: number,
    hotline: string,
    address: string,
    name: string,
    code: string
  }
  from_store_id?: number;
  to_store_id?:number;
  note: string;
  attached_files: FileUrl[];
  line_items: LineItem[];
  exception_items: [];
};

export type TrackingLogs = {
  fulfillment_code: string,
  shipping_message: string,
  shipping_status: string,
  updated_date: string,
};

export type ShipmentItem = {
  id: number,
  delivery_service_id: number,
  delivery_service_code: string,
  delivery_service_name: string,
  delivery_service_logo: string,
  order_code: string,
  fulfillment_code: string,
  store_id: number,
  partner_shop_id: number,
  money_collection: string,
  transport_type: string,
  tracking_logs: TrackingLogs[],
  transport_type_name: string,
  cod: number,
  insurance: string,
  weight: number,
  weight_unit: string,
  total_fee: number,
  insurance_fee: string,
  note_to_shipper: string,
  partner_note: string,
  shipping_requirement: string,
  who_paid: string,
  tracking_code: string,
  expected_delivery_time: string,
  office_time: boolean,
  status: string
};

export interface InventoryTransferDetailItem {
  id: number;
  code: string;
  version: number;
  created_by: string;
  created_name: string;
  created_date: Date;
  updated_by: string;
  updated_name: string;
  updated_date: Date;
  from_store_id: number;
  from_store_name: string;
  from_store_code: number;
  from_store_phone: string;
  from_store_address: string;
  to_store_code: number;
  to_store_phone: string;
  to_store_address: string;
  to_store_id: number;
  to_store_name: string;
  status: string;
  total_variant: number;
  total_quantity: number;
  total_amount: number;
  pending_date: string;
  transfer_date: Date;
  receive_date: string;
  cancel_date: string;
  attached_files: [];
  note: string;
  store_transfer: Store;
  store_receive: Store;
  line_items: Array<LineItem>;
  shipment: ShipmentItem;
  exception_items: [];
};

export type DeleteTicketRequest = {
  note: string;
};

export interface InventoryTransferLog {
    id: number;
    code: string;
    version: number;
    created_by: string;
    created_name: string;
    created_date: Date;
    updated_by: string;
    updated_name: string;
    updated_date: Date;
    root_id: number;
    data: string;
    action: string;
    transfer_code: string;
    transfer_id: number;
    from_store_name: string;
    to_store_name: string;
    from_store_id: number;
    to_store_id: number;
};

export interface InventoryTransferShipmentRequest {
  delivery_service_id: number | null,
  delivery_service_code: string | null,
  delivery_service_name: string | null,
  delivery_service_logo: string | null,
  order_code: string | null,
  fulfillment_code: string | null,
  store_id: number | null,
  transport_type: string | null,
  transport_type_name: string | null,
  cod: number | null,
  weight: number | null,
  weight_unit: string | null,
  total_fee: number | null,
  note_to_shipper: string | null,
  shipping_requirement: string | null,
  who_paid: string | null,
  expected_delivery_time: string | null,
  office_time:boolean | null,
}

export interface TransportTypeRS {
  code:	string,
  external_service_code:	string,
  name:	string,
  description:	string,
  active: boolean,
}
export interface LogisticGateAwayResponse {
  id:	number,
  code:	string,
  external_service_code:	string,
  logo:	string,
  name:	string,
  active:	boolean,
  transport_types: Array<TransportTypeRS>
}

export interface InventoryProcessImport {
  total_process: string;
  processed: string;
  success: string;
  error: string;
};
