export declare type DefectValue = any;
export interface LineItemDefect {
  id: number;
  code: string;
  sku: string;
  variant_id: number;
  variant_name: string;
  image_url: string;
  on_hand: number;
  note: string | null;
  defect: number;
  store_id: number;
  store: string;
  product_id: number;
  barcode?: string;
  [name: string]: DefectValue;
  available: number;
}

export interface InventoryDefectQuery {
  page: number;
  limit: number;
  condition?: string;
  store_ids?: Array<string>;
  from_date?: Date | string;
  to_date?: Date | string;
  from_defect?: number;
  to_defect?: number;
  updated_by?: Array<string> | string;
}

export interface InventoryItemsDefectedDetail {
  id: number;
  code: string;
  sku: string;
  barcode?: string;
  variant_id: number;
  variant_name?: string;
  image_url?: string;
  on_hand?: number;
  note: string | null;
  defect: number;
  store_id: number;
  store: string;
  product_id: number;
}

export interface DataRequestDefectItems {
  store: string;
  store_id: number;
  items: InventoryItemsDefectedDetail[];
}

export interface InventoryDefectResponse {
  id: number;
  code: string;
  version: number;
  created_by: string;
  created_name: string;
  created_date: Date;
  updated_by: string;
  updated_name: string;
  updated_date: Date;
  store_id: number;
  store: string;
  variant_id: number;
  sku: string;
  defect: number;
  note: string;
  image_url?: string;
  on_hand?: number;
  product_id: number;
  barcode?: string;
  variant_name?: string;
  name: string;
}

export interface InventoryDefectHistoryResponse {
  id: number;
  code: string;
  version: number;
  created_by: string;
  created_name: string;
  created_date: string;
  updated_by: string;
  updated_name: string;
  updated_date: string;
  store_id: number;
  store: string;
  variant_id: number;
  product_id: number;
  sku: string;
  defect: number;
  note: string;
  quantity_adj: number | null;
  name: string | null;
  variant_image: string | null;
}

export type InventoryDefectExport = {
  [name: string]: any;
};

export interface DeleteInventoryDefects {
  ids: string;
}

export const InventoryDefectFields = {
  code: "code",
  sku: "sku",
  variant_id: "variant_id",
  variant_name: "variant_name",
  image_url: "image_url",
  on_hand: "on_hand",
  note: "note",
  defect: "defect",
  store_id: "store_id",
  store: "store",
  name: "name",
};

export const InventoryDefectFieldsMapping = {
  [InventoryDefectFields.sku]: "Mã sản phẩm",
  [InventoryDefectFields.name]: "Tên sản phẩm",
  [InventoryDefectFields.store_id]: "ID Cửa hàng",
  [InventoryDefectFields.store]: "Cửa hàng",
  [InventoryDefectFields.on_hand]: "Tồn trong kho",
  [InventoryDefectFields.defect]: "Số tồn lỗi",
  [InventoryDefectFields.note]: "Ghi chú",
};

export const InventoryDefectHistoryFields = {
  code: "code",
  sku: "sku",
  variant_id: "variant_id",
  variant_name: "variant_name",
  image_url: "image_url",
  on_hand: "on_hand",
  note: "note",
  defect: "defect",
  store_id: "store_id",
  store: "store",
  name: "name",
  quantity_adj: "quantity_adj",
  updated_name: "updated_name",
  updated_by: "updated_by",
  updated_date: "updated_date",
};

export const InventoryDefectHistoryFieldsMapping = {
  [InventoryDefectHistoryFields.sku]: "Mã sản phẩm",
  [InventoryDefectHistoryFields.name]: "Tên sản phẩm",
  [InventoryDefectHistoryFields.store_id]: "ID Cửa hàng",
  [InventoryDefectHistoryFields.store]: "Cửa hàng",
  [InventoryDefectHistoryFields.defect]: "Số tồn lỗi",
  [InventoryDefectHistoryFields.quantity_adj]: "SL thay đổi",
  [InventoryDefectHistoryFields.updated_by]: "ID người thao tác",
  [InventoryDefectHistoryFields.updated_name]: "Người thao tác",
  [InventoryDefectHistoryFields.updated_date]: "Ngày thao tác",
  [InventoryDefectHistoryFields.note]: "Ghi chú",
};
