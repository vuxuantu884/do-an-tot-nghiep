const InventoryQueryField = {
  condition: 'condition', 
  store_ids: 'store_ids',
  is_remain: 'is_remain',
  created_date: 'created_date',
  transaction_date: 'transaction_date',
  total_stock: 'total_stock',
  on_hand: 'on_hand',
  committed: 'committed',
  available: 'available',
  on_hold: 'on_hold',
  defect: 'defect',
  incoming: 'incoming',
  transferring: 'transferring',
  on_way: 'on_way',
  shipping: 'shipping',
  import_price: 'import_price',
  mac: 'mac',
  retail_price: 'retail_price',
  status: 'status'
}

const AvdInventoryFilter = {
  transaction_date: 'transaction_date',
  total_stock: 'total_stock',
  on_hand: 'on_hand',
  committed: 'committed',
  available: 'available',
  on_hold: 'on_hold',
  defect: 'defect',
  incoming: 'incoming',
  transferring: 'transferring',
  on_way: 'on_way',
  shipping: 'shipping',
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
  [AvdInventoryFilter.transaction_date]: 'Cập nhật cuối',
  [AvdInventoryFilter.total_stock]: 'Tổng tồn',
  [AvdInventoryFilter.on_hand]: 'Tồn trong kho',
  [AvdInventoryFilter.committed]: 'Đang giao dịch',
  [AvdInventoryFilter.available]: 'Có thể bán',
  [AvdInventoryFilter.on_hold]: 'Hàng tạm giữ',
  [AvdInventoryFilter.defect]: 'Hàng lỗi',
  [AvdInventoryFilter.incoming]: 'Chờ nhập',
  [AvdInventoryFilter.transferring]: 'Đang chuyển đến',
  [AvdInventoryFilter.on_way]: 'Đang chuyển đi ',
  [AvdInventoryFilter.shipping]: 'Hàng đang giao',
  // [AvdInventoryFilter.mac]: 'Giá vốn',
  // [AvdInventoryFilter.import_price]: 'Giá nhập',
  // [AvdInventoryFilter.retail_price]: 'Giá bán',
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
  //created_date: 'created_date',
  transaction_date: 'transaction_date',
  quantity_change: 'quantity_change', 
}

const AvdAllFilter = {
  category: 'category',
  total: 'total',
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

const AllInventoryMappingField = {
  [AvdAllFilter.category]: 'Danh mục',
  [AvdAllFilter.total]: 'Tổng tồn',
  [AvdAllFilter.on_hand]: 'Tồn trong kho',
  [AvdAllFilter.available]: 'Có thể bán',
  [AvdAllFilter.committed]: 'Đang giao địch',
  [AvdAllFilter.on_hold]: 'Hàng tạm giữ',
  [AvdAllFilter.defect]: 'Hàng lỗi',
  [AvdAllFilter.in_coming]: 'Chờ nhập',
  [AvdAllFilter.transferring]: 'Hàng đang chuyển đến',
  [AvdAllFilter.on_way]: 'Hàng đang chuyển đi',
  [AvdAllFilter.shipping]: 'Hàng đang giao',
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