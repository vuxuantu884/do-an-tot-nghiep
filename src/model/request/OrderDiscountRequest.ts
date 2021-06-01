export interface OrderDiscountRequest {
  rate: number|null;
  value: number|null;
  amount: number;
  promotion_id: number|null;
  reason: string;
  source: string;
}