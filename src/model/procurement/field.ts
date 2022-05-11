const ProcurementField = {
    supplier_id: 'supplier_id',
    store_id: 'store_id',
    note: 'note',
    supplier_phone: 'supplier_phone',
    supplier: 'supplier',
    file: 'file',
    po_code: 'po_code'
}

const ProcurementLineItemField = {
    code: 'code',
    reference: 'reference',
    store_id: 'store_id',
    expect_receipt_date: 'expect_receipt_date',
    procurement_items: 'procurement_items',
    purchase_order_code: 'purchase_order_code',
    status: 'status',
    note: 'note',
    purchase_order_reference: 'purchase_order_reference',
    supplier: 'supplier',
    store: 'store',
    product_code: 'product_code',
    sku: 'sku',
    variant: 'variant',
    barcode: 'barcode',
    real_quantity: 'real_quantity',
    created_by: 'create_by',
    created_name: 'created_name',
    created_date: 'created_date',
    actived_date: 'actived_date',
    actived_by: 'actived_by',
    activated_by: 'activated_by',
    stock_in_date: 'stock_in_date',
    stock_in_by: 'stock_in_by',
    is_cancelled: 'is_cancelled'
}

const ProcurementExportLineItemField = {
    [ProcurementLineItemField.code]: 'Mã phiếu nhập kho',
    [ProcurementLineItemField.purchase_order_code]: 'Mã đơn đặt hàng',
    [ProcurementLineItemField.purchase_order_reference]: 'Mã tham chiếu',
    [ProcurementLineItemField.status]: 'Trạng thái',
    [ProcurementLineItemField.supplier]: 'Nhà cung cấp',
    [ProcurementLineItemField.store]: 'Kho hàng',
    [ProcurementLineItemField.product_code]: 'Mã sản phẩm cha',
    [ProcurementLineItemField.sku]: 'Mã sản phẩm',
    [ProcurementLineItemField.variant]: 'Sản phẩm',
    [ProcurementLineItemField.barcode]: 'Mã vạch',
    [ProcurementLineItemField.real_quantity]: 'Số lượng nhập',
    [ProcurementLineItemField.created_date]: 'Ngày tạo',
    [ProcurementLineItemField.created_name]: 'Người tạo'
}

export { ProcurementField, ProcurementExportLineItemField }
