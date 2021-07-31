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