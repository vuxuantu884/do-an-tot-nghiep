const POField = {
  id: 'id',
  version: 'version',
  code: 'code',
  trade_discount_rate: 'trade_discount_rate',
  trade_discount_value: 'trade_discount_value',
  trade_discount_amount: 'trade_discount_amount',
  payment_discount_rate: 'payment_discount_rate',
  payment_discount_value: 'payment_discount_value',
  payment_discount_amount: 'payment_discount_amount',
  cost_lines: 'cost_lines',
  line_items: 'line_items',
  total: 'total',
  total_paid:'total_paid',
  total_cost_line: 'total_cost_line',
  untaxed_amount: 'untaxed_amount',
  tax_lines: 'tax_lines',
  expect_store_id: 'expect_store_id',
  expect_store: 'expect_store',
  expect_import_date: 'expect_import_date',
  payment_condition_id: 'payment_condition_id',
  payment_condition_name:'payment_condition_name',
  payment_note: 'payment_note',
  policy_price_code: 'policy_price_code',
  status: 'status',
  merchandiser_code: 'merchandiser_code',
  merchandiser: 'merchandiser',
  qc_code: 'qc_code',
  qc: 'qc',
  reference: 'reference',
  note: 'note',
  tags: 'tags',
  payments:'payments',
  procurements: 'procurements',
  receipt_quantity: 'receipt_quantity',
  planned_quantity: 'planned_quantity',
 
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