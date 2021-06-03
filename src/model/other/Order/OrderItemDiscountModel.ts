export interface OrderItemDiscountModel {
  rate: number;
  value: number;
  amount: number;
  promotion_id?: number;
  reason: string;
}