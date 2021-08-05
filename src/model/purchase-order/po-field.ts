const POField = {
  trade_discount_rate: 'trade_discount_rate',
  trade_discount_value: 'trade_discount_value',
  trade_discount_amount: 'trade_discount_amount',
  payment_discount_rate: 'payment_discount_rate',
  payment_discount_value: 'payment_discount_value',
  payment_discount_amount: 'payment_discount_amount',
  cost_lines: 'cost_lines',
  line_items: 'line_items',
  total: 'total',
  total_cost_line: 'total_cost_line',
  untaxed_amount: 'untaxed_amount',
  tax_lines: 'tax_lines',
  expect_store_id: 'expect_store_id',
  expect_import_date: 'expect_import_date',
  payment_condition_id: 'payment_condition_id',
  payment_note: 'payment_note',
  policy_price_code: 'policy_price_code',
  status: 'status',
}

const CostLineField = {
  title: 'title',
  amount: 'amount'
}

const DiscountType = {
  percent: 'percent',
  money: 'money',
}

export {POField, CostLineField, DiscountType};