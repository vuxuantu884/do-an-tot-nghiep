export interface UpdateLoyaltyPoint {
  current_point: number;
  add_point: number;
  subtract_point: number;
  customer_id: number;
  note: string;
  reason: string;
}
