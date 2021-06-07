export interface OrderPaymentRequest {
  payment_method_id: number,
  payment_method: string,
  amount: number,
  reference: string,
  source: string,
  paid_amount: number,
  return_amount: number,
  status: string,
  customer_id: number,
  type: string,
  note: string,
}