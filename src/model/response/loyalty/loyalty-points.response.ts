
export interface LoyaltyPoint {
  customer_id: number | null;
  loyalty_level_id: number | null;
  loyalty_level: string | null;
  point: number | null;
  total_order_count: number | null;
  total_money_spend: number | null;
  total_subtract_lock_point: number | null;
  current_point: number | null;
}

export interface LoyaltyCard {
  id: number | null;
  created_date: Date | null;
  last_modified_date: Date | null;
  customer_id: number | null;
  customer_name: string;
  release_id: number | null;
  user_assigned_id: number | null;
  card_number: string;
  status: string;
  assigned_date: Date | null;
}

export interface LoyalTyCalCulateRefund {
  money_refund: number;
  point_refund: number;
}
