export interface OrderItemDiscountModel {
  rate: number|null;
  value: number|null;
  amount: number|null;
  promotion_id?: number;
  reason: string;
}