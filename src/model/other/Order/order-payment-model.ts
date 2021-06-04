export interface OrderPaymentModel {
  payment_method_id: number,
  payment_method: string,
  amount: number,
  reference: '',
  source: '',
  return_amount: number,
  paid_amount: number
  status: string,
  name?: string,
  code?: string,
  point?: number,
  customer_id: number,
  type: string,
  note: string,
}
