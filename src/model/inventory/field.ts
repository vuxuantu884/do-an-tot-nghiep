const InventoryQueryField = {
  condition: 'condition',
  store_id: 'store_id',
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
}

const AvdInventoryFilter = {
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
}

const BasicInventoryFilter = {
  condition: 'condition',
  store_id: 'store_id',
}

const InventoryMappingField = {
  [BasicInventoryFilter.condition]: 'Từ khóa',
  [BasicInventoryFilter.store_id]: 'Cửa hàng',
  [AvdInventoryFilter.created_date]: 'Ngày khởi tạo',
  [AvdInventoryFilter.transaction_date]: 'Cập nhật cuối',
  [AvdInventoryFilter.total_stock]: 'Tổng tồn',
  [AvdInventoryFilter.on_hand]: 'Tồn trong kho',
  [AvdInventoryFilter.committed]: 'Đang giao dịch',
  [AvdInventoryFilter.available]: 'Có thể bán',
  [AvdInventoryFilter.on_hold]: 'Hàng tạm giữ',
  [AvdInventoryFilter.defect]: 'Hàng lỗi',
  [AvdInventoryFilter.incoming]: 'Chờ nhập',
  [AvdInventoryFilter.transferring]: 'Hàng đang chuyển đi',
  [AvdInventoryFilter.on_way]: 'Hàng đang giao ',
  [AvdInventoryFilter.shipping]: 'Hàng đang giao',
  [AvdInventoryFilter.mac]: 'Giá vốn',
  [AvdInventoryFilter.import_price]: 'Giá nhập',
  [AvdInventoryFilter.retail_price]: 'Giá bán',
}

export {InventoryQueryField, InventoryMappingField, BasicInventoryFilter, AvdInventoryFilter};