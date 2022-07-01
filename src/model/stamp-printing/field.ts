const TransferColumnFieldStampPrinting = {
  sku: 'sku',
  retail_price: 'retail_price',
  quantity_print: 'quantity_print',
  created_date: 'created_date',
  created_by: 'created_by',
  supplier: 'supplier',
  note: 'note',
}

const TransferExportFieldStampPrinting = {
  [TransferColumnFieldStampPrinting.sku]: 'Sản phẩm',
  [TransferColumnFieldStampPrinting.retail_price]: 'Giá bán',
  [TransferColumnFieldStampPrinting.quantity_print]: 'Số lượng tem',
  [TransferColumnFieldStampPrinting.created_date]: 'Thơi gian in',
  [TransferColumnFieldStampPrinting.created_by]: 'Người thao tác',
  [TransferColumnFieldStampPrinting.supplier]: 'Đơn đặt hàng',
  [TransferColumnFieldStampPrinting.note]: 'Ghi chú',
}


export {
  TransferExportFieldStampPrinting,
  TransferColumnFieldStampPrinting
};
