export interface PackSearchQuery {
  page: number;
  limit: number;
  sort_type: string|null;
  sort_column: string|null;
  delivery_provider_ids: [];
}

export interface PackItemOrderModel{
  id:number;
  code:string;
  receiver:string|null;
  product:string;
  sku:string|null;
  price:number;
  quantity:number;
  postage:number;
  total_revenue:number;
}