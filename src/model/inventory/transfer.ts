import { BaseObject } from "../base/base.response";

export interface InventoryTransferSearchQuery {
  page: number;
  limit: number;
  condition: string | null;
  from_store_id: any;
  to_store_id: any;
  simple: boolean;
  status: string[];
  created_by: [];
  transfer_by: [];
  received_by: [];
  cancel_by: [];
  note: string | null;
  from_created_date: any;
  to_created_date: any;
  from_transfer_date: any;
  to_transfer_date: any;
  from_receive_date: any;
  to_receive_date: any;
  from_cancel_date: any;
  to_cancel_date: any;
  from_pending_date: any;
  to_pending_date: any;
}

export interface InventoryTransferImportExportSearchQuery {
  page: number;
  limit: number;
  condition: string | null;
  from_store_id: any;
  to_store_id: any;
  simple: boolean;
  status: string[];
  created_by: [];
  transfer_by: [];
  received_by: [];
  cancel_by: [];
  note: string | null;
  from_created_date: any;
  to_created_date: any;
  from_transfer_date: any;
  to_transfer_date: any;
  from_receive_date: any;
  to_receive_date: any;
  from_cancel_date: any;
  to_cancel_date: any;
  from_pending_date: any;
  to_pending_date: any;
}

export interface InventoryTransferLogSearchQuery {
  page: number;
  limit: number;
  condition: string | null;
  from_store_id: number | null;
  to_store_id: number | null;
  created_by: [];
  updated_by: [];
  action: [];
  from_created_date: any;
  to_created_date: any;
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
  store_ids?: number | null;
  type?: string | null;
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
  weight_unit: string;
}

export interface FileUrl {
  id?: number;
  transfer_id?: number;
  url: string;
}

export type StockTransferSubmit = {
  from_store_name: string;
  to_store_name: string;
  from_store_id?: number;
  to_store_id?: number;
  from_store_address: string;
  to_store_address: string;
  from_store_phone: string;
  from_store_code: string;
  to_store_phone: string;
  to_store_code: string;
  note: string;
  attached_files?: FileUrl[];
  line_items: LineItem[];
  exception_items?: [];
};

export interface ForwardStoreData {
  to_store_id: string;
}

export type TrackingLogs = {
  fulfillment_code: string;
  shipping_message: string;
  shipping_status: string;
  updated_date: string;
};

export type ShipmentItem = {
  id: number;
  delivery_service_id: number;
  delivery_service_code: string;
  delivery_service_name: string;
  delivery_service_logo: string;
  order_code: string;
  fulfillment_code: string;
  store_id: number;
  partner_shop_id: number;
  money_collection: string;
  transport_type: string;
  tracking_logs: TrackingLogs[];
  transport_type_name: string;
  cod: number;
  insurance: string;
  weight: number;
  weight_unit: string;
  total_fee: number;
  insurance_fee: string;
  note_to_shipper: string;
  partner_note: string;
  shipping_requirement: string;
  who_paid: string;
  tracking_code: string;
  expected_delivery_time: string;
  office_time: boolean;
  status: string;
};

export interface InventoryTransferDetailItem {
  id: number;
  code: string;
  version: number;
  created_by: string;
  created_name: string;
  transfer_by: string;
  transfer_name: string;
  received_by: string;
  received_name: string;
  cancel_by: string;
  cancel_name: string;
  created_date: Date;
  requested_date: Date;
  confirmed_date: Date;
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
  total_sent_variant: number;
  total_sent_quantity: number;
  total_sent_amount: number;
  pending_date: string;
  received_method: string;
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
  sub_status: string;
  store_forward: Store;
  forward_note: string;
}

export interface InventoryExportImportTransferDetailItem {
  id: number;
  code: string;
  version: string | null;
  created_by: string;
  created_name: string;
  created_date: Date;
  updated_by: string;
  updated_name: string;
  updated_date: Date;
  sku: string;
  variant_name: string;
  variant_id: number;
  transfer_quantity: number;
  real_quantity: number;
  price: number;
  amount: number;
  transfer_by: string;
  transfer_name: string;
  transfer_date: Date;
  received_by: string;
  received_name: string;
  receive_date: Date;
  inventory_transfer: InventoryTransferDetailItem;
  barcode: string;
}

export type DeleteTicketRequest = {
  note: string;
};

export type DataExport = {
  transfers: Object[];
  secret?: string;
};

export type DataMultipleCancel = {
  note: string;
  transfers: Object[];
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
}

export interface InventoryTransferShipmentRequest {
  delivery_service_id: number | null;
  delivery_service_code: string | null;
  delivery_service_name: string | null;
  delivery_service_logo: string | null;
  order_code: string | null;
  fulfillment_code: string | null;
  store_id: number | null;
  transport_type: string | null;
  transport_type_name: string | null;
  cod: number | null;
  weight: number | null;
  weight_unit: string | null;
  total_fee: number | null;
  note_to_shipper: string | null;
  shipping_requirement: string | null;
  who_paid: string | null;
  expected_delivery_time: string | null;
  office_time: boolean | null;
}

export interface TransportTypeRS {
  code: string;
  external_service_code: string;
  name: string;
  description: string;
  active: boolean;
}
export interface LogisticGateAwayResponse {
  id: number;
  code: string;
  external_service_code: string;
  logo: string;
  name: string;
  active: boolean;
  transport_types: Array<TransportTypeRS>;
}

export interface InventoryProcessImport {
  total_process: string;
  processed: string;
  success: string;
  error: string;
}

export interface GetTopReceivedStoreParam {
  from_store_id: number;
  limit: number;
}
