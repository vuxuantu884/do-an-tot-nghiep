const InventoryQueryField = {
  condition: "condition",
  store_ids: "store_ids",
  is_remain: "is_remain",
  created_date: "created_date",
  status: "status",
};

const AvdInventoryFilter = {
  info: "info",
  store_ids: "store_ids",
  made_in_ids: "made_in_ids",
  designer_codes: "designer_codes",
  merchandiser_codes: "merchandiser_codes",
  collections: "collections",
  category_ids: "category_ids",
  variant_prices: "variant_prices",
  from_price: "from_price",
  to_price: "to_price",
  sizes: "sizes",
  colors: "colors",
  variant_sku7: "variant_sku7",
  variant_sku3: "variant_sku3",
};

const BasicInventoryFilter = {
  condition: "condition",
  store_id: "store_id",
};

const InventoryMappingField = {
  [AvdInventoryFilter.store_ids]: "Cửa hàng",
  [AvdInventoryFilter.made_in_ids]: "Xuất xứ",
  [AvdInventoryFilter.designer_codes]: "Thiết kế",
  [AvdInventoryFilter.merchandiser_codes]: "Merchandiser",
  [AvdInventoryFilter.collections]: "Nhóm hàng",
  [AvdInventoryFilter.category_ids]: "Danh mục",
  [AvdInventoryFilter.variant_prices]: "Giá bán",
  [AvdInventoryFilter.from_price]: "Từ",
  [AvdInventoryFilter.to_price]: "Đến",
};

const HistoryInventoryQueryField = {
  condition: "condition",
  document_type: "document_type",
  store_ids: "store_ids",
  from_created_date: "from_created_date",
  to_created_date: "to_created_date",
  from_transaction_date: "from_transaction_date",
  to_transaction_date: "to_transaction_date",
  from_quantity: "from_quantity",
  to_quantity: "to_quantity",
};

const AvdHistoryInventoryFilter = {
  transaction_date: "transaction_date",
  quantity_change: "quantity_change",
  store_ids: "store_ids",
  condition: "condition",
  quantity: " quantity",
};

const AvdAllFilter = {
  category: "category",
  info: "info",
  store_ids: "store_ids",
  made_in_ids: "made_in_ids",
  designer_codes: "designer_codes",
  merchandiser_codes: "merchandiser_codes",
  collections: "collections",
  category_ids: "category_ids",
  variant_prices: "variant_prices",
  from_price: "from_price",
  to_price: "to_price",
  sizes: "sizes",
  tags: "tags",
  variant_sku3: "variant_sku3",
  variant_sku7: "variant_sku7",
  colors: "colors",
  sort_column: "sort_column",
  sort_type: "sort_type",
  remain: "remain",
};

const AllInventoryMappingField = {
  [AvdAllFilter.category]: "Danh mục",
  [AvdAllFilter.store_ids]: "Cửa hàng",
  [AvdAllFilter.info]: "Sản phẩm",
  [AvdAllFilter.made_in_ids]: "Xuất xứ",
  [AvdAllFilter.designer_codes]: "Thiết kế",
  [AvdAllFilter.merchandiser_codes]: "Merchandiser",
  [AvdAllFilter.collections]: "Nhóm hàng",
  [AvdAllFilter.category_ids]: "Danh mục",
  [AvdAllFilter.variant_prices]: "Giá bán",
  [AvdAllFilter.from_price]: "Từ",
  [AvdAllFilter.to_price]: "Đến",
  [AvdAllFilter.sizes]: "Kích thước",
  [AvdAllFilter.tags]: "Tags",
  [AvdAllFilter.variant_sku3]: "Mã 3",
  [AvdAllFilter.variant_sku7]: "Mã 7",
  [AvdAllFilter.colors]: "Màu sắc",
  [AvdAllFilter.sort_column]: "Sắp xếp",
  [AvdAllFilter.remain]: "Trạng thái tồn",
};

const InventoryRemainFields = {
  total_stock: "total_stock",
  available: "available",
  on_hand: "on_hand",
};

const InventoryRemainFieldsMapping = {
  [InventoryRemainFields.on_hand]: "Còn tồn trong kho",
  [InventoryRemainFields.available]: "Còn có thể bán",
  [InventoryRemainFields.total_stock]: "Còn tồn",
};

const InventoryColumnField = {
  variant_name: "variant_name",
  barcode: "barcode",
  sku: "sku",
  category: "category",
  variant_prices: "variant_prices",
  total_stock: "total_stock",
  on_hand: "on_hand",
  available: "available",
  committed: "committed",
  on_hold: "on_hold",
  defect: "defect",
  in_coming: "in_coming",
  transferring: "transferring",
  on_way: "on_way",
  shipping: "shipping",
};

const InventoryExportField = {
  [InventoryColumnField.variant_name]: "Sản phẩm",
  [InventoryColumnField.barcode]: "Mã vạch",
  [InventoryColumnField.sku]: "Mã sản phẩm",
  [InventoryColumnField.variant_prices]: "Giá bán",
  [InventoryColumnField.total_stock]: "Tổng tồn",
  [InventoryColumnField.on_hand]: "Tồn trong kho",
  [InventoryColumnField.available]: "Có thể bán",
  [InventoryColumnField.committed]: "Đang giao dịch",
  [InventoryColumnField.on_hold]: "Tạm giữ",
  [InventoryColumnField.defect]: "Hàng lỗi",
  [InventoryColumnField.in_coming]: "Chờ nhập",
  [InventoryColumnField.transferring]: "Hàng chuyển đến",
  [InventoryColumnField.on_way]: "Hàng chuyển đi",
  [InventoryColumnField.shipping]: "Đang giao",
};

const InventorySortType = {
  asc: "asc",
  desc: "desc",
};

const InventorySortTypeMapping = {
  [InventorySortType.asc]: "Sắp xếp tăng dần",
  [InventorySortType.desc]: "Sắp xếp giảm dần",
};

const HistoryInventoryMappingField = {
  [AvdHistoryInventoryFilter.transaction_date]: "Thời gian",
  [AvdHistoryInventoryFilter.quantity_change]: "Số lượng thay đổi",
  [AvdHistoryInventoryFilter.store_ids]: "Cửa hàng",
  [AvdHistoryInventoryFilter.condition]: "Sản phẩm",
  [AvdHistoryInventoryFilter.quantity]: "Số lượng thay đổi",
};

const TransferColumnField = {
  code: "code",
  from_store_name: "from_store_name",
  to_store_name: "to_store_name",
  status: "status",
  total_variant: "total_variant",
  total_quantity: "total_quantity",
  total_amount: "total_amount",
  transfer_date: "transfer_date",
  receive_date: "receive_date",
  receive_by: "receive_by",
  note: "note",
  created_date: "created_date",
  created_name: "created_name",
};

const TransferExportField = {
  [TransferColumnField.code]: "Mã phiếu chuyển",
  [TransferColumnField.from_store_name]: "Kho gửi",
  [TransferColumnField.to_store_name]: "Kho nhận",
  [TransferColumnField.status]: "Trạng thái",
  [TransferColumnField.total_variant]: "Số sản phẩm",
  [TransferColumnField.total_quantity]: "Số lượng",
  [TransferColumnField.total_amount]: "Thành tiền",
  [TransferColumnField.transfer_date]: "Ngày Chuyển",
  [TransferColumnField.receive_date]: "Ngày nhận",
  [TransferColumnField.receive_by]: "Người nhận",
  [TransferColumnField.note]: "Ghi chú",
  [TransferColumnField.created_name]: "Người tạo",
  [TransferColumnField.created_date]: "Ngày tạo",
};

const TransferLineItemField = {
  code: "code",
  from_store: "from_store",
  to_store: "to_store",
  status: "status",
  sku: "sku",
  variant_name: "variant_name",
  barcode: "barcode",
  transfer_quantity: "transfer_quantity",
  real_quantity: "real_quantity",
  total_amount: "total_amount",
  price: "price",
  created_date: "created_date",
  created_name: "created_name",
  transfer_date: "transfer_date",
  receive_date: "receive_date",
  updated_name: "updated_name",
  store: "store",
  note: "note",
};

const TransferExportLineItemField = {
  [TransferLineItemField.code]: "Mã phiếu chuyển",
  [TransferLineItemField.from_store]: "Kho gửi",
  [TransferLineItemField.to_store]: "Kho nhận",
  [TransferLineItemField.status]: "Trạng thái",
  [TransferLineItemField.sku]: "Mã sản phẩm",
  [TransferLineItemField.variant_name]: "Tên sản phẩm",
  [TransferLineItemField.barcode]: "Mã vạch",
  [TransferLineItemField.price]: "Giá bán",
  [TransferLineItemField.transfer_quantity]: "Số lượng chuyển",
  [TransferLineItemField.total_amount]: "Thành tiền",
  [TransferLineItemField.real_quantity]: "SL thực nhận",
  [TransferLineItemField.created_date]: "Ngày tạo",
  [TransferLineItemField.created_name]: "Người tạo",
  [TransferLineItemField.transfer_date]: "Ngày xuất kho",
  [TransferLineItemField.receive_date]: "Ngày nhận",
  [TransferLineItemField.updated_name]: "Người nhận",
  [TransferLineItemField.note]: "Ghi chú",
};

export {
  InventoryQueryField,
  InventoryMappingField,
  BasicInventoryFilter,
  AvdInventoryFilter,
  HistoryInventoryQueryField,
  AvdHistoryInventoryFilter,
  HistoryInventoryMappingField,
  AvdAllFilter,
  AllInventoryMappingField,
  InventoryExportField,
  TransferExportField,
  TransferColumnField,
  TransferLineItemField,
  TransferExportLineItemField,
  InventoryColumnField,
  InventorySortType,
  InventorySortTypeMapping,
  InventoryRemainFields,
  InventoryRemainFieldsMapping,
};
