const InventoryQueryField = {
  condition: 'condition',
  store_ids: 'store_ids',
  is_remain: 'is_remain',
  created_date: 'created_date',
  status: 'status'
}

const AvdInventoryFilter = {
  info: 'info',
  store_ids: 'store_ids',
  made_in_ids: 'made_in_ids',
  designer_codes: 'designer_codes',
  merchandiser_codes: 'merchandiser_codes',
  collection_codes: 'collection_codes',
  category_ids: 'category_ids',
  variant_prices: 'variant_prices',
  from_price: 'from_price',
  to_price: 'to_price'
}

const BasicInventoryFilter = {
  condition: 'condition',
  store_id: 'store_id',
}

const InventoryMappingField = {
  [AvdInventoryFilter.store_ids]: 'Cửa hàng',
  [AvdInventoryFilter.made_in_ids]: 'Xuất xứ',
  [AvdInventoryFilter.designer_codes]: 'Thiết kế',
  [AvdInventoryFilter.merchandiser_codes]: 'Merchandiser',
  [AvdInventoryFilter.collection_codes]: 'Nhóm hàng',
  [AvdInventoryFilter.category_ids]: 'Danh mục',
  [AvdInventoryFilter.variant_prices]: 'Giá bán',
  [AvdInventoryFilter.from_price]: 'Từ',
  [AvdInventoryFilter.to_price]: 'Đến',
}

const HistoryInventoryQueryField = {
  condition: 'condition',
  store_ids: 'store_ids',
  from_created_date: 'from_created_date',
  to_created_date: 'to_created_date',
  from_transaction_date: 'from_transaction_date',
  to_transaction_date: 'to_transaction_date',
  from_quantity: 'from_quantity',
  to_quantity: 'to_quantity'
}

const AvdHistoryInventoryFilter = {
  transaction_date: 'transaction_date',
  quantity_change: 'quantity_change',
}

const AvdAllFilter = {
  category: 'category',
  info: 'info',
  store_ids: 'store_ids',
  made_in_ids: 'made_in_ids',
  designer_codes: 'designer_codes',
  merchandiser_codes: 'merchandiser_codes',
  collection_codes: 'collection_codes',
  category_ids: 'category_ids',
  variant_prices: 'variant_prices',
  from_price: 'from_price',
  to_price: 'to_price'
}

const AllInventoryMappingField = {
  [AvdAllFilter.category]: 'Danh mục',
  [AvdAllFilter.store_ids]: 'Cửa hàng',
  [AvdAllFilter.made_in_ids]: 'Xuất xứ',
  [AvdAllFilter.designer_codes]: 'Thiết kế',
  [AvdAllFilter.merchandiser_codes]: 'Merchandiser',
  [AvdAllFilter.collection_codes]: 'Nhóm hàng',
  [AvdAllFilter.category_ids]: 'Danh mục',
  [AvdAllFilter.variant_prices]: 'Giá bán',
  [AvdAllFilter.from_price]: 'Từ',
  [AvdAllFilter.to_price]: 'Đến',
}

const InventoryColumnField = {
  variant_name: 'variant_name',
  sku: 'sku',
  category: 'category',
  variant_prices: 'variant_prices',
  total_stock: 'total_stock',
  on_hand: 'on_hand',
  available: 'available',
  committed: 'committed',
  on_hold: 'on_hold',
  defect: 'defect',
  in_coming: 'in_coming',
  transferring: 'transferring',
  on_way: 'on_way',
  shipping: 'shipping',
}

const InventoryExportField = {
  [InventoryColumnField.variant_name]: 'Sản phẩm',
  [InventoryColumnField.sku]: 'Mã sản phẩm',
  [InventoryColumnField.variant_prices]: 'Giá bán',
  [InventoryColumnField.total_stock]: 'Tổng tồn',
  [InventoryColumnField.on_hand]: 'Tồn trong kho',
  [InventoryColumnField.available]: 'Có thể bán',
  [InventoryColumnField.committed]: 'Đang giao dịch',
  [InventoryColumnField.on_hold]: 'Tạm giữ',
  [InventoryColumnField.defect]: 'Hàng lỗi',
  [InventoryColumnField.in_coming]: 'Chờ nhập',
  [InventoryColumnField.transferring]: 'Hàng chuyển đến',
  [InventoryColumnField.on_way]: 'Hàng chuyển đi',
  [InventoryColumnField.shipping]: 'Đang giao',
}

const HistoryInventoryMappingField = {
  [AvdHistoryInventoryFilter.transaction_date]: 'Thời gian',
  [AvdHistoryInventoryFilter.quantity_change]: 'Số lượng thay đổi',
  quantity: 'Số lượng thay đổi',
}

export {InventoryQueryField,
   InventoryMappingField,
   BasicInventoryFilter,
   AvdInventoryFilter,
   HistoryInventoryQueryField,
   AvdHistoryInventoryFilter,
   HistoryInventoryMappingField,
   AvdAllFilter,
   AllInventoryMappingField,
   InventoryExportField,
   InventoryColumnField};
