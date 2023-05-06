export type CreateBinLocationItems = {
  sku: string;
  product_id: number;
  variant_id: number;
  name: string;
  barcode: string;
  quantity: number;
  note: string;
  image_url?: string;
  code?: string;
};

export type CreateBinLocationData = {
  from_bin_code: string;
  to_bin_code: string;
  action_by: string;
  updated_by?: string;
  updated_name?: string;
  items: Array<CreateBinLocationItems>;
};

export type BinLocationResponse = {
  barcode: string;
  companyId: number;
  id: number;
  name: string;
  onHand: number;
  productId: number;
  sku: string;
  store: string;
  storeId: number;
  variantId: number;
  variantImage: string;
  bins: any;
};

export type BinLocationHistoryResponse = {
  barcode: string;
  companyId: number;
  id: number;
  name: string;
  onHand: number;
  productId: number;
  sku: string;
  store: string;
  storeId: number;
  variantId: number;
  variantImage: string;
};

export type BinLocationSearchQuery = {
  page: number;
  limit: number;
  action_by?: string;
  condition?: string | null;
  filter_status?: string;
};

export type SumBinDataResponse = Omit<BinDataResponse, "variantId">;

export type BinLocationExport = {
  [name: string]: any;
};

export type BinDataResponse = {
  storeId: number;
  binCode: string;
  onHand: number;
  variantId: number;
};
