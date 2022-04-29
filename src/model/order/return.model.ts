export interface ReturnModel {
  assignee: string;
  assignee_code: string;
  code_order: string;
  code_order_return: string;
  created_by: string;
  created_date: string;
  created_name: string;
  customer_email: string;
  customer_id: number;
  customer_name: string;
  customer_phone_number: string;
  id: number;
  order_id: number;
  payment_status: string;
  reason:string;
  return_reason?:ReasonReturn;
  reason_id: number;
  receive_date: string | null;
  received: boolean;
  source: string;
  source_id: number;
  store: string;
  store_id: number;
  total_amount: number;
  updated_by: string;
  updated_date: string;
  updated_name: string;
}

export interface ReturnSearchQuery {
  page: number;
  limit: number;
  sort_type: string|null;
  sort_column: string|null;
  search_term: string|null;
  created_on_min: string|null;
  created_on_max: string|null;
  // created_on_predefined: string|null;
  received_on_min: string|null;
  received_on_max: string|null;
  received_predefined: string|null;
  payment_status: [];
  assignee_code: [];
  price_min: number|null;
  price_max: number|null;
  store_ids: [],
  is_received: [];
  account_codes: [];
  reason_ids: [];
  is_online?: boolean|null;
  source_ids: [];
  channel_codes: [];
}

export interface ReasonReturn{
  id: number;
  code: string;
  name: string;
  sub_reasons:any[];
}

export interface ReturnCalculateRefundModel {
  money_refund: number; 
  point_refund: number; 
}