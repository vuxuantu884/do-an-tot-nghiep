export interface PurchaseProcument {
  id?: number
  code: string,
  reference: string,
  store_code: string,
  expect_receipt_date: string,
  line_items: Array<PurchaseProcumentLineItem>,
  status: string,
  note: string,
  actived_date: string,
  actived_by: string,
  stock_in_date: string,
  stock_in_by: string,
}

export interface PurchaseProcumentLineItem {
  id?: number,
  line_item_id: number,
  sku: string,
  variant_name: string,
  variant_image: string|null,
  ordered_quantity: number,
  accepted_quantity: number,
  planned_quantity: number,
  quantity: number,
  real_quantity: number,
  note: string,
}

const POProcumentField = {
  code: 'code',
  reference: 'reference',
  store_code: 'store_code',
  expect_receipt_date: 'expect_receipt_date',
  line_items: 'line_items',
  status: 'status',
  note: 'note',
  actived_date: 'actived_date',
  actived_by: 'actived_by',
  stock_in_date: 'stock_in_date',
  stock_in_by: 'stock_in_by',
}

const POProcumentLineItemField = {
  id: 'id',
  line_item_id: 'line_item_id',
  sku: 'sku',
  variant_name: 'variant_name',
  variant_image: 'variant_image',
  ordered_quantity: 'ordered_quantity',
  accepted_quantity: 'accepted_quantity',
  planned_quantity: 'planned_quantity',
  quantity: 'quantity',
  real_quantity: 'real_quantity',
  note: 'note',
}

export {POProcumentField, POProcumentLineItemField};
