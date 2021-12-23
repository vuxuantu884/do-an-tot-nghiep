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
  made_in_id: 'made_in_id',
  designer_code: 'designer_code',
  merchandiser_code: 'merchandiser_code',
  collection_code: 'collection_code',
  category_code: 'category_code',
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
  [AvdInventoryFilter.made_in_id]: 'Xuất xứ',
  [AvdInventoryFilter.designer_code]: 'Thiết kế',
  [AvdInventoryFilter.merchandiser_code]: 'Merchandiser',
  [AvdInventoryFilter.collection_code]: 'Nhóm hàng',
  [AvdInventoryFilter.category_code]: 'Danh mục',
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
  made_in_id: 'made_in_id',
  designer_code: 'designer_code',
  merchandiser_code: 'merchandiser_code',
  collection_code: 'collection_code',
  category_code: 'category_code',
  variant_prices: 'variant_prices',
  from_price: 'from_price',
  to_price: 'to_price'
}

const AllInventoryMappingField = {
  [AvdAllFilter.category]: 'Danh mục',
  [AvdAllFilter.store_ids]: 'Cửa hàng',
  [AvdAllFilter.made_in_id]: 'Xuất xứ',
  [AvdAllFilter.designer_code]: 'Thiết kế',
  [AvdAllFilter.merchandiser_code]: 'Merchandiser',
  [AvdAllFilter.collection_code]: 'Nhóm hàng',
  [AvdAllFilter.category_code]: 'Danh mục',
  [AvdAllFilter.variant_prices]: 'Giá bán',
  [AvdAllFilter.from_price]: 'Từ',
  [AvdAllFilter.to_price]: 'Đến',
}

const HistoryInventoryMappingField = {
  [AvdHistoryInventoryFilter.transaction_date]: 'Thời gian',
  [AvdHistoryInventoryFilter.quantity_change]: 'Số lượng thay đổi',
}

export {InventoryQueryField,
   InventoryMappingField,
   BasicInventoryFilter, 
   AvdInventoryFilter, 
   HistoryInventoryQueryField, 
   AvdHistoryInventoryFilter, 
   HistoryInventoryMappingField,
   AvdAllFilter,
   AllInventoryMappingField};